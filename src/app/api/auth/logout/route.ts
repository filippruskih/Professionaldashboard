import { SESSION_COOKIE, redirectTo } from "@/lib/auth";

export async function POST() {
  const response = redirectTo("/");
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
