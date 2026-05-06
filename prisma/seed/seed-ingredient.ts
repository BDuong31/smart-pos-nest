import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { v7 } from "uuid";

const prisma = new PrismaClient();

async function main() {
    console.log("Bắt đầu seed dữ liệu cho bảng Ingredient...");

    const filePath = path.join(__dirname, "..", "data", "ingredients.json")

    if (!fs.existsSync(filePath)) {
        console.error(`Không tìm thấy file tại: ${filePath}`);
        return;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const ingredientsData = JSON.parse(rawData);

    if (ingredientsData.length > 0) {
        const result = await prisma.ingredient.createMany({
            data: ingredientsData,
            skipDuplicates: true,
        })

        console.log(`Đã seed thành công ${result.count} nguyên liệu (Ingredient)`);
    } else {
        console.log('File JSON trống, Không có nguyên liệu nào để seed.');
    }
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed Ingredients:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });