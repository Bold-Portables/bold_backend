const UserService = require('../../models/userServices/userServices.schema');
const apiResponse = require("../../helpers/apiResponse");
const Notification = require('../../models/notification/notification.schema');
const { server } = require('../../server');
const DisasterRelief = require('../../models/disasterRelief/disasterRelief.schema');
const PersonalOrBusiness = require('../../models/personalOrBusiness/personal_or_business_site.schema');
const FarmOrchardWinery = require('../../models/farm_orchard_winery/farm_orchard_winery.schema');
const Construction = require('../../models/construction/construction.schema');
const mailer = require("../../helpers/nodemailer");
const io = require('socket.io')(server);
const Event = require('../../models/event/event.schema');
const RecreationalSite = require('../../models/recreationalSite/recreationalSite.schema');
const Inventory = require('../../models/inventory/inventory.schema');

exports.save = async (req, res) => {
	try {

		const { service, serviceTypes, quotationId, quotationType, qrId, email, phone, name, address, coordinates, status } = req.body;
		let images = [];

		if (req.files) {
			// multiple files uploaded
			images = req.files.map(file => ({
				image_path: file.path,
				image_type: file.mimetype
			}));
		} else {
			// single file uploaded
			images.push({
				image_path: req.file.path,
				image_type: req.file.mimetype
			});
		}

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

		// Create a new UserServices instance with the extracted data
		const newUserServices = new UserService({
			user: quotation.user,
			service,
			serviceTypes,
			quotationId,
			quotationType,
			email,
			phone,
			qrId,
			name,
			address,
			coordinates,
			status,
			images
		});

		// Save the new UserServices instance to the database
		const savedUserServices = await newUserServices.save();

		const user = quotation.user;

		const mailOptions = {
			from: process.env.MAIL_FROM,
			to: email,
			subject: 'Service Request Acknowledgement',
			text: `Hi ${user.name},\n\nThank you for your service request for ${service}.\nWe have received your service request and are currently taking action. Our team is working diligently to address your needs and provide a prompt resolution.\nWe appreciate your patience and will keep you updated on the progress.\n\nThanks,\nBold Portable Team`
		};
		mailer.sendMail(mailOptions);

		//	Save the new Notification for Admmin panel 
		const notification = new Notification({
			user,
			quote_type: quotationType,
			quote_id: quotationId,
			type: "SERVICE_REQUEST",
			status_seen: false
		});

		await notification.save();

		io.emit("user_service_saved", { savedUserServices });

		const adminMailOptions = {
			from: process.env.MAIL_FROM,
			to: process.env.GO_BOLD_ADMIN_MAIL,
			subject: 'New service requested',
			text: `Hi Admin,\nA new service ${service} of quotationId: ${quotationId} has been requested`,
            html: `<p>Hi Admin,</p><p>A new service ${service} of quotationId: ${quotationId} has been requested</p>`
		};
		mailer.sendMail(adminMailOptions);

		return apiResponse.successResponseWithData(
			res,
			"Data saved successfully.",
			savedUserServices
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.getAllUserServices = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;

		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		const totalDocuments = await UserService.countDocuments();

		const userServices = await UserService.find()
			.sort({ createdAt: -1 })
			.skip(startIndex)
			.limit(limit);

		const pagination = {
			currentPage: page,
			totalPages: Math.ceil(totalDocuments / limit),
			totalDocuments: totalDocuments
		};

		return apiResponse.successResponseWithData(
			res,
			"List of UserServices retrieved successfully.",
			{ userServices, pagination }
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.serviceDetail = async (req, res) => {
	try {
		const { user_service_id } = req.params;

		const userService = await UserService.findOne({ _id: user_service_id });

		const quotationType = userService.quotationType;
		const quotationId = userService.quotationId;

		console.log("sjahdjhdj", userService.qrId);

		const inventory = await Inventory.findOne({ _id: userService.qrId });

		let quotation;
		switch (quotationType) {
			case 'event':
				quotation = await Event.findOne({ _id: quotationId });
				break;
			case 'farm-orchard-winery':
				quotation = await FarmOrchardWinery.findOne({ _id: quotationId });
				break;
			case 'personal-or-business':
				quotation = await PersonalOrBusiness.findOne({ _id: quotationId });
				break;
			case 'disaster-relief':
				quotation = await DisasterRelief.findOne({ _id: quotationId });
				break;
			case 'construction':
				quotation = await Construction.findOne({ _id: quotationId });
				break;
			case 'recreational-site':
				quotation = await RecreationalSite.findOne({ _id: quotationId });
				break;
			default:
				throw new Error(`Quotation type '${quotationType}' not found`);
		}

		return apiResponse.successResponseWithData(res, "Data retrieved Succesfully!", {
			userService,
			quotation,
			inventory
		});
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};

