// Coordinates are centers in a 320-unit canvas. Connections carry labels;
// they are not intermediate machines. States preserve the physical layout.
type Node = [x: number, y: number, label: string, detail?: string];
type Edge = [path: string, label: string, x: number, y: number];
type State = [
  control: string,
  edges: number[],
  nodes: number[],
  outcome: string,
  offline?: number[],
];
interface Scene {
  nodes: Node[];
  edges: Edge[];
  states: State[];
  groups?: [number, number, number, number, string][];
}
const fork = (
  source: string,
  left: string,
  right: string,
  labels: [string, string],
  states: State[],
): Scene => ({
  nodes: [
    [160, 37, source],
    [77, 155, left],
    [243, 155, right],
  ],
  edges: [
    ["M160 56 V76 H77 V134", labels[0], 77, 109],
    ["M160 56 V76 H243 V134", labels[1], 243, 109],
  ],
  states,
});
const journey = (
  a: string,
  b: string,
  c: string,
  ab: string,
  bc: string,
  states: State[],
): Scene => ({
  nodes: [
    [86, 36, a],
    [232, 98, b],
    [86, 160, c],
  ],
  edges: [
    ["M145 36 H232 V77", ab, 234, 27],
    ["M232 117 V160 H148", bc, 234, 181],
  ],
  states,
});
export const scenes = {
  replication: {
    groups: [
      [3, 10, 103, 181, "VPS-1"],
      [214, 10, 103, 181, "VPS-2"],
    ],
    nodes: [
      [55, 70, "Postgres", "primary"],
      [265, 70, "Postgres", "standby"],
      [55, 148, "MinIO", "uploads"],
      [265, 148, "MinIO", "uploads"],
    ],
    edges: [
      ["M101 70 H216", "WAL", 159, 59],
      ["M101 139 H216", "objects", 159, 130],
      ["M219 157 H104", "objects", 159, 177],
    ],
    states: [
      [
        "Write a row",
        [0],
        [0, 1],
        "VPS-1 accepts the write. WAL travels to the standby; no database stream returns.",
      ],
      [
        "Upload on VPS-1",
        [1],
        [2, 3],
        "The bucket rule copies the object from VPS-1 to VPS-2.",
      ],
      [
        "Upload on VPS-2",
        [2],
        [3, 2],
        "The reverse bucket rule copies the object back to VPS-1. Database roles do not change.",
      ],
    ],
  },
  failover: {
    nodes: [
      [160, 37, "LAN client", "gateway .1"],
      [76, 155, "Router A", ".2"],
      [244, 155, "Router B", ".3"],
    ],
    edges: [
      ["M160 56 V78 H76 V134", "VIP .1", 76, 110],
      ["M160 56 V78 H244 V134", "VIP .1", 244, 110],
    ],
    states: [
      [
        "Healthy",
        [0],
        [1],
        "Router A owns .1 and forwards client traffic. Router B is on standby.",
      ],
      [
        "Lose router A",
        [],
        [],
        "A is offline. Until B takes over, neither router forwards traffic for the gateway.",
        [1],
      ],
      [
        "Take over",
        [1],
        [2],
        "Router B now owns .1. Clients keep the same gateway; session continuity is separate.",
        [1],
      ],
    ],
  },
  cluster: {
    ...fork(
      "K3s server",
      "Worker A",
      "Worker B",
      ["schedule", "schedule"],
      [
        [
          "Healthy",
          [0, 1],
          [0, 1, 2],
          "One server schedules workloads on both workers. All three VMs share one Proxmox host.",
        ],
        [
          "Stop server",
          [],
          [1, 2],
          "Existing pods may continue on the workers. New pods cannot be scheduled.",
          [0],
        ],
      ],
    ),
    groups: [[4, 5, 312, 187, "Proxmox host"]],
  },
  origins: fork(
    "Cloudflare",
    "VPS-1 · Caddy",
    "VPS-2 · Caddy",
    ["HTTP", "HTTP"],
    [
      [
        "Visit VPS-1",
        [0],
        [0, 1],
        "Caddy on VPS-1 forwards the request to a local app replica.",
      ],
      [
        "Visit VPS-2",
        [1],
        [0, 2],
        "Caddy on VPS-2 serves the request. That does not make its database the primary.",
      ],
    ],
  ),
  ingress: fork(
    "NGINX ingress",
    "Demo Service",
    "Default backend",
    ["host matches", "no match"],
    [
      [
        "Demo hostname",
        [0],
        [0, 1],
        "nginx.demo.local matches the configured route. The Service sends traffic to the demo pod.",
      ],
      [
        "Unknown host",
        [1],
        [0, 2],
        "The same ingress IP receives the request, but no host rule selects the demo Service.",
      ],
    ],
  ),
  balance: {
    nodes: [
      [78, 39, "LAN client"],
      [241, 39, "MetalLB speaker"],
      [241, 155, "Cluster node"],
      [78, 155, "Backend pod"],
    ],
    edges: [
      ["M184 39 H137", "ARP reply", 160, 23],
      ["M78 58 V94 H241 V134", "service IP", 160, 83],
      ["M184 155 H137", "forward", 160, 181],
    ],
    states: [
      [
        "Resolve address",
        [0],
        [0, 1],
        "In this layer-2 setup the speaker answers address resolution for the external IP.",
      ],
      [
        "Send request",
        [1, 2],
        [0, 2, 3],
        "The client sends to the advertised node. Kubernetes forwards to a ready pod; MetalLB is not an HTTP proxy.",
      ],
    ],
  },
  storage: {
    nodes: [
      [74, 40, "Pod"],
      [243, 40, "PVC"],
      [74, 154, "Ceph CSI"],
      [243, 154, "Volume"],
    ],
    edges: [
      ["M132 40 H183", "claim", 159, 24],
      ["M243 59 V92 H74 V133", "class selects", 158, 84],
      ["M132 154 H183", "creates", 159, 180],
      ["M243 59 V132", "binds", 268, 99],
    ],
    states: [
      [
        "Request",
        [0],
        [0, 1],
        "The pod references a claim. Its StorageClass identifies the provisioner.",
      ],
      [
        "Provision",
        [1, 2],
        [1, 2, 3],
        "Ceph CSI provisions backing storage for the claim.",
      ],
      [
        "Bind",
        [3],
        [1, 3],
        "The PVC binds to the persistent volume. The pod can mount the claimed storage.",
      ],
    ],
  },
  firewall: fork(
    "VyOS router",
    "Router service",
    "Outgoing link",
    ["local input", "forward"],
    [
      [
        "To router",
        [0],
        [0, 1],
        "A packet addressed to the router itself goes to local input.",
      ],
      [
        "Through router",
        [1],
        [0, 2],
        "A packet for another host goes through forwarding policy.",
      ],
    ],
  ),
  proxmox: fork(
    "Proxmox",
    "SSH / Web UI",
    "VM (tap)",
    ["HOST-IN", "FWBR"],
    [
      ["Ke host", [0], [0, 1], "Trafik manajemen diperiksa oleh aturan host."],
      [
        "Ke VM",
        [1],
        [0, 2],
        "Paket menuju VM melewati bridge dan antarmuka tap, bukan layanan manajemen host.",
      ],
    ],
  ),
  backup: journey(
    "VyOS router",
    "Local Git repo",
    "Remote repo",
    "export",
    "push",
    [
      [
        "Commit config",
        [0],
        [0, 1],
        "The post-hook exports the configuration into local Git history.",
      ],
      [
        "Push backup",
        [1],
        [1, 2],
        "Only a successful push places this copy outside the router.",
      ],
    ],
  ),
  logs: {
    nodes: [
      [68, 41, "VyOS"],
      [252, 41, "Browser"],
      [160, 154, "Graylog host"],
    ],
    edges: [
      ["M68 60 V110 H135 V133", "UDP 514", 75, 93],
      ["M252 60 V110 H185 V133", "TCP 9000", 247, 93],
    ],
    states: [
      [
        "Send log",
        [0],
        [0, 2],
        "The router sends a syslog datagram to the input on the Graylog host.",
      ],
      [
        "Read logs",
        [1],
        [1, 2],
        "The browser opens the web interface; port 9000 is not the syslog input.",
      ],
    ],
  },
  packages: journey(
    "Build VM",
    "Pkg repository",
    "Firewall",
    "publish",
    "install",
    [
      [
        "Publish",
        [0],
        [0, 1],
        "The build VM produces the package and publishes it in the repository.",
      ],
      [
        "Install",
        [1],
        [1, 2],
        "The firewall fetches and installs the published package.",
      ],
    ],
  ),
  plugin: journey(
    "Controller",
    "configd",
    "Backend action",
    "Unix socket",
    "dispatch",
    [
      [
        "Request action",
        [0],
        [0, 1],
        "The PHP controller sends a request over the Unix socket.",
      ],
      [
        "Run action",
        [1],
        [1, 2],
        "configd dispatches the configured script or template action.",
      ],
    ],
  ),
  proxy: journey(
    "OpenCode",
    "CLIProxyAPI",
    "Model provider",
    "local API",
    "upstream API",
    [
      [
        "Local request",
        [0],
        [0, 1],
        "OpenCode addresses the local OpenAI-compatible endpoint.",
      ],
      [
        "Forward request",
        [1],
        [1, 2],
        "The proxy authenticates to the upstream provider and forwards the model request.",
      ],
    ],
  ),
} satisfies Record<string, Scene>;
export type SceneId = keyof typeof scenes;
export function sceneFor(id: SceneId): Scene {
  return scenes[id];
}
