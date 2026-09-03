---
name: eshop-performance-testing
description: Design, run, validate, and analyze reproducible Apache JMeter performance tests for the EShop Node.js/SQLite SUT. Use for Load, Stress, Spike, or Soak workflows and JTL metric analysis; do not use to fabricate execution evidence, video, screenshots, or student review.
---

# EShop Performance Testing

Produce attributable performance-test artifacts while preserving a clean distinction between measured evidence and interpretation.

## Workflow

1. Read [references/eshop-api.md](references/eshop-api.md) before creating or changing a test plan.
2. Confirm the selected workflow covers auth-heavy, read-heavy, and transactional requests. When roles differ, use explicit setup/main/teardown groups rather than pretending that one user performs administrator work.
3. Make identities and mutable records unique per run. Ensure the CSV has at least as many unique rows as the peak virtual-user count.
4. Run a one-user smoke test before measured runs. Require successful token extraction before executing authenticated samplers.
5. Restart the SUT before each measured scenario because startup reseeds SQLite and clears in-memory carts.
6. Run JMeter non-GUI, saving the complete JTL, HTML Dashboard, JMeter log, exact parameters, and backend resource samples.
7. Use `scripts/analyze_jtl.py` against the selected run directories. Cite exact values from the raw JTL when correcting an AI interpretation.
8. Treat thresholds as measured conclusions only after baseline and sustained-load evidence. Distinguish HTTP correctness, latency saturation, resource saturation, and load-generator limits.

## Required checks

- Keep the test-plan filename format `{StudentID}_{ScenarioType}_{YYYYMMDD}.jmx`.
- Use the same end-to-end workflow in Load, Stress, and Spike plans.
- Do not count JMeter Transaction Controller parent samples as HTTP requests or RPS.
- Reject a measured run when duplicate input data, failed correlation, or invalid tokens cause cascading errors.
- Record test-plan corrections instead of silently deleting failed calibration runs.
- Do not claim a memory leak from two points or a short warm-up. Use a sustained time series and report it as suspected unless growth remains systematic.
- Preserve raw artifacts. Never synthesize JTL rows or hardware evidence.

## Stopping conditions

Stop increasing load when the SUT becomes unavailable, the load generator is resource-saturated, error rate is materially above the agreed limit, or additional virtual users no longer increase throughput while latency rises sharply. Do not retry destructive or externally visible actions without explicit authorization.
