import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Prisma } from '@prisma/client';
import { v7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed bảng OptionItem...');

  // 1. Đọc file JSON option-items
  const filePath = path.join(__dirname, '../data/option-item.json');
  const optionItemsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (optionItemsData.length === 0) {
    console.log('⚠️ File JSON trống, không có Option Item nào để seed.');
    return;
  }

  // 2. Lấy toàn bộ Option Group từ database để map ID
  const optionGroups = await prisma.optionGroup.findMany();
  
  // Tạo một Map để dò tìm ID nhanh hơn theo tên group (ví dụ: { "Mức đường": "id-123", "Mức đá": "id-456" })
  const optionGroupMap = new Map();
  optionGroups.forEach((group) => {
    optionGroupMap.set(group.name, group.id);
  });

  // 3. Chuẩn bị mảng dữ liệu cuối cùng để insert
  const dataToInsert: Prisma.OptionItemCreateManyInput[] = [];

  for (const item of optionItemsData) {
    // Tìm ID của group dựa vào tên (trường groupId trong JSON hiện đang là tên của group)
    const dbOptionGroupId = optionGroupMap.get(item.groupId);

    if (!dbOptionGroupId) {
      console.warn(`Bỏ qua item "${item.name}": Không tìm thấy OptionGroup có tên "${item.groupId}" trong DB.`);
      continue;
    }

    const newId = v7()
    dataToInsert.push({
        id: newId,
      name: item.name,
      priceExtra: item.priceExtra,
      groupId: dbOptionGroupId, // Gắn ID thực tế của database vào đây
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // 4. Insert vào Database
  if (dataToInsert.length > 0) {
    const result = await prisma.optionItem.createMany({
      data: dataToInsert,
      skipDuplicates: true, 
    });

    console.log(`Đã seed thành công ${result.count} tuỳ chọn con (Option Item)!`);
  }
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed OptionItem:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });