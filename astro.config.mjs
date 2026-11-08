import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import fs from 'node:fs';
import path from 'node:path';

function localDevApiPlugin() {
  return {
    name: 'local-dev-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const isOrderPath =
          url.pathname === '/.netlify/functions/submit-order' ||
          url.pathname === '/api/submit-order';

        if (!isOrderPath) {
          return next();
        }

        // Handle GET (Drive image proxy or health check)
        if (req.method === 'GET') {
          const imageId = url.searchParams.get('imageId');
          if (imageId) {
            try {
              const driveUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(imageId)}&sz=w1600`;
              const response = await fetch(driveUrl);
              if (response.ok) {
                const contentType = response.headers.get('content-type') || 'image/jpeg';
                const buffer = Buffer.from(await response.arrayBuffer());
                res.writeHead(200, {
                  'Content-Type': contentType,
                  'Cache-Control': 'public, max-age=3600'
                });
                return res.end(buffer);
              }
            } catch (err) {
              console.error('[local-dev-api] Error proxying image:', err);
            }
            res.writeHead(502, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Image proxy error' }));
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, message: 'Local dev API ready' }));
        }

        // Handle POST (Order submission)
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              let payload = {};
              const contentType = req.headers['content-type'] || '';

              if (contentType.includes('application/json')) {
                payload = JSON.parse(body || '{}');
              } else {
                const params = new URLSearchParams(body);
                for (const [k, v] of params.entries()) {
                  payload[k] = v;
                }
              }

              let googleScriptUrl =
                process.env.GOOGLE_SCRIPT_URL || process.env.PUBLIC_GOOGLE_SCRIPT_URL || '';

              if (!googleScriptUrl) {
                try {
                  const envPath = path.resolve(process.cwd(), '.env');
                  if (fs.existsSync(envPath)) {
                    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
                    for (const line of lines) {
                      const trimmed = line.trim();
                      if (trimmed.startsWith('GOOGLE_SCRIPT_URL=')) {
                        googleScriptUrl = trimmed.replace('GOOGLE_SCRIPT_URL=', '').trim();
                        break;
                      }
                    }
                  }
                } catch {}
              }

              let forwarded = false;
              let forwardResult = null;

              if (googleScriptUrl) {
                try {
                  const formParams = new URLSearchParams();
                  for (const [key, value] of Object.entries(payload)) {
                    formParams.append(key, String(value ?? ''));
                  }

                  const response = await fetch(googleScriptUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    body: formParams.toString(),
                    redirect: 'follow'
                  });

                  const resText = await response.text();
                  try {
                    forwardResult = JSON.parse(resText);
                  } catch {
                    forwardResult = { raw: resText };
                  }
                  forwarded = response.ok;
                  console.info('[local-dev-api] Order forwarded to Google Sheet:', forwardResult);
                } catch (forwardErr) {
                  console.warn('[local-dev-api] Could not forward to Google Sheet:', forwardErr.message);
                }
              }

              // Always record locally in dev for testing visibility
              const devLogPath = path.resolve(process.cwd(), 'src/data/dev-orders.json');
              let existingOrders = [];
              try {
                if (fs.existsSync(devLogPath)) {
                  existingOrders = JSON.parse(fs.readFileSync(devLogPath, 'utf8'));
                }
              } catch {}

              const orderRecord = {
                id: 'ord-' + Date.now(),
                timestamp: new Date().toISOString(),
                payload,
                forwardedToGoogle: forwarded,
                googleResult: forwardResult
              };

              existingOrders.unshift(orderRecord);
              try {
                fs.writeFileSync(devLogPath, JSON.stringify(existingOrders.slice(0, 50), null, 2));
              } catch (writeErr) {
                console.error('[local-dev-api] Failed to write dev log:', writeErr);
              }

              console.info('[local-dev-api] New order recorded:', payload);

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
              });
              return res.end(
                JSON.stringify({
                  success: true,
                  message: forwarded
                    ? 'Commande enregistree dans Google Sheet'
                    : 'Commande enregistree en local (mode test dev)',
                  order: orderRecord
                })
              );
            } catch (err) {
              console.error('[local-dev-api] Error processing order:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ success: false, message: err.message }));
            }
          });
          return;
        }

        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
      });
    }
  };
}

export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    plugins: [localDevApiPlugin()]
  }
});
