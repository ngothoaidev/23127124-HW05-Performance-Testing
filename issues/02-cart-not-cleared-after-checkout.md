# Functional/performance: checkout does not clear the in-memory cart

## Summary

The specification requires the cart to be cleared after a successful checkout, but the backend inserts an order without removing entries from `userCarts[userId]`.

## Performance impact

Repeated cart/checkout iterations retain cart objects for the lifetime of the Node.js process. Under sustained traffic this can increase process memory and inflate `GET /api/cart` response bodies. A soak test is required to quantify the growth before calling it a confirmed memory leak.

The measured ten-minute Soak completed 557,131 HTTP samples with 0% errors. Its JMeter dashboard is retained as execution evidence; the resource trend and source review are documented separately in the repository.

![Ten-minute Soak JMeter dashboard](https://raw.githubusercontent.com/ngothoaidev/23127124-HW05-Performance-Testing/master/evidence/issue-screenshots/soak-dashboard.png)

## Steps to reproduce

1. Register and log in as a user.
2. Add a product with `POST /api/cart`.
3. Complete `POST /api/checkout`.
4. Call `GET /api/cart`.

## Expected

The cart is empty after successful checkout.

## Actual

The previously added product remains in the cart.
