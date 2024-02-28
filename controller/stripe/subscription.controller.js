const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const apiResponse = require("../../helpers/apiResponse");
const User = require("../../models/user/user.schema");
const Subscription = require("./models/subscription.schema");
const Notification = require("../../models/notification/notification.schema")
const { server } = require('../../server');
const io = require('socket.io')(server);
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

        const quotation = await getQuotation(subscription.quotationId, subscription.quotationType)

        return apiResponse.successResponseWithData(res, "Subscription detail fetched successfully", {
            subscription, quotation, tracking
        });
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

// Updates the quotes cost data and the monthly subscription cost on stripe and db
exports.updateSubscription= async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { costDetails, updatedCost } = req.body;

        const subscription = await Subscription.findById(subscriptionId)
        .populate({ path: "user", model: "User" });

        const quotation = await getQuotation(subscription.quotationId, subscription.quotationType);

        if (!subscription) {
            return apiResponse.ErrorResponse(res, "Subscription not found.");
        }

        // update subscription monthly costs on db
        subscription.upgradedCost = (subscription.upgradedCost - subscription.monthlyCost) + updatedCost
        subscription.monthlyCost = updatedCost;
        await subscription.save();

        // update quotes cost details on db
        quotation.costDetails = costDetails;
        await quotation.save();

        // Retrieve the subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscription);
        const oldPrice = stripeSubscription.plan.id

        // create new monthly price
        const newPrice = await stripe.prices.create({
            currency: 'cad',
            unit_amount: updatedCost * 100,
            recurring: {
              interval: 'month',
            },
            product: 'prod_PeASzswl9hwPSg' // test product, store real product in env var
          });

        // update subscription with new price
        await stripe.subscriptions.update(
            subscription.subscription,
            {
              items: [
                { 
                  id: stripeSubscription.items.data[0].id,
                  price: newPrice.id,
                },
              ],
            proration_behavior: 'none',
            }
        );

        // archive the old price
        if (stripeSubscription.plan.active) {
            await stripe.prices.update(
                oldPrice,
                {
                  active: false
                }
            )
        }

        const notification = new Notification({
            user: subscription.user,
            quote_type: subscription.quotationType,
            quote_id: subscription.quotationId,
            type: 'UPDATE_QUOTE',
            status_seen: false,
        });
        await notification.save();
        io.emit('update_quote', { quotation });

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been updated successfully",
            quotation
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

// Adds a one-time payment for a specific subscription for the incoming invoice
exports.chargeServiceFee = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { upgradeAmount, description } = req.body;

        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            return apiResponse.notFoundResponse(res, "Subscription not found");
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscription);
        const nextInvoice = await stripe.invoices.retrieveUpcoming({ customer: stripeSubscription.customer });

        await stripe.invoiceItems.create({
            customer: stripeSubscription.customer,
            price_data: {
                currency: "cad",
                product: process.env.STRIPE_PRODUCT_SERVICE,
                unit_amount: parseInt(upgradeAmount) * 100,
            },
            description: `Service Fee - ${description}`, 
            quantity: 1,
            invoice: nextInvoice.id,
        });

        subscription.upgradedCost = subscription.upgradedCost + parseInt(upgradeAmount)
        subscription.save()

        return apiResponse.successResponseWithData(res, "Subscription updated successfully", {
            subscriptionId,
        });
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
 
const getQuotation = async (quotationId, quotationType) => {
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
    return quotation
}