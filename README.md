📚 Chapter 4 – Your Next Chapter in Reading

Chapter 4 is a modern, full-featured online bookstore designed to make book shopping smarter, faster, and fully digital.
Built using React (Frontend), .NET Core Web API (Backend), and SQLite (Database), the platform offers a seamless reading and shopping experience tailored for today’s readers.

🧩 Overview

In an era where physical bookstores struggle to keep up with modern demands, Chapter 4 bridges the gap by offering:

A wide catalog of books

Personalized recommendations

Powerful search & filtering

Digital engagement features

Secure ordering & user-friendly interface

This repository contains the complete source code for the project (Frontend + Backend).

🎯 Target Audience

Students looking for academic books, references, or study guides

Working professionals seeking self-improvement or career-related material

Avid readers across fiction, non-fiction, and niche genres

People in remote areas with limited access to bookstores

❌ Problem Statement

Readers today face several challenges:

🚫 Limited access to physical bookstores

🚫 Outdated or unavailable inventory

🚫 No personalized book suggestions

🚫 Long wait times or lack of delivery in remote areas

✅ Our Solution

Chapter 4 solves these issues with a robust digital bookstore offering:

✔ Wide Book Collection

Academic, fiction, non-fiction, self-help, competitive exam preparation, and more.

✔ Real-Time Stock Availability

Always see what can be ordered instantly.

✔ Reviews & Ratings

Buy confidently with community feedback.

✔ Personalized Suggestions

Get book recommendations based on reading patterns.

✔ Secure & Fast Checkout

Smooth ordering with coupon support, rewards, and discounts.

✔ Extra Engagement Features

🎡 Spin & Win rewards

🎟 Discount Coupons

⭐ User Experiences

💬 Live Chat

📝 Monthly Quiz

🛒 Wishlist

📦 Order History

🚀 Features
🧑‍🤝‍🧑 User Features

User authentication (Signup/Login)

Browse books by category

Detailed book pages with reviews

Add to cart / wishlist

Apply coupons

Secure checkout

Track order history

Spin & Win wheel (dynamic rewards)

Monthly quiz

User experiences & reviews

Live chat with admin

Responsive UI for all devices

🛠 Admin Features

Dashboard overview

Manage books (add/edit/delete)

Manage categories

Manage users

Manage orders

Manage coupons

Manage popups

Manage reviews

Manage quiz questions

Manage user experiences

View sales, earnings & stock reports

Spin Wheel Management:

Add/Edit/Delete spin options

Activate/Deactivate rewards

Set spin order

View all user spin rewards

🏗 Tech Stack
🖥 Frontend

React.js

React Router

Context API

Axios

CSS

⚙ Backend

.NET Core Web API

Entity Framework Core

LINQ

🗄 Database

SQLite

📦 Installation & Setup
🔧 Backend Setup (.NET API)
cd Ecommerce-Bookstore/backend
dotnet restore
dotnet ef database update
dotnet run


Backend will start at:
👉 https://localhost:5001

🌐 Frontend Setup (React)
cd Ecommerce-Bookstore/frontend
npm install
npm start


Frontend will start at:
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
│   │   ├── App.js
│   └── package.json
│
└── README.md

🔌 API Endpoints
📘 Books
| Method | Endpoint     | Description      |
| ------ | ------------ | ---------------- |
| GET    | `/api/books` | Get all books    |
| POST   | `/api/books` | Add book (Admin) |

🛒 Orders
| Method | Endpoint                   | Description |
| ------ | -------------------------- | ----------- |
| POST   | `/api/orders`              | Place order |
| GET    | `/api/orders/user/{email}` | User orders |

🎡 Spin & Win
| Method | Endpoint                 | Description                 |
| ------ | ------------------------ | --------------------------- |
| POST   | `/api/spin/spin/{email}` | Perform spin                |
| GET    | `/api/spin-options`      | Admin: Get all spin options |
| POST   | `/api/spin-options`      | Admin: Add option           |

🎟 Coupons

| GET | /api/coupons |

📬 Contributing

We welcome contributions!
Follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/NewFeature)
3. Commit changes (git commit -m "Added new feature")
4. Push to branch (git push origin feature/NewFeature)
5. Open a Pull Request

🎉 Conclusion

Chapter 4 is not just an online bookstore — it’s a complete digital reading ecosystem built for modern users.
With its clean UI, smooth UX, smart recommendations, reward systems, and admin-controlled backend, it delivers a complete end-to-end eCommerce experience.