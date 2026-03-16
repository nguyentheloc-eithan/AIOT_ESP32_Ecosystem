# TÀI LIỆU DỰ ÁN: HỆ THỐNG IOT TƯỚI VƯỜN THÔNG MINH (SMART GARDEN)

## 1. Tổng quan dự án

Dự án nhằm xây dựng một hệ thống tưới tiêu tự động cho vườn cây, cho phép giám sát độ ẩm đất theo thời gian thực và điều khiển tưới từ xa thông qua ứng dụng web (PWA). Hệ thống ưu tiên tính ổn định, giao diện thân thiện cho người lớn tuổi và khả năng vận hành chính xác theo lịch trình.

* **Chủ dự án:** Software Engineer (Full-stack).
* **Người sử dụng chính:** Ba của chủ dự án.
* **Nền tảng công nghệ:** M5Stack (Hardware), Golang Echo (Backend), React (Frontend/PWA), MQTT (Protocol).

---

## 2. Danh mục linh kiện & Chi phí đầu tư (Dự kiến 2026)

Dưới đây là bảng tổng hợp linh kiện cần mua. Giá được tham khảo từ các nhà cung cấp phổ biến tại Việt Nam (như Cytron, Mechasolution, hoặc các shop linh kiện tại TP.HCM/Hà Nội).

| STT | Tên Linh Kiện | Số lượng | Đơn giá (VND) | Thành tiền (VND) | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| **1** | **M5Stack Core2** | 01 | 1.250.000 | 1.250.000 | Bộ điều khiển trung tâm có màn hình cảm ứng. |
| **2** | **Earth Unit (Moisture Sensor)** | 02 | 120.000 | 240.000 | Cảm biến độ ẩm đất loại điện dung (chống ăn mòn). |
| **3** | **Relay Unit (M5Stack)** | 01 | 150.000 | 150.000 | Dùng để kích đóng/ngắt van nước điện từ. |
| **4** | **Van điện từ 12V (Phi 21)** | 01 | 250.000 | 250.000 | Loại thường đóng (ATA hoặc UNID). |
| **5** | **Nguồn tổ ong 12V 5A** | 01 | 110.000 | 110.000 | Cấp nguồn cho cả Van và M5Stack (qua mạch hạ áp). |
| **6** | **Mạch hạ áp LM2596** | 01 | 35.000 | 35.000 | Hạ từ 12V xuống 5V để nuôi M5Stack. |
| **7** | **PaHub Unit (Mở rộng I2C)** | 01 | 180.000 | 180.000 | Nếu bạn dùng nhiều hơn 1 cảm biến Earth. |
| **8** | **Phụ kiện (Dây điện, ống nước)** | 1 gói | 200.000 | 200.000 | Dây Grove nối dài, băng keo điện, hộp chống nước. |
| **Tổng cộng** |  |  |  | **2.415.000** | *(Chưa bao gồm phí vận chuyển)* |

---

## 3. Kiến trúc kỹ thuật (Technical Stack)

### 3.1. Phần cứng (Firmware)

* **Ngôn ngữ:** C++ (Arduino Framework).
* **Tính năng:** Đọc dữ liệu từ Earth Unit mỗi 30 giây, gửi dữ liệu lên MQTT Broker, lắng nghe lệnh từ Broker để đóng/ngắt Relay.

### 3.2. Backend (Server)

* **Ngôn ngữ:** Golang (Echo Framework).
* **Database:** PostgreSQL (Supabase).
* **Dịch vụ:** * **MQTT Broker:** Kết nối M5Stack và Server.
* **Cron Job:** Quản lý lịch tưới (đọc từ bảng `schedules` mỗi phút).
* **FCM (Firebase):** Gửi thông báo đẩy về điện thoại khi `moisture < threshold`.



### 3.3. Frontend (Web App)

* **Framework:** React + Tailwind CSS.
* **PWA:** Cấu hình để cài đặt trực tiếp trên màn hình iPhone/Android của ba bạn mà không cần qua App Store.
* **UI:** Nút bấm lớn, hiển thị thông số rõ ràng, có biểu đồ theo dõi độ ẩm trong ngày.

---

## 4. Các chức năng chính của App

1. **Trạng thái thực:** Hiển thị độ ẩm vườn (%) và trạng thái van (Đang mở/đóng).
2. **Tưới thủ công:** Nút gạt bật/tắt nước ngay lập tức từ xa.
3. **Lập lịch:** Giao diện chọn giờ (ví dụ: 6:00 sáng và 5:00 chiều) và thời gian tưới (5 phút/lần).
4. **Cảnh báo thông minh:** Nếu đất quá khô ($< 20\%$) ngoài khung giờ tưới, điện thoại sẽ rung và báo: *"Vườn đang khô, ba có muốn tưới không?"*.

---

## 5. Hướng dẫn triển khai

1. **Lắp đặt:** Đặt M5Stack trong hộp nhựa chống nước, các cảm biến cắm sâu vào gốc cây, van điện từ lắp vào đường ống chính.
2. **Kết nối Cloud:** Đăng ký một tài khoản Supabase (Miễn phí) và HiveMQ Cloud (Miễn phí cho 10 thiết bị).
3. **Deploy:** Đẩy Backend Go lên VPS hoặc Docker; đẩy Frontend React lên Vercel/Netlify.
