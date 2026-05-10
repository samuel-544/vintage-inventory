# Concept Paper: Vintage Lighting & Interiors — Inventory Management System

**Prepared by:** Vintage Lighting & Interiors
**Date:** May 2026
**Version:** 1.0

---

## 1. Executive Summary

Vintage Lighting & Interiors operates two business divisions — **Vintage Lighting** and **Incredible** — dealing in lights, bulbs, basins, mixers, taps, switches, accessories, and interior products. As the business has grown, managing stock manually through notebooks or spreadsheets has become increasingly difficult and error-prone.

This document describes a custom-built, web-based inventory management system developed specifically for Vintage Lighting & Interiors. The system replaces manual stock tracking with a real-time digital solution that runs on any device, requires no installation, and keeps all data securely backed up in the cloud.

---

## 2. Problem Statement

Prior to this system, the business faced the following challenges:

- **No central stock record** — stock figures were tracked per person, leading to discrepancies between staff members.
- **No visibility on low stock** — staff had no reliable way to know when a product was running out until it was already sold out.
- **No dispatch history** — there was no log of what was sold, when, or how much stock remained after each sale.
- **Display pieces not tracked** — items placed on display in the showroom were not distinguished from store stock, creating confusion in counts.
- **No client follow-up system** — when a client asked for a product that was out of stock, there was no structured way to track that interest or alert staff when to follow up.
- **No faulty stock visibility** — damaged or incomplete items mixed into stock counts, inflating figures.
- **Reports required manual work** — generating a stock report to share with management or suppliers required manually compiling data.

---

## 3. Project Overview

The Vintage Lighting & Interiors Inventory Management System is a web application built and deployed in 2026. It is accessible via any browser on a phone, tablet, or computer — with no installation required.

The system is live at a dedicated web address (Vercel) and stores all data in a secure cloud database (Supabase), meaning stock figures are always up to date regardless of which device or person is accessing the system.

---

## 4. Technical Architecture

| Component | Technology |
|---|---|
| Frontend (UI) | React 19 + Vite |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel (auto-deploys on every update) |
| Export engine | SheetJS (Excel file generation) |
| Notifications | Web Push Notifications API |

The system follows a **cloud-first architecture**: all data lives in Supabase and is loaded fresh on every page open. Changes made on one device are immediately visible on all other devices.

---

## 5. Features

### 5.1 Two-Division Structure
The system is organised around the two business divisions — Vintage Lighting and Incredible — each with its own independent categories and products. Staff switch between divisions with a single tap.

### 5.2 Category and Product Management
- Add and delete product categories (e.g. Bulbs, Basin Mixers, Taps, Accessories)
- Add products under each category with store stock quantity, display quantity, and faulty quantity
- Edit any product's name or stock figures at any time
- Search by product name or by category

### 5.3 Stock Dispatching
- **Dispatch from store stock** — deducts sold quantity from the main store count and logs the transaction
- **Dispatch from display pieces** — separately tracks display items sold off the showroom floor, clearly marked in the log

### 5.4 Restocking and Returns
- **Restock** — adds incoming stock and records the quantity added
- **Goods returned** — separately logs items returned by clients, keeping the history clean and distinguishable from fresh stock arrivals

### 5.5 Reservations
- Reserve a specific quantity of a product for a client
- Reserved quantity is shown clearly against the product, separate from available store stock
- Reservations can be collected (stock deducted and sale logged) or cancelled

### 5.6 Display Piece Tracking
- Each product can have a separate display count tracked in amber
- Display items are dispatched through a separate button, keeping showroom stock distinct from store stock

### 5.7 Faulty / Incomplete Stock Tracking
- Record the number of damaged or incomplete units per product
- Faulty count is shown as a distinct badge, ensuring it is never confused with sellable stock

### 5.8 Low Stock Alerts
- Any product with 5 or fewer units in stock is automatically flagged with a visual low-stock warning, prompting staff to reorder

### 5.9 Client Interests Watchlist
- Register a client's name, WhatsApp number, and the products they are waiting for (with the quantity they need)
- The system continuously monitors stock levels against all registered client interests
- When a product's stock drops below a client's wanted quantity, an alert card appears prominently in the app
- A pre-written WhatsApp message addressed to the client is generated automatically — staff send it with one tap

### 5.10 Phone Notifications
- When the app is opened and there are active stock alerts for waiting clients, the phone displays a push notification immediately
- This ensures staff are reminded to act even if they do not scroll to the Client Interests section

### 5.11 Dispatch Log
- A running log of all dispatches, restocks, returns, reservations, and collections — showing the product name, quantity, remaining stock, and timestamp for each entry
- The log distinguishes between store dispatch, display dispatch, reservations, goods returned, and collected reservations

### 5.12 Reports and Exports
- **Export Current Stock to Excel** — generates a two-sheet Excel file (one sheet per division) showing all products and their current stock figures
- **Export Dispatch Log to Excel** — generates a full history of all stock movements
- On mobile, both exports include a **Share to WhatsApp** button for instant sharing with suppliers or management

---

## 6. Benefits

| Benefit | Impact |
|---|---|
| Real-time stock figures | Any staff member sees live data at any moment |
| Cloud backup | No risk of losing data if a phone or computer is lost |
| Works on any device | Phone, tablet, or computer — no installation |
| Client follow-up built in | No client interest falls through the cracks |
| Phone notifications | Staff are reminded automatically when action is needed |
| Excel reports in seconds | Management reports generated instantly with one tap |
| Full stock movement history | Disputes, audits, and reorder decisions backed by data |

---

## 7. Current Status

The system is fully built, deployed, and operational. It is live on Vercel with the Supabase database active and storing real business data. All features described in Section 5 are implemented and working.

Development has been iterative — features were built and refined based on real operational needs of the store, including the addition of goods returns tracking, faulty stock visibility, and the client watchlist after the initial launch.

---

## 8. Future Roadmap

The following features are candidates for a future phase, based on business needs:

- **True background notifications** — push alerts to the owner's phone even when the app is not open, using a scheduled background service
- **Supplier contact management** — link products to supplier contacts for faster reorder
- **Sales revenue tracking** — record selling prices and generate revenue summaries per period
- **User accounts** — separate logins for different staff members with activity tracking
- **Low stock reorder alerts via WhatsApp** — automatically draft a reorder message to the supplier when stock drops below threshold

---

## 9. Conclusion

The Vintage Lighting & Interiors Inventory Management System is a purpose-built digital tool that directly addresses the operational challenges of a growing retail business. It eliminates manual stock tracking, provides full visibility across both business divisions, and gives staff the information they need to serve clients promptly and prevent stock-outs.

The system is already live and in active use, with a clear path for further development as the business scales.

---

*Vintage Lighting & Interiors — Internal Document — May 2026*
