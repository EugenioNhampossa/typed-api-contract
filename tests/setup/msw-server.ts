import { setupServer } from "msw/node"
import { postsHandlers } from "../fixtures/msw/posts.handlers"

export const mswServer = setupServer(...postsHandlers)
