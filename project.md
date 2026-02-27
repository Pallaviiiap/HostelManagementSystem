# HostelOps – Smart Hostel Complaint & Maintenance Management System

## Project Type
Production-Oriented Full Stack DevOps Deployment Project

---

# 1️⃣ Project Objective

This project demonstrates production-ready deployment of a containerized full-stack complaint management system using:

- React (Frontend)
- Node.js + Express (Backend)
- MySQL (Database)
- Docker & Docker Compose
- Nginx Reverse Proxy
- AWS EC2 Deployment

Focus is on DevOps quality, not UI complexity.

---

# 2️⃣ High-Level Architecture

Client → Port 80 → Nginx → Express Backend → MySQL

- Only Nginx is publicly exposed.
- Backend and MySQL run inside Docker network.
- Backend port (5000) must NOT be public.
- MySQL port (3306) must NOT be public.

---

# 3️⃣ Technology Stack

Frontend:
- React (Vite)
- Axios
- React Router
- Functional Components with Hooks

Backend:
- Node.js
- Express.js
- mysql2 (promise-based)
- JWT Authentication
- bcrypt for password hashing
- dotenv for environment variables

Database:
- MySQL 8

DevOps:
- Docker
- Docker Compose
- Nginx Reverse Proxy
- AWS EC2 (Ubuntu)

---

# 4️⃣ Functional Scope

## Student Features
- Register
- Login
- Submit complaint (category, description, priority)
- View own complaints

## Admin Features
- View all complaints
- Update complaint status
- Filter complaints by category or status

---

# 5️⃣ Database Schema

## Users Table
- id (Primary Key)
- name
- email (Unique)
- password (Hashed)
- role (student/admin)
- created_at

## Complaints Table
- id (Primary Key)
- user_id (Foreign Key → users.id)
- category
- description
- priority (low/medium/high)
- status (pending/in-progress/resolved)
- created_at

---

# 6️⃣ Code Architecture Requirements

Backend must follow MVC structure:

backend/
- config/
- controllers/
- routes/
- middleware/
- models/
- server.js

Requirements:
- Use async/await
- Proper error handling middleware
- Role-based access control
- No hardcoded credentials
- Use environment variables only
- Clean modular code

---

# 7️⃣ Security Requirements

- Only Port 80 exposed publicly (via Nginx).
- Backend (5000) internal only.
- Database (3306) internal only.
- JWT-based route protection.
- Passwords must be hashed.
- Use .env file for configuration.

AWS Security Group:
- Allow 22 (SSH)
- Allow 80 (HTTP)
- Block all other ports

---

# 8️⃣ Docker Architecture

Services:
- nginx
- backend
- mysql

Rules:
- Use Docker Compose
- Use internal service names (e.g., backend, mysql)
- Use restart: always
- Use environment variables
- No hardcoded IP addresses

---

# 9️⃣ Production Expectations

- Clean container lifecycle
- Proper logging visibility
- Restart resilience
- Structured documentation
- Clear explanation of request lifecycle

---

# 🔟 Request Lifecycle

1. User accesses EC2 Public IP
2. Traffic hits Port 80
3. Nginx receives request
4. Nginx routes /api to backend service
5. Backend processes request
6. Backend queries MySQL
7. Response returns via Nginx
8. Client receives response

---

# 11️⃣ Serverful vs Serverless (Conceptual Understanding)

Serverful:
- You manage infrastructure.
- Example: AWS EC2.
- Used in this project.

Serverless:
- Cloud manages infrastructure.
- Example: AWS Lambda.
- Not used in this project.

---

# 12️⃣ Important Development Rules

- Application must work locally before Docker.
- Docker must work locally before AWS deployment.
- Never expose database publicly.
- Keep architecture production-oriented.
- Prioritize DevOps best practices over UI styling.