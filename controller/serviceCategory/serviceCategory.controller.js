const ServiceCategory = require('../../models/serviceCategory/serviceCategory.schema');
const UserService = require('../../models/userServices/userServices.schema');
const apiResponse = require("../../helpers/apiResponse");
const mailer = require("../../helpers/nodemailer");
const User = require("../../models/user/user.schema");
const { server } = require('../../server');
const io = require('socket.io')(server);
const Notification = require('../../models/notification/notification.schema');

exports.save = async (req, res) => {
    try {
        const { category } = req.body; // Corrected the variable name

        const serviceCategory = new ServiceCategory({
            category,
        });

        const savedServiceCategory = await serviceCategory.save(); // Corrected the variable name

        return apiResponse.successResponseWithData(
            res,
            'Service category saved successfully',
            savedServiceCategory
        );

    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.edit = async (req, res) => {
    try {
        const { categoryId, category } = req.body; // Get the categoryId and updated category from the request body

        // Check if the categoryId is provided
        if (!categoryId) {
            return apiResponse.ErrorResponse(res, 'Category ID is missing');
        }

        // Find the service category by its ID
        const existingCategory = await ServiceCategory.findById(categoryId);

        // If the category with the given ID doesn't exist, return an error response
        if (!existingCategory) {
            return apiResponse.ErrorResponse(res, 'Service category not found');
        }

        // Update the category with the new value
        existingCategory.category = category;

        // Save the updated service category
        const updatedCategory = await existingCategory.save();

        // Return success response with the updated category
        return apiResponse.successResponseWithData(
            res,
            'Service category updated successfully',
            updatedCategory
        );

    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.delete = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        // Check if the category exists in the database
        const existingCategory = await ServiceCategory.findById(categoryId);
        if (!existingCategory) {
            return apiResponse.ErrorResponse(res, 'Category not found');
        }

        // Use deleteOne to delete the category from the database
        await ServiceCategory.deleteOne({ _id: categoryId });

        return apiResponse.successResponse(res, 'Category deleted successfully');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.listAllWithPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Find total count of service categories
        const total = await ServiceCategory.countDocuments();
        const totalPages = Math.ceil(total / limit);

        // Fetch service categories with pagination
        const serviceCategories = await ServiceCategory.find()
            .skip(skip)
            .limit(limit);

        if (serviceCategories.length === 0) {
            return apiResponse.successResponseWithData(
                res,
                'No service categories found',
                { serviceCategories, totalPages, total, currentPage: page }
            );
        }

        return apiResponse.successResponseWithData(
            res,
            'Service categories retrieved successfully',
            { serviceCategories, totalPages, total, currentPage: page }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};




  