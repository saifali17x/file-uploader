import express from "express";
import passport from "passport";
import * as controller from "../controllers/controller.js";
import {
  validateSignup,
  isNotAuthenticated,
} from "../middleware/validation.js";

const router = express.Router();

// GET routes
router.get("/signup", isNotAuthenticated, controller.getSignup);
router.get("/login", isNotAuthenticated, controller.getLogin);
router.get("/logout", controller.logout);

// POST routes
router.post("/signup", isNotAuthenticated, validateSignup, controller.signup);

router.post(
  "/login",
  isNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

export default router;
