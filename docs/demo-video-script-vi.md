# Kịch bản demo đơn giản 6-7 phút

Không cần mở JMeter GUI và không dùng `scripts/open-jmeter.ps1` trong video. Bài kiểm thử được chạy bằng JMeter non-GUI qua PowerShell; cách này giảm overhead và đã tạo JTL, HTML Dashboard cùng resource log thật.

## Chuẩn bị trước khi bấm quay

1. Mở PowerShell tại `C:\Users\thoai\OneDrive\Documents\ChatGPT\Homework 5`.
2. Mở Task Manager bằng `Ctrl + Shift + Esc`, đặt bên phải PowerShell.
3. Mở sẵn file PDF `output\pdf\23127124_HW05_AI_Performance_Report.pdf`.
4. Bảo đảm microphone thu rõ và màn hình hiển thị được đồng hồ Windows.

## Cảnh 1 — Giới thiệu (0:00-0:40)

Trong PowerShell chạy:

```powershell
Get-ChildItem test-plans
```

Lời thoại:

> Em là sinh viên 23127124. Đây là bài HW05 về kiểm thử hiệu năng hệ thống EShop bằng Apache JMeter 5.6.3. Em chọn ba chức năng là FR-01 đăng ký tài khoản, FR-07 giỏ hàng và FR-17 quản lý coupon. Repository công khai của bài chứa test plan, dữ liệu CSV, kết quả đo, báo cáo, AI audit, Agent Skill và lịch sử Git theo từng giai đoạn.

## Cảnh 2 — Giải thích thiết kế (0:40-1:45)

Chạy:

```powershell
Get-ChildItem test-plans,test-data
notepad docs\test-strategy.md
```

Chỉ vào danh sách bốn file Load, Stress, Spike và Soak; sau đó chỉ vào bảng test profile trong Notepad.

Lời thoại:

> Workflow bắt đầu bằng admin login và tạo coupon cho FR-17. Mỗi virtual user lấy dữ liệu riêng từ file CSV, đăng ký theo FR-01, login và trích xuất JWT. Sau đó user đọc danh sách và chi tiết sản phẩm, thêm và xem giỏ hàng theo FR-07, áp dụng coupon rồi checkout. Cuối test, teardown group đăng nhập admin và xóa coupon vừa tạo. Em bổ sung các request đọc sản phẩm để có đủ ba nhóm endpoint auth-heavy, read-heavy và transactional. Dữ liệu có một nghìn user nên đủ cho mức Spike sáu trăm virtual user.

> Bốn profile chính gồm Load 15 VU, Stress 400 VU, Spike 600 VU tăng trong 2 giây, và Soak 250 VU trong 10 phút. Các lần đo chính đều chạy non-GUI để giao diện listener không làm sai lệch CPU, RAM và response time.

Đóng Notepad để quay lại PowerShell và Task Manager.

## Cảnh 3 — Chạy JMeter non-GUI (1:45-3:00)

Chạy lần lượt:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/stop-backend.ps1
powershell -ExecutionPolicy Bypass -File scripts/start-backend.ps1 -Scenario VideoDemo
powershell -ExecutionPolicy Bypass -File scripts/run-jmeter.ps1 -Scenario Load -Threads 15 -RampSeconds 5 -DurationSeconds 45
```

Trong 45 giây chờ test, chỉ vào `OpenJDK Platform binary`, `Node.js JavaScript Runtime`, CPU và Memory trong Task Manager.

Lời thoại:

> Em đang chạy một Load demo ngắn bằng chính file JMX của bài. Script khởi động riêng backend tại địa chỉ 127.0.0.1 cổng 3000 và reseed SQLite để mỗi lần chạy có trạng thái ban đầu giống nhau. JMeter dùng 15 virtual user, ramp-up 5 giây và chạy 45 giây. Đây chỉ là demo thao tác; kết luận trong báo cáo dùng các lần chạy đầy đủ.

> Java là tiến trình tạo tải, còn Node.js là backend được đo. Script lấy working set, private memory, CPU time và thread count của backend mỗi giây. Sau khi hoàn tất, terminal sẽ in đường dẫn tới raw JTL, HTML Dashboard và resource-usage CSV. Vì vậy kết quả có thể kiểm tra lại thay vì chỉ dựa vào ảnh chụp màn hình.

Khi terminal báo `Completed Load`, chỉ vào ba đường dẫn JTL, HTML và Resources rồi chạy:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/stop-backend.ps1
```

## Cảnh 4 — Trình bày kết quả chính (3:00-4:25)

Mở PDF:

```powershell
Start-Process "output\pdf\23127124_HW05_AI_Performance_Report.pdf"
```

Di chuyển tới mục **5. Results** và chỉ vào bảng kết quả.

Lời thoại:

> Load 15 VU đạt 120 phẩy 94 request mỗi giây, p95 23 mili giây và không có lỗi. Stress 400 VU đạt 849 phẩy 86 request mỗi giây, nhưng p95 tăng lên 636 mili giây. So với Stress 80 VU, concurrency tăng năm lần nhưng throughput chỉ tăng khoảng 1 phẩy 62 lần, nên hệ thống đã đi vào vùng bão hòa độ trễ.

> Spike 600 VU đạt khoảng 904 request mỗi giây, p95 914 mili giây, p99 1.146 mili giây và error rate 0 phẩy 1658 phần trăm. Lỗi chủ yếu là connection refused ở register và login. Soak 250 VU chạy đủ 10 phút đạt 926 request mỗi giây, p95 311 mili giây, không có lỗi và working set tối đa 211 phẩy 34 MB. Vì vậy 926 RPS là ngưỡng endurance đã chứng minh trên chính máy này, không phải cam kết cho môi trường production khác.

Cuộn tới mục **12. Student-captured evidence** và hiển thị nhanh bốn ảnh.

## Cảnh 5 — Human review và Agent Skill (4:25-5:40)

Quay lại PowerShell và chạy:

```powershell
notepad analysis\human-review.md
```

Lời thoại:

> Em không dùng nguyên kết quả AI mà đã chạy thử và sửa ba vấn đề chính. Thứ nhất, timer ban đầu đặt sai scope nên delay trước mọi request. Thứ hai, CSV ban đầu chỉ có 250 dòng, không đủ cho Spike 600 VU và tạo đăng ký trùng. Thứ ba, user login thất bại vẫn tiếp tục gửi token không hợp lệ, gây chuỗi lỗi 403 không phản ánh đúng backend. Em đã tăng dữ liệu lên một nghìn dòng và chặn business flow khi không trích xuất được token.

Đóng Notepad, sau đó chạy:

```powershell
notepad agent-skill\eshop-performance-testing\SKILL.md
```

Lời thoại:

> Em đóng gói quy trình thành Agent Skill có hướng dẫn chạy test, kiểm tra JTL, tính percentile, error rate, throughput và phân tích resource CSV. Skill có nguyên tắc không được tạo log giả, không được che calibration thất bại và phải phân biệt số liệu quan sát với suy luận. Script analyzer đã được dùng để kiểm tra độc lập cả các lần chạy chính và các rerun khi chụp evidence.

## Cảnh 6 — Issues, Git và kết luận (5:40-6:40)

Đóng Notepad và chạy:

```powershell
git log --oneline --graph -15
Start-Process "https://github.com/ngothoaidev/23127124-HW05-Performance-Testing"
```

Trong trình duyệt, mở tab **Issues** và chỉ vào hai issue đã tạo.

Lời thoại:

> Repository có lịch sử commit tách theo Load, Stress, Spike, Soak, phân tích AI, Agent Skill, báo cáo và evidence. Em đã đăng hai issue có ảnh và bước tái hiện: một issue về connection refusal trong lần Spike, và một issue về cart không được xóa sau checkout. Vấn đề cart vừa là lỗi chức năng vừa có rủi ro giữ dữ liệu trong bộ nhớ khi chạy lâu.

> Kết luận, hệ thống chạy tốt ở tải thấp nhưng độ trễ tăng rõ trước 400 VU. Ngưỡng endurance đã đo là 926 RPS trong 10 phút tại 250 VU trên máy THOAI. Các kết luận được kiểm tra bằng raw JTL, resource log, source code và rerun thực tế. Em xin kết thúc phần trình bày.

## Sau khi quay

1. Kiểm tra video dài ít nhất 6 phút và nghe rõ giọng.
2. Upload YouTube ở chế độ **Unlisted**, không chọn Private.
3. Gửi URL video để cập nhật README, PDF, GitHub và tạo ZIP cuối.
