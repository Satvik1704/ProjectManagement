import express from "express";
import { forgotPasswordRequest, login, logoutUser, refreshAccessToken, registerUser, resetForgotPassword, verifyEmail } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userForgotPasswordValidator, userLoginValidator, userRegisterValidator, userResetForgotPasswordValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post(
  "/register",
  userRegisterValidator,  // <-- no ()
  validate,               // <-- no ()
  registerUser
);
router.route("/login").post(userLoginValidator(), validate, login)


router
.route("/verify-email/:verificationToken")
.get(verifyEmail)

router
.route("/refresh-token/:verificationToken")
.post(refreshAccessToken);

router.route("/forgot-password").post(userForgotPasswordValidator(), validate, forgotPasswordRequest)

router.route("/reset-password/:resetToken")
.post( userResetForgotPasswordValidator(), validate, resetForgotPassword)



router.route("/logout").post( logoutUser)



export default router;
