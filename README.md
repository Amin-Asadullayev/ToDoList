# 📝 Full-Stack To-Do List Application (Next.js & Supabase)

This project is a full-featured, full-stack Task Management (To-Do List) application built using **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase (Auth & Database)**.

This document provides a clear, thorough, and easy-to-understand explanation of the project structure, how each feature works, database setup, environment configuration, and installation steps.

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Tech Stack & Roles](#-tech-stack--roles)
4. [Project Structure & File Breakdown](#-project-structure--file-breakdown)
5. [Supabase Database Setup](#-supabase-database-setup)
6. [Environment Variables Configuration](#-environment-variables-configuration)
7. [Installation & Getting Started](#-installation--getting-started)
8. [Detailed Step-by-Step Operation Workflows](#-detailed-step-by-step-operation-workflows)
   - [1. User Authentication (Login & Sign Up)](#1-user-authentication-login--sign-up)
   - [2. Fetching Tasks (GET)](#2-fetching-tasks-get)
   - [3. Adding a New Task (POST)](#3-adding-a-new-task-post)
   - [4. Updating Task Status (PUT)](#4-updating-task-status-put)
   - [5. Deleting a Task (DELETE)](#5-deleting-a-task-delete)
   - [6. Task Filtering & Remaining Counter](#6-task-filtering--remaining-counter)
9. [Available Scripts](#-available-scripts)

---

## 🚀 Project Overview

This application provides a secure environment for users to create and manage their daily tasks. In this project:
- Each user **logs into their own account** and can **only view and manage their personal tasks**.
- If a user is not logged in, they are automatically redirected to the **Login / Register (`/login`)** page.
- Data is stored in **Supabase PostgreSQL** and protected using Row-Level Security (RLS) policies.

---

## ✨ Key Features

- 🔐 **Secure Authentication**: User sign-in and account creation powered by Supabase Auth (`@supabase/ssr`).
- 🛡️ **Protected Routes**: Unauthenticated users cannot access the main page (`/`) and are redirected to `/login`.
- ➕ **Add Tasks**: Create tasks with a title (required) and an optional detailed description.
- 📋 **View Tasks**: Load and render user-specific tasks from the backend database.
- ✅ **Toggle Completion**: Mark tasks as complete or incomplete via interactive checkboxes.
- 🗑️ **Delete Tasks**: Remove tasks permanently from both the database and the UI.
- 🔍 **Filter Views**: Easily filter tasks between **"All"**, **"Active"**, and **"Completed"**.
- 🔢 **Live Remaining Counter**: Real-time count of active incomplete tasks.
- 🌙 **Modern & Dark Mode UI**: Clean, responsive layout crafted with Tailwind CSS v4 and Google's Geist font family.

---

## 🛠️ Tech Stack & Roles

| Technology | Role & Purpose |
| :--- | :--- |
| **Next.js 16 (App Router)** | Full-stack framework handling both Frontend UI and Backend API Route Handlers. |
| **React 19** | Powers interactive user interface components and state management. |
| **TypeScript** | Ensures end-to-end type safety and prevents runtime errors. |
| **Tailwind CSS v4** | Utility-first CSS framework for responsive layout and Dark Mode styling. |
| **Supabase (@supabase/ssr)** | Managed PostgreSQL database, authentication system, and SSR cookie handler. |

---

## 📂 Project Structure & File Breakdown

Below is the directory tree along with a clear description of what every file does:

```text
ToDoList/
├── src/
│   ├── app/                         # Next.js App Router root directory
│   │   ├── login/
│   │   │   └── page.tsx             # Login & Sign-up user interface
│   │   ├── todos/
│   │   │   ├── route.ts             # API Route for fetching (GET) & creating (POST) todos
│   │   │   └── [id]/
│   │   │       └── route.ts         # API Route for updating (PUT) & deleting (DELETE) a todo
│   │   ├── globals.css              # Global styles and Tailwind CSS imports
│   │   ├── Home.tsx                 # Main dashboard UI & client-side state logic
│   │   ├── layout.tsx               # Main HTML layout wrapper and Geist font configuration
│   │   └── page.jsx                 # Server page performing authentication check & redirect
│   └── lib/
│       └── supabase/
│           ├── client.ts            # Browser-side Supabase client instance
│           └── server.ts            # Server-side Supabase client instance (with cookies)
├── .env.local                       # Environment variables (Supabase URL & Key)
├── package.json                     # Dependencies and script declarations
├── next.config.ts                   # Next.js build and dev origin configs
├── tsconfig.json                    # TypeScript paths and compiler options
└── README.md                        # Documentation file (the file you are reading)
```

### Detailed File Roles:

- **[`src/lib/supabase/client.ts`](file:///c:/Users/Mirakram/Desktop/ToDoList/src/lib/supabase/client.ts)**: Initializes the browser client using `createBrowserClient`. Used in client components (`Home.tsx`, `login/page.tsx`).
- **[`src/lib/supabase/server.ts`](file:///c:/Users/Mirakram/Desktop/ToDoList/src/lib/supabase/server.ts)**: Initializes the server client using `createServerClient` and Next.js `cookies()`. Used in API routes and server components.
- **[`src/app/page.jsx`](file:///c:/Users/Mirakram/Desktop/ToDoList/src/app/page.jsx)**: Server Component for `/`. Checks if a user is logged in via `supabase.auth.getUser()`. If authenticated, renders `<Home />`; otherwise redirects to `/login`.
- **[`src/app/Home.tsx`](file:///c:/Users/Mirakram/Desktop/ToDoList/src/app/Home.tsx)**: Main interactive Client Component (`"use client"`). Manages todo list state, handles form inputs, triggers API calls (`fetch`), and filters task views.
- **[`src/app/login/page.tsx`](file:///c:/Users/Mirakram/Desktop/ToDoList/src/app/login/page.tsx)**: Authentication page allowing users to switch between Sign In and Sign Up modes using Supabase Auth.
- **[`src/app/todos/route.ts`](file:///c:/Users/Mirakram/Desktop/ToDoList/src/app/todos/route.ts)**: API Route Handler:
  - `GET`: Returns all todos belonging to the authenticated user.
  - `POST`: Inserts a new todo record into the database for the user.
- **[`src/app/todos/[id]/route.ts`](file:///c:/Users/Mirakram/Desktop/ToDoList/src/app/todos/%5Bid%5D/route.ts)**: API Route Handler for single items:
  - `PUT`: Updates fields (`completed`, `title`, `description`) for a specific task ID.
  - `DELETE`: Permanently deletes a specific task ID for the user.

---

## 🗄️ Supabase Database Setup

To run this project, you must create a **`todos`** table in your Supabase PostgreSQL database.

### SQL Migration Script (Execute in Supabase SQL Editor):

```sql
-- 1. Create the 'todos' table
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row-Level Security (RLS)
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow users to view only their own todos
CREATE POLICY "Users can view own todos"
ON public.todos FOR SELECT USING (auth.uid() = user_id);

-- 4. Policy: Allow users to insert their own todos
CREATE POLICY "Users can insert own todos"
ON public.todos FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Allow users to update their own todos
CREATE POLICY "Users can update own todos"
ON public.todos FOR UPDATE USING (auth.uid() = user_id);

-- 6. Policy: Allow users to delete their own todos
CREATE POLICY "Users can delete own todos"
ON public.todos FOR DELETE USING (auth.uid() = user_id);
```

---

## 🔑 Environment Variables Configuration

Create a `.env.local` file in the root folder of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

> **Note:** You can obtain these keys in your Supabase Dashboard under **Project Settings -> API**.

---

## ⚙️ Installation & Getting Started

Follow these steps to set up and run the application locally:

1. **Navigate to the project directory:**
   ```bash
   cd ToDoList
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local`** and fill in your Supabase credentials.

4. **Run the database SQL setup** in your Supabase SQL Console.

5. **Start the local development server:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   Go to `http://localhost:3000` in your web browser.

---

## 🔄 Detailed Step-by-Step Operation Workflows

### 1. User Authentication (Login & Sign Up)
- The user accesses `/login`.
- **Sign In**: Submitting email & password triggers `supabase.auth.signInWithPassword()`. Cookies are saved in the browser, and the user is redirected to `/`.
- **Sign Up**: Toggling to "Sign Up" mode and submitting calls `supabase.auth.signUp()`, creating a new user account.
- **Route Protection**: When opening `/`, [`src/app/page.jsx`](file:///c:/Users/Mirakram/Desktop/ToDoList/src/app/page.jsx) runs on the server, verifies the session using `supabase.auth.getUser()`, and redirects unauthenticated visitors to `/login`.

### 2. Fetching Tasks (GET)
- When opening the main page, `Home.tsx` runs `loadTodos()` via `useEffect`.
- `fetch("/todos")` calls [`src/app/todos/route.ts`](file:///c:/Users/Mirakram/Desktop/ToDoList/src/app/todos/route.ts).
- The route handler verifies authentication, queries Supabase for `.select().eq("user_id", user.id)`, and returns the task list.

### 3. Adding a New Task (POST)
- The user types a title and optional description, then clicks **"Add Task"**.
- `Home.tsx` sends a `POST` request to `/todos`.
- The route handler inserts `{ title, description, user_id: user.id }` into Supabase and returns the created todo item, updating the UI immediately.

### 4. Updating Task Status (PUT)
- Clicking a checkbox calls `toggleTodo(id)`.
- Sends a `PUT` request to `/todos/[id]` with `{ completed: !todo.completed }`.
- The route handler [`src/app/todos/[id]/route.ts`](file:///c:/Users/Mirakram/Desktop/ToDoList/src/app/todos/%5Bid%5D/route.ts) updates the matching record in the database.

### 5. Deleting a Task (DELETE)
- Clicking the **"Delete"** button calls `deleteTodo(id)`.
- Sends a `DELETE` request to `/todos/[id]`.
- The backend removes the record from Supabase, and `Home.tsx` filters out the item from state.

### 6. Task Filtering & Remaining Counter
- **Remaining Counter**: Calculates `todos.filter(t => !t.completed).length` to show the number of open tasks.
- **Filter Tabs**:
  - `all`: Shows all tasks.
  - `active`: Displays only uncompleted tasks.
  - `completed`: Displays only finished tasks.

---

## 📜 Available Scripts

Run the following commands in the terminal as needed:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| `npm run build` | Compiles and optimizes the app for production |
| `npm run start` | Starts the production server (after running `npm run build`) |
| `npm run lint` | Runs ESLint to check for code style issues and syntax errors |

---

*This document serves as a complete reference for understanding, configuring, and maintaining the project.*
