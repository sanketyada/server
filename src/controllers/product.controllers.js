import productModel from "../model/product.model.js";
import { uploadfiles } from "../services/storage.service.js";

async function createProduct(req, res) {
  // console.log(req.body);
  // console.log(req.body.sizes[0])
  // console.log(req.body.sizes)

  const fileUrls = [];
  for (let i = 0; i < req.files.length; i++) {
    const imagekitfile = await uploadfiles(req.files[i].buffer);
    fileUrls.push(imagekitfile.url);
  }
  console.log(fileUrls);

  const product = await productModel.create({
    title: req.body.title,
    description: req.body.description,
    images: fileUrls,
    price: {
      amount: req.body.price.amount,
      currency: req.body.price.currency,
    },
    sizes: [
      {
        size: "M",
        stock: 10,
      },
      {
        size: "L",
        stock: 5,
      },
    ],
    seller: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "User Created Successfully",
    data: product,
  });
}
async function products(req,res) {
  const products = await productModel.find()
  res.status(200).json({
    success:false,
    message:"products fetched successfuly",
    data:products
  })
}
export { createProduct,products };
