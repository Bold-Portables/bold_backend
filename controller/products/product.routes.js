const router = require('express').Router();
const productController = require('./product.controller');
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');
const multer = require("multer");
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `products/admin-${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
        cb(null, true);
    } else {
        cb(new Error("NOT A IMAGE FILE!!"), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

// login for existing users
router.post('/add-products', checkAuth, hasRole('ADMIN'), upload.array('product_image', 10), productController.addNewProducts);

//Update the Specific product details
router.put('/update-products/:id', checkAuth, hasRole('ADMIN'), upload.array('product_image', 10), productController.updateProducts);

//Delete the Specific product details
router.delete('/delete-products/:id', checkAuth, hasRole('ADMIN'), productController.deleteProducts);

//Get the List of the product
router.get('/get-products', productController.getAllProducts);

//Get the Specific product details
router.get('/get-specific-products/:id', productController.getSpecificProducts);

module.exports = router;