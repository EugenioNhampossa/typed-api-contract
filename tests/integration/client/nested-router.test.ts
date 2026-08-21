import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { initClient, UnexpectedStatusError } from "typed-api-contract/client"
import { nestedContract } from "../../fixtures/contracts/nested.contract"
import { mswServer } from "../../setup/msw-server"

const NESTED_API_BASE_URL = "http://localhost"

describe("nested router", () => {
  it("calls a three-level-deep client method", async () => {
    const client = initClient(nestedContract, { baseUrl: NESTED_API_BASE_URL })

    mswServer.use(
      http.get(
        `${NESTED_API_BASE_URL}/admin/orgs/:orgId/teams/:teamId`,
        ({ params }) =>
          HttpResponse.json({
            id: String(params.teamId),
            name: "Platform",
          }),
      ),
    )

    const res = await client.admin.orgs.teams.getById({
      params: { orgId: "org-1", teamId: "team-1" },
    })

    expect(res.status).toBe(200)
    if (res.status === 200) {
      expect(res.body.name).toBe("Platform")
    }
  })

  it("interpolates both nested path params into the request URL", async () => {
    let requestUrl = ""
    const client = initClient(nestedContract, { baseUrl: NESTED_API_BASE_URL })

    mswServer.use(
      http.get(
        `${NESTED_API_BASE_URL}/admin/orgs/:orgId/teams/:teamId`,
        ({ request }) => {
          requestUrl = request.url
          return HttpResponse.json({ id: "team-1", name: "Platform" })
        },
      ),
    )

    await client.admin.orgs.teams.getById({
      params: { orgId: "org 1", teamId: "team/1" },
    })

    expect(new URL(requestUrl).pathname).toBe(
      "/admin/orgs/org%201/teams/team%2F1",
    )
  })

  it("returns a declared nested 404", async () => {
    const client = initClient(nestedContract, { baseUrl: NESTED_API_BASE_URL })

    mswServer.use(
      http.get(`${NESTED_API_BASE_URL}/admin/orgs/:orgId/teams/:teamId`, () =>
        HttpResponse.json({ message: "team missing" }, { status: 404 }),
      ),
    )

    const res = await client.admin.orgs.teams.getById({
      params: { orgId: "org-1", teamId: "missing" },
    })

    expect(res.status).toBe(404)
    if (res.status === 404) {
      expect(res.body.message).toBe("team missing")
    }
  })

  it("throws UnexpectedStatusError for an undeclared nested status", async () => {
    const client = initClient(nestedContract, { baseUrl: NESTED_API_BASE_URL })

    mswServer.use(
      http.get(`${NESTED_API_BASE_URL}/admin/orgs/:orgId/teams/:teamId`, () =>
        HttpResponse.json({ message: "error" }, { status: 500 }),
      ),
    )

    await expect(
      client.admin.orgs.teams.getById({
        params: { orgId: "org-1", teamId: "team-1" },
      }),
    ).rejects.toBeInstanceOf(UnexpectedStatusError)
  })
})
