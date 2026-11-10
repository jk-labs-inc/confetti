import "server-only";
import { emailRegex } from "@helpers/regex";
import { e164PhoneRegex } from "lib/phone/constants";
import { z } from "zod";
import { addressSchema } from "./schemas";
import { getSupabaseServer } from "./server";
import type { SignupCheck, SignupCheckResult, SignupInsert, SignupKind, SignupResult } from "./types";

const MAX_SIGNUP_VALUE_LENGTH = 320;

export const signupKindSchema = z.enum(["email", "phone"]);

const SIGNUP_TABLES: Record<SignupKind, { table: string; column: string }> = {
  email: { table: "email_signups", column: "email_address" },
  phone: { table: "phone_number_signups", column: "phone_number" },
};

const signupValueSchemas: Record<SignupKind, z.ZodString> = {
  email: z.string().max(MAX_SIGNUP_VALUE_LENGTH).regex(emailRegex),
  phone: z.string().regex(e164PhoneRegex),
};

export const signupInsertSchema = z
  .object({
    kind: signupKindSchema,
    value: z.string(),
    userAddress: addressSchema.nullable(),
  })
  .refine(({ kind, value }) => signupValueSchemas[kind].safeParse(value).success, {
    message: "invalid signup value",
    path: ["value"],
  });

export const signupCheckSchema = z.object({
  kind: signupKindSchema,
  value: z.string().min(1).max(MAX_SIGNUP_VALUE_LENGTH),
  userAddress: addressSchema.optional(),
});

async function hasSignupForAddress(kind: SignupKind, userAddress: string): Promise<boolean> {
  const { table, column } = SIGNUP_TABLES[kind];
  const { data, error } = await getSupabaseServer()
    .from(table)
    .select(column)
    .ilike("user_address", userAddress)
    .limit(1);
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

export async function insertSignup({ kind, value, userAddress }: SignupInsert): Promise<SignupResult> {
  const { table, column } = SIGNUP_TABLES[kind];
  const replacesExisting = userAddress ? await hasSignupForAddress(kind, userAddress) : null;

  const { error } = await getSupabaseServer()
    .from(table)
    .insert([{ [column]: value, user_address: userAddress, date: new Date().toISOString() }]);
  if (error) throw new Error(error.message);

  return { replacesExisting };
}

export async function signupExists({ kind, value, userAddress }: SignupCheck): Promise<SignupCheckResult> {
  const { table, column } = SIGNUP_TABLES[kind];
  let query = getSupabaseServer().from(table).select(column).eq(column, value);
  if (userAddress) query = query.ilike("user_address", userAddress);

  const { data, error } = await query.limit(1);
  if (error) throw new Error(error.message);
  return { exists: (data ?? []).length > 0 };
}

export async function getEmailForWallet(walletAddress: string): Promise<string | null> {
  const { data, error } = await getSupabaseServer()
    .from(SIGNUP_TABLES.email.table)
    .select("email_address")
    .ilike("user_address", walletAddress)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.email_address ?? null;
}
