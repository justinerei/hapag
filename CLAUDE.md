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
- Tailwind CSS (No component libraries like Bootstrap; pure Tailwind utility classes)
- Leaflet.js (For the interactive map)

**External APIs:**
- OpenWeatherMap API (To fetch local weather and filter food categories, e.g., "Rainy" -> Soups)
- GROQ API (LLaMA 3 model for generating AI restaurant/menu descriptions)

---

## 🗄️ Database Schema & Core Entities

The system relies on the following core tables (updated with recent improvisations):

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
1. Create the `Order`.
2. Move items from `cart_items` to `order_items`.
3. Increment the voucher `used_count` and log it in `voucher_usages`.
4. Empty the user's `cart_items`.

---

## 🎨 Frontend Guidelines (React + Inertia)

- **Routing:** All page views should be rendered via `Inertia::render('PageName')` in Laravel Controllers.
- **Styling:** Adhere strictly to the established Tailwind configuration (`hapag-red`, `hapag-ink`, `hapag-cream`, etc.).
- **State Management:** Use React `useState` and `useEffect` for local UI state (like modals and tabs). Use Inertia's `useForm` for all form submissions (Login, Cart, Checkout).
- **Reusable Components:** Break down UI elements like `<RestaurantCard />`, `<MenuItem />`, and `<CartDrawer />` to keep pages clean.

---

## 📍 Seeded Data Rules (Laguna)

- **8 Covered Municipalities:** Santa Cruz, Pagsanjan, Los Baños, Calamba, San Pablo, Bay, Nagcarlan, Pila.
- **6 Restaurant Brands:** Lutong Bahay ni Aling Rosa (Filipino), Grill Masters PH (BBQ), Kape't Tinapay (Cafe), La Preciosa Bakery, Mama Nena's Carinderia, Bida Burger.
- **Branching:** 25–30 total branches spread across the 8 cities. Names follow the pattern: `"Brand Name — Municipality"`.