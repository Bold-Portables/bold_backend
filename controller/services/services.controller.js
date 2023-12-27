const Service = require('../../models/services/services.schema');
const UserService = require('../../models/userServices/userServices.schema');
const apiResponse = require("../../helpers/apiResponse");
const mailer = require("../../helpers/nodemailer");
const User = require("../../models/user/user.schema");
const { server } = require('../../server');
const io = require('socket.io')(server);
const Notification = require('../../models/notification/notification.schema');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'abcdefghijklmnopqrstuvwxyz1234567890';
const mongoose = require('mongoose');
const AdminEmail = require('../../models/adminEmail/adminEmail.schema');

// exports.save = async (req, res) => {
//     try {
//         const { fullName, phone, postalCode, email, subject, message } = req.body;
        
//         // Create a new instance of the Service model
//         const newService = new Service({
//             fullName,
//             phone,
//             postalCode,
//             email,
//             subject,
//             message
//         });

//         // Save the new service to the database
//         const createdService = await newService.save();
        
//         return apiResponse.successResponseWithData(res, 'Service saved successfully', createdService);
//     } catch (error) {
//         return apiResponse.ErrorResponse(res, error.message);
//     }
// };

exports.save = async (req, res) => {
    try {
        const { name, categories, description } = req.body;

        // Check if a service with the same name already exists
        const existingService = await Service.findOne({ name });
        if (existingService) {
            return apiResponse.ErrorResponse(res, 'Service with the same name already exists');
        }

        // Create a new instance of the Service model
        const newService = new Service({
            name,
            categories,
            description,
        });

        // Save the new service to the database
        const savedService = await newService.save();

        return apiResponse.successResponseWithData(
            res,
            'Service saved successfully',
            savedService
        );

    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.getAllServices = async (req, res) => {
    try {
        // Extract the page and limit values from the request query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate the skip value based on the page and limit
        const skip = (page - 1) * limit;

        // Retrieve the total count of services
        const totalCount = await Service.countDocuments();

        // Retrieve services based on the pagination parameters
        const services = await Service.find()
            .skip(skip)
            .limit(limit);

        return apiResponse.successResponseWithData(
            res,
            'Services retrieved successfully',
            {
                services,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit)
            }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

  
exports.deleteService = async (req, res) => {
    try {
        const serviceId = req.params.id;
    
        // Check if the service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return apiResponse.notFoundResponse(res, 'Service not found');
        }
    
        // Delete the service
        await Service.findByIdAndDelete(serviceId);
  
        return apiResponse.successResponse(res, 'Service deleted successfully');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params; // Extract the service ID from the request parameters
        const { name, categories, description } = req.body; // Extract the updated service data from the request body

        // Find the service by ID
        const service = await Service.findById(id);

        // Check if the service exists
        if (!service) {
            return apiResponse.notFoundResponse(res, 'Service not found');
        }

        // Check if a service with the updated name already exists
        const existingService = await Service.findOne({ name });
        if (existingService && existingService._id.toString() !== id) {
            return apiResponse.ErrorResponse(res, 'Service with the same name already exists');
        }

        // Update the service data
        service.name = name;
        service.categories = categories;
        service.description = description;

        // Save the updated service
        const updatedService = await service.save();

        return apiResponse.successResponseWithData(res, 'Service updated successfully', updatedService);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.getServiceByName = async (req, res) => {
    try {
        const { name } = req.body;

        // Find the service by name
        const service = await Service.findOne({ name });

        if (!service) {
            return apiResponse.notFoundResponse(res, 'Service not found');
        }

        return apiResponse.successResponseWithData(res, 'Service retrieved successfully', service);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.mailServiceAcknowledgement = async (req, res) => {
    try {
        const { user_email, user_name, service_id } = req.body; // Extract the necessary details from the request body

        // Retrieve the service details from the Service model based on the service ID
        const service = await UserService.findById(service_id);

        if (!service) {
            return apiResponse.notFoundResponse(res, 'Service not found');
        }

        // Retrieve the user details from the User model based on the user ID
        // const user = await User.findById(user_id);

        // if (!user) {
        //     return apiResponse.notFoundResponse(res, 'User not found');
        // }

        service.status = "resolved";

        service.save();

        const user = await User.findOne({ email: user_email });

        console.log(user);

        if(user) {

            const notification = new Notification({
                user: user._id.toString(),
                quote_type: "RESOLVED_SERVICE",
                quote_id: service._id.toString(),
                type: "RESOLVED_SERVICE",
                status_seen: false
            });
    
            await notification.save();
            io.emit("RESOLVED_SERVICE", { service });
        }

        const emailModel = await AdminEmail.findOne({ slug: "service-request-acknowledgement" });

        if(emailModel) {
            const mailOptions = {
                from: process.env.MAIL_FROM,
                to: user_email,
                subject: emailModel.header,
                text: `Hi ${user_name},\n\nThank you for your service request for ${service.service} (ID: ${service_id})`+ emailModel.body
            };
            mailer.sendMail(mailOptions);
        }

        return apiResponse.successResponse(res, 'Service request acknowledgement email sent successfully');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


  