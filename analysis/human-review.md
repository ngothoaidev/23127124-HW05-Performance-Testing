# Human Review and Misinterpretation Hunt

## Corrections to the AI analysis

| AI claim | Correct evidence | Human correction |
|---|---|---|
| 850 RPS is proven as the maximum stable throughput. | Stress400 contains 154,758 HTTP samples, 0 errors, 849.86 RPS and p95 636 ms. The later Soak250 contains 557,131 samples at 926.00 RPS, p95 311 ms and 0 errors over ten minutes. | The short Stress run did not prove the threshold. The measured endurance threshold is 926 RPS under the specific 250-VU local configuration. |
| The 600-VU Spike fully tolerated the load. | Corrected Spike600 contains 83,242 HTTP samples, 138 errors (0.1658%), p95 914 ms and p99 1,146 ms. | The error rate is below 1%, but 136 failures were connection refusals during registration/login and p99 exceeded the proposed 1,000-ms threshold. The result is degraded, not fully healthy. |
| Growth from 50 MB to 210 MB proves a memory leak. | Spike samples start near 50.09 MB and peak at 210.68 MB over roughly 90 seconds. During Soak, average working set rises from 192.74 MB in minute 5 to 207.07 MB in minute 9 and peaks at 211.34 MB. | Spike alone was insufficient. The sustained trend plus the code path that never clears `userCarts[userId]` supports an application-level unbounded-retention issue, while the exact leak rate still depends on GC and response-size effects. |
| An ordinary index on product name will fix search performance. | The implementation uses `LIKE '%${searchQuery}%'`. | A normal B-tree index generally cannot accelerate a leading-wildcard search. Full-text search or a different query shape would need separate evaluation. |
| Add a database connection pool. | The SUT uses the `sqlite3` library and one local SQLite file. | This recommendation assumes a client/server database. A conventional network connection pool is not applicable and is classified as hallucinated for the current architecture. |
| Run Node.js in cluster mode. | Carts are stored in the process-local `userCarts` object. | Clustering before externalizing cart state would make different workers observe inconsistent carts. It is conditionally feasible only after shared state or sticky routing is introduced. |

## Recommendation classification

| Recommendation | Classification | Reasoning |
|---|---|---|
| Enable SQLite WAL | Feasible, measure first | It can improve read/write concurrency, but it does not remove all single-file write limits. |
| Redis-backed cart | Feasible | It removes unbounded process-local cart state and permits multi-process deployment, at added operational cost. |
| Cache product list | Feasible with invalidation | The product list is read-heavy, but product CRUD must invalidate cached values. |
| Ordinary index for `%keyword%` search | Unsupported | The leading wildcard prevents useful use of a normal B-tree index. |
| Database connection pool | Hallucinated for current SUT | SQLite is embedded rather than a network database with pooled connections. |
| Node cluster immediately | Unsafe as stated | Process-local carts must be externalized or routed consistently first. |
