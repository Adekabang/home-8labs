// Landing-page OG cards. Keyed by slug → generated at /og/<slug>.png by
// src/pages/og/[...slug].ts and referenced from src/layouts/Layout.astro.
export const sitePages: Record<
  string,
  { path: string; data: { title: string; description: string } }
> = {
  home: {
    path: "/",
    data: {
      title: "8Labs — Virtual & Cloud Labs",
      description:
        "Virtual and cloud lab environments for developers, students, and homelabbers. Full root, IPv6, snapshots — no vendor lock-in.",
    },
  },
  services: {
    path: "/services",
    data: {
      title: "Services — 8Labs",
      description:
        "Custom development, open-source setup, security & monitoring, and managed maintenance. Work directly with the engineer.",
    },
  },
  pricing: {
    path: "/pricing",
    data: {
      title: "Pricing — 8Labs",
      description:
        "Product and pricing guide: which families use LAB Coin usage and which show IDR plans.",
    },
  },
  contact: {
    path: "/contact",
    data: {
      title: "Contact — 8Labs",
      description: "Reach 8Labs on Telegram or email — direct line, no sales layer.",
    },
  },
  cloud: {
    path: "/cloud",
    data: {
      title: "Cloud Panel — 8Labs",
      description: "Launch and manage your cloud lab environments.",
    },
  },
  client: {
    path: "/client",
    data: {
      title: "Client Panel — 8Labs",
      description: "Billing, products, and account management.",
    },
  },
};
