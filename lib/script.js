import { prisma } from "./prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  // Clear existing data
  await prisma.share.deleteMany();
  await prisma.file.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleared existing data\n");

  // Create a test user
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      username: "testuser",
      password: hashedPassword,
    },
  });
  console.log("Created user:", user);

  // Create a root folder for the user
  const rootFolder = await prisma.folder.create({
    data: {
      name: "My Files",
      userId: user.id,
    },
  });
  console.log("Created root folder:", rootFolder);

  // Create a subfolder
  const subfolder = await prisma.folder.create({
    data: {
      name: "Documents",
      userId: user.id,
      parentId: rootFolder.id,
    },
  });
  console.log("Created subfolder:", subfolder);

  // Create a sample file entry (without actual file upload)
  const file = await prisma.file.create({
    data: {
      name: "sample-file.txt",
      originalName: "sample-file.txt",
      size: 1024,
      mimeType: "text/plain",
      url: "https://example.com/files/sample-file.txt",
      userId: user.id,
      folderId: subfolder.id,
    },
  });
  console.log("Created file:", file);

  // Create a share link for the folder (expires in 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const share = await prisma.share.create({
    data: {
      folderId: rootFolder.id,
      expiresAt: expiresAt,
    },
  });
  console.log("Created share link:", share);
  console.log(`Share URL: http://localhost:3000/share/${share.token}`);

  // Fetch user with all their data
  const userWithData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      folders: {
        include: {
          files: true,
          children: true,
        },
      },
      files: true,
    },
  });
  console.log("\nUser with all data:", JSON.stringify(userWithData, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
