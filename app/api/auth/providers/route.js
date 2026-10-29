import { NextResponse } from "next/server";
import { configuredProviders } from "../../../lib/oauth";

export const dynamic = "force-dynamic";

// Tells the login/register pages which social buttons to show: only
// providers whose OAuth keys are actually configured in Vercel.
export async function GET() {
  return NextResponse.json(configuredProviders());
}
