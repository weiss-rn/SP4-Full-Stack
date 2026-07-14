09:32:51.597  Creating an optimized production build ...
09:33:03.445✓ Compiled successfully in 11.5s
09:33:03.470  Running TypeScript ...
09:33:11.858  Collecting page data using 1 worker ...
09:33:12.277  Generating static pages using 1 worker (0/8) ...
09:33:12.506  Generating static pages using 1 worker (2/8) 

09:33:12.507  Generating static pages using 1 worker (4/8) 

09:33:16.095workerd/jsg/util.c++:405: error: e = workerd/util/sqlite.c++:1523: failed: SQLite failed; NOSENTRY database is locked: SQLITE_BUSY
09:33:16.095stack: /opt/buildhome/repo/node_modules/@cloudflare/workerd-linux-64/bin/workerd@308596c /opt/buildhome/repo/node_modules/@cloudflare/workerd-linux-64/bin/workerd@30922e1 /opt/buildhome/repo/node_modules/@cloudflare/workerd-linux-64/bin/workerd@3091f95 /opt/buildhome/repo/node_modules/@cloudflare/workerd-linux-64/bin/workerd@303e907 /opt/buildhome/repo/node_modules/@cloudflare/workerd-linux-64/bin/workerd@2be073a /opt/buildhome/repo/node_modules/@cloudflare/workerd-linux-64/bin/workerd@1fd1f30 /opt/buildhome/repo/node_modules/@cloudflare/workerd-linux-64/bin/workerd@1fd1a76 /opt/buildhome/repo/node_modules/@cloudflare/workerd-linux-64/bin/workerd@36243af; sentryErrorContext = jsgInternalError; wdErrId = 4vj5qg9sh5paqm1j1hjdhh49
09:33:16.193Error occurred prerendering page "/products". Read more: https://nextjs.org/docs/messages/prerender-error
09:33:16.197Error: D1_ERROR: Failed to parse body as JSON, got: Error: internal error; reference = 4vj5qg9sh5paqm1j1hjdhh49
09:33:16.197    at D1DatabaseObject.queryExecute (file:///opt/buildhome/repo/node_modules/miniflare/dist/src/workers/d1/database.worker.js:191:73)
09:33:16.197    at async D1DatabaseObject.fetch (file:///opt/buildhome/repo/node_modules/miniflare/dist/src/workers/shared/index.worker.js:377:36)
09:33:16.197    at async D1DatabaseObject.fetch (file:///opt/buildhome/repo/node_modules/miniflare/dist/src/workers/shared/index.worker.js:538:14)
09:33:16.197    at async s (.next/server/chunks/ssr/src_lib_catalog_ts_742eeb61._.js:69:1433)
09:33:16.197    at async r (.next/server/chunks/ssr/src_lib_catalog_ts_742eeb61._.js:69:727)
09:33:16.198    at async u (.next/server/chunks/ssr/src_lib_catalog_ts_742eeb61._.js:73:384)
09:33:16.199    at async w (.next/server/chunks/ssr/src_lib_catalog_ts_742eeb61._.js:73:1868)
09:33:16.199    at async e (.next/server/chunks/ssr/[root-of-the-server]__d9654d84._.js:1:1489) {
09:33:16.199  digest: '3599496570',
09:33:16.200  [cause]: Error: Failed to parse body as JSON, got: Error: internal error; reference = 4vj5qg9sh5paqm1j1hjdhh49
09:33:16.201      at D1DatabaseObject.queryExecute (file:///opt/buildhome/repo/node_modules/miniflare/dist/src/workers/d1/database.worker.js:191:73)
09:33:16.210      at async D1DatabaseObject.fetch (file:///opt/buildhome/repo/node_modules/miniflare/dist/src/workers/shared/index.worker.js:377:36)
09:33:16.210      at async D1DatabaseObject.fetch (file:///opt/buildhome/repo/node_modules/miniflare/dist/src/workers/shared/index.worker.js:538:14)
09:33:16.210      at D1DatabaseSessionAlwaysPrimary._send (cloudflare-internal:d1-api:182:24)
09:33:16.210      at async D1DatabaseSessionAlwaysPrimary._sendOrThrow (cloudflare-internal:d1-api:135:25)
09:33:16.211      at async (cloudflare-internal:d1-api:353:41)
09:33:16.211}
09:33:16.211Export encountered an error on /products/page: /products, exiting the build.
09:33:16.300⨯ Next.js build worker exited with code: 1 and signal: null
09:33:16.359node:internal/errors:983
09:33:16.359  const err = new Error(message);
09:33:16.359              ^
09:33:16.359
09:33:16.359Error: Command failed: npm run build
09:33:16.359    at genericNodeError (node:internal/errors:983:15)
09:33:16.359    at wrappedFn (node:internal/errors:537:14)
09:33:16.359    at checkExecSyncError (node:child_process:882:11)
09:33:16.359    at Object.execSync (node:child_process:954:15)
09:33:16.359    at buildNextjsApp (file:///opt/buildhome/repo/node_modules/@opennextjs/aws/dist/build/buildNextApp.js:15:8)
09:33:16.360    at build (file:///opt/buildhome/repo/node_modules/@opennextjs/cloudflare/dist/cli/build/build.js:50:9)
09:33:16.360    at async buildCommand (file:///opt/buildhome/repo/node_modules/@opennextjs/cloudflare/dist/cli/commands/build.js:33:5) {
09:33:16.360  status: 1,
09:33:16.360  signal: null,
09:33:16.360  output: [ null, null, null ],
09:33:16.360  pid: 783,
09:33:16.360  stdout: null,
09:33:16.361  stderr: null
09:33:16.361}