# 🛍️ ShopHub — ระบบร้านค้าออนไลน์

ระบบ E-Commerce แบบ Full-Stack พร้อม Authentication, Admin Dashboard และระบบอัปโหลดรูปสินค้า

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcryptjs |
| Upload | Multer |
| Frontend | HTML + CSS + Vanilla JS |

---

## โครงสร้างโปรเจกต์

```
shopping/
├── server.js               ← Entry point
├── package.json
├── .env                    ← Config (ไม่ commit ขึ้น git)
├── .gitignore
│
├── config/
│   └── db.js               ← MongoDB connection
│
├── middleware/
│   └── auth.js             ← JWT verify + Admin guard
│
├── models/
│   ├── User.js             ← User schema
│   └── Product.js          ← Product schema
│
├── routes/
│   ├── auth.js             ← POST /api/auth/register|login
│   └── products.js         ← CRUD /api/products
│
└── public/                 ← Static frontend
    ├── index.html          ← หน้าร้านค้า
    ├── login.html          ← หน้า Login
    ├── register.html       ← หน้า Register
    ├── admin.html          ← Admin Dashboard
    ├── uploads/            ← รูปสินค้าที่อัปโหลด
    ├── css/
    │   └── style.css
    └── js/
        ├── common.js       ← Auth helpers, API wrapper, Toast
        ├── main.js         ← Shop page
        ├── auth.js         ← Login / Register
        └── admin.js        ← Admin CRUD
```

---

## การติดตั้ง

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า .env

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=<app>
JWT_SECRET=your_secret_key
PORT=5000
ADMIN_EMAIL=admin@shophub.com
ADMIN_PASSWORD=Admin1234!
ADMIN_NAME=Administrator
```

### 3. รัน Server

```bash
# Production
node server.js

# Development (auto-restart)
npm run dev
```

เปิด browser ไปที่ **http://localhost:5000**

---

## API Endpoints

### Auth

| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|--------|----------|--------|----------|
| POST | `/api/auth/register` | Public | สมัครสมาชิก |
| POST | `/api/auth/login` | Public | เข้าสู่ระบบ |
| GET | `/api/auth/me` | User | ดูข้อมูลตัวเอง |

### Products

| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|--------|----------|--------|----------|
| GET | `/api/products` | Public | ดูสินค้าทั้งหมด |
| GET | `/api/products/:id` | Public | ดูสินค้าชิ้นเดียว |
| POST | `/api/products` | Admin | เพิ่มสินค้า |
| PUT | `/api/products/:id` | Admin | แก้ไขสินค้า |
| DELETE | `/api/products/:id` | Admin | ลบสินค้า |

#### Query Parameters (GET /api/products)

```
?category=electronics   ← กรองหมวดหมู่
?search=หูฟัง           ← ค้นหา
?sort=price-asc         ← เรียง (price-asc, price-desc, name-asc, rating, newest)
?page=1&limit=20        ← Pagination
```

---

## หน้าเว็บ

| URL | คำอธิบาย |
|-----|----------|
| `/` | หน้าร้านค้าหลัก |
| `/login.html` | เข้าสู่ระบบ |
| `/register.html` | สมัครสมาชิก |
| `/admin.html` | Admin Dashboard (Admin เท่านั้น) |

---

## บัญชี Admin (สร้างอัตโนมัติครั้งแรก)

```
Email:    admin@shophub.com
Password: Admin1234!
```

> เปลี่ยนรหัสผ่านใน `.env` ก่อน deploy จริง

---

## ฟีเจอร์

- ✅ สมัครสมาชิก / เข้าสู่ระบบ (JWT)
- ✅ Admin เพิ่ม / แก้ไข / ลบสินค้า
- ✅ อัปโหลดรูปสินค้า (JPG, PNG, WEBP ≤ 5MB)
- ✅ ค้นหา / กรองหมวดหมู่ / เรียงสินค้า
- ✅ ตะกร้าสินค้า (localStorage)
- ✅ รายการโปรด (Wishlist)
- ✅ Seed ข้อมูล 20 สินค้าตั้งต้นอัตโนมัติ
- ✅ Responsive รองรับมือถือ

---

## MongoDB Atlas Setup

1. สร้าง Cluster ที่ [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Network Access** → Add IP `0.0.0.0/0`
3. **Database Access** → สร้าง user พร้อม password
4. **Connect** → Drivers → copy connection string ใส่ `.env`
