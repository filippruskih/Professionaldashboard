import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogoMark } from "@/components/app-logo-mark";

export const metadata = { title: "Create an account - CMPND" };

const ERROR_MESSAGES: Record<string, string> = {
  email: "Enter a valid email address.",
  short: "Password needs to be at least 8 characters.",
  mismatch: "Passwords don't match.",
  taken: "An account with that email already exists - log in instead.",
  locked: "Too many attempts. Try again in a few minutes.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const { error, email } = await searchParams;

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="flex size-12 items-center justify-center rounded-xl text-white shadow-sm"
            style={{ background: "#B9C6AE" }}
            aria-label="CMPND home"
          >
            <AppLogoMark className="size-6" />
          </Link>
          <div>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Then connect your Instagram to get started.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form method="POST" action="/api/auth/signup" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={email ?? ""}
                autoFocus
                required
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">
                {ERROR_MESSAGES[error] ?? "Something went wrong. Try again."}
              </p>
            )}
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
