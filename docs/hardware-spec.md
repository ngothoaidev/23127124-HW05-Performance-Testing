# Hardware Specification

| Field | Value |
|---|---|
| Hostname | THOAI |
| Operating system | Microsoft Windows 11 Home, version 10.0.26200 |
| CPU | AMD Ryzen 7 8845H with Radeon 780M Graphics |
| Logical processors | 16 |
| RAM | 16 GB installed; 13.81 GB usable during the original measurement |
| GPU | AMD Radeon 780M Graphics |
| Load generator | Same host as the backend |

The attached `evidence/hardware-dxdiag.png` confirms the hostname, processor, and 16 GB installed memory. Running the load generator and SUT on one host introduces resource contention and limits the external validity of the measurements; this trade-off is discussed in the report.
