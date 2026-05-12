import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import vitePluginImp from "vite-plugin-imp";
import path from "path";

/**
 * Replace env variables in index.html * @see https://github.com/vitejs/vite/issues/3105#issuecomment-939703781
 * @see https://vitejs.dev/guide/api-plugin.html#transformindexhtml
 */
function htmlPlugin(env: ReturnType<typeof loadEnv>) {
    return {
        name: "html-transform",
        transformIndexHtml: {
            enforce: "pre" as const,
            transform: (html: string): string =>
                html.replace(/%(.*?)%/g, (match, p1) =>
                    env[p1] ?? match
                )
        }
    };
}


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        optimizeDeps: {
            esbuildOptions: {
                // Node.js global to browser globalThis
                define: {
                    global: "globalThis"
                }
            }
        },
        plugins: [
            htmlPlugin(loadEnv(mode, ".")),
            react(),
            viteTsconfigPaths(),
            svgrPlugin(),
            vitePluginImp({
                libList: [
                    {
                        libName: "antd",
                        style: (name) => `antd/es/${name}/style`
                    }
                ]
            })
        ],
        build: {
            outDir: "build"
        },
        server: {
            open: false,
            port: 4401,
            hmr: true
        },
        resolve: {
            alias: [
                { find: "@", replacement: path.resolve(__dirname, "src") },
                // fix less import by: @import ~
                // https://github.com/vitejs/vite/issues/2185#issuecomment-784637827
                { find: /^~/, replacement: "" },
                { find: "process", replacement: "process/browser" },
                { find: "stream", replacement: "stream-browserify" },
                { find: "zlib", replacement: "browserify-zlib" },
                { find: "util", replacement: "util/" },
                { find: "antd/lib", replacement: "antd/es" }
            ]
        },
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true
                }
            }
        }
    };
});