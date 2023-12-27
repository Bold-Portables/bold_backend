const router = require('express').Router();
const orderController = require('./order.controller');
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

//Create orders for users
router.post('/create-order', checkAuth, hasRole('USER'), orderController.createOrder);

//get user order details
router.get('/get-user-order-details/:id', checkAuth, orderController.getOrderDetails);

//Get all orders
router.get('/get-all-orders', checkAuth, hasRole('ADMIN'), orderController.getAllOrders);

//Get all Filetered orders
router.get('/get-all-filtered-orders', checkAuth, hasRole('ADMIN'), orderController.getFilteredOrders);

//Cancel Single Order
router.patch('/:orderId/cancel', checkAuth, hasRole('ADMIN'), orderController.cancelOrder);

module.exports = router;