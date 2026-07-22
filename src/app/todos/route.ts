import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) return Response.json({error: "Unauthorized"}, {status: 401});

    const {data, error} = await supabase.from("todos").select().eq("user_id", user.id);

    return Response.json(data)
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description } = await req.json();

    const { data, error } = await supabase.from("todos").insert({
        title,
        description,
        user_id: user.id,
    }).select().single();

    if (error) return Response.json({ error: error.message }, { status: 400 });

    return Response.json(data);
}

export async function DELETE(req: Request){
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) return Response.json({error: "Unauthorized"}, {status: 401});

}

export async function PUT(req: Request){

}