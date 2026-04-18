================================================================================

HAPAG — MASTER AI CONTEXT FILE

Shared Project Prompt for Development Use

Version 2.3 — Laravel + Tailwind Stack

Last Updated: April 2025

================================================================================



HOW TO USE THIS FILE

\--------------------------------------------------------------------------------



Paste the full contents of this file at the start of any AI conversation to

give the AI complete, accurate context about the Hapag project.



Recommended usage:

&#x20; 1. Open your AI tool (Claude, ChatGPT, Gemini, etc.)

&#x20; 2. Paste this entire file as your first message

&#x20; 3. Then type your actual question or request immediately after



Example:

&#x20; \[Paste full file]

&#x20; Now help me write the CartController@add method with the one-restaurant rule.



For long or complex tasks, you can paste only the relevant sections.

For coding tasks, always include Section 4 (Tech Stack), Section 7 (Controllers),

and the specific feature section you are working on.



Do not modify this file unless the project details change.

If features are added or removed, update this file and share the new version.



================================================================================

SECTION 1: PROJECT IDENTITY

================================================================================



Project Name: Hapag



Name Origin: Filipino word for "dining table" — the place where families

gather and food is shared. Chosen for its cultural identity, brevity, and

distinctiveness from commercial competitors like GrabFood and Foodpanda.



Tagline: Good food, right to your table.



Type: Multi-restaurant online food ordering web application



School: Laguna State Polytechnic University (LSPU), College of Computer Studies



Course: ITEL 203 — Web Systems and Technologies



Team Size: 3 members



Submission Deadline: 2nd week of May 2025



Documentation Version: 2.0 (Laravel + Tailwind)



================================================================================

SECTION 2: WHAT HAPAG IS

================================================================================



Hapag is a multi-restaurant food ordering platform where customers discover

local restaurants in Laguna, browse menus, and place orders online.



The key points every developer and AI assistant must know:



1\. It is NOT a delivery app. No couriers. No GPS tracking. No delivery fees.

&#x20;  Orders are picked up in person by the customer. Payment is Cash on Pickup only.



2\. It is NOT a real payment platform. No GCash, PayPal, Stripe, or credit cards.

&#x20;  No payment API of any kind is integrated.



3\. It is NOT a real commercial app using real restaurant brands.

&#x20;  All restaurants are FICTIONAL with Filipino-sounding names.

&#x20;  They are seeded manually in the database with hardcoded Laguna coordinates.

&#x20;  This avoids trademark issues.



4\. It is NOT a nationwide platform. Geographic scope is Laguna province only.

&#x20;  The Leaflet map defaults to Santa Cruz, Laguna at zoom level 13.



5\. It is NOT a social platform. No reviews, ratings, or user profiles beyond

&#x20;  ordering functionality.



6\. Nominatim geocoding has been REMOVED from this project.

&#x20;  There is no live geocoding. Restaurant coordinates are hardcoded in the

&#x20;  database seeder. This was a deliberate decision to simplify scope.



================================================================================

SECTION 3: USER TYPES AND ROLES

================================================================================



There are 4 user roles stored in the users.role column:



GUEST (not logged in)

&#x20; Can: browse restaurants, view menus, see the Leaflet map

&#x20; Cannot: add to cart, place orders

&#x20; On cart attempt: redirected to /login by Laravel auth middleware



CUSTOMER (role = 'customer')

&#x20; Can: everything a guest can + add to cart, place orders, track order status,

&#x20; view order history, use the AI food recommender

&#x20; Login redirect: homepage (/)



OWNER (role = 'owner')

&#x20; Can: manage their own restaurant profile, full menu CRUD, view and update

&#x20; incoming order status, use the AI menu description generator

&#x20; Login redirect: owner dashboard (/owner)

&#x20; Note: restaurant starts as status = 'pending' until admin approves



ADMIN (role = 'admin')

&#x20; Can: approve or reject restaurant applications, manage food categories,

&#x20; view all users, view all orders system-wide, manage the database backup

&#x20; Login redirect: admin panel (/admin)

&#x20; Note: admin cannot access customer or owner pages normally



================================================================================

SECTION 4: TECH STACK (EVERYTHING IN ONE PLACE)

================================================================================



PHP Framework: Laravel 11

Authentication: Laravel Breeze (blade stack) — handles register, login, logout,

&#x20; password hashing via bcrypt, session, CSRF automatically

CSS Framework: Tailwind CSS 3.x with custom Hapag brand tokens

Build Tool: Vite (built into Laravel 11) — npm run dev for development

Frontend JS: Vanilla JavaScript ES6+ with fetch() for all AJAX calls

&#x20; No jQuery, no Alpine.js, no React, no Vue

Template Engine: Blade (.blade.php files in resources/views/)

Database: MySQL 8.0+ via Laravel Eloquent ORM

&#x20; No raw PDO, no raw SQL string concatenation

Migrations: Laravel Migrations in database/migrations/ — schema version controlled

Seeders: Laravel Seeders in database/seeders/ — fictional Laguna restaurant data

Map Library: Leaflet.js v1.9.x loaded via CDN in Blade layout

&#x20; No npm install for Leaflet — just a CDN link tag

Map Tiles: CartoDB Positron or OpenStreetMap — free, no API key

AI API: GROQ API with llama3-8b-8192 model

&#x20; Called via Laravel Http:: facade from AIController

&#x20; Key stored in .env as GROQ\_API\_KEY

Weather API: OpenWeatherMap free tier

&#x20; Called via Laravel Http:: facade from WeatherController

&#x20; Key stored in .env as OWM\_API\_KEY

DB Backup: Custom Artisan command (db:backup) + Laravel Scheduler

&#x20; Uses mysqldump via PHP exec()

&#x20; Saves to storage/app/backups/hapag\_backup\_YYYY\_MM\_DD\_HHmm.sql

&#x20; Runs daily at 2:00 AM via Kernel.php

Local Dev: Laragon (bundles PHP 8.2, MySQL 8, Nginx, Composer)

&#x20; Virtual host: http://hapag.test

Version Control: Git + GitHub with feature branches



Things that are NOT in this project:

&#x20; No Livewire, no Inertia.js, no API tokens (Sanctum/Passport)

&#x20; No React, no Vue, no Alpine.js

&#x20; No Nominatim geocoding (removed — coordinates are hardcoded in seeder)

&#x20; No Google Maps API (using Leaflet.js + OpenStreetMap instead)



================================================================================

SECTION 5: THE 7 PAGES

================================================================================



All views are Blade files in resources/views/.



Page 1: Homepage — resources/views/home.blade.php

&#x20; Route: GET /

&#x20; Controller: HomeController@index

&#x20; Access: Everyone (public)

&#x20; Features: Weather card with live OpenWeatherMap data, weather-based food

&#x20; suggestion strip, featured restaurant cards, search bar



Page 2: Browse Restaurants — resources/views/restaurants/index.blade.php

&#x20; Route: GET /restaurants

&#x20; Controller: RestaurantController@index

&#x20; Access: Everyone (public)

&#x20; Features: Restaurant card grid, category filter via AJAX, name search via AJAX,

&#x20; Leaflet map toggle showing all seeded restaurants as pins



Page 3: Restaurant Menu — resources/views/restaurants/show.blade.php

&#x20; Route: GET /menu/{restaurant}

&#x20; Controller: RestaurantController@show

&#x20; Access: Everyone; adding to cart requires login

&#x20; Features: Menu organized by category tabs, food cards with AJAX add-to-cart,

&#x20; AI food recommender panel (slides in from right), cart badge update



Page 4: Cart — resources/views/cart/index.blade.php

&#x20; Route: GET /cart

&#x20; Controller: CartController@index

&#x20; Access: Login required (auth middleware)

&#x20; Features: Item list with quantity controls, AJAX quantity update, order total,

&#x20; voucher code input with AJAX validation (VoucherController@validate),

&#x20; discount line shown when valid voucher is applied, final total after discount,

&#x20; pickup note textarea, Place Order button



Page 5: My Orders — resources/views/orders/index.blade.php

&#x20; Route: GET /orders

&#x20; Controller: OrderController@index

&#x20; Access: Login required (auth middleware)

&#x20; Features: Order history list with status badges (pending/preparing/ready),

&#x20; item breakdown per order, order timestamps



Page 6: Owner Dashboard — resources/views/owner/dashboard.blade.php

&#x20; Route: GET /owner

&#x20; Controller: OwnerController@dashboard

&#x20; Access: role:owner middleware only

&#x20; Features: Menu CRUD (add, edit, delete, toggle available), incoming orders

&#x20; panel with status update buttons, AI Generate Description button



Page 7: Admin Panel — resources/views/admin/dashboard.blade.php

&#x20; Route: GET /admin

&#x20; Controller: AdminController@dashboard

&#x20; Access: role:admin middleware only

&#x20; Features: System stats, restaurant approval queue, food category CRUD,

&#x20; user list, database backup panel (last backup time + manual trigger)



================================================================================

SECTION 6: DATABASE TABLES (ALL 8)

================================================================================



The schema is defined in database/migrations/.

All relationships are defined in app/Models/.



TABLE: users

Columns: id, name, email, password, role (customer/owner/admin),

&#x20; email\_verified\_at, remember\_token, created\_at, updated\_at

Model: User

Relationships: hasMany(Restaurant), hasMany(Order), hasMany(CartItem)



TABLE: categories

Columns: id, name, icon (emoji), weather\_tag (rainy/hot/cool/cloudy),

&#x20; created\_at, updated\_at

Model: Category

Relationships: hasMany(Restaurant)

Note: weather\_tag is used by WeatherController to match live weather

to a food category for the homepage suggestion feature.



TABLE: restaurants

Columns: id, owner\_id (FK users), category\_id (FK categories), name,

&#x20; description, address, municipality, lat, lng, image\_url,

&#x20; status (pending/active/rejected), created\_at, updated\_at

Model: Restaurant

Relationships: belongsTo(User as owner), belongsTo(Category), hasMany(MenuItem),

&#x20; hasMany(Order)

Note: lat and lng are HARDCODED in the seeder. No geocoding API is used.

All restaurants are fictional and located in Laguna province.



TABLE: menu\_items

Columns: id, restaurant\_id (FK restaurants), name, description, price,

&#x20; category (internal section label), is\_available (boolean), created\_at, updated\_at

Model: MenuItem

Relationships: belongsTo(Restaurant), hasMany(CartItem), hasMany(OrderItem)

Note: description can be AI-generated via GROQ in the owner dashboard.

is\_available = false hides the item from customer view without deleting it.



TABLE: cart\_items

Columns: id, user\_id (FK users), menu\_item\_id (FK menu\_items), quantity,

&#x20; created\_at, updated\_at

Model: CartItem

Relationships: belongsTo(User), belongsTo(MenuItem)

Important: Cart is stored in the database, NOT in PHP session.

This means the cart persists if the user closes the browser.

Cart items are DELETED when an order is placed (checkout).

One-restaurant-per-cart rule is enforced in CartController@add.



TABLE: orders

Columns: id, user\_id (FK users), restaurant\_id (FK restaurants), total\_amount,

&#x20; discount\_amount, final\_amount, voucher\_id (nullable FK vouchers),

&#x20; status (pending/preparing/ready), pickup\_note, created\_at, updated\_at

Model: Order

Relationships: belongsTo(User), belongsTo(Restaurant), hasMany(OrderItem),

&#x20; belongsTo(Voucher)

Note: discount\_amount is copied from the voucher calculation at checkout time.

&#x20; final\_amount = total\_amount - discount\_amount. Like unit\_price in order\_items,

&#x20; these are frozen at checkout — never recalculated from the live voucher value.



TABLE: order\_items

Columns: id, order\_id (FK orders), menu\_item\_id (FK menu\_items), quantity,

&#x20; unit\_price, created\_at, updated\_at

Model: OrderItem

Relationships: belongsTo(Order), belongsTo(MenuItem)

IMPORTANT: unit\_price is COPIED from menu\_items.price at the moment of

ordering. This ensures order history is accurate even if prices change later.



TABLE: vouchers

Columns: id, code (unique string, e.g. HAPAG20), type (percentage | fixed),

&#x20; value (decimal — percentage points or peso amount), min\_order\_amount (decimal, nullable),

&#x20; max\_uses (integer, nullable — global cap), used\_count (integer, default 0),

&#x20; restaurant\_id (nullable FK restaurants — null means site-wide, set means owner-scoped),

&#x20; created\_by (FK users — admin or owner who created it),

&#x20; is\_active (boolean, default true), expires\_at (timestamp, nullable),

&#x20; created\_at, updated\_at

Model: Voucher

Relationships: belongsTo(Restaurant), belongsTo(User as creator), hasMany(VoucherUsage),

&#x20; hasMany(Order)

Scope rules:

&#x20; Admin-created vouchers: restaurant\_id = null — valid for any restaurant

&#x20; Owner-created vouchers: restaurant\_id = owner's restaurant\_id — only valid for that restaurant

Validation logic (all conditions must pass):

&#x20; 1. Code exists and is\_active = true

&#x20; 2. Not expired (expires\_at is null OR expires\_at > now())

&#x20; 3. Global uses not exceeded (max\_uses is null OR used\_count < max\_uses)

&#x20; 4. Customer has not used this voucher before (no record in voucher\_usages)

&#x20; 5. Cart total meets min\_order\_amount (if set)

&#x20; 6. Voucher is site-wide OR restaurant\_id matches current cart's restaurant



TABLE: voucher\_usages

Columns: id, voucher\_id (FK vouchers), user\_id (FK users), order\_id (FK orders),

&#x20; created\_at, updated\_at

Model: VoucherUsage

Relationships: belongsTo(Voucher), belongsTo(User), belongsTo(Order)

Purpose: Tracks which customer used which voucher on which order.

&#x20; Used to enforce the one-time-per-customer rule.

&#x20; A record is created inside the same DB::transaction as the order at checkout.

Columns: id, key (unique), value, created\_at, updated\_at

Model: SystemSetting

Used for: storing last\_backup\_at timestamp and last\_backup\_file name.

Access pattern: SystemSetting::updateOrCreate(\['key' => 'last\_backup\_at'], \[...])



================================================================================

SECTION 7: CONTROLLERS REFERENCE

================================================================================



HomeController

&#x20; index() — fetches weather via WeatherController, loads featured restaurants

&#x20; based on weather\_tag, returns home.blade.php



RestaurantController

&#x20; index()    — returns all active restaurants, supports name/category AJAX filter

&#x20; show($id)  — returns single restaurant with its available menu items

&#x20; mapData()  — returns JSON array of active restaurants with id, name, lat, lng, category



CartController

&#x20; index()     — returns current user's cart items and total

&#x20; add()       — POST: adds item, enforces one-restaurant rule (409 on conflict)

&#x20; update()    — POST: updates quantity for an existing cart item

&#x20; remove()    — POST: removes a single item from cart

&#x20; checkout()  — POST: wraps DB::transaction to create Order + OrderItems + delete cart



OrderController

&#x20; index()         — returns current user's orders (customer) or restaurant orders (owner)

&#x20; updateStatus()  — PATCH: owner updates order status (pending/preparing/ready)



OwnerController

&#x20; dashboard()        — returns owner's restaurant data + incoming orders

&#x20; storeItem()        — POST: adds new menu item to owner's restaurant

&#x20; updateItem($id)    — POST: updates an existing menu item

&#x20; deleteItem($id)    — DELETE: removes a menu item

&#x20; toggleAvailable()  — POST: flips is\_available boolean on a menu item



AdminController

&#x20; dashboard()           — returns system stats + pending restaurants + user list

&#x20; approveRestaurant()   — PATCH: sets restaurant status to active or rejected

&#x20; backup()              — POST: calls Artisan::call('db:backup'), returns JSON result



CategoryController

&#x20; store()      — POST: creates new category (admin only)

&#x20; update($id)  — POST: updates category name, icon, or weather\_tag

&#x20; destroy($id) — DELETE: removes a category



VoucherController

&#x20; index()     — GET: list vouchers (admin sees all, owner sees only their own)

&#x20; store()     — POST: create new voucher (admin or owner, scoped accordingly)

&#x20; update($id) — POST: edit voucher (admin can edit any, owner only their own)

&#x20; destroy($id)— DELETE: deactivate or delete voucher

&#x20; validate()  — POST: customer submits code on cart page — checks all 6 conditions,

&#x20;               returns discount type, value, and computed discount amount as JSON

&#x20;               Does NOT create a usage record yet — only checkout does that



AIController

&#x20; recommend() — POST: receives message + restaurant\_id, fetches menu, calls GROQ,

&#x20;   returns food recommendation JSON

&#x20; describe()  — POST: receives dish name + keywords, calls GROQ, returns

&#x20;   generated menu description JSON



WeatherController

&#x20; index() — GET: fetches OpenWeatherMap for DEFAULT\_CITY, maps condition to

&#x20;   weather\_tag, returns JSON with temperature, condition, city, weather\_tag



================================================================================

SECTION 8: API INTEGRATIONS

================================================================================



GROQ API

&#x20; Purpose: Powers two features — customer food recommender and owner menu

&#x20; description generator

&#x20; Model: llama3-8b-8192

&#x20; Base URL: https://api.groq.com/openai/v1/chat/completions

&#x20; Auth: Bearer token — stored in .env as GROQ\_API\_KEY

&#x20; Config: config/services.php -> 'groq' -> 'key', 'url', 'model'

&#x20; Laravel call: Http::withToken(config('services.groq.key'))->post($url, $payload)

&#x20; Free tier: 14,400 requests per day

&#x20; Both endpoints: AIController@recommend and AIController@describe



OpenWeatherMap API

&#x20; Purpose: Live weather data for the homepage weather suggestion feature

&#x20; Endpoint: https://api.openweathermap.org/data/2.5/weather

&#x20; Auth: appid query parameter — stored in .env as OWM\_API\_KEY

&#x20; Default city: Santa Cruz,PH (stored in .env as DEFAULT\_CITY)

&#x20; Laravel call: Http::get($url, \['q' => $city, 'appid' => $key, 'units' => 'metric'])

&#x20; Free tier: 1,000 calls per day

&#x20; Controller: WeatherController@index



Leaflet.js + OpenStreetMap

&#x20; Purpose: Interactive restaurant map on the restaurants page

&#x20; How loaded: CDN link tag in resources/views/layouts/app.blade.php

&#x20; No API key needed. Completely free forever.

&#x20; Map center: \[14.2794, 121.4117] (Santa Cruz, Laguna). Zoom: 13

&#x20; Tiles: CartoDB Positron — https://basemaps.cartocdn.com/light\_all/{z}/{x}/{y}{r}.png

&#x20; Data: Restaurant JSON from GET /api/restaurants/map (RestaurantController@mapData)

&#x20; Coordinates: ALL HARDCODED IN SEEDER — no live geocoding



Nominatim (OpenStreetMap Geocoding)

&#x20; STATUS: REMOVED FROM PROJECT

&#x20; Reason: All restaurants are seeded with hardcoded lat/lng. No live geocoding needed.

&#x20; Do not suggest adding Nominatim back to this project.



================================================================================

SECTION 9: VOUCHER SYSTEM

================================================================================



Hapag supports promotional discount vouchers. Customers enter a code at the

cart page before checkout. The system validates the code and applies the

discount to the order total. No real payment API is involved.



VOUCHER TYPES

&#x20; percentage — Deducts a % from the cart total (e.g. value = 20 → 20% off)

&#x20; fixed      — Deducts a fixed peso amount (e.g. value = 50 → ₱50 off)

&#x20; For fixed-type: if the discount exceeds the cart total, the final\_amount is

&#x20; clamped to ₱0 — never negative.



WHO CREATES VOUCHERS

&#x20; Admin: creates site-wide vouchers (restaurant\_id = null).

&#x20;        Valid for any restaurant. Managed in the admin panel.

&#x20; Owner: creates restaurant-scoped vouchers (restaurant\_id = their restaurant).

&#x20;        Only valid when the cart contains items from their restaurant.

&#x20;        Managed in the owner dashboard.



VOUCHER VALIDATION — ALL 6 CONDITIONS MUST PASS

&#x20; 1. Code exists in the vouchers table and is\_active = true

&#x20; 2. Not expired: expires\_at IS NULL OR expires\_at > NOW()

&#x20; 3. Global cap not hit: max\_uses IS NULL OR used\_count < max\_uses

&#x20; 4. Customer has not used it: no row in voucher\_usages for this user + voucher

&#x20; 5. Cart meets minimum: cart total >= min\_order\_amount (if min\_order\_amount set)

&#x20; 6. Scope matches: restaurant\_id IS NULL (site-wide) OR matches cart restaurant



&#x20; If any condition fails, return a specific error message via JSON so the

&#x20; frontend can display it to the customer (e.g. "This voucher has expired.",

&#x20; "You have already used this voucher.", "Minimum order of ₱200 required.").



CHECKOUT FLOW WITH VOUCHER

&#x20; CartController@checkout receives the voucher\_code (nullable) from the form.

&#x20; If a code is provided:

&#x20;   1. Re-validate the voucher inside the DB::transaction (do not trust frontend)

&#x20;   2. Compute discount\_amount from type and value

&#x20;   3. Compute final\_amount = total\_amount - discount\_amount (min 0)

&#x20;   4. Save voucher\_id, discount\_amount, final\_amount to the orders row

&#x20;   5. Increment vouchers.used\_count by 1

&#x20;   6. Create a voucher\_usages row (voucher\_id, user\_id, order\_id)

&#x20; If no code: discount\_amount = 0, final\_amount = total\_amount, voucher\_id = null

&#x20; All of the above must be inside the same DB::transaction as order creation.



FRONTEND BEHAVIOR (Cart Page)

&#x20; - Voucher input field + Apply button below the order subtotal

&#x20; - On Apply: fetch() POST to /voucher/validate with code and cart total

&#x20; - On success: show discount line (e.g. "HAPAG20 — -₱80.00") and updated total

&#x20; - On failure: show specific inline error message below the input

&#x20; - Applied voucher code stored in a hidden input and submitted with checkout form

&#x20; - If customer removes an item causing total to drop below min\_order\_amount,

&#x20;   the applied voucher must be cleared and re-validated



OWNER DASHBOARD — VOUCHER MANAGEMENT

&#x20; Owners see a Vouchers panel in their dashboard.

&#x20; They can: create, toggle is\_active, and delete their own vouchers.

&#x20; They CANNOT see or manage admin-created (site-wide) vouchers.

&#x20; Fields when creating: code, type, value, min\_order\_amount, max\_uses, expires\_at



ADMIN PANEL — VOUCHER MANAGEMENT

&#x20; Admin sees all vouchers across all restaurants + all site-wide vouchers.

&#x20; Admin can create, edit, toggle, and delete any voucher.

&#x20; Admin vouchers have restaurant\_id = null — no owner field shown.



================================================================================

SECTION 10: HAPAG BRAND DESIGN SYSTEM

================================================================================



Color Tokens (tailwind.config.js theme.extend.colors.hapag):

&#x20; hapag.red    = #E63946  — primary CTAs, Add to Cart, logo, price text

&#x20; hapag.amber  = #F4A261  — AI features, weather banner, secondary accents

&#x20; hapag.teal   = #2A9D8F  — success, Ready badge, available status

&#x20; hapag.brown  = #6B3A2A  — owner portal accent

&#x20; hapag.ink    = #1A0F0A  — all headings and primary text

&#x20; hapag.gray   = #8B7355  — secondary text, placeholders, timestamps

&#x20; hapag.cream  = #FFF8EF  — main page background (warm, cafe feel)

&#x20; hapag.cream2 = #F5ECD7  — table alt rows, card hover states



Typography (Google Fonts via Blade layout):

&#x20; Outfit — all UI text, body, labels, nav items, headings

&#x20; JetBrains Mono — all prices, order totals, financial figures



&#x20; Do NOT use Playfair Display or any other serif font.

&#x20; Hapag uses a clean, modern sans-serif identity. Serif fonts make the

&#x20; UI feel generic and undermine the brand aesthetic. Stick to Outfit only.



Primary button Tailwind class:

&#x20; bg-hapag-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full

&#x20; transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg



Food card Tailwind class:

&#x20; bg-white border border-hapag-cream2 rounded-2xl overflow-hidden

&#x20; hover:-translate-y-1 hover:shadow-lg transition-all duration-200



Status badges:

&#x20; Pending:   bg-amber-100 text-amber-800 text-xs font-bold uppercase px-3 py-1 rounded-full

&#x20; Preparing: bg-red-100 text-hapag-red text-xs font-bold uppercase px-3 py-1 rounded-full

&#x20; Ready:     bg-teal-100 text-hapag-teal text-xs font-bold uppercase px-3 py-1 rounded-full



Weather suggestion banner: amber themed, inside dark ink hero section

AI chat panel: slides in from right, bg-hapag-ink with amber accents

Owner dashboard header: bg-hapag-ink with hapag-teal left border accent

Admin sidebar: bg-hapag-ink full dark with hapag-red active state



================================================================================

SECTION 11: CRITICAL DEVELOPMENT RULES

================================================================================



These rules must be followed in every file, every function, every commit.



1\. Use Eloquent ORM for all database queries.

&#x20;  Never write raw SQL string concatenation.

&#x20;  Use prepared statements if raw queries are unavoidable.



2\. CSRF token must be included in every AJAX POST/PATCH/DELETE request.

&#x20;  Add to your fetch() calls:

&#x20;  headers: { 'X-CSRF-TOKEN': document.querySelector('meta\[name="csrf-token"]').content }



3\. Every protected route must have the correct middleware.

&#x20;  auth middleware for any logged-in user.

&#x20;  role:owner for owner-only pages and endpoints.

&#x20;  role:admin for admin-only pages and endpoints.



4\. API keys live in .env ONLY.

&#x20;  Never hardcode API keys in PHP or JavaScript files.

&#x20;  Access via config('services.groq.key') or env('OWM\_API\_KEY').

&#x20;  .env is already in .gitignore by default in Laravel.



5\. unit\_price in order\_items must be copied from menu\_items.price at checkout.

&#x20;  Never reference the live menu price for historical order display.



6\. The one-restaurant-per-cart rule is enforced in CartController@add.

&#x20;  If a customer tries to add from a different restaurant, return:

&#x20;  return response()->json(\['conflict' => true], 409)

&#x20;  The frontend then shows a modal asking the customer to clear their cart.



7\. All cart operations are database-backed, not session-backed.

&#x20;  The cart\_items table holds the cart. Session holds nothing about the cart.



8\. All restaurant coordinates are seeded values, not geocoded.

&#x20;  Do not add Nominatim API calls. Do not call any geocoding service.

&#x20;  lat and lng values come from the database seeder only.



9\. The database backup command (php artisan db:backup) must:

&#x20;  Write the .sql file to storage/app/backups/ only (outside public web root)

&#x20;  Update system\_settings with last\_backup\_at and last\_backup\_file

&#x20;  Delete backup files older than 7 days



10\. Use Laravel Http:: facade for all external API calls.

&#x20;   Never use raw PHP curl\_init() or file\_get\_contents() for API calls.



11\. Voucher validation must be re-run inside CartController@checkout.

&#x20;   Never trust the frontend's claimed discount — always re-validate the code

&#x20;   server-side inside the DB::transaction before saving the order.



12\. Discount amounts must be frozen at checkout time.

&#x20;   Save discount\_amount and final\_amount to the orders row. Never recalculate

&#x20;   the discount from the voucher after the order is placed — voucher values

&#x20;   can change or the voucher can be deleted later.



13\. VoucherUsage must be created inside the same DB::transaction as the order.

&#x20;   If the transaction rolls back, the usage record must not persist.

&#x20;   Also increment vouchers.used\_count inside the same transaction.



================================================================================

SECTION 12: SEEDED FICTIONAL RESTAURANTS (LAGUNA)

================================================================================



All restaurants are fictional. These are the recommended seed entries.



Municipality: Santa Cruz, Laguna (default map center)

&#x20; Lutong Bahay ni Aling Rosa — Filipino comfort food

&#x20; Coordinates: 14.2794, 121.4117

&#x20; Menu examples: Chicken Adobo ₱120, Sinigang na Baboy ₱185, Pork Menudo ₱140



&#x20; Grill Masters PH — BBQ and grilled Filipino street food

&#x20; Coordinates: 14.2821, 121.4089

&#x20; Menu examples: Inihaw na Liempo ₱150, BBQ Manok ₱130, Isaw ₱45



Municipality: Pagsanjan, Laguna

&#x20; Kape't Tinapay — Filipino cafe, coffee and bread

&#x20; Coordinates: 14.2713, 121.4559

&#x20; Menu examples: Barako Coffee ₱65, Pandesal (6pcs) ₱35, Spanish Bread ₱15



&#x20; La Preciosa Bakery — Filipino bakery

&#x20; Coordinates: 14.2698, 121.4612

&#x20; Menu examples: Ensaymada ₱45, Ube Pandesal ₱20, Buko Pie ₱180



Municipality: Los Banos, Laguna

&#x20; Mama Nena's Carinderia — Budget Filipino rice meals

&#x20; Coordinates: 14.1692, 121.2436

&#x20; Menu examples: Adobo Rice Meal ₱85, Sinigang Bowl ₱110, Lechon Kawali ₱160



Municipality: Calamba, Laguna

&#x20; Bida Burger — Filipino-style burgers and fries

&#x20; Coordinates: 14.2116, 121.1653

&#x20; Menu examples: Bida Burger ₱120, Cheese Overload ₱145, Fries ₱65



Food categories to seed:

&#x20; Filipino (icon: 🍜, weather\_tag: rainy)

&#x20; BBQ / Ihaw-Ihaw (icon: 🔥, weather\_tag: cool)

&#x20; Cafe (icon: ☕, weather\_tag: rainy)

&#x20; Bakery (icon: 🍞, weather\_tag: cloudy)

&#x20; Fast Food (icon: 🍔, weather\_tag: hot)

&#x20; Desserts (icon: 🍨, weather\_tag: hot)



================================================================================

SECTION 13: LARAGON PROJECT SETUP SUMMARY

================================================================================



Quick reference for setting up the project from scratch.

See the full setup guide (hapag\_laragon\_setup.txt) for detailed steps.



1\. Install Laragon Full from laragon.org

2\. Open terminal in Laragon, go to C:\\laragon\\www

3\. Run: composer create-project laravel/laravel hapag

4\. Start Laragon — access http://hapag.test in browser

5\. Create MySQL database named hapag in HeidiSQL

6\. Configure .env — DB credentials, GROQ\_API\_KEY, OWM\_API\_KEY, DEFAULT\_CITY

7\. Add GROQ and OWM config entries to config/services.php

8\. Run: composer require laravel/breeze --dev

9\. Run: php artisan breeze:install blade

10\. Run: npm install then npm run dev (keep this terminal open)

11\. Add Hapag brand tokens to tailwind.config.js

12\. Run: php artisan migrate

13\. Write all 8 migration files, run: php artisan migrate:fresh

14\. Generate Models, Controllers, Middleware, and Seeder files via Artisan

15\. Write seeder data for Laguna restaurants with hardcoded coordinates

16\. Run: php artisan db:seed

17\. Write DatabaseBackup Artisan command

18\. Register in Kernel.php scheduler

19\. Test: php artisan db:backup



Artisan commands used most often during development:

&#x20; php artisan migrate:fresh --seed    (reset DB and reseed)

&#x20; php artisan db:backup               (test backup manually)

&#x20; php artisan schedule:work           (simulate daily scheduler)

&#x20; php artisan route:list              (debug routing issues)

&#x20; php artisan tinker                  (test Eloquent queries)

&#x20; npm run dev                         (compile Tailwind — keep running)



================================================================================

SECTION 14: WHAT NOT TO DO (COMMON MISTAKES)

================================================================================



Do NOT write raw SQL like: DB::statement("SELECT \* FROM restaurants WHERE...")

&#x20; Use Eloquent: Restaurant::where('status', 'active')->get()



Do NOT store cart data in PHP session.

&#x20; The cart is in the cart\_items database table. Always.



Do NOT call Nominatim or any geocoding API.

&#x20; Restaurant coordinates are hardcoded in the seeder. This is intentional.



Do NOT expose API keys in JavaScript files.

&#x20; All API calls to GROQ and OpenWeatherMap go through Laravel Controllers.

&#x20; JavaScript only calls your own Laravel routes.



Do NOT forget the CSRF token in AJAX POST requests.

&#x20; Laravel will return a 419 error without it.



Do NOT nest routes incorrectly — owner and admin routes must have both

&#x20; the auth middleware AND the role middleware:

&#x20; Route::middleware(\['auth', 'role:owner'])->group(...)



Do NOT let the Tailwind compile terminal close — Tailwind classes will stop

&#x20; working if npm run dev is not running.



Do NOT demo with empty database. Always run php artisan migrate:fresh --seed

&#x20; before every demo rehearsal to confirm seed data is clean and correct.



Do NOT use Playfair Display or any serif font anywhere in the UI.

&#x20; The only fonts in Hapag are Outfit (all text) and JetBrains Mono (prices/totals).

&#x20; Using serif fonts makes the app look generic and breaks brand consistency.



Do NOT integrate a real payment API (Stripe, PayMongo, GCash, PayPal, etc.).

&#x20; Hapag uses Cash on Pickup only — the customer pays the restaurant in person.

&#x20; No payment processing exists or should exist in this project.



Do NOT trust the voucher code or discount amount sent from the frontend.

&#x20; Always re-validate the voucher code server-side inside CartController@checkout.

&#x20; A customer could manipulate the submitted discount value — the server must

&#x20; recompute it from scratch using the voucher record in the database.



Do NOT create a VoucherUsage record or increment used\_count outside of a

&#x20; DB::transaction. If checkout fails and rolls back, the voucher must not be

&#x20; marked as used. Always wrap the entire checkout in one transaction.



Do NOT allow an owner to create vouchers for another owner's restaurant.

&#x20; Scope voucher creation so the restaurant\_id is always set to the authenticated

&#x20; owner's own restaurant — never accept restaurant\_id from the request directly.



================================================================================

END OF HAPAG MASTER CONTEXT FILE

================================================================================

