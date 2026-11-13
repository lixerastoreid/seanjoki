
/* =========================================
   JOKI MLBB - SCRIPT.JS
   BAGIAN 1/5 : DATA DAN NAVIGASI
========================================= */

// Nomor WhatsApp admin
const ADMIN_WA = "628818238236";

// Harga Joki Rank (harga per bintang)
const rankPrices = {
  Grandmaster: 3000,
  Epic: 5000,
  Legend: 7000,
  Mythic: 10000,
  Honor: 15000,
  Glory: 20000,
  Immortal: 25000
};

// Harga Joki Gendong (harga per bintang)
const gendongPrices = {
  Grandmaster: 4000,
  Epic: 6000,
  Legend: 8000,
  Mythic: 12000,
  Honor: 17000,
  Glory: 22000,
  Immortal: 28000
};

// Harga paket Rising MLBB
const risingPrices = {
  "Area terbuka": 30000,
  "Bracket area": 40000,
  "Bracket kota": 40000,
  "Bracket provinsi": 40000,
  "Sub region": 50000,
  "Bracket regional": 50000,
  "Kejuaraan divisi": 70000
};

// Harga paket Montage
const montagePrices = {
  "Joki Montage All Hero": 20000,
  "Joki Montage Fanny - Free Edit": 50000,
  "Joki Montage Ling - Free Edit": 50000,
  "Joki Montage Lancelot - Free Edit": 50000
};

// Data pesanan yang sedang dibuat
let currentOrder = null;
let selectedPackages = {
  rising: null,
  montage: null
};

// Format Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

// Navigasi halaman tanpa reload website
function showPage(pageName) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const target = document.getElementById("page-" + pageName);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle(
      "active",
      link.dataset.page === pageName
    );
  });

  document.getElementById("navLinks").classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Navigasi menu desktop dan mobile
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    showPage(link.dataset.page);
  });
});

// Tombol menu HP
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});

/* =========================================
   BAGIAN 2/5 : SISTEM RANK DAN KALKULATOR
========================================= */

// Urutan rank MLBB
const rankOrder = [
  "Grandmaster",
  "Epic",
  "Legend",
  "Mythic",
  "Honor",
  "Glory",
  "Immortal"
];

const tierNames = {
  5: "V",
  4: "IV",
  3: "III",
  2: "II",
  1: "I"
};

// Posisi awal setiap kelompok rank
const rankBase = {
  Grandmaster: 0,
  Epic: 25,
  Legend: 50,
  Mythic: 75,
  Honor: 100,
  Glory: 125,
  Immortal: 175
};

// Mengambil nilai bintang dari select/input
function getStarValue(id) {
  return Number(document.getElementById(id).value);
}

// Mengatur input bintang sesuai rank
function configureStarField(id, rank, defaultValue) {
  const oldField = document.getElementById(id);

  if (rank === "Immortal") {
    if (oldField.tagName !== "INPUT") {
      const input = document.createElement("input");
      input.type = "number";
      input.id = id;
      input.className = "field";
      input.min = "100";
      input.max = "999999";
      input.step = "1";
      input.value = Math.max(100, defaultValue || 100);
      input.placeholder = "100 - 999999";
      oldField.replaceWith(input);
    } else {
      oldField.min = "100";
      oldField.max = "999999";
      oldField.value = Math.max(100, Number(oldField.value) || 100);
    }
    return;
  }

  const limits = {
    Grandmaster: [1, 5],
    Epic: [1, 5],
    Legend: [1, 5],
    Mythic: [0, 24],
    Honor: [25, 49],
    Glory: [50, 99]
  };

  const [min, max] = limits[rank];

  let field = oldField;

  if (field.tagName !== "SELECT") {
    const select = document.createElement("select");
    select.id = id;
    select.className = "field";
    field.replaceWith(select);
    field = select;
  }

  field.innerHTML = "";

  for (let star = min; star <= max; star++) {
    const option = document.createElement("option");
    option.value = star;
    option.textContent = star + " Bintang";
    field.appendChild(option);
  }

  const safeValue = Math.min(max, Math.max(min, defaultValue ?? min));
  field.value = safeValue;
}

// Menampilkan/menyembunyikan pilihan pangkat
function updateTierVisibility(rankId, tierWrapId) {
  const rank = document.getElementById(rankId).value;
  document.getElementById(tierWrapId).style.display =
    ["Grandmaster", "Epic", "Legend"].includes(rank)
      ? "flex"
      : "none";
}

// Menghitung posisi bintang pada urutan seluruh rank
function getRankPosition(rank, star, tier) {
  if (["Grandmaster", "Epic", "Legend"].includes(rank)) {
    const tierOffset = 5 - Number(tier);
    return rankBase[rank] + (tierOffset * 5) + (Number(star) - 1);
  }

  if (rank === "Mythic") {
    return 75 + Number(star);
  }

  if (rank === "Honor") {
    return 100 + (Number(star) - 25);
  }

  if (rank === "Glory") {
    return 125 + (Number(star) - 50);
  }

  if (rank === "Immortal") {
    return 175 + (Number(star) - 100);
  }

  return 0;
}

// Mengubah posisi menjadi nama rank dan bintang
function getRankFromPosition(position) {
  if (position < 25) {
    const offset = position;
    const tierIndex = Math.floor(offset / 5);
    const star = (offset % 5) + 1;
    return {
      rank: "Grandmaster",
      tier: 5 - tierIndex,
      star
    };
  }

  if (position < 50) {
    const offset = position - 25;
    return {
      rank: "Epic",
      tier: 5 - Math.floor(offset / 5),
      star: (offset % 5) + 1
    };
  }

  if (position < 75) {
    const offset = position - 50;
    return {
      rank: "Legend",
      tier: 5 - Math.floor(offset / 5),
      star: (offset % 5) + 1
    };
  }

  if (position < 100) {
    return {
      rank: "Mythic",
      star: position - 75
    };
  }

  if (position < 125) {
    return {
      rank: "Honor",
      star: position - 75
    };
  }

  if (position < 175) {
    return {
      rank: "Glory",
      star: position - 75
    };
  }

  return {
    rank: "Immortal",
    star: position - 75
  };
}

// Membuat teks rank yang mudah dibaca
function getRankLabel(data) {
  if (data.tier) {
    return `${data.rank} ${tierNames[data.tier]} - ${data.star}★`;
  }
  return `${data.rank} ${data.star}★`;
}

// Membaca data pilihan dari form kalkulator
function readCalculator(prefix) {
  const isGendong = prefix === "gendong";

  const startRank = document.getElementById(
    isGendong ? "gendongStart" : "rankStart"
  ).value;

  const endRank = document.getElementById(
    isGendong ? "gendongEnd" : "rankEnd"
  ).value;

  const startStar = getStarValue(
    isGendong ? "gendongStartStar" : "startStar"
  );

  const endStar = getStarValue(
    isGendong ? "gendongEndStar" : "endStar"
  );

  const startTier = document.getElementById(
    isGendong ? "gendongStartTier" : "startTier"
  ).value;

  const endTier = document.getElementById(
    isGendong ? "gendongEndTier" : "endTier"
  ).value;

  const startPosition = getRankPosition(
    startRank, startStar, startTier
  );

  const endPosition = getRankPosition(
    endRank, endStar, endTier
  );

  return {
    startRank,
    endRank,
    startStar,
    endStar,
    startTier,
    endTier,
    startPosition,
    endPosition
  };
}

// Kalkulator harga: MENJUMLAHKAN SETIAP BINTANG
function calculateRankPrice(prefix) {
  const data = readCalculator(prefix);

  const prices = prefix === "gendong"
    ? gendongPrices
    : rankPrices;

  const totalId = prefix === "gendong"
    ? "gendongTotal"
    : "rankTotal";

  const summaryId = prefix === "gendong"
    ? "gendongSummary"
    : "rankSummary";

  const totalElement = document.getElementById(totalId);
  const summaryElement = document.getElementById(summaryId);

  if (data.endPosition < data.startPosition) {
    totalElement.textContent = formatRupiah(0);
    summaryElement.textContent =
      "Rank tujuan harus lebih tinggi dari rank awal.";
    return null;
  }

  let total = 0;
  let detail = [];

  // Semua bintang awal sampai tujuan ikut dihitung.
  // Tidak memakai perkalian harga x jumlah bintang.
  for (
    let position = data.startPosition;
    position <= data.endPosition;
    position++
  ) {
    const current = getRankFromPosition(position);
    const price = prices[current.rank];

    total += price;

    detail.push({
      label: getRankLabel(current),
      price: price
    });
  }

  totalElement.textContent = formatRupiah(total);
  summaryElement.textContent =
    `${detail.length} bintang: ${getRankLabel(getRankFromPosition(data.startPosition))} sampai ${getRankLabel(getRankFromPosition(data.endPosition))}`;

  return {
    ...data,
    total,
    detail,
    category: prefix === "gendong" ? "Joki Gendong" : "Joki Rank"
  };
}

/* =========================================
   BAGIAN 3/5 : AKTIVASI KALKULATOR DAN PAKET
========================================= */

// Konfigurasi kalkulator Rank dan Gendong
function initializeCalculator(prefix) {
  const isGendong = prefix === "gendong";

  const ids = isGendong
    ? {
        startRank: "gendongStart",
        endRank: "gendongEnd",
        startTier: "gendongStartTier",
        endTier: "gendongEndTier",
        startStar: "gendongStartStar",
        endStar: "gendongEndStar",
        startWrap: "gendongStartTierWrap",
        endWrap: "gendongEndTierWrap"
      }
    : {
        startRank: "rankStart",
        endRank: "rankEnd",
        startTier: "startTier",
        endTier: "endTier",
        startStar: "startStar",
        endStar: "endStar",
        startWrap: "startTierWrap",
        endWrap: "endTierWrap"
      };

  function refresh() {
    const startRank = document.getElementById(ids.startRank).value;
    const endRank = document.getElementById(ids.endRank).value;

    const oldStart = Number(document.getElementById(ids.startStar).value);
    const oldEnd = Number(document.getElementById(ids.endStar).value);

    updateTierVisibility(ids.startRank, ids.startWrap);
    updateTierVisibility(ids.endRank, ids.endWrap);

    configureStarField(ids.startStar, startRank, oldStart);
    configureStarField(ids.endStar, endRank, oldEnd);

    calculateRankPrice(prefix);
  }

  [
    ids.startRank,
    ids.endRank,
    ids.startTier,
    ids.endTier
  ].forEach(id => {
    document.getElementById(id).addEventListener("change", refresh);
  });

  refresh();
}

// Listener untuk bintang yang dapat berubah menjadi input angka
document.addEventListener("input", event => {
  const id = event.target.id;

  if ([
    "startStar",
    "endStar",
    "gendongStartStar",
    "gendongEndStar"
  ].includes(id)) {
    calculateRankPrice(id.startsWith("gendong") ? "gendong" : "rank");
  }
});

document.addEventListener("change", event => {
  const id = event.target.id;

  if ([
    "startStar",
    "endStar",
    "gendongStartStar",
    "gendongEndStar"
  ].includes(id)) {
    calculateRankPrice(id.startsWith("gendong") ? "gendong" : "rank");
  }
});

// Jalankan kalkulator
initializeCalculator("rank");
initializeCalculator("gendong");

// Memilih paket Rising atau Montage
function selectPackage(category, name, price, image, button) {
  selectedPackages[category] = {
    category: category === "rising"
      ? "Joki Rising MLBB"
      : "Joki Montage",
    name,
    price,
    image
  };

  const pageId = category === "rising"
    ? "page-rising"
    : "page-montage";

  document.querySelectorAll(
    `#${pageId} .package-card`
  ).forEach(card => {
    card.classList.remove("selected");
  });

  button.classList.add("selected");

  const nameId = category === "rising"
    ? "risingSelectedName"
    : "montageSelectedName";

  const priceId = category === "rising"
    ? "risingSelectedPrice"
    : "montageSelectedPrice";

  document.getElementById(nameId).textContent = name;
  document.getElementById(priceId).textContent = formatRupiah(price);

  const summary = document.getElementById(
    category === "rising"
      ? "risingSummary"
      : "montageSummary"
  );

  summary.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

// Menyiapkan order dari kalkulator Rank atau Gendong
function prepareRankOrder(type) {
  const result = calculateRankPrice(type);

  if (!result) {
    alert("Rank tujuan harus lebih tinggi dari rank awal.");
    return;
  }

  currentOrder = {
    category: result.category,
    product: `${getRankLabel(getRankFromPosition(result.startPosition))} → ${getRankLabel(getRankFromPosition(result.endPosition))}`,
    price: result.total,
    detail: result.detail,
    start: getRankLabel(getRankFromPosition(result.startPosition)),
    end: getRankLabel(getRankFromPosition(result.endPosition))
  };

  openOrderForm();
}

// Menyiapkan order dari paket
function preparePackageOrder(type) {
  const selected = selectedPackages[type];

  if (!selected) {
    alert("Silakan pilih salah satu paket terlebih dahulu.");
    return;
  }

  currentOrder = {
    category: selected.category,
    product: selected.name,
    price: selected.price,
    detail: []
  };

  openOrderForm();
    }

/* =========================================
   BAGIAN 4/5 : FORMULIR DAN PEMBAYARAN QR
========================================= */

// Membuka formulir pemesanan
function openOrderForm() {
  if (!currentOrder) return;

  document.getElementById("formProduct").textContent =
    currentOrder.category + " — " + currentOrder.product;

  document.getElementById("formPrice").textContent =
    formatRupiah(currentOrder.price);

  document.getElementById("orderModal").classList.add("show");
  document.body.style.overflow = "hidden";
}

// Menutup popup
function closeModal(id) {
  document.getElementById(id).classList.remove("show");

  const anotherModalOpen = document.querySelector(
    ".modal-overlay.show"
  );

  if (!anotherModalOpen) {
    document.body.style.overflow = "";
  }
}

// Menutup popup jika klik area luar
document.querySelectorAll(".modal-overlay").forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModal(modal.id);
    }
  });
});

// Proses formulir pelanggan
document.getElementById("customerForm").addEventListener(
  "submit",
  event => {
    event.preventDefault();

    if (!currentOrder) {
      alert("Pesanan tidak ditemukan. Silakan pilih layanan kembali.");
      return;
    }

    const name = document.getElementById("customerName")
      .value.trim();

    const phone = document.getElementById("customerPhone")
      .value.trim();

    if (name.length < 2) {
      alert("Nama minimal 2 karakter.");
      return;
    }

    const cleanPhone = phone.replace(/[\s\-+]/g, "");

    if (!/^0?8[0-9]{8,13}$/.test(cleanPhone)) {
      alert("Masukkan nomor WhatsApp Indonesia yang valid.");
      return;
    }

    currentOrder.customer = {
      name,
      phone: cleanPhone
    };

    // Isi detail pada popup pembayaran
    document.getElementById("paymentTotal").textContent =
      formatRupiah(currentOrder.price);

    document.getElementById("paymentProduct").textContent =
      currentOrder.category + " — " + currentOrder.product;

    document.getElementById("paymentCustomer").textContent =
      "Nama: " + name + " | WhatsApp: " + cleanPhone;

    closeModal("orderModal");

    document.getElementById("paymentModal").classList.add("show");
    document.body.style.overflow = "hidden";
  }
);

// Membuat pesan WhatsApp sesuai kategori pesanan
function buildWhatsAppMessage() {
  if (!currentOrder || !currentOrder.customer) {
    return "";
  }

  const customer = currentOrder.customer;

  let message = [
    "HALO ADMIN, SAYA INGIN KONFIRMASI PESANAN.",
    "",
    "=== DETAIL PESANAN ===",
    "Kategori: " + currentOrder.category,
    "Produk: " + currentOrder.product,
    "Nama: " + customer.name,
    "No. WhatsApp: " + customer.phone,
    "Total Harga: " + formatRupiah(currentOrder.price)
  ];

  if (currentOrder.category === "Joki Rank" ||
      currentOrder.category === "Joki Gendong") {

    message.push(
      "",
      "Rank Awal: " + currentOrder.start,
      "Rank Tujuan: " + currentOrder.end,
      "",
      "Rincian penjumlahan:"
    );

    currentOrder.detail.forEach(item => {
      message.push(
        "+ " + item.label + " = " + formatRupiah(item.price)
      );
    });

    message.push(
      "",
      "Total: " + formatRupiah(currentOrder.price)
    );
  }

  message.push(
    "",
    "Saya sudah melakukan pembayaran melalui QR.",
    "Mohon bantu cek pembayaran dan proses pesanan saya.",
    "",
    "Terima kasih."
  );

  return message.join("\n");
}

// Konfirmasi melalui WhatsApp admin
function confirmPayment() {
  if (!currentOrder || !currentOrder.customer) {
    alert("Data pesanan belum lengkap.");
    return;
  }

  const message = buildWhatsAppMessage();

  const whatsappURL =
    "https://wa.me/" + ADMIN_WA +
    "?text=" + encodeURIComponent(message);

  window.open(whatsappURL, "_blank");
}

/* =========================================
   BAGIAN 5/5 : FINALISASI DAN PENGAMAN
========================================= */

// Menutup popup menggunakan tombol Escape
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-overlay.show").forEach(modal => {
      closeModal(modal.id);
    });
  }
});

// Memastikan harga selalu berupa angka positif
function validateOrderPrice() {
  if (
    !currentOrder ||
    !Number.isFinite(currentOrder.price) ||
    currentOrder.price <= 0
  ) {
    alert("Harga pesanan tidak valid.");
    return false;
  }

  return true;
}

// Pengaman tambahan sebelum membuka pembayaran
const originalOpenOrderForm = openOrderForm;

openOrderForm = function () {
  if (!validateOrderPrice()) return;
  originalOpenOrderForm();
};

// Validasi tombol pembayaran
const originalConfirmPayment = confirmPayment;

confirmPayment = function () {
  if (!validateOrderPrice()) return;
  originalConfirmPayment();
};

// Tampilan awal website
showPage("home");

console.log("JOKI MLBB WEBSITE BERHASIL DIMUAT!");
console.log("Sistem kalkulator, paket, dan order aktif.");

