import { defineConfig, loadEnv, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

async function readJsonBody(req: NodeJS.ReadableStream) {
  const chunks: Uint8Array[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) return undefined;

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return undefined;

  return JSON.parse(raw);
}

function localApiRoutes() {
  return {
    name: "local-api-routes",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api", async (req, res, next) => {
        try {
          const routeName = req.url?.split("?")[0]?.replace(/^\/+/, "");
          if (!routeName) return next();

          const module = await server.ssrLoadModule(`/api/${routeName}.ts`);
          if (typeof module.default !== "function") return next();

          const body = req.method && req.method !== "GET" && req.method !== "HEAD"
            ? await readJsonBody(req)
            : undefined;

          let statusCode = 200;

          const requestShim = {
            method: req.method,
            headers: req.headers,
            body,
          };

          const responseShim = {
            setHeader(name: string, value: string) {
              res.setHeader(name, value);
              return responseShim;
            },
            status(code: number) {
              statusCode = code;
              res.statusCode = code;
              return responseShim;
            },
            json(payload: unknown) {
              if (!res.headersSent) {
                res.setHeader("Content-Type", "application/json");
              }
              res.statusCode = statusCode;
              res.end(JSON.stringify(payload));
              return responseShim;
            },
          };

          await module.default(requestShim, responseShim);

          if (!res.writableEnded) {
            res.statusCode = statusCode;
            res.end();
          }
        } catch (error) {
          console.error("Local API route failed:", error);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
          }
          res.end(JSON.stringify({
            error: error instanceof Error ? error.message : "Local API route failed.",
          }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), localApiRoutes(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
