#!/bin/bash
# Vercel build entrypoint (invoked via the "vercel-build" npm script).
#
# Production and Preview currently share ONE Supabase database. Running
# `prisma migrate deploy` on every Preview deployment would apply an
# unreviewed/unmerged branch's migrations straight to the production schema.
# So: migrate on Production only. Vercel sets VERCEL_ENV=production|preview|
# development automatically during the build — no extra config needed.
set -euo pipefail

prisma generate

if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "[vercel-build] VERCEL_ENV=production — running prisma migrate deploy"
  prisma migrate deploy
else
  echo "[vercel-build] VERCEL_ENV=${VERCEL_ENV:-unset} — skipping prisma migrate deploy (shared DB safety)"
fi

next build
