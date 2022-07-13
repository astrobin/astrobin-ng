const awsServerlessExpress = require("aws-serverless-express");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const app = require("./dist/frontend/server/main");
const binaryMimeTypes = [
  "application/javascript",
  "application/json",
  "application/octet-stream",
  "application/xml",
  "image/jpeg",
  "image/png",
  "image/gif",
  "text/comma-separated-values",
  "text/css",
  "text/html",
  "text/javascript",
  "text/plain",
  "text/text",
  "text/xml",
  "image/x-icon",
  "image/svg+xml",
  "application/x-font-ttf",
  "font/ttf",
  "font/otf"
];
const serverProxy = awsServerlessExpress.createServer(app.server, undefined, binaryMimeTypes);

app.server.use(awsServerlessExpressMiddleware.eventContext());

module.exports.ssrserverless = (event, context) => awsServerlessExpress.proxy(serverProxy, event, context);
