import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";

// https://astro.build/config
export default defineConfig({
  site: "https://8labs.id/",
  integrations: [
    starlight({
      title: "8Labs Docs",
      favicon: "/favicon.ico",
      disable404Route: true,
      customCss: [
        "@fontsource-variable/inter/index.css",
        "@fontsource-variable/bricolage-grotesque",
        "./src/styles/starlight.css",
      ],
      logo: undefined,
      components: {
        Header: "./src/components/starlight/Header.astro",
        MobileMenuFooter: "./src/components/starlight/MobileMenuFooter.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Adekabang",
        },
        {
          icon: "x.com",
          label: "Twitter",
          href: "https://twitter.com/Mraskaa",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/Adekabang/home-8labs/edit/main/",
      },
      lastUpdated: true,
      head: [
        {
          tag: "script",
          attrs: {
            src: "https://beacon.8labs.id/script.js",
            "data-website-id": "2f166e07-ce01-415b-9b24-5e2d9290e058",
            defer: true,
          },
        },
      ],
      plugins: [
        starlightBlog({
          title: "Blog",
          authors: {
            adekabang: {
              name: "Adekabang",
              title: "Tukang Ngoprek",
              url: "https://github.com/Adekabang",
              picture: "https://github.com/Adekabang.png",
            },
          },
        }),
      ],
      sidebar: [
        {
          label: "Documentation",
          items: [
            { label: "Overview", slug: "docs" },
            {
              label: "Getting Started",
              items: [
                "docs/getting-started/intro",
                "docs/getting-started/accessing-virtual-labs",
                "docs/getting-started/install-qemu-guest-agent",
                "docs/getting-started/install-docker-ipv6",
                "docs/getting-started/ipv6-github-dockerhub",
                "docs/getting-started/hermes-agent-ipv6",
                {
                  label: "Self-hosted Panel",
                  items: ["docs/getting-started/panel/aapanel-installation"],
                },
              ],
            },
            { label: "Billing & Plans", slug: "docs/billing-plans/overview" },
            { label: "FAQ", slug: "docs/faq/overview" },
            { label: "Troubleshooting", slug: "docs/troubleshooting/overview" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Overview", slug: "guides" },
            { label: "Proxmox", autogenerate: { directory: "guides/proxmox" } },
            { label: "VMware", autogenerate: { directory: "guides/vmware" } },
            { label: "XCP-ng", autogenerate: { directory: "guides/xcp-ng" } },
            {
              label: "Rocky Linux",
              autogenerate: { directory: "guides/rocky-linux" },
            },
            { label: "Caddy", autogenerate: { directory: "guides/caddy" } },
            {
              label: "WireGuard",
              autogenerate: { directory: "guides/wireguard" },
            },
            { label: "Git", autogenerate: { directory: "guides/git" } },
            { label: "Coolify", autogenerate: { directory: "guides/coolify" } },
            {
              label: "OpenCode",
              items: [
                "guides/opencode",
                "guides/opencode/overview",
                "guides/opencode/installation",
                "guides/opencode/quick-start",
                "guides/opencode/configuration",
                "guides/opencode/mcp-guide",
                "guides/opencode/project-rules",
                "guides/opencode/skills-integration",
                "guides/opencode/planner-strategy",
                "guides/opencode/image-to-code",
                "guides/opencode/rtk-guide",
                "guides/opencode/skills-catalog",
                "guides/opencode/launch-and-model-reference",
                "guides/opencode/impeccable-guide",
                "guides/opencode/troubleshooting",
                { label: "ECC", items: ["guides/opencode/ecc"] },
                { label: "Caveman", items: ["guides/opencode/caveman"] },
              ],
            },
          ],
        },
      ],
    }),
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap(),
    icon(),
  ],
});
