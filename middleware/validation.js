import { body, validationResult } from "express-validator";

// Validation middleware
export const validateSignup = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("auth/sign-up", {
        errors: errors.array(),
        username: req.body.username,
        email: req.body.email,
      });
    }
    next();
  },
];

export const validateFolderName = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Folder name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Folder name must be between 1 and 100 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", {
        status: 400,
        message: errors.array()[0].msg,
      });
    }
    next();
  },
];

export const validateFileUpload = [
  body("folderId").notEmpty().withMessage("Folder ID is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", {
        status: 400,
        message: errors.array()[0].msg,
      });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).render("error", {
        status: 400,
        message: "Please select a file to upload",
      });
    }

    // File size limit (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).render("error", {
        status: 400,
        message: "File size must be less than 10MB",
      });
    }

    // Allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "video/mp4",
      "video/mpeg",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).render("error", {
        status: 400,
        message:
          "File type not allowed. Please upload images, PDFs, documents, or videos.",
      });
    }

    next();
  },
];

// Authentication middleware
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
};

export const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/dashboard");
};
