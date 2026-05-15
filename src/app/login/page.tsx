import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
