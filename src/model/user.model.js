import mongoose from "mongoose";

const userSchema  = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    passwordHash:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
         enum: ['user', 'seller'], 
    }
})

const userModel = mongoose.model("User",userSchema);
export default userModel;