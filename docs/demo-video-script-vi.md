# Kịch bản demo video 6-8 phút

Video phải do sinh viên tự quay, có giọng tiếng Việt của sinh viên và JMeter cùng Task Manager trong một khung hình.

## 0:00-0:45 - Giới thiệu

"Em là sinh viên 23127124. Bài HW05 kiểm thử hiệu năng EShop bằng JMeter 5.6.3. Workflow của em dùng FR-01 đăng ký, FR-07 giỏ hàng và FR-17 quản lý coupon, đồng thời thêm login, đọc sản phẩm, áp dụng coupon và checkout để đủ ba nhóm auth-heavy, read-heavy và transactional."

Hiển thị:

- Ba file JMX có tên đúng quy định.
- `test-data/users.csv`.
- Task Manager ở tab Performance và Details.

## 0:45-1:45 - Giải thích test plan

Mở JMeter bằng:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/open-jmeter.ps1
```

Trong JMeter, chỉ lần lượt chỉ vào:

- Setup Thread Group: admin login và tạo coupon FR-17.
- Main Thread Group: CSV, đăng ký FR-01, login/token extraction, product reads, cart FR-07, apply coupon, checkout.
- Teardown Thread Group: xóa coupon.
- Ba report view khác nhau: Summary Report, Aggregate Report, Aggregate Graph.

Nói rõ lần đo chính chạy non-GUI để listener GUI không làm sai lệch kết quả.

## 1:45-3:45 - Chạy và bằng chứng

Đặt Task Manager và terminal cạnh nhau. Chạy một bản demo ngắn, không thay thế raw log chính:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-backend.ps1 -Scenario VideoDemo
powershell -ExecutionPolicy Bypass -File scripts/run-jmeter.ps1 -Scenario Load -Threads 15 -RampSeconds 5 -DurationSeconds 45
```

Trong lúc chạy, chỉ CPU/RAM của `node.exe`, output JMeter và thời gian. Không che hostname khi quay phần hardware.

## 3:45-5:15 - Kết quả chính

Mở HTML Dashboard của các run chính và thuyết minh:

- Load: 120,94 RPS, p95 23 ms, 0 lỗi.
- Stress 400 VU: 849,86 RPS, p95 636 ms, 0 lỗi; throughput bắt đầu phẳng trong khi latency tăng mạnh.
- Spike 600 VU: 904,16 RPS, p95 914 ms, p99 1.146 ms, error rate 0,1658%; chủ yếu connection refused lúc register/login.
- Soak 250 VU/10 phút: 926 RPS, p95 311 ms, 0 lỗi, working set tối đa 211,34 MB.

## 5:15-6:30 - Human review và Agent Skill

Trình bày ba lỗi AI đã được sửa:

1. Timer đặt sai scope làm delay trước mọi request.
2. CSV 250 dòng không đủ cho Spike 600 VU.
3. VU login lỗi vẫn tiếp tục gửi token không hợp lệ, tạo lỗi 403 dây chuyền.

Mở `agent-skill/eshop-performance-testing/SKILL.md` và chạy analyzer hoặc hiển thị `analysis/metrics-summary.md`. Giải thích skill không tạo log giả; nó chỉ chạy, kiểm tra và phân tích bằng chứng thật.

## 6:30-7:15 - Kết luận

"Ngưỡng endurance thực nghiệm trên máy THOAI là 926 RPS trong 10 phút tại 250 VU, p95 311 ms, error rate 0%, working set tối đa 211,34 MB. Cart không được xóa sau checkout nên có rủi ro giữ bộ nhớ tăng dần. Em không kết luận từ AI mà đã kiểm tra raw JTL, resource log và source code."

Kết thúc bằng cách hiển thị Git commit log và public GitHub repository.

