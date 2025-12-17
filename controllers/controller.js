import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

// Auth Controllers
export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.render("auth/sign-up", {
        errors: [
          {
            msg:
              existingUser.email === email
                ? "Email already registered"
                : "Username already taken",
          },
        ],
        username,
        email,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res) => {
  res.redirect("/dashboard");
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

export const getSignup = (req, res) => {
  res.render("auth/sign-up", { errors: [], username: "", email: "" });
};

export const getLogin = (req, res) => {
  res.render("auth/login", { error: req.flash("error") });
};

// Dashboard Controller
export const getDashboard = async (req, res, next) => {
  try {
    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
        parentId: null,
      },
      orderBy: { createdAt: "desc" },
    });

    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    res.render("dashboard", {
      user: req.user,
      folders,
      files,
    });
  } catch (error) {
    next(error);
  }
};

// Folder Controllers
export const createFolder = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;

    await prisma.folder.create({
      data: {
        name,
        userId: req.user.id,
        parentId: parentId || null,
      },
    });

    if (parentId) {
      res.redirect(`/folder/${parentId}`);
    } else {
      res.redirect("/dashboard");
    }
  } catch (error) {
    next(error);
  }
};

export const getFolder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const currentFolder = await prisma.folder.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!currentFolder) {
      return res.status(404).render("error", {
        status: 404,
        message: "Folder not found",
      });
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
        parentId: id,
      },
      orderBy: { createdAt: "desc" },
    });

    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        folderId: id,
      },
      orderBy: { createdAt: "desc" },
    });

    res.render("dashboard", {
      user: req.user,
      folders,
      files,
      currentFolder,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFolder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!folder) {
      return res.status(404).render("error", {
        status: 404,
        message: "Folder not found",
      });
    }

    // Delete folder (cascade will handle files and subfolders)
    await prisma.folder.delete({
      where: { id },
    });

    if (folder.parentId) {
      res.redirect(`/folder/${folder.parentId}`);
    } else {
      res.redirect("/dashboard");
    }
  } catch (error) {
    next(error);
  }
};

export const shareFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days } = req.query;

    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!folder) {
      return res.status(404).render("error", {
        status: 404,
        message: "Folder not found",
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(days || 7));

    const share = await prisma.share.create({
      data: {
        folderId: id,
        expiresAt,
      },
    });

    const shareUrl = `${req.protocol}://${req.get("host")}/share/${
      share.token
    }`;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Share Link Created</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f1e8 0%, #e8dfd0 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .container {
            background: rgba(255, 255, 255, 0.9);
            padding: 3rem;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            text-align: center;
          }
          h1 { color: #6b5b4a; margin-bottom: 1rem; }
          p { color: #8b7355; margin-bottom: 1.5rem; }
          .share-url {
            background: rgba(245, 241, 232, 0.8);
            padding: 1rem;
            border-radius: 8px;
            word-break: break-all;
            margin-bottom: 2rem;
            font-family: monospace;
            color: #6b5b4a;
          }
          .btn {
            padding: 0.8rem 1.5rem;
            background: #8b7355;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            margin: 0.5rem;
          }
          .btn:hover {
            background: #6b5b4a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔗 Share Link Created!</h1>
          <p>This link will expire in ${days || 7} days</p>
          <div class="share-url">${shareUrl}</div>
          <button class="btn" onclick="navigator.clipboard.writeText('${shareUrl}').then(() => alert('Link copied!'))">
            📋 Copy Link
          </button>
          <a href="/dashboard" class="btn">← Back to Dashboard</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};

export const viewSharedFolder = async (req, res, next) => {
  try {
    const { token } = req.params;

    const share = await prisma.share.findUnique({
      where: { token },
      include: {
        folder: true,
      },
    });

    if (!share) {
      return res.status(404).render("error", {
        status: 404,
        message: "Share link not found",
      });
    }

    if (share.expiresAt < new Date()) {
      return res.render("shared", {
        expired: true,
      });
    }

    const files = await prisma.file.findMany({
      where: {
        folderId: share.folderId,
      },
      orderBy: { createdAt: "desc" },
    });

    res.render("shared", {
      share,
      folder: share.folder,
      files,
      expired: false,
    });
  } catch (error) {
    next(error);
  }
};

// File Controllers
export const uploadFile = async (req, res, next) => {
  try {
    const { folderId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).render("error", {
        status: 400,
        message: "No file uploaded",
      });
    }

    // Verify folder belongs to user
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: req.user.id,
      },
    });

    if (!folder) {
      return res.status(404).render("error", {
        status: 404,
        message: "Folder not found",
      });
    }

    // For now, store files locally. You'll replace this with Cloudinary/Supabase later
    await prisma.file.create({
      data: {
        name: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        url: `/uploads/${file.filename}`,
        userId: req.user.id,
        folderId: folderId,
      },
    });

    res.redirect(`/folder/${folderId}`);
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!file) {
      return res.status(404).render("error", {
        status: 404,
        message: "File not found",
      });
    }

    // For local files
    const filePath = file.url.replace("/uploads/", "uploads/");
    res.download(filePath, file.originalName);
  } catch (error) {
    next(error);
  }
};

export const downloadSharedFile = async (req, res, next) => {
  try {
    const { token, fileId } = req.params;

    const share = await prisma.share.findUnique({
      where: { token },
    });

    if (!share || share.expiresAt < new Date()) {
      return res.status(404).render("error", {
        status: 404,
        message: "Share link expired or not found",
      });
    }

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        folderId: share.folderId,
      },
    });

    if (!file) {
      return res.status(404).render("error", {
        status: 404,
        message: "File not found",
      });
    }

    const filePath = file.url.replace("/uploads/", "uploads/");
    res.download(filePath, file.originalName);
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!file) {
      return res.status(404).render("error", {
        status: 404,
        message: "File not found",
      });
    }

    await prisma.file.delete({
      where: { id },
    });

    res.redirect(`/folder/${file.folderId}`);
  } catch (error) {
    next(error);
  }
};

export const getIndex = (req, res) => {
  if (req.user) {
    return res.redirect("/dashboard");
  }
  res.render("index");
};
