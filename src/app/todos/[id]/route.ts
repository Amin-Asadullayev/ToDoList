import { createClient } from "@/lib/supabase/server";

type Props = {
    params: Promise<{id: string}>
}

export async function DELETE(req: Request, context: Props){
    const {id} = await context.params;
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) return Response.json({error: "Unauthorized"}, {status: 401});

    const {data, error} = await supabase.from("todos").delete().eq("id", id).eq("user_id", user.id).select().single();
    return Response.json(data);
}

export async function PUT(req: Request, context: Props) {
  const { id } = await context.params;

  const supabase = await createClient();

  const {data: { user }} = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, completed } = await req.json();

  const updates = {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(completed !== undefined && { completed }),
  };

  const { data, error } = await supabase.from("todos").update(updates).eq("id", id).eq("user_id", user.id).select().single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data);
}