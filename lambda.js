const awsServerlessExpress = require("aws-serverless-express");
const server = require("./dist/frontend/server");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

server.app.use(awsServerlessExpressMiddleware.eventContext());

const serverProxy = awsServerlessExpress.createServer(server.app);
module.exports.ssrserverless = (event, context) => awsServerlessExpress.proxy(serverProxy, event, context);
