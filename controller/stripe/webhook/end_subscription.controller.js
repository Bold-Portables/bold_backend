const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Subscription = require("../models/subscription.schema");
const { Status } = require("../../../constants/status.constant");
const Construction = require('../../../models/construction/construction.schema');
const DisasterRelief = require('../../../models/disasterRelief/disasterRelief.schema');
const PersonalOrBusiness = require('../../../models/personalOrBusiness/personal_or_business_site.schema');
const FarmOrchardWinery = require('../../../models/farm_orchard_winery/farm_orchard_winery.schema');
const Event = require('../../../models/event/event.schema');
const sendSms = require("../../../helpers/twillioSms.js");
const mailer = require("../../../helpers/nodemailer");

exports.endSubscription = async (object) => {
    try {
        const {
            status = "complete",
            metadata: { subscription, type = "SUBSCRIPTION_END" },
        } = object;

        const subscriptionData = await Subscription.findOne({
            _id: subscription,
        });

        if (type === "SUBSCRIPTION_END" && status === "complete") {
            const deleted = await stripe.subscriptions.del(
                subscriptionData.subscription
            );
            await Subscription.updateOne(
                { _id: subscription },
                { $set: { status: Status.Inactive } }
            );

            const quotationId = subscriptionData.quotationId;
            const quotations = await Promise.all([
                Event.findOne({ _id: quotationId }),
                FarmOrchardWinery.findOne({ _id: quotationId }),
                PersonalOrBusiness.findOne({ _id: quotationId }),
                DisasterRelief.findOne({ _id: quotationId }),
                Construction.findOne({ _id: quotationId }),
            ]).then(([event, farmOrchardWinery, personalOrBusiness, disasterRelief, construction]) => {
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
                }

                if (quotation) {
                    quotation.status = 'completed';
                    return quotation.save();
                }

                return null;
            });

            return deleted;
        } else {
            throw new Error(
                "Either subscription not end or payment not completed"
            );
        }

    } catch (error) {
        throw error;
    }
};
