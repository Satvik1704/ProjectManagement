import express from "express";
import { login, registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userLoginValidator, userRegisterValidator } from "../validators/index.js";

const router = express.Router();

router.post(
  "/register",
  userRegisterValidator,  // <-- no ()
  validate,               // <-- no ()
  registerUser
);
router.route("/login").post(userLoginValidator(), validate, login)



export default router;
