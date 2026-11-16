import type {
  SidebarItem,
  SidebarLinkItem,
} from "@cloudflare/nimbus-docs/types";

export function customerSidebar(
  tree: SidebarItem[],
  indonesian: boolean,
): SidebarItem[] {
  const links = new Map<string, SidebarLinkItem>();
  function collect(items: SidebarItem[]) {
    for (const item of items) {
      if (item.type === "link")
        links.set(item.href.replace(/^\/id/, "").replace(/\/$/, ""), item);
      if (item.type === "group") {
        if (item.indexHref)
          links.set(item.indexHref.replace(/^\/id/, "").replace(/\/$/, ""), {
            type: "link",
            label: item._indexLabel ?? item.label,
            href: item.indexHref,
            order: item.order,
            isCurrent: item.indexIsCurrent,
          });
        collect(item.children);
      }
    }
  }
  collect(tree);
  const groups: Array<{ en: string; id: string; paths: string[] }> = [
    {
      en: "First access",
      id: "Akses pertama",
      paths: [
        "getting-started/intro",
        "getting-started/accessing-virtual-labs",
        "getting-started/ssh",
        "getting-started/rdp",
      ],
    },
    {
      en: "Use your server",
      id: "Kelola server",
      paths: [
        "servers/overview",
        "servers/console",
        "servers/power",
        "servers/folders",
        "servers/network",
        "servers/firewall",
        "servers/backups",
        "servers/snapshots",
        "servers/telemetry",
        "servers/settings",
      ],
    },
    {
      en: "Teams and access",
      id: "Tim dan akses",
      paths: [
        "teams/overview",
        "teams/organizations",
        "teams/projects",
        "teams/subusers",
        "teams/invitations",
      ],
    },
    {
      en: "Account",
      id: "Akun",
      paths: ["account/security", "account/api-keys", "account/notifications"],
    },
  ];
  const result: SidebarItem[] = [];
  const home = links.get("/docs");
  if (home)
    result.push({
      ...home,
      label: indonesian ? "Mulai di sini" : "Start here",
    });
  const pick = (paths: string[]) =>
    paths.flatMap((path) => {
      const link = links.get(`/docs/${path}`);
      return link ? [link] : [];
    });
  groups.forEach((group, order) =>
    result.push({
      type: "group",
      label: indonesian ? group.id : group.en,
      order,
      collapsed: true,
      children: pick(group.paths),
    }),
  );
  result.push(
    ...pick([
      "billing-plans/overview",
      "troubleshooting/overview",
      "faq/overview",
      "help/contact",
    ]),
  );
  result.push({
    type: "group",
    label: indonesian
      ? "Tutorial perangkat lunak tamu (bahasa Inggris)"
      : "Guest software tutorials (English)",
    order: 5,
    collapsed: true,
    children: pick([
      "getting-started/install-qemu-guest-agent",
      "getting-started/install-docker-ipv6",
      "getting-started/ipv6-github-dockerhub",
      "getting-started/hermes-agent-ipv6",
      "getting-started/panel/aapanel-installation",
    ]),
  });
  return result;
}
