import Mailgen from "mailgen";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();


        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access token"
        )
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]

    })
    if (existedUser) {
        throw new ApiError(409, "user with similar email or username already exists", [])
    }

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
    })

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();


    user.emailVerificationExpiry = tokenExpiry
    user.emailVerificationtoken = hashedToken

    await user.save({ validateBeforeSave: false })


    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,

            ),
        }
    );

    const createdUser = await User.findById(user._id).select(

        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",



    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                {
                    user: createdUser
                },
                "User registered successfully and verification email has been sent to ypur registered mail id"
            )
        )

});

const login = asyncHandler(async (req, res) => {
    const { email, password, } = req.body


    if (!email) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid credentials: password and email does not matchup")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(

        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",



    );


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )

})



const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: ""
        },
    },
        {

            new: true,


        },

    );

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("access token", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "user logged out")
        )


});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse
                (200, req.user, "Current user fetched successfully")
        )

});

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params

    if (!verificationToken) {
        throw new ApiError
            (400, "email verification token is missing")
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")


    const user = await User.findOne({
        emailVerificationtoken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    })
    if (!user) {
        throw new ApiError(400, " token is invalid or expired");
    }
    user.emailVerificationExpiry = undefined;
    user.emailVerificationtoken = undefined;


    user.isEmailVerified = true
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isEmailVerified: true,
                },
                "email is verified",
            )
        )



})

const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "user does not exist")
    }
    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();


    user.emailVerificationExpiry = tokenExpiry
    user.emailVerificationtoken = hashedToken

    await user.save({ validateBeforeSave: false })


    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,

            ),
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Mail has been sent to your registered email id"
            )
        )

})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken ||
    req.body.refreshToken

if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized access")
}

try {

const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

const user = await User.findById(decodedToken?._id);
if(!incomingRefreshToken){
    throw new ApiError(401, "Invalid refresh Token")
}    

if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401, "Token expired ")
}

const options = {
    httpOnly: true,
    secure: true
}

const { accessToken, refreshToken: newRefreshToken} = 
await generateAccessAndRefreshTokens(user._id)

user.refreshToken = newRefreshToken;
await user.save()
return res
 .status(200)
 .cookie("accessToken", accessToken, options)
 .json(
    new ApiResponse(200, 
        {accessToken, refreshToken: newRefreshToken},
        "access token refreshed"
    )
 )




} catch (error) {
    throw new ApiError(401, "Invalid refresh token ")


}



})




export { registerUser, login, logoutUser, getCurrentUser, verifyEmail };


