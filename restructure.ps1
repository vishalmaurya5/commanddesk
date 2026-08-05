# restructure.ps1 - flatten the pointless monorepo wrapper and tidy src/
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File "G:\New folder\commanddesk\restructure.ps1"
# Commit or stash your work first. This moves files.

$ErrorActionPreference = "Stop"
$root = "G:\New folder\commanddesk"
Set-Location $root

if (-not (Test-Path "$root\frontend\package.json")) {
    Write-Host "frontend/ already flattened - skipping step 1-2." -ForegroundColor Yellow
} else {

    # 1. Drop build artifacts + installed deps (they get reinstalled at the new root)
    Write-Host "[1/5] Removing node_modules / .next ..." -ForegroundColor Cyan
    foreach ($p in @("node_modules", ".next", "frontend\node_modules", "frontend\.next")) {
        if (Test-Path $p) { Remove-Item $p -Recurse -Force }
    }
    # the wrapper package.json only proxied to frontend/ - it goes away
    foreach ($p in @("package.json", "package-lock.json")) {
        if (Test-Path $p) { Remove-Item $p -Force }
    }

    # 2. Move everything in frontend/ up to the repo root
    Write-Host "[2/5] Flattening frontend/ -> repo root ..." -ForegroundColor Cyan
    Get-ChildItem -Path "$root\frontend" -Force | ForEach-Object {
        $dest = Join-Path $root $_.Name
        if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }   # e.g. duplicate .gitignore
        Move-Item -LiteralPath $_.FullName -Destination $dest
    }
    Remove-Item "$root\frontend" -Recurse -Force
}

# 3. Split server-only code out of src/lib, fold utils/ and styles/ into lib/
Write-Host "[3/5] Reorganising src/ ..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "$root\src\server" | Out-Null

function Move-IfExists($from, $to) {
    if (Test-Path $from) { Move-Item -LiteralPath $from -Destination $to -Force }
}

# server layer: DB access, auth, tenancy/permissions - never imported by client components
Move-IfExists "$root\src\lib\services"              "$root\src\server\services"
Move-IfExists "$root\src\lib\saas"                  "$root\src\server\saas"
Move-IfExists "$root\src\lib\prisma.ts"             "$root\src\server\prisma.ts"
Move-IfExists "$root\src\lib\auth.ts"               "$root\src\server\auth.ts"
Move-IfExists "$root\src\lib\provision-auth-user.ts" "$root\src\server\provision-auth-user.ts"

# kill the lib / utils / styles overlap
# NOTE: src/proxy.ts stays exactly where it is - Next 16 requires it at the src/ root.
Move-IfExists "$root\src\utils\supabase"            "$root\src\lib\supabase"
Move-IfExists "$root\src\utils\origin.ts"           "$root\src\lib\origin.ts"
Move-IfExists "$root\src\styles\theme.ts"           "$root\src\lib\theme.ts"

# only remove the old folders if they are genuinely empty - never blind-delete
foreach ($d in @("$root\src\utils", "$root\src\styles")) {
    if (Test-Path $d) {
        $left = Get-ChildItem -LiteralPath $d -Recurse -File
        if ($left) {
            Write-Host "STOP: $d still contains files that were not accounted for:" -ForegroundColor Red
            $left | ForEach-Object { Write-Host "   $($_.FullName)" -ForegroundColor Red }
            Write-Host "Move them somewhere sensible, then re-run." -ForegroundColor Red
            exit 1
        }
        Remove-Item $d -Recurse -Force
    }
}

# 4. Rewrite import paths (order matters - saas/services rules run before the bare auth rule)
Write-Host "[4/5] Rewriting imports ..." -ForegroundColor Cyan
$map = @(
    @("@/lib/services/",           "@/server/services/"),
    @("@/lib/saas/",               "@/server/saas/"),
    @("@/lib/provision-auth-user", "@/server/provision-auth-user"),
    @("@/lib/prisma",              "@/server/prisma"),
    @("@/lib/auth",                "@/server/auth"),
    @("@/utils/supabase/",         "@/lib/supabase/"),
    @("@/utils/origin",            "@/lib/origin"),
    @("@/styles/theme",            "@/lib/theme")
)
$patched = 0
Get-ChildItem -Path "$root\src", "$root\prisma" -Recurse -Include *.ts, *.tsx -ErrorAction SilentlyContinue | ForEach-Object {
    $c = Get-Content -LiteralPath $_.FullName -Raw
    $orig = $c
    foreach ($m in $map) { $c = $c.Replace($m[0], $m[1]) }
    if ($c -ne $orig) {
        Set-Content -LiteralPath $_.FullName -Value $c -NoNewline
        $patched++
    }
}
Write-Host "      $patched files patched." -ForegroundColor DarkGray

# 5. Reinstall + verify
Write-Host "[5/5] Reinstalling dependencies ..." -ForegroundColor Cyan
npm install
npx tsc --noEmit

Write-Host ""
Write-Host "Done. Final structure:" -ForegroundColor Green
Write-Host "  src/app        routes + /api handlers"
Write-Host "  src/server     services, saas, prisma, auth  (server-only)"
Write-Host "  src/lib        supabase, api-client, theme, origin, utils  (shared)"
Write-Host "  src/components ui / layout / dashboard / brand"
Write-Host "  src/proxy.ts   Next 16 middleware - must stay at src/ root"
Write-Host "  src/providers, src/types, prisma/, public/"
