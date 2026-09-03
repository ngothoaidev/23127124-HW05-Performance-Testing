# Student Evidence Rerun Summary

The JTL files generated while the student captured the required screenshots were parsed with `agent-skill/eshop-performance-testing/scripts/analyze_jtl.py`. Transaction Controller parent samples are excluded.

| Run | HTTP samples | Errors | Error rate | RPS | Average | p95 | p99 | Max working set |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Load-20260903200804 | 22,583 | 0 | 0.0000% | 124.66 | 1.95 ms | 6 ms | 24 ms | 177.10 MB |
| Stress-20260903201249 | 233,905 | 0 | 0.0000% | 1,290.52 | 149.28 ms | 349 ms | 453 ms | 201.43 MB |
| Spike-20260903201701 | 111,647 | 0 | 0.0000% | 1,218.19 | 376.18 ms | 743 ms | 865 ms | 212.54 MB |
| Final video demo, Load-20260903204223 | 5,831 | 0 | 0.0000% | 126.95 | 2.06 ms | 7 ms | 11 ms | 88.36 MB |

All three reruns completed with their declared profiles. They are retained as screenshot-verification evidence, while the earlier measured runs remain the primary analysis dataset so that the observed Spike connection-refusal event is not hidden.
