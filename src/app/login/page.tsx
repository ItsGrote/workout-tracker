import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function LoginPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthPageShell>
  );
}
