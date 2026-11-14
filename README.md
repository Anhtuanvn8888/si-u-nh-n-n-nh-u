# SIÊU NHÂN NÉ NHẬU – CARTOON 2.2 GỌN NHẸ

## Luật game
- Chạm để bay lên; thả để rơi; né quán nhậu để cộng điểm, tốc độ tăng dần.
- Vật phẩm may mắn ở một trong hai làn: ⚽ chậm, 🏸 bất tử, 🏋️ x2 điểm, 🥤 khiên, 🧲 nam châm.
- Nhặt vàng độc lập với điểm. Khi kết thúc: né Q quán, nhặt V vàng.
- Nếu Q > 0 và V >= Q thì vợ lườm rồi tha; còn lại bị véo tai. Tự tính, không có menu mua quà.
- Vàng nhặt được vẫn cộng vào két vàng lưu trên máy; không phải tiền thật và chưa có cửa hàng.
- Ảnh selfie lưu trên thiết bị trong localStorage; bảng TOP hiện vẫn là trên máy.

## Cách dễ nhất để đưa lên mạng
1. Lấy file `index.html` **một-file** được gửi kèm (bản một file riêng), không cần các file phụ.
2. Tạo repository mới trên GitHub, upload file `index.html` vào gốc.
3. Trên Render: New > Static Site > chọn repo > Build command `mkdir -p public && cp index.html public/` > Publish Directory `public`.
4. Sau khi Deploy thành công, mở đường link onrender.com bằng Safari iOS hoặc Chrome Android.

Hoặc dùng toàn bộ ZIP này, đã có mã nguồn tách file và ảnh đồ họa. Nếu deploy bản ZIP tách file, hãy đặt Build Command `mkdir -p public && cp -R index.html game.js style.css assets wife-scene.webp icon*.png manifest.webmanifest sw.js public/` và Publish Directory `public`.
