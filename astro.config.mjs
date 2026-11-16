import { defineConfig } from "astro/config";
import nimbus, {
  defineConfig as defineNimbusConfig,
} from "@cloudflare/nimbus-docs";
import tailwindcss from "@tailwindcss/vite";
import tailwindLegacy from "tailwindcss-v3";
import icon from "astro-icon";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";
import legacyConfig from "./tailwind.config.cjs";

const config = defineNimbusConfig({
  site: "https://8labs.id",
  title: "8Labs Docs",
  description: "Customer help and practical infrastructure guides from 8Labs.",
  locale: "en",
  github: "https://github.com/Adekabang/home-8labs",
  editPattern: "https://github.com/Adekabang/home-8labs/edit/main/{path}",
  socialImage: "/opengraph.jpg",
  socialImageAlt: "8Labs",
  sidebar: {
    scope: "section",
    defaultCollapsed: true,
    items: [
      { label: "Customer help", autogenerate: { collection: "customer" } },
      {
        label: "Bantuan pelanggan",
        autogenerate: { collection: "customerId" },
      },
      { label: "Guides", autogenerate: { collection: "guides" } },
      { label: "Guides (English)", autogenerate: { collection: "guidesId" } },
      { label: "Blog", autogenerate: { collection: "blog" } },
      { label: "Blog (English)", autogenerate: { collection: "blogId" } },
    ],
  },
  agents: { mcp: false },
  head: [
    {
      tag: "script",
      attrs: {
        src: "https://beacon.8labs.id/script.js",
        "data-website-id": "2f166e07-ce01-415b-9b24-5e2d9290e058",
        defer: "",
      },
    },
  ],
});

// Only marketing's existing global.css is compiled by Tailwind 3. Nimbus's
// separate stylesheet uses Tailwind 4; neither stylesheet is globally injected.
const marketingStyles = {
  name: "8labs-marketing-tailwind",
  enforce: "pre",
  async transform(source, id) {
    if (!id.split("?")[0].endsWith("/src/styles/global.css")) return;
    const { default: postcss } = await import("postcss");
    const result = await postcss([tailwindLegacy(legacyConfig)]).process(
      source,
      { from: id.split("?")[0] },
    );
    return { code: result.css, map: null };
  },
};

export default defineConfig({
  site: "https://8labs.id/",
  output: "static",
  trailingSlash: "always",
  vite: { plugins: [marketingStyles, tailwindcss()] },
  integrations: [
    nimbus(config, {
      markdown: {
        hastPlugins: [tableScroll()],
        features: { headingAttributes: false },
      },
    }),
    icon(),
  ],
});
