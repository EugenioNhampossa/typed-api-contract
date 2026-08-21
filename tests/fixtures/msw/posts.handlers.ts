import { http, HttpResponse } from "msw"

export const POSTS_API_BASE_URL = "http://localhost"

export const postsHandlers = [
  http.get(`${POSTS_API_BASE_URL}/posts/:id`, ({ params }) => {
    return HttpResponse.json({
      id: String(params.id),
      title: "Hello",
      body: "World",
    })
  }),
  http.post(`${POSTS_API_BASE_URL}/posts`, async ({ request }) => {
    const body = await request.json()
    if (!isCreatePostBody(body)) {
      return HttpResponse.json({ message: "invalid body" }, { status: 400 })
    }

    return HttpResponse.json(
      { id: "1", title: body.title, body: body.body },
      { status: 201 },
    )
  }),
]

function isCreatePostBody(
  value: unknown,
): value is { title: string; body: string } {
  if (typeof value !== "object" || value === null) {
    return false
  }

  if (!("title" in value) || !("body" in value)) {
    return false
  }

  return typeof value.title === "string" && typeof value.body === "string"
}
