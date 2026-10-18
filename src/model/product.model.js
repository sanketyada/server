import mongoose from "mongoose";

const productSchama = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 50,
  },
  description: {
    type: String,
    required: true,
    minLength: 20,
    maxLength: 500,
  },
  images: {
    type: [
      {
        type: String,
      },
    ],
    validate: {
      validator: (images) => images.length <= 5,
      message: "A Product can have only 5 images.",
    },
  },
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["INR", "USD"],
      default: "INR",
    },
  },
  sizes: [
    {
      size: {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL"],
      },
      stock:{
        type:Number,
        min:0,
        default:0
      }
    },
  ],
  seller:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  }
});


const productModel = mongoose.model("Product",productSchama)
export default productModel;