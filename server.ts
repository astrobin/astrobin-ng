import "zone.js/dist/zone-node";

import { ngExpressEngine } from "@nguniversal/express-engine";
import express from "express";
import { join } from "path";

import { AppServerModule } from "./src/main.server";
import { APP_BASE_HREF } from "@angular/common";
import { existsSync } from "fs";
import { REQUEST, RESPONSE } from "@nguniversal/express-engine/tokens";

export const server = express();
const distFolder = join(process.cwd(), "dist/frontend/browser");
const indexHtml = existsSync(join(distFolder, "index.original.html")) ? "index.original.html" : "index";

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
server.engine(
  "html",
  ngExpressEngine({
    bootstrap: AppServerModule
  })
);

server.set("view engine", "html");
server.set("views", distFolder);

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
  });
});

export * from "./src/main.server";
