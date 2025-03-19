import { defineConfig, loadEnv } from "vite";
import path from "path";
import { ViteMinifyPlugin } from "vite-plugin-minify";

export default defineConfig(({ _, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      CURRENT_YEAR: JSON.stringify(new Date().getFullYear()),
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          404: path.resolve(__dirname, "public/404.html"),
        },
        output: {
          manualChunks: undefined,
          entryFileNames: "[name].[hash].js",
          chunkFileNames: "[name].[hash].js",
          assetFileNames: "[name].[hash].[ext]",
        },
      },
      minify: true,
    },
    server: {
      port: env.PORT || 8080,
    },
    plugins: [ViteMinifyPlugin({})],
  };
});
