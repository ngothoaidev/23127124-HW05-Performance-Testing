# Soak Resource Trend

| Minute | Resource samples | Average working set | Maximum working set | Average private memory |
|---:|---:|---:|---:|---:|
| 0 | 60 | 130.30 MB | 183.38 MB | 155.20 MB |
| 1 | 59 | 186.68 MB | 189.86 MB | 216.47 MB |
| 2 | 59 | 131.46 MB | 191.02 MB | 147.07 MB |
| 3 | 59 | 165.46 MB | 188.34 MB | 192.70 MB |
| 4 | 59 | 190.16 MB | 192.80 MB | 219.26 MB |
| 5 | 59 | 192.74 MB | 195.57 MB | 221.60 MB |
| 6 | 59 | 194.76 MB | 197.75 MB | 222.81 MB |
| 7 | 59 | 197.89 MB | 203.61 MB | 223.77 MB |
| 8 | 59 | 205.91 MB | 209.89 MB | 226.08 MB |
| 9 | 59 | 207.07 MB | 211.34 MB | 227.38 MB |
| 10 (partial) | 30 | 206.86 MB | 210.66 MB | 228.59 MB |

The early drops reflect allocation and garbage-collection behavior during ramp-up. From minute 5 onward, both working set and private memory continue rising. This aligns with source evidence that cart entries are retained after checkout, but a longer run would be needed to estimate a steady leak rate reliably.

