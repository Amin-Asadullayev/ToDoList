import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and password are required",
        }
      }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return Response.json({
        success: false,
        error: {
          code: "AUTH_ERROR",
          message: error.message,
        }
      }, { status: 400 });
    }

    return Response.json({
      success: true,
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
        }
      }
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return Response.json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message,
      }
    }, { status: 500 });
  }
}
