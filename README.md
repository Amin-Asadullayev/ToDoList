# 📝 Full-Stack To-Do List Application (Next.js & Supabase)

This project is a full-featured, full-stack Task Management (To-Do List) application built using **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase (Auth & Database)**.

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Tech Stack & Team Roles](#-tech-stack--team-roles)
4. [Project Structure & File Breakdown](#-project-structure--file-breakdown)
5. [Database Setup (init.sql)](#-database-setup-initsql)
6. [Environment Variables Configuration](#-environment-variables-configuration)
7. [Installation & Getting Started](#-installation--getting-started)
8. [API Documentation Link](#-api-documentation-link)

---

## 🚀 Project Overview

This application provides a secure environment for users to register, log in, and manage their daily tasks. In this project:
- Each user **logs into their own account** and can **only view and manage their personal tasks**.
- If a user is not logged in, they are automatically redirected to the **Login / Register (`/login`)** page.
- Data is stored in **Supabase PostgreSQL** and protected using Row-Level Security (RLS) policies.

---

## ✨ Key Features

- 🔐 **Secure Authentication**: User sign-in and account creation powered by Supabase Auth (`@supabase/ssr`).
- 🛡️ **Protected Routes**: Unauthenticated users cannot access the main page (`/`) and are redirected to `/login`.
- ➕ **Add Tasks with Deadlines**: Create tasks with a title (required), optional description, and a future deadline.
- 📋 **View Tasks**: Load and render user-specific tasks from the backend database.
- 🚦 **Deadline Indicators**: Visual markers for tasks: Overdue (🔴), Due Soon (🟡), and On Time (🟢).
- 🔍 **Filter Views**: Easily filter tasks between **"All"**, **"Active"**, **"Completed"**, and **"Overdue"**.
- 📅 **Sorting by Deadline**: Sort tasks based on their deadline proximity (ascending/descending).
- 🚨 **Error Handling & Toast Notifications**: Interactive, clear visual alert toasts for invalid requests (like past deadlines) and authentication errors.

---

## 🛠️ Tech Stack & Team Roles

| Technology | Role & Purpose |
| :--- | :--- |
| **Next.js 16 (App Router)** | Full-stack framework handling both Frontend UI and Backend API Route Handlers. |
| **React 19** | Powers interactive user interface components and state management. |
| **TypeScript** | Ensures end-to-end type safety and prevents runtime errors. |
| **Tailwind CSS v4** | Utility-first CSS framework for responsive layout and Dark Mode styling. |
| **Supabase (@supabase/ssr)** | Managed PostgreSQL database, authentication system, and SSR cookie handler. |

### Team & Responsibility Matrix
- **Backend Developer**: Designed database schema, wrote `init.sql` script, and built API route handlers `/api/auth/register`, `/api/auth/login`, `/api/todos`, and `/api/todos/[id]` with validation rules.
- **Frontend Developer**: Designed Auth screens, task dashboard UI, deadline indicators, filtering and sorting logic, and integration with the backend API including error Toast alerts.

---

## 📂 Project Structure & File Breakdown

```text
ToDoList/
├── src/
│   ├── app/                         # Next.js App Router root directory
│   │   ├── api/                     # Backend API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts     # User login (POST) returning session data
│   │   │   │   └── register/
│   │   │   │       └── route.ts     # User registration (POST)
│   │   │   └── todos/
│   │   │       ├── route.ts         # GET todos & POST todo
│   │   │       └── [id]/
│   │   │           └── route.ts     # PUT todo & DELETE todo
│   │   ├── login/
│   │   │   └── page.tsx             # Login & Sign-up user interface
│   │   ├── globals.css              # Global styles and Tailwind CSS imports
│   │   ├── Home.tsx                 # Main dashboard UI & client-side state logic
│   │   ├── layout.tsx               # Main HTML layout wrapper and Geist font configuration
│   │   └── page.jsx                 # Server page performing authentication check & redirect
│   └── lib/
│       └── supabase/
│           ├── client.ts            # Browser-side Supabase client instance
│           └── server.ts            # Server-side Supabase client instance (with cookies)
├── init.sql                         # Database setup script
├── API.md                           # Documentation detailing API endpoints
├── .env                             # Environment variables configuration
├── package.json                     # Dependencies and script declarations
├── next.config.ts                   # Next.js config
├── tsconfig.json                    # TypeScript compiler options
└── README.md                        # Project documentation (this file)
```

---

## 🗄️ Database Setup (init.sql)

To run this project, you must set up the `todos` table in your Supabase PostgreSQL database. The initialization script is located at the root of the project: [init.sql](file:///home/tefmaalrex/peerstack/todolist/init.sql).

### How to apply migrations:
1. Open your Supabase Dashboard and navigate to the **SQL Editor**.
2. Copy the content of the `init.sql` file.
3. Paste it into the editor and click **Run**.

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the root folder of the project with the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

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

3. **Configure environment variables** in a `.env` file.

4. **Start the local development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Go to `http://localhost:3000` in your web browser.

---

## 📡 API Documentation Link

For details regarding all request and response structures, validation error formats, and status codes, please refer to: [API.md](file:///home/tefmaalrex/peerstack/todolist/API.md).
