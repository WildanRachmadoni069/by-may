import { PrismaClient } from "@/generated/prisma/client";
import { hash } from "bcryptjs";
import { parseArgs } from "node:util";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Parse command line arguments
const options = {
  email: { type: "string" as const },
  password: { type: "string" as const },
  name: { type: "string" as const },
  role: { type: "string" as const, default: "user" },
};

async function main() {
  try {
    // Parse command line arguments
    const { values } = parseArgs({ options });

    // Check required arguments
    if (!values.email || !values.password) {
      console.error("Email and password are required");
      console.log(
        'Usage: npm run create-user -- --email=user@example.com --password=Password123! --name="Full Name" --role=admin'
      );
      return;
    }

    const email = values.email;
    const password = values.password;
    const fullName = values.name || email.split("@")[0]; // Default to part of email
    const role = values.role === "admin" ? "admin" : "user";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists with email:", email);
      return;
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash: hashedPassword,
        role,
      },
    });

    console.log(
      `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } user created successfully:`,
      user
    );
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
