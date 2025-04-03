"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export async function getUserById(id: string): Promise<User | null> {
  if (!id) {
    console.error("No user ID provided");
    return null;
  }

  try {
    const supabase = createServerComponentClient({ cookies });
    
    // First get the current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error("No authenticated user found");
      return null;
    }

    // If the requested ID matches the current user's ID, use session data
    if (session.user.id === id) {
      return {
        id: session.user.id,
        name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
        image: session.user.user_metadata?.avatar_url,
        created_at: session.user.created_at,
        updated_at: new Date().toISOString(),
      };
    }

    // If looking up a different user, fall back to profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
} 