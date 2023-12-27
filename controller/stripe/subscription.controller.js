const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const apiResponse = require("../../helpers/apiResponse");
const User = require("../../models/user/user.schema");
const Subscription = require("./models/subscription.schema");
const Payment = require("./models/payment_succeeded.schema");
const { Status } = require("../../constants/status.constant");
const { PaymentMode } = require("../../constants/payment_mode.constant");
const Tracking = require('../../models/tracking/tracking.schema');
const Construction = require('../../models/construction/construction.schema');
const DisasterRelief = require('../../models/disasterRelief/disasterRelief.schema');
const PersonalOrBusiness = require('../../models/personalOrBusiness/personal_or_business_site.schema');
const FarmOrchardWinery = require('../../models/farm_orchard_winery/farm_orchard_winery.schema');
const Event = require('../../models/event/event.schema');
const RecreationalSite = require('../../models/recreationalSite/recreationalSite.schema');

exports.getDetails = async (req, res) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await Subscription.findById(subscriptionId)
            .populate({ path: "user", model: "User" });

        if (!subscription) {
            return apiResponse.notFoundResponse(res, "Subscription not found");
        }

        const tracking = await Tracking.find({ subscriptionId: subscriptionId });

        const quotationId = subscription.quotationId;

        const quotationType = subscription.quotationType;

        let quotation;
        switch (quotationType) {
            case 'event':
                quotation = await Event.findOne({_id:quotationId});
                break;
            case 'farm-orchard-winery':
                quotation = await FarmOrchardWinery.findOne({_id:quotationId});
                break;
            case 'personal-or-business':
                quotation = await PersonalOrBusiness.findOne({_id:quotationId});
                console.log('djkdjkd', quotation)
                break;
            case 'disaster-relief':
                quotation = await DisasterRelief.findOne({_id:quotationId});
                
                break;
            case 'construction':
                quotation = await Construction.findOne({_id:quotationId});
                break;
            case 'recreational-site':
                quotation = await RecreationalSite.findOne({_id:quotationId});
                break;
            default:
                throw new Error(`Quotation type '${quotationType}' not found`);
        }

        return apiResponse.successResponseWithData(res, "Subscription detail fetched successfully", {
            subscription, quotation, tracking
        });
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
