import type { DefaultTheme } from "vitepress"

export const pt = {
  label: "Português",
  lang: "pt-PT",
  title: "typed-api-contract",
  description:
    "Contratos REST tipados, um cliente fetch e hooks do TanStack Query.",
  themeConfig: {
    nav: [
      { text: "Guia", link: "/pt/" },
      { text: "Referência", link: "/pt/reference/contract" },
    ],
    sidebar: [
      {
        text: "Guia",
        items: [
          { text: "Visão geral", link: "/pt/" },
          { text: "Instalação", link: "/pt/install" },
          { text: "Primeiros passos", link: "/pt/quickstart" },
          { text: "Contrato", link: "/pt/contract" },
          { text: "Cliente", link: "/pt/client" },
          { text: "Respostas e erros", link: "/pt/responses" },
          { text: "React Query", link: "/pt/react-query" },
          { text: "Paginação por cursor", link: "/pt/pagination" },
          { text: "Interceptores", link: "/pt/interceptors" },
          { text: "Renovação da autenticação", link: "/pt/auth" },
          { text: "Carregamento de ficheiros", link: "/pt/multipart" },
        ],
      },
      {
        text: "Referência",
        items: [
          { text: "Contrato", link: "/pt/reference/contract" },
          { text: "Cliente", link: "/pt/reference/client" },
          { text: "React Query", link: "/pt/reference/react-query" },
        ],
      },
    ],
    outline: { label: "Nesta página", level: [2, 3] },
    docFooter: { prev: "Anterior", next: "Seguinte" },
    darkModeSwitchLabel: "Aparência",
    sidebarMenuLabel: "Menu",
    returnToTopLabel: "Voltar ao topo",
    langMenuLabel: "Mudar idioma",
    skipToContentLabel: "Saltar para o conteúdo",
  } satisfies DefaultTheme.Config,
}
