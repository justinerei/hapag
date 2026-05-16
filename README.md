<div align="center">

<img src="public/images/logo_hapag.svg" alt="Hapag Logo" width="180"/>

# Hapag 🍽️

**Good food, right to your table.**

A multi-restaurant online food ordering web application built for Laguna province, Philippines.

![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Inertia.js](https://img.shields.io/badge/Inertia.js-1.x-9553E9?style=flat)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat&logo=mysql&logoColor=white)

</div>

---

## 📖 About

**Hapag** (Filipino for _dining table_) is a full-stack food ordering platform developed as an academic project for **ITEL 203 — Web Systems and Technologies** at Laguna State Polytechnic University (LSPU). It covers 8 municipalities in Laguna, featuring 6 fictional restaurant brands with multiple branches.

The platform supports **Cash on Pickup** and **Cash on Delivery (COD)** — no payment gateway integration. Delivery is handled directly by the restaurant.

---

## ✨ Features

### For Customers

- 🔍 Browse and search restaurants and menu items across Laguna
- 🛒 Cart system (one restaurant per cart enforced)
- 🎟️ Voucher/promo code support (global and restaurant-specific)
- 📦 Order tracking (Pending → Accepted → Preparing → Ready → Completed)
- ❤️ Favorite restaurants
- 🤖 AI-powered food recommender and chatbot (GROQ/LLaMA)
- 🌤️ Weather-based food suggestions (OpenWeatherMap)
- 📍 Interactive Laguna restaurant map (Leaflet.js)
- 🔔 Real-time order status notifications (Laravel Echo + Reverb)
- 🔐 Google OAuth login

### For Restaurant Owners

- 🏪 Restaurant setup and management (pending admin approval)
- 🍴 Menu item management (add, edit, toggle availability, upload images)
- 📋 Order management pipeline with live incoming order alerts
- 🎟️ Create restaurant-scoped vouchers
- ✍️ AI-generated menu descriptions (GROQ)
- 📊 Sales dashboard and CSV export

### For Admins

- ✅ Restaurant approval/rejection workflow
- 🗂️ Category management (with weather tags)
- 🎟️ Site-wide voucher management
- 📈 Platform analytics (revenue, growth charts, retention rate)
- 💾 One-click database backups

---

## 🛠️ Tech Stack

| Layer           | Technology                    |
| --------------- | ----------------------------- |
| Backend         | Laravel 11, PHP 8.2+          |
| Frontend        | React 18, Inertia.js          |
| Styling         | Tailwind CSS                  |
| Database        | MySQL (via Laragon)           |
| Auth            | Laravel Breeze + Google OAuth |
| Real-time       | Laravel Reverb + Echo         |
| Maps            | Leaflet.js                    |
| AI              | GROQ API (LLaMA 3)            |
| Weather         | OpenWeatherMap API            |
| Dev Environment | Laragon (Windows)             |

---

## 🗂️ User Roles

| Role       | Description                                                      |
| ---------- | ---------------------------------------------------------------- |
| `customer` | Browses restaurants, places orders, manages cart and favorites   |
| `owner`    | Manages their restaurant(s), menu, and incoming orders           |
| `admin`    | Full system oversight — approvals, categories, vouchers, backups |

---

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ and npm
- MySQL (Laragon recommended for Windows)
- GROQ API key
- OpenWeatherMap API key

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/hapag.git
cd hapag
```

**2. Install PHP dependencies**

```bash
composer install
```

**3. Install JS dependencies**

```bash
npm install
```

**4. Set up environment**

```bash
cp .env.example .env
php artisan key:generate
```

**5. Configure your `.env`**

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hapag
DB_USERNAME=root
DB_PASSWORD=

# OpenWeatherMap
OWM_API_KEY=your_key_here
OWM_CITY=Santa Cruz,PH

# GROQ (AI features)
GROQ_API_KEY=your_key_here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost/auth/google/callback

# Laravel Reverb (real-time)
REVERB_APP_ID=hapag
REVERB_APP_KEY=hapag-key
REVERB_APP_SECRET=hapag-secret
```

**6. Run migrations and seed**

```bash
php artisan migrate --seed
```

**7. Link storage**

```bash
php artisan storage:link
```

**8. Start the dev servers**

```bash
# In one terminal — Laravel
php artisan serve

# In another — Vite (React)
npm run dev

# Optional — Reverb (real-time)
php artisan reverb:start
```

Visit `http://localhost:8000` in your browser.

### Seeded Test Accounts

| Role     | Email              | Password |
| -------- | ------------------ | -------- |
| Admin    | admin@hapag.com    | password |
| Owner    | owner@hapag.com    | password |
| Customer | customer@hapag.com | password |

---

## 🍽️ Restaurant Brands

| Brand                      | Cuisine         |
| -------------------------- | --------------- |
| Lutong Bahay ni Aling Rosa | Filipino        |
| Grill Masters PH           | BBQ / Ihaw-Ihaw |
| Kape't Tinapay             | Café            |
| La Preciosa Bakery         | Bakery          |
| Mama Nena's Carinderia     | Filipino        |
| Bida Burger                | Fast Food       |

~25–30 branches spread across: **Santa Cruz, Pagsanjan, Los Baños, Calamba, San Pablo, Bay, Nagcarlan, and Pila**.

---

## 🗄️ Database Schema (Core Tables)

```
users               — Roles, municipality, Google ID, avatar
categories          — Food categories with weather tags
restaurants         — Branches with lat/lng, status, opening hours
menu_items          — Food items with price, availability, image
cart_items          — Active user carts (one restaurant per user)
orders              — Pickup/delivery orders with status pipeline
order_items         — Frozen snapshot of items at checkout
vouchers            — Discount codes (global or restaurant-scoped)
voucher_usages      — One-use-per-customer enforcement
claimed_vouchers    — Vouchers saved by customers
favorites           — Pivot: users ↔ restaurants
system_settings     — Key-value store (e.g., last backup time)
notifications       — Laravel notification log
```

---

## 🤖 AI Features

Powered by **GROQ API (LLaMA 3)**:

- **Food Recommender** — Customer describes a craving; AI picks 2–4 matching dishes from actual menu data
- **Hapag Chatbot** — Conversational assistant with full restaurant/voucher context; responds in Taglish
- **Menu Description Generator** — Owners can auto-generate appetizing item descriptions

---

## 📁 Project Structure (Highlights)

```
app/
  Http/Controllers/     — All route controllers
  Models/               — Eloquent models
  Services/             — BackupService
  Notifications/        — Order & restaurant status notifications
  Events/               — NewOrderPlaced (real-time)
resources/js/
  Pages/                — Inertia React page components
    Home/               — Guest & Customer dashboards
    Owner/              — Owner dashboard, setup, rejected
    Admin/              — Admin dashboard
    Cart/, Checkout/    — Cart and checkout flows
    Orders/, Restaurants/, Search/, Favorites/
  Components/           — Shared UI components
  Layouts/              — CustomerLayout, GuestLayout
database/
  migrations/           — All schema definitions
  seeders/              — Full seeded dataset
```

---

## 🎓 Academic Context

> **School:** Laguna State Polytechnic University - San Pablo City Campus (LSPU - SPCC)

> **Program:** BS Information Technology

| Course   | Description                          | Instructor             |
| -------- | ------------------------------------ | ---------------------- |
| ITEL 203 | Web Systems and Technologies         | Mr. Marlon Boyet Dungo |
| ITEP 204 | Advance Database Systems             | Ms. Sarah Escote       |
| ITEP 206 | Integrative Programming Technologies | Ms. Kristine Ompangco  |

---

## 📄 License

This project is built for academic purposes. All restaurant brands, menu items, and business data are fictional and created solely for this project.
