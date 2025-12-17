import express from "express";
import multer from "multer";
import * as controller from "../controllers/controller.js";
import {
  isAuthenticated,
  validateFolderName,
  validateFileUpload,
} from "../middleware/validation.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Dashboard
router.get("/dashboard", isAuthenticated, controller.getDashboard);

// Folder routes
router.post(
  "/folder/create",
  isAuthenticated,
  validateFolderName,
  controller.createFolder
);
router.get("/folder/:id", isAuthenticated, controller.getFolder);
router.post("/folder/:id/delete", isAuthenticated, controller.deleteFolder);
router.get("/folder/:id/share", isAuthenticated, controller.shareFolder);

// File routes
router.post(
  "/file/upload",
  isAuthenticated,
  upload.single("file"),
  validateFileUpload,
  controller.uploadFile
);
router.get("/file/:id/download", isAuthenticated, controller.downloadFile);
router.post("/file/:id/delete", isAuthenticated, controller.deleteFile);

// Share routes (public)
router.get("/share/:token", controller.viewSharedFolder);
router.get("/share/:token/download/:fileId", controller.downloadSharedFile);

// Home
router.get("/", controller.getIndex);

export default router;
