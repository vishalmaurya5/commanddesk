const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.join(__dirname, "..");
const frontend = path.join(root, "frontend");
const envText = fs.readFileSync(path.join(frontend, ".env.local"), "utf8");
const match = envText.match(/^DATABASE_URL=(.*)$/m);

if (!match) throw new Error("DATABASE_URL is missing");

const directUrl = new URL(match[1].trim().replace(/^["']|["']$/g, ""));
const projectRef = directUrl.hostname.match(/^db\.([^.]+)\.supabase\.co$/)?.[1];
if (!projectRef) throw new Error("Expected a Supabase direct connection URL");

const poolerUrl = new URL("postgresql://placeholder:placeholder@localhost/postgres");
poolerUrl.username = `postgres.${projectRef}`;
poolerUrl.password = directUrl.password;
poolerUrl.hostname = "aws-0-ap-northeast-1.pooler.supabase.com";
poolerUrl.port = "5432";
poolerUrl.pathname = directUrl.pathname || "/postgres";
poolerUrl.searchParams.set("sslmode", "require");

const prismaCommand = path.join(frontend, "node_modules", "prisma", "build", "index.js");
const result = spawnSync(
  process.execPath,
  [
    prismaCommand,
    "migrate",
    "diff",
    "--from-config-datasource",
    "--to-schema",
    "prisma/schema.prisma",
    "--script",
  ],
  {
    cwd: frontend,
    env: { ...process.env, DATABASE_URL: poolerUrl.toString() },
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  },
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exitCode = result.status ?? 1;
