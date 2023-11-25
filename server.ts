import "zone.js/dist/zone-node";

import { ngExpressEngine } from "@nguniversal/express-engine";
import express from "express";
import { join } from "path";

import { AppServerModule } from "./src/main.server";
import { APP_BASE_HREF } from "@angular/common";
import { existsSync } from "fs";
import { REQUEST, RESPONSE } from "@nguniversal/express-engine/tokens";

const compression = require("compression");
const { createProxyMiddleware } = require("http-proxy-middleware");

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), "dist/frontend/browser");
  const indexHtml = existsSync(join(distFolder, "index.original.html")) ? "index.original.html" : "index";
  // Determine the proxy target based on the environment
  const isProduction = process.env.NODE_ENV === "production";
  const target = isProduction ? "https://www.astrobin.com" : "http://localhost:8084";

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine(
    "html",
    ngExpressEngine({
      bootstrap: AppServerModule
    })
  );

  server.set("view engine", "html");
  server.set("views", distFolder);

  server.use((req, res, next) => {
    global["clientIp"] = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    next();
  });

  server.use(compression());

  // Serve robots.txt
  server.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *\nDisallow:\n\nSitemap: https://cdn.astrobin.com/sitemaps/app/sitemap_index.xml`);
  });

  // Define the proxy middleware explicitly
  const apiProxy = createProxyMiddleware({
    target: target,
    changeOrigin: true
  });

  // Apply the proxy middleware to the /api route
  server.use("/api", apiProxy);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get(
    "*.*",
    express.static(distFolder, {
      maxAge: "1y"
    })
  );

  // All regular routes use the Universal engine
  server.get("*", (req, res) => {
    res.render(indexHtml, {
      req,
      res,
      providers: [
        { provide: APP_BASE_HREF, useValue: req.baseUrl },
        { provide: REQUEST, useValue: req },
        { provide: RESPONSE, useValue: res }
      ]
    }, (err, html) => {
      if (html) {
        // If the URL after redirects is '/404', send a 404 status
        if (req.url === "/404") {
          res.status(404).send(html);
        } else {
          res.status(200).send(html);
        }
      } else {
        // If there was an error during rendering, send a 500 status
        console.error(err);
        res.sendStatus(500);
      }
    });
  });

  return server;
}

function run(): void {
  const port = process.env["PORT"] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || "";
if (moduleFilename === __filename || moduleFilename.includes("iisnode")) {
  run();
}

export * from "./src/main.server";
