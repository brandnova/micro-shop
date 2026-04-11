# MicroShop Mobile App Integration Plan

## Status: Optional — Available on Request

This document describes how to build a React Native mobile app powered by the existing MicroShop API. It is intended for developers building the mobile client, or store owners commissioning it.

The mobile app covers the **customer-facing storefront only** — browsing, cart, checkout, order tracking, and payment proof upload. Admin operations remain on the web dashboard at `/store-admin`.

A separate admin mobile app is architecturally possible and is documented in the final section, but is considered a distinct engagement.

---

## Why React Native

The MicroShop backend is already a fully RESTful, stateless API. No backend changes are required to support a mobile client. React Native is the natural choice because:

- The web frontend is already React — component patterns, hooks, and API logic are directly transferable
- A single codebase targets both iOS and Android
- Expo simplifies build tooling significantly for a project of this scale

---

## API Foundation

The mobile app consumes the same API as the web frontend. Full endpoint documentation is in `API_DOCS.md`. Key endpoints used by the customer app:

| Purpose | Endpoint |
|---|---|
| List products | `GET /api/products/` |
| Product detail | `GET /api/products/{id}/` |
| Place order | `POST /api/orders/` |
| Track order | `GET /api/orders/track/?tracking_code=` |
| Upload payment proof | `POST /api/orders/upload-proof/` |
| Bank details | `GET /api/bank-details/` |
| Site settings | `GET /api/site-settings/` |
| Health check | `GET /api/health/` |

### Authentication

The customer app requires no authentication. All customer-facing endpoints are publicly accessible.

### Pagination

`GET /api/products/` returns paginated results (20 per page) with `next` and `previous` URLs. The mobile app should implement infinite scroll by fetching subsequent pages as the user scrolls, appending results to the existing list.

### CSRF

CSRF protection applies to mutation endpoints (`POST`, `PATCH`, `DELETE`). On the web this is handled via the `X-CSRFToken` header read from the cookie. In a native mobile context there are no cookies — configure the Django backend to exempt the API from CSRF for mobile clients, or use a DRF `SessionAuthentication`-free setup.

**Recommended backend addition for mobile support:**

In `core/views.py`, decorate all public mutation views with `@csrf_exempt` from `django.views.decorators.csrf`, or more cleanly, add DRF's `DEFAULT_AUTHENTICATION_CLASSES = []` which already disables session-based CSRF checking for API views (this is already in the current settings).

No backend change should be needed — verify by making a test `POST /api/orders/` from a mobile client without the `X-CSRFToken` header.

---

## Project Structure

```
microshop-mobile/
├── app/                        # Expo Router file-based routing
│   ├── (tabs)/
│   │   ├── index.tsx           # Product listing (home tab)
│   │   ├── cart.tsx            # Cart tab
│   │   └── orders.tsx          # Order tracking tab
│   ├── product/[code].tsx      # Product detail screen
│   ├── checkout.tsx            # Checkout screen
│   └── _layout.tsx             # Root layout, theme provider
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios instance pointing at API base URL
│   │   ├── products.ts         # Product fetching with pagination
│   │   ├── orders.ts           # Place order, track, upload proof
│   │   └── settings.ts         # Site settings, bank details
│   ├── components/
│   │   ├── ProductCard.tsx     # Grid card with image, name, price
│   │   ├── ProductModal.tsx    # Bottom sheet detail view
│   │   ├── CartItem.tsx        # Cart row with quantity control
│   │   ├── OrderStatusBadge.tsx
│   │   ├── StatusTimeline.tsx  # Status history list
│   │   └── BankDetailsCard.tsx
│   ├── hooks/
│   │   ├── useCart.ts          # Cart state with AsyncStorage persistence
│   │   ├── useSiteSettings.ts  # Fetch and cache site settings
│   │   └── useProducts.ts      # Paginated product fetching with infinite scroll
│   ├── context/
│   │   └── ThemeContext.tsx    # Accent color from site settings → React Native styles
│   ├── store/
│   │   └── cartStore.ts        # Zustand or Context store for cart
│   └── types/
│       └── index.ts            # Shared TypeScript interfaces
├── assets/                     # App icon, splash screen
├── app.json                    # Expo config
└── package.json
```

---

## Screens and UX Requirements

### Home / Product Listing

**Goal:** Fast, browsable catalogue with infinite scroll.

- Grid layout: 2 columns on phone, 3 on tablet
- Each card: primary image, product name, price, out-of-stock overlay
- Multi-image indicator (dot strip) if product has more than one image
- Category filter bar — horizontal scrollable pills, sticky at top
- Search bar — filters client-side within loaded products
- Pull-to-refresh reloads from page 1
- Tap a card → opens Product Detail screen

**Infinite scroll implementation:**

```ts
// src/hooks/useProducts.ts
const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>('/api/products/')
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    if (!nextUrl || loading) return
    setLoading(true)
    const res = await client.get(nextUrl)
    setProducts(prev => [...prev, ...res.data.results])
    setNextUrl(res.data.next ? new URL(res.data.next).pathname + new URL(res.data.next).search : null)
    setLoading(false)
  }

  return { products, loadMore, loading, hasMore: !!nextUrl }
}
```

Pass `onEndReached={loadMore}` to a `FlatList`.

---

### Product Detail

**Goal:** Full product information with image gallery and add-to-cart.

- Full-screen bottom sheet or modal screen
- Image gallery: horizontal swipe with dot indicators and thumbnail strip
- Product name, category, price, description
- Stock indicator
- Add to Cart button (disabled if out of stock)
- Share button — copies `{BASE_URL}/p/{code}/` to clipboard (same share URL as web)
- Delivery info block if `site_settings.delivery_methods` is set

---

### Cart

**Goal:** Review and edit cart before checkout.

- List of cart items: thumbnail, name, price, quantity controls
- Swipe-to-remove or remove button
- Order total at bottom
- Proceed to Checkout button
- Cart state persisted in `AsyncStorage` — survives app close (equivalent of web localStorage)

```ts
// Persist cart to AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage'

const saveCart = async (items: CartItem[]) => {
  await AsyncStorage.setItem('microshop_cart', JSON.stringify(items))
}

const loadCart = async (): Promise<CartItem[]> => {
  const stored = await AsyncStorage.getItem('microshop_cart')
  return stored ? JSON.parse(stored) : []
}
```

---

### Checkout

**Goal:** Collect customer details and place the order.

- Bank details card at top (from `/api/bank-details/`)
- Numbered instruction steps matching the web checkout flow:
  1. Fill in details and place order
  2. Transfer the exact amount to the displayed account
  3. Upload payment proof with your tracking code
  4. Track your order any time
- Form fields: Full Name, Email, Phone, Delivery Address, Order Note (optional)
- Form validation: required fields highlighted on submit attempt
- Submit → `POST /api/orders/` → success screen showing tracking code
- On success: prompt to upload payment proof immediately or dismiss to order tracking

---

### Order Tracking

**Goal:** Look up order status by tracking code.

- Text input for tracking code
- Submit → `GET /api/orders/track/?tracking_code=`
- Result shows: customer name, tracking code, total, status badge, item list, status history timeline
- Upload payment proof shortcut: if status is `pending`, show a button to navigate to the upload screen

---

### Payment Proof Upload

**Goal:** Attach a receipt to an existing order.

- Tracking code input (pre-filled if navigating from order confirmation or tracking screen)
- File picker using `expo-image-picker` or `expo-document-picker`
  - Images: JPG, PNG (converted to WebP server-side)
  - Documents: PDF
  - Max 10MB
- Upload via `POST /api/orders/upload-proof/` as `multipart/form-data`
- Success → navigate to tracking screen for that code

---

## Cart Persistence

Use `AsyncStorage` instead of `localStorage`. The pattern is identical to the web implementation — load on app start, save on every cart change:

```ts
// On app start
useEffect(() => {
  loadCart().then(setItems)
}, [])

// On cart change
useEffect(() => {
  saveCart(items)
}, [items])
```

---

## Theme from Site Settings

The web app injects `main_color` from site settings as a CSS variable. In React Native, use a context that fetches settings on startup and provides the accent color as a value used in `StyleSheet` objects:

```ts
// src/context/ThemeContext.tsx
const ThemeContext = createContext({ accent: '#6366f1' })

export const ThemeProvider = ({ children }) => {
  const [accent, setAccent] = useState('#6366f1')

  useEffect(() => {
    getSiteSettings().then(s => {
      if (s.main_color) setAccent(s.main_color)
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ accent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

Use `useTheme()` wherever accent color is needed instead of hardcoding colors.

---

## Navigation Structure

Using Expo Router (file-based, equivalent to Next.js routing):

```
(tabs)/
  index          — Products
  cart           — Cart (badge showing item count)
  orders         — Track Order

product/[code]   — Product detail (modal or push)
checkout         — Checkout form
upload-proof     — Payment proof upload
```

Tab bar icons: Products (grid), Cart (bag with badge), Orders (package).

---

## Notifications (Optional Enhancement)

The API sends email notifications at every status change. As an optional enhancement, push notifications can be implemented by:

1. Collecting an Expo push token at app start
2. Sending the token to the backend when an order is placed (add a `push_token` field to the order creation request)
3. Triggering Expo's push API from Django when `partial_update` fires a status change

This requires a minor backend addition — a `push_token` field on `Transaction` and a call to `https://exp.host/--/api/v2/push/send` in `send_status_update_email`. Not included in the base scope.

---

## Recommended Packages

| Package | Purpose |
|---|---|
| `expo` | Build toolchain and managed workflow |
| `expo-router` | File-based navigation |
| `axios` | HTTP client (same as web) |
| `@react-native-async-storage/async-storage` | Cart and settings persistence |
| `expo-image-picker` | Select images for payment proof |
| `expo-document-picker` | Select PDF for payment proof |
| `expo-clipboard` | Copy share link and tracking code |
| `react-native-reanimated` | Smooth animations |
| `@shopify/flash-list` | High-performance product grid |
| `zustand` | Optional lightweight state for cart (alternative to Context) |

---

## API Base URL Configuration

In development, the app points at your local Django server. In production, it points at the deployed URL. Use Expo's environment variable system:

```ts
// src/api/client.ts
import axios from 'axios'
import Constants from 'expo-constants'

const BASE_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:8000'

const client = axios.create({ baseURL: BASE_URL, timeout: 15000 })
export default client
```

In `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-deployed-app.onrender.com"
    }
  }
}
```

For local dev, override with `EXPO_PUBLIC_API_URL` in a `.env` file.

---

## Admin Mobile App (Separate — On Request)

The admin dashboard is deliberately excluded from the customer app. If requested, it should be built as a **separate Expo app** (separate repo, separate build) rather than a tab in the customer app. This keeps the customer app lean and avoids shipping admin logic to end users.

**Scope of an admin mobile app:**

| Feature | Endpoint |
|---|---|
| View and search orders | `GET /api/orders/` |
| Update order status | `PATCH /api/orders/{id}/` |
| View payment proofs | Open `payment_proof` URL in browser |
| View product list | `GET /api/products/?status=all` |
| Basic stats | Client-side derivation from orders list |

**Authentication:**

The existing Admin Token system works for mobile — the admin enters their token in a login screen, it is stored in `SecureStore` (`expo-secure-store`), and sent as a request header or verified via `POST /api/verify-admin/` on app start.

```ts
import * as SecureStore from 'expo-secure-store'

const saveToken  = (t: string) => SecureStore.setItemAsync('adminToken', t)
const loadToken  = ()           => SecureStore.getItemAsync('adminToken')
const clearToken = ()           => SecureStore.deleteItemAsync('adminToken')
```

**What is deliberately excluded from mobile admin:**

- Product creation and image upload (complex on mobile, better on web)
- Site settings editing
- Bank details management

These operations are infrequent enough that directing the admin to the web dashboard for them is the right call.

---

## Closing Note

The MicroShop backend was designed API-first, so mobile integration requires no backend modifications for the core customer flow. The entire scope described here is achievable with the existing API exactly as deployed. The only additions that would require backend work are push notifications and admin token header auth — both optional enhancements that can be added if and when the mobile app is commissioned.
