import "server-only";

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function provisionAuthUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: string;
}) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const signup = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
        },
      },
    });

    if (signup.data?.user?.id) {
      return signup.data.user.id;
    }
  } catch (err) {
    console.warn("Supabase signUp soft fail, falling back to db lookup:", err);
  }

  try {
    const existing = await prisma.$queryRaw<Array<{ id: string }>>`
      select id::text
      from auth.users
      where lower(email) = lower(${input.email})
      limit 1
    `;
    if (existing && existing[0]?.id) {
      return existing[0].id;
    }
  } catch {
    // Ignore raw query failure
  }

  return undefined;
}
