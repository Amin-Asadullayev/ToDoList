"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log(data.session);
    });
  }, []);
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const res = await fetch("/todos");

      if (!res.ok) return;

      const data = await res.json();

      setTodos(
        data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? "",
          completed: item.completed,
        }))
      );
    } catch { }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const res = await fetch("/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
      }),
    });

    if (!res.ok) return;

    const todo = await res.json();

    setTodos((prev) => [
      {
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
      },
      ...prev,
    ]);

    setTitle("");
    setDescription("");
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);

    if (!todo) return;

    const res = await fetch(`/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: !todo.completed,
      }),
    });

    if (!res.ok) return;

    const updated = await res.json();

    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
            ...t,
            completed: updated.completed,
          }
          : t
      )
    );
  };

  const deleteTodo = async (id: string) => {
    const res = await fetch(`/todos/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) return;

    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">
          To-Do List
        </h1>

        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="mb-6 space-y-3">
          <div>
            <label htmlFor="todo-title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              id="todo-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label htmlFor="todo-desc" className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              id="todo-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md transition-colors"
          >
            Add Task
          </button>
        </form>

        {/* Filter Controls */}
        <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-zinc-800 py-3 mb-4 text-sm">
          <span className="text-gray-500 dark:text-zinc-400">
            {todos.filter((t) => !t.completed).length} remaining
          </span>
          <div className="flex space-x-1">
            {(["all", "active", "completed"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${filter === type
                  ? "bg-gray-200 dark:bg-zinc-800 font-semibold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        {filteredTodos.length === 0 ? (
          <p className="text-center py-6 text-sm text-gray-500 dark:text-zinc-400">
            No tasks found.
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-start justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 gap-3"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium break-words ${todo.completed
                        ? "line-through text-gray-400 dark:text-zinc-500"
                        : ""
                        }`}
                    >
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p
                        className={`text-xs mt-0.5 break-words ${todo.completed
                          ? "line-through text-gray-400 dark:text-zinc-500"
                          : "text-gray-500 dark:text-zinc-400"
                          }`}
                      >
                        {todo.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
