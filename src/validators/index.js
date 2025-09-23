import { body } from "express-validator";

const userRegisterValidator = () =>{
return [

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

      body("username")
      .trim()
      .notEmpty()
      .withMessage("username is required")
      .isLowercase()
      .withMessage("Username is required")
      .isLength({min:3})
      .withMessage("username must  at least have  3 characters"),

body("password")
.trim()
.notEmpty()
.withMessage("Password is required"),

body("full name")
.optional()
.trim()

]

}


export {
    userRegisterValidator
};