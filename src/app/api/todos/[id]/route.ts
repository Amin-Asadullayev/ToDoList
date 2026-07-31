import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>
}

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

export async function PUT(req: Request, context: Props) {
  try {
    const { id } = await context.params;
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

    const { data: existingTodo, error: findError } = await supabase.from("todos").select().eq("id", id).maybeSingle();

    if (findError || !existingTodo) {
      return Response.json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Task tapılmadı",
        }
      }, { status: 404 });
    }

    if (existingTodo.user_id !== user.id) {
      return Response.json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Başqasının taskını dəyişməyə icazəniz yoxdur",
        }
      }, { status: 403 });
    }

    const { title, description, completed, isCompleted, deadline } = await req.json();

    const resolvedCompleted = completed !== undefined ? completed : isCompleted;

    if (title !== undefined && !title.trim()) {
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

    const updates = {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description ? description.trim() : null }),
      ...(resolvedCompleted !== undefined && { completed: resolvedCompleted }),
      ...(deadline !== undefined && { deadline: deadline || null }),
    };

    const { data, error } = await supabase.from("todos").update(updates).eq("id", id).select().single();

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

export async function DELETE(req: Request, context: Props) {
  try {
    const { id } = await context.params;
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

    const { data: existingTodo, error: findError } = await supabase.from("todos").select().eq("id", id).maybeSingle();

    if (findError || !existingTodo) {
      return Response.json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Task tapılmadı",
        }
      }, { status: 404 });
    }

    if (existingTodo.user_id !== user.id) {
      return Response.json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Başqasının taskını silməyə icazəniz yoxdur",
        }
      }, { status: 403 });
    }

    const { data, error } = await supabase.from("todos").delete().eq("id", id).select().single();

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
