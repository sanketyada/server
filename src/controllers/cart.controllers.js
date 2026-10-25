import cartModel from "../model/cart.model.js";
import productModel from "../model/product.model.js";

export async function addToCart(req, res) {
  const { productID, quantity, size } = req.body;

  try {
    const product = await productModel.findById(productID).select("sizes");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product does not exist",
      });
    }

    const selectedSize = product.sizes.find((item) => item.size === size);
    if (!selectedSize) {
      return res.status(400).json({
        success: false,
        message: "Selected size is not available for this product",
      });
    }

    const cart = await cartModel.findOne({ user: req.user._id });
    const matchingItems = cart?.products.filter(
      (item) =>
        item.product.toString() === productID && item.size === size
    ) ?? [];
    const existingQuantity = matchingItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const requestedQuantity = existingQuantity + quantity;

    if (requestedQuantity > selectedSize.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${selectedSize.stock - existingQuantity > 0
          ? selectedSize.stock - existingQuantity
          : 0} item(s) available for the selected size`,
      });
    }

    if (!cart) {
      const createdCart = await cartModel.create({
        user: req.user._id,
        products: [{ product: productID, quantity, size }],
      });

      return res.status(201).json({
        success: true,
        message: "Product added to cart",
        data: createdCart,
      });
    }

    if (matchingItems.length === 0) {
      cart.products.push({ product: productID, quantity, size });
    } else {
      const firstMatchingItem = matchingItems[0];
      firstMatchingItem.quantity = requestedQuantity;

      for (const duplicateItem of matchingItems.slice(1)) {
        cart.products.pull(duplicateItem._id);
      }
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: cart,
    });
  } catch (error) {
    console.error("Adding product to cart failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to add product to cart",
    });
  }
}
export async function getUsersCart(req, res) {
  try {
    const cart = await cartModel
      .findOne({ user: req.user._id })
      .populate("products.product");

    return res.status(200).json({
      success: true,
      message: cart ? "Cart fetched successfully" : "Cart is empty",
      data: cart ?? {
        user: req.user._id,
        products: [],
      },
    });
  } catch (error) {
    console.error("Fetching cart failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch cart",
    });
  }
}
