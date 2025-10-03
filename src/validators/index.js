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

const userLoginValidator = () =>{
    return[
        body("email")
        .optional()
        .isEmail()
        .withMessage("Email is invalid"),
body("password")
.notEmpty()
.withMessage("Password is required")



    ];
}

const userChangeCurrentPasswordValidator = ()=>{
    return[
body("old password").notEmpty().withMessage("old password is required"),
body("new password").notEmpty().withMessage("new password is required")


    ]
}


const userForgotPasswordValidator = () =>{
    return[

body("email")
.notEmpty()
.withMessage("Email is required")
.isEmail()
.withMessage("email is invalid")


    ]
}

const userResetForgotPasswordValidator = () =>{

    return[

body("new password")
.notEmpty()
.withMessage("password is required")


    ]


}





export {
    userRegisterValidator, userLoginValidator , userChangeCurrentPasswordValidator,userForgotPasswordValidator , userResetForgotPasswordValidator
};