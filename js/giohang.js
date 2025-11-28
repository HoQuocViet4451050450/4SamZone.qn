var currentuser; // user hiện tại, biến toàn cục
var maGiaoDichHienTai = ""; // Biến toàn cục lưu mã giao dịch tạm thời

// === CẤU HÌNH THÔNG TIN TÀI KHOẢN ===
const SEPAY_ACCOUNT = "96247HIDERV";
const SEPAY_BANK = "BIDV";
const SEPAY_NAME = "HO QUOC VIET";

window.onload = function () {
  khoiTao();
  autocomplete(document.getElementById("search-box"), list_products);
  var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
  for (var t of tags) addTags(t, "index.html?search=" + t);

  currentuser = getCurrentUser();
  addProductToTable(currentuser);
  // --- THÊM DÒNG NÀY ---
  khoiDongKiemTraThanhToan();
  // ---------------------
  window.onclick = function (event) {
    var modal = document.getElementById("modalPayment");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};

function addProductToTable(user) {
  var table = document.getElementsByClassName("listSanPham")[0];
  var s = `
		<tbody>
			<tr>
				<th>STT</th>
				<th>Sản phẩm</th>
				<th>Giá</th>
				<th>Số lượng</th>
				<th>Thành tiền</th>
				<th>Thời gian</th>
				<th>Xóa</th>
			</tr>`;

  if (!user) {
    s += `<tr><td colspan="7"><h1 style="color:red; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">Bạn chưa đăng nhập !!</h1></td></tr>`;
    table.innerHTML = s;
    return;
  } else if (user.products.length == 0) {
    s += `<tr><td colspan="7"><h1 style="color:green; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">Giỏ hàng trống !!</h1></td></tr>`;
    table.innerHTML = s;
    return;
  }

  var totalPrice = 0;
  for (var i = 0; i < user.products.length; i++) {
    var masp = user.products[i].ma;
    var soluongSp = user.products[i].soluong;
    var p = timKiemTheoMa(list_products, masp);
    var price = p.promo.name == "giareonline" ? p.promo.value : p.price;
    var thoigian = new Date(user.products[i].date).toLocaleString();
    var thanhtien = stringToNum(price) * soluongSp;

    s +=
      `
			<tr>
				<td>` +
      (i + 1) +
      `</td>
				<td class="noPadding imgHide">
					<a target="_blank" href="chitietsanpham.html?` +
      p.name.split(" ").join("-") +
      `" title="Xem chi tiết">
						` +
      p.name +
      `<img src="` +
      p.img +
      `">
					</a>
				</td>
				<td class="alignRight">` +
      price +
      ` ₫</td>
				<td class="soluong" >
					<button onclick="giamSoLuong('` +
      masp +
      `')"><i class="fa fa-minus"></i></button>
					<input size="1" onchange="capNhatSoLuongFromInput(this, '` +
      masp +
      `')" value=` +
      soluongSp +
      `>
					<button onclick="tangSoLuong('` +
      masp +
      `')"><i class="fa fa-plus"></i></button>
				</td>
				<td class="alignRight">` +
      numToString(thanhtien) +
      ` ₫</td>
				<td style="text-align: center" >` +
      thoigian +
      `</td>
				<td class="noPadding"> <i class="fa fa-trash" onclick="xoaSanPhamTrongGioHang(` +
      i +
      `)"></i> </td>
			</tr>`;
    totalPrice += thanhtien;
  }

  s +=
    `
			<tr style="font-weight:bold; text-align:center">
				<td colspan="4">TỔNG TIỀN: </td>
				<td class="alignRight">` +
    numToString(totalPrice) +
    ` ₫</td>
				<td class="thanhtoan" onclick="thanhToan()"> Thanh Toán </td>
				<td class="xoaHet" onclick="xoaHet()"> Xóa hết </td>
			</tr>
		</tbody>`;
  table.innerHTML = s;
}

function xoaSanPhamTrongGioHang(i) {
  if (window.confirm("Xác nhận hủy mua")) {
    currentuser.products.splice(i, 1);
    capNhatMoiThu();
  }
}

// === HÀM THANH TOÁN SEPAY ===
function thanhToan() {
  var c_user = getCurrentUser();
  if (c_user.off) {
    alert("Tài khoản của bạn hiện đang bị khóa nên không thể mua hàng!");
    return;
  }

  if (!currentuser.products.length) {
    addAlertBox(
      "Không có mặt hàng nào cần thanh toán !!",
      "#ffb400",
      "#fff",
      2000
    );
    return;
  }

  var totalMoney = 0;
  for (var p of currentuser.products) {
    var productInfo = timKiemTheoMa(list_products, p.ma);
    var price =
      productInfo.promo.name == "giareonline"
        ? productInfo.promo.value
        : productInfo.price;
    totalMoney += stringToNum(price) * p.soluong;
  }

  if (
    window.confirm(
      "Thanh toán giỏ hàng ? Tổng tiền: " + numToString(totalMoney) + " ₫"
    )
  ) {
    // TẠO MÃ GIAO DỊCH DUY NHẤT
    // Lưu vào biến toàn cục để dùng lại ở bước xác nhận
    maGiaoDichHienTai = "DH" + Math.floor(Date.now() / 1000);

    var qrUrl = `https://qr.sepay.vn/img?acc=${SEPAY_ACCOUNT}&bank=${SEPAY_BANK}&amount=${totalMoney}&des=${maGiaoDichHienTai}`;
    hienThiModalThanhToan(qrUrl, totalMoney, maGiaoDichHienTai);
  }
}

function hienThiModalThanhToan(qrUrl, amount, content) {
  var modal = document.getElementById("modalPayment");
  var img = document.getElementById("img-qr-sepay");

  img.src = qrUrl;
  document.getElementById("pay-amount").innerText = numToString(amount) + " ₫";
  document.getElementById("pay-content").innerText = content;
  modal.style.display = "block";
}

function dongModalThanhToan() {
  document.getElementById("modalPayment").style.display = "none";
}
function xacNhanDaChuyenKhoan() {
  dongModalThanhToan();

  // Tính lại tổng tiền để lưu vào đơn hàng
  var tongTienDonHang = 0;
  for (var p of currentuser.products) {
    var productInfo = timKiemTheoMa(list_products, p.ma);
    var price =
      productInfo.promo.name == "giareonline"
        ? productInfo.promo.value
        : productInfo.price;
    tongTienDonHang += stringToNum(price) * p.soluong;
  }

  // LƯU ĐƠN HÀNG
  currentuser.donhang.push({
    sp: currentuser.products,
    ngaymua: new Date(),
    tinhTrang: "Đang thanh toán", // Trạng thái mới
    maDonHang: maGiaoDichHienTai, // Mã DH...
    tongTien: tongTienDonHang, // Lưu số tiền để so sánh
  });

  currentuser.products = [];
  capNhatMoiThu();

  addAlertBox(
    "Đã gửi thông tin! Vui lòng chờ Admin xác nhận tiền.",
    "#17c671",
    "#fff",
    5000
  );
}

function xoaHet() {
  if (currentuser.products.length) {
    if (window.confirm("Bạn có chắc chắn muốn xóa hết sản phẩm trong giỏ !!")) {
      currentuser.products = [];
      capNhatMoiThu();
    }
  }
}

function capNhatSoLuongFromInput(inp, masp) {
  var soLuongMoi = Number(inp.value);
  if (!soLuongMoi || soLuongMoi <= 0) soLuongMoi = 1;
  for (var p of currentuser.products) {
    if (p.ma == masp) p.soluong = soLuongMoi;
  }
  capNhatMoiThu();
}

function tangSoLuong(masp) {
  for (var p of currentuser.products) {
    if (p.ma == masp) p.soluong++;
  }
  capNhatMoiThu();
}

function giamSoLuong(masp) {
  for (var p of currentuser.products) {
    if (p.ma == masp) {
      if (p.soluong > 1) p.soluong--;
      else return;
    }
  }
  capNhatMoiThu();
}

function capNhatMoiThu() {
  animateCartNumber();
  setCurrentUser(currentuser);
  updateListUser(currentuser);
  addProductToTable(currentuser);
  capNhat_ThongTin_CurrentUser();
}

// Biến lưu ID của bộ đếm thời gian
var paymentCheckInterval = null;

// Hàm khởi động bộ kiểm tra (được gọi khi trang web tải xong)
function khoiDongKiemTraThanhToan() {
  // Nếu đã có đơn hàng đang chờ, hãy bắt đầu kiểm tra ngay
  if (currentuser && currentuser.donhang.length > 0) {
    // Kiểm tra mỗi 3 giây (3000ms)
    paymentCheckInterval = setInterval(kiemTraTrangThaiDonHang, 3000);
  }
}

function kiemTraTrangThaiDonHang() {
  // 1. Lấy dữ liệu mới nhất từ LocalStorage (Database chung giữa Admin và User)
  var listUser = JSON.parse(window.localStorage.getItem("ListUser"));
  if (!listUser) return;

  // 2. Tìm user hiện tại trong database đó
  var dbUser = listUser.find((u) => u.username === currentuser.username);
  if (!dbUser) return;

  // 3. Duyệt qua các đơn hàng của user đó
  var coThayDoi = false;

  for (var i = 0; i < dbUser.donhang.length; i++) {
    var dhMoi = dbUser.donhang[i];

    // Lấy đơn hàng tương ứng trong bộ nhớ tạm (currentuser) để so sánh
    // (Nếu số lượng đơn hàng lệch nhau thì bỏ qua để tránh lỗi)
    if (i >= currentuser.donhang.length) break;
    var dhCu = currentuser.donhang[i];

    // LOGIC CHÍNH:
    // Nếu lúc trước đang là "Đang thanh toán" HOẶC "Chờ..."
    // Mà bây giờ Admin đã đổi thành "Đã thanh toán..."
    if (
      (dhCu.tinhTrang.includes("Đang thanh toán") ||
        dhCu.tinhTrang.includes("Chờ")) &&
      dhMoi.tinhTrang.includes("Đã thanh toán")
    ) {
      // => PHÁT HIỆN THANH TOÁN THÀNH CÔNG
      thongBaoThanhCong(dhMoi.maDonHang);

      // Cập nhật lại bộ nhớ hiện tại để không báo lại lần sau
      currentuser.donhang[i].tinhTrang = dhMoi.tinhTrang;
      coThayDoi = true;
    }
  }

  // 4. Nếu có thay đổi, lưu lại vào session hiện tại và cập nhật giao diện
  if (coThayDoi) {
    setCurrentUser(currentuser); // Cập nhật cookie/local user hiện tại
    // Nếu đang ở trang xem đơn hàng (nếu có), reload lại bảng (tùy chỉnh)
    // Ở đây ta không reload trang để giữ trải nghiệm, chỉ hiện thông báo.
  }
}

function thongBaoThanhCong(maDon) {
  // Phát âm thanh vui tai (tuỳ chọn)
  var audio = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
  audio.play().catch((e) => {}); // Bỏ qua lỗi nếu trình duyệt chặn auto-play

  // Hiện thông báo màu xanh
  addAlertBox(
    `🎉 Đơn hàng ${maDon} đã được Admin xác nhận thanh toán thành công!`,
    "#17c671",
    "#fff",
    6000
  );

  // Hoặc dùng alert của trình duyệt nếu muốn chắc chắn người dùng thấy
  // alert(`Thanh toán thành công đơn hàng ${maDon}! Cảm ơn quý khách.`);
}
