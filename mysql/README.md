# Papel Educare - MySQL Migration Guide

## Overview
This directory contains the MySQL schema and PHP API to replace Supabase PostgreSQL.

## Directory Structure
```
mysql/
├── schema.sql          # MySQL database schema
├── api/
│   ├── config.php      # Database connection & JWT helpers
│   ├── auth.php        # Authentication endpoints
│   ├── courses.php     # Courses CRUD
│   ├── categories.php  # Categories CRUD
│   ├── teachers.php    # Teachers CRUD
│   ├── enrollments.php # Enrollments management
│   ├── payments.php    # Payment processing
│   └── lessons.php     # Lessons & progress
```

## Setup Instructions

### 1. Create MySQL Database
```sql
CREATE DATABASE papel_educare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Import Schema
```bash
mysql -u your_user -p papel_educare < mysql/schema.sql
```

### 3. Configure API
Edit `mysql/api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'papel_educare');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');

define('JWT_SECRET', 'your-super-secret-jwt-key');

// bKash credentials
define('BKASH_APP_KEY', 'your_bkash_app_key');
define('BKASH_APP_SECRET', 'your_bkash_app_secret');
define('BKASH_USERNAME', 'your_bkash_username');
define('BKASH_PASSWORD', 'your_bkash_password');
```

### 4. Upload API to CyberPanel
1. Upload `mysql/api/` folder to your CyberPanel server
2. Set proper file permissions:
   ```bash
   chmod 644 mysql/api/*.php
   chmod 755 mysql/api/
   ```
3. Configure `.htaccess` for pretty URLs (optional)

### 5. Update Frontend
1. Set API URL in environment:
   ```
   VITE_API_URL=https://your-domain.com/api
   ```

2. Replace Supabase imports with MySQL API:
   ```typescript
   // Before
   import { supabase } from "@/integrations/supabase/client";
   
   // After
   import api from "@/lib/mysql-api";
   ```

## Key Differences from Supabase

### 1. Primary Keys
- Supabase: UUID (`gen_random_uuid()`)
- MySQL: INT AUTO_INCREMENT

### 2. ENUMs
- PostgreSQL: `CREATE TYPE app_role AS ENUM (...)`
- MySQL: `ENUM('student', 'admin', 'teacher')` directly in column

### 3. Authentication
- Supabase: Built-in Auth with JWT
- MySQL: Custom JWT implementation in PHP

### 4. Real-time
- Supabase: Built-in real-time subscriptions
- MySQL: Need to implement polling or WebSockets separately

### 5. Row Level Security (RLS)
- Supabase: Database-level RLS policies
- MySQL: Application-level authorization in PHP

## API Endpoints

### Authentication
- `POST /auth.php?action=register` - Register new user
- `POST /auth.php?action=login` - Login
- `POST /auth.php?action=logout` - Logout
- `GET /auth.php?action=me` - Get current user
- `POST /auth.php?action=forgot-password` - Request password reset
- `POST /auth.php?action=reset-password` - Reset password

### Courses
- `GET /courses.php` - List published courses
- `GET /courses.php?id=1` - Get course by ID
- `GET /courses.php?slug=course-slug` - Get course by slug
- `POST /courses.php` - Create course (admin)
- `PUT /courses.php?id=1` - Update course (admin)
- `DELETE /courses.php?id=1` - Delete course (admin)

### Categories
- `GET /categories.php` - List categories
- `GET /categories.php?slug=slug` - Get category by slug

### Payments
- `POST /payments.php?action=process` - Process manual payment
- `POST /payments.php?action=bkash` - Initiate bKash payment
- `GET /payments.php?action=bkash-callback` - bKash callback

## Security Notes

1. **JWT Secret**: Use a strong, random secret key (at least 32 characters)
2. **HTTPS**: Always use HTTPS in production
3. **Password Hashing**: Uses `password_hash()` with BCRYPT
4. **SQL Injection**: Uses PDO prepared statements
5. **CORS**: Configure properly for your domain

## Migration Steps (Data)

If you have existing data in Supabase, you'll need to:
1. Export data from Supabase
2. Transform UUIDs to INTs
3. Import into MySQL

Example for users:
```sql
-- Create mapping table for UUID to INT
CREATE TEMPORARY TABLE uuid_mapping (
    old_uuid VARCHAR(36),
    new_id INT AUTO_INCREMENT PRIMARY KEY
);

-- Insert and get new IDs
INSERT INTO uuid_mapping (old_uuid) SELECT id FROM supabase_users;

-- Use mapping to insert with new IDs
INSERT INTO users (id, email, password_hash, ...)
SELECT m.new_id, s.email, s.encrypted_password, ...
FROM supabase_users s
JOIN uuid_mapping m ON s.id = m.old_uuid;
```
