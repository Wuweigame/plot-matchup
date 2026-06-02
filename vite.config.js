import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: `base` must match your GitHub repo name for Pages to work.
// If your repo is  github.com/<you>/plot-matchup  then base = "/plot-matchup/".
// If you deploy to a user/org root site (<you>.github.io), set base = "/".
export default defineConfig({
  plugins: [react()],
  base: "/plot-matchup/",
});
