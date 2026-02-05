# Deploy School Library API on Render with Aiven MySQL

Step-by-step guide to host your School Library API on Render using Aiven for MySQL.

---

## Prerequisites

- [ ] GitHub account
- [ ] Render account ([render.com](https://render.com))
- [ ] Aiven account ([aiven.io](https://aiven.io))
- [ ] Code pushed to a GitHub repository

---

## Part 1: Set Up Aiven MySQL Database

### Step 1.1: Create an Aiven Account

1. Go to [aiven.io](https://aiven.io) and sign up (free tier available).
2. Verify your email and log in.

### Step 1.2: Create a MySQL Service

1. In the Aiven Console, click **Create service**.
2. Select **MySQL**.
3. Choose your **Cloud provider** and **Region** (e.g. AWS, us-east-1).
4. Select a **Plan** (e.g. Free tier if available, or Hobby).
5. Enter a **Service name** (e.g. `school-library-db`).
6. Click **Create service**.
7. Wait for the service to become **Running** (a few minutes).

### Step 1.3: Get Connection Details

1. Open your MySQL service.
2. Go to the **Overview** tab.
3. In **Connection information**, note:
   - **Host**
   - **Port** (usually `25060` for Aiven)
   - **User** (default: `avnadmin`)
   - **Password** (click **Show** to reveal)
   - **Database name** (default: `defaultdb` or create one)

### Step 1.4: Download CA Certificate (Required for SSL)

1. On the same **Overview** page, find **Connection information**.
2. Click **Download CA certificate** (or **Download certificate**).
3. Save the file (e.g. `ca.pem`).
4. You will use this for secure SSL connection from Render.

### Step 1.5: Create Database and Tables

1. Connect to your Aiven MySQL (via Aiven’s web terminal, MySQL Workbench, or CLI).
2. Create your database (if not using default):

```sql
CREATE DATABASE IF NOT EXISTS school_library_db;
USE school_library_db;
```

3. Create the required tables:

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book categories table
CREATE TABLE book_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Books table
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category_id INT,
  isbn VARCHAR(50),
  total_copies INT DEFAULT 0,
  available_copies INT DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES book_category(id)
);

-- Optional: Insert sample category
INSERT INTO book_category (name) VALUES ('Fiction'), ('Non-Fiction'), ('Science');
```

---

## Part 2: Prepare Your Code for Render

### Step 2.1: Add Start Script

In `package.json`, add a `start` script:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

### Step 2.2: Use PORT Environment Variable

In `src/index.js`, change the server listen to:

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
```

### Step 2.3: Update Database Connection for Aiven (SSL)

Aiven requires SSL. Update `src/db.js` to support SSL:

```javascript
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Add SSL for Aiven (when CA_CERT is set)
if (process.env.CA_CERT) {
  connectionConfig.ssl = {
    ca: process.env.CA_CERT.replace(/\\n/g, '\n'),
    rejectUnauthorized: true
  };
}

const connection = mysql.createConnection(connectionConfig);

connection.connect((err) => {
  if (err) {
    console.log('Error connecting to database', err);
  } else {
    console.log('Connected to database');
  }
});

module.exports = { connection };
```

### Step 2.4: Store CA Certificate for Render

**Option A – Environment variable (recommended):**

1. Open your downloaded `ca.pem` in a text editor.
2. Copy the entire content (including `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`).
3. You will paste this into Render as `CA_CERT` (see Part 3).

**Option B – File in repo (less secure):**

- Add `ca.pem` to your project and reference it in code. Not recommended for public repos.

---

## Part 3: Deploy on Render

### Step 3.1: Push Code to GitHub

1. Ensure all changes are committed.
2. Push to your GitHub repository:

```bash
git add .
git commit -m "Prepare for Render deployment with Aiven"
git push origin main
```

### Step 3.2: Create Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect GitHub if not already connected.
4. Select your `school_library_api` repository.
5. Click **Connect**.

### Step 3.3: Configure the Web Service

| Setting | Value |
|---------|-------|
| **Name** | `school-library-api` (or your choice) |
| **Region** | Choose closest to your Aiven region |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or paid if needed) |

### Step 3.4: Add Environment Variables

In the **Environment** section, add:

| Key | Value | Notes |
|-----|-------|-------|
| `DB_HOST` | Your Aiven host | e.g. `school-library-db-xxx.aivencloud.com` |
| `DB_PORT` | `25060` | Aiven default (check your service) |
| `DB_USER` | `avnadmin` | Or your custom user |
| `DB_PASSWORD` | Your Aiven password | From connection info |
| `DB_NAME` | `school_library_db` | Or `defaultdb` |
| `JWT_SECRET_KEY` | Strong random string | e.g. generate with `openssl rand -hex 32` |
| `JWT_EXPIRES` | `1d` | Token expiry |
| `CA_CERT` | Paste full CA certificate | From `ca.pem` (including BEGIN/END lines) |

**Important for `CA_CERT`:**

- Paste the entire certificate as a single value.
- If Render escapes newlines, you may need to use `\n` between lines.
- Or use a single line with `\n` where line breaks should be.

### Step 3.5: Deploy

1. Click **Create Web Service**.
2. Render will build and deploy.
3. Check the **Logs** tab for errors.
4. When deployment succeeds, your API URL will look like:  
   `https://school-library-api-xxxx.onrender.com`

---

## Part 4: Verify Deployment

### Step 4.1: Test Endpoints

1. **Health check:**
   ```
   GET https://your-app.onrender.com/
   ```
   Expected: `📚 Welcome to School Library API Server`

2. **Swagger docs:**
   ```
   https://your-app.onrender.com/api-docs
   ```

3. **Register a user:**
   ```
   POST https://your-app.onrender.com/api/user/register
   Content-Type: application/json

   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123",
     "role": "librarian"
   }
   ```

4. **Login:**
   ```
   POST https://your-app.onrender.com/api/user/login
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

5. **Get books:**
   ```
   GET https://your-app.onrender.com/api/books
   ```

---

## Part 5: Troubleshooting

### Database connection fails

- Confirm `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` match Aiven.
- Ensure `CA_CERT` is set and correctly formatted.
- Check Aiven **Service** → **Networking** → **Public access** is enabled.
- Verify your Aiven service is **Running**.

### "Invalid token" or JWT errors

- Ensure `JWT_SECRET_KEY` is set in Render.
- Use a long, random value (e.g. 32+ characters).

### App sleeps on Free tier

- Render free instances spin down after ~15 minutes of inactivity.
- First request after sleep can take 30–60 seconds.
- Consider upgrading for always-on service.

### SSL certificate errors

- Re-download the CA certificate from Aiven.
- Ensure no extra spaces or truncated content in `CA_CERT`.
- Try `rejectUnauthorized: false` only for debugging, then switch back to `true`.

---

## Quick Reference: Environment Variables

```
DB_HOST=<aiven-host>
DB_PORT=25060
DB_USER=avnadmin
DB_PASSWORD=<your-password>
DB_NAME=school_library_db
JWT_SECRET_KEY=<strong-random-string>
JWT_EXPIRES=1d
CA_CERT=<paste-full-ca-certificate>
```

---

## Summary Checklist

- [ ] Aiven MySQL service created and running
- [ ] Database and tables created on Aiven
- [ ] CA certificate downloaded from Aiven
- [ ] `start` script added to `package.json`
- [ ] `PORT` from env used in `src/index.js`
- [ ] `db.js` updated for SSL with `CA_CERT`
- [ ] Code pushed to GitHub
- [ ] Render Web Service created and connected to repo
- [ ] All environment variables set in Render
- [ ] Deployment successful and endpoints tested
