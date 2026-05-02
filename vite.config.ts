import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiCache = new Map();
  
  return {
    plugins: [
      TanStackRouterVite(),
      react(),
      tailwindcss(),
      tsconfigPaths(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              try {
                Object.assign(process.env, env);
                const apiName = req.url.split('?')[0].replace('/api/', '').replace(/\/$/, '');
                
                let handler = apiCache.get(apiName);
                if (!handler) {
                  const module = await import(`./api/${apiName}.ts`);
                  handler = module.default;
                  apiCache.set(apiName, handler);
                }
                
                // Mock Vercel req/res
                const vercelReq = { 
                  ...req, 
                  body: await new Promise(r => {
                    if (req.method === 'GET' || req.method === 'DELETE') return r({});
                    const timeout = setTimeout(() => r({}), 2000);
                    let body = '';
                    req.on('data', chunk => body += chunk);
                    req.on('end', () => {
                      clearTimeout(timeout);
                      try { r(body ? JSON.parse(body) : {}); } 
                      catch { r({}); }
                    });
                  }), 
                  query: Object.fromEntries(new URL(req.url, 'http://localhost').searchParams) 
                };
                
                const vercelRes = {
                  status: (code) => { res.statusCode = code; return vercelRes; },
                  json: (data) => { 
                    if (!res.writableEnded) {
                      res.setHeader('Content-Type', 'application/json'); 
                      res.end(JSON.stringify(data)); 
                    }
                  },
                  setHeader: (name, val) => res.setHeader(name, val),
                  end: (data) => { if (!res.writableEnded) res.end(data); },
                };

                await handler(vercelReq, vercelRes);
                return;
              } catch (e) {
                console.error('API Middleware Error:', e);
                if (!res.writableEnded) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
                return;
              }
            }
            next();
          });
        },
      },
    ],
    build: {
      outDir: 'public',
      emptyOutDir: true,
    },
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "unsafe-none",
      },
    },
  };
});
