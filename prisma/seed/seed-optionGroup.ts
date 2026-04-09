import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed bảng OptionGroup...');

  // 1. Đọc file JSON option-groups (cập nhật đường dẫn cho khớp với project của bạn)
  const filePath = path.join(__dirname, '../data/option-group.json'); 
  const optionGroupsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 2. Chuẩn bị dữ liệu và Insert vào Database
  if (optionGroupsData.length > 0) {
    const result = await prisma.optionGroup.createMany({
      data: optionGroupsData,
      skipDuplicates: true, // Bỏ qua nếu có lỗi trùng lặp (ví dụ bạn set trường 'name' là @unique trong schema)
    });

    console.log(`Đã seed thành công ${result.count} nhóm tuỳ chọn (Option Group)!`);
  } else {
    console.log('File JSON trống, không có nhóm tuỳ chọn nào để seed.');
  }
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed OptionGroup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });