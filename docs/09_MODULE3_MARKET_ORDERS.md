# 09 — Module 3: Market (/market) and Orders (/orders)

Tabs: BUY, SELL, My Listings.

## BUY
Categories: Raw materials, Organic fertilizer (sold by farmers), Inorganic fertilizer (agro shops and authorized outlets, seeded as clearly labelled demo listings with generic names like "Demo Agro Centre, Nashik"; no real brands).
- Search: name, crop, seller, batch code.
- Filters: category, suitable crop, price range, district, availability, evidence status.
- Sort: price, rating, nearest demo distance.
- Cards in Image 1 style.
- Product detail drawer: seller, location (Maharashtra district), unit price, available stock, minimum order, delivery options, usage note, evidence status badge (Seller-provided / Not tested / Evidence not provided), batch link, demo reviews labelled "Demo reviews".
- "Government outlets and schemes" section lists demo outlet cards marked "Informational only".
- Quantity selector enforces minimum order and stock.
- Price breakdown always visible: subtotal + delivery fee (Farm pickup 0, Local delivery 50, Parcel 120) = total.
- Checkout: address (demo), delivery type, payment mode (UPI / COD, simulated). Place order creates ONE order, decrements stock, shows animated confirmation and "Demo order, no real payment was taken".

## SELL
Choose "Sell raw materials" or "Sell fertilizer".
- Raw materials form: name, description, how it is produced/how long it takes, shelf life, quantity, unit, price, location, pickup/delivery options, photo.
- Fertilizer: "List from my batch" imports batch code, recipe summary, quantity and only the evidence that exists.
- Validate required fields; cap quantity to available stock.
- Listing statuses: Draft, Active, Paused, Sold out.
- My Listings: edit, pause, update stock, see orders.
- Optional "Demo review" status for organic listings shown as "Simulated review queue", never as certification.

## ORDERS
Buyer / Seller mode toggle (same account can do both).
- Buyer: tabs All, Active, Completed, Cancelled; order cards; detail with animated timeline: PENDING_PAYMENT -> CONFIRMED -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED -> COMPLETED, plus CANCELLED. Price and listing snapshot stored in the order; item totals and fees; cancellation only before PACKED; "Inspect batch" link when a batch exists.
- Seller: incoming orders with buttons to advance only valid next statuses (enforced in ONE `orderService`); each change timestamped and visible on the buyer side.
- Review form (1-5 stars plus quality, packaging, delivery, crop used for) only after COMPLETED, one per order, updates the seller's average rating.
