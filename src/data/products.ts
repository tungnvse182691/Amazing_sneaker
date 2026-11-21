import type { Product, SizeStock } from "../types";

/**
 * Seed 24 giày — 8 Nike + 8 Adidas + 8 Puma.
 * Mỗi giày có 1 colorway duy nhất với ẢNH THẬT đã xem bằng mắt và khớp
 * đúng model + đúng màu đó. Không bịa thêm colorway giả.
 * Ảnh: đường dẫn trực tiếp tới CDN chính hãng / nhà bán lẻ
 * (static.nike.com, image.goat.com, assets.adidas.com, images.puma.com,
 * images.novelship.com, image-cdn.hypb.st, cdn.evrysz.net, cdn.afew-store.com),
 * đã kiểm chứng HTTP 200 + xem bằng mắt đúng mẫu + đúng màu từng đôi.
 * Ngoại lệ giữ file local (không có link đúng màu): ảnh Deviate Nitro 3 đen
 * toàn tập và ảnh Jordan 1 tách nền dùng cho hero hộp giày.
 */

function sizes(zeroSizes: number[] = []): SizeStock[] {
  const stockBySize: Record<number, number> = {
    36: 8, 37: 12, 38: 10, 39: 14, 40: 16, 41: 18, 42: 15, 43: 12, 44: 9, 45: 6, 46: 4,
  };
  return Object.entries(stockBySize).map(([size, stock]) => ({
    size: Number(size),
    stock: zeroSizes.includes(Number(size)) ? 0 : stock,
  }));
}

export const products: Product[] = [
  // ── Nike (8) ──
  {
    id: "nike-air-jordan-1-retro-high",
    slug: "nike-air-jordan-1-retro-high",
    name: "Nike Air Jordan 1 Retro High",
    brand: "nike",
    category: "Bóng rổ",
    price: 4590000,
    originalPrice: 5490000,
    colors: [
      {
        name: "Đỏ Chicago / Trắng",
        hex: "#C8102E",
        image: "https://image.goat.com/transform/v1/attachments/product_template_additional_pictures/images/083/401/929/original/14741_01.jpg.jpeg?action=crop&width=1500",
      },
    ],
    sizes: sizes([36]),
    rating: 4.9,
    sold: 12400,
    isHot: true,
    description:
      "Huyền thoại sân bóng rổ với phối màu Chicago đỏ trắng kinh điển, da cao cấp và đệm Air êm chân.",
    cutoutImage: "/images/nike-air-jordan-1-retro-high-cutout.png",
  },
  {
    id: "nike-air-force-1-07",
    slug: "nike-air-force-1-07",
    name: "Nike Air Force 1 '07",
    brand: "nike",
    category: "Lifestyle",
    price: 2890000,
    originalPrice: 3290000,
    colors: [{ name: "Trắng", hex: "#FFFFFF", image: "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,b_rgb:f5f5f5/b7d9211c-26e7-431a-ac24-b0540fb3c00f/AIR+FORCE+1+%2707.png" }],
    sizes: sizes(),
    rating: 4.9,
    sold: 23800,
    isHot: true,
    description:
      "Đôi giày trắng quốc dân — da mềm, đế Air bền bỉ, phối được với mọi outfit từ đi học tới đi chơi.",
  },
  {
    id: "nike-air-max-90",
    slug: "nike-air-max-90",
    name: "Nike Air Max 90",
    brand: "nike",
    category: "Lifestyle",
    price: 3490000,
    colors: [
      {
        name: "Xám / Xanh navy / Đỏ",
        hex: "#8A8D91",
        image: "https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2025%2F04%2F23%2Fnike-air-max-90-usa-dm0029-117-release-info-000.jpg?w=960",
      },
    ],
    sizes: sizes([46]),
    rating: 4.8,
    sold: 15600,
    description:
      "Túi khí Air Max lộ rõ ở gót, phối màu xám navy đỏ cá tính — biểu tượng streetwear từ năm 1990.",
  },
  {
    id: "nike-dunk-low",
    slug: "nike-dunk-low",
    name: "Nike Dunk Low",
    brand: "nike",
    category: "Lifestyle",
    price: 3190000,
    originalPrice: 3790000,
    colors: [
      {
        name: "Trắng / Đen (Panda)",
        hex: "#111111",
        image: "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,b_rgb:f5f5f5/b1bcbca4-e853-4df7-b329-5be3c61ee057/NIKE+DUNK+LOW+RETRO.png",
      },
    ],
    sizes: sizes([36, 37]),
    rating: 4.9,
    sold: 18900,
    isHot: true,
    description:
      "Phối màu Panda đen trắng hot nhất mọi thời đại — da trơn bóng, form ôm vừa, càng mang càng đẹp.",
  },
  {
    id: "nike-pegasus-41",
    slug: "nike-pegasus-41",
    name: "Nike Pegasus 41",
    brand: "nike",
    category: "Chạy bộ",
    price: 3990000,
    colors: [{ name: "Trắng", hex: "#FFFFFF", image: "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,b_rgb:f5f5f5/2caa40d0-6887-4844-9431-5004b0a1e317/AIR+ZOOM+PEGASUS+41.png" }],
    sizes: sizes(),
    rating: 4.8,
    sold: 9200,
    isNew: true,
    description:
      "Đệm ReactX + túi khí Air Zoom toàn bàn chân — nhẹ, nảy, chạy dài không mỏi. Đôi chạy quốc dân mới nhất.",
  },
  {
    id: "nike-blazer-mid-77",
    slug: "nike-blazer-mid-77",
    name: "Nike Blazer Mid '77 Vintage",
    brand: "nike",
    category: "Lifestyle",
    price: 2790000,
    colors: [
      {
        name: "Trắng / Đen",
        hex: "#FFFFFF",
        image: "https://image.goat.com/transform/v1/attachments/product_template_additional_pictures/images/099/439/682/original/502784_01.jpg.jpeg?action=crop&width=1500",
      },
    ],
    sizes: sizes([45]),
    rating: 4.7,
    sold: 8700,
    description:
      "Cổ cao vintage, đế vulcanized ngả màu retro — chất bóng rổ thập niên 70 phối đồ đường phố cực chuẩn.",
  },
  {
    id: "nike-cortez",
    slug: "nike-cortez",
    name: "Nike Cortez",
    brand: "nike",
    category: "Lifestyle",
    price: 2490000,
    colors: [
      {
        name: "Trắng / Đỏ / Xanh",
        hex: "#FFFFFF",
        image: "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,b_rgb:f5f5f5/db838aa6-9440-4e42-adf5-81b9141aec37/NIKE+CORTEZ.png",
      },
    ],
    sizes: sizes(),
    rating: 4.7,
    sold: 7400,
    description:
      "Đôi chạy đầu tiên của Nike, Swoosh đỏ và đường kẻ xanh ở đế — cổ điển, gọn nhẹ, mang cả ngày vẫn thoải mái.",
  },
  {
    id: "nike-p-6000",
    slug: "nike-p-6000",
    name: "Nike P-6000",
    brand: "nike",
    category: "Lifestyle",
    price: 2990000,
    originalPrice: 3390000,
    colors: [{ name: "Bạc / Đỏ", hex: "#C0C0C0", image: "https://image.goat.com/transform/v1/attachments/product_template_additional_pictures/images/109/997/915/original/1577929_01.jpg.jpeg?action=crop&width=1500" }],
    sizes: sizes([36]),
    rating: 4.6,
    sold: 6800,
    isNew: true,
    description:
      "Phong cách Y2K bạc metallic, lưới thoáng khí và chi tiết đỏ nổi bật — đôi giày retro chạy phố đang lên.",
  },

  // ── Adidas (8) ──
  {
    id: "adidas-ultraboost-light",
    slug: "adidas-ultraboost-light",
    name: "Adidas Ultraboost Light",
    brand: "adidas",
    category: "Chạy bộ",
    price: 4490000,
    originalPrice: 4990000,
    colors: [
      { name: "Trắng", hex: "#FFFFFF", image: "https://images.novelship.com/product/adidas_ultraboost_light__triple_white__gy9350_0_91845.jpeg?fit=fill&bg=FFFFFF&trim=color&q=75&w=1200&h=1200&pad=80&fm=webp&auto=compress" },
    ],
    sizes: sizes(),
    rating: 4.8,
    sold: 11200,
    isHot: true,
    description:
      "Đế Light BOOST nhẹ hơn 30% so với Ultraboost thường — êm, nảy, ôm chân như đi tất. Đôi chạy dài đáng tiền nhất.",
  },
  {
    id: "adidas-samba-og",
    slug: "adidas-samba-og",
    name: "Adidas Samba OG",
    brand: "adidas",
    category: "Lifestyle",
    price: 2790000,
    colors: [
      {
        name: "Kem / Đen",
        hex: "#EFE7D8",
        image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/9b983d5bc09a4d4aba39a8bf011869ba_9366/Samba_OG_Shoes_White_B75806_00_plp_standard.jpg",
      },
    ],
    sizes: sizes([46]),
    rating: 4.9,
    sold: 21500,
    isHot: true,
    description:
      "Da mềm, đế gum, 3 sọc đen — đôi giày bóng đá trong nhà hóa biểu tượng thời trang đường phố toàn cầu.",
  },
  {
    id: "adidas-gazelle",
    slug: "adidas-gazelle",
    name: "Adidas Gazelle",
    brand: "adidas",
    category: "Lifestyle",
    price: 2590000,
    colors: [
      { name: "Đen / Trắng", hex: "#111111", image: "https://assets.adidas.com/images/w_600,f_auto,q_auto/61f87dec481e4512823ea7fb0080ba1a_9366/Gazelle_Shoes_Black_BB5476_01_standard.jpg" },
    ],
    sizes: sizes(),
    rating: 4.8,
    sold: 13400,
    description:
      "Da lộn đen, 3 sọc trắng, chữ Gazelle vàng — gọn, sạch, phối đồ nào cũng hợp, càng mang càng mềm chân.",
  },
  {
    id: "adidas-superstar",
    slug: "adidas-superstar",
    name: "Adidas Superstar",
    brand: "adidas",
    category: "Lifestyle",
    price: 2490000,
    originalPrice: 2890000,
    colors: [
      { name: "Trắng / Đen", hex: "#FFFFFF", image: "https://images.novelship.com/product/adidas_superstar__footwear_white_black__eg4958_0_93492.jpeg?fit=fill&bg=FFFFFF&trim=color&q=75&w=1200&h=1200&pad=80&fm=webp&auto=compress" },
    ],
    sizes: sizes([37]),
    rating: 4.8,
    sold: 19800,
    description:
      "Mũi sò huyền thoại, 3 sọc đen — đôi giày đã đi từ sân bóng rổ ra đường phố và chưa bao giờ lỗi mốt.",
  },
  {
    id: "adidas-stan-smith",
    slug: "adidas-stan-smith",
    name: "Adidas Stan Smith",
    brand: "adidas",
    category: "Lifestyle",
    price: 2390000,
    colors: [
      { name: "Trắng / Vàng", hex: "#FFFFFF", image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/40b11a09d36045019070a90300d00b59_9366/-_Stan_Smith_F36575_01_standard.jpg" },
    ],
    sizes: sizes(),
    rating: 4.7,
    sold: 16300,
    description:
      "Trắng tinh, tối giản tuyệt đối với điểm nhấn vàng ở lưỡi gà — đôi giày sạch nhất tủ đồ của bạn.",
  },
  {
    id: "adidas-campus-00s",
    slug: "adidas-campus-00s",
    name: "Adidas Campus 00s",
    brand: "adidas",
    category: "Lifestyle",
    price: 2690000,
    colors: [
      { name: "Be / Đen", hex: "#D9C7A7", image: "https://cdn.evrysz.net/1000x1000/1/adidas-campus-00s-ih4101-ih4101.png" },
    ],
    sizes: sizes([36, 45]),
    rating: 4.8,
    sold: 14900,
    isNew: true,
    description:
      "Đế dày phong cách 2000s, da lộn be mềm mại — bản nâng cấp chunky của Campus cổ điển, lên chân cực ngầu.",
  },
  {
    id: "adidas-forum-low",
    slug: "adidas-forum-low",
    name: "Adidas Forum Low",
    brand: "adidas",
    category: "Bóng rổ",
    price: 2890000,
    colors: [
      { name: "Trắng / Đen", hex: "#FFFFFF", image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/ab5e228c8b4749288d3eacb6001dec33_9366/Forum_Low_Shoes_White_FY7757.jpg" },
    ],
    sizes: sizes(),
    rating: 4.7,
    sold: 9800,
    description:
      "Di sản bóng rổ thập niên 80 với quai dán cổ điển — da trắng bóng, 3 sọc đen, đế gum bền bỉ.",
  },
  {
    id: "adidas-nmd-r1",
    slug: "adidas-nmd-r1",
    name: "Adidas NMD R1",
    brand: "adidas",
    category: "Lifestyle",
    price: 3690000,
    originalPrice: 4290000,
    colors: [
      {
        name: "Đen / Đỏ / Xanh",
        hex: "#111111",
        image: "https://cdn.afew-store.com/assets/26/266473/1200/adidas-nmdr1-pk-core-black-coreblack-lushred-s16-st-s79168-footwear%20%3E%20sneaker-manufacturers-1.jpg",
      },
    ],
    sizes: sizes([44]),
    rating: 4.8,
    sold: 12700,
    description:
      "Primeknit đen ôm chân, đế Boost trắng và miếng đệm xanh đỏ đặc trưng — đôi giày của dân chơi công nghệ.",
  },

  // ── Puma (8) ──
  {
    id: "puma-suede-classic",
    slug: "puma-suede-classic",
    name: "Puma Suede Classic",
    brand: "puma",
    category: "Lifestyle",
    price: 1990000,
    originalPrice: 2390000,
    colors: [
      { name: "Đen / Trắng", hex: "#111111", image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/399781/01/fnd/IDN/fmt/png" },
    ],
    sizes: sizes(),
    rating: 4.8,
    sold: 17600,
    isHot: true,
    description:
      "Da lộn đen huyền thoại từ 1968 — gọn nhẹ, êm chân, là đôi giày mọi tủ đồ đường phố đều cần có một đôi.",
  },
  {
    id: "puma-rs-x",
    slug: "puma-rs-x",
    name: "Puma RS-X",
    brand: "puma",
    category: "Lifestyle",
    price: 2790000,
    colors: [
      { name: "Trắng / Xám", hex: "#E8E8E8", image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/391174/06/fnd/IDN/fmt/png" },
    ],
    sizes: sizes([36]),
    rating: 4.7,
    sold: 8900,
    description:
      "Đế chunky hầm hố, công nghệ Running System — đôi giày retro-future nổi bật giữa đám đông.",
  },
  {
    id: "puma-palermo",
    slug: "puma-palermo",
    name: "Puma Palermo",
    brand: "puma",
    category: "Lifestyle",
    price: 2290000,
    colors: [
      {
        name: "Kem / Trắng",
        hex: "#EFE6D0",
        image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/396463/11/fnd/IDN/fmt/png",
      },
    ],
    sizes: sizes(),
    rating: 4.8,
    sold: 10200,
    isNew: true,
    description:
      "Da lộn kem, đế gum nâu, nhãn Palermo cổ điển — đôi giày terrace đang hot nhất của Puma mùa này.",
  },
  {
    id: "puma-cali",
    slug: "puma-cali",
    name: "Puma Cali",
    brand: "puma",
    category: "Lifestyle",
    price: 2190000,
    originalPrice: 2590000,
    colors: [
      { name: "Trắng / Đen", hex: "#FFFFFF", image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/369155/04/fnd/PNA/fmt/png" },
    ],
    sizes: sizes([45, 46]),
    rating: 4.7,
    sold: 9400,
    description:
      "Đế platform cao, da trắng bóng và điểm nhấn vàng — đôi giày California giúp bạn cao thêm vài phân mà vẫn êm.",
  },
  {
    id: "puma-future-rider",
    slug: "puma-future-rider",
    name: "Puma Future Rider",
    brand: "puma",
    category: "Lifestyle",
    price: 2390000,
    colors: [
      {
        name: "Đa sắc / Trắng",
        hex: "#F5F0E6",
        image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/371149/17/fnd/PNA/fmt/png",
      },
    ],
    sizes: sizes(),
    rating: 4.7,
    sold: 8100,
    description:
      "Phối màu đa sắc vui mắt trên nền trắng — retro runner nhẹ nhàng, đi chơi hay đi dạo đều nổi bật.",
  },
  {
    id: "puma-velocity-nitro-3",
    slug: "puma-velocity-nitro-3",
    name: "Puma Velocity Nitro 3",
    brand: "puma",
    category: "Chạy bộ",
    price: 3290000,
    colors: [
      {
        name: "Xanh biển / Vàng neon",
        hex: "#14586B",
        image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/377749/26/fnd/PNA/fmt/png",
      },
    ],
    sizes: sizes(),
    rating: 4.8,
    sold: 7600,
    isNew: true,
    description:
      "Đệm NITRO™ bọt nitơ siêu nhẹ, đế PWRPLATE ổn định — đôi chạy hằng ngày nhanh, êm và bám đường tốt.",
  },
  {
    id: "puma-mb-03",
    slug: "puma-mb-03",
    name: "Puma MB.03",
    brand: "puma",
    category: "Bóng rổ",
    price: 3690000,
    colors: [
      {
        name: "Trắng / Xám / Vàng neon",
        hex: "#EDEDE8",
        image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/379235/01/fnd/PNA/fmt/png",
      },
    ],
    sizes: sizes([36, 37]),
    rating: 4.9,
    sold: 6800,
    isHot: true,
    description:
      "Giày signature của LaMelo Ball — họa tiết vuốt neon, đế NITRO™ nảy, lên sân là nổi nhất đội.",
  },
  {
    id: "puma-deviate-nitro-3",
    slug: "puma-deviate-nitro-3",
    name: "Puma Deviate Nitro 3",
    brand: "puma",
    category: "Chạy bộ",
    price: 4190000,
    originalPrice: 4690000,
    colors: [{ name: "Đen / Trắng", hex: "#111111", image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/309707/01/fnd/PNA/fmt/png" }],
    sizes: sizes([46]),
    rating: 4.9,
    sold: 5400,
    isNew: true,
    description:
      "Tấm carbon PWRPLATE + đệm NITRO™ Elite — đôi chạy đua tốc độ, thân đen phối đế trắng, ngầu và nhanh đúng nghĩa.",
  },
];

export const BRAND_LABELS: Record<string, string> = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
};
