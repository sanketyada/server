import { body, validationResult } from "express-validator";

const productValidator = [
  body("title")
    .exists({ checkFalsy: true })
    .withMessage("Title is required")
    .bail()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .isLength({ min: 10, max: 50 })
    .withMessage("Title must be between 10 and 50 characters"),

  body("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required")
    .bail()
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage("Description must be between 20 and 500 characters"),

  body("images")
    .optional()
    .isArray({ max: 5 })
    .withMessage("A product can have a maximum of 5 images"),

  body("images.*")
    .isString()
    .withMessage("Each image must be a string"),

  body("price")
    .exists({ checkFalsy: true })
    .withMessage("Price is required")
    .bail()
    .withMessage("Price must be an object"),

  body("price.amount")
    .exists()
    .withMessage("Price amount is required")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("Price amount must be a non-negative number"),

  body("price.currency")
    .optional()
    .isIn(["INR", "USD"])
    .withMessage("Currency must be INR or USD"),

  body("sizes")
    .optional()
    .isArray()
    .withMessage("Sizes must be an array"),

  body("sizes.*.size")
    .optional()
    .isIn(["XS", "S", "M", "L", "XL", "XXL"])
    .withMessage("Size must be XS, S, M, L, XL, or XXL"),

  body("sizes.*.stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    next();
  }
];

export { productValidator };
