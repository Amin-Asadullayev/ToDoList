"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  deadline?: string;
}

interface ApiTodo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  deadline?: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "overdue">("all");
  const [sortByDeadline, setSortByDeadline] = useState<"none" | "asc" | "desc">("none");
  const [notification, setNotification] = useState<{ message: string; type: "error" | "success" } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: "error" | "success") => {
    setNotification({ message, type });
  };

  const loadTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) {
        try {
          const errData = await res.json();
          showNotification(errData.error?.message || "Failed to load tasks", "error");
        } catch {
          showNotification("Failed to load tasks", "error");
        }
        return;
      }
      const resData = await res.json();
      setTodos(
        (resData.data || []).map((item: ApiTodo) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? "",
          completed: item.isCompleted,
          deadline: item.deadline ?? "",
        }))
      );
    } catch {
      showNotification("Failed to load tasks", "error");
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadTodos();
    });
  }, [loadTodos]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        deadline: deadline ? new Date(deadline).toISOString() : null,
      }),
    });

    if (!res.ok) {
      try {
        const errData = await res.json();
        showNotification(errData.error?.message || "Failed to add task", "error");
      } catch {
        showNotification("Failed to add task", "error");
      }
      return;
    }

    const resData = await res.json();
    const todo = resData.data;

    setTodos((prev) => [
      {
        id: todo.id,
        title: todo.title,
        description: todo.description ?? "",
        completed: todo.isCompleted,
        deadline: todo.deadline ?? "",
      },
      ...prev,
    ]);

    setTitle("");
    setDescription("");
    setDeadline("");
    showNotification("Task added successfully", "success");
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: !todo.completed,
      }),
    });

    if (!res.ok) {
      try {
        const errData = await res.json();
        showNotification(errData.error?.message || "Failed to update task", "error");
      } catch {
        showNotification("Failed to update task", "error");
      }
      return;
    }

    const resData = await res.json();
    const updated = resData.data;

    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: updated.isCompleted,
            }
          : t
      )
    );
  };

  const deleteTodo = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      try {
        const errData = await res.json();
        showNotification(errData.error?.message || "Failed to delete task", "error");
      } catch {
        showNotification("Failed to delete task", "error");
      }
      return;
    }

    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    showNotification("Task deleted successfully", "success");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const getDeadlineStatus = (deadlineStr: string, completed: boolean) => {
    if (completed) {
      return {
        label: "Completed",
        colorClass: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30 border-green-200 dark:border-green-800"
      };
    }
    const deadlineDate = new Date(deadlineStr);
    const now = new Date();
    if (deadlineDate < now) {
      return {
        label: "Overdue",
        colorClass: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30 border-red-200 dark:border-red-800"
      };
    }
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    if (diffHours <= 24) {
      return {
        label: "Due Soon",
        colorClass: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
      };
    }
    return {
      label: "On Time",
      colorClass: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
    };
  };

  const formatDeadline = (deadlineStr: string) => {
    const d = new Date(deadlineStr);
    return d.toLocaleString("az-AZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredAndSortedTodos = () => {
    let list = [...todos];
    const now = new Date();

    list = list.filter((todo) => {
      const isOverdue = !todo.completed && todo.deadline && new Date(todo.deadline) < now;
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      if (filter === "overdue") return !!isOverdue;
      return true;
    });

    if (sortByDeadline !== "none") {
      list.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        const timeA = new Date(a.deadline).getTime();
        const timeB = new Date(b.deadline).getTime();
        return sortByDeadline === "asc" ? timeA - timeB : timeB - timeA;
      });
    }

    return list;
  };

  const filteredTodos = getFilteredAndSortedTodos();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border text-sm max-w-sm transition-all duration-300 transform translate-y-0 ${
            notification.type === "error"
              ? "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/90 dark:text-red-200 dark:border-red-800"
              : "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/90 dark:text-green-200 dark:border-green-800"
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="font-semibold">{notification.type === "error" ? "Error:" : "Success:"}</span>
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            To-Do List
          </h1>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-gray-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Sign Out
          </button>
        </div>

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

          <div>
            <label htmlFor="todo-deadline" className="block text-sm font-medium mb-1">
              Deadline
            </label>
            <input
              id="todo-deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-b border-gray-200 dark:border-zinc-800 py-3 mb-4 text-sm gap-3">
          <span className="text-gray-500 dark:text-zinc-400">
            {todos.filter((t) => !t.completed).length} remaining
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg">
              {(["all", "active", "completed", "overdue"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilter(type)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                    filter === type
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 shadow-sm font-semibold"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setSortByDeadline((prev) => (prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"));
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                sortByDeadline !== "none"
                  ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300"
                  : "border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              Sort: {sortByDeadline === "none" ? "Default" : sortByDeadline === "asc" ? "📅 Asc" : "📅 Desc"}
            </button>
          </div>
        </div>

        {filteredTodos.length === 0 ? (
          <p className="text-center py-6 text-sm text-gray-500 dark:text-zinc-400">
            No tasks found.
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredTodos.map((todo) => {
              const deadlineStatus = todo.deadline ? getDeadlineStatus(todo.deadline, todo.completed) : null;
              return (
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
                        className={`text-sm font-medium break-words ${
                          todo.completed ? "line-through text-gray-400 dark:text-zinc-500" : ""
                        }`}
                      >
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p
                          className={`text-xs mt-0.5 break-words ${
                            todo.completed ? "line-through text-gray-400 dark:text-zinc-500" : "text-gray-500 dark:text-zinc-400"
                          }`}
                        >
                          {todo.description}
                        </p>
                      )}
                      {todo.deadline && deadlineStatus && (
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${deadlineStatus.colorClass}`}>
                            {deadlineStatus.label}
                          </span>
                          <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                            Due: {formatDeadline(todo.deadline)}
                          </span>
                        </div>
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
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
