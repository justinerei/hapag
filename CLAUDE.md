# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Identity

**Hapag** — Filipino word for "dining table." Multi-restaurant online food ordering web app for Laguna province, Philippines.
Tagline: *Good food, right to your table.*

School: LSPU College of Computer Studies | Course: ITEL 203 — Web Systems and Technologies

---

## What Hapag Is (and Is Not)

- **Pickup only.** No couriers, no delivery, no GPS tracking. Payment is Cash on Pickup.
- **No payment API.** No Stripe, GCash, PayMongo, PayPal, or any payment integration.
- **Fictional restaurant brands with multiple branches.** 6 restaurant brands, each with branches across multiple Laguna cities. All seeded manually with hardcoded coordinates. No real brands.
- **8 Laguna cities covered.** Customers choose their municipality at registration and can change it in their profile. Homepage defaults to their chosen municipality but they can browse/switch to other cities.
- **25–30 total branches seeded.** Not every city has every restaurant. Each branch is a separate `restaurants` row with its own owner, coordinates, and menu of 10–15 items.
- **No geocoding.** Nominatim was deliberately removed. All `lat`/`lng` values come from the database seeder only — never from a geocoding API.
- **No social features.** No reviews, ratings, or extended user profiles. Customers can favorite restaurants but there are no reviews or ratings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11, PHP 8.2+ |
| Auth | Laravel Breeze (Blade stack) |
| Frontend JS | Vanilla ES6+ with `fetch()` — no jQuery, Alpine.js, React, or Vue |
| CSS | Tailwind CSS 3.x with custom Hapag brand tokens |
| Templates | Blade (`.blade.php`) |
| Build | Vite (`npm run dev`) |
| Database | MySQL 8.0+ via Eloquent ORM |
| Map | Leaflet.js v1.9.x via CDN (no npm install) + CartoDB Positron tiles |
| AI | GROQ API (`llama3-8b-8192`) via `Http::` facade |
| Weather | OpenWeatherMap free tier via `Http::` facade |
| Local dev | Laragon — virtual host: `http://hapag.test` |

**Not in this project:** Livewire, Inertia.js, Sanctum/Passport, Alpine.js, Nominatim, Google Maps API, raw PDO, raw SQL.

---

## Common Commands

```bash
# Development
npm run dev                          # compile Tailwind — keep this running
php artisan serve                    # Laravel dev server

# Database
php artisan migrate:fresh --seed     # reset DB and reseed (use before demos)
php artisan db:seed
php artisan tinker                   # test Eloquent queries interactively

# Debugging
php artisan route:list               # debug routing issues
php artisan schedule:work            # simulate daily scheduler

# Backup
php artisan db:backup                # test backup manually
```

---

## User Roles

Stored in `users.role` column.

| Role | Login Redirect | Access |
|---|---|---|
| Guest (not logged in) | — | Browse restaurants, view menus, see map |
| `customer` | `/` (homepage) | Everything above + cart, orders, AI recommender, favorites, municipality preference |
| `owner` | `/owner` | Own restaurant(s)/branch(es) CRUD, menu management, order status, AI description generator |
| `admin` | `/admin` | Restaurant approvals, categories, all users/orders, DB backup |

---

## Database Schema (10 Tables)

All migrations in `database/migrations/`, all models in `app/Models/`.

**`users`** — id, name, email, password, role, municipality (nullable), email_verified_at, remember_token, timestamps
- `municipality` — customer's preferred municipality, chosen at registration, editable in profile. Nullable for owners/admins.
- `hasMany(Restaurant)`, `hasMany(Order)`, `hasMany(CartItem)`, `hasMany(Favorite)`

**`categories`** — id, name, icon (emoji), weather_tag (rainy/hot/cool/cloudy), timestamps
- `weather_tag` matched by `WeatherController` to suggest food categories on homepage

**`restaurants`** — id, owner_id, category_id, name, description, address, municipality, lat, lng, image_url, status (pending/active/rejected), timestamps
- Each row is a **branch**, not a brand. Multiple rows can share the same brand name in different municipalities.
- One owner can own multiple branches (franchise model).
- `lat`/`lng` are hardcoded in seeder — never geocoded
- Each branch has its own menu of 10–15 items

**`menu_items`** — id, restaurant_id, name, description, price, category, is_available, timestamps
- `is_available = false` hides item from customers without deleting it
- `description` can be AI-generated via GROQ in owner dashboard

**`cart_items`** — id, user_id, menu_item_id, quantity, timestamps
- Cart is **database-backed**, not session-backed — persists across browser closes
- Deleted when order is placed
- One-restaurant-per-cart rule enforced in `CartController@add`

**`orders`** — id, user_id, restaurant_id, total_amount, discount_amount, final_amount, voucher_id (nullable), status (pending/preparing/ready), pickup_note, timestamps
- `discount_amount` and `final_amount` are **frozen at checkout** — never recalculated

**`order_items`** — id, order_id, menu_item_id, quantity, unit_price, timestamps
- `unit_price` is **copied from `menu_items.price` at checkout** — never reference live price for history

**`vouchers`** — id, code (unique), type (percentage|fixed), value, min_order_amount, max_uses, used_count, restaurant_id (nullable = site-wide), created_by, is_active, expires_at, timestamps

**`voucher_usages`** — id, voucher_id, user_id, order_id, timestamps
- Tracks one-time-per-customer enforcement

**`favorites`** — id, user_id, restaurant_id, timestamps
- Customers can favorite/unfavorite restaurants
- `unique(['user_id', 'restaurant_id'])` — prevents duplicates
- Used on homepage to show a "Your Favorites" section

**`system_settings`** — id, key (unique), value, timestamps
- Used for `last_backup_at` and `last_backup_file`

---

## Pages and Routes

| Page | Route | Controller | Access |
|---|---|---|---|
| Homepage | `GET /` | `HomeController@index` | Public |
| Browse Restaurants | `GET /restaurants` | `RestaurantController@index` | Public |
| Restaurant Menu | `GET /menu/{restaurant}` | `RestaurantController@show` | Public; cart requires auth |
| Cart | `GET /cart` | `CartController@index` | `auth` |
| My Orders | `GET /orders` | `OrderController@index` | `auth` |
| Profile / Settings | `GET /profile` | `ProfileController@edit` | `auth` |
| Toggle Favorite | `POST /favorites/toggle/{restaurant}` | `FavoriteController@toggle` | `auth` |
| Owner Dashboard | `GET /owner` | `OwnerController@dashboard` | `auth` + `role:owner` |
| Admin Panel | `GET /admin` | `AdminController@dashboard` | `auth` + `role:admin` |

---

## Controllers Reference

**`HomeController`** — fetches weather, loads featured restaurants by `weather_tag`, filtered to customer's municipality by default. Shows "Your Favorites" section for logged-in customers.

**`RestaurantController`**
- `index()` — active restaurants, defaults to customer's municipality, supports AJAX name/category/municipality filter. Customers can switch to browse other cities.
- `show($id)` — single restaurant (branch) with available menu items
- `mapData()` — JSON (id, name, lat, lng, category, municipality) for Leaflet pins, filterable by municipality

**`CartController`**
- `add()` — enforces one-restaurant rule, returns `409 {conflict: true}` on violation
- `checkout()` — `DB::transaction`: creates Order + OrderItems + VoucherUsage, increments `used_count`, deletes cart

**`OrderController`** — `index()` for customer history; `updateStatus()` (PATCH) for owner

**`OwnerController`** — dashboard, `storeItem()`, `updateItem()`, `deleteItem()`, `toggleAvailable()`

**`AdminController`** — dashboard, `approveRestaurant()` (PATCH), `backup()` (POST → `Artisan::call('db:backup')`)

**`CategoryController`** — `store()`, `update()`, `destroy()` (admin only)

**`VoucherController`**
- `validate()` — POST from cart page, checks all 6 conditions, returns discount JSON. Does **not** create usage record.
- `store()`, `update()`, `destroy()` — scoped by role (owner can only manage own restaurant's vouchers)

**`AIController`**
- `recommend()` — customer food recommender (fetches menu, calls GROQ)
- `describe()` — owner menu description generator (calls GROQ)

**`FavoriteController`**
- `toggle()` — POST, adds or removes a favorite (idempotent toggle)
- `index()` — returns customer's favorited restaurants (used by homepage)

**`WeatherController`** — fetches OpenWeatherMap for `DEFAULT_CITY`, maps condition to `weather_tag`

---

## API Integrations

**GROQ API**
- Model: `llama3-8b-8192`
- Config: `config/services.php` → `groq.key`, `groq.url`, `groq.model`
- Call pattern: `Http::withToken(config('services.groq.key'))->post($url, $payload)`
- `.env` key: `GROQ_API_KEY`

**OpenWeatherMap**
- `.env` keys: `OWM_API_KEY`, `DEFAULT_CITY=Santa Cruz,PH`
- Call pattern: `Http::get($url, ['q' => $city, 'appid' => $key, 'units' => 'metric'])`

**Leaflet.js + OpenStreetMap**
- Loaded via CDN in `resources/views/layouts/app.blade.php` — no npm install
- Map center: defaults to customer's municipality coordinates, falls back to `[14.2794, 121.4117]` (Santa Cruz, Laguna) for guests, zoom 13
- Tiles: CartoDB Positron — no API key required
- Restaurant data from `GET /api/restaurants/map` — supports `?municipality=` filter

---

## Municipality System

### Customer municipality preference
- Customers select their municipality during **registration** (required dropdown of the 8 covered cities)
- Customers can **change** their municipality anytime via their **profile/settings page**
- Stored in `users.municipality` column

### How municipality affects what customers see
- **Homepage:** Featured restaurants default to the customer's municipality. A municipality switcher/dropdown lets them browse other cities without changing their saved preference.
- **Browse Restaurants page:** Defaults to customer's municipality filter. Customer can switch to "All Cities" or pick another specific city.
- **Map:** Centers on the customer's municipality coordinates by default. Switching municipality re-centers the map.
- **Guests (not logged in):** See all restaurants across all cities (no municipality preference stored). Map defaults to Santa Cruz.

### Municipality switcher vs. saved preference
- The **saved preference** (`users.municipality`) persists across sessions and determines the default view.
- The **switcher** is a session-level or UI-level filter — browsing another city does NOT change the saved preference. Only the profile page changes the saved preference.

---

## Favorites System

### How favorites work
- Authenticated customers can **favorite/unfavorite** a restaurant from the restaurant card or menu page (heart icon toggle)
- Endpoint: `POST /favorites/toggle/{restaurant}` — adds if not favorited, removes if already favorited
- Stored in `favorites` table with unique constraint on `(user_id, restaurant_id)`
- **Homepage** shows a "Your Favorites" section for logged-in customers, displaying their favorited restaurants from their current municipality view
- Favorites persist across sessions (database-backed, not session-backed)
- Guests cannot favorite — heart icon prompts login

---

## Voucher System

### Validation — all 6 conditions must pass
1. Code exists and `is_active = true`
2. Not expired (`expires_at IS NULL OR expires_at > NOW()`)
3. Global cap not hit (`max_uses IS NULL OR used_count < max_uses`)
4. Customer hasn't used it (no row in `voucher_usages` for this user + voucher)
5. Cart meets minimum (`total >= min_order_amount` if set)
6. Scope matches (`restaurant_id IS NULL` OR matches cart's restaurant)

Return a specific error message per failure via JSON (e.g. `"You have already used this voucher."`).

### Checkout flow (inside `DB::transaction`)
1. Re-validate voucher server-side (never trust frontend)
2. Compute `discount_amount` from type + value
3. `final_amount = total_amount - discount_amount` (min 0, never negative)
4. Save `voucher_id`, `discount_amount`, `final_amount` to `orders` row
5. Increment `vouchers.used_count`
6. Create `voucher_usages` row

If no code: `discount_amount = 0`, `final_amount = total_amount`, `voucher_id = null`.

### Scope rules
- **Admin-created:** `restaurant_id = null` — valid for any restaurant
- **Owner-created:** `restaurant_id = owner's restaurant` — only valid for that restaurant. Never accept `restaurant_id` from request directly.

---

## Brand Design System

### Colors (`tailwind.config.js` → `theme.extend.colors.hapag`)
| Token | Hex | Use |
|---|---|---|
| `hapag-red` | `#E63946` | Primary CTAs, Add to Cart, logo, price text |
| `hapag-amber` | `#F4A261` | AI features, weather banner, secondary accents |
| `hapag-teal` | `#2A9D8F` | Success, Ready badge, available status |
| `hapag-brown` | `#6B3A2A` | Owner portal accent |
| `hapag-ink` | `#1A0F0A` | All headings and primary text |
| `hapag-gray` | `#8B7355` | Secondary text, placeholders, timestamps |
| `hapag-cream` | `#FFF8EF` | Main page background |
| `hapag-cream2` | `#F5ECD7` | Table alt rows, card hover states |

### Typography
- **Outfit** — all UI text, body, labels, nav, headings (Google Fonts via Blade layout)
- **JetBrains Mono** — all prices, order totals, financial figures
- **Do NOT use Playfair Display or any serif font.**

### Reusable Tailwind classes
```
# Primary button
bg-hapag-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg

# Food card
bg-white border border-hapag-cream2 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200

# Status badges
Pending:   bg-amber-100 text-amber-800 text-xs font-bold uppercase px-3 py-1 rounded-full
Preparing: bg-red-100 text-hapag-red text-xs font-bold uppercase px-3 py-1 rounded-full
Ready:     bg-teal-100 text-hapag-teal text-xs font-bold uppercase px-3 py-1 rounded-full
```

---

## Critical Development Rules

1. **Eloquent only.** Never write raw SQL string concatenation. Use prepared statements if raw queries are unavoidable.

2. **CSRF token in every AJAX POST/PATCH/DELETE:**
   ```js
   headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
   ```

3. **Correct middleware on every protected route:**
   ```php
   Route::middleware(['auth', 'role:owner'])->group(...)
   Route::middleware(['auth', 'role:admin'])->group(...)
   ```

4. **API keys in `.env` only.** Access via `config('services.groq.key')`. JavaScript never calls GROQ or OWM directly — all external API calls go through Laravel controllers.

5. **`unit_price` frozen at checkout.** Copy from `menu_items.price` at order time. Never reference the live price for historical order display.

6. **One-restaurant cart rule.** `CartController@add` returns `response()->json(['conflict' => true], 409)` when a customer tries to add from a different restaurant. Frontend shows a modal to clear cart.

7. **Database-backed cart.** `cart_items` table holds the cart. Session holds nothing about the cart.

8. **No geocoding ever.** `lat`/`lng` come from the seeder only.

9. **`db:backup` command must:** write `.sql` to `storage/app/backups/` only, update `system_settings` with `last_backup_at` and `last_backup_file`, delete backups older than 7 days.

10. **`Http::` facade for all external API calls.** Never use `curl_init()` or `file_get_contents()`.

11. **Voucher re-validation at checkout.** Always re-validate inside `DB::transaction`. Never trust the frontend's claimed discount.

12. **Discount frozen at checkout.** Save `discount_amount` and `final_amount` to the `orders` row. Never recalculate after the order is placed.

13. **`VoucherUsage` inside the transaction.** If checkout rolls back, the usage record must not persist.

---

## Seeded Restaurant Brands & Branches (Laguna)

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
| Los Baños | 14.1692 | 121.2436 |
| Calamba | 14.2116 | 121.1653 |
| San Pablo | 14.0685 | 121.3254 |
| Bay | 14.1806 | 121.2845 |
| Nagcarlan | 14.1367 | 121.4163 |
| Pila | 14.2327 | 121.3642 |

**Food categories to seed:** Filipino 🍜 (rainy), BBQ/Ihaw-Ihaw 🔥 (cool), Cafe ☕ (rainy), Bakery 🍞 (cloudy), Fast Food 🍔 (hot), Desserts 🍨 (hot)