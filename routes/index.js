const express = require("express");
const authRouter = require('../controller/auth/auth.routes')
const productRouter = require('../controller/products/product.routes')
const orderRouter = require('../controller/order/order.routes')
const notificationRouter = require('../controller/notification/notification.routes')
const quotationRouter = require('../controller/quotations/quotations.routes')
const costManagement = require('../controller/saveCostQuotation/saveCostQuotation.routes')
const tracking = require('../controller/tracking/tracking.routes')
const paymentRouter = require('../controller/stripe/stripe.routes')
const webhookRouter = require('../controller/stripe/webhook/webhook.routes')
const userRouter = require('../controller/user/user.routes')
const contactRouter = require('../controller/contacts/contacts.routes')
const serviceRouter = require('../controller/services/services.routes')
const qrCodeRouter = require('../controller/qrCode/qrCode.routes')
const userServiceRouter = require('../controller/userService/userService.routes')
const inventoryRouter = require('../controller/inventory/inventory.routes')
const inventoryCategoryRouter = require('../controller/inventoryCategory/inventoryCategory.routes')
const serviceCategoryRouter = require('../controller/serviceCategory/serviceCategory.routes')
const adminEmailRouter = require('../controller/adminEmail/adminEmail.routes')
const app = express();

app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/notification", notificationRouter);
app.use("/quotation", quotationRouter);
app.use("/payment", paymentRouter);
app.use("/webhook", webhookRouter);
app.use("/cost-management", costManagement);
app.use("/tracking", tracking);
app.use("/user", userRouter);
app.use("/contact", contactRouter);
app.use("/service", serviceRouter);
app.use("/qr-code", qrCodeRouter);
app.use("/user-service", userServiceRouter);
app.use("/inventory", inventoryRouter);
app.use("/inventory-category", inventoryCategoryRouter);
app.use("/service-category", serviceCategoryRouter);
app.use("/admin-email", adminEmailRouter);

module.exports = app;