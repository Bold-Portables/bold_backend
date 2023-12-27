const Order = require('../../models/order/order.schema');
const Product = require('../../models/product/product.schema');
const apiResponse = require("../../helpers/apiResponse");
const logger = require("../../helpers/logger");
const Notification = require('../../models/notification/notification.schema');
const { server } = require('../../server');
const io = require('socket.io')(server);
const mailer = require("../../helpers/nodemailer");
const AdminEmail = require('../../models/adminEmail/adminEmail.schema');

exports.createOrder = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        const { products, address, location } = req.body;
        console.log(req.body)
        const orderedProducts = [];
        for (const { productId, product_quantity, product_price } of products) {
            const productDetails = await Product.findById(productId);
            if (!productDetails) {
                throw new Error(`Product with id ${productId} not found`);
            }
            orderedProducts.push({
                product: productDetails._id,
                product_quantity,
                product_price
            });
        }

        // Calculate the total price of the order
        const totalPrice = orderedProducts.reduce((total, product) => {
            return total + product.product_quantity * product.product_price;
        }, 0);

        // Create a new order document with user id and ordered products
        const newOrder = new Order({
            user: _id,
            products: orderedProducts,
            total_price: totalPrice,
            address,
            location
        });

        // Save the new order document and populate the product field
        const savedOrder = await newOrder.save();
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate({
                path: 'products.product',
                model: 'Product'
            })
            .populate({
                path: 'user',
                model: 'User',
                select: '-password -user_type -email'
            });

        // Create a new notification document with user id and order id
        const newNotification = new Notification({
            user: _id,
            order: savedOrder._id,
            type: "CREATE_ORDER"
        });

        // Save the new notification document
        const savedNotification = await newNotification.save();

        // Return success response with the populated order object
        return apiResponse.successResponseWithData(res, 'Order created successfully', populatedOrder);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.getOrderDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const orders = await Order.find({ user: userId }).populate({
            path: 'products.product',
            model: 'Product'
        });

        return apiResponse.successResponseWithData(res, 'Order fetched successfully', orders);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.getAllOrders = async (req, res) => {
    try {
        const userId = req.params.id;
        const limit = parseInt(req.query.limit) || 10; // default limit of 10 orders
        const page = parseInt(req.query.page) || 1; // default page number is 1
        const skip = (page - 1) * limit;

        const totalOrders = await Order.countDocuments({});
        const orders = await Order.find({}).populate({
            path: 'products.product',
            model: 'Product'
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalOrders / limit);

        return apiResponse.successResponseWithData(res, 'Orders fetched successfully', {
            orders,
            totalPages,
            currentPage: page,
            perPage: limit,
            totalOrders
        });
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.getFilteredOrders = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // default limit of 10 orders
        const page = parseInt(req.query.page) || 1; // default page number is 1
        const skip = (page - 1) * limit;

        let filter = {};
        if (req.query.status === 'completed') {
            filter.status = 'completed';
        } else if (req.query.status === 'cancelled') {
            filter.status = 'cancelled';
        } else if (req.query.status === 'pending') {
            filter.status = 'pending';
        }

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter).populate({
            path: 'products.product',
            model: 'Product'
        })
            .populate({
                path: 'user',
                model: 'User',
                select: "-password -user_type"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalOrders / limit);

        return apiResponse.successResponseWithData(res, 'Orders fetched successfully', {
            orders,
            totalPages,
            currentPage: page,
            perPage: limit,
            totalOrders
        });
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Find the order with the specified ID
        const order = await Order.findById(orderId);

        if (!order) {
            return apiResponse.ErrorResponse(res, "Order not found");
        }

        // Check if the order is pending
        if (order.status !== "pending") {
            return apiResponse.ErrorResponse(res, "Only pending orders can be cancelled");
        }

        // Update the order status to "cancelled"
        order.status = "cancelled";
        await order.save();

        // Emit the cancel order event to the socket server
        io.emit("cancel_order", { orderId, order });

        // Save the cancellation as a notification of type "order_cancel" in the "Notification" collection
        const notification = new Notification({
            user: order.user,
            order: order._id,
            type: "ORDER_CANCEL",
            status_seen: false
        });
        await notification.save();
        
        const emailModel = await AdminEmail.findOne({ slug: "order-canceled" });

        if(emailModel) {
            const mailOptions = {
                from: process.env.MAIL_FROM,
                to: process.env.GO_BOLD_ADMIN_MAIL,
                subject: emailModel.header,
                text: emailModel.body,
                html: emailModel.body
            };
    
            mailer.sendMail(mailOptions);
        }        

        return apiResponse.successResponseWithData(res, "Order cancelled successfully", order);
    } catch (error) {
        console.error(error);
        return apiResponse.ErrorResponse(res, error.message);
    }
};

