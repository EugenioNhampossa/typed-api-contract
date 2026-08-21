import { z } from "zod"
import { HTTP_METHOD, initContract } from "typed-api-contract"

const contractInit = initContract()

const MemberSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const nestedContract = contractInit.router({
  admin: {
    orgs: {
      teams: {
        getById: {
          method: HTTP_METHOD.GET,
          path: "/admin/orgs/:orgId/teams/:teamId",
          pathParams: z.object({
            orgId: z.string(),
            teamId: z.string(),
          }),
          responses: {
            200: MemberSchema,
            404: z.object({ message: z.string() }),
          },
        },
      },
    },
  },
})
