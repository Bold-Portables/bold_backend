const logger = require("../../helpers/logger");
const apiResponse = require("../../helpers/apiResponse");
const Notification = require('../../models/notification/notification.schema');
const { default: mongoose } = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

exports.getUnseenNotifications = async (req, res) => {
    try {

        // Get the page number and page size from the query parameters
        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        console.log(pageNumber, pageSize)

        // Calculate the number of documents to skip based on the page number and page size   
        const documentsToSkip = (pageNumber - 1) * pageSize;
        const unseenNotifications = await Notification.find({ status_seen: false, $or: [{ type: "CREATE_ORDER" }, { type: "CREATE_QUOTE" }, { type: "SERVICE_REQUEST" }] })
            .populate({
                path: 'order',
                model: 'Order'
            })
            .populate({
                path: 'user',
                model: 'User',
                select: '-password -user_type -email'
            })
            .sort({ createdAt: -1 })
            .skip(documentsToSkip)
            .limit(pageSize);

        return apiResponse.successResponseWithData(res, 'Unseen notifications retrieved successfully', unseenNotifications, unseenNotifications.length);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.getSpecificUnseenNotificationsDeatils = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const specificUnseenNotification = await Notification.findById(notificationId)
            .populate({
                path: 'order',
                model: 'Order'
            })
            .populate({
                path: 'user',
                model: 'User',
                select: '-password -user_type -email'
            });

        if (!specificUnseenNotification) {
            return apiResponse.notFoundResponse(res, 'Notification not found');
        }

        // If the notification has a quote_type, populate the quote_id based on the refPath
        if (specificUnseenNotification.quote_type) {
            const quotationTypeFormatted = specificUnseenNotification.quote_type.replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('');

            const QuotationModel = mongoose.model(quotationTypeFormatted);
            const quotation = await QuotationModel.findById(specificUnseenNotification.quote_id);
            console.log(quotation, "Nihall")
            if (!quotation) {
                return apiResponse.notFoundResponse(res, 'Quotation not found');
            }
            specificUnseenNotification.quote_id = quotation;
        }

        return apiResponse.successResponseWithData(res, 'Specific unseen notification retrieved successfully', specificUnseenNotification);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.markAllNotificationsAsSeen = async (req, res) => {
    try {
        const { user_type, _id } = req.userData.user;
        if (user_type === 'ADMIN') {
            // Update all the notifications for the user to set status_seen to true 
            const updateResult = await Notification.updateMany({ type: { $in: ['CREATE_ORDER', 'CREATE_QUOTE', 'SERVICE_REQUEST'] } }, { $set: { status_seen: true } });

            // Return a success response with the number of updated documents
            return apiResponse.successResponseWithData(res, `Marked ${updateResult.nModified} notifications as seen`, updateResult);
        } else if (user_type === 'USER') {
            const notifications = await Notification.find({ user: _id });
            if (!notifications) {
                return apiResponse.notFoundResponse(res, 'Notification not found');
            }

            const firstNotificationUserId = notifications[0].user.toString();
            // Check if the notification belongs to the user
            if (firstNotificationUserId !== _id.toString()) {
                return apiResponse.unauthorizedResponse(res, 'Unauthorized');
            }
            // Update the status_seen to true
            const updateResult = await Notification.updateMany({ user: new ObjectId(firstNotificationUserId) , type: { $in: ["UPDATE_QUOTE" , "SAVE_TRACKING" ,"RESOLVED_SERVICE"] } }, { $set: { status_seen: true } });
            // Return a success response with the number of updated documents
            return apiResponse.successResponseWithData(res, `Marked notifications as seen`, updateResult);

        } else {
            return apiResponse.ErrorResponse(res, 'Only admins and users can update notification status_seen');
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


// Define the patch route callback function in your controller file
exports.markSpecificNotificationsAsSeen = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const { user_type, _id } = req.userData.user;
        // Find the specific notification
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return apiResponse.notFoundResponse(res, 'Notification not found');
        }

        if (user_type === 'ADMIN') {
            // Update the notification if type is CREATE_ORDER or CREATE_QUOTE
            const updateResult = await Notification.updateOne({ _id: notificationId, type: { $in: ['CREATE_ORDER', 'CREATE_QUOTE' , 'SERVICE_REQUEST'] } }, { $set: { status_seen: true } });
            console.log(updateResult.matchedCount, "Updateddd")
            if (updateResult.matchedCount === 0) {
                return apiResponse.notFoundResponse(res, 'Notification not found');
            }
            // Return a success response with the updated document
            const updatedNotification = await Notification.findById(notificationId);
            return apiResponse.successResponseWithData(res, 'Notification marked as seen', updatedNotification);
        }
        else if (user_type === 'USER') {
            if (notification.user.toString() === _id.toString()) {
                console.log()
                const updateResult = await Notification.updateOne({ _id: notificationId, user: _id }, { $set: { status_seen: true } });
                return apiResponse.successResponseWithData(res, `Marked notifications as seen`, updateResult);
            }
            else {
                return apiResponse.notFoundResponse(res, 'Notification not found');
            }
        } else {
            return apiResponse.ErrorResponse(res, 'Only admins and users can update notification status_seen');
        }
    }
    catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

// Get Cancel Order Notification for specific user
exports.getSpecificUserNotifications = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        // Get the page number and page size from the query parameters
        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        console.log(pageNumber, pageSize)

        // Calculate the number of documents to skip based on the page number and page size
        const documentsToSkip = (pageNumber - 1) * pageSize;
        const cancelOrderNotifications = await Notification.find({ status_seen: false, user: _id ,  type: { $in: ["UPDATE_QUOTE" , "SAVE_TRACKING" ,"RESOLVED_SERVICE"] } })
            .populate({
                path: 'order',
                model: 'Order'
            })
            .sort({ createdAt: -1 })
            .skip(documentsToSkip)
            .limit(pageSize);

        return apiResponse.successResponseWithData(res, 'Unseen notifications retrieved successfully', cancelOrderNotifications, cancelOrderNotifications.length);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


// Get Specific Cancel Order Notification for specific user
exports.getSpecificCancelOrderNotifications = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const notification = await Notification.findOne({ _id: notificationId, user: _id, type: "ORDER_CANCEL" })
            .populate({
                path: 'order',
                model: 'Order'
            })

        if (!notification) {
            return apiResponse.ErrorResponse(res, "Notification not found");
        }

        // Mark the notification as seen
        notification.status_seen = true;
        await notification.save();

        return apiResponse.successResponseWithData(res, 'Notification retrieved successfully', notification);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
