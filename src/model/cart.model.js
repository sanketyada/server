import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },     
      size:{
        type:String,
        enum:["XS","S","M","L","XL","XXL"]
      }
    },
  ],
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:true
  }
});

const cartModel = mongoose.model("Cart", cartSchema);
export default cartModel;
