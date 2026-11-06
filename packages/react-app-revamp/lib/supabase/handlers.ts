import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

async function respond<TResult>(path: string, load: () => Promise<TResult>): Promise<NextResponse> {
  try {
    return NextResponse.json((await load()) ?? null);
  } catch (error) {
    console.error(`[supabase] ${path} failed:`, error);
    return NextResponse.json({ error: "request failed" }, { status: 500 });
  }
}

function badRequest(path: string, error: z.ZodError): NextResponse {
  const issues = z.prettifyError(error);
  console.warn(`[supabase] ${path} rejected:`, issues);
  return NextResponse.json({ error: issues }, { status: 400 });
}

export function handleQuery<TSchema extends z.ZodType, TResult>(
  schema: TSchema,
  load: (input: z.output<TSchema>) => Promise<TResult>,
) {
  return async (request: NextRequest) => {
    const path = request.nextUrl.pathname;
    const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) return badRequest(path, parsed.error);
    return respond(path, () => load(parsed.data));
  };
}

export function handleBody<TSchema extends z.ZodType, TResult>(
  schema: TSchema,
  load: (input: z.output<TSchema>) => Promise<TResult>,
) {
  return async (request: NextRequest) => {
    const path = request.nextUrl.pathname;
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return badRequest(path, parsed.error);
    return respond(path, () => load(parsed.data));
  };
}
