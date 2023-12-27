const Tracking = require('../../models/tracking/tracking.schema');
const apiResponse = require("../../helpers/apiResponse");
const User = require('../../models/user/user.schema');
const mailer = require("../../helpers/nodemailer");
const sendSms = require("../../helpers/twillioSms.js");
const Construction = require('../../models/construction/construction.schema');
const DisasterRelief = require('../../models/disasterRelief/disasterRelief.schema');
const PersonalOrBusiness = require('../../models/personalOrBusiness/personal_or_business_site.schema');
const FarmOrchardWinery = require('../../models/farm_orchard_winery/farm_orchard_winery.schema');
const Event = require('../../models/event/event.schema');
const Notification = require('../../models/notification/notification.schema');
const { server } = require('../../server');
const io = require('socket.io')(server);
const RecreationalSite = require('../../models/recreationalSite/recreationalSite.schema');
const AdminEmail = require('../../models/adminEmail/adminEmail.schema');

exports.saveTracking = async (req, res) => {
	try {

		let quotationType = req.body.quotationType;

		const quotationId = req.body.quotationId;

		const { driver_name, driver_phone_number, address } = req.body;

		let quotation;
		switch (quotationType) {
			case 'event':
				quotation = await Event.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });
				break;
			case 'farm-orchard-winery':
				quotation = await FarmOrchardWinery.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });
				break;
			case 'personal-or-business':
				quotation = await PersonalOrBusiness.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });
				console.log('djkdjkd', quotation)
				break;
			case 'disaster-relief':
				quotation = await DisasterRelief.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });

				break;
			case 'construction':
				quotation = await Construction.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });
				break;
			case 'recreational-site':
				quotation = await RecreationalSite.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });
				break;
			default:
				throw new Error(`Quotation type '${quotationType}' not found`);
		}

		const tracking = new Tracking({
			quotationType: req.body.quotationType,
			quotationId: req.body.quotationId,
			subscriptionId: req.body.subscriptionId,
			driver_name: req.body.driver_name,
			driver_phone_number: req.body.driver_phone_number,
			user: quotation.user,
			address: [
				{
					address: req.body.address,
					timestamp: new Date()
				}
			]
		});

		const data = await tracking.save();

		// Find user from tracking
		const customer_email = quotation.user.email;

		const mailOptions = {
			from: process.env.MAIL_FROM,
			to: customer_email,
			subject: 'Tracking status updated',
			text: `Hi,\n\nWe would like to inform you that the tracking status has been updated. The new updated address is:\n\n${address}\n\nDriver's phone number: ${tracking.driver_phone_number}\nDriver's name: ${tracking.driver_name}\n\nPlease feel free to contact us if you have any questions.\n\nThanks,\nBold Portable Team`,
			html: `<html>
			   <body>
				 <p>Hi ${quotation.user.name},</p> <p>We would like to inform you that the tracking status has been updated. The new updated address is: ${address}<p><p> Driver's phone number: ${tracking.driver_phone_number}</p> <p> Driver's name: ${tracking.driver_name}</p> <p>Please feel free to contact us if you have any questions.</p><p> Thanks,</p> <p> Bold Portable Team</p>
			   </body>
			 </html>`
		};

		mailer.sendMail(mailOptions);

		const notification = new Notification({
			user: quotation.user._id.toString(),
			quote_type: quotationType,
			quote_id: quotationId,
			type: "SAVE_TRACKING",
			status_seen: false
		  });

		await notification.save();
		io.emit("save_location", { tracking });

		const emailModel = await AdminEmail.findOne({ slug: "tracking-saved" });

        if(emailModel) {
            const mailOptions = {
                from: process.env.MAIL_FROM,
                to: process.env.GO_BOLD_ADMIN_MAIL,
                subject: emailModel.header,
                text: emailModel.body
            };
            mailer.sendMail(mailOptions);
        }

		const text = `The new updated address is:\n\n${address}`;

		sendSms.sendSMS(quotation.user.mobile, text);

		return apiResponse.successResponseWithData(
			res,
			"Data saved successfully.",
			data
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.updateTracking = async (req, res) => {
	try {
		const { trackingId } = req.params;
		const { driver_name, driver_phone_number, address } = req.body;

		const updatedAddress = address.map((address) => ({
			address,
			timestamp: Date.now(),
		}));

		const updatedTracking = await Tracking.findByIdAndUpdate(
			trackingId,
			{ $push: { address: { $each: updatedAddress } }, driver_name, driver_phone_number },
			{ new: true }
		).populate('user');

		if (!updatedTracking) {
			return apiResponse.notFoundResponse(res, "Tracking not found.");
		}

		const notification = new Notification({
			user: updatedTracking.user._id.toString(),
			quote_type: updatedTracking.quotationType,
			quote_id: updatedTracking.quotationId,
			type: "SAVE_TRACKING",
			status_seen: false
		  });

		await notification.save();
		io.emit("save_location", { updatedTracking });

		const emailModel = await AdminEmail.findOne({ slug: "tracking-saved" });

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

		// Find user from tracking
		const customer_email = updatedTracking.user.email;

		const mailOptions = {
			from: process.env.MAIL_FROM,
			to: customer_email,
			subject: 'Tracking status updated',
			text: `Hi,\n\nWe would like to inform you that the tracking status has been updated. The new updated address is:\n\n${address.join('\n')}\n\nDriver's phone number: ${driver_phone_number}\nDriver's name: ${driver_name}\n\nPlease feel free to contact us if you have any questions.\n\nThanks,\nBold Portable Team`,
			html: `<html>
			<body>
			  <p>Hi ${updatedTracking.user.name},</p> <p>We would like to inform you that the tracking status has been updated. The new updated address is: ${address.join(' ')}</p><p> Driver's phone number: ${driver_phone_number}</p> <p> Driver's name: ${driver_name}</p> <p>Please feel free to contact us if you have any questions.</p><p> Thanks,</p> <p> Bold Portable Team</p>
			</body>
		  </html>`
		};

		mailer.sendMail(mailOptions);

		const text = `The new updated address is:\n\n${address}`;

		sendSms.sendSMS(updatedTracking.user.mobile, text);

		return apiResponse.successResponseWithData(
			res,
			"Tracking updated successfully.",
			updatedTracking
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.getTrackingList = async (req, res) => {
	try {
		/* for pagination */
		let { limit = 3, page = 1, status } = req.query;
		limit = parseInt(limit);
		page = parseInt(page);
		const skip = (page - 1) * limit;

		const { address, quotationType, driver_name } = req.query;

		/* initiate filter */
		const filters = {};
		if (address) filters.address = address;
		if (quotationType) filters.quotationType = quotationType;
		if (driver_name) filters.driver_name = driver_name;

		/* count total data */
		const totalCount = await Tracking.countDocuments(filters);
		const totalPages = Math.ceil(totalCount / limit);

		/* get data */
		const trackingList = await Tracking.find(filters)
			.populate({ path: "user", model: "User" })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		/* return response */
		return apiResponse.successResponseWithData(
			res,
			"Tracking list retrieved successfully.",
			{
				trackingList,
				totalPages,
				currentPage: page,
				perPage: limit,
				totalCount
			}
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.fetchTrackingList = async (req, res) => {
	try {
		const quotationType = req.query.quotationType;
		const quotationId = req.query.quotationId;
		const userId = req.query.userId;

		const trackingList = await Tracking.find({
			quotationType: quotationType,
			quotationId: quotationId,
			user: userId
		});

		return apiResponse.successResponseWithData(res, "Tracking list:", trackingList);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.getTrackingById = async (req, res) => {
	try {
		const id = req.params.id;
		const tracking = await Tracking.findById(id);

		if (!tracking) {
			return apiResponse.notFoundResponse(res, "Tracking not found");
		}

		return apiResponse.successResponseWithData(res, "Tracking Detail:", tracking);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};


