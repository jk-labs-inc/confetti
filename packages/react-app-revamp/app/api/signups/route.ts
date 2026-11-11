import { handleBody } from "lib/supabase/handlers";
import { insertSignup, signupInsertSchema } from "lib/supabase/signups";

export const POST = handleBody(signupInsertSchema, insertSignup);
