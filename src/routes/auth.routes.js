import express from "express";
import { login, logoutUser, registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userLoginValidator, userRegisterValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post(
  "/register",
  userRegisterValidator,  // <-- no ()
  validate,               // <-- no ()
  registerUser
);
router.route("/login").post(userLoginValidator(), validate, login)

router.route("/logout").post( logoutUser)



export default router;
