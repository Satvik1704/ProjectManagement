import { text } from "express";
import Mailgen from "mailgen";
import nodemailer from "nodemailer"

const sendEmail = async (options) =>{
   const mailGenerator =  new Mailgen({
        theme: "default",
        product:{
            name:"Task Manager",
            link:"http://taskmangelink.com"
        }
    })
 const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)

  const emailHTML = mailGenerator.generate(options.mailgenContent)


 const transporter = nodemailer.createTransport({
host: process.env.MAILTRAP_SMTP_HOST,
port: process.env.MAILTRAP_SMTP_PORT,
auth:{
       user: process.env.MAILTRAP_SMTP_USER,
       pass: process.env.MAILTRAP_SMTP_PASS


}


})

const mail ={
    from:"rsatvik8800@gmail.com",
    to:options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHTML
    
}

try {
    await transporter.sendMail(mail)
} catch (error) {
    console.error("Email service failed. Make sure you have provided MAILTRAP credentials in the .env frile");
    console.error("error", error)
}



}

const emailVerificationMailgenContent = (username, verificationUrl) =>{

    return{

body:{
    name:username,
    intro: "Welcome to our App! We are excited to have you on board.",
action: {
    instructions: "To verify your email please click on the following button",
    button:{
        color: "#22BC66",
        text: "Verify your email",
        link: verificationUrl
    },
},
outro: "Need help or have questions? Just reply to tis email, we'd love to help.",



}


    }


}

const forgotPasswordMailgenContent = (username, passwordResetUrl) =>{

    return{

body:{
    name:username,
    intro: "We got a request to reset the password of your account",
action: {
    instructions: "To reset your password please click on the following button",
    button:{
        color: "#22BC66",
        text: "Verify your email",
        link: verificationUrl
    },
},
outro: "Need help or have questions? Just reply to tis email, we'd love to help.",



}


    };


};

export {
    emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail
};


