import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"

const SHOULD_RETRY = false

interface QueryClientTestWrapperProps {
  client: QueryClient
  children: ReactNode
}

function QueryClientTestWrapper({
  client,
  children,
}: QueryClientTestWrapperProps) {
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

export function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: SHOULD_RETRY },
      mutations: { retry: SHOULD_RETRY },
    },
  })

  return {
    queryClient,
    ...render(ui, {
      wrapper: ({ children }) => (
        <QueryClientTestWrapper client={queryClient}>
          {children}
        </QueryClientTestWrapper>
      ),
    }),
  }
}
