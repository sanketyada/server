import { body, validationResult } from "express-validator";

const cartValidator = [
  body("productID")
    .exists()
    .withMessage("ProductID is mendetory.")
    .bail()
    .isString()
    .withMessage("ProductID must be string.")
    .bail()
    .isMongoId()
    .withMessage("Product id must be mongo ID."),
  body("quantity")
    .exists()
    .withMessage("Quantity is mendetory. ")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Quantity must be greater than 0."),
  body("size")
    .exists()
    .withMessage("Size is required.")
    .bail()
    .isString()
    .withMessage("Size must be String.").bail()
    .isIn(["XS", "S", "M", "L", "XL", "XXL"])
    .withMessage("Size must be correct."),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      });
    }

    next();
  },
];
export default cartValidator;
