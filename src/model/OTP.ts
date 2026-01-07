import mongoose, { Document, Schema } from "mongoose";

export interface OTPInterface extends Document{
    _id:mongoose.Types.ObjectId,
    email:string,
    otp:string
    otpSendAt:Date,
}

const otpSchema = new Schema<OTPInterface>({
    // fristName:{type:String, required:true},
    email:{type:String,required:true, unique:true},
    otp:{type:String, required:true, unique:true},
    otpSendAt:{type:Date, required:true, default:Date.now}
})

// TTL index: expire after 600 seconds (10 minutes)
//HERE SELETING THE ALL AFRET EXPIER AFTER THE 10 MINITS dELETE THAT COLUMN FROM TABLE
otpSchema.index({ otpSendAt: 1 }, { expireAfterSeconds: 600 });

export const OTP = mongoose.model<OTPInterface>("OTP", otpSchema);