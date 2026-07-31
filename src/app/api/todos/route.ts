import { createClient } from "@/lib/supabase/server";

interface SupabaseTodo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  deadline: string | null;
  user_id: string;
  created_at: string;
}

function formatTodo(todo: SupabaseTodo) {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description || "",
    isCompleted: todo.completed,
    deadline: todo.deadline,
    userId: todo.user_id,
    createdAt: todo.created_at,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized access",
        }
      }, { status: 401 });
    }

    const { data, error } = await supabase.from("todos").select().eq("user_id", user.id).order("created_at", { ascending: false });

    if (error) {
      return Response.json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: error.message,
        }
      }, { status: 400 });
    }

    const todosList = (data || []) as SupabaseTodo[];

    return Response.json({
      success: true,
      data: todosList.map(formatTodo),
    });
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

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized access",
        }
      }, { status: 401 });
    }

    const { title, description, deadline } = await req.json();

    if (!title || !title.trim()) {
      return Response.json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Başlıq boş ola bilməz!",
          details: ["title is required"]
        }
      }, { status: 400 });
    }

    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return Response.json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Formatı düzgün olmayan deadline tarixi!",
            details: ["deadline must be a valid date"]
          }
        }, { status: 400 });
      }

      if (deadlineDate < new Date()) {
        return Response.json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Deadline tarixi keçmiş zaman ola bilməz!",
            details: ["deadline must be a future date"]
          }
        }, { status: 400 });
      }
    }

    const { data, error } = await supabase.from("todos").insert({
      title: title.trim(),
      description: description ? description.trim() : null,
      deadline: deadline || null,
      user_id: user.id,
    }).select().single();

    if (error) {
      return Response.json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: error.message,
        }
      }, { status: 400 });
    }

    return Response.json({
      success: true,
      data: formatTodo(data as SupabaseTodo),
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
