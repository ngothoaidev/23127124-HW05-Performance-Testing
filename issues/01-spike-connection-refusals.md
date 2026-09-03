# Performance: backend refuses connections during a 600-VU spike

## Summary

During the corrected 600-VU Spike test, the backend refused connections during account registration and login.

## Environment

- Backend: Node.js/Express with SQLite at `http://127.0.0.1:3000`
- Load tool: JMeter 5.6.3
- Host: THOAI, Ryzen 7 8845H, 13.81 GB RAM
- Workload: 600 VUs, 2-second ramp-up, 90-second duration

## Evidence

- 83,242 HTTP samples
- 138 failed samples (0.1658%)
- 69 registration connection refusals
- 67 login connection refusals
- p95: 914 ms
- p99: 1,146 ms
- Maximum: 2,197 ms

![Corrected 600-VU Spike JMeter dashboard](https://raw.githubusercontent.com/ngothoaidev/23127124-HW05-Performance-Testing/master/evidence/issue-screenshots/spike-dashboard.png)

## Steps to reproduce

1. Restart the backend to reseed SQLite.
2. Run `23127124_Spike_20260903.jmx` with 600 threads, 2-second ramp-up, and 90-second duration.
3. Inspect the raw JTL for `HttpHostConnectException: Connection refused` entries.

## Expected

The service should either accept the configured load within its declared limit or provide controlled overload responses; connections should not be refused without an explicit capacity policy.

## Actual

Registration and login connections were refused during the spike, and p99 exceeded one second.
