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

**Hapag** (Filipino for _dining table_) is a full-stack food ordering platform developed as an academic project at Laguna State Polytechnic University - San Pablo City Campus (LSPU - SPCC). It covers 8 municipalities in Laguna, featuring 6 fictional restaurant brands with multiple branches.

The platform supports **Cash on Pickup** and **Cash on Delivery (COD)** — no payment gateway integration. Delivery is handled directly by the restaurant.

---

## ✨ Features

### For Guests

- 🌐 Browse restaurants and menus without an account
- 🗺️ View interactive Laguna restaurant map (Leaflet.js)
- 🔍 Search restaurants and dishes
- 📄 View the Partner with Us / Owner FAQ pages

### For Customers

- 🔍 Browse and search restaurants and menu items across Laguna
- 🛒 Cart system (one restaurant per cart enforced)
- 🎟️ Voucher/promo code support — claim and apply global or restaurant-specific codes
- 📦 Order tracking (Pending → Accepted → Preparing → Ready → Completed)
- 🚚 Pickup or Cash on Delivery ordering with optional scheduling
- ❤️ Favorite restaurants
- 🤖 AI-powered food recommender and chatbot (GROQ/LLaMA) with Taglish personality
- 🌤️ Weather-based food suggestions (OpenWeatherMap)
- 📍 Interactive Laguna restaurant map (Leaflet.js)
- 🔔 Real-time order status notifications (Laravel Echo + Reverb)
- 🔐 Google OAuth login or standard email/password registration
- 🧭 Onboarding tour for first-time users
- 👤 Profile management (avatar upload, municipality, address)

### For Restaurant Owners

- 🏪 Restaurant setup and management (pending admin approval workflow)
- 🔄 Reapply after rejection with updated information
- 🍴 Menu item management (add, edit, toggle availability, upload images)
- 📋 Order management pipeline with live incoming order alerts (Reverb)
- 🎟️ Create restaurant-scoped vouchers
- ✍️ AI-generated menu item descriptions (GROQ)
- 📊 Sales dashboard with revenue, order stats, and top items
- 📁 Sales data export (filtered by today / week / month / all time)
- ⚙️ Restaurant settings (name, hours, category, image, municipality)
- 🧭 Owner onboarding tour for first-time dashboard visit

### For Admins

- ✅ Restaurant approval/rejection workflow with optional rejection reason
- 🗂️ Category management (with weather tags for food suggestions)
- 🎟️ Site-wide voucher management
- 📈 Platform analytics — revenue, growth charts, order heatmap, retention rate, top restaurants, top menu items, municipality breakdown, owner performance
- 💾 One-click database backups (downloadable `.sql` files)
- 🗃️ View and download past backup files

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

> Guests (unauthenticated users) can browse restaurants, view menus, and use the map — but cannot place orders or access any protected features.

---

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ and npm
- MySQL (Laragon recommended for Windows)
- GROQ API key
- OpenWeatherMap API key
- Google OAuth credentials (optional — only needed for Google login)

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
DEFAULT_CITY=Santa Cruz,PH

# GROQ (AI features)
GROQ_API_KEY=your_key_here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback

# Laravel Reverb (real-time notifications)
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
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
# Terminal 1 — Laravel
php artisan serve

# Terminal 2 — Vite (React hot reload)
npm run dev

# Terminal 3 — Reverb (real-time, optional but needed for live order notifications)
php artisan reverb:start
```

Visit `http://127.0.0.1:8000` in your browser.

---

### Seeded Test Accounts

| Role     | Email            | Password |
| -------- | ---------------- | -------- |
| Admin    | admin@hapag.com  | password |
| Owner    | owner1@hapag.com | password |
| Owner    | owner2@hapag.com | password |
| Customer | juan@example.com | password |
| Customer | ana@example.com  | password |

> There are **15 owner accounts** (`owner1@hapag.com` through `owner15@hapag.com`) and **30 customer accounts** seeded. All use `password` as the password.

### Seeded Voucher Codes

| Code       | Type       | Value | Scope     | Min. Order |
| ---------- | ---------- | ----- | --------- | ---------- |
| `HAPAG20`  | Percentage | 20%   | Site-wide | ₱200       |
| `KAINDITO` | Fixed      | ₱50   | Site-wide | —          |

> Additional restaurant-specific vouchers are also seeded. Check the app's Promos section per restaurant to discover them.

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

> All restaurant brands, menu items, and business data are **fictional** and created solely for this project. No real geocoding — all coordinates are hardcoded per branch in the seeder.

---

## 🗄️ Database Schema (Core Tables)

```
users               — Roles, municipality, Google ID, avatar, onboarding flags
categories          — Food categories with weather tags (rainy, hot, cool, cloudy)
restaurants         — Branches with lat/lng, status, opening/closing hours, rejection reason
menu_items          — Food items with price, availability, image
cart_items          — Active user carts (one restaurant per user enforced)
orders              — Pickup/delivery orders with full status pipeline + scheduling
order_items         — Frozen snapshot of items and prices at checkout
vouchers            — Discount codes (percentage or fixed, global or restaurant-scoped)
voucher_usages      — One-use-per-customer enforcement
claimed_vouchers    — Vouchers saved/claimed by customers from menu page
favorites           — Pivot: users ↔ restaurants
system_settings     — Key-value store (e.g. last backup timestamp and filename)
notifications       — Laravel notification log (order + restaurant status updates)
```

---

## 🤖 AI Features

Powered by **GROQ API (LLaMA 3.1 8B Instant)**:

- **Food Recommender** — Customer describes a craving; AI picks 2–4 matching dishes from actual live menu data with item cards
- **Hapag Chatbot** — Conversational assistant aware of restaurants, menus, and active vouchers; responds in Taglish; municipality-aware (prioritizes local restaurants)
- **Menu Description Generator** — Owners can auto-generate appetizing item descriptions from just the item name and category

---

## 💾 Database Backup

The admin can trigger a full database backup from the Admin Dashboard. Backups are:

- Stored as `.sql` files in `storage/app/private/backups/`
- Named `hapag_backup_YYYY-MM-DD_HH-MM-SS.sql`
- Downloadable directly from the dashboard
- Also run automatically via Laravel Scheduler daily at **7:00 AM**

To enable the scheduler on Windows, a `run-scheduler.vbs` script is included in the project root. Set it up as a Windows Task Scheduler job to run every minute.

---

## 📁 Project Structure (Highlights)

```
app/
  Http/Controllers/     — All route controllers
  Models/               — Eloquent models
  Services/             — BackupService (pure PHP SQL export)
  Notifications/        — OrderStatusUpdated, RestaurantStatusUpdated
  Events/               — NewOrderPlaced (real-time broadcast)
resources/js/
  Pages/
    Home/               — Guest & Customer dashboards
    Owner/              — Dashboard, Setup, PendingApproval, Rejected
    Admin/              — Admin dashboard with analytics
    Cart/, Checkout/    — Cart and checkout flows
    Orders/             — Customer order history
    Restaurants/        — Restaurant listing and menu page
    Search/             — Full search results
    Favorites/          — Saved restaurants
    Profile/            — Profile edit page
  Components/           — Shared UI (Modal, SignInModal, SignUpModal, AIChatWidget, Skeleton, etc.)
  Layouts/              — CustomerLayout, GuestLayout
  Hooks/                — useNotification.js
database/
  migrations/           — All schema definitions
  seeders/              — Full seeded dataset (1 admin, 15 owners, 30 customers, 6 brands)
routes/
  web.php               — All application routes
  channels.php          — Private broadcast channel authorization
storage/
  app/private/backups/  — Database backup files
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
