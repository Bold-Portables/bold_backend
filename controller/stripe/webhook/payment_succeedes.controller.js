const User = require("../../../models/user/user.schema");
const Payment = require("../models/payment_succeeded.schema");
const Subscription = require("../models/subscription.schema");
const logger = require("../../../helpers/logger.js");
const sendSms = require("../../../helpers/twillioSms.js");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const qrcode = require('qrcode');
const mailer = require("../../../helpers/nodemailer");
const Construction = require('../../../models/construction/construction.schema');
const DisasterRelief = require('../../../models/disasterRelief/disasterRelief.schema');
const PersonalOrBusiness = require('../../../models/personalOrBusiness/personal_or_business_site.schema');
const FarmOrchardWinery = require('../../../models/farm_orchard_winery/farm_orchard_winery.schema');
const Event = require('../../../models/event/event.schema');
const RecreationalSite = require('../../../models/recreationalSite/recreationalSite.schema');

exports.paymentSucceeded = async (object) => {

    try {

        const subscriptiontest = await stripe.subscriptions.retrieve(
            object.subscription
        );

        const priceId = subscriptiontest.items.data[0].plan.id;

        const pricetest = await stripe.prices.retrieve(
            priceId
        );

        const prod_uid = pricetest.product;

        const product = await stripe.products.retrieve(
            prod_uid
        );

        const { customer_email, subscription, status } = object;

        const user = await User.findOne({ email: customer_email });

        let sub;

        const serviceUrl = process.env.APP_URL+'/services?quotationType=' + product.metadata.quotationType + '&quotationId=' +product.metadata.quotationId;

        const dataURL = await qrcode.toDataURL(serviceUrl);

        if (status === "paid") {

            sub = await new Subscription({
                user: user._id,
                subscription,
                quotationId: product.metadata.quotationId,
                quotationType: product.metadata.quotationType,
                status: "ACTIVE",
                qrCode: dataURL
            }).save();

            const quotationId = sub.quotationId;
            const quotations = await Promise.all([
                Event.findOne({ _id: quotationId }),
                FarmOrchardWinery.findOne({ _id: quotationId }),
                PersonalOrBusiness.findOne({ _id: quotationId }),
                DisasterRelief.findOne({ _id: quotationId }),
                Construction.findOne({ _id: quotationId }),
                RecreationalSite.findOne({ _id: quotationId }),
            ]).then(([event, farmOrchardWinery, personalOrBusiness, disasterRelief, construction, recreationalSite]) => {
                let quotation;

                if (event) {
                    quotation = event;
                } else if (farmOrchardWinery) {
                    quotation = farmOrchardWinery;
                } else if (personalOrBusiness) {
                    quotation = personalOrBusiness;
                } else if (disasterRelief) {
                    quotation = disasterRelief;
                } else if (construction) {
                    quotation = construction;
                } else if (recreationalSite) {
                    quotation = recreationalSite;
                }

                if (quotation) {
                    quotation.status = 'active';
                    return quotation.save();
                }

                return null;
            });

        } else {
            sub = await Subscription.findOne({
                subscription,
            });
        }

        const payment = new Payment({
            subscription: sub._id,
            payment: object,
        });

        await payment.save()

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: customer_email,
            subject: 'Payment confirmatation',
            text: `Hi,\n\nThank you for your payment.\n The link for the invoice is:\n\n${object.hosted_invoice_url}  \n\nThanks,\nBold Portable Team`,
        };
        
        mailer.sendMail(mailOptions);

        const text = "You subscription is succesfull";

        sendSms.sendSMS(user.mobile, text);

        return;
        
    } catch (error) {
        console.log(error);
        throw error;
    }
};
