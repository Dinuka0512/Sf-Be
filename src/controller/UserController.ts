import { NextFunction, Request, Response } from "express";
import  bcrypt from "bcryptjs"
import { IUser, Roles, User } from "../model/User";
import { isEmail, isName, isSimplePassword } from "../utill/Validations";
import { sendMail } from "../utill/mailer";
import { OTP, OTPInterface } from "../model/OTP";
import {signAccessToken, refreshToken} from "../utill/token"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async(req:Request, res:Response)=>{
    try{
        const {fristName, lastName, password, email, role} = req.body

        if(!fristName || !lastName || !password || !email || !role){
            return res.status(400).json({message : "The All Fields are required"})
        }

        if(!isName(fristName) || !isName(lastName)){
            return res.status(400).send("Invalid Name Name Only can have letters..")
        }

        if(!isEmail(email)){
            return res.status(400).send("Enterd the Invalid email..")
        }else{
            if(await isEmailExist(email)){
                return res.status(400).send("Email is already exist!")
            }
        }

        if(!isSimplePassword(password)){
            return res.status(400).send("The Password must be at least 6 characters long!")
        }

        // validate role
        if (!Object.values(Roles).includes(role)) {
            return res.status(400).json({ message: "Invalid role provided" });
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({
            fristName: fristName,
            lastName: lastName,
            password: hashedPassword,
            email: email,
            roles: [role],
            accCreatedAt: new Date(),
        })

        await user.save()
        res.status(200).json({message:"Successfully registered"})

    }catch (e : any){
        return res.status(500).send({message:"Error " + e.message})
    }
}

export const login = async(req:Request, res:Response)=>{
    const {email,password} = req.body

    if(!isEmail(email)){
        return res.status(400).send("Invalid Email Enterd!.")
    }

    const user = await User.findOne({email})
    if(user){
        //GET USER DETAILS HERE - need to check the password is that correct or not 
        const isPasswordMatched = await bcrypt.compare(password, user.password)
        if(isPasswordMatched){
            //NEED TO GENARATE THE ACCESS TOKEN AND REFRESH TOKENS
            const jwtToken = signAccessToken(user);
            const rToken  = refreshToken(user)

            
            return res.send({
                message:"Loged In Successfuly!",
                accessToken:jwtToken,
                refreshToken:rToken
            })
            
        }else{
            res.status(400).send("Password is Wrong!!")
        }
    }else{
        res.status(400).send("Email dosen't exist!")
    }
}

async function isEmailExist(email :string):Promise<boolean>{
    const isEmailExist = await User.findOne({email});
    return isEmailExist? true : false;
}

export const fogetPassword = async (req:Request, res:Response)=>{
    try{
        const email = req.body.email;

        if(!isEmail(email)){
            return res.status(400).send("Invalid Email!!..")
        }

        if(!(await isEmailExist(email))){
            return res.status(400).send("Email is not registed!..")
        }

        //Here need to chek is random otp is unique or not?
        let random :number;
        do{
            random = Math.floor(100000 + Math.random() * 900000)
            console.log(random)
        }while(await isOtpExist(random.toString()));

        //Here sending the email..
        const text = "Dear User, \nYour OTP for verifying your account is: " + random + "\nThis OTP is valid for 10 minutes. Do not share it with anyone.\n\nFor security reasons: \n- Never share your OTP with anyone \n- Our representatives will never ask for your OTP \n- This OTP will expire after 10 minutes \n- If you didn't request this, please ignore this message\n\nThank you,\nSmart Farmer-"
        const isEmailSend = await sendMail(email,"Genarated OTP - Smart Farmer",text, "")
        if(!isEmailSend){
            return res.status(400).send("Email not sent!")   
        }

        //Delete Other All Otps Having with this email
        await OTP.deleteMany({email});

        //HERE NEED TO SAVE THE OTP ON TABLE 
        const newOtp = new OTP({
            email:email,
            otp:random.toString(),
            otpSendAt:new Date()
        })
        await newOtp.save()

        return res.status(200).send("Email Send!")
    }catch(err){
        return res.status(500).send("Unexpected Error Occurred!!")
    }
}

export const checkOtp = async(req:Request, res:Response)=>{
    try{
        const {email, otp} = req.body
        
        if(await emailValidate(res, email)){
            //Here getting the Otp Object Find by email
            const otpObj = await OTP.findOne({email})
            if(!otpObj){
                return res.status(400).send("OTP Expierd!")
            }

            //Here Checking is this otp andObj Otp is equal or not  
            if(otpObj.otp == otp){
                return res.status(200).send("OTP verified successfully!")
            }else{
                return res.status(400).send("Invalid Otp Enterd!")
            }
        }     

    }catch(err){
        return res.status(500).send("UnExpected Error Occurred!!")
    }
}

//Here Check is this OTP exist or not?
async function isOtpExist(otp:string):Promise<boolean> {
    const isExist = await OTP.findOne({otp})
    return isExist? true : false;
}

//Here Checking the is email is valid? and is that email Registed allready?
async function emailValidate(res:Response,email:string):Promise<boolean>{
    if(isEmail(email)){
        if(await isEmailExist(email)){
            //Email is OK
            return true
        }else{
            res.status(400).send("This email is not registed!")
            return false
        }
    }else{
        res.status(400).send("Something wrong with your email")
        return false
    }
}

// Here Changing the Password
export const changePassword = async(req:Request, res:Response)=>{
    try{
        const {email, password} = req.body
        
        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        if(isEmail(email)){
            //Check password is Strong or Not ?
            if(!isSimplePassword(password)){
                return res.status(400).send("The Password must be at least 6 characters long!")
            }

            //Here get the User Object
            let userObj = await User.findOne({email});
            if(!userObj){
                return res.status(400).send("User not Found")
            }

            const pwBcript = await bcrypt.hash(password, 10)
            userObj.password = pwBcript
            
            //Update user 
            await userObj.save()
            return res.status(200).send("Password Updated Successfully!")
        }
        return res.status(400).send("Invalid Email Enterd!")
    }catch(err){
        return res.status(500).send("UnExpected Error Occurred!!")
    }
}

export const getUserRole = async(req:Request, res:Response)=>{
   try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the role
    return res.status(200).json({ role: user.roles });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export const getMyDetails = async(req:Request, res:Response)=>{
    try {
        //Here need to get the Token
        const authHeader = req.headers.authorization
        if(authHeader){
            const token = authHeader.split(" ")[1]

            const decoded: any = jwt.verify(token,process.env.JWT_SECRET!)
            const userId = decoded.sub
            const user = ((await User.findById(userId).select("-password")) as IUser) || null

            if (!user) {
                return res.status(404).json({
                message: "User not found"
                })
            }

            res.status(200).json({
                message: "Ok",
                data: {
                    "fristName":user.fristName,
                    "lastName":user.lastName,
                    "roles":user.roles,
                    "email":user.email,
                    "phone":user.phone,
                    "location":user.location,
                    "address":user.address,
                    "profilePic":user.profileImage
                }
            })
        }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export const updateUser = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const {firstName, lastName, email, phone, address, district, city} = req.body
        
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization token missing" });
        }

        const token = authHeader.split(" ")[1];        
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.sub


        // Basic validation
        if (!firstName || !lastName || !email || !phone || !address || !district || !city) {
            return res.status(400).json({
                message: "First name, last name, email, and phone are required",
            });
        }

        if(!isEmail(email)){
            return res.status(400).send("Invalid Email Enterd!.")
        }

        //Here need to update the user
        const user = await User.findOne({email}).select("-password")
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        
        user.fristName = firstName
        user.lastName = lastName
        user.phone = phone
        user.address = address
        user.location.district = district
        user.location.city = city
        
        await user.save()
        return res.status(200).json({
            message: "User updated successfully",
            user,
        });

    }catch(err){
        console.error("Error fetching user role:", err);
        return res.status(500).json({ message: "Server error" });
    }
}