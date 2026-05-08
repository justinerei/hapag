# Hapag Smoke Test Checklist

Run through every item below after migrating. Check off each item as you verify it.

---

## 1. Public Pages (Guest)

- [ ] Visit `/` as a guest — see the guest landing page (not the customer home)
- [ ] Click "Browse Restaurants" or equivalent CTA — redirects to login, not a 500 error
- [ ] Visit `/restaurants` — restaurant index page loads with cards
- [ ] Filter or browse restaurants — cards render with names, images, municipality
- [ ] Click a restaurant card — navigates to `/menu/{restaurant}` (the show page)
- [ ] Restaurant menu page loads — hero, category tabs, and menu items visible
- [ ] Click "Add to Cart" on a menu item as a guest — redirected to login page

---

## 2. Auth Flow

- [ ] Visit `/register` — registration form loads (name, email, password, municipality field present)
- [ ] Register a new customer account with a valid municipality (e.g., "Los Baños") — lands on customer home `/`
- [ ] Log out via the navbar — redirected to guest home or login
- [ ] Visit `/login` — login form loads
- [ ] Log in with the new customer account — lands on `/` (customer home)
- [ ] Log in with an owner account — redirected to `/owner` dashboard
- [ ] Log in with an admin account — redirected to `/admin` dashboard
- [ ] Visit `/forgot-password` — form loads without error
- [ ] Submit forgot password with a valid email — success message shown (email sent or queued)
- [ ] Attempt login with wrong password — validation error shown, not a 500

---

## 3. Customer Flow

### Add to Cart
- [ ] Log in as a customer
- [ ] Visit a restaurant menu — click "Add to Cart" on any item — cart badge increments in navbar
- [ ] Add the same item again — quantity increases (not a duplicate line)
- [ ] Add a different item from the **same** restaurant — both items appear in cart

### Cart Conflict
- [ ] With items already in cart from Restaurant A, visit Restaurant B and add an item
- [ ] Conflict prompt appears (modal or alert) asking to clear current cart
- [ ] Choose "Cancel" — original cart items preserved, new item not added
- [ ] Repeat and choose "Replace" / "Clear" — original items removed, new item added

### Voucher
- [ ] Open cart — enter an **invalid** voucher code — error message shown ("not found" or "invalid")
- [ ] Enter an **expired** voucher code — appropriate error shown
- [ ] Enter a **valid, active** voucher code that meets the minimum order — discount applied, total updates
- [ ] Remove the voucher — total reverts to original

### Checkout — Pickup
- [ ] In cart with valid items, select "Pickup" as order type
- [ ] Submit checkout — order created, cart emptied, success/confirmation shown
- [ ] Visit `/orders` — new order appears with status "Pending" and type "PICKUP"

### Checkout — Delivery
- [ ] Add items to cart, select "Delivery" as order type
- [ ] Enter a delivery address — submit checkout
- [ ] Visit `/orders` — new order appears with status "Pending", type "DELIVERY", and address visible

### View Orders
- [ ] Visit `/orders` — all past orders listed with restaurant name, items, total, status, and order type badges

---

## 4. Owner Flow

### Restaurant Setup
- [ ] Log in as a new owner (no restaurant assigned) — setup page shown at `/owner/setup`
- [ ] Fill in restaurant details (name, address, municipality, opening/closing time, image) and submit
- [ ] Confirmation shown — owner dashboard loads (restaurant in "pending" approval state)

### Manage Menu
- [ ] From owner dashboard, add a new menu item (name, price, category, image) — item appears in list
- [ ] Edit an existing menu item — changes persist after save
- [ ] Toggle a menu item's availability off — item shows as unavailable
- [ ] Toggle availability back on — item shows as available
- [ ] Delete a menu item — item removed from list

### Process Orders
- [ ] As a customer, place a Pickup order at the owner's restaurant
- [ ] Log in as the owner — new order visible in dashboard with "PICKUP" badge
- [ ] Place a Delivery order as the customer — owner dashboard shows it with "DELIVERY" badge **and** the delivery address
- [ ] Owner moves Pickup order: Pending → Preparing — status updates
- [ ] Owner moves order: Preparing → Ready — status updates

### Voucher
- [ ] Owner creates a restaurant-scoped voucher (percentage discount, min order, expiry) — appears in voucher list
- [ ] Customer applies the voucher at the owner's restaurant — accepted
- [ ] Customer tries the same voucher at a **different** restaurant — rejected

---

## 5. Admin Flow

### Approve Restaurant
- [ ] Log in as admin — new pending restaurant (from owner setup above) visible in dashboard
- [ ] Approve the restaurant — it now appears on the customer-facing restaurant list
- [ ] Unapproved restaurants are **not** visible to customers on `/restaurants` or `/`

### Manage Categories
- [ ] Admin adds a new category (name, weather_tag) — appears in category list
- [ ] Admin edits an existing category — changes persist
- [ ] Admin deletes a category — removed from list (verify no orphaned menu items crash)

### Site-wide Voucher
- [ ] Admin creates a site-wide voucher (no restaurant restriction) — appears in voucher list
- [ ] Customer applies voucher at any restaurant — accepted
- [ ] Admin edits the voucher (change discount or expiry) — changes apply
- [ ] Admin deletes the voucher — removed; customer can no longer apply it

### Database Backup
- [ ] Admin clicks "Backup" — success response (no 500 error, backup file created or download triggered)

---

## 6. Edge Cases

### Empty Cart Checkout
- [ ] Navigate to `/cart` with an empty cart — empty state shown, checkout button absent or disabled
- [ ] Attempt POST to `cart.checkout` with empty cart (via URL or form submission) — error shown, no order created

### Expired Voucher
- [ ] Apply a voucher with `expires_at` in the past — error: "Voucher has expired"
- [ ] Confirm no discount is applied to the order total

### Cross-Restaurant Cart Conflict
- [ ] Add items from Restaurant A — then add an item from Restaurant B without clearing
- [ ] Conflict UI triggers (not a silent overwrite, not a 500)
- [ ] After clearing and adding from Restaurant B, confirm cart contains **only** Restaurant B items

### Delivery Without Address
- [ ] Select "Delivery" at checkout but leave the address field blank
- [ ] Submit — validation error shown, order **not** created
- [ ] Confirm the cart is still intact after the failed submission

### Voucher Already Used
- [ ] Apply a valid voucher, complete checkout successfully
- [ ] Go back to cart (add items again) and try the same voucher code
- [ ] Error shown: "You have already used this voucher"

### Max Uses Reached
- [ ] Use a voucher with `max_uses = 1` as one customer — succeeds
- [ ] Log in as a different customer, apply the same code — error: "Voucher is no longer available" (or similar)

---

*Generated for Hapag — LSPU ITEL 203 | Run after each major migration or deployment.*
