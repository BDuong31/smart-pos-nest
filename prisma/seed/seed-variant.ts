import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Prisma } from '@prisma/client';
import { v7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed bảng Variant...');

  // 1. Đọc file JSON variants (cập nhật đường dẫn cho khớp với project của bạn)
  const filePath = path.join(__dirname, '../data/variant.json'); 
  const variantsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 2. Lấy toàn bộ sản phẩm từ database để lấy ID thực tế
  const products = await prisma.product.findMany();

  // Tạo một Map để dò tìm nhanh: { "Tên sản phẩm": "ID sản phẩm" }
  const productMap = new Map<string, string | number>(); 
  products.forEach((prod) => {
    productMap.set(prod.name, prod.id);
  });

  // 3. Chuẩn bị mảng dữ liệu để Insert
  const variantsToInsert: Prisma.VariantCreateManyInput[] = [];

  for (const item of variantsData) {
    // Trong file JSON, item.productId hiện tại đang chứa tên món (string)
    const actualProductId = productMap.get(item.productId);

    if (!actualProductId) {
      console.warn(`Bỏ qua biến thể "${item.Name}": Không tìm thấy sản phẩm "${item.productId}" trong database.`);
      continue;
    }

    const newId = v7();
    variantsToInsert.push({
      id: newId,
      productId: actualProductId as string, // Gắn ID thật của product từ database vào đây
      name: item.Name,            // Lưu ý: JSON của bạn viết hoa chữ "Name", schema Prisma thường viết thường "name"
      priceDiff: item.priceDiff,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // 4. Insert hàng loạt vào database
  if (variantsToInsert.length > 0) {
    const result = await prisma.variant.createMany({
      data: variantsToInsert,
      skipDuplicates: true, // Bỏ qua nếu có lỗi trùng lặp
    });

    console.log(`Đã seed thành công ${result.count} biến thể (variant)!`);
  } else {
    console.log('Không có biến thể nào hợp lệ để seed.');
  }
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });