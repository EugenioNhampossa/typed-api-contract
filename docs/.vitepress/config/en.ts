import type { DefaultTheme } from "vitepress"

export const en = {
  label: "English",
  lang: "en",
  title: "typed-api-contract",
  description:
    "Typed REST contracts, a fetch client, and TanStack Query hooks.",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/" },
      { text: "Reference", link: "/reference/contract" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Overview", link: "/" },
          { text: "Install", link: "/install" },
          { text: "Quickstart", link: "/quickstart" },
          { text: "Contract", link: "/contract" },
          { text: "Structure", link: "/structure" },
          { text: "Client", link: "/client" },
          { text: "Responses and errors", link: "/responses" },
          { text: "React Query", link: "/react-query" },
          { text: "Cursor pagination", link: "/pagination" },
          { text: "Interceptors", link: "/interceptors" },
          { text: "Auth refresh", link: "/auth" },
          { text: "Multipart", link: "/multipart" },
        ],
      },
      {
        text: "Recipes",
        items: [
          { text: "Optimistic updates", link: "/recipes/optimistic-updates" },
          {
            text: "Update the cache from a mutation",
            link: "/recipes/update-from-mutation",
          },
          { text: "Server rendering", link: "/recipes/server-rendering" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Contract", link: "/reference/contract" },
          { text: "Client", link: "/reference/client" },
          { text: "React Query", link: "/reference/react-query" },
        ],
      },
    ],
    outline: { label: "On this page", level: [2, 3] },
    docFooter: { prev: "Previous", next: "Next" },
    darkModeSwitchLabel: "Appearance",
    sidebarMenuLabel: "Menu",
    returnToTopLabel: "Return to top",
    langMenuLabel: "Change language",
    skipToContentLabel: "Skip to content",
  } satisfies DefaultTheme.Config,
}
