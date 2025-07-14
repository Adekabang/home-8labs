import { initToolbar } from "@stagewise/toolbar";

// Only initialize in development mode
if (import.meta.env.DEV) {
  initToolbar({
    plugins: [],
  });
}
