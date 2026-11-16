// Only actual Indonesian customer articles use Indonesian navigation labels.
// English fallback tutorials keep the language of their article and search index.
const englishTutorials: Record<string, true> = {
  "install-qemu-guest-agent": true,
  "install-docker-ipv6": true,
  "ipv6-github-dockerhub": true,
  "hermes-agent-ipv6": true,
  "aapanel-installation": true,
};
export function isIndonesianCustomer(pathname: string): boolean {
  return (
    pathname.startsWith("/id/docs/") &&
    !englishTutorials[pathname.replace(/\/$/, "").split("/").at(-1) ?? ""]
  );
}
