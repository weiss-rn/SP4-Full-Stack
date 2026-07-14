export type Locale = "en" | "id";

export type TranslationKey =
  | "banner.text"
  | "nav.home"
  | "nav.categories"
  | "nav.allParts"
  | "nav.orders"
  | "nav.cart"
  | "nav.search"
  | "nav.signIn"
  | "nav.signOut"
  | "hero.badge"
  | "hero.title1"
  | "hero.title2"
  | "hero.description"
  | "hero.browseAll"
  | "hero.shopByCategory"
  | "features.freeShipping"
  | "features.freeShippingDesc"
  | "features.qualityGuaranteed"
  | "features.qualityGuaranteedDesc"
  | "features.returns"
  | "features.returnsDesc"
  | "features.bestPrices"
  | "features.bestPricesDesc"
  | "home.shopByCategory"
  | "home.shopByCategoryDesc"
  | "home.viewAll"
  | "home.partsCount"
  | "home.featured"
  | "home.featuredDesc"
  | "home.ctaTitle"
  | "home.ctaDesc"
  | "home.ctaButton"
  | "categories.title"
  | "categories.description"
  | "categories.partsAvailable"
  | "category.backToCategories"
  | "category.notFound"
  | "products.title"
  | "products.productsFound"
  | "products.searchPlaceholder"
  | "products.allCategories"
  | "products.sortName"
  | "products.sortPriceLow"
  | "products.sortPriceHigh"
  | "products.sortRating"
  | "products.filters"
  | "products.noResults"
  | "products.page"
  | "products.of"
  | "products.previous"
  | "products.next"
  | "product.backToParts"
  | "product.specifications"
  | "product.inStock"
  | "product.outOfStock"
  | "product.addToCart"
  | "product.addedToCart"
  | "product.relatedProducts"
  | "product.notFound"
  | "product.sku"
  | "cart.title"
  | "cart.items"
  | "cart.empty"
  | "cart.emptyDesc"
  | "cart.browseParts"
  | "cart.clearAll"
  | "cart.each"
  | "cart.orderSummary"
  | "cart.subtotal"
  | "cart.shipping"
  | "cart.free"
  | "cart.discount"
  | "cart.total"
  | "cart.discountPlaceholder"
  | "cart.apply"
  | "cart.codeApplied"
  | "cart.invalidCode"
  | "cart.proceedCheckout"
  | "cart.demoNotice"
  | "checkout.title"
  | "checkout.backToCart"
  | "checkout.contactInfo"
  | "checkout.firstName"
  | "checkout.lastName"
  | "checkout.email"
  | "checkout.phone"
  | "checkout.shippingAddress"
  | "checkout.address1"
  | "checkout.address2"
  | "checkout.city"
  | "checkout.state"
  | "checkout.postalCode"
  | "checkout.country"
  | "checkout.payment"
  | "checkout.paymentDemo"
  | "checkout.cardNumber"
  | "checkout.expiry"
  | "checkout.cvc"
  | "checkout.paymentNotice"
  | "checkout.placeOrder"
  | "checkout.recordingOrder"
  | "checkout.orderRecorded"
  | "checkout.orderLogged"
  | "checkout.continueShopping"
  | "checkout.nothingToCheckout"
  | "checkout.nothingDesc"
  | "checkout.browseParts"
  | "orders.title"
  | "orders.description"
  | "orders.searchPlaceholder"
  | "orders.searchButton"
  | "orders.searching"
  | "orders.noOrders"
  | "orders.total"
  | "orders.subtotal"
  | "orders.discount"
  | "orders.shippingLabel"
  | "orders.items"
  | "admin.signInTitle"
  | "admin.signInDesc"
  | "admin.password"
  | "admin.signIn"
  | "admin.signingIn"
  | "footer.description"
  | "footer.shop"
  | "footer.support"
  | "footer.discountCodes"
  | "footer.copyright"
  | "auth.signInTitle"
  | "auth.signInDesc"
  | "auth.registerTitle"
  | "auth.registerDesc"
  | "auth.fullName"
  | "cart.itemsLabel"
  | "profile.title"
  | "profile.description"
  | "profile.personalInfo"
  | "profile.firstName"
  | "profile.lastName"
  | "profile.email"
  | "profile.phone"
  | "profile.memberSince"
  | "profile.saveChanges"
  | "profile.saving"
  | "profile.saved"
  | "profile.addresses"
  | "profile.addAddress"
  | "profile.editAddress"
  | "profile.deleteAddress"
  | "profile.defaultAddress"
  | "profile.setAsDefault"
  | "profile.noAddresses"
  | "profile.addressLabel"
  | "profile.addressLine1"
  | "profile.addressLine2"
  | "profile.city"
  | "profile.state"
  | "profile.postalCode"
  | "profile.country"
  | "profile.cancel"
  | "profile.saveAddress"
  | "profile.signOut"
  | "profile.orders"
  | "profile.changePassword"
  | "profile.currentPassword"
  | "profile.newPassword"
  | "profile.confirmPassword"
  | "profile.passwordMismatch"
  | "profile.passwordChanged"
  | "profile.updating"
  | "profile.updatePassword"
  | "profile.reviews"
  | "orders.historyTitle"
  | "orders.historyDescription"
  | "orders.statusPending"
  | "orders.statusConfirmed"
  | "orders.statusCancelled"
  | "orders.statusPartiallyCancelled"
  | "orders.viewDetails"
  | "orders.cancelOrder"
  | "orders.cancelItem"
  | "orders.cancelReason"
  | "orders.cancelReasonChangedMind"
  | "orders.cancelReasonBetterPrice"
  | "orders.cancelReasonWrongItem"
  | "orders.cancelReasonNoLongerNeeded"
  | "orders.cancelReasonOther"
  | "orders.cancelConfirm"
  | "orders.cancelSuccess"
  | "orders.alreadyCancelled"
  | "orders.detailTitle"
  | "orders.shippingAddress"
  | "orders.paymentSummary"
  | "orders.orderNumber"
  | "orders.orderDate"
  | "orders.orderStatus"
  | "orders.writeReview"
  | "orders.reviewWritten"
  | "reviews.historyTitle"
  | "reviews.historyDescription"
  | "reviews.deleteReview"
  | "reviews.deleteConfirm"
  | "reviews.deleted"
  | "reviews.noReviews"
  | "reviews.noReviewsDesc"
  | "reviews.onProduct"
  | "reviews.browseProducts";

function buildDict(obj: Record<string, string>): Record<TranslationKey, string> {
  return obj as Record<TranslationKey, string>;
}

const enDict: Record<TranslationKey, string> = buildDict({
  "banner.text": "Use code <strong>MOTO10</strong> for 10% off your order — Free shipping on orders over $200",
  "nav.home": "Home",
  "nav.categories": "Categories",
  "nav.allParts": "All Parts",
  "nav.orders": "Orders",
  "nav.cart": "Cart",
  "nav.search": "Search",
  "nav.signIn": "Sign In",
  "nav.signOut": "Sign Out",
  "hero.badge": "Premium Parts",
  "hero.title1": "Motorcycle Spare Parts",
  "hero.title2": "You Can Trust",
  "hero.description": "OEM-quality and performance parts for every ride.",
  "hero.browseAll": "Browse All Parts",
  "hero.shopByCategory": "Shop by Category",
  "features.freeShipping": "Free Shipping",
  "features.freeShippingDesc": "Orders over $200",
  "features.qualityGuaranteed": "Quality Guaranteed",
  "features.qualityGuaranteedDesc": "OEM-spec parts",
  "features.returns": "30-Day Returns",
  "features.returnsDesc": "Hassle-free",
  "features.bestPrices": "Best Prices",
  "features.bestPricesDesc": "Competitive pricing",
  "home.shopByCategory": "Shop by Category",
  "home.shopByCategoryDesc": "Find parts by system",
  "home.viewAll": "View All",
  "home.partsCount": "{{count}} parts",
  "home.featured": "Featured & On Sale",
  "home.featuredDesc": "Top picks and discounted parts",
  "home.ctaTitle": "New Customer? Get 25% Off",
  "home.ctaDesc": "Use code <strong>FIRST25</strong> at checkout",
  "home.ctaButton": "Start Shopping",
  "categories.title": "Categories",
  "categories.description": "Browse parts by motorcycle system",
  "categories.partsAvailable": "{{count}} parts available",
  "category.backToCategories": "All Categories",
  "category.notFound": "Category Not Found",
  "products.title": "All Parts",
  "products.productsFound": "{{count}} products",
  "products.searchPlaceholder": "Search parts...",
  "products.allCategories": "All Categories",
  "products.sortName": "Sort: Name",
  "products.sortPriceLow": "Price: Low to High",
  "products.sortPriceHigh": "Price: High to Low",
  "products.sortRating": "Top Rated",
  "products.filters": "Filters",
  "products.noResults": "No parts found matching your search.",
  "products.page": "Page",
  "products.of": "of",
  "products.previous": "Previous",
  "products.next": "Next",
  "product.backToParts": "All Parts",
  "product.specifications": "Specifications",
  "product.inStock": "In Stock",
  "product.outOfStock": "Out of Stock",
  "product.addToCart": "Add to Cart",
  "product.addedToCart": "Added to Cart",
  "product.relatedProducts": "More from {{category}}",
  "product.notFound": "Product Not Found",
  "product.sku": "SKU",
  "cart.title": "Shopping Cart",
  "cart.items": "{{count}} items",
  "cart.empty": "Your Cart is Empty",
  "cart.emptyDesc": "Add some parts to get started",
  "cart.browseParts": "Browse Parts",
  "cart.clearAll": "Clear All",
  "cart.each": "each",
  "cart.orderSummary": "Order Summary",
  "cart.subtotal": "Subtotal",
  "cart.shipping": "Shipping",
  "cart.free": "Free",
  "cart.discount": "Discount",
  "cart.total": "Total",
  "cart.discountPlaceholder": "Discount code",
  "cart.apply": "Apply",
  "cart.codeApplied": "Code applied!",
  "cart.invalidCode": "Invalid discount code",
  "cart.proceedCheckout": "Proceed to Checkout",
  "cart.demoNotice": "This is a demo store. No real payment will be processed.",
  "checkout.title": "Checkout",
  "checkout.backToCart": "Back to Cart",
  "checkout.contactInfo": "Contact Information",
  "checkout.firstName": "First Name",
  "checkout.lastName": "Last Name",
  "checkout.email": "Email",
  "checkout.phone": "Phone",
  "checkout.shippingAddress": "Shipping Address",
  "checkout.address1": "Address Line 1",
  "checkout.address2": "Address Line 2 (optional)",
  "checkout.city": "City",
  "checkout.state": "State / Province",
  "checkout.postalCode": "ZIP / Postal Code",
  "checkout.country": "Country",
  "checkout.payment": "Payment (Demo)",
  "checkout.paymentDemo": "Demo mode only. Receipt recorded for admin report.",
  "checkout.cardNumber": "Card Number",
  "checkout.expiry": "MM / YY",
  "checkout.cvc": "CVC",
  "checkout.paymentNotice": "Demo only. Successful checkouts update stock and admin report.",
  "checkout.placeOrder": "Place Demo Order",
  "checkout.recordingOrder": "Recording Demo Order...",
  "checkout.orderRecorded": "Demo Order Recorded!",
  "checkout.orderLogged": "Logged at {{time}}. Inventory has been updated.",
  "checkout.continueShopping": "Continue Shopping",
  "checkout.nothingToCheckout": "Nothing to Checkout",
  "checkout.nothingDesc": "Add some items to your cart first.",
  "checkout.browseParts": "Browse Parts",
  "orders.title": "Order Lookup",
  "orders.description": "Find demo purchases recorded with your email.",
  "orders.searchPlaceholder": "Email address",
  "orders.searchButton": "Search Orders",
  "orders.searching": "Searching...",
  "orders.noOrders": "No orders found",
  "orders.total": "Total",
  "orders.subtotal": "Subtotal",
  "orders.discount": "Discount",
  "orders.shippingLabel": "Shipping",
  "orders.items": "Items",
  "admin.signInTitle": "Admin Sign In",
  "admin.signInDesc": "Inventory tools require an admin session.",
  "admin.password": "Password",
  "admin.signIn": "Sign In",
  "admin.signingIn": "Signing in...",
  "footer.description": "Premium motorcycle spare parts.",
  "footer.shop": "Shop",
  "footer.support": "Support",
  "footer.discountCodes": "Discount Codes",
  "footer.copyright": "© 2025 MotoParts.",
  "auth.signInTitle": "Sign In",
  "auth.signInDesc": "Sign in to sync your cart across devices.",
  "auth.registerTitle": "Create Account",
  "auth.registerDesc": "Sign up to sync your cart across devices.",
  "auth.fullName": "Full Name",
  "cart.itemsLabel": "items",
  "profile.title": "My Profile",
  "profile.description": "Manage your personal information and addresses",
  "profile.personalInfo": "Personal Information",
  "profile.firstName": "First Name",
  "profile.lastName": "Last Name",
  "profile.email": "Email",
  "profile.phone": "Phone",
  "profile.memberSince": "Member since {{date}}",
  "profile.saveChanges": "Save Changes",
  "profile.saving": "Saving...",
  "profile.saved": "Profile updated!",
  "profile.addresses": "Saved Addresses",
  "profile.addAddress": "Add Address",
  "profile.editAddress": "Edit",
  "profile.deleteAddress": "Delete",
  "profile.defaultAddress": "Default",
  "profile.setAsDefault": "Set as default",
  "profile.noAddresses": "No saved addresses yet.",
  "profile.addressLabel": "Label",
  "profile.addressLine1": "Address Line 1",
  "profile.addressLine2": "Address Line 2",
  "profile.city": "City",
  "profile.state": "State / Province",
  "profile.postalCode": "ZIP / Postal Code",
  "profile.country": "Country",
  "profile.cancel": "Cancel",
  "profile.saveAddress": "Save Address",
  "profile.signOut": "Sign Out",
  "profile.orders": "My Orders",
  "profile.changePassword": "Change Password",
  "profile.currentPassword": "Current Password",
  "profile.newPassword": "New Password",
  "profile.confirmPassword": "Confirm New Password",
  "profile.passwordMismatch": "Passwords do not match.",
  "profile.passwordChanged": "Password updated successfully!",
  "profile.updating": "Updating...",
  "profile.updatePassword": "Update Password",
  "profile.reviews": "My Reviews",
  "orders.historyTitle": "Transaction History",
  "orders.historyDescription": "View all your past orders and their status.",
  "orders.statusPending": "Pending",
  "orders.statusConfirmed": "Confirmed",
  "orders.statusCancelled": "Cancelled",
  "orders.statusPartiallyCancelled": "Partially Cancelled",
  "orders.viewDetails": "View Details",
  "orders.cancelOrder": "Cancel Order",
  "orders.cancelItem": "Cancel Item",
  "orders.cancelReason": "Reason for cancellation",
  "orders.cancelReasonChangedMind": "Changed my mind",
  "orders.cancelReasonBetterPrice": "Found a better price",
  "orders.cancelReasonWrongItem": "Wrong item ordered",
  "orders.cancelReasonNoLongerNeeded": "No longer needed",
  "orders.cancelReasonOther": "Other",
  "orders.cancelConfirm": "Confirm Cancellation",
  "orders.cancelSuccess": "Order cancelled successfully.",
  "orders.alreadyCancelled": "This order is already cancelled.",
  "orders.detailTitle": "Order Details",
  "orders.shippingAddress": "Shipping Address",
  "orders.paymentSummary": "Payment Summary",
  "orders.orderNumber": "Order Number",
  "orders.orderDate": "Order Date",
  "orders.orderStatus": "Status",
  "orders.writeReview": "Write Review",
  "orders.reviewWritten": "Review Written",
  "reviews.historyTitle": "My Reviews",
  "reviews.historyDescription": "All the reviews you've written for products.",
  "reviews.deleteReview": "Delete",
  "reviews.deleteConfirm": "Are you sure you want to delete this review?",
  "reviews.deleted": "Review deleted.",
  "reviews.noReviews": "No reviews yet",
  "reviews.noReviewsDesc": "You haven't written any reviews yet.",
  "reviews.onProduct": "on {{product}}",
  "reviews.browseProducts": "Browse Products",
});

const idDict: Record<TranslationKey, string> = buildDict({
  "banner.text": "Gunakan kode <strong>MOTO10</strong> untuk diskon 10% — Gratis ongkir di atas $200",
  "nav.home": "Beranda",
  "nav.categories": "Kategori",
  "nav.allParts": "Semua Suku Cadang",
  "nav.orders": "Pesanan",
  "nav.cart": "Keranjang",
  "nav.search": "Cari",
  "nav.signIn": "Masuk",
  "nav.signOut": "Keluar",
  "hero.badge": "Suku Cadang Premium",
  "hero.title1": "Suku Cadang Motor",
  "hero.title2": "Yang Bisa Anda Andalkan",
  "hero.description": "Suku cadang berkualitas OEM dan performa untuk setiap perjalanan.",
  "hero.browseAll": "Lihat Semua",
  "hero.shopByCategory": "Beli Berdasarkan Kategori",
  "features.freeShipping": "Gratis Ongkir",
  "features.freeShippingDesc": "Pesanan di atas $200",
  "features.qualityGuaranteed": "Kualitas Terjamin",
  "features.qualityGuaranteedDesc": "Suku cadang OEM",
  "features.returns": "Pengembalian 30 Hari",
  "features.returnsDesc": "Tanpa ribet",
  "features.bestPrices": "Harga Terbaik",
  "features.bestPricesDesc": "Harga kompetitif",
  "home.shopByCategory": "Beli Berdasarkan Kategori",
  "home.shopByCategoryDesc": "Temukan suku cadang berdasarkan sistem",
  "home.viewAll": "Lihat Semua",
  "home.partsCount": "{{count}} suku cadang",
  "home.featured": "Unggulan & Diskon",
  "home.featuredDesc": "Pilihan terbaik dan suku cadang diskon",
  "home.ctaTitle": "Pelanggan Baru? Dapatkan Diskon 25%",
  "home.ctaDesc": "Gunakan kode <strong>FIRST25</strong> saat checkout",
  "home.ctaButton": "Mulai Belanja",
  "categories.title": "Kategori",
  "categories.description": "Jelajahi suku cadang berdasarkan sistem motor",
  "categories.partsAvailable": "{{count}} suku cadang tersedia",
  "category.backToCategories": "Semua Kategori",
  "category.notFound": "Kategori Tidak Ditemukan",
  "products.title": "Semua Suku Cadang",
  "products.productsFound": "{{count}} produk",
  "products.searchPlaceholder": "Cari suku cadang...",
  "products.allCategories": "Semua Kategori",
  "products.sortName": "Urutkan: Nama",
  "products.sortPriceLow": "Harga: Rendah ke Tinggi",
  "products.sortPriceHigh": "Harga: Tinggi ke Rendah",
  "products.sortRating": "Rating Tertinggi",
  "products.filters": "Filter",
  "products.noResults": "Tidak ada suku cadang yang cocok.",
  "products.page": "Halaman",
  "products.of": "dari",
  "products.previous": "Sebelumnya",
  "products.next": "Berikutnya",
  "product.backToParts": "Semua Suku Cadang",
  "product.specifications": "Spesifikasi",
  "product.inStock": "Tersedia",
  "product.outOfStock": "Habis",
  "product.addToCart": "Tambah ke Keranjang",
  "product.addedToCart": "Ditambahkan",
  "product.relatedProducts": "Lainnya dari {{category}}",
  "product.notFound": "Produk Tidak Ditemukan",
  "product.sku": "SKU",
  "cart.title": "Keranjang Belanja",
  "cart.items": "{{count}} item",
  "cart.empty": "Keranjang Anda Kosong",
  "cart.emptyDesc": "Tambahkan suku cadang untuk memulai",
  "cart.browseParts": "Lihat Suku Cadang",
  "cart.clearAll": "Hapus Semua",
  "cart.each": "per item",
  "cart.orderSummary": "Ringkasan Pesanan",
  "cart.subtotal": "Subtotal",
  "cart.shipping": "Pengiriman",
  "cart.free": "Gratis",
  "cart.discount": "Diskon",
  "cart.total": "Total",
  "cart.discountPlaceholder": "Kode diskon",
  "cart.apply": "Terapkan",
  "cart.codeApplied": "Kode berhasil!",
  "cart.invalidCode": "Kode diskon tidak valid",
  "cart.proceedCheckout": "Lanjut ke Pembayaran",
  "cart.demoNotice": "Demo toko. Tidak ada pembayaran nyata.",
  "checkout.title": "Pembayaran",
  "checkout.backToCart": "Kembali ke Keranjang",
  "checkout.contactInfo": "Informasi Kontak",
  "checkout.firstName": "Nama Depan",
  "checkout.lastName": "Nama Belakang",
  "checkout.email": "Email",
  "checkout.phone": "Telepon",
  "checkout.shippingAddress": "Alamat Pengiriman",
  "checkout.address1": "Alamat Baris 1",
  "checkout.address2": "Alamat Baris 2 (opsional)",
  "checkout.city": "Kota",
  "checkout.state": "Provinsi",
  "checkout.postalCode": "Kode Pos",
  "checkout.country": "Negara",
  "checkout.payment": "Pembayaran (Demo)",
  "checkout.paymentDemo": "Hanya mode demo. Struk untuk laporan admin.",
  "checkout.cardNumber": "Nomor Kartu",
  "checkout.expiry": "MM / TT",
  "checkout.cvc": "CVC",
  "checkout.paymentNotice": "Masih demonstrasi, memperbarui stok dan laporan admin.",
  "checkout.placeOrder": "Buat Pesanan Demo",
  "checkout.recordingOrder": "Mencatat Pesanan...",
  "checkout.orderRecorded": "Pesanan Demo Tercatat!",
  "checkout.orderLogged": "Dicatat pada {{time}}. Inventaris diperbarui.",
  "checkout.continueShopping": "Lanjut Belanja",
  "checkout.nothingToCheckout": "Tidak Ada yang Dibayar",
  "checkout.nothingDesc": "Tambahkan item ke keranjang terlebih dahulu.",
  "checkout.browseParts": "Lihat Suku Cadang",
  "orders.title": "Cari Pesanan",
  "orders.description": "Temukan pembelian demo dengan email Anda.",
  "orders.searchPlaceholder": "Alamat email",
  "orders.searchButton": "Cari Pesanan",
  "orders.searching": "Mencari...",
  "orders.noOrders": "Tidak ada pesanan",
  "orders.total": "Total",
  "orders.subtotal": "Subtotal",
  "orders.discount": "Diskon",
  "orders.shippingLabel": "Pengiriman",
  "orders.items": "Item",
  "admin.signInTitle": "Masuk Admin",
  "admin.signInDesc": "Alat inventaris memerlukan sesi admin.",
  "admin.password": "Kata Sandi",
  "admin.signIn": "Masuk",
  "admin.signingIn": "Sedang masuk...",
  "footer.description": "Suku cadang motor premium.",
  "footer.shop": "Toko",
  "footer.support": "Dukungan",
  "footer.discountCodes": "Kode Diskon",
  "footer.copyright": "© 2025 MotoParts.",
  "auth.signInTitle": "Masuk",
  "auth.signInDesc": "Masuk untuk menyinkronkan keranjang Anda.",
  "auth.registerTitle": "Buat Akun",
  "auth.registerDesc": "Daftar untuk menyinkronkan keranjang Anda.",
  "auth.fullName": "Nama Lengkap",
  "cart.itemsLabel": "item",
  "profile.title": "Profil Saya",
  "profile.description": "Kelola informasi pribadi dan alamat Anda",
  "profile.personalInfo": "Informasi Pribadi",
  "profile.firstName": "Nama Depan",
  "profile.lastName": "Nama Belakang",
  "profile.email": "Email",
  "profile.phone": "Telepon",
  "profile.memberSince": "Bergabung sejak {{date}}",
  "profile.saveChanges": "Simpan Perubahan",
  "profile.saving": "Menyimpan...",
  "profile.saved": "Profil diperbarui!",
  "profile.addresses": "Alamat Tersimpan",
  "profile.addAddress": "Tambah Alamat",
  "profile.editAddress": "Ubah",
  "profile.deleteAddress": "Hapus",
  "profile.defaultAddress": "Utama",
  "profile.setAsDefault": "Jadikan utama",
  "profile.noAddresses": "Belum ada alamat tersimpan.",
  "profile.addressLabel": "Label",
  "profile.addressLine1": "Alamat Baris 1",
  "profile.addressLine2": "Alamat Baris 2",
  "profile.city": "Kota",
  "profile.state": "Provinsi",
  "profile.postalCode": "Kode Pos",
  "profile.country": "Negara",
  "profile.cancel": "Batal",
  "profile.saveAddress": "Simpan Alamat",
  "profile.signOut": "Keluar",
  "profile.orders": "Pesanan Saya",
  "profile.changePassword": "Ubah Kata Sandi",
  "profile.currentPassword": "Kata Sandi Saat Ini",
  "profile.newPassword": "Kata Sandi Baru",
  "profile.confirmPassword": "Konfirmasi Kata Sandi Baru",
  "profile.passwordMismatch": "Kata sandi tidak cocok.",
  "profile.passwordChanged": "Kata sandi berhasil diperbarui!",
  "profile.updating": "Memperbarui...",
  "profile.updatePassword": "Perbarui Kata Sandi",
  "profile.reviews": "Ulasan Saya",
  "orders.historyTitle": "Riwayat Transaksi",
  "orders.historyDescription": "Lihat semua pesanan Anda dan statusnya.",
  "orders.statusPending": "Tertunda",
  "orders.statusConfirmed": "Dikonfirmasi",
  "orders.statusCancelled": "Dibatalkan",
  "orders.statusPartiallyCancelled": "Sebagian Dibatalkan",
  "orders.viewDetails": "Lihat Detail",
  "orders.cancelOrder": "Batalkan Pesanan",
  "orders.cancelItem": "Batalkan Item",
  "orders.cancelReason": "Alasan pembatalan",
  "orders.cancelReasonChangedMind": "Berubah pikiran",
  "orders.cancelReasonBetterPrice": "Menemukan harga lebih baik",
  "orders.cancelReasonWrongItem": "Salah pesan",
  "orders.cancelReasonNoLongerNeeded": "Tidak lagi dibutuhkan",
  "orders.cancelReasonOther": "Lainnya",
  "orders.cancelConfirm": "Konfirmasi Pembatalan",
  "orders.cancelSuccess": "Pesanan berhasil dibatalkan.",
  "orders.alreadyCancelled": "Pesanan ini sudah dibatalkan.",
  "orders.detailTitle": "Detail Pesanan",
  "orders.shippingAddress": "Alamat Pengiriman",
  "orders.paymentSummary": "Ringkasan Pembayaran",
  "orders.orderNumber": "Nomor Pesanan",
  "orders.orderDate": "Tanggal Pesanan",
  "orders.orderStatus": "Status",
  "orders.writeReview": "Tulis Ulasan",
  "orders.reviewWritten": "Ulasan Ditulis",
  "reviews.historyTitle": "Ulasan Saya",
  "reviews.historyDescription": "Semua ulasan yang Anda tulis untuk produk.",
  "reviews.deleteReview": "Hapus",
  "reviews.deleteConfirm": "Yakin ingin menghapus ulasan ini?",
  "reviews.deleted": "Ulasan dihapus.",
  "reviews.noReviews": "Belum ada ulasan",
  "reviews.noReviewsDesc": "Anda belum menulis ulasan apapun.",
  "reviews.onProduct": "di {{product}}",
  "reviews.browseProducts": "Lihat Produk",
});

const translations: Record<Locale, Record<TranslationKey, string>> = { en: enDict, id: idDict };

export function t(locale: Locale, key: TranslationKey, params?: Record<string, string | number>): string {
  const value = translations[locale]?.[key] ?? translations.en[key] ?? key;
  if (!params) return value;
  return Object.entries(params).reduce<string>(
    (result, [param, replacement]) => result.replace(new RegExp('\\{\\{' + param + '\\}\\}', 'g'), String(replacement)),
    value,
  );
}
