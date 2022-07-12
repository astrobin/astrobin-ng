const awsServerlessExpress = require("aws-serverless-express");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const app = require("./dist/frontend/server/main");
const serverProxy = awsServerlessExpress.createServer(app.server);

app.server.use(awsServerlessExpressMiddleware.eventContext());

module.exports.ssrserverless = (event, context) => awsServerlessExpress.proxy(serverProxy, event, context);
