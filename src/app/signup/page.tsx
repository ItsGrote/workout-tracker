import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function SignupPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthPageShell>
  );
}
