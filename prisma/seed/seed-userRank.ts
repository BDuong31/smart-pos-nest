import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seed dữ liệu cho bảng User Rank...');

  const filePath = path.join(__dirname, '..', 'data', 'user-ranks.json');
  
  if (!fs.existsSync(filePath)) {
    console.error(`Không tìm thấy file tại: ${filePath}`);
    return;
  }
  const rawData = fs.readFileSync(filePath, 'utf8');
  const ranksData = JSON.parse(rawData);

  for (const r of ranksData) {
    const existingRank = await prisma.userRank.findFirst({
      where: { name: r.name },
    });

    if (!existingRank) {
      const newId = v7();
      await prisma.userRank.create({
        data: {
          id: newId,
          name: r.name,
          minPoint: r.minPoint,
          discountPercent: r.discountPercent,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`Đã thêm mới hạng: ${r.name}`);
    } else {
      console.log(`Hạng "${r.name}" đã tồn tại. Bỏ qua.`);
    }
  }

  console.log('Đã hoàn tất quá trình seed User Rank!');
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });