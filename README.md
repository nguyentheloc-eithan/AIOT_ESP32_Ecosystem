# TÀI LIỆU DỰ ÁN: HỆ THỐNG IOT TƯỚI VƯỜN THÔNG MINH (SMART GARDEN)

## 1. Mục tiêu dự án

Xây dựng hệ thống điều khiển tưới tiêu cho vườn cây thông qua giao diện Web PWA (React), backend (Golang) và phần cứng (M5Stack).

* **Stage 1:** Tập trung vào quản lý lịch trình, điều khiển từ xa và hệ thống thông báo dựa trên dữ liệu cảm biến.

## 2. Danh mục linh kiện & Ngân sách dự kiến

| Linh kiện | Số lượng | Link hình ảnh & Kích thước | Giá (VND) | Ghi chú |
| --- | --- | --- | --- | --- |
| **M5Stack Core2** | 01 | [M5Stack Core2 (54x54x16mm)](https://shop.m5stack.com/products/m5stack-core2-esp32-iot-development-kit) | 1.250.000 | Bộ điều khiển, màn hình hiển thị. |
| **Earth Unit** | 02 | [Cảm biến độ ẩm (71x24mm)](https://www.google.com/search?q=https://shop.m5stack.com/products/earth-unit) | 240.000 | Loại điện dung, chống ăn mòn. |
| **Relay Unit** | 01 | [Relay (48x24x10mm)](https://www.google.com/search?q=https://shop.m5stack.com/products/mini-relay-unit-ca-9v) | 150.000 | Kích van điện từ. |
| **Van điện từ 12V** | 01 | [Solenoid Valve (Phi 21)](https://www.google.com/search?q=solenoid+valve+12v+phi+21) | 250.000 | Khóa/mở nước cơ khí. |
| **Nguồn tổ ong** | 01 | [Nguồn 12V 5A](https://www.google.com/search?q=nguồn+tổ+ong+12V+5A) | 110.000 | Cấp điện toàn hệ thống. |
| **Hộp chống nước** | 01 | [Hộp nhựa dự án](https://www.google.com/search?q=hộp+nhựa+chống+nước+dự+án+điện) | 150.000 | Đóng gói tất cả trong một. |
| **Phụ kiện khác** | - | Mạch hạ áp, dây Grove, dây điện. | 200.000 | Kết nối và bảo vệ. |
| **TỔNG CỘNG** |  |  | **~2.350.000** |  |

---

## 3. Chức năng chi tiết (Stage 1)

### 3.1. Quản lý lịch tưới (Scheduling)

* Cho phép ba bạn cài đặt các khung giờ cố định (ví dụ: 06:00 và 18:00).
* Thiết lập thời gian tưới cho mỗi lần (ví dụ: tưới trong 5 phút).
* Dữ liệu lịch trình được lưu trữ tập trung trên **Supabase/PostgreSQL** để đảm bảo không bị mất khi mất điện.

### 3.2. Điều khiển thủ công (Manual Override)

* Giao diện Web có nút Gạt (Toggle) hoặc Nút bấm (Button) lớn để bật/tắt máy bơm tức thì.
* Trạng thái bơm được đồng bộ hóa theo thời gian thực (Nếu bấm trên Web, màn hình M5Stack cũng thay đổi trạng thái).

### 3.3. Cảnh báo thông minh (Smart Notification)

* **Logic:** Nếu `Moisture < 20%` (ngưỡng khô) và hiện tại `không nằm trong lịch tưới`.
* **Hành động:** Backend (Golang) sẽ đẩy thông báo qua Firebase Cloud Messaging (FCM) đến điện thoại của ba bạn.
* **Nội dung:** "Vườn đang rất khô (Độ ẩm: 15%), ba có muốn tưới ngay không?".

---

## 4. Thiết kế hệ thống (System Design)

### Luồng xử lý dữ liệu:

1. **M5Stack:** Đọc cảm biến $\rightarrow$ Đẩy lên MQTT Broker.
2. **Golang Backend:** * Lắng nghe MQTT để cập nhật DB.
* Chạy **Cron Job** (mỗi phút) để đối chiếu thời gian hiện tại với bảng `schedules`.
* Nếu đến giờ, bắn lệnh `ON` xuống MQTT.


3. **React PWA:** * Gọi API từ Echo để hiển thị dữ liệu.
* Nhận thông báo Push từ FCM khi đất khô.



---

## 5. Kế hoạch đóng gói (All-in-One Box)

Để hệ thống "cắm là chạy", bạn cần lắp ráp vào hộp nhựa chống nước theo sơ đồ sau:

1. **Mặt nắp hộp:** Khoét lỗ gắn **M5Stack Core2** (Lộ màn hình để ba xem tại chỗ).
2. **Bên trong:** Gắn nguồn tổ ong 12V và mạch hạ áp xuống 5V để nuôi M5Stack.
3. **Cổng kết nối ngoài:**
* 1 Dây nguồn AC 220V cắm ổ điện.
* 1 Giắc DC ra Van điện từ.
* 1 Cổng Grove nối dài ra cảm biến độ ẩm.



---

## 6. Cấu trúc Database gợi ý (SQL)

```sql
-- Lưu thông số cảm biến
CREATE TABLE sensor_logs (
    id SERIAL PRIMARY KEY,
    moisture_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lưu lịch tưới
CREATE TABLE watering_schedules (
    id SERIAL PRIMARY KEY,
    start_time TIME NOT NULL, -- Giờ tưới
    duration_minutes INTEGER NOT NULL, -- Tưới bao lâu
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

```

---

## 7. Các bước triển khai tiếp theo

1. **Mua linh kiện:** Ưu tiên mua M5Stack Core2 và Earth Unit trước để test code.
2. **Backend:** Viết API quản lý CRUD cho bảng `watering_schedules`.
3. **Firmware:** Code cho M5Stack để kết nối Wi-Fi và Pub/Sub qua MQTT.
4. **Frontend:** Build giao diện React với `vite-plugin-pwa` để ba bạn cài lên điện thoại.
