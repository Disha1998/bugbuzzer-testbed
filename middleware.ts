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
// Batch 2 - session cookies (existing).
// =============================================================================
const FAKE_SESSION_ID = "tb27kQ8fpN9zXvBcYm4LjHrDsGeWqUiT";
const FAKE_LONG_LIVED_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiJ0ZXN0YmVkLXVzZXIiLCJpYXQiOjE3MzU2ODk2MDAsImV4cCI6NDEwMjQ0NDgwMH0." +
  "kQ7pNv3wR9bZmY6xL2fJhU4nT8aC1sE5dV0yG7iOxRj";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Batch 4 - if this path matches a known "attacker probe" URL, serve fake content.
  const exposed = EXPOSED_FILES[pathname];
  if (exposed) {
    return new NextResponse(exposed.body, {
      status: 200,
      headers: { "Content-Type": exposed.type },
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
