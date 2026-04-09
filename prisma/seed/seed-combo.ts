import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed Combo & ComboItem...');

  // 1. Đọc dữ liệu từ file JSON
  const combosPath = path.join(__dirname, '../data/combo.json');
  const comboItemsPath = path.join(__dirname, '../data/combo-item.json');
  
  const combosData = JSON.parse(fs.readFileSync(combosPath, 'utf-8'));
  const comboItemsData = JSON.parse(fs.readFileSync(comboItemsPath, 'utf-8'));

  // ==========================================
  // PHẦN 1: SEED BẢNG COMBO
  // ==========================================
  if (combosData.length > 0) {
    const resultCombo = await prisma.combo.createMany({
      data: combosData,
      skipDuplicates: true, // Bỏ qua nếu đã tồn tại (nếu schema có set @unique cho name)
    });
    console.log(`Đã seed thành công ${resultCombo.count} Combo!`);
  } else {
    console.log('Không có dữ liệu Combo để seed.');
    return;
  }

  // ==========================================
  // PHẦN 2: SEED BẢNG COMBO ITEM
  // ==========================================
  console.log('Đang chuẩn bị map ID cho Combo Item...');

  // Lấy dữ liệu từ DB lên để dò ID
  const dbCombos = await prisma.combo.findMany();
  const dbProducts = await prisma.product.findMany();
  const dbVariants = await prisma.variant.findMany();

  // Tạo Map để dò nhanh ID theo Tên
  const comboMap = new Map<string, string | number>();
  dbCombos.forEach((c) => comboMap.set(c.name, c.id));

  const productMap = new Map<string, string | number>();
  dbProducts.forEach((p) => productMap.set(p.name, p.id));

  // Variant Map cần gộp cả ID Product và Tên Variant để tránh nhầm (VD: Size M của Trà Đào khác Size M của Cà Phê)
  const variantMap = new Map<string, string | number>();
  dbVariants.forEach((v) => {
    // Lưu ý: v.name là tên variant (ví dụ "Size M")
    variantMap.set(`${v.productId}_${v.name}`, v.id);
  });

  const comboItemsToInsert: Prisma.ComboItemCreateManyInput[] = [];

  for (const item of comboItemsData) {
    const actualComboId = comboMap.get(item.comboId);
    const actualProductId = productMap.get(item.productId);

    if (!actualComboId) {
      console.warn(`Bỏ qua item: Không tìm thấy Combo "${item.comboId}" trong DB.`);
      continue;
    }
    if (!actualProductId) {
      console.warn(`Bỏ qua item: Không tìm thấy món ăn "${item.productId}" trong DB.`);
      continue;
    }

    let actualVariantId;
    if (item.variantId) {
      // Dò Variant ID dựa trên Product ID và Tên Variant
      actualVariantId = variantMap.get(`${actualProductId}_${item.variantId}`);
      if (!actualVariantId) {
        console.warn(`Cảnh báo: Không tìm thấy Variant "${item.variantId}" cho món "${item.productId}". Đang set về null.`);
      }
    }

    comboItemsToInsert.push({
      comboId: actualComboId as string,
      productId: actualProductId as string,
      variantId: actualVariantId as string,
      quantity: item.quantity,
    });
  }

  // Insert Combo Items vào DB
  if (comboItemsToInsert.length > 0) {
    const resultComboItem = await prisma.comboItem.createMany({
      data: comboItemsToInsert,
      skipDuplicates: true,
    });
    console.log(`Đã seed thành công ${resultComboItem.count} Combo Item!`);
  }
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed Combo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });