import { PrismaClient } from "@/generated/prisma/client";
import { hash } from "bcryptjs";

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  try {
    // Admin details - you can customize these values
    const adminEmail = "admin@bymay.com";
    const adminPassword = "Admin123!"; // Change this to a secure password
    const adminName = "Admin Bymay";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("Admin already exists with email:", adminEmail);
      return;
    }

    // Hash the password
    const hashedPassword = await hash(adminPassword, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: adminName,
        passwordHash: hashedPassword,
        role: "admin", // Set role as admin
      },
    });

    console.log("Admin created successfully:", admin);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
