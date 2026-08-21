import { fireEvent, screen, waitFor } from "@testing-library/react"
import { useQueryClient } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks, type InferQueryHooks } from "typed-api-contract/react-query"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"
import { renderWithQueryClient } from "../../setup/render-with-query-client"

const POSTS_QUERY_KEY = ["posts"] as const
const CREATE_BUTTON_LABEL = "Create"

type ExampleHooks = InferQueryHooks<typeof contract>

interface ExampleHooksProps {
  hooks: ExampleHooks
}

function PostTitle({ hooks }: ExampleHooksProps) {
  const query = hooks.posts.getById({ params: { id: "1" } })

  if (query.data?.status === 200) {
    return <div>{query.data.body.title}</div>
  }

  if (query.data?.status === 404) {
    return <div>{query.data.body.message}</div>
  }

  if (query.error) {
    return <div>{query.error.name}</div>
  }

  return <div>loading</div>
}

function DisabledPostTitle({ hooks }: ExampleHooksProps) {
  const query = hooks.posts.getById(
    { params: { id: "1" } },
    { enabled: false },
  )

  return (
    <div>
      {query.fetchStatus}:{String(query.isFetching)}
    </div>
  )
}

function CreatePostButton({ hooks }: ExampleHooksProps) {
  const queryClient = useQueryClient()
  const create = hooks.posts.create({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY })
    },
  })

  function handleClick() {
    create.mutate({ body: { title: "New", body: "Post" } })
  }

  if (create.isSuccess && create.data.status === 201) {
    return <div>{create.data.body.title}</div>
  }

  if (create.isSuccess && create.data.status === 400) {
    return <div>{create.data.body.message}</div>
  }

  if (create.isError) {
    return <div>{create.error.name}</div>
  }

  return (
    <button type="button" onClick={handleClick}>
      {CREATE_BUTTON_LABEL}
    </button>
  )
}

describe("initQueryHooks", () => {
  const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })
  const hooks = initQueryHooks(contract, client)

  it("fetches and narrows a 200 response", async () => {
    renderWithQueryClient(<PostTitle hooks={hooks} />)

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeTruthy()
    })
  })

  it("does not fetch when enabled is false", async () => {
    renderWithQueryClient(<DisabledPostTitle hooks={hooks} />)

    expect(screen.getByText("idle:false")).toBeTruthy()
    expect(screen.queryByText("Hello")).toBeNull()
  })

  it("exposes a declared 404 on query data instead of error", async () => {
    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ message: "not found" }, { status: 404 }),
      ),
    )

    renderWithQueryClient(<PostTitle hooks={hooks} />)

    await waitFor(() => {
      expect(screen.getByText("not found")).toBeTruthy()
    })
  })

  it("puts an undeclared status on query.error", async () => {
    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ message: "error" }, { status: 500 }),
      ),
    )

    renderWithQueryClient(<PostTitle hooks={hooks} />)

    await waitFor(() => {
      expect(screen.getByText("UnexpectedStatusError")).toBeTruthy()
    })
  })

  it("mutates and invalidates the posts query prefix", async () => {
    const { queryClient } = renderWithQueryClient(
      <CreatePostButton hooks={hooks} />,
    )
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries")

    fireEvent.click(screen.getByRole("button", { name: CREATE_BUTTON_LABEL }))

    await waitFor(() => {
      expect(screen.getByText("New")).toBeTruthy()
    })

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: POSTS_QUERY_KEY,
    })
  })

  it("treats a declared 400 mutation response as success data", async () => {
    mswServer.use(
      http.post(`${POSTS_API_BASE_URL}/posts`, () =>
        HttpResponse.json({ message: "invalid body" }, { status: 400 }),
      ),
    )

    renderWithQueryClient(<CreatePostButton hooks={hooks} />)
    fireEvent.click(screen.getByRole("button", { name: CREATE_BUTTON_LABEL }))

    await waitFor(() => {
      expect(screen.getByText("invalid body")).toBeTruthy()
    })
  })
})
