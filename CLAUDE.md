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
- **Fictional restaurants only.** All restaurants have Filipino-sounding names seeded manually with hardcoded Laguna coordinates. No real brands.
- **Laguna province scope only.** Map defaults to Santa Cruz, Laguna (zoom 13).
- **No geocoding.** Nominatim was deliberately removed. All `lat`/`lng` values come from the database seeder only — never from a geocoding API.
- **No social features.** No reviews, ratings, or extended user profiles.

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
| `customer` | `/` (homepage) | Everything above + cart, orders, AI recommender |
| `owner` | `/owner` | Own restaurant CRUD, menu management, order status, AI description generator |
| `admin` | `/admin` | Restaurant approvals, categories, all users/orders, DB backup |

---

## Database Schema (8 Tables)

All migrations in `database/migrations/`, all models in `app/Models/`.

**`users`** — id, name, email, password, role, email_verified_at, remember_token, timestamps
- `hasMany(Restaurant)`, `hasMany(Order)`, `hasMany(CartItem)`

**`categories`** — id, name, icon (emoji), weather_tag (rainy/hot/cool/cloudy), timestamps
- `weather_tag` matched by `WeatherController` to suggest food categories on homepage

**`restaurants`** — id, owner_id, category_id, name, description, address, municipality, lat, lng, image_url, status (pending/active/rejected), timestamps
- `lat`/`lng` are hardcoded in seeder — never geocoded

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
| Owner Dashboard | `GET /owner` | `OwnerController@dashboard` | `auth` + `role:owner` |
| Admin Panel | `GET /admin` | `AdminController@dashboard` | `auth` + `role:admin` |

---

## Controllers Reference

**`HomeController`** — fetches weather, loads featured restaurants by `weather_tag`

**`RestaurantController`**
- `index()` — active restaurants, supports AJAX name/category filter
- `show($id)` — single restaurant with available menu items
- `mapData()` — JSON (id, name, lat, lng, category) for Leaflet pins

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
- Map center: `[14.2794, 121.4117]` (Santa Cruz, Laguna), zoom 13
- Tiles: CartoDB Positron — no API key required
- Restaurant data from `GET /api/restaurants/map`

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

## Seeded Fictional Restaurants (Laguna)

| Restaurant | Municipality | Coords | Category |
|---|---|---|---|
| Lutong Bahay ni Aling Rosa | Santa Cruz | 14.2794, 121.4117 | Filipino |
| Grill Masters PH | Santa Cruz | 14.2821, 121.4089 | BBQ / Ihaw-Ihaw |
| Kape't Tinapay | Pagsanjan | 14.2713, 121.4559 | Cafe |
| La Preciosa Bakery | Pagsanjan | 14.2698, 121.4612 | Bakery |
| Mama Nena's Carinderia | Los Baños | 14.1692, 121.2436 | Filipino |
| Bida Burger | Calamba | 14.2116, 121.1653 | Fast Food |

**Food categories to seed:** Filipino 🍜 (rainy), BBQ/Ihaw-Ihaw 🔥 (cool), Cafe ☕ (rainy), Bakery 🍞 (cloudy), Fast Food 🍔 (hot), Desserts 🍨 (hot)
