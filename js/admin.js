var TONGTIEN = 0;

window.onload = function () {
  list_products = getListProducts() || list_products;
  adminInfo = getListAdmin() || adminInfo;
  addEventChangeTab();

  if (window.localStorage.getItem("admin")) {
    addTableProducts();
    addTableDonHang();
    addTableKhachHang();
    addThongKe();
    openTab("Trang Chủ");
  } else {
    document.body.innerHTML = `<h1 style="color:red; with:100%; text-align:center; margin: 50px;"> Truy cập bị từ chối.. </h1>`;
  }
};

function logOutAdmin() {
  window.localStorage.removeItem("admin");
}
function getListRandomColor(length) {
  let result = [];
  for (let i = length; i--; ) result.push(getRandomColor());
  return result;
}
function addChart(id, chartOption) {
  var ctx = document.getElementById(id).getContext("2d");
  var chart = new Chart(ctx, chartOption);
}

function createChartConfig(
  title = "Title",
  charType = "bar",
  labels = ["nothing"],
  data = [2],
  colors = ["red"]
) {
  return {
    type: charType,
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: data,
          backgroundColor: colors,
          borderColor: colors,
        },
      ],
    },
    options: {
      title: { fontColor: "#fff", fontSize: 25, display: true, text: title },
      scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
    },
  };
}

function addThongKe() {
  var danhSachDonHang = getListDonHang(true);
  var thongKeHang = {};
  danhSachDonHang.forEach((donHang) => {
    if (donHang.tinhTrang === "Đã hủy") return;
    donHang.sp.forEach((sanPhamTrongDonHang) => {
      let tenHang = sanPhamTrongDonHang.sanPham.company;
      let soLuong = sanPhamTrongDonHang.soLuong;
      let donGia = stringToNum(sanPhamTrongDonHang.sanPham.price);
      let thanhTien = soLuong * donGia;
      if (!thongKeHang[tenHang])
        thongKeHang[tenHang] = { soLuongBanRa: 0, doanhThu: 0 };
      thongKeHang[tenHang].soLuongBanRa += soLuong;
      thongKeHang[tenHang].doanhThu += thanhTien;
    });
  });
  let colors = getListRandomColor(Object.keys(thongKeHang).length);
  addChart(
    "myChart1",
    createChartConfig(
      "Số lượng bán ra",
      "bar",
      Object.keys(thongKeHang),
      Object.values(thongKeHang).map((_) => _.soLuongBanRa),
      colors
    )
  );
  addChart(
    "myChart2",
    createChartConfig(
      "Doanh thu",
      "doughnut",
      Object.keys(thongKeHang),
      Object.values(thongKeHang).map((_) => _.doanhThu),
      colors
    )
  );
}

function addEventChangeTab() {
  var sidebar = document.getElementsByClassName("sidebar")[0];
  var list_a = sidebar.getElementsByTagName("a");
  for (var a of list_a) {
    if (!a.onclick) {
      a.addEventListener("click", function () {
        turnOff_Active();
        this.classList.add("active");
        var tab = this.childNodes[1].data.trim();
        openTab(tab);
      });
    }
  }
}
function turnOff_Active() {
  var sidebar = document.getElementsByClassName("sidebar")[0];
  var list_a = sidebar.getElementsByTagName("a");
  for (var a of list_a) a.classList.remove("active");
}
function openTab(nameTab) {
  var main = document.getElementsByClassName("main")[0].children;
  for (var e of main) e.style.display = "none";
  switch (nameTab) {
    case "Trang Chủ":
      document.getElementsByClassName("home")[0].style.display = "block";
      break;
    case "Sản Phẩm":
      document.getElementsByClassName("sanpham")[0].style.display = "block";
      break;
    case "Đơn Hàng":
      document.getElementsByClassName("donhang")[0].style.display = "block";
      break;
    case "Khách Hàng":
      document.getElementsByClassName("khachhang")[0].style.display = "block";
      break;
  }
}

// ========================== Sản Phẩm ========================
function addTableProducts() {
  var tc = document
    .getElementsByClassName("sanpham")[0]
    .getElementsByClassName("table-content")[0];
  var s = `<table class="table-outline hideImg">`;
  for (var i = 0; i < list_products.length; i++) {
    var p = list_products[i];
    s +=
      `<tr><td style="width: 5%">` +
      (i + 1) +
      `</td><td style="width: 10%">` +
      p.masp +
      `</td>
            <td style="width: 40%"><a title="Xem chi tiết" target="_blank" href="chitietsanpham.html?` +
      p.name.split(" ").join("-") +
      `">` +
      p.name +
      `</a><img src="` +
      p.img +
      `"></img></td>
            <td style="width: 15%">` +
      p.price +
      `</td><td style="width: 15%">` +
      promoToStringValue(p.promo) +
      `</td>
            <td style="width: 15%"><div class="tooltip"><i class="fa fa-wrench" onclick="addKhungSuaSanPham('` +
      p.masp +
      `')"></i><span class="tooltiptext">Sửa</span></div>
            <div class="tooltip"><i class="fa fa-trash" onclick="xoaSanPham('` +
      p.masp +
      `', '` +
      p.name +
      `')"></i><span class="tooltiptext">Xóa</span></div></td></tr>`;
  }
  s += `</table>`;
  tc.innerHTML = s;
}

function timKiemSanPham(inp) {
  var kieuTim = document.getElementsByName("kieuTimSanPham")[0].value;
  var text = inp.value;
  var vitriKieuTim = { ma: 1, ten: 2 };
  var listTr_table = document
    .getElementsByClassName("sanpham")[0]
    .getElementsByClassName("table-content")[0]
    .getElementsByTagName("tr");
  for (var tr of listTr_table) {
    var td = tr
      .getElementsByTagName("td")
      [vitriKieuTim[kieuTim]].innerHTML.toLowerCase();
    if (td.indexOf(text.toLowerCase()) < 0) tr.style.display = "none";
    else tr.style.display = "";
  }
}

let previewSrc;
function layThongTinSanPhamTuTable(id) {
  var khung = document.getElementById(id);
  var tr = khung.getElementsByTagName("tr");
  var masp = tr[1]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var name = tr[2]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var company = tr[3]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("select")[0].value;
  var img = tr[4]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("img")[0].src;
  var price = tr[5]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var star = tr[6]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var rateCount = tr[7]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var promoName = tr[8]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("select")[0].value;
  var promoValue = tr[9]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var screen = tr[11]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var os = tr[12]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var camara = tr[13]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var camaraFront = tr[14]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var cpu = tr[15]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var ram = tr[16]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var rom = tr[17]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var microUSB = tr[18]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;
  var battery = tr[19]
    .getElementsByTagName("td")[1]
    .getElementsByTagName("input")[0].value;

  if (isNaN(price) || isNaN(star) || isNaN(rateCount)) {
    alert("Dữ liệu số không hợp lệ");
    return false;
  }

  return {
    name: name,
    company: company,
    img: previewSrc,
    price: numToString(Number.parseInt(price, 10)),
    star: Number.parseInt(star, 10),
    rateCount: Number.parseInt(rateCount, 10),
    promo: { name: promoName, value: promoValue },
    detail: {
      screen: screen,
      os: os,
      camara: camara,
      camaraFront: camaraFront,
      cpu: cpu,
      ram: ram,
      rom: rom,
      microUSB: microUSB,
      battery: battery,
    },
    masp: masp,
  };
}
function themSanPham() {
  var newSp = layThongTinSanPhamTuTable("khungThemSanPham");
  if (!newSp) return;
  for (var p of list_products) {
    if (p.masp == newSp.masp || p.name == newSp.name) {
      alert("Sản phẩm bị trùng !!");
      return false;
    }
  }
  list_products.push(newSp);
  setListProducts(list_products);
  addTableProducts();
  alert('Thêm sản phẩm "' + newSp.name + '" thành công.');
  document.getElementById("khungThemSanPham").style.transform = "scale(0)";
}
function autoMaSanPham(company) {
  if (!company) company = document.getElementsByName("chonCompany")[0].value;
  var index = 0;
  for (var i = 0; i < list_products.length; i++)
    if (list_products[i].company == company) index++;
  document.getElementById("maspThem").value = company.substring(0, 3) + index;
}
function xoaSanPham(masp, tensp) {
  if (window.confirm("Bạn có chắc muốn xóa " + tensp)) {
    for (var i = 0; i < list_products.length; i++)
      if (list_products[i].masp == masp) list_products.splice(i, 1);
    setListProducts(list_products);
    addTableProducts();
  }
}
function suaSanPham(masp) {
  var sp = layThongTinSanPhamTuTable("khungSuaSanPham");
  if (!sp) return;
  for (var p of list_products) {
    if (
      (p.masp == masp && p.masp != sp.masp) ||
      (p.name == sp.name && p.masp != sp.masp)
    ) {
      alert("Sản phẩm bị trùng !!");
      return false;
    }
  }
  for (var i = 0; i < list_products.length; i++)
    if (list_products[i].masp == masp) list_products[i] = sp;
  setListProducts(list_products);
  addTableProducts();
  alert("Sửa " + sp.name + " thành công");
  document.getElementById("khungSuaSanPham").style.transform = "scale(0)";
}
function addKhungSuaSanPham(masp) {
  var sp;
  for (var p of list_products) if (p.masp == masp) sp = p;
  var s =
    `<span class="close" onclick="this.parentElement.style.transform = 'scale(0)';">&times;</span><table class="overlayTable table-outline table-content table-header"><tr><th colspan="2">` +
    sp.name +
    `</th></tr><tr><td>Mã sản phẩm:</td><td><input type="text" value="` +
    sp.masp +
    `"></td></tr><tr><td>Tên sẩn phẩm:</td><td><input type="text" value="` +
    sp.name +
    `"></td></tr><tr><td>Hãng:</td><td><select>`;
  var company = [
    "Apple",
    "Samsung",
    "Oppo",
    "Nokia",
    "Huawei",
    "Xiaomi",
    "Realme",
    "Vivo",
    "Philips",
    "Mobell",
    "Mobiistar",
    "Itel",
    "Coolpad",
    "HTC",
    "Motorola",
  ];
  for (var c of company)
    s +=
      `<option value="` +
      c +
      `" ` +
      (sp.company == c ? "selected" : "") +
      `>` +
      c +
      `</option>`;
  s +=
    `</select></td></tr><tr><td>Hình:</td><td><img class="hinhDaiDien" id="anhDaiDienSanPhamSua" src="` +
    sp.img +
    `"><input type="file" accept="image/*" onchange="capNhatAnhSanPham(this.files, 'anhDaiDienSanPhamSua')"></td></tr><tr><td>Giá tiền (số nguyên):</td><td><input type="text" value="` +
    stringToNum(sp.price) +
    `"></td></tr><tr><td>Số sao (số nguyên 0->5):</td><td><input type="text" value="` +
    sp.star +
    `"></td></tr><tr><td>Đánh giá (số nguyên):</td><td><input type="text" value="` +
    sp.rateCount +
    `"></td></tr><tr><td>Khuyến mãi:</td><td><select><option value="">Không</option><option value="tragop" ` +
    (sp.promo.name == "tragop" ? "selected" : "") +
    `>Trả góp</option><option value="giamgia" ` +
    (sp.promo.name == "giamgia" ? "selected" : "") +
    `>Giảm giá</option><option value="giareonline" ` +
    (sp.promo.name == "giareonline" ? "selected" : "") +
    `>Giá rẻ online</option><option value="moiramat" ` +
    (sp.promo.name == "moiramat" ? "selected" : "") +
    `>Mới ra mắt</option></select></td></tr><tr><td>Giá trị khuyến mãi:</td><td><input type="text" value="` +
    sp.promo.value +
    `"></td></tr><tr><th colspan="2">Thông số kĩ thuật</th></tr><tr><td>Màn hình:</td><td><input type="text" value="` +
    sp.detail.screen +
    `"></td></tr><tr><td>Hệ điều hành:</td><td><input type="text" value="` +
    sp.detail.os +
    `"></td></tr><tr><td>Camara sau:</td><td><input type="text" value="` +
    sp.detail.camara +
    `"></td></tr><tr><td>Camara trước:</td><td><input type="text" value="` +
    sp.detail.camaraFront +
    `"></td></tr><tr><td>CPU:</td><td><input type="text" value="` +
    sp.detail.cpu +
    `"></td></tr><tr><td>RAM:</td><td><input type="text" value="` +
    sp.detail.ram +
    `"></td></tr><tr><td>Bộ nhớ trong:</td><td><input type="text" value="` +
    sp.detail.rom +
    `"></td></tr><tr><td>Thẻ nhớ:</td><td><input type="text" value="` +
    sp.detail.microUSB +
    `"></td></tr><tr><td>Dung lượng Pin:</td><td><input type="text" value="` +
    sp.detail.battery +
    `"></td></tr><tr><td colspan="2"  class="table-footer"> <button onclick="suaSanPham('` +
    sp.masp +
    `')">SỬA</button> </td></tr></table>`;
  var khung = document.getElementById("khungSuaSanPham");
  khung.innerHTML = s;
  khung.style.transform = "scale(1)";
}
function capNhatAnhSanPham(files, id) {
  const reader = new FileReader();
  reader.addEventListener(
    "load",
    function () {
      previewSrc = reader.result;
      document.getElementById(id).src = previewSrc;
    },
    false
  );
  if (files[0]) reader.readAsDataURL(files[0]);
}
function sortProductsTable(loai) {
  var list = document
    .getElementsByClassName("sanpham")[0]
    .getElementsByClassName("table-content")[0];
  var tr = list.getElementsByTagName("tr");
  quickSort(tr, 0, tr.length - 1, loai, getValueOfTypeInTable_SanPham);
  decrease = !decrease;
}
function getValueOfTypeInTable_SanPham(tr, loai) {
  var td = tr.getElementsByTagName("td");
  switch (loai) {
    case "stt":
      return Number(td[0].innerHTML);
    case "masp":
      return td[1].innerHTML.toLowerCase();
    case "ten":
      return td[2].innerHTML.toLowerCase();
    case "gia":
      return stringToNum(td[3].innerHTML);
    case "khuyenmai":
      return td[4].innerHTML.toLowerCase();
  }
  return false;
}

// ========================= Đơn Hàng ===========================
function addTableDonHang() {
  var tc = document
    .getElementsByClassName("donhang")[0]
    .getElementsByClassName("table-content")[0];
  var s = `<table class="table-outline hideImg">`;

  var listDH = getListDonHang();
  TONGTIEN = 0;
  for (var i = 0; i < listDH.length; i++) {
    var iconThanhToan = "";
    var textThanhToan = "";
    var colorThanhToan = "";

    // LOGIC MỚI
    if (d.tinhTrang.includes("Đã thanh toán")) {
      // Đã được SePay xác nhận
      textThanhToan = "Đã nhận tiền";
      colorThanhToan = "green";
      iconThanhToan =
        '<i class="fa fa-check-circle" style="color:green; font-size: 1.2em;"></i>';
    } else if (
      d.tinhTrang === "Đang thanh toán" ||
      d.tinhTrang.includes("Đã CK")
    ) {
      // Khách đã bấm chuyển, chờ Admin check
      textThanhToan = "Chờ tiền về...";
      colorThanhToan = "#ff9800"; // Màu cam
      iconThanhToan =
        '<i class="fa fa-spinner fa-spin" style="color:#ff9800"></i>';
    } else if (d.tinhTrang === "Đã hủy") {
      textThanhToan = "Đã hủy";
      colorThanhToan = "red";
      iconThanhToan = '<i class="fa fa-times" style="color:red"></i>';
    } else {
      // COD
      textThanhToan = "Thanh toán sau (COD)";
      colorThanhToan = "#555";
      iconThanhToan = '<i class="fa fa-money" style="color:#555"></i>';
    }

    s +=
      `<tr><td style="width: 5%">` +
      (i + 1) +
      `</td><td style="width: 10%">` +
      d.ma +
      `</td>
            <td style="width: 10%">` +
      d.khach +
      `</td><td style="width: 15%">` +
      d.sp +
      `</td><td style="width: 10%">` +
      d.tongtien +
      `</td>
            <td style="width: 10%">` +
      d.ngaygio +
      `</td>
            <td style="width: 10%; font-weight:bold; color: ` +
      colorThanhToan +
      `">` +
      iconThanhToan +
      ` <br> ` +
      textThanhToan +
      `</td>
            <td style="width: 10%">` +
      d.tinhTrang +
      `</td>
            <td style="width: 10%">
                <div class="tooltip"><i class="fa fa-check" onclick="duyet('` +
      d.ma +
      `', true)"></i><span class="tooltiptext">Duyệt</span></div>
                <div class="tooltip"><i class="fa fa-remove" onclick="duyet('` +
      d.ma +
      `', false)"></i><span class="tooltiptext">Hủy</span></div>
            </td></tr>`;
    TONGTIEN += stringToNum(d.tongtien);
  }
  s += `</table>`;
  tc.innerHTML = s;
}

function getListDonHang(traVeDanhSachSanPham = false) {
  var u = getListUser();
  var result = [];
  for (var i = 0; i < u.length; i++) {
    for (var j = 0; j < u[i].donhang.length; j++) {
      var tongtien = 0;
      for (var s of u[i].donhang[j].sp) {
        var timsp = timKiemTheoMa(list_products, s.ma);
        if (timsp.promo.name == "giareonline")
          tongtien += stringToNum(timsp.promo.value);
        else tongtien += stringToNum(timsp.price);
      }
      var x = new Date(u[i].donhang[j].ngaymua).toLocaleString();
      var sps = "";
      for (var s of u[i].donhang[j].sp)
        sps +=
          `<p style="text-align: right">` +
          (timKiemTheoMa(list_products, s.ma).name + " [" + s.soluong + "]") +
          `</p>`;
      var danhSachSanPham = [];
      for (var s of u[i].donhang[j].sp)
        danhSachSanPham.push({
          sanPham: timKiemTheoMa(list_products, s.ma),
          soLuong: s.soluong,
        });

      // HIỂN THỊ MÃ ĐƠN HÀNG (DH...) TRONG CỘT MÃ ĐƠN
      var maDonHienThi =
        u[i].donhang[j].maDonHang || u[i].donhang[j].ngaymua.toString();

      result.push({
        ma: maDonHienThi, // Dùng mã DH... nếu có
        khach: u[i].username,
        sp: traVeDanhSachSanPham ? danhSachSanPham : sps,
        tongtien: numToString(tongtien),
        ngaygio: x,
        tinhTrang: u[i].donhang[j].tinhTrang,
      });
    }
  }
  return result;
}

function duyet(maDonHang, duyetDon) {
  var u = getListUser();
  for (var i = 0; i < u.length; i++) {
    for (var j = 0; j < u[i].donhang.length; j++) {
      // So sánh với mã đơn hàng (DH...) hoặc ngày mua
      if (
        u[i].donhang[j].maDonHang == maDonHang ||
        u[i].donhang[j].ngaymua.toString() == maDonHang
      ) {
        if (duyetDon) {
          if (
            u[i].donhang[j].tinhTrang == "Đang chờ xử lý" ||
            u[i].donhang[j].tinhTrang == "Đang chờ xử lý (Đã CK)"
          ) {
            u[i].donhang[j].tinhTrang = "Đã giao hàng";
          } else if (u[i].donhang[j].tinhTrang == "Đã hủy") {
            alert("Không thể duyệt đơn đã hủy !");
            return;
          }
        } else {
          if (u[i].donhang[j].tinhTrang.includes("Đang chờ")) {
            if (window.confirm("Bạn có chắc muốn hủy đơn hàng này?"))
              u[i].donhang[j].tinhTrang = "Đã hủy";
          } else if (u[i].donhang[j].tinhTrang == "Đã giao hàng") {
            alert("Không thể hủy đơn hàng đã giao !");
            return;
          }
        }
        break;
      }
    }
  }
  setListUser(u);
  addTableDonHang();
}

// === CÁC HÀM XỬ LÝ WEBHOOK SEPAY ===
function moKhungCheckSePay() {
  document.getElementById("khungCheckSePay").style.transform = "scale(1)";
}

function xuLySePayTuInput() {
  var jsonText = document.getElementById("jsonSePayInput").value;
  try {
    var webhookData = JSON.parse(jsonText);

    // SePay trả về: content là nội dung chuyển khoản (chứa mã DH), transferAmount là số tiền
    var contentPayment = webhookData.content;
    var amount = webhookData.transferAmount;

    if (!contentPayment || !amount) {
      alert("JSON không hợp lệ hoặc thiếu dữ liệu quan trọng.");
      return;
    }

    console.log("Đang kiểm tra giao dịch:", contentPayment, amount);

    var listUser = getListUser();
    var count = 0;

    for (var i = 0; i < listUser.length; i++) {
      for (var j = 0; j < listUser[i].donhang.length; j++) {
        var dh = listUser[i].donhang[j];

        // Kiểm tra: Nội dung CK chứa Mã Đơn Hàng (VD: DH123)
        if (dh.maDonHang && contentPayment.includes(dh.maDonHang)) {
          // Kiểm tra trạng thái hiện tại
          if (
            dh.tinhTrang === "Đang chờ xử lý (Đã CK)" ||
            dh.tinhTrang === "Đang chờ xử lý"
          ) {
            // Cập nhật
            listUser[i].donhang[j].tinhTrang = "Đã thanh toán";
            count++;
          }
        }
      }
    }

    if (count > 0) {
      setListUser(listUser);
      addTableDonHang();
      document.getElementById("khungCheckSePay").style.transform = "scale(0)";
      document.getElementById("jsonSePayInput").value = ""; // Xóa trắng
      alert("Đã tìm thấy và xác nhận thanh toán cho " + count + " đơn hàng!");
    } else {
      alert(
        "Không tìm thấy đơn hàng nào khớp với nội dung chuyển khoản: " +
          contentPayment
      );
    }
  } catch (e) {
    alert("Lỗi khi xử lý JSON: " + e.message);
  }
}

// ... (Giữ nguyên các hàm tìm kiếm, sort bên dưới của file cũ)
function locDonHangTheoKhoangNgay() {
  var from = document.getElementById("fromDate").valueAsDate;
  var to = document.getElementById("toDate").valueAsDate;
  var listTr_table = document
    .getElementsByClassName("donhang")[0]
    .getElementsByClassName("table-content")[0]
    .getElementsByTagName("tr");
  for (var tr of listTr_table) {
    var td = tr.getElementsByTagName("td")[5].innerHTML;
    var d = new Date(td);
    if (d >= from && d <= to) tr.style.display = "";
    else tr.style.display = "none";
  }
}
function timKiemDonHang(inp) {
  var kieuTim = document.getElementsByName("kieuTimDonHang")[0].value;
  var text = inp.value;
  var vitriKieuTim = { ma: 1, khachhang: 2, trangThai: 7 };
  var listTr_table = document
    .getElementsByClassName("donhang")[0]
    .getElementsByClassName("table-content")[0]
    .getElementsByTagName("tr");
  for (var tr of listTr_table) {
    var td = tr
      .getElementsByTagName("td")
      [vitriKieuTim[kieuTim]].innerHTML.toLowerCase();
    if (td.indexOf(text.toLowerCase()) < 0) tr.style.display = "none";
    else tr.style.display = "";
  }
}
function sortDonHangTable(loai) {
  var list = document
    .getElementsByClassName("donhang")[0]
    .getElementsByClassName("table-content")[0];
  var tr = list.getElementsByTagName("tr");
  quickSort(tr, 0, tr.length - 1, loai, getValueOfTypeInTable_DonHang);
  decrease = !decrease;
}
function getValueOfTypeInTable_DonHang(tr, loai) {
  var td = tr.getElementsByTagName("td");
  switch (loai) {
    case "stt":
      return Number(td[0].innerHTML);
    case "madon":
      return td[1].innerHTML.toLowerCase(); // Sửa lại để sort theo chuỗi mã đơn
    case "khach":
      return td[2].innerHTML.toLowerCase();
    case "sanpham":
      return td[3].children.length;
    case "tongtien":
      return stringToNum(td[4].innerHTML);
    case "ngaygio":
      return new Date(td[5].innerHTML);
    case "thanhtoan":
      return td[6].innerText.toLowerCase();
    case "trangthai":
      return td[7].innerHTML.toLowerCase();
  }
  return false;
}
// ... (Các phần Khách hàng, Sort, Utility giữ nguyên như cũ) ...
function addTableKhachHang() {
  var tc = document
    .getElementsByClassName("khachhang")[0]
    .getElementsByClassName("table-content")[0];
  var s = `<table class="table-outline hideImg">`;
  var listUser = getListUser();
  for (var i = 0; i < listUser.length; i++) {
    var u = listUser[i];
    s +=
      `<tr><td style="width: 5%">` +
      (i + 1) +
      `</td><td style="width: 15%">` +
      u.ho +
      " " +
      u.ten +
      `</td>
            <td style="width: 20%">` +
      u.email +
      `</td><td style="width: 20%">` +
      u.username +
      `</td>
            <td style="width: 10%">` +
      u.pass +
      `</td>
            <td style="width: 10%"><div class="tooltip"><label class="switch"><input type="checkbox" ` +
      (u.off ? "" : "checked") +
      ` onclick="voHieuHoaNguoiDung(this, '` +
      u.username +
      `')"><span class="slider round"></span></label><span class="tooltiptext">` +
      (u.off ? "Mở" : "Khóa") +
      `</span></div>
            <div class="tooltip"><i class="fa fa-remove" onclick="xoaNguoiDung('` +
      u.username +
      `')"></i><span class="tooltiptext">Xóa</span></div></td></tr>`;
  }
  s += `</table>`;
  tc.innerHTML = s;
}
function timKiemNguoiDung(inp) {
  var kieuTim = document.getElementsByName("kieuTimKhachHang")[0].value;
  var text = inp.value;
  var vitriKieuTim = { ten: 1, email: 2, taikhoan: 3 };
  var listTr_table = document
    .getElementsByClassName("khachhang")[0]
    .getElementsByClassName("table-content")[0]
    .getElementsByTagName("tr");
  for (var tr of listTr_table) {
    var td = tr
      .getElementsByTagName("td")
      [vitriKieuTim[kieuTim]].innerHTML.toLowerCase();
    if (td.indexOf(text.toLowerCase()) < 0) tr.style.display = "none";
    else tr.style.display = "";
  }
}
function openThemNguoiDung() {
  window.alert("Not Available!");
}
function voHieuHoaNguoiDung(inp, taikhoan) {
  var listUser = getListUser();
  for (var u of listUser) {
    if (u.username == taikhoan) {
      let value = !inp.checked;
      u.off = value;
      setListUser(listUser);
      setTimeout(
        () =>
          alert(
            `${value ? "Khoá" : "Mở khoá"} tải khoản ${u.username} thành công.`
          ),
        500
      );
      break;
    }
  }
  var span = inp.parentElement.nextElementSibling;
  span.innerHTML = inp.checked ? "Khóa" : "Mở";
}
function xoaNguoiDung(taikhoan) {
  if (window.confirm("Xác nhận xóa " + taikhoan + "? \nMọi dữ liệu sẽ mất!")) {
    var listuser = getListUser();
    for (var i = 0; i < listuser.length; i++) {
      if (listuser[i].username == taikhoan) {
        listuser.splice(i, 1);
        setListUser(listuser);
        localStorage.removeItem("CurrentUser");
        addTableKhachHang();
        addTableDonHang();
        return;
      }
    }
  }
}
function sortKhachHangTable(loai) {
  var list = document
    .getElementsByClassName("khachhang")[0]
    .getElementsByClassName("table-content")[0];
  var tr = list.getElementsByTagName("tr");
  quickSort(tr, 0, tr.length - 1, loai, getValueOfTypeInTable_KhachHang);
  decrease = !decrease;
}
function getValueOfTypeInTable_KhachHang(tr, loai) {
  var td = tr.getElementsByTagName("td");
  switch (loai) {
    case "stt":
      return Number(td[0].innerHTML);
    case "hoten":
      return td[1].innerHTML.toLowerCase();
    case "email":
      return td[2].innerHTML.toLowerCase();
    case "taikhoan":
      return td[3].innerHTML.toLowerCase();
    case "matkhau":
      return td[4].innerHTML.toLowerCase();
  }
  return false;
}
var decrease = true;
function quickSort(arr, left, right, loai, func) {
  var pivot, partitionIndex;
  if (left < right) {
    pivot = right;
    partitionIndex = partition(arr, pivot, left, right, loai, func);
    quickSort(arr, left, partitionIndex - 1, loai, func);
    quickSort(arr, partitionIndex + 1, right, loai, func);
  }
  return arr;
}
function partition(arr, pivot, left, right, loai, func) {
  var pivotValue = func(arr[pivot], loai),
    partitionIndex = left;
  for (var i = left; i < right; i++) {
    if (
      (decrease && func(arr[i], loai) > pivotValue) ||
      (!decrease && func(arr[i], loai) < pivotValue)
    ) {
      swap(arr, i, partitionIndex);
      partitionIndex++;
    }
  }
  swap(arr, right, partitionIndex);
  return partitionIndex;
}
function swap(arr, i, j) {
  var tempi = arr[i].cloneNode(true);
  var tempj = arr[j].cloneNode(true);
  arr[i].parentNode.replaceChild(tempj, arr[i]);
  arr[j].parentNode.replaceChild(tempi, arr[j]);
}
function promoToStringValue(pr) {
  switch (pr.name) {
    case "tragop":
      return "Góp " + pr.value + "%";
    case "giamgia":
      return "Giảm " + pr.value;
    case "giareonline":
      return "Online (" + pr.value + ")";
    case "moiramat":
      return "Mới";
  }
  return "";
}
function progress(percent, bg, width, height) {
  return (
    `<div class="progress" style="width: ` +
    width +
    `; height:` +
    height +
    `"><div class="progress-bar bg-info" style="width: ` +
    percent +
    `%; background-color:` +
    bg +
    `"></div></div>`
  );
}
const SEPAY_API_TOKEN =
  "86HHUJQZ1R4VOILEY3MMRTNAAMPH3N0GBFFAPMTQK2YD7XIYXC8CAIVJHEUFL1BV"; // Ví dụ: Bearer CL123...
const SEPAY_ACCOUNT_NUMBER = "96247HIDERV"; // Số tài khoản ngân hàng của bạn

async function kiemTraThanhToanSePay() {
  // Thông báo đang xử lý
  addAlertBox("Đang kết nối SePay...", "#2196F3", "#fff", 2000);

  try {
    // Gọi API lấy 50 giao dịch mới nhất
    const url = `https://my.sepay.vn/userapi/transactions/list?account_number=${SEPAY_ACCOUNT_NUMBER}&limit=50`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: SEPAY_API_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status && data.status !== 200) {
      alert("Lỗi SePay: " + data.message);
      return;
    }

    const transactions = data.transactions;
    let countUpdated = 0;
    let listUser = getListUser(); // Lấy dữ liệu user từ LocalStorage

    // DUYỆT QUA TẤT CẢ USER VÀ ĐƠN HÀNG
    listUser.forEach((user) => {
      user.donhang.forEach((donHang) => {
        // Chỉ kiểm tra các đơn có trạng thái "Đang thanh toán"
        if (
          donHang.tinhTrang === "Đang thanh toán" ||
          donHang.tinhTrang === "Đang chờ xử lý (Đã CK)"
        ) {
          // Logic so sánh:
          // 1. Nội dung chuyển khoản chứa Mã Đơn Hàng (VD: DH1701...)
          // 2. Số tiền chuyển khoản >= Tổng tiền đơn hàng

          const match = transactions.find((t) => {
            return (
              t.transaction_content.includes(donHang.maDonHang) &&
              parseFloat(t.amount_in) >= parseFloat(donHang.tongTien || 0)
            );
          });

          if (match) {
            donHang.tinhTrang = "Đã thanh toán (SePay)";
            countUpdated++;
          }
        }
      });
    });

    if (countUpdated > 0) {
      setListUser(listUser); // Lưu lại LocalStorage
      addTableDonHang(); // Vẽ lại bảng
      alert(`Thành công! Đã xác nhận thanh toán cho ${countUpdated} đơn hàng.`);
    } else {
      alert("Không tìm thấy giao dịch mới nào khớp với các đơn hàng đang chờ.");
    }
  } catch (error) {
    console.error(error);
    alert(
      "Lỗi kết nối! Nếu bạn chạy localhost, hãy cài Extension 'Allow CORS' trên Chrome để test."
    );
  }
}
