# 🎂 HappyBirthday — Ứng Dụng Thiệp Chúc Mừng Sinh Nhật Online

Trang web tạo thiệp sinh nhật bí mật, đếm ngược mở quà, tích hợp hiệu ứng bung nở toàn màn hình và hộp thư chứa hàng trăm phong bì lời chúc từ bạn bè.

---

## ✨ Tính Năng Nổi Bật

- 🎈 **Tạo thiệp bí mật & hẹn giờ mở thiệp**: Hẹn đúng 00:00 ngày sinh nhật để người nhận mở quà.
- 📸 **Xấp ảnh kỷ niệm Polaroid**: Hỗ trợ đính kèm nhiều ảnh kỷ niệm xếp chồng lên nhau với hiệu ứng rê chuột nổi lên trên và xem cận cảnh.
- 💌 **Hộp Thư Yêu Thương**: Khách mời có thể gửi lời chúc ẩn danh hoặc công khai, hiển thị dưới dạng dải phong bì mini pastel tự nhiên (3 cột trên điện thoại, 4-5 cột trên máy tính).
- 🌸 **Đa dạng hiệu ứng chúc mừng**: Hoa nở rộ toàn màn hình, Pháo hoa giấy kim tuyến, Bụi sao phép màu, Bóng bay 3D.
- 🎂 **Bánh kem sinh nhật nghệ thuật**: Bánh kem 3D cao cấp với ngọn nến vàng ấm lung linh và phụ kiện trang trí bồng bềnh xung quanh.
- 🔐 **Bảo mật & Quản lý**: Đăng nhập Email/Google, chia sẻ link viết lời chúc cho bạn bè và link mở thiệp riêng tư cho người nhận.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Môi Trường Local

1. **Clone repository:**
   ```bash
   git clone https://github.com/PhucFeFa/HappyBirthDay.git
   cd HappyBirthDay
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường (`.env.local`):**
   Tạo file `.env.local` và điền thông tin Firebase của bạn (tham khảo `.env.example`):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   CREATOR_TOKEN_SECRET=your_secret_key_here
   ```

4. **Chạy server dev:**
   ```bash
   npm run dev
   ```
   Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## 🌐 Hướng Dẫn Deploy Lên Vercel (1-Click)

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com).
2. Bấm **Add New** → **Project** → Chọn repository `PhucFeFa/HappyBirthDay`.
3. Trong phần **Environment Variables**, thêm đầy đủ các biến môi trường từ Firebase:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `CREATOR_TOKEN_SECRET`
4. Bấm **Deploy**! Vercel sẽ tự động build và cấp tên miền trực tuyến cho bạn.
