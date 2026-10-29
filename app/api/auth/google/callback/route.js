import { callbackRoute } from "../../../../lib/oauth-routes";

export const dynamic = "force-dynamic";

export async function GET(req) {
  return callbackRoute("google", req);
}
