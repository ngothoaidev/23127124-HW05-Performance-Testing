# 23127124 - HW05 AI Performance Testing

This repository contains the performance-testing submission for EShop using Apache JMeter.

## Current scope

- FR-01: Account registration
- FR-07: Shopping cart
- FR-17: Coupon management
- Supporting API calls: login, product list/detail, coupon application, and checkout

## Generate and run

```powershell
node scripts/generate-test-assets.js
powershell -ExecutionPolicy Bypass -File scripts/start-backend.ps1 -Scenario Smoke
powershell -ExecutionPolicy Bypass -File scripts/run-jmeter.ps1 -Scenario Load -Threads 1 -RampSeconds 1 -DurationSeconds 10
```

Measured runs must restart the backend before each scenario to reset SQLite and the in-memory carts.

## Test summary

- Measured scenarios: Load, two Stress levels, corrected Spike, and ten-minute Soak.
- Endpoint groups: auth-heavy, read-heavy, and transactional.
- Selected features: FR-01, FR-07, and FR-17.
- Endurance threshold demonstrated: 926.00 RPS at 250 VUs for ten minutes; p95 311 ms; 0% errors; maximum backend working set 211.34 MB.
- Published verified issues:
  - https://github.com/ngothoaidev/23127124-HW05-Performance-Testing/issues/1
  - https://github.com/ngothoaidev/23127124-HW05-Performance-Testing/issues/2
- Demo video: https://youtu.be/kmkiT8y2rXQ.
- Public repository: https://github.com/ngothoaidev/23127124-HW05-Performance-Testing.

## Submission status

| Criterion | Max | Self-assessed | Status |
|---|---:|---:|---|
| Load testing | 30 | 30 | Technical artifacts, screenshot, and demo complete |
| Stress testing | 20 | 20 | Technical artifacts, screenshot, and demo complete |
| Spike testing | 20 | 20 | Technical artifacts, screenshot, and demo complete |
| AI analysis and misinterpretation hunt | 10 | 10 | Complete with preserved human-review record |
| Continuous Performance Testing proposal | 10 | 10 | Complete |
| Agent Skill | 10 | 10 | Validated and demonstrated |
| **Total** | **100** | **100** | Ready for submission |

The submission now includes the unlisted narrated demo link, public repository, issues, screenshots, reports, test artifacts, and Git audit trail.
