import mongoose, { Document, Schema } from "mongoose";

export enum Roles{
    ADMIN = "ADMIN",
    BUYER = "BUYER",
    FARMER = "FARMER"
}

export interface IUser extends Document{
    _id:mongoose.Types.ObjectId,
    fristName:string,
    lastName:string,
    email:string,
    password:string,
    roles:[string],
    accCreatedAt:Date,
    
    phone:string,
    address:string,

    location:{
        district:string,
        city:string
    }
    
    profileImage:string
}

const userSchema = new Schema<IUser>({
    fristName:{type:String, required:true},
    lastName:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    roles:{type:[String], enum:Object.values(Roles), default:[Roles.BUYER]},
    phone:{type:String},
    address:{type:String},
    location:{
        district:{type:String},
        city:{type:String}
    },
    profileImage:{type:String},
    accCreatedAt:{type:Date}
})

export const User = mongoose.model<IUser>("User", userSchema);