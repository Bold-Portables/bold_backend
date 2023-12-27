const apiResponse = require("../../helpers/apiResponse");
const logger = require("../../helpers/logger");
const { server } = require('../../server');
const { default: mongoose } = require('mongoose');
const Notification = require('../../models/notification/notification.schema');
const io = require('socket.io')(server);
const userHelper = require('../../helpers/user');
const Subscription = require("../stripe/models/subscription.schema");
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateQRCode = async (text) => {
    try {
        // Generate the QR code as a data URL
        const dataURL = await qrcode.toDataURL(text);

        console.log('QR code generated successfully.');

        // Return the generated data URL
        return dataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
    }
};
  

exports.showQRCode = async (req, res) => {
    try {

        const link = 'https://bold-portable-user-panel.netlify.app/services';

        const code = await generateQRCode(link)

        return apiResponse.successResponseWithData(
            res,
            "QR code generated successfully",
            code
        );
    } catch (error) {
        console.log(error);
        return apiResponse.ErrorResponse(res, error.message);
    }
};

const saveQRCodeAsFile = async (dataURL) => {
    try {
        // Extract the base64-encoded image data from the data URL
        const imageData = dataURL.split(',')[1];

        // Create a file name with a timestamp
        const fileName = `qrcode_${Date.now()}.jpeg`;

        // Define the file path
        const filePath = path.join(__dirname, '..', '..', 'public', 'qrcodes', fileName);

        // Write the image data to the file
        await fs.promises.writeFile(filePath, imageData, 'base64');

        console.log('QR code saved as file:', filePath);

        // Return the file path
        return filePath;
    } catch (error) {
        console.error('Error saving QR code as file:', error);
        return null;
    }
};

exports.downloadQRCode = async (req, res) => {
    try {
        const link = 'https://bold-portable-user-panel.netlify.app/services';

        const code = await generateQRCode(link);
        if (!code) {
            throw new Error('Failed to generate QR code.');
        }

        const filePath = await saveQRCodeAsFile(code);
        if (!filePath) {
            throw new Error('Failed to save QR code as file.');
        }

        // Get the public URL for the QR code file
        const publicURL = `${req.protocol}://${req.get('host')}/public/qrcodes/${path.basename(filePath)}`;

        return apiResponse.successResponseWithData(
            res,
            "QR code generated and saved successfully",
            { publicURL }
        );
    } catch (error) {
        console.log(error);
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.downloadServiceQuotationQRCode = async (req, res) => {
    try {
        const link = process.env.APP_URL+'/quotation/quotation-by-id-and-type?'+'quotationId='+req.query.quotationId+'&quotationType='+req.query.quotationType;

        const code = await generateQRCode(link);
        if (!code) {
            throw new Error('Failed to generate QR code.');
        }

        const filePath = await saveQRCodeAsFile(code);
        if (!filePath) {
            throw new Error('Failed to save QR code as file.');
        }

        // Get the public URL for the QR code file
        const publicURL = `${req.protocol}://${req.get('host')}/public/qrcodes/${path.basename(filePath)}`;

        return apiResponse.successResponseWithData(
            res,
            "QR code generated and saved successfully",
            { publicURL }
        );
    } catch (error) {
        console.log(error);
        return apiResponse.ErrorResponse(res, error.message);
    }
};

