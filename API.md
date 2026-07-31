# API Documentation

All API requests must be sent to `/api/...` and specify the `Content-Type: application/json` header. Authentication is session/cookie based through Supabase client or using the API Bearer/cookie session.

## Endpoint Map

| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in to the system | No |
| `GET` | `/api/todos` | Fetch all todos for the user | Yes |
| `POST` | `/api/todos` | Create a new todo | Yes |
| `PUT` | `/api/todos/:id` | Update an existing todo | Yes |
| `DELETE` | `/api/todos/:id` | Delete a todo | Yes |

---

## Authentication Endpoints

### 1. Register User

* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "e98e94bb-1c39-4475-bebe-406a090e9d1e",
      "email": "user@example.com"
    }
  }
}
```

### 2. Login User

* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "session": {
      "access_token": "token-string",
      "token_type": "bearer",
      "expires_in": 3600,
      "refresh_token": "refresh-token-string",
      "user": {
        "id": "e98e94bb-1c39-4475-bebe-406a090e9d1e",
        "email": "user@example.com"
      }
    }
  }
}
```

---

## Todo Endpoints

### 3. Get All Todos

* **URL**: `/api/todos`
* **Method**: `GET`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "c1a2b3-uuid-456",
      "title": "Backend API-ları sənədləşdirmək",
      "description": "API sənədini hazırlamaq",
      "isCompleted": false,
      "deadline": "2026-07-30T23:59:00.000Z",
      "userId": "e98e94bb-1c39-4475-bebe-406a090e9d1e",
      "createdAt": "2026-07-26T14:30:00.000Z"
    }
  ]
}
```

### 4. Create Todo

* **URL**: `/api/todos`
* **Method**: `POST`
* **Request Body**:
```json
{
  "title": "Backend API-ları sənədləşdirmək",
  "description": "API sənədini hazırlamaq",
  "deadline": "2026-07-30T23:59:00.000Z"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "c1a2b3-uuid-456",
    "title": "Backend API-ları sənədləşdirmək",
    "description": "API sənədini hazırlamaq",
    "isCompleted": false,
    "deadline": "2026-07-30T23:59:00.000Z",
    "userId": "e98e94bb-1c39-4475-bebe-406a090e9d1e",
    "createdAt": "2026-07-26T14:30:00.000Z"
  }
}
```
* **Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Deadline tarixi keçmiş zaman ola bilməz!",
    "details": [
      "deadline must be a future date"
    ]
  }
}
```

### 5. Update Todo

* **URL**: `/api/todos/:id`
* **Method**: `PUT`
* **Request Body**:
```json
{
  "title": "Yeni başlıq",
  "description": "Yeni təsvir",
  "completed": true,
  "deadline": "2026-08-15T12:00:00.000Z"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "c1a2b3-uuid-456",
    "title": "Yeni başlıq",
    "description": "Yeni təsvir",
    "isCompleted": true,
    "deadline": "2026-08-15T12:00:00.000Z",
    "userId": "e98e94bb-1c39-4475-bebe-406a090e9d1e",
    "createdAt": "2026-07-26T14:30:00.000Z"
  }
}
```
* **Error Response (403 Forbidden)**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Başqasının taskını dəyişməyə icazəniz yoxdur"
  }
}
```

### 6. Delete Todo

* **URL**: `/api/todos/:id`
* **Method**: `DELETE`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "c1a2b3-uuid-456",
    "title": "Yeni başlıq",
    "description": "Yeni təsvir",
    "isCompleted": true,
    "deadline": "2026-08-15T12:00:00.000Z",
    "userId": "e98e94bb-1c39-4475-bebe-406a090e9d1e",
    "createdAt": "2026-07-26T14:30:00.000Z"
  }
}
```

---

## Standard Error Response Format

All error payloads use a unified structure:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly description of the error",
    "details": []
  }
}
```

Common status codes:
* `200 OK` — Success.
* `201 Created` — Resource created.
* `400 Bad Request` — Missing parameter or validation failure.
* `401 Unauthorized` — Invalid authentication credentials.
* `403 Forbidden` — Attempting to modify a resource belonging to another user.
* `404 Not Found` — Requested todo item does not exist.
* `500 Internal Server Error` — Server-side error.
