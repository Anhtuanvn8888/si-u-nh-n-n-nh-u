# SIÊU NHÂN NÉ NHẬU — NÂNG CẤP V3.0

**Bộ này là bản nâng cấp cho repository hiện có:**
https://github.com/Anhtuanvn8888/si-u-nh-n-n-nh-u

> Lưu ý: Chưa có quyền ghi GitHub qua kết nối ChatGPT (GitHub trả về 403). Vì vậy bạn cần upload các file sau bằng giao diện GitHub web. Chưa có tài khoản Supabase do bạn sở hữu nên online **chưa chạy ngay** cho đến khi hoàn tất bước II.

## I. Đưa V3 lên GitHub Pages (không cần cài phần mềm)

1. Tải ZIP và giải nén. Mở repository trên GitHub, chọn **Add file → Upload files**.
2. Chọn **index.html, game-v3.js, v3.css, sw-v3.js, cloud-config.js** và có thể thêm **supabase-setup.sql**, **HUONG-DAN.md** để lưu tài liệu. Các file phải nằm ở **thư mục gốc repository**, không nằm trong thư mục con `ne-nhau-upgrade`.
3. GitHub sẽ báo ghi đè `index.html` cũ: xác nhận thay thế, sau đó chọn **Commit changes**.
4. Không xóa các file cũ `assets/`, `wife-scene.webp`, `icon.png`, `manifest.webmanifest`: bản V3 sử dụng lại các hình ảnh này. Các file cũ `game.js`, `style.css` có thể để nguyên, V3 không gọi chúng.
5. Mở trang game tại **https://anhtuanvn8888.github.io/si-u-nh-n-n-nh-u/**. Nếu còn phiên bản cũ do cache, đóng tab, mở lại và tải lại trang. Tốt nhất thử bằng tab ẩn danh trước.

**Chế độ khách** chạy ngay: nhặt vàng, lưu vàng tại thiết bị, mua/trang bị đồ, thử trang phục, pet chó/mèo/gà/vịt và các pet khác. Vàng từ bản cũ, biệt danh, ảnh selfie, kỷ lục cũ được chuyển sang V3 trên **chính trình duyệt cũ** khi trang mở lần đầu. Khi đổi trình duyệt hoặc xóa dữ liệu, dữ liệu khách không tự chuyển theo.

## II. Kích hoạt tài khoản người chơi và bảng xếp hạng online

1. Truy cập https://supabase.com/ và tạo project riêng. Ghi nhớ mật khẩu database do bạn đặt.
2. Mở **SQL Editor → New query**, dán **toàn bộ** nội dung file `supabase-setup.sql`, chọn **Run**. Chạy file này **một lần**. Nếu Supabase báo lỗi, không tiếp tục phát hành và cần xử lý lỗi đó.
3. Trong Supabase, vào **Authentication → Providers → Email**, bật đăng ký bằng email/mật khẩu. Khuyến nghị bật xác minh email.
4. Vào **Authentication → URL Configuration**. Đặt **Site URL** và **Redirect URLs** có đường dẫn GitHub Pages `https://anhtuanvn8888.github.io/si-u-nh-n-n-nh-u/` (chú ý dấu `/` cuối).
5. Vào trang **Connect / Project Settings → API Keys** của Supabase để lấy **Project URL** và **publishable key** (có thể dùng **anon public key**). TUYỆT ĐỐI KHÔNG dùng `service_role` hoặc khóa bí mật trong website.
6. Mở file `cloud-config.js`, điền hai giá trị vào `url` và `anonKey`, lưu lại, rồi dùng GitHub web upload lại **một file `cloud-config.js`** và commit.
7. Trở lại game, chọn **Tài khoản → Đăng ký**, xác minh email nếu được yêu cầu, rồi đăng nhập. Test bằng hai điện thoại/tài khoản khác nhau: vàng, điểm, trang phục và pet được lưu trong Supabase. Bảng TOP sẽ hiển thị công khai mọi người chơi đã ghi điểm.

**Không có chuyển vàng khách sang tài khoản.** Đây là chủ ý để tránh người dùng tự sửa vàng trong bộ nhớ trình duyệt rồi đưa lên bảng xếp hạng online.

## III. Bảng TOP, shop và lưu trữ

- **🏆 TOP ĐIỂM:** điểm cao nhất của mỗi tài khoản, sắp xếp giảm dần.
- **💰 TOP ĐẠI GIA:** **tổng số vàng kiếm được từ lúc lập tài khoản**, không giảm khi mua trang phục. Ví vàng hiện có vẫn giảm đúng giá vật phẩm.
- **Shop:** 7 nhóm đồ, 33 lựa chọn gồm đồ miễn phí, nhân vật, quần áo, tóc, kính, mũ, trang sức, pet chó/mèo/gà/vịt/lợn/rồng con. Giá được kiểm tra trên máy chủ khi đăng nhập.
- **Pet:** bay lượn, áo choàng, hiệu ứng sao bay phía sau nhân vật trên canvas. Đồ, pet hiện là các lớp đồ họa/emoji chuyển động — chưa phải sprite hoạt họa vẽ tay riêng cho từng khung.
- **Bà vợ:** có lời thoại hài ngẫu nhiên ở các trường hợp tha hoặc phạt.
- **Chưa nạp tiền:** chỉ kiếm vàng bằng chơi game. Vàng không đổi được tiền thật.

## IV. Hạn chế cần biết trước khi phát hành chính thức

- **Bảo mật online:** khóa publishable/anon an toàn khi kết hợp với chính sách RLS và các RPC hiện tại; không chia sẻ database password, service_role key, mật khẩu tài khoản người chơi.
- **Chống gian lận:** trò chơi vẫn chạy trên trình duyệt, người chơi có thể sửa dữ liệu gửi lên. SQL chỉ đặt giới hạn thô và ngăn mua vật phẩm không đủ vàng, gửi trùng một lượt. **Chưa đạt mức chống hack cho xếp hạng cạnh tranh có giải thưởng hoặc tiền thật.** Cần server xác minh hành trình, hạn mức, giám sát gian lận nếu có giải thưởng.
- **Tài khoản/online:** cần Supabase đang hoạt động, mạng internet, cấu hình email đúng. Game offline hoặc server lỗi không được tính TOP online; game vẫn có thể chơi ở chế độ khách.
- **Hình ảnh:** dùng tài nguyên cũ của repository, không nằm trong ZIP này.
- **Đưa lên App Store/Google Play:** còn cần đóng gói native, kiểm thử, hồ sơ privacy, điều kiện phát hành game tại Việt Nam và tuân thủ chính sách nền tảng.

## V. Danh sách file

- `index.html`: giao diện mới, dùng lại asset cũ.
- `game-v3.js`: gameplay, shop, pet, bảng TOP, account.
- `v3.css`: giao diện điện thoại.
- `cloud-config.js`: nơi chủ game nhập hai giá trị Supabase.
- `sw-v3.js`: bộ nhớ đệm PWA.
- `supabase-setup.sql`: cơ sở dữ liệu, phân quyền, thủ tục tính vàng và TOP.
- `HUONG-DAN.md`: file này.

**Ghi chú:** Mã JavaScript đã kiểm tra cú pháp và quy trình mở shop, chuyển pet, thử đồ, xem TOP, bắt đầu và kết thúc ván được chạy thử trong Chromium. Chưa kiểm thử end-to-end với Supabase thật do chưa có project của chủ game và không có quyền tạo project thay chủ game.
