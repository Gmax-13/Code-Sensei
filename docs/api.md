# CodeSensei API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a valid JWT token stored in an HTTP-only cookie named `token`. The cookie is automatically set on login/register.

---

## Auth Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**Validation:** Name (2-50 chars), Email (valid format), Password (6-100 chars)

---

### POST /api/auth/login
Log in with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):** Same shape as register. Sets `token` HTTP-only cookie.

---

### POST /api/auth/logout
Log out by clearing the auth cookie.

**Response (200):**
```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

---

### GET /api/user/me
Get the currently authenticated user's profile. **🔒 Protected**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Feature Endpoints

### POST /api/report/generate — **🔒 Protected**
Generate a structured practical report from code.

**Request Body:**
```json
{
  "code": "function hello() { ... }",
  "language": "javascript",
  "title": "Hello World Program"
}
```

**Response:** Report object with `aim`, `theory`, `procedure`, `code`, `result`, `conclusion`.

---

### POST /api/analyze/codebase — **🔒 Protected**
Analyze multiple files and return a codebase summary.

**Request Body:**
```json
{
  "files": [
    { "name": "index.js", "content": "const x = 1;" },
    { "name": "utils.js", "content": "export function add(a,b) { return a+b; }" }
  ]
}
```

**Response:** Analysis object with `totalFiles`, `totalLines`, `languages`, `fileAnalyses`, `overview`.

---

### POST /api/diagram/generate — **🔒 Protected**
Generate Mermaid.js diagrams from source code.

**Request Body:**
```json
{
  "code": "class Animal { speak() {} }\nclass Dog extends Animal { bark() {} }",
  "language": "javascript"
}
```

**Response:** Object with `classDiagram`, `flowchart`, `dependencyGraph` (Mermaid syntax strings), and `metadata`.

---

### POST /api/dsa/execute — **🔒 Protected**
Execute a DSA algorithm with step-by-step output.

**Sorting Request:**
```json
{
  "algorithm": "bubbleSort",
  "data": [64, 34, 25, 12, 22, 11, 90]
}
```

**Data Structure Request:**
```json
{
  "algorithm": "stack",
  "operations": [
    { "operation": "push", "value": 10 },
    { "operation": "push", "value": 20 },
    { "operation": "pop" },
    { "operation": "peek" }
  ]
}
```

**Supported algorithms:** `bubbleSort`, `mergeSort`, `stack`, `queue`

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

| Status | Meaning               |
|--------|-----------------------|
| 400    | Bad Request / Validation Error |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Not Found             |
| 409    | Conflict (duplicate)  |
| 500    | Internal Server Error |
