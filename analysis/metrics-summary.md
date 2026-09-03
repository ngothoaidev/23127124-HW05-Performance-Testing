# Performance Metrics Summary

Transaction Controller parent samples are excluded from request counts and throughput.

| Run | HTTP samples | Errors | Error rate | RPS | Average | p50 | p90 | p95 | p99 | Max | Max working set |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Load | 21929 | 0 | 0.0000% | 120.94 | 3.72 ms | 1 ms | 10 ms | 23 ms | 28 ms | 144 ms | 177.68 MB |
| Stress80 | 126316 | 0 | 0.0000% | 523.07 | 5.50 ms | 2 ms | 14 ms | 20 ms | 38 ms | 290 ms | 183.77 MB |
| Stress400 | 154758 | 0 | 0.0000% | 849.86 | 280.66 ms | 266 ms | 557 ms | 636 ms | 770 ms | 1044 ms | 197.57 MB |
| Spike600 | 83242 | 138 | 0.1658% | 904.16 | 467.33 ms | 456 ms | 815 ms | 914 ms | 1146 ms | 2197 ms | 210.68 MB |
| Soak250 | 557131 | 0 | 0.0000% | 926.00 | 146.90 ms | 139 ms | 269 ms | 311 ms | 396 ms | 2466 ms | 211.34 MB |

## Load

No failed HTTP samples.

Backend working set changed from 51.60 MB to 176.47 MB, with a maximum of 177.68 MB.

## Stress80

No failed HTTP samples.

Backend working set changed from 50.27 MB to 87.57 MB, with a maximum of 183.77 MB.

## Stress400

No failed HTTP samples.

Backend working set changed from 51.45 MB to 194.44 MB, with a maximum of 197.57 MB.

## Spike600

| Count | Sampler | Code | Message |
|---:|---|---|---|
| 69 | FR01 - Register Unique User | Non HTTP response code: org.apache.http.conn.HttpHostConnectException | Non HTTP response message: Connect to 127.0.0.1:3000 [/127.0.0.1] failed: Connection refused: getsockopt |
| 67 | AUTH - Login Registered User | Non HTTP response code: org.apache.http.conn.HttpHostConnectException | Non HTTP response message: Connect to 127.0.0.1:3000 [/127.0.0.1] failed: Connection refused: getsockopt |
| 2 | AUTH - Login Registered User | 401 | Unauthorized |

Backend working set changed from 50.09 MB to 210.41 MB, with a maximum of 210.68 MB.

## Soak250

No failed HTTP samples.

Backend working set changed from 51.24 MB to 206.93 MB, with a maximum of 211.34 MB.
