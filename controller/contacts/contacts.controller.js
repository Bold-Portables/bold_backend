const Contact = require('../../models/contacts/contacts.schema');
const apiResponse = require("../../helpers/apiResponse");
const mailer = require("../../helpers/nodemailer");
const AdminEmail = require('../../models/adminEmail/adminEmail.schema');

exports.save = async (req, res) => {
    try {
        const { first_name, last_name, company_name, email, phone, message, feedback } = req.body;
        const contact = new Contact({
            first_name,
            last_name,
            company_name,
            email,
            phone,
            message,
            feedback
        });
        const savedContact = await contact.save();

        const emailModel = await AdminEmail.findOne({ slug: "thank-you-for-contacting" });

        if(emailModel) {
            const mailOptions = {
                from: process.env.MAIL_FROM,
                to: email,
                subject: emailModel.header,
                text: emailModel.body,
                html: emailModel.body
            };
    
            mailer.sendMail(mailOptions);
        }

        return apiResponse.successResponseWithData(res, 'Contact saved successfully', savedContact);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.queryMail = async (req, res) => {
    try {
        const { email, message } = req.body;

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: process.env.ADMIN_MAIL, //to be update in future
            subject: 'Thankyou for contacting us',
            text: `Hi,\n\nYou have a query mail with following message from email: ${email}\n${message}.\n\nThank you`,
            html: `<p>Hi,</p><p>You have a query mail with following message from email: ${email}</p><p>${message}</p><p>Your Company Name</p>`
        };
        
        mailer.sendMail(mailOptions);

        return apiResponse.successResponse(res, 'Message sent successfully');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.sendCustomMail = async (req, res) => {
    try {
        const { email, subject, body } = req.body;

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: email,
            subject: subject,
            text:  body,
            html: body
        };
        
        mailer.sendMail(mailOptions);

        return apiResponse.successResponse(res, 'Message sent successfully');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
