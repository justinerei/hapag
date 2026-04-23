# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and AI assistants when working with code in this repository.

---

## 🍽️ Project Identity

**Hapag** — Filipino word for "dining table." Multi-restaurant online food ordering web app for Laguna province, Philippines.
Tagline: *Good food, right to your table.*

**Academic Context:** LSPU College of Computer Studies | Course: ITEL 203 — Web Systems and Technologies

---

## 🎯 What Hapag Is (and Is Not)

- **Hybrid Ordering:** Supports **Cash on Pickup** and **Cash on Delivery (COD)**. Delivery is handled internally by the restaurant (flat fee), no third-party couriers, and no real-time GPS tracking.
- **No payment API:** No Stripe, GCash, PayMongo, or PayPal. It is strictly Cash-based.
- **Fictional restaurant brands:** 6 restaurant brands with multiple branches across 8 Laguna cities. All seeded manually with hardcoded coordinates.
- **No geocoding:** Nominatim was deliberately removed. All `lat`/`lng` values come from the database seeder only.
- **Modern SPA Feel:** Upgraded from Vanilla JS/Blade to a **React + Inertia.js** Single Page Application for a seamless, fast user experience.

---

## 🛠️ Tech Stack

**Backend:**
- Laravel 11 (PHP 8.2+)
- MySQL (via Laragon)
- Laravel Breeze (Authentication)

**Frontend:**
- React 18
- Inertia.js (The bridge connecting Laravel controllers directly to React pages)
- Tailwind CSS (Using default Tailwind utility classes)
- Leaflet.js (For the interactive map)

**External APIs:**
- OpenWeatherMap API (To fetch local weather and filter food categories, e.g., "Rainy" -> Soups)
- GROQ API (LLaMA 3 model for generating AI restaurant/menu descriptions)

---

## 🔐 Roles & Authorization Rules

The system has three distinct user roles (`role` column in the `users` table). **Never mix the dashboards.** Each role has its own protected route group and Inertia pages.

### 1. The Customer (`role: customer`)
- **Access:** Can access the public homepage, view menus, add items to cart, checkout, and view their personal order history.
- **Restriction:** Cannot access `/admin` or `/owner` routes.

### 2. The Restaurant Owner (`role: owner`)
- **Access:** Manages only their specific assigned restaurant branch(es).
- **Responsibilities:**
  - **Menu Management:** Adding items, updating prices, uploading images, and toggling `is_available` to false when sold out.
  - **Order Processing:** Moving orders through the pipeline: `Pending` ➔ `Preparing` ➔ `Ready`.
  - **Delivery Handling:** Must be able to clearly see the **"DELIVERY"** vs **"PICKUP"** badge and the user's `delivery_address` to dispatch their own staff.
  - **Local Vouchers:** Can create vouchers that are strictly locked to their `restaurant_id`.

### 3. The System Admin (`role: admin`)
- **Access:** Full system oversight. Protected by the `/admin` route prefix.
- **Responsibilities:**
  - **Restaurant Approval:** New restaurants default to `status: pending`. The Admin must approve them (`restaurants.approve`) before they appear to customers.
  - **System Data:** Manages global `categories` (adding weather tags) and site-wide `vouchers` (not locked to a specific restaurant).
  - **Maintenance:** Can trigger full database backups via the `/backup` route.

---

## 🎨 UI/UX Color System (Tailwind Mapping)

When generating React components and UI elements, strictly adhere to this exact color mapping. *Do not use arbitrary hex codes outside of this system.*

### 1. Base Colors (Foundation & Typography)
* **Soft White (`bg-gray-50` / `#F9FAFB`)**: Main page backgrounds, sections, elevated cards, modal backgrounds.
* **Pure White (`bg-white` / `#FFFFFF`)**: Layered surfaces (food item cards, navbar, sidebar, dropdowns, inputs).
* **Cool Gray (`border-gray-200` / `#E5E7EB`)**: Card/input borders, menu dividers, disabled states, skeleton loaders.
* **Dark Slate (`text-gray-800` / `#1F2937`)**: Primary text (Headings, menu item names, prices, important labels).
* **Medium Gray (`text-gray-500` / `#6B7280`)**: Secondary text (Food descriptions, metadata, delivery times, placeholders).

### 2. Primary Color (Main Brand Action)
* **Muted Green (`bg-green-500` / `#22C55E`)**: MAIN action color ("Order Now", "Add to Cart", success messages, checkmarks).
* **Hover State (`bg-green-600` / `#16A34A`)**: Button hovers, active click states.
* **Light Green (`bg-green-100` / `#DCFCE7`)**: Success alert backgrounds, selected item highlights.

### 3. Accent Color (Energy & Conversion)
* **Soft Orange (`bg-orange-500` / `#F97316`)**: High attention items (Promo badges, discount tags, urgent CTAs, cart count badge).
* **Hover State (`bg-orange-600` / `#EA580C`)**: Hover on promo buttons, interactive badges.
* **Light Orange (`bg-orange-100` / `#FFEDD5`)**: Promo section backgrounds ("Today's Specials").

### 4. Secondary Accent (Tech Feel & Support)
* **Cool Blue (`text-blue-500` / `#3B82F6`)**: Support interactions (Links, focus states/active borders, secondary buttons, info alerts).
* **Hover State (`text-blue-600` / `#2563EB`)**: Link and secondary button hovers.
* **Light Blue (`bg-blue-100` / `#DBEAFE`)**: Info banners, active input backgrounds.

### 5. Feedback Colors
* **Success:** Green (`green-500` / `green-100`).
* **Error:** Red (`text-red-500` / `border-red-500` / `#EF4444`) for invalid inputs, failures, error alerts.
* **Warning:** Yellow (`text-yellow-400` / `#FACC15`) for delays, stock issues, attention messages.

---

## 🗄️ Database Schema & Core Entities

The system relies on the following core tables:

1. **`users`**: Includes `role` (customer, owner, admin) and `municipality`.
2. **`categories`**: Food categories with a `weather_tag` (rainy, hot, cool, cloudy).
3. **`restaurants`**: The branches. Includes `municipality`, `lat`, `lng`, `opening_time`, `closing_time`, and `image_url`.
4. **`menu_items`**: The food. Includes `price`, `is_available`, and `image_url`.
5. **`cart_items`**: Database-driven cart (not local storage). **Rule:** A user can only have items from ONE restaurant in their cart at a time.
6. **`vouchers`**: Discount codes (percentage or fixed) with `min_order_amount`, `max_uses`, and `expires_at`.
7. **`orders`**: Includes `order_type` (pickup/delivery), `delivery_address`, `total_amount`, and `status` (pending, preparing, ready).
8. **`order_items`**: Snapshot of the menu items purchased and their frozen `unit_price`.
9. **`voucher_usages`**: Tracks which user used which voucher on which order.
10. **`system_settings`**: Key-value store for global settings.
11. **`favorites`**: Pivot table tracking which users favorited which restaurants.

---

## 🧠 Core Business Logic to Preserve

When modifying controllers, strictly adhere to these rules:

### 1. The Cart Rule (`CartController`)
If a user tries to add an item from "Restaurant B" when their cart already has items from "Restaurant A", the system must throw an error or prompt them to clear their current cart.

### 2. The Voucher Validation (6 Conditions)
Before applying a voucher in checkout, the backend MUST verify:
1. Does the code exist and `is_active == true`?
2. Has it expired (`expires_at`)?
3. Has it reached `max_uses`?
4. Is it restricted to a specific `restaurant_id`?
5. Does the cart total meet the `min_order_amount`?
6. Has this specific user already used it? (Check `voucher_usages` table).

### 3. The Checkout Transaction (`OrderController`)
Checkout must be wrapped in a `DB::transaction()`. It must:
1. Create the `Order` (recording Pickup or Delivery fee).
2. Move items from `cart_items` to `order_items`.
3. Increment the voucher `used_count` and log it in `voucher_usages`.
4. Empty the user's `cart_items`.

---

## 📍 Seeded Data Rules (Laguna)

### 8 Covered Municipalities
Santa Cruz, Pagsanjan, Los Baños, Calamba, San Pablo, Bay, Nagcarlan, Pila

### 6 Restaurant Brands
| Brand | Category |
|---|---|
| Lutong Bahay ni Aling Rosa | Filipino 🍜 |
| Grill Masters PH | BBQ / Ihaw-Ihaw 🔥 |
| Kape't Tinapay | Cafe ☕ |
| La Preciosa Bakery | Bakery 🍞 |
| Mama Nena's Carinderia | Filipino 🍜 |
| Bida Burger | Fast Food 🍔 |

### Branching Rules
- **25–30 total branches** spread across the 8 cities
- Not every city has every brand — some cities might only have 3 out of 6
- Each branch is a separate `restaurants` row with its own `id`, owner, coordinates, and menu
- One owner can own multiple branches (franchise model)
- Each branch has **10–15 menu items** seeded
- Branch names follow the pattern: `"Brand Name — Municipality"` (e.g. `"Bida Burger — San Pablo"`)
- Coordinates per branch are hardcoded in the seeder — unique per branch, never geocoded

### Municipality Coordinates (seeder reference)
| Municipality | Approx. Center Lat | Approx. Center Lng |
|---|---|---|
| Santa Cruz | 14.2794 | 121.4117 |
| Pagsanjan | 14.2713 | 121.4559 |
| Los Baños | 14.1692 | 121.2435 |
| Calamba | [Add Lat] | [Add Lng] |
| San Pablo | [Add Lat] | [Add Lng] |
| Bay | [Add Lat] | [Add Lng] |
| Nagcarlan | [Add Lat] | [Add Lng] |
| Pila | [Add Lat] | [Add Lng] |