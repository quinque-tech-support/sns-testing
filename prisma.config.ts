import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        // For local migrations and db push, we use the direct connection (port 5432)
        // to avoid pooling issues (P1017) with Supabase.
        url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
    },
});
