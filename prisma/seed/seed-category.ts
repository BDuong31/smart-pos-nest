import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { v7 } from "uuid";

const prisma = new PrismaClient();

async function main() {
    console.log("Bắt đầu seed dữ liệu cho bảng Category...");

    const filePath = path.join(__dirname, "..", "data", "category.json");

    if (!fs.existsSync(filePath)) {
        console.error(`Không tìm thấy file tại: ${filePath}`);
        return;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const categoriesData = JSON.parse(rawData);

    // Phân tách mảng thành 2 nhóm: Cha và Con
    const parentCategories = categoriesData.filter((c: any) => c.parentId === null);
    const childCategories = categoriesData.filter((c: any) => c.parentId !== null);

    // Map để lưu trữ ID của danh mục cha: { "Tên danh mục": "ID_v7" }
    const parentIdMap: Record<string, string> = {};

    console.log("--- Bắt đầu xử lý Danh mục cha ---");
    // 1. Tạo danh mục cha trước
    for (const p of parentCategories) {
        let existingParent = await prisma.category.findFirst({
            where: { name: p.name, parentId: null },
        });

        if (!existingParent) {
            const newId = v7();
            existingParent = await prisma.category.create({
                data: {
                    id: newId,
                    name: p.name,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            console.log(`Đã thêm mới danh mục cha: ${p.name}`);
        } else {
            console.log(`Danh mục cha "${p.name}" đã tồn tại. Bỏ qua.`);
        }

        // Lưu lại ID thực tế của database vào Map
        parentIdMap[p.name] = existingParent.id;
    }

    console.log("--- Bắt đầu xử lý Danh mục con ---");
    // 2. Tạo danh mục con và gán parentId dựa trên Map
    for (const c of childCategories) {
        // Lấy ID thật của category cha từ Map
        const realParentId = parentIdMap[c.parentId];

        if (!realParentId) {
            console.warn(`Bỏ qua "${c.name}": Không tìm thấy ID cho danh mục cha "${c.parentId}"`);
            continue;
        }

        const existingChild = await prisma.category.findFirst({
            where: { name: c.name, parentId: realParentId },
        });

        if (!existingChild) {
            const newId = v7();
            await prisma.category.create({
                data: {
                    id: newId,
                    name: c.name,
                    parentId: realParentId, // Gán UUID của cha vào đây
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            console.log(`Đã thêm mới danh mục con: ${c.name} (Thuộc nhóm: ${c.parentId})`);
        } else {
            console.log(`Danh mục con "${c.name}" đã tồn tại. Bỏ qua.`);
        }
    }

    console.log('Đã hoàn tất quá trình seed Category!');
}

main()
    .catch((e) => {
        console.error('Có lỗi xảy ra trong quá trình seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });