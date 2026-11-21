// Lab families shown on /pricing/. Prices and stock live in Client Panel only.
export const families = [
  {
    name: "Virtual Labs",
    slug: "virtual-labs",
    use: "Learning and short experiments",
    placement: "Nested hypervisor",
    network: "IPv6 first; some plans add a private IPv4",
    unit: "LAB Coin",
  },
  {
    name: "Virtual Dedicated Labs",
    slug: "virtual-dedicated-labs",
    use: "Steady VM workloads",
    placement: "Directly on a bare-metal hypervisor",
    network: "Public IPv6; NAT IPv4 on request",
    unit: "Rupiah (IDR)",
  },
  {
    name: "ElasticLabs",
    slug: "elasticlabs",
    use: "Projects that need a public IPv4 or room to grow",
    placement: "Directly on a bare-metal hypervisor",
    network: "Public IPv4",
    unit: "Rupiah (IDR)",
  },
  {
    name: "ElasticLabs NAT",
    slug: "elasticlabs-nat",
    use: "Lower-cost labs reached through forwarded ports",
    placement: "Directly on a bare-metal hypervisor",
    network: "Private IPv4 behind NAT; port forwards by ticket",
    unit: "Rupiah (IDR)",
  },
  {
    name: "CloudLabs",
    slug: "cloudlabs",
    use: "Projects that need higher bandwidth",
    placement: "Listed on each plan",
    network: "Public IPv4 and IPv6",
    unit: "Rupiah (IDR)",
    paused: true,
  },
];
