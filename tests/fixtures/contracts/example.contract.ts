import { z } from "zod"
import { HTTP_METHOD, initContract } from "typed-api-contract"

const contractInit = initContract()

const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
})

export const contract = contractInit.router({
  posts: {
    list: {
      method: HTTP_METHOD.GET,
      path: "/posts",
      query: z.object({ page: z.coerce.number().optional() }),
      responses: { 200: z.array(PostSchema) },
    },
    getById: {
      method: HTTP_METHOD.GET,
      path: "/posts/:id",
      pathParams: z.object({ id: z.string() }),
      responses: {
        200: PostSchema,
        404: z.object({ message: z.string() }),
      },
    },
    create: {
      method: HTTP_METHOD.POST,
      path: "/posts",
      body: z.object({ title: z.string(), body: z.string() }),
      responses: {
        201: PostSchema,
        400: z.object({ message: z.string() }),
      },
    },
    search: {
      method: HTTP_METHOD.GET,
      path: "/posts/search",
      query: z.object({ q: z.string() }),
      responses: { 200: z.array(PostSchema) },
    },
  },
})
