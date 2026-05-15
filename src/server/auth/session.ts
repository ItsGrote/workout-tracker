import { createSupabaseServerClient } from "@/lib/supabase-server";

export class AuthenticationError extends Error {
  readonly statusCode = 401;

  constructor(message = "Authentication required") {
    super(message);
  }
}

export const requireAuthenticatedUserId = async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError();
  }

  return user.id;
};

