# EShop API Notes

Default base URL: `http://127.0.0.1:3000`.

| Purpose | Endpoint | Authentication |
|---|---|---|
| Register | `POST /api/register` | None |
| Login | `POST /api/login` | None; extract `$.token` and `$.user.id` |
| Product list/detail | `GET /api/products`, `GET /api/products/:id` | None |
| Cart read/write | `GET /api/cart`, `POST /api/cart` | Bearer user token |
| Apply coupon | `POST /api/apply-coupon` | API accepts `user_id` in body |
| Checkout | `POST /api/checkout` | Bearer user token |
| Coupon list | `GET /api/coupons` | Bearer token |
| Coupon create/delete | `POST /api/admin/coupons`, `DELETE /api/admin/coupons/:id` | Bearer token; implementation does not enforce admin role |

Non-obvious SUT behavior:

- Importing `database.js` from `server.js` recreates and seeds the database on every backend start.
- Carts are stored in process memory and checkout does not clear them, contrary to the specification.
- Cart POST appends duplicate products rather than increasing an existing quantity.
- Login failures increment attempts by two and lock for 180 seconds, while the specification says one increment and 30 seconds.
- Percent coupons calculate the discount incorrectly in the implementation.
- The backend is a single Node.js process with SQLite; write-heavy concurrency can serialize.

