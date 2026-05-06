import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Prisma } from '@prisma/client';
import { v7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed bảng Unit Conversion...');

  const filePath = path.join(__dirname, '..', 'data', 'unit-conversion.json'); // Cập nhật lại đường dẫn cho đúng với project của bạn
  const productsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 2. Lấy toàn bộ danh mục từ database để lấy ID thực tế
  const ingredients = await prisma.ingredient.findMany();

  // Tạo một Map để dò tìm nhanh: { "Tên danh mục": "ID danh mục" }
  const ingredientMap = new Map<string, string | number>(); 
  ingredients.forEach((ing) => {
    ingredientMap.set(ing.name, ing.id);
  });

  // 3. Chuẩn bị mảng dữ liệu để Insert
  const unitConversionToInsert: Prisma.UnitConversionCreateManyInput[] = [];

  for (const item of productsData) {
    // Trong file JSON, item.categoryId hiện tại đang chứa tên (string)
    const actualIngredientId = ingredientMap.get(item.ingredientId);

    if (!actualIngredientId) {
      console.warn(`Bỏ qua chuyển đổi "${item.ingredientId}": Không tìm thấy danh mục "${item.ingredientId}" trong database.`);
      continue;
    }

    const newId = v7();
    unitConversionToInsert.push({
        id: newId,
        ingredientId: actualIngredientId as string, 
        fromUnit: item.fromUnit,
        toUnit: item.toUnit,
        factor: item.factor,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
  }

  // 4. Insert hàng loạt vào database
  if (unitConversionToInsert.length > 0) {
    const result = await prisma.unitConversion.createMany({
      data: unitConversionToInsert,
      skipDuplicates: true, // Bỏ qua nếu có lỗi trùng lặp (ví dụ trùng name nếu name là unique)
    });

    console.log(`Đã seed thành công ${result.count} Chuyển đổi!`);
  } else {
    console.log('Không có chuyển đổi nào hợp lệ để seed.');
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