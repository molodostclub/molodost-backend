export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  proxy: true,
  url: env('PUBLIC_URL', ''),
  http: {
    serverOptions: {
      requestTimeout: env.int('SERVER_REQUEST_TIMEOUT_MS', 60000),
      headersTimeout: env.int('SERVER_HEADERS_TIMEOUT_MS', 65000),
      keepAliveTimeout: env.int('SERVER_KEEP_ALIVE_TIMEOUT_MS', 5000),
    },
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
