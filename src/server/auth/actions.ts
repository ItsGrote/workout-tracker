"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type AuthActionInput = {
  email: string;
  password: string;
};

type AuthActionResult = {
  error?: string;
  needsEmailConfirmation?: boolean;
};

export const loginWithPassword = async ({
  email,
  password,
}: AuthActionInput): Promise<AuthActionResult> => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return {};
};

export const signUpWithPassword = async ({
  email,
  password,
}: AuthActionInput): Promise<AuthActionResult> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return { needsEmailConfirmation: true };
  }

  return {};
};

export const logout = async () => {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
};
