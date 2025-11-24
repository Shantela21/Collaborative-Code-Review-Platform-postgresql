# Collaborative Code Review Platform (PostgreSQL)

A backend server for a **Collaborative Code Review Platform**, built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL**. This platform supports user authentication, project management, code submissions, comments, and real-time collaboration features.

---

## 🚀 Features

* **User Authentication** (Register, Login, JWT-based Authentication)
* **User Management** (Profiles, Role-based Permissions)
* **Project Management** (Create, List, Delete Projects)
* **Code Submissions** (Upload and manage code reviews)
* **Comments** (Threaded comment system for submissions)
* **PostgreSQL Database** with validation
* **TypeScript Support** with Nodemon & ts-node for development
* **Environment Variables Support** using dotenv
* **Static File Serving** for public assets

---

## 📁 Project Structure

```
📦 collaborative-code-review-platform
├── src
│   ├── config
│   │   └── database.ts
│   ├── routes
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── projectRoutes.ts
│   │   ├── submissionRoutes.ts
│   │   └── commentRoutes.ts
│   ├── views
│   │   └── index.html
│   ├── public
│   └── server.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Technologies Used

* **Node.js**
* **Express.js v5**
* **TypeScript**
* **PostgreSQL (pg library)**
* **JWT Authentication**
* **bcryptjs** for password hashing
* **Express Validator** for request validation
* **dotenv** for environment variables
* **Nodemon** for development auto-reload

---

## 📦 Installation

### 1. Clone the repository

```bash
 git clone https://github.com/your-username/collaborative-code-review-platform.git
 cd collaborative-code-review-platform
```

### 2. Install dependencies

```bash
 npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/databasename
JWT_SECRET=your_jwt_secret
```

### 4. Build the project

```bash
 npm run build
```

### 5. Start the server

#### Development Mode:

```bash
 npm run dev
```

#### Production Mode:

```bash
 npm start
```

---

## ▶️ Running the App

After starting the server, visit:

```
http://localhost:5000/
```

The server will also expose the following API routes:

### **Authentication Routes** (`/api/auth`)

* POST `/register`
* POST `/login`

### **User Routes** (`/api/users`)

* GET `/`
* GET `/:id`

### **Project Routes** (`/api/projects`)

* GET `/`
* POST `/`
* DELETE `/:id`

### **Submission Routes** (`/api/submissions`)

* POST `/`
* GET `/project/:projectId`

### **Comment Routes** (`/api/comments`)

* POST `/`
* GET `/submission/:submissionId`

---

## 🧪 Testing Database Connection

A built-in function runs automatically on startup:

```ts
testDbConnection();
```

This verifies a successful PostgreSQL connection.

---



