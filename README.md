# 📚 Chapter 4 – Your Next Chapter in Reading

**Chapter 4** is a modern, full-featured online bookstore designed to make book shopping smarter, faster, and completely digital.  
Built using **React (Frontend)**, **.NET Core Web API (Backend)**, and **SQLite (Database)**, the platform delivers a seamless reading and shopping experience tailored for today’s readers.

---

## 🧩 Overview

In a time when physical bookstores struggle to meet modern expectations, **Chapter 4** bridges the gap through:

- A wide and diverse catalog of books  
- Personalized recommendations  
- Powerful search & filtering  
- Engaging digital features  
- Smooth ordering & secure payments  

This repository contains the **complete source code (Frontend + Backend)** of the project.

---

## 🎯 Target Audience

- Students searching for academic books  
- Working professionals seeking career or self-improvement content  
- Avid readers across all genres  
- People in remote locations with limited bookstore access  

---

## ❌ Problem Statement

Modern readers face challenges such as:

- 🚫 Limited access to book stores  
- 🚫 Outdated or unavailable inventory  
- 🚫 No personalized suggestions  
- 🚫 Long delivery delays, especially in remote regions  

---

## ✅ Our Solution

Chapter 4 solves these problems through:

### ✔ Wide Book Collection
Academic, fiction, non-fiction, self-help, exam prep, and more.

### ✔ Real-Time Stock Availability
Know exactly what’s available.

### ✔ Reviews & Ratings
Make informed buying decisions.

### ✔ Personalized Suggestions
Smart recommendations based on user activity.

### ✔ Secure & Fast Checkout
Includes coupons, discounts, and Spin & Win rewards.

### ✔ Engagement Features
- 🎡 Spin & Win  
- 🎟 Discount Coupons  
- ⭐ User Experiences  
- 💬 Live Chat  
- 📝 Monthly Quiz  
- 🛒 Wishlist  
- 📦 Order History  

---

## 🚀 Features

### 👤 **User Features**
- User authentication (Signup/Login)  
- Browse books by categories  
- Detailed book pages with reviews  
- Add to cart / wishlist  
- Apply coupons  
- Secure checkout  
- Track order history  
- **Spin & Win Wheel (dynamic admin-controlled rewards)**  
- Monthly quiz  
- User experiences & reviews  
- Live chat with admin  
- Fully responsive UI  

---

### 🛠 **Admin Features**
- Admin dashboard  
- Manage books (add/edit/delete)  
- Manage categories  
- Manage users  
- Manage orders  
- Manage discount coupons  
- Manage popups  
- Manage reviews  
- Manage quiz questions  
- Manage user experiences  
- View **sales**, **earnings**, and **stock** reports  

### 🎡 Spin Wheel Management
- Add/Edit/Delete spin options  
- Activate/Deactivate rewards  
- Set spin order  
- View all user spin results  

---

## 🏗 Tech Stack

### 🖥 Frontend
- React.js  
- React Router  
- Context API  
- Axios  
- CSS  

### ⚙ Backend
- .NET Core Web API  
- Entity Framework Core  
- LINQ  

### 🗄 Database
- SQLite  

---

## 📦 Installation & Setup

### 🔧 Backend Setup (.NET API)
```sh
cd Ecommerce-Bookstore/backend
dotnet restore
dotnet ef database update
dotnet run

Backend runs at:
👉 https://localhost:5001

cd Ecommerce-Bookstore/frontend
npm install
npm start

Frontend runs at:
👉 http://localhost:3000

📁 Folder Structure
Ecommerce-Bookstore/
│
├── backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Data/
│   └── Program.cs / Startup.cs
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
│
└── README.md

🔌 API Endpoints

📘 Books
| Method | Endpoint     | Description          |
| ------ | ------------ | -------------------- |
| GET    | `/api/books` | Get all books        |
| POST   | `/api/books` | Add new book (Admin) |

🛒 Orders
| Method | Endpoint                   | Description     |
| ------ | -------------------------- | --------------- |
| POST   | `/api/orders`              | Place order     |
| GET    | `/api/orders/user/{email}` | User order list |

🎡 Spin & Win
| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| POST   | `/api/spin/spin/{email}` | Perform spin            |
| GET    | `/api/spin-options`      | Admin: get spin options |
| POST   | `/api/spin-options`      | Admin: add spin option  |

🎟 Coupons
| Method | Endpoint       | Description     |
| ------ | -------------- | --------------- |
| GET    | `/api/coupons` | Get all coupons |

🤝 Contributing

We welcome all contributions!

Fork the repository

Create your feature branch

git checkout -b feature/NewFeature


Commit your changes

git commit -m "Added new feature"


Push to your branch

git push origin feature/NewFeature

5.Open a Pull Request

🎉 Conclusion

Chapter 4 is more than just an online bookstore —
it is a complete digital reading ecosystem built for modern users.

With its clean UI, smooth UX, intelligent recommendations, rewards, and admin-powered backend, Chapter 4 delivers a full end-to-end eCommerce experience for book lovers everywhere.