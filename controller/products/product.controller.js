const logger = require("../../helpers/logger");
const apiResponse = require("../../helpers/apiResponse");
const Product = require('../../models/product/product.schema');
const path = require('path');


exports.addNewProducts = async (req, res, next) => {
    try {
        let { title, description, product_price, product_type } = req.body;
        let images = [];
        console.log(req.files)
        // check if a single file or an array of files is uploaded
        if (req.files) {
            // multiple files uploaded
            images = req.files.map(file => ({
                image_path: file.path,
                image_type: file.mimetype
            }));
        } else {
            // single file uploaded
            images.push({
                image_path: req.file.path,
                image_type: req.file.mimetype
            });
        }
        console.log(images, "Images")
        const product = new Product({
            title,
            description,
            product_images: images,
            product_price,
            product_type
        });

        const savedProduct = await product.save();
        if (savedProduct) {
            logger.log("info", { fileName: path.basename(__filename), message: 'Product added successfully' });
            return apiResponse.successResponseWithData(res, "Product added successfully", savedProduct);
        } else {
            logger.log("warn", { fileName: path.basename(__filename), err });
            return apiResponse.ErrorResponse(res, err.message);
        }
    } catch (err) {
        logger.error(err);
        return apiResponse.ErrorResponse(res, err.message);
    }
};



//Update products
exports.updateProducts = async (req, res, next) => {
    try {
        let { id } = req.params;
        let { title, description, product_price, product_type } = req.body;

        let updateFields = { title, description, product_price, product_type };
        if (req.files && req.files.length > 0) {
            let productImages = req.files.map(file => ({ image_path: file.path, image_type: file.mimetype }));
            updateFields.product_images = productImages;
        }

        const product = await Product.findByIdAndUpdate(id, updateFields, { new: true });
        if (!product) {
            logger.log("info", { fileName: path.basename(__filename), message: 'Data not Update' });
            return apiResponse.ErrorResponse(res, "Data not updated")
        }
        else {
            logger.log("info", { fileName: path.basename(__filename), message: 'Data updated Successfully' });
            return apiResponse.successResponseWithData(res, "Data updated Successfully", product)
        }
    }
    catch (err) {
        logger.error(err);
        return apiResponse.ErrorResponse(res, err.message);
    }
};


//Delete products
exports.deleteProducts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return apiResponse.ErrorResponse(res, 'Product not found')
        } else {
            return apiResponse.successResponse(res, "Product Deleted Succesfully")
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)
    }
};

//get all products
exports.getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.pageNumber) || 1;
        const limit = parseInt(req.query.pageSize) || 10;
        const skipIndex = (page - 1) * limit;

        const products = await Product.find()
            .skip(skipIndex)
            .limit(limit);

        const count = await Product.countDocuments();

        const response = {
            products,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            count
        };

        return apiResponse.successResponseWithData(res, "Product list retrieved successfully", response);
    } catch (error) {
        logger.error(error);
        return apiResponse.ErrorResponse(res, error.message);
    }
};


//Get the specific Product
exports.getSpecificProducts = async (req, res, next) => {
    try {
        let { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return apiResponse.ErrorResponse(res, "Sorry no product present")
        }
        else {
            return apiResponse.successResponseWithData(res, "Product_list", product);
        }
    } catch (error) {
        logger.error(error);
        return apiResponse.ErrorResponse(res, error.message)
    }
}