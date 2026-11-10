import { handleBody } from "lib/supabase/handlers";
import { signupCheckSchema, signupExists } from "lib/supabase/signups";

export const POST = handleBody(signupCheckSchema, signupExists);
