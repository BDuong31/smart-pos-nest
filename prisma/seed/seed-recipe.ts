import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Bắt đầu seed dữ liệu cho bảng Recipe...");

    const filePath = path.join(__dirname, "..", "data", "recipe.json");
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Không tìm thấy file JSON tại: ${filePath}`);
        return;
    }

    const recipesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let successCount = 0;
    let failCount = 0;

    for (const item of recipesData) {
        try {
            let targetIngredientId: string | null = null;
            let targetVariantId: string | null = null;
            let targetProductId: string | null = null;
            let targetOptionItemId: string | null = null;
            let logDetail = "";

            // 1. Tìm Nguyên liệu (Bắt buộc)
            const ingredient = await prisma.ingredient.findFirst({
                where: { name: item.ingredientId }
            });
            if (!ingredient) throw new Error(`Không thấy Ingredient: ${item.ingredientId}`);
            targetIngredientId = ingredient.id;

            // 2. PHÂN LUỒNG LOGIC
            
            // TRƯỜNG HỢP 1: Dành cho OptionItem (Topping/Yêu cầu thêm)
            if (item.optionItemName) {
                const optionItem = await prisma.optionItem.findFirst({
                    where: { name: item.optionItemName }
                });
                if (!optionItem) throw new Error(`Không thấy OptionItem: ${item.optionItemName}`);
                
                targetOptionItemId = optionItem.id;
                targetProductId = null;
                targetVariantId = null;
                logDetail = `🔹 [Option] ${item.optionItemName}`;
            } 
            
            // TRƯỜNG HỢP 2: Dành cho Product và Variant
            else if (item.productId) {
                // Bước A: Tìm Product trước
                const product = await prisma.product.findFirst({
                    where: { name: item.productId }
                });
                if (!product) throw new Error(`Không thấy Product: ${item.productId}`);
                
                targetProductId = product.id;
                targetOptionItemId = null;

                // Bước B: Nếu có variantId trong JSON, tìm Variant thuộc Product đó
                if (item.variantId) {
                    const variant = await prisma.variant.findFirst({
                        where: {
                            name: item.variantId,
                            productId: product.id // Ràng buộc: Variant phải thuộc Product vừa tìm
                        }
                    });
                    if (!variant) throw new Error(`Variant "${item.variantId}" không thuộc Product "${item.productId}"`);
                    
                    targetVariantId = variant.id;
                    logDetail = `🔸 [Variant] ${product.name} - ${variant.name}`;
                } else {
                    targetVariantId = null;
                    logDetail = `📦 [Product] ${product.name}`;
                }
            }

            // 3. Tiến hành tạo Recipe
            await prisma.recipe.create({
                data: {
                    ingredientId: targetIngredientId,
                    amount: Number(item.amount),
                    productId: targetProductId,
                    variantId: targetVariantId,
                    optionItemId: targetOptionItemId,
                }
            });

            console.log(`✅ ${logDetail} | Nguyên liệu: ${item.ingredientId}`);
            successCount++;

        } catch (error: any) {
            failCount++;
            console.error(`❌ Lỗi dòng [${item.ingredientId}]: ${error.message}`);
        }
    }

    console.log(`\n--- KẾT QUẢ ---`);
    console.log(`Thành công: ${successCount} | Thất bại: ${failCount}`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());