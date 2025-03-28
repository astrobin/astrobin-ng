export const environment = {
  production: true,
  buildVersion: "__BUILD_VERSION__",
  classicBaseUrl: "https://www.astrobin.com",
  classicApiUrl: "http://localhost:4000",  // Proxied by node (see: server.ts)
  cdnUrl: "https://cdn.astrobin.com",
  sentryKeys: ["8284df973c49473baa2c08d8212fcde6", "o4503907479519232", "4503907484237824"],
  // Bump this number to invalidate the cache of the CKEditor
  ckeditorTimestamp: "25020701"
};
