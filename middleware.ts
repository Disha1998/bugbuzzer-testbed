import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =============================================================================
// Batch 4 - public file exposure. Middleware intercepts probe URLs and serves
// fake vulnerable content so BugBuzzer's file-exposure checks fire.
// All content is FAKE - no real secrets, no real DB.
// =============================================================================

const FAKE_ENV_CONTENT = `# .env - fake testbed content
DATABASE_URL=postgres://user:pass@localhost:5432/fake_db
STRIPE_SECRET_KEY=sk_live_T16KOEne8oPbMIZOgiCYVVoV
JWT_SECRET=kQ7pNv3wR9bZmY6xL2fJhU4nT8aC1sE5dV0yG7iOxRj2Zk1qYbXpMlHc4nBaVfLu
API_KEY=re_dWhxcy5ikTlUMFiQyzfTNdyc0B6FArqBOf1NPmL4
`;

const FAKE_GIT_CONFIG = `[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
[remote "origin"]
	url = git@github.com:fake-user/fake-testbed-repo.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
`;

const FAKE_GIT_HEAD = `ref: refs/heads/main\n`;

const FAKE_SVN_ENTRIES = `12

dir
5678
https://svn.fake-testbed.example.com/repo/trunk
https://svn.fake-testbed.example.com/repo
`;

const FAKE_BACKUP_SQL = `-- MySQL dump 10.13
-- Host: localhost    Database: fake_testbed_db
-- ------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (id INT, email VARCHAR(255), password_hash VARCHAR(255));
INSERT INTO users VALUES (1,'alice@fake.example','$2b$10$fakehashfakehash');
`;

const FAKE_CONFIG_JSON = JSON.stringify(
  {
    apiEndpoint: "https://api.fake-testbed.example.com",
    stripePublishableKey: "pk_live_51fake_testbed_key",
    stripeSecretKey: "sk_live_T16KOEne8oPbMIZOgiCYVVoV",
    databaseUrl: "postgres://user:pass@localhost:5432/fake_db",
    jwtSecret: "kQ7pNv3wR9bZmY6xL2fJhU4nT8aC1sE5dV0yG7iOxRj2Zk1qYbXpMlHc4nBaVfLu",
  },
  null,
  2,
);

const FAKE_DOCKER_COMPOSE = `version: "3.8"
services:
  web:
    image: fake-testbed/app:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/fake_db
      STRIPE_SECRET_KEY: sk_live_T16KOEne8oPbMIZOgiCYVVoV
      JWT_SECRET: kQ7pNv3wR9bZmY6xL2fJhU4nT8aC1sE5dV0yG7iOxRj2Zk1qYbXpMlHc4nBaVfLu
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: fake_root_password
      POSTGRES_DB: fake_db
`;

// Path → response body + content-type. One dict, one lookup.
const EXPOSED_FILES: Record<string, { body: string; type: string }> = {
  "/.env": { body: FAKE_ENV_CONTENT, type: "text/plain" },
  "/.env.local": { body: FAKE_ENV_CONTENT, type: "text/plain" },
  "/.env.production": { body: FAKE_ENV_CONTENT, type: "text/plain" },
  "/.env.development": { body: FAKE_ENV_CONTENT, type: "text/plain" },
  "/.git/config": { body: FAKE_GIT_CONFIG, type: "text/plain" },
  "/.git/HEAD": { body: FAKE_GIT_HEAD, type: "text/plain" },
  "/.git/index": { body: "DIRC\x00\x00\x00\x02\x00\x00\x00\x01fake-git-index", type: "application/octet-stream" },
  "/.svn/entries": { body: FAKE_SVN_ENTRIES, type: "text/plain" },
  "/.svn/wc.db": { body: "SQLite format 3\x00fake-svn-wc-db", type: "application/octet-stream" },
  "/.svn/format": { body: "12\n", type: "text/plain" },
  "/backup.sql": { body: FAKE_BACKUP_SQL, type: "application/sql" },
  "/db.sql": { body: FAKE_BACKUP_SQL, type: "application/sql" },
  "/dump.sql": { body: FAKE_BACKUP_SQL, type: "application/sql" },
  "/backup.zip": { body: "PK\x03\x04fake-zip-content", type: "application/zip" },
  "/backup.tar.gz": { body: "\x1f\x8b\x08fake-tarball", type: "application/gzip" },
  "/config.json": { body: FAKE_CONFIG_JSON, type: "application/json" },
  "/settings.json": { body: FAKE_CONFIG_JSON, type: "application/json" },
  "/appsettings.json": { body: FAKE_CONFIG_JSON, type: "application/json" },
  "/secrets.json": { body: FAKE_CONFIG_JSON, type: "application/json" },
  "/docker-compose.yml": { body: FAKE_DOCKER_COMPOSE, type: "text/yaml" },
  "/docker-compose.yaml": { body: FAKE_DOCKER_COMPOSE, type: "text/yaml" },
  "/compose.yml": { body: FAKE_DOCKER_COMPOSE, type: "text/yaml" },
};

// =============================================================================
// Batch 5 - auth & admin panels. Fake admin panels, debug pages, dev tools,
// AI infra dashboards. All fake HTML, no real login.
// =============================================================================

const FAKE_ADMIN_PANEL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Admin Login - Testbed Admin Panel</title>
</head>
<body>
<div class="admin-panel">
<h1>Administrator Login</h1>
<p>Please sign in to the admin console.</p>
<form method="POST" action="/api/login" id="admin-login-form">
  <label>Username: <input type="text" name="username" required></label>
  <label>Password: <input type="password" name="password" required></label>
  <button type="submit">Sign In</button>
</form>
<footer>Admin Panel v1.0 - Testbed</footer>
</div>
</body>
</html>`;

const FAKE_PHPMYADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>phpMyAdmin</title>
</head>
<body>
<div id="phpmyadmin">
<h1>phpMyAdmin</h1>
<p>Welcome to phpMyAdmin 5.2.1</p>
<form method="POST" action="/api/login" name="login_form">
  <label>Username: <input type="text" name="pma_username"></label>
  <label>Password: <input type="password" name="pma_password"></label>
  <button type="submit">Go</button>
</form>
</div>
</body>
</html>`;

const FAKE_DEBUG_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>DebugToolbar - Django Debug</title>
</head>
<body>
<div id="djDebug" class="djdt-panelContent">
<h1>DjangoDebugToolbar</h1>
<p>Werkzeug Debugger enabled - do not use in production.</p>
<pre>
Traceback (most recent call last):
  File "/app/views.py", line 42, in handle_request
    result = compute_something()
  File "/app/logic.py", line 88, in compute_something
    raise ValueError("Fake debug traceback for testbed")
ValueError: Fake debug traceback for testbed
</pre>
<div class="werkzeug-debugger">
  <p>Console (interactive): DEBUG=True detected</p>
</div>
</body>
</html>`;

const FAKE_STORYBOOK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Storybook - Component Library</title>
</head>
<body>
<div id="storybook-root">
<h1>Storybook</h1>
<p>Storybook 7.6.0 - Component development environment</p>
<nav class="storybook-sidebar">
  <a href="#/story/button">Button</a>
  <a href="#/story/card">Card</a>
</nav>
</div>
<script>window.__STORYBOOK_CLIENT_API__ = { version: "7.6.0" };</script>
</body>
</html>`;

const FAKE_LANGFUSE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Langfuse - LLM Observability</title>
</head>
<body>
<div id="langfuse-app">
<h1>Langfuse</h1>
<p>Open source LLM engineering platform.</p>
<nav>
  <a href="/traces">Traces</a>
  <a href="/observations">Observations</a>
  <a href="/prompts">Prompts</a>
</nav>
</div>
</body>
</html>`;

const FAKE_MLFLOW_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>MLflow</title>
</head>
<body>
<div id="mlflow-app">
<h1>MLflow</h1>
<p>MLflow 2.9.0 - Machine learning lifecycle platform</p>
<nav>
  <a href="/experiments">Experiments</a>
  <a href="/models">Models</a>
</nav>
</div>
</body>
</html>`;

// Path → HTML body. Served for admin panels, debug pages, dev tools, AI infra.
const FAKE_PANELS: Record<string, string> = {
  "/admin": FAKE_ADMIN_PANEL_HTML,
  "/administrator": FAKE_ADMIN_PANEL_HTML,
  "/wp-admin": FAKE_ADMIN_PANEL_HTML,
  "/phpmyadmin": FAKE_PHPMYADMIN_HTML,
  "/__debug__": FAKE_DEBUG_PAGE_HTML,
  "/debug": FAKE_DEBUG_PAGE_HTML,
  "/storybook": FAKE_STORYBOOK_HTML,
  "/langfuse": FAKE_LANGFUSE_HTML,
  "/mlflow": FAKE_MLFLOW_HTML,
};

// =============================================================================
// Batch 2 - session cookies (existing).
// =============================================================================
const FAKE_SESSION_ID = "tb27kQ8fpN9zXvBcYm4LjHrDsGeWqUiT";
// Batch 6b - jwt-weak-signing-secret. JWT signed with HMAC-SHA256 using the
// weak secret "secret". BugBuzzer's dictionary attack tries common weak
// passwords - "secret" is on that list, so the check will fire.
// Payload: { sub: "testbed-user", iat: 1735689600, exp: 4102444800 }
const FAKE_LONG_LIVED_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiJ0ZXN0YmVkLXVzZXIiLCJpYXQiOjE3MzU2ODk2MDAsImV4cCI6NDEwMjQ0NDgwMH0." +
  "eVQ1xneoGRMskfjtt7j8E_EC7vkjkzj1cWHfX6QFb8o";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Batch 6 - vite-dev-server-file-read. Fake Vite dev-server fingerprint
  // + /@fs/* arbitrary file read (mirrors real CVE-2023-34092 shape).
  if (pathname === "/@vite/client") {
    return new NextResponse(
      "// vite hmr client\nconst hot = { on: () => {}, send: () => {} };\nexport { hot };\n",
      { status: 200, headers: { "Content-Type": "application/javascript" } },
    );
  }
  if (pathname.startsWith("/@fs/")) {
    const filePath = pathname.slice(4);
    if (filePath === "/etc/passwd") {
      return new NextResponse(
        "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000::/home/user:/bin/bash\n",
        { status: 200, headers: { "Content-Type": "text/plain" } },
      );
    }
    return new NextResponse(`# fake file content of ${filePath}\n(testbed placeholder)\n`, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Batch 5 - dangerous HTTP methods. Respond to OPTIONS with an Allow header
  // that includes TRACE + PUT + DELETE + PATCH so the check fires.
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        Allow: "GET, HEAD, POST, PUT, DELETE, PATCH, TRACE, OPTIONS",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, PATCH, TRACE, OPTIONS",
      },
    });
  }

  // Batch 5 - host header reflection. When scanner sends Host: evil.com,
  // this route redirects to that host, leaking the reflection.
  if (pathname === "/redirect-home") {
    const host = request.headers.get("host") ?? request.nextUrl.host;
    return NextResponse.redirect(`https://${host}/`, 302);
  }

  // Batch 4 - if this path matches a known "attacker probe" URL, serve fake content.
  const exposed = EXPOSED_FILES[pathname];
  if (exposed) {
    return new NextResponse(exposed.body, {
      status: 200,
      headers: { "Content-Type": exposed.type },
    });
  }

  // Batch 5 - fake admin panels, debug pages, dev tools, AI infra dashboards.
  const panel = FAKE_PANELS[pathname];
  if (panel) {
    return new NextResponse(panel, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Batch 2 - session cookies on every non-static, non-api page response.
  const response = NextResponse.next();
  response.headers.append("Set-Cookie", `sessionid=${FAKE_SESSION_ID}; Path=/`);
  response.headers.append("Set-Cookie", `authtoken=${FAKE_LONG_LIVED_JWT}; Path=/`);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
