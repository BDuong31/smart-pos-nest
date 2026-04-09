import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { v7 } from "uuid";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Bắt đầu seed dữ liệu cho bảng User...");

    const filePath = path.join(__dirname, "..", "data", "users.json");

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Không tìm thấy file tại: ${filePath}`);
        return;
    }

    // 1. Lấy toàn bộ danh sách UserRank từ database
    const userRanks = await prisma.userRank.findMany();
    
    // Kiểm tra đề phòng trường hợp bảng UserRank trống
    if (userRanks.length === 0) {
        console.error(`Không tìm thấy dữ liệu trong bảng UserRank. Vui lòng chạy seed UserRank trước!`);
        return;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const usersData = JSON.parse(rawData);

    for (const u of usersData) {
        const existingUser = await prisma.user.findFirst({
            where: { username: u.username },
        });

        if (!existingUser) {
            // 2. Lấy ngẫu nhiên 1 phần tử trong mảng userRanks
            const randomRank = userRanks[Math.floor(Math.random() * userRanks.length)];

            const newId = v7();
            const salt = bcrypt.genSaltSync(8);
            const hashPassword = bcrypt.hashSync(`${u.password}.${salt}`, 10);
            
            await prisma.user.create({
                data: {
                    id: newId,
                    username: u.username,
                    salt: salt,
                    password: hashPassword,
                    email: u.email,
                    fullName: u.fullName,
                    // Parse thành kiểu Date để tránh lỗi Prisma nếu JSON lưu chuỗi
                    birthday: new Date(u.birthday), 
                    role: u.role,
                    rankId: randomRank.id, // Sử dụng ID ngẫu nhiên vừa lấy được
                    currentPoints: u.currentPoints,
                    status: u.status,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            console.log(`Đã thêm mới user: ${u.username} (Được gán rank: ${randomRank.name})`);
        } else {
            console.log(`User "${u.username}" đã tồn tại. Bỏ qua.`);
        }
    }

    console.log('Đã hoàn tất quá trình seed User!');
}

main()
    .catch((e) => {
        console.error('Có lỗi xảy ra trong quá trình seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });