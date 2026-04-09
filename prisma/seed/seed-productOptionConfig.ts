import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed bảng ProductOptionConfig...');

  // 1. Đọc file JSON config
  const filePath = path.join(__dirname, '../data/product-option-config.json'); 
  const configData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (configData.length === 0) {
    console.log('⚠️ File JSON trống, không có cấu hình nào để seed.');
    return;
  }

  // 2. Lấy toàn bộ Product và OptionGroup từ database để map ID
  const products = await prisma.product.findMany();
  const optionGroups = await prisma.optionGroup.findMany();
  
  // Tạo Map cho Product (dò ID theo tên món)
  const productMap = new Map();
  products.forEach((product) => {
    productMap.set(product.name, product.id);
  });

  // Tạo Map cho OptionGroup (dò ID theo tên nhóm tuỳ chọn)
  const optionGroupMap = new Map();
  optionGroups.forEach((group) => {
    optionGroupMap.set(group.name, group.id);
  });

  // 3. Chuẩn bị mảng dữ liệu cuối cùng để insert
  const dataToInsert: Prisma.ProductOptionConfigCreateManyInput[] = [];

  for (const item of configData) {
    const dbProductId = productMap.get(item.productId); // Tìm ID thực tế của Product
    const dbOptionGroupId = optionGroupMap.get(item.optionGroupId); // Tìm ID thực tế của OptionGroup

    // Bỏ qua nếu dữ liệu không khớp (đề phòng gõ sai tên trong file JSON)
    if (!dbProductId) {
      console.warn(`Bỏ qua cấu hình: Không tìm thấy món ăn có tên "${item.productId}" trong DB.`);
      continue;
    }
    if (!dbOptionGroupId) {
      console.warn(`Bỏ qua cấu hình của món "${item.productId}": Không tìm thấy nhóm "${item.optionGroupId}" trong DB.`);
      continue;
    }

    const newId = v7();
    dataToInsert.push({
        id: newId,
      productId: dbProductId,
      optionGroupId: dbOptionGroupId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // 4. Insert vào Database
  if (dataToInsert.length > 0) {
    const result = await prisma.productOptionConfig.createMany({
      data: dataToInsert,
      skipDuplicates: true, // Tránh lỗi nếu bị lặp cặp (productId, optionGroupId)
    });

    console.log(`Đã seed thành công ${result.count} cấu hình (ProductOptionConfig)!`);
  }
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed ProductOptionConfig:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });