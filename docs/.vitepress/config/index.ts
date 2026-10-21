import { defineConfig } from "vitepress"
import { en } from "./en"
import { pt } from "./pt"

const base = process.env.DOCS_BASE ?? "/"

export default defineConfig({
  title: "typed-api-contract",
  description:
    "Typed REST contracts, a fetch client, and TanStack Query hooks.",
  base,
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/logo.png" }],
  ],
  themeConfig: {
    logo: "/logo.png",
    search: {
      provider: "local",
      options: {
        locales: {
          pt: {
            translations: {
              button: {
                buttonText: "Pesquisar",
                buttonAriaLabel: "Pesquisar",
              },
              modal: {
                displayDetails: "Mostrar lista detalhada",
                resetButtonTitle: "Repor a pesquisa",
                backButtonTitle: "Fechar a pesquisa",
                noResultsText: "Nenhum resultado",
                footer: {
                  selectText: "Seleccionar",
                  selectKeyAriaLabel: "Enter",
                  navigateText: "Navegar",
                  navigateUpKeyAriaLabel: "Seta para cima",
                  navigateDownKeyAriaLabel: "Seta para baixo",
                  closeText: "Fechar",
                  closeKeyAriaLabel: "Escape",
                },
              },
            },
          },
        },
      },
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/EugenioNhampossa/typed-api-contract",
      },
    ],
  },
  locales: {
    root: en,
    pt,
  },
})
