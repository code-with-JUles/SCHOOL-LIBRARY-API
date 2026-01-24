# 🧪 BACKEND TRAINING ASSIGNMENT  
## Authentication & Authorization API (Node.js + MySQL)

---

## 📌 Scenario

You are a **Junior Backend Developer** working for a company that needs a simple internal system to manage **company announcements**.

The system must support:
- User registration and login
- Authentication using JWT
- Authorization based on user roles
- CRUD operations on announcements

---

## 🗄️ Database Tables  
⚠️ You must use **ONLY TWO TABLES**

### 1️⃣ users
- id
- name
- email
- password
- role (`admin` or `employee`)
- created_at

### 2️⃣ announcements
- id
- title
- message
- created_by (user id)
- created_at
- updated_at

---

## 🔐 Authentication Requirements

- Implement **user registration**
  - Password must be **hashed**
- Implement **user login**
  - Login must return a **JWT token**

---

## 🔑 Authorization Rules

| Action | Authentication | Authorization |
|------|----------------|---------------|
| Register | ❌ No | ❌ No |
| Login | ❌ No | ❌ No |
| View announcements | ❌ No | ❌ No |
| Create announcement | ✅ Yes | Any logged-in user |
| Update announcement | ✅ Yes | Any logged-in user |
| Delete announcement | ✅ Yes | **Admin only** |

---

## 📡 Required API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Announcements
- `GET /api/announcements`
- `POST /api/announcements` → Authenticated
- `PUT /api/announcements/:id` → Authenticated
- `DELETE /api/announcements/:id` → Authenticated + Admin only

---

## 🧠 Technical Requirements

- Node.js
- Express
- MySQL
- JWT for authentication
- bcrypt for password hashing
- Authentication middleware
- Authorization middleware (admin role)

---

## 🧪 Testing Requirements

1. Create one **admin** user
2. Create one **employee** user
3. Login both users and obtain JWT tokens
4. Verify:
   - Employee ❌ cannot delete announcements
   - Admin ✅ can delete announcements

---

## 📦 Submission Instructions

- Push the complete project to **GitHub**
- Repository must include:
  - Source code
  - Database schema (SQL)
  - API test evidence (Postman collection or screenshots)

---

## ⏰ Deadline

**Tomorrow at 18:00 PM**

Late submissions will not be accepted.

---

## ⭐ Bonus (Optional)

- Prevent users from updating announcements created by other users
- Add request body validation
