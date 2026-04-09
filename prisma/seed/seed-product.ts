import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Prisma } from '@prisma/client';
import { v7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed bảng Product...');

  // 1. Đọc file JSON (giả sử bạn lưu ở thư mục data/products.json)
  const filePath = path.join(__dirname, '..', 'data', 'product.json'); // Cập nhật lại đường dẫn cho đúng với project của bạn
  const productsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 2. Lấy toàn bộ danh mục từ database để lấy ID thực tế
  const categories = await prisma.category.findMany();

  // Tạo một Map để dò tìm nhanh: { "Tên danh mục": "ID danh mục" }
  const categoryMap = new Map<string, string | number>(); 
  categories.forEach((cat) => {
    categoryMap.set(cat.name, cat.id);
  });

  // 3. Chuẩn bị mảng dữ liệu để Insert
  const productsToInsert: Prisma.ProductCreateManyInput[] = [];

  for (const item of productsData) {
    // Trong file JSON, item.categoryId hiện tại đang chứa tên (string)
    const actualCategoryId = categoryMap.get(item.categoryId);

    if (!actualCategoryId) {
      console.warn(`Bỏ qua sản phẩm "${item.name}": Không tìm thấy danh mục "${item.categoryId}" trong database.`);
      continue;
    }

    const newId = v7();
    productsToInsert.push({
      id: newId,
      name: item.name,
      categoryId: actualCategoryId as string, // Gắn ID thật từ database vào đây
      printerId: item.printerId,
      basePrice: item.basePrice,
      isCombo: item.isCombo,
      isActive: item.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // 4. Insert hàng loạt vào database
  if (productsToInsert.length > 0) {
    const result = await prisma.product.createMany({
      data: productsToInsert,
      skipDuplicates: true, // Bỏ qua nếu có lỗi trùng lặp (ví dụ trùng name nếu name là unique)
    });

    console.log(`Đã seed thành công ${result.count} sản phẩm!`);
  } else {
    console.log('Không có sản phẩm nào hợp lệ để seed.');
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