import "server-only";

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function provisionAuthUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: string;
}) {
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

  if (
    signup.error &&
    !signup.error.message.toLowerCase().includes("already registered")
  ) {
    throw signup.error;
  }

  let authUserId = signup.data.user?.id;
  if (!authUserId) {
    const existing = await prisma.$queryRaw<Array<{ id: string }>>`
      select id::text
      from auth.users
      where lower(email) = lower(${input.email})
      limit 1
    `;
    authUserId = existing[0]?.id;
  }

  if (!authUserId) {
    throw new Error("Unable to provision the employee login");
  }

  await prisma.$executeRaw`
    update auth.users
    set encrypted_password = crypt(${input.password}, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now(),
        raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
          || jsonb_build_object('commanddesk_role', ${input.role})
    where id = ${authUserId}::uuid
  `;

  return authUserId;
}
