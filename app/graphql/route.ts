// Batch 5 - some scanners probe /graphql (no /api prefix). Re-export the
// same handler so both paths work.
export { GET, POST } from "@/app/api/graphql/route";
