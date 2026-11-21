# Amazing Sneaker

A sneaker storefront built completely on a whim.

No big plan, no client, no deadline — I just felt like making a shoe shop one evening, and this is what came out of it. A spontaneous side project, made for fun and for practice.

## What it is

A modern e-commerce UI for sneakers — Nike, Adidas and Puma — with 24 real shoes and real photos:

- A Moco-style shoebox hero: scroll down and the box opens, the Jordan 1 rises out
- Shop with filters by brand, category and price
- Product detail pages, size selection, wishlist and cart
- Checkout flow with a mock order number
- Order tracking page
- A full admin panel: manage products, orders and vouchers

## Tech

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand, TanStack Query
- GSAP ScrollTrigger + Lenis for motion
- MSW (Mock Service Worker) as a fake API — no backend

## Run it

```bash
npm install
npm run dev
```

Admin demo login: `admin@amazing.vn` / `123456`

## Notes

- Everything is mock data. Products, orders and vouchers reset when you refresh the page.
- Product photos are hotlinked from official brand CDNs and retailers, so they need an internet connection to load.
- Made just for fun. If you like it, that's a bonus.
