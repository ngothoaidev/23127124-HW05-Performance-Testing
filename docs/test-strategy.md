# HW05 Performance Test Strategy

## Scope

- Student ID: `23127124`
- SUT: EShop backend API
- Base URL: `http://127.0.0.1:3000`
- Tool: Apache JMeter 5.6.3 with Temurin 21
- Selected features: FR-01 Registration, FR-07 Shopping Cart, FR-17 Coupon Management

## End-to-end workflow

The same business workflow is used by Load, Stress, and Spike tests:

1. A setup administrator logs in and creates a run-specific coupon (FR-17).
2. Each virtual user registers a unique account (FR-01) and logs in once.
3. The user lists and opens a product to provide the read-heavy part of the workload.
4. The user adds the product to the cart and reads the cart (FR-07).
5. The user applies the run-specific coupon and checks out, providing transactional work.
6. A teardown administrator deletes the run-specific coupon (FR-17).

This is a multi-role end-to-end business process: campaign setup, customer onboarding, shopping, and campaign cleanup. Supporting endpoints are included because FR-01, FR-07, and FR-17 alone do not satisfy the homework's explicit read-heavy/auth-heavy/transactional coverage requirement.

## Initial load profiles

| Scenario | VUs | Ramp-up | Duration | Distinct report view |
|---|---:|---:|---:|---|
| Load | 15 | 30 s | 180 s | Summary Report |
| Stress | 400 | 60 s | 180 s | Aggregate Report |
| Spike | 600 | 2 s | 90 s | Aggregate Graph |
| Soak | 250 | 60 s | 600 s | HTML Dashboard plus raw JTL |

These final values were selected after a one-user smoke run, a 15-VU Load baseline, and an 80-VU Stress calibration. The calibration showed no saturation, so the final Stress plan was increased to 400 VUs. The Spike was increased to 600 VUs to produce an abrupt overload signal, and the Soak was placed at 250 VUs near the measured throughput plateau.

## Human review of the AI-assisted design

The first AI proposal treated FR-01, FR-07, and FR-17 as if they formed a natural single-user journey. This was incomplete because FR-17 is an administrator feature and none of the three selected features is a suitable read-heavy product flow. The corrected design uses explicit setup and teardown administrator groups and adds product reads as supporting endpoints. Registration and login run once per virtual user to prevent duplicate-account failures and unrealistic repeated authentication inside every shopping iteration.

The first executable smoke plan also placed a random timer at Thread Group scope. In JMeter, that timer applied before every sampler instead of once per business iteration, multiplying the intended think time and artificially reducing throughput. Human review replaced it with one Flow Control Action pause at the end of each iteration.

The first 600-VU Spike calibration exposed a second test-design defect: the initial CSV had only 250 rows, so recycled user indexes caused duplicate registration attempts. Authentication failures then produced cascading 403 responses in later samplers. The corrected data set contains 1,000 rows, and the business flow is guarded so it runs only when token extraction confirms a successful login. The pre-correction run is retained as audit evidence but is not used as the authoritative Spike result.

The listeners are distinct to satisfy the assignment. Their overhead must be acknowledged; the authoritative measurements are the CLI-generated raw JTL and HTML Dashboard.

## Reproducibility and isolation

The backend calls `database.js` at startup and therefore recreates and seeds SQLite on every restart. The managed start script restarts the backend before each measured scenario, yielding a clean database and empty in-memory carts. Each run uses a unique timestamp in user emails and coupon codes.

## Initial pass/fail hypotheses

- HTTP and assertion error rate below 1% during the stable Load run.
- p95 response time below 1000 ms during the stable Load run.
- No sustained backend CPU saturation above 90%.
- No unbounded working-set growth during Soak after accounting for Node.js warm-up.
- After Spike, p95 and error rate should return toward the pre-spike range.

These are proposed thresholds, not measured conclusions. Final thresholds must be replaced with values derived from raw JTL and resource logs.
