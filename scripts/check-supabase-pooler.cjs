const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("../frontend/node_modules/pg");

const envPath = path.join(__dirname, "..", "frontend", ".env.local");
const envText = fs.readFileSync(envPath, "utf8");
const match = envText.match(/^DATABASE_URL=(.*)$/m);

if (!match) {
  throw new Error("DATABASE_URL is missing from frontend/.env.local");
}

const directUrl = new URL(match[1].trim().replace(/^["']|["']$/g, ""));
const projectRef = directUrl.hostname.match(/^db\.([^.]+)\.supabase\.co$/)?.[1];

if (!projectRef) {
  throw new Error("DATABASE_URL is not a Supabase direct connection URL");
}

const regions = [
  "ap-northeast-1",
  "ap-south-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "eu-central-1",
  "eu-west-1",
  "us-east-1",
  "us-west-1",
];

async function checkRegion(region) {
  const client = new Client({
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 6543,
    database: directUrl.pathname.slice(1) || "postgres",
    user: `postgres.${projectRef}`,
    password: directUrl.password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  });

  try {
    await client.connect();
    await client.query("select 1");
    return { region, ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      region,
      ok: false,
      reason: /Tenant or user not found/i.test(message)
        ? "wrong region"
        : /password authentication failed/i.test(message)
          ? "credentials rejected"
          : /timeout|ETIMEDOUT/i.test(message)
            ? "connection timeout"
            : `connection failed (${error?.code ?? "no-code"}: ${message
                .replaceAll(projectRef, "<project>")
                .slice(0, 120)})`,
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function inspectDatabase(region) {
  const client = new Client({
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 6543,
    database: directUrl.pathname.slice(1) || "postgres",
    user: `postgres.${projectRef}`,
    password: directUrl.password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  });

  try {
    await client.connect();
    const schema = await client.query(`
      select
        to_regclass('public."User"') is not null as "hasUser",
        to_regclass('public."CompanyMembership"') is not null as "hasMembership",
        to_regclass('public."Subscription"') is not null as "hasSubscription",
        exists (
          select 1 from information_schema.columns
          where table_schema = 'public'
            and table_name = 'User'
            and column_name = 'authUserId'
        ) as "hasAuthUserId",
        exists (
          select 1 from information_schema.columns
          where table_schema = 'public'
            and table_name = 'User'
            and column_name = 'avatarUrl'
        ) as "hasAvatarUrl"
    `);
    console.log(`SCHEMA ${JSON.stringify(schema.rows[0])}`);

    if (schema.rows[0].hasUser && schema.rows[0].hasAvatarUrl) {
      const counts = await client.query(`
        select
          count(*)::int as "users",
          count(*) filter (where role::text = 'SUPER_ADMIN')::int as "superAdmins",
          count(*) filter (where "avatarUrl" is not null and "avatarUrl" <> '')::int as "savedAvatars"
        from "User"
      `);
      console.log(`DATA ${JSON.stringify(counts.rows[0])}`);
    }

    const schemaText = fs.readFileSync(
      path.join(__dirname, "..", "frontend", "prisma", "schema.prisma"),
      "utf8",
    );
    const expectedModels = Array.from(
      schemaText.matchAll(/^model\s+(\w+)\s*\{/gm),
      (item) => item[1],
    ).sort();
    const tables = await client.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
    `);
    const existingTables = new Set(tables.rows.map((row) => row.table_name));
    console.log(
      `MISSING_MODELS ${JSON.stringify(
        expectedModels.filter((model) => !existingTables.has(model)),
      )}`,
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}

Promise.all(regions.map(checkRegion))
  .then(async (results) => {
    for (const result of results) {
      console.log(
        result.ok
          ? `MATCH ${result.region}`
          : `NO_MATCH ${result.region}: ${result.reason}`,
      );
    }

    const match = results.find((result) => result.ok);
    if (!match) {
      process.exitCode = 2;
      return;
    }
    await inspectDatabase(match.region);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
