import productModel from "../model/product.model.js";
import { uploadfiles } from "../services/storage.service.js";

async function createProduct(req, res) {
  console.log(req.body);
  console.log(req.files);


  // const fileUrls = [];
  // for (let i = 0; i < req.files.length; i++) {
  //   const imagekitfile = await uploadfiles(req.files[i].buffer);
  //   fileUrls.push(imagekitfile.url);
  // }
  // // console.log(fileUrls);

  //Best approach
  const fileUrls = await Promise.all(
  req.files.map(async (file) => {
    const imagekitfile = await uploadfiles(file.buffer);
    return imagekitfile.url;
  })
);


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
    message: "Product Created Successfully",
    data: product,
  });
}
async function products(req,res) {
  const products = await productModel.find({ isListed: true })
  console.log(products)
  res.status(200).json({
    success:true,
    message:"products fetched successfuly",
    data:products
  })
}

async function unlistProduct(req, res) {
  if (req.user.role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Only sellers can unlist products",
    });
  }

  const product = await productModel.findOne({
    _id: req.params.id,
    seller: req.user._id,
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  product.isListed = false;
  await product.save();

  return res.status(200).json({
    success: true,
    message: "Product unlisted successfully",
    data: product,
  });
}

async function listProduct(req, res) {
  if (req.user.role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Only sellers can list products",
    });
  }

  const product = await productModel.findOne({
    _id: req.params.id,
    seller: req.user._id,
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  product.isListed = true;
  await product.save();

  return res.status(200).json({
    success: true,
    message: "Product listed successfully",
    data: product,
  });
}

export { createProduct, products, unlistProduct, listProduct };
