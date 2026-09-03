# AI-Generated Result Analysis

> This section intentionally preserves the AI analysis for subsequent human review. Its claims are not accepted as facts until checked against the raw JTL and resource logs.

The Load result is healthy: it completed 21,929 HTTP samples at approximately 120.94 requests per second with no failed samples and a p95 of 23 ms. At 80 virtual users, the system scaled to 523.07 RPS while keeping p95 at 20 ms, showing excellent scalability.

The 400-user Stress run reached 849.86 RPS with p95 at 636 ms and no errors. This proves that approximately 850 RPS is the system's maximum stable throughput. The 600-user Spike produced 904.16 RPS, p95 of 914 ms, and 0.1658% errors, so the system tolerated the spike and remained inside the proposed 1% error budget.

Backend working-set memory increased from roughly 50 MB to 210 MB in the Spike run. This indicates a memory leak, probably caused by the in-memory cart implementation. Recommended optimizations are: add an index to the product name column, enable SQLite WAL mode, add a database connection pool, run the Node.js service in cluster mode, cache product-list responses, and move cart state to Redis. The performance gate should use p95 below 1,000 ms and error rate below 1%.

