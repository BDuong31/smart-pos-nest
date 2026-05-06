import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from 'cloudinary';
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types"; // Cần cài đặt: npm install mime-types
import { v7 } from "uuid";
import * as dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();

// Cấu hình Cloudinary từ biến môi trường
cloudinary.config(process.env.CLOUDINARY_URL || '');

/**
 * Chuyển đổi file từ đường dẫn vật lý sang Data URI (thay thế logic Multer)
 */
function filePathToDataURI(filePath: string): string {
    const buffer = fs.readFileSync(filePath);
    const mimeType = mime.lookup(filePath) || "image/jpeg";
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

async function main() {
    console.log("Bắt đầu seed hình ảnh cho Product...");

    const baseDir = "/Volumes/Asus SSD/Documents/smart-pos/smart-pos-nest/prisma/data/images/Product";

    if (!fs.existsSync(baseDir)) {
        console.error(`Không tìm thấy thư mục: ${baseDir}`);
        return;
    }

    // Quét các thư mục món ăn
    const productFolders = fs.readdirSync(baseDir).filter(file => 
        fs.statSync(path.join(baseDir, file)).isDirectory()
    );

    for (const productName of productFolders) {
        const product = await prisma.product.findFirst({
            where: { name: productName }
        });

        if (!product) {
            console.warn(`Bỏ qua: Không tìm thấy món "${productName}" trong DB.`);
            continue;
        }

        const folderPath = path.join(baseDir, productName);
        const imageFiles = fs.readdirSync(folderPath).filter(file => 
            /\.(jpg|jpeg|png|webp|jfif)$/i.test(file)
        ).sort(); // Sort để đảm bảo ảnh đầu tiên (vd: 01.jpg) làm ảnh chính

        console.log(`Đang xử lý món: ${productName} (${imageFiles.length} ảnh)`);

        for (let i = 0; i < imageFiles.length; i++) {
            const fileName = imageFiles[i];
            const filePath = path.join(folderPath, fileName);

            try {
                const fileUri = filePathToDataURI(filePath);
                
                // Upload lên Cloudinary theo đúng cấu trúc smart-pos/PRODUCT/refId
                const uploadResult = await cloudinary.uploader.upload(fileUri, {
                    folder: `smart-pos/PRODUCT/${product.id}`,
                });

                // Lưu vào Database
                await prisma.image.create({
                    data: {
                        id: v7(),
                        url: uploadResult.secure_url,
                        publicId: uploadResult.public_id,
                        refId: product.id,
                        type: "product",
                        isMain: i === 0, // File đầu tiên là ảnh chính
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                });

                console.log(`Thành công: ${fileName} ${i === 0 ? '[MAIN]' : ''}`);
            } catch (error) {
                console.error(`Lỗi khi upload ${fileName}:`, error.message);
            }
        }
    }
}

main()
    .catch((e) => {
        console.error("Lỗi Seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });