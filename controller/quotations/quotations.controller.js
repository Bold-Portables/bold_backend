const Construction = require('../../models/construction/construction.schema');
const apiResponse = require("../../helpers/apiResponse");
const logger = require("../../helpers/logger");
const { server } = require('../../server');
const DisasterRelief = require('../../models/disasterRelief/disasterRelief.schema');
const PersonalOrBusiness = require('../../models/personalOrBusiness/personal_or_business_site.schema');
const FarmOrchardWinery = require('../../models/farm_orchard_winery/farm_orchard_winery.schema');
const Event = require('../../models/event/event.schema');
const { default: mongoose } = require('mongoose');
const Notification = require('../../models/notification/notification.schema');
const io = require('socket.io')(server);
const userHelper = require('../../helpers/user');
const Subscription = require("../stripe/models/subscription.schema");
const mailer = require("../../helpers/nodemailer");
const User = require('../../models/user/user.schema');
const RecreationalSite = require('../../models/recreationalSite/recreationalSite.schema');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const AdminEmail = require('../../models/adminEmail/adminEmail.schema');
const Inventory = require('../../models/inventory/inventory.schema');
const sendSms = require("../../helpers/twillioSms.js");

const isValidDate = (dateString) => {
    const currentDate = moment().format('YYYY-MM-DD');
    const inputDate = moment(dateString, 'YYYY-MM-DD', true);

    // Check if the input date is valid and not in the past
    return inputDate.isValid() && inputDate.isSameOrAfter(currentDate, 'day');
};

exports.createConstructionQuotation = async (req, res) => {
    try {

        const {
            coordinator: { email, cellNumber },
            // Rest of the properties
        } = req.body;

        const updatedCellNumber = '+91' + cellNumber;

        // // Check if a user with the provided email and cellNumber already exists
        // const existingUser = await Construction.findOne({
        //     $and: [
        //         { 'coordinator.email': email },
        //         { 'coordinator.cellNumber': cellNumber }
        //     ]
        // });

        // if (existingUser) {
        //     return apiResponse.ErrorResponse(
        //         res,
        //         "User with provided email and cell number already exists"
        //     );
        // }

        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();

        const {
            coordinator: { name },
            maxWorkers,
            weeklyHours,
            placementDate,
            restrictedAccess,
            restrictedAccessDescription,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            useAtNight,
            useInWinter,
            deliveredPrice,
            special_requirements,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
        } = req.body;

        if (!isValidDate(placementDate) || !isValidDate(dateTillUse)) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        // Check if the year is more than 4 digits
        if (placementDate.length > 10 || dateTillUse.length > 10) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }


        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

        // Calculate the total number of hours
        const totalHours = maxWorkers * weeklyHours;

        // Calculate the number of units required
        const numUnits = Math.ceil(totalHours / 400);

        // Determine the service frequency
        let serviceFrequency = "Once per week";
        if (numUnits > 1) {
            serviceFrequency = `${numUnits} units serviced once per week`;
        }

        // Calculate delivered price
        let updatedDeliveredPrice = deliveredPrice;
        if (distanceFromKelowna > 10) {
            const additionalDistance = distanceFromKelowna - 10;
            updatedDeliveredPrice = deliveredPrice + additionalDistance * serviceCharge;
        }

        // Construct the quotation object
        const quotation = {
            user: _id,
            coordinator: {
                name,
                email,
                cellNumber: updatedCellNumber,
            },
            maxWorkers,
            weeklyHours,
            placementDate,
            restrictedAccess,
            restrictedAccessDescription,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice: updatedDeliveredPrice,
            useAtNight,
            useInWinter,
            special_requirements,
            numUnits,
            serviceFrequency,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
        };

        // Create a new Construction instance with the quotation object as properties
        const construction = new Construction(quotation);

        // Save the construction instance
        await construction.save();


        const notification = new Notification({
            user: quotation.user,
            quote_type: "construction",
            quote_id: construction._id,
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();

        const emailModel = await AdminEmail.findOne({ slug: "construction-quotation-created" });

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: process.env.GO_BOLD_ADMIN_MAIL,
            subject: 'Construction Quotation Created',
            text: `Hi Admin,\nA new construction quotation(Id: ${construction._id}) has been created by ${construction.coordinator.name}.<p>Thanks,<br/>Bold Portable</p>`,
            html: `<p>Hi Admin,</p><p>A new construction quotation(Id: ${construction._id}) has been created by ${construction.coordinator.name}.</p><p>Thanks,<br/>Bold Portable</p>`
        };
        mailer.sendMail(mailOptions);

        const text = `Quotation created Id: ${construction._id}`;

        sendSms.sendSMS(updatedCellNumber, text);

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been created successfully",
            construction
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.createRecreationalSiteQuotation = async (req, res) => {
    try {
        const {
            coordinator: { email, cellNumber },
            // Rest of the properties
        } = req.body;

        const updatedCellNumber = '+1' + cellNumber;

        // Check if a user with the provided email and cellNumber already exists
        // const existingUser = await RecreationalSite.findOne({
        //     $and: [
        //         { 'coordinator.email': email },
        //         { 'coordinator.cellNumber': cellNumber }
        //     ]
        // });

        // if (existingUser) {
        //     return apiResponse.ErrorResponse(
        //         res,
        //         "User with provided email and cell number already exists"
        //     );
        // }

        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();

        const {
            coordinator: { name },
            maxWorkers,
            weeklyHours,
            placementDate,
            placementLocation,
            restrictedAccess,
            restrictedAccessDescription,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            useAtNight,
            useInWinter,
            deliveredPrice,
            special_requirements,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
        } = req.body;

        if (!isValidDate(placementDate) || !isValidDate(dateTillUse)) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        // Check if the year is more than 4 digits
        if (placementDate.length > 10 || dateTillUse.length > 10) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

        // Calculate the total number of hours
        const totalHours = maxWorkers * weeklyHours;

        // Calculate the number of units required
        const numUnits = Math.ceil(totalHours / 400);

        // Determine the service frequency
        let serviceFrequency = "Once per week";
        if (numUnits > 1) {
            serviceFrequency = `${numUnits} units serviced once per week`;
        }

        // Calculate delivered price
        let updatedDeliveredPrice = deliveredPrice;
        if (distanceFromKelowna > 10) {
            const additionalDistance = distanceFromKelowna - 10;
            updatedDeliveredPrice = deliveredPrice + additionalDistance * serviceCharge;
        }

        // Construct the quotation object
        const quotation = {
            user: _id,
            coordinator: {
                name,
                email,
                cellNumber: updatedCellNumber,
            },
            maxWorkers,
            weeklyHours,
            placementDate,
            restrictedAccess,
            restrictedAccessDescription,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice: updatedDeliveredPrice,
            useAtNight,
            useInWinter,
            special_requirements,
            numUnits,
            serviceFrequency,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
        };

        // Create a new Construction instance with the quotation object as properties
        const recreationalSite = new RecreationalSite(quotation);

        // Save the construction instance
        await recreationalSite.save();


        const notification = new Notification({
            user: quotation.user,
            quote_type: "recreational-site",
            quote_id: recreationalSite._id,
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: process.env.GO_BOLD_ADMIN_MAIL,
            subject: 'Recreational-site Quotation Created',
            text: `Hi Admin,\nA new recreational-site quotation(Id: ${recreationalSite._id}) has been created by ${recreationalSite.coordinator.name}.<p>Thanks,<br/>Bold Portable</p>`,
            html: `<p>Hi Admin,</p><p>A new recreational-site quotation(Id: ${recreationalSite._id}) has been created by ${recreationalSite.coordinator.name}.</p><p>Thanks,<br/>Bold Portable</p>`
        };
        mailer.sendMail(mailOptions);

        const text = `Quotation created. Id: ${recreationalSite._id}`;

        sendSms.sendSMS(updatedCellNumber, text);

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been created successfully",
            recreationalSite
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.updateConstructionQuotation = async (req, res) => {
    try {
        const { constructionId } = req.params; // Get the construction ID from the request parameters
        const { costDetails, type = "" } = req.body;

        // Find the existing Construction document
        const construction = await Construction.findById(constructionId);

        if (!construction) {
            return apiResponse.ErrorResponse(res, "Construction document not found.");
        }

        // Update the costDetails field
        construction.costDetails = costDetails;

        const user = await User.findById(construction.user);
        // Save the updated construction document
        await construction.save();
        if (type !== 'save') {
            const notification = new Notification({
                user: construction.user,
                quote_type: 'recreational-site',
                quote_id: construction._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { construction });



            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', async () => {
                // Send the email with the PDF attachment
                const emailModel = await AdminEmail.findOne({ slug: "quotation-update-action-required" });

                if (emailModel) {
                    const mailOptions = {
                        from: process.env.MAIL_FROM,
                        to: user.email,
                        subject: emailModel.header,
                        text: emailModel.body,
                        attachments: [
                            {
                                filename: `quotation_update-${constructionId}.pdf`,
                                content: pdfBuffer,
                            },
                        ],
                    };
                    mailer.sendMail(mailOptions);
                }
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, construction);

            // End the document
            pdfDoc.end();
        }

        const text = `Quotation cost details updated:${construction._id}`;

        sendSms.sendSMS(user.mobile, text);

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been updated successfully",
            construction
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
const addQuotationDetails = (pdfDoc, quotationData) => {
    pdfDoc.fontSize(16).text("Here's the complete Quotation", { align: 'center' });
    pdfDoc.moveDown();
    pdfDoc.fontSize(12).text(`Hi ${quotationData.coordinator.name},`);
    pdfDoc.text('We have updated your quotation with the requisite price and details.');
    pdfDoc.text('');

    const tableOptions = {
        x: 50,
        y: pdfDoc.y,
        width: 500,
        rowHeight: 20,
        columnGap: 15,
    };

    // Helper function to draw a table cell with borders
    const drawTableCell = (text, x, y, width, height) => {
        pdfDoc
            .rect(x, y, width, height)
            .stroke()
            .text(text, x + 5, y + 5, { width: width - 10, align: 'left' });
    };

    // Helper function to draw a table row
    const drawTableRow = (row, rowIndex, yOffset) => {
        const y = yOffset + tableOptions.rowHeight * rowIndex;
        let x = tableOptions.x;

        row.forEach((cell, cellIndex) => {
            const width = tableOptions.width / row.length;
            const height = tableOptions.rowHeight;

            drawTableCell(cell, x, y, width, height);

            x += width;
        });
    };

    let yOffset = pdfDoc.y; // Initial y coordinate for the first table
    pdfDoc.moveDown();
    const quotationDetailsData = [
        ['Quotation Details:', ''],
        ['Quotation ID:', quotationData._id],
        ['Quotation Type:', quotationData.quotationType],
        ['Max Workers:', quotationData.maxWorkers.toString()],
        ['Weekly Hours:', quotationData.weeklyHours.toString()],
    ];

    for (let i = 0; i < quotationDetailsData.length; i++) {
        drawTableRow(quotationDetailsData[i], i, yOffset);
    }

    yOffset += (quotationDetailsData.length + 1) * tableOptions.rowHeight;

    pdfDoc.moveDown();
    pdfDoc.moveDown();
    const costDetailsData = [
        ['Cost Details:', ''],
        ['Use At Night Cost:', `$${quotationData.costDetails.useAtNightCost}`],
        ['Use In Winter Cost:', `$${quotationData.costDetails.useInWinterCost}`],
        ['Number of Units Cost:', `$${quotationData.costDetails.numberOfUnitsCost}`],
        ['Delivery Price:', `$${quotationData.costDetails.deliveryPrice}`],
        ['Workers Cost:', `$${quotationData.costDetails.workersCost}`],
        ['Hand Washing Cost:', `$${quotationData.costDetails.handWashingCost}`],
        ['Hand Sanitizer Pump Cost:', `$${quotationData.costDetails.handSanitizerPumpCost}`],
        ['Special Requirements Cost:', `$${quotationData.costDetails.specialRequirementsCost}`],
        ['Service Frequency Cost:', `$${quotationData.costDetails.serviceFrequencyCost}`],
        ['Weekly Hours Cost:', `$${quotationData.costDetails.weeklyHoursCost}`],
    ];

    if (quotationData.quotationType == "event") {
        costDetailsData.push(
            ['Pick Up Price:', `$${quotationData.costDetails.pickUpPrice}`],
            ['Pay Per Use:', `$${quotationData.costDetails.payPerUse}`],
            ['Fenced Off:', `$${quotationData.costDetails.fencedOff}`],
            ['Actively Cleaned:', `$${quotationData.costDetails.activelyCleaned}`],
            ['Alcohol Served:', `$${quotationData.costDetails.alcoholServed}`],
        );
    }

    const filteredCostDetailsData = costDetailsData.filter((item) => {
        // Check if the item contains quotationData.costDetails and its value is not 0
        return !item[1].includes('$0');
    });

    for (let i = 0; i < filteredCostDetailsData.length; i++) {
        drawTableRow(filteredCostDetailsData[i], i, yOffset);
    }

    yOffset += (filteredCostDetailsData.length + 1) * tableOptions.rowHeight;

    pdfDoc.moveDown();
    pdfDoc.moveDown();
    const otherDetailsData = [
        ['Other Details:', ''],
        ['Placement Date:', new Date(quotationData.placementDate).toLocaleDateString('en-US')],
        ['Distance From Kelowna:', `${quotationData.distanceFromKelowna} km`],
        ['Service Charge:', `$${quotationData.serviceCharge}`],
        ['Delivered Price:', `$${quotationData.deliveredPrice}`],
        ['Use At Night:', quotationData.useAtNight ? 'Yes' : 'No'],
        ['Use In Winter:', quotationData.useInWinter ? 'Yes' : 'No'],
    ];

    for (let i = 0; i < otherDetailsData.length; i++) {
        drawTableRow(otherDetailsData[i], i, yOffset);
    }

    yOffset += (otherDetailsData.length + 1) * tableOptions.rowHeight;

    // Calculate the total cost
    const totalCost = quotationData.costDetails.useAtNightCost + quotationData.costDetails.useInWinterCost + quotationData.costDetails.numberOfUnitsCost + quotationData.costDetails.deliveryPrice + quotationData.costDetails.workersCost + quotationData.costDetails.handWashingCost + quotationData.costDetails.handSanitizerPumpCost + quotationData.costDetails.specialRequirementsCost + quotationData.costDetails.serviceFrequencyCost + quotationData.costDetails.weeklyHoursCost + quotationData.serviceCharge + quotationData.deliveredPrice;

    pdfDoc.moveDown();
    pdfDoc.moveDown();

    // Draw the Total row
    drawTableRow(['Total:', `$${totalCost}`], 0, yOffset);

    // Add more content to the PDF as needed




};

exports.updateRecreationalSiteQuotation = async (req, res) => {
    try {
        const { recreationalSiteId } = req.params; // Get the recreationalSite ID from the request parameters
        const { costDetails, type = '' } = req.body;
        // Find the existing recreationalSite document
        const recreationalSite = await RecreationalSite.findById(recreationalSiteId);

        if (!recreationalSite) {
            return apiResponse.ErrorResponse(res, 'RecreationalSite document not found.');
        }

        // Update the recreationalSite field
        recreationalSite.costDetails = costDetails;

        const user = await User.findById(recreationalSite.user);
        // Save the updated recreationalSite document
        await recreationalSite.save();
        if (type !== 'save') {
            const notification = new Notification({
                user: recreationalSite.user,
                quote_type: 'recreational-site',
                quote_id: recreationalSite._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { recreationalSite });



            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', async () => {
                // Send the email with the PDF attachment
                const emailModel = await AdminEmail.findOne({ slug: "quotation-update-action-required" });

                if (emailModel) {
                    const mailOptions = {
                        from: process.env.MAIL_FROM,
                        to: user.email,
                        subject: emailModel.header,
                        text: emailModel.body,
                        attachments: [
                            {
                                filename: `quotation_update-${recreationalSiteId}.pdf`,
                                content: pdfBuffer,
                            },
                        ],
                    };
                    mailer.sendMail(mailOptions);
                }
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, recreationalSite);

            // End the document
            pdfDoc.end();
        }

        const text = `Quotation cost detail updated. Id: ${recreationalSite._id}`;

        sendSms.sendSMS(user.mobile, text);

        return apiResponse.successResponseWithData(res, 'Quotation has been updated successfully', recreationalSite);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.createDisasterReliefQuotation = async (req, res) => {
    try {

        const {
            coordinator: { email, cellNumber },
            // Rest of the properties
        } = req.body;

        const updatedCellNumber = '+91' + cellNumber;

        // Check if a user with the provided email and cellNumber already exists
        // const existingUser = await DisasterRelief.findOne({
        //     $and: [
        //         { 'coordinator.email': email },
        //         { 'coordinator.cellNumber': cellNumber }
        //     ]
        // });

        // if (existingUser) {
        //     return apiResponse.ErrorResponse(
        //         res,
        //         "User with provided email and cell number already exists"
        //     );
        // }
        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();

        const {
            disasterNature,
            coordinator: { name },
            maxWorkers,
            weeklyHours,
            placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            hazards,
            useAtNight,
            useInWinter,
            special_requirements,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        } = req.body;

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

        // Calculate the total number of hours
        const totalHours = maxWorkers * weeklyHours;

        // Calculate the number of units required
        const numUnits = Math.ceil(totalHours / 400);

        // Determine the service frequency
        let serviceFrequency = "Once per week";
        if (numUnits > 1) {
            serviceFrequency = `${numUnits} units serviced once per week`;
        }

        // Calculate the delivered price
        let deliveredPrice = 0;
        if (distanceFromKelowna > 10) {
            deliveredPrice = (distanceFromKelowna - 10) * serviceCharge;
        }

        // Construct the quotation object
        const quotation = {
            user: _id,
            disasterNature,
            coordinator: {
                name,
                email,
                cellNumber: updatedCellNumber,
            },
            placementDate,
            placementLocation,
            maxWorkers,
            weeklyHours,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            hazards,
            useAtNight,
            useInWinter,
            special_requirements,
            numUnits,
            serviceFrequency,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        };

        if (!isValidDate(placementDate) || !isValidDate(dateTillUse)) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        // Check if the year is more than 4 digits
        if (placementDate.length > 10 || dateTillUse.length > 10) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        // Create a new DisasterRelief instance with the quotation object as properties
        const disasterRelief = new DisasterRelief(quotation);

        // Save the disaster relief instance
        await disasterRelief.save();

        const notification = new Notification({
            user: quotation.user,
            quote_type: "disaster-relief",
            quote_id: disasterRelief._id,
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: process.env.GO_BOLD_ADMIN_MAIL,
            subject: 'Disaster-relief Quotation Created',
            text: `Hi Admin,\nA new disaster-relief quotation(Id: ${disasterRelief._id}) has been created by ${disasterRelief.coordinator.name}.<p>Thanks,<br/>Bold Portable</p>`,
            html: `<p>Hi Admin,</p><p>A new disaster-relief quotation(Id: ${disasterRelief._id}) has been created by ${disasterRelief.coordinator.name}.</p><p>Thanks,<br/>Bold Portable</p>`
        };
        mailer.sendMail(mailOptions);

        const text = `Quotation created. Id: ${disasterRelief._id}`;

        sendSms.sendSMS(updatedCellNumber, text);

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been created successfully",
            disasterRelief
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.updateDisasterReliefQuotation = async (req, res) => {
    try {
        const { disasterReliefId } = req.params; // Get the construction ID from the request parameters
        const { costDetails, type = "" } = req.body;

        // Find the existing construction document
        const disasterRelief = await DisasterRelief.findById(disasterReliefId);

        if (!disasterRelief) {
            return apiResponse.ErrorResponse(res, "Disaster Relief Quotation not found.");
        }
        const user = await User.findById(disasterRelief.user);
        // Update the costDetails field
        disasterRelief.costDetails = costDetails;

        // Save the updated disasterRelief document
        await disasterRelief.save();
        if (type !== 'save') {
            const notification = new Notification({
                user: disasterRelief.user,
                quote_type: 'recreational-site',
                quote_id: disasterRelief._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { disasterRelief });



            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', async () => {
                // Send the email with the PDF attachment
                const emailModel = await AdminEmail.findOne({ slug: "quotation-update-action-required" });

                if (emailModel) {
                    const mailOptions = {
                        from: process.env.MAIL_FROM,
                        to: user.email,
                        subject: emailModel.header,
                        text: emailModel.body,
                        attachments: [
                            {
                                filename: `quotation_update-${disasterReliefId}.pdf`,
                                content: pdfBuffer,
                            },
                        ],
                    };
                    mailer.sendMail(mailOptions);
                }

            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, disasterRelief);

            // End the document
            pdfDoc.end();
        }

        const text = `Quotation cost details updated. Id: ${disasterRelief._id}`;

        sendSms.sendSMS(user.mobile, text);

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been updated successfully",
            disasterRelief
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.createPersonalOrBusinessQuotation = async (req, res) => {
    try {
        const {
            coordinator: { email, cellNumber },
            // Rest of the properties
        } = req.body;

        const updatedCellNumber = '+91' + cellNumber;

        // Check if a user with the provided email and cellNumber already exists
        // const existingUser = await PersonalOrBusiness.findOne({
        //     $and: [
        //         { 'coordinator.email': email },
        //         { 'coordinator.cellNumber': cellNumber }
        //     ]
        // });

        // if (existingUser) {
        //     return apiResponse.ErrorResponse(
        //         res,
        //         "User with provided email and cell number already exists"
        //     );
        // }

        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();
        const {
            useType,
            coordinator: { name },
            maxWorkers,
            weeklyHours,
            placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            useAtNight,
            useInWinter,
            special_requirements,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        } = req.body;

        if (!isValidDate(placementDate) || !isValidDate(dateTillUse)) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        // Check if the year is more than 4 digits
        if (placementDate.length > 10 || dateTillUse.length > 10) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

        // Calculate the total number of hours
        const totalHours = maxWorkers * weeklyHours;

        // Calculate the number of units required
        const numUnits = Math.ceil(totalHours / 400);

        // Determine the service frequency
        let serviceFrequency = "Once per week";
        if (numUnits > 1) {
            serviceFrequency = `${numUnits} units serviced once per week`;
        }

        // Calculate the delivered price
        let deliveredPrice = 0;
        if (distanceFromKelowna > 10) {
            deliveredPrice = (distanceFromKelowna - 10) * serviceCharge;
        }

        // Construct the PersonalOrBusiness object
        const personalOrBusiness = new PersonalOrBusiness({
            user: _id,
            useType,
            coordinator: {
                name,
                email,
                cellNumber: updatedCellNumber,
            },
            maxWorkers,
            weeklyHours,
            placementDate: placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            useAtNight: useAtNight,
            useInWinter: useInWinter,
            special_requirements,
            numUnits,
            serviceFrequency,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers: parseInt(maleWorkers) + parseInt(femaleWorkers),
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        });

        // Save the PersonalOrBusiness instance
        await personalOrBusiness.save();

        const notification = new Notification({
            user: personalOrBusiness.user,
            quote_type: "personal-or-business",
            quote_id: personalOrBusiness._id,
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: process.env.GO_BOLD_ADMIN_MAIL,
            subject: 'Personal-or-business Quotation Created',
            text: `Hi Admin,\nA new personal-or-business(Id: ${personalOrBusiness._id}) has been created by ${personalOrBusiness.coordinator.name}.<p>Thanks,<br/>Bold Portable</p>`,
            html: `<p>Hi Admin,</p><p>A new personal-or-business quotation(Id: ${personalOrBusiness._id}) has been created by ${personalOrBusiness.coordinator.name}.</p><p>Thanks,<br/>Bold Portable</p>`
        };
        mailer.sendMail(mailOptions);

        const text = `Quotation created. Id: ${personalOrBusiness._id}`;

        sendSms.sendSMS(updatedCellNumber, text);

        return apiResponse.successResponseWithData(
            res,
            "PersonalOrBusiness instance has been created successfully",
            personalOrBusiness
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.updatePersonalOrBusinessQuotation = async (req, res) => {
    try {
        const { personalOrBusinessId } = req.params; // Get the construction ID from the request parameters
        const { costDetails, type = "" } = req.body;

        // Find the existing construction document
        const personalOrBusiness = await PersonalOrBusiness.findById(personalOrBusinessId);

        if (!personalOrBusiness) {
            return apiResponse.ErrorResponse(res, "Personal or Business Quotation not found.");
        }

        // Update the costDetails field
        personalOrBusiness.costDetails = costDetails;
        const user = await User.findById(personalOrBusiness.user);
        // Save the updated disasterRelief document
        await personalOrBusiness.save();
        if (type !== 'save') {
            const notification = new Notification({
                user: personalOrBusiness.user,
                quote_type: 'recreational-site',
                quote_id: personalOrBusiness._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { personalOrBusiness });



            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', async () => {
                // Send the email with the PDF attachment
                const emailModel = await AdminEmail.findOne({ slug: "quotation-update-action-required" });

                if (emailModel) {
                    const mailOptions = {
                        from: process.env.MAIL_FROM,
                        to: user.email,
                        subject: emailModel.header,
                        text: emailModel.body,
                        attachments: [
                            {
                                filename: `quotation_update-${personalOrBusinessId}.pdf`,
                                content: pdfBuffer,
                            },
                        ],
                    };
                    mailer.sendMail(mailOptions);
                }
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, personalOrBusiness);

            // End the document
            pdfDoc.end();
        }

        const text = `Quotation cost details updated. Id: ${personalOrBusiness._id}`;

        sendSms.sendSMS(user.mobile, text);

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been updated successfully",
            personalOrBusiness
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.createFarmOrchardWineryQuotation = async (req, res) => {
    try {
        const {
            coordinator: { email, cellNumber },
            // Rest of the properties
        } = req.body;

        const updatedCellNumber = '+91' + cellNumber;

        // Check if a user with the provided email and cellNumber already exists
        // const existingUser = await FarmOrchardWinery.findOne({
        //     $and: [
        //         { 'coordinator.email': email },
        //         { 'coordinator.cellNumber': cellNumber }
        //     ]
        // });


        // if (existingUser) {
        //     return apiResponse.ErrorResponse(
        //         res,
        //         "User with provided email and cell number already exists"
        //     );
        // }

        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();
        const {
            useType,
            coordinator: { name },
            maxWorkers,
            weeklyHours,
            placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            useAtNight,
            useInWinter,
            special_requirements,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        } = req.body;

        if (!isValidDate(placementDate) || !isValidDate(dateTillUse)) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        // Check if the year is more than 4 digits
        if (placementDate.length > 10 || dateTillUse.length > 10) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

        // Calculate the total number of hours
        const totalHours = maxWorkers * weeklyHours;

        // Calculate the number of units required
        const numUnits = Math.ceil(totalHours / 400);
        // Determine the service frequency
        let serviceFrequency = "Once per week";
        if (numUnits > 1) {
            serviceFrequency = `${numUnits} units serviced once per week`;
        }

        // Calculate the delivered price
        let deliveredPrice = 0;
        if (distanceFromKelowna > 10) {
            deliveredPrice = (distanceFromKelowna - 10) * serviceCharge;
        }

        // Construct the FarmOrchardWinery object
        const farmOrchardWinery = new FarmOrchardWinery({
            user: _id,
            useType,
            coordinator: {
                name,
                email,
                cellNumber: updatedCellNumber,
            },
            maxWorkers,
            weeklyHours,
            placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            useAtNight: useAtNight,
            useInWinter: useInWinter,
            special_requirements,
            numUnits,
            serviceFrequency,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers: parseInt(maleWorkers) + parseInt(femaleWorkers),
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        });

        // Save the FarmOrchardWinery instance
        await farmOrchardWinery.save();

        const notification = new Notification({
            user: farmOrchardWinery.user,
            quote_id: farmOrchardWinery._id,
            quote_type: "farm-orchard-winery",
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: process.env.GO_BOLD_ADMIN_MAIL,
            subject: 'Farm-orchard-winery Quotation Created',
            text: `Hi Admin,\nA new farm-orchard-winery(Id: ${farmOrchardWinery._id}) has been created by ${farmOrchardWinery.coordinator.name}.<p>Thanks,<br/>Bold Portable</p>`,
            html: `<p>Hi Admin,</p><p>A new farm-orchard-winery quotation(Id: ${farmOrchardWinery._id}) has been created by ${farmOrchardWinery.coordinator.name}.</p><p>Thanks,<br/>Bold Portable</p>`
        };
        mailer.sendMail(mailOptions);

        const text = `Quotation created. Id: ${farmOrchardWinery._id}`;

        sendSms.sendSMS(updatedCellNumber, text);

        return apiResponse.successResponseWithData(
            res,
            "FarmOrchardWinery instance has been created successfully",
            farmOrchardWinery
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.updateFarmOrchardWineryQuotation = async (req, res) => {
    try {
        const { farmOrchardWineryId } = req.params; // Get the construction ID from the request parameters
        const { costDetails, type = "" } = req.body;

        // Find the existing construction document
        const farmOrchardWinery = await FarmOrchardWinery.findById(farmOrchardWineryId);

        if (!farmOrchardWinery) {
            return apiResponse.ErrorResponse(res, "Farm, Orchard or Winery Quotation not found.");
        }

        // Update the costDetails field
        farmOrchardWinery.costDetails = costDetails;

        const user = await User.findById(farmOrchardWinery.user);

        // Save the updated disasterRelief document
        await farmOrchardWinery.save();
        if (type !== 'save') {
            const notification = new Notification({
                user: farmOrchardWinery.user,
                quote_type: 'recreational-site',
                quote_id: farmOrchardWinery._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { farmOrchardWinery });



            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', async () => {
                // Send the email with the PDF attachment
                const emailModel = await AdminEmail.findOne({ slug: "quotation-update-action-required" });

                if (emailModel) {
                    const mailOptions = {
                        from: process.env.MAIL_FROM,
                        to: user.email,
                        subject: emailModel.header,
                        text: emailModel.body,
                        attachments: [
                            {
                                filename: `quotation_update-${farmOrchardWineryId}.pdf`,
                                content: pdfBuffer,
                            },
                        ],
                    };
                    mailer.sendMail(mailOptions);
                }
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, farmOrchardWinery);

            // End the document
            pdfDoc.end();
        }

        const text = `Quotation cost details updated. Id: ${farmOrchardWinery._id}`;

        sendSms.sendSMS(user.mobile, text);

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been updated successfully",
            farmOrchardWinery
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.createEventQuotation = async (req, res) => {
    try {

        const {
            coordinator: { email, cellNumber },
            // Rest of the properties
        } = req.body;
        const updatedCellNumber = '+91' + cellNumber;

        // Check if a user with the provided email and cellNumber already exists
        // const existingUser = await Event.findOne({
        //     $and: [
        //         { 'coordinator.email': email },
        //         { 'coordinator.cellNumber': cellNumber }
        //     ]
        // });

        // if (existingUser) {
        //     return apiResponse.ErrorResponse(
        //         res,
        //         "User with provided email and cell number already exists"
        //     );
        // }

        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();
        const {
            eventDetails: {
                eventName,
                eventDate,
                eventType,
                eventLocation,
                eventMapLocation
            },
            coordinator: { name },
            maxWorkers,
            weeklyHours,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            useAtNight,
            useInWinter,
            peakUseTimes,
            peakTimeSlot,
            maxAttendees,
            alcoholServed,
            special_requirements,
            vipSection: {
                payPerUse,
                fencedOff,
                activelyCleaned
            },
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        } = req.body;
        if (!isValidDate(dateTillUse) || !isValidDate(req.body.eventDetails.eventDate)) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        // Check if the year is more than 4 digits
        if (dateTillUse.length > 10) {
            return apiResponse.ErrorResponse(res, 'Invalid date format');
        }

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

        // Calculate the total number of hours
        const totalHours = maxWorkers * weeklyHours;

        // Calculate the number of units required
        const numUnits = Math.ceil(totalHours / 400);

        // Determine the service frequency
        let serviceFrequency = "Once per week";
        if (numUnits > 1) {
            serviceFrequency = `${numUnits} units serviced once per week`;
        }

        // Calculate the delivered price
        let deliveredPrice = 0;
        if (distanceFromKelowna > 10) {
            deliveredPrice = (distanceFromKelowna - 10) * serviceCharge;
        }

        // Construct the Event object
        const event = new Event({
            user: _id,
            coordinator: {
                name,
                email,
                cellNumber: updatedCellNumber,
            },
            maxWorkers,
            weeklyHours,
            maxAttendees,
            alcoholServed,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            useAtNight: useAtNight,
            useInWinter: useInWinter,
            special_requirements,
            numUnits,
            serviceFrequency,
            eventDetails: {
                eventName,
                eventDate,
                eventType,
                eventLocation,
                eventMapLocation
            },
            vipSection: {
                payPerUse,
                fencedOff,
                activelyCleaned
            },
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers: parseInt(maleWorkers) + parseInt(femaleWorkers),
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        });

        // Save the Event instance
        await event.save();
        const notification = new Notification({
            user: event.user,
            quote_type: "event",
            quote_id: event._id,
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: process.env.GO_BOLD_ADMIN_MAIL,
            subject: 'Event Quotation Created',
            text: `Hi Admin,\nA new event(Id: ${event._id}) has been created by ${event.coordinator.name}.<p>Thanks,<br/>Bold Portable</p>`,
            html: `<p>Hi Admin,</p><p>A new event quotation(Id: ${event._id}) has been created by ${event.coordinator.name}.</p><p>Thanks,<br/>Bold Portable</p>`
        };
        mailer.sendMail(mailOptions);

        const text = `Quotation created. Id: ${event._id}`;

        sendSms.sendSMS(updatedCellNumber, text);

        return apiResponse.successResponseWithData(
            res,
            "Event instance has been created successfully",
            event
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.updateEventQuotation = async (req, res) => {
    try {
        const { eventId } = req.params; // Get the construction ID from the request parameters
        const { costDetails, type = "" } = req.body;

        // Find the existing construction document
        const event = await Event.findById(eventId);

        if (!event) {
            return apiResponse.ErrorResponse(res, "Event Quotation not found.");
        }

        // Update the costDetails field
        event.costDetails = costDetails;

        // Save the updated disasterRelief document
        await event.save();

        const notification = new Notification({
            user: event.user,
            quote_type: "event",
            quote_id: event._id,
            type: "UPDATE_QUOTE",
            status_seen: false
        });
        await notification.save();

        const user = await User.findById(event.user);

        if (type !== 'save') {
            const notification = new Notification({
                user: event.user,
                quote_type: 'recreational-site',
                quote_id: event._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { event });



            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', async () => {
                // Send the email with the PDF attachment
                const emailModel = await AdminEmail.findOne({ slug: "quotation-update-action-required" });

                if (emailModel) {
                    const mailOptions = {
                        from: process.env.MAIL_FROM,
                        to: user.email,
                        subject: emailModel.header,
                        text: emailModel.body,
                        attachments: [
                            {
                                filename: `quotation_update-${eventId}.pdf`,
                                content: pdfBuffer,
                            },
                        ],
                    };
                    mailer.sendMail(mailOptions);
                }
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, event);

            // End the document
            pdfDoc.end();
        }

        const text = `Quotation cost detail updated. Id: ${event._id}`;

        sendSms.sendSMS(user.mobile, text);

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been updated successfully",
            event
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.getAllQuotation = async (req, res) => {
    try {
        const { quotationType } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (quotationType == 'all') {
            const quotations = await Promise.all([
                Event.find(),
                FarmOrchardWinery.find(),
                PersonalOrBusiness.find(),
                DisasterRelief.find(),
                Construction.find(),
                RecreationalSite.find(),
            ]).then(([events, farmOrchardWineries, personalOrBusinesses, disasterReliefs, constructions, recreationalSite]) => {
                return [
                    ...events.map(event => ({ ...event.toObject(), type: 'event' })),
                    ...farmOrchardWineries.map(farmOrchardWinery => ({ ...farmOrchardWinery.toObject(), type: 'farm-orchard-winery' })),
                    ...personalOrBusinesses.map(personalOrBusiness => ({ ...personalOrBusiness.toObject(), type: 'personal-or-business' })),
                    ...disasterReliefs.map(disasterRelief => ({ ...disasterRelief.toObject(), type: 'disaster-relief' })),
                    ...constructions.map(construction => ({ ...construction.toObject(), type: 'construction' })),
                    ...recreationalSite.map(recreationalSite => ({ ...recreationalSite.toObject(), type: 'recreational-site' })),
                ];
            });
            quotations.sort((a, b) => b.createdAt - a.createdAt);

            // Filtering quotations with pending and cancelled status only
            const filteredQuotations = quotations.filter(quotation => quotation.status === 'pending' || quotation.status === 'cancelled');
            const count = filteredQuotations.length;

            return apiResponse.successResponseWithData(
                res,
                "Quotations retrieved successfully",
                {
                    quotations: filteredQuotations.slice((page - 1) * limit, page * limit),
                    page: page,
                    pages: Math.ceil(count / limit),
                    total: count
                }
            );
        }
        else {
            let quotations;

            switch (quotationType) {
                case 'event':
                    quotations = await Event.find()
                        .skip((page - 1) * limit)
                        .limit(limit);
                    break;
                case 'farm-orchard-winery':
                    quotations = await FarmOrchardWinery.find()
                        .skip((page - 1) * limit)
                        .limit(limit);
                    break;
                case 'personal-or-business':
                    quotations = await PersonalOrBusiness.find()
                        .skip((page - 1) * limit)
                        .limit(limit);
                    break;
                case 'disaster-relief':
                    quotations = await DisasterRelief.find()
                        .skip((page - 1) * limit)
                        .limit(limit);
                    break;
                case 'construction':
                    quotations = await Construction.find()
                        .skip((page - 1) * limit)
                        .limit(limit);
                    break;
                case 'recreational-site':
                    quotations = await RecreationalSite.find()
                        .skip((page - 1) * limit)
                        .limit(limit);
                    break;
                default:
                    throw new Error(`Quotation type '${quotationType}' not found`);
            }

            // Filtering quotations with pending and cancelled status only
            const filteredQuotations = quotations.filter(quotation => quotation.status === 'pending' || quotation.status === 'cancelled');
            const count = filteredQuotations.length;

            const quotationTypeFormatted = quotationType.replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('');

            const QuotationModel = mongoose.model(quotationTypeFormatted);

            return apiResponse.successResponseWithData(
                res,
                "Quotations retrieved successfully",
                {
                    quotations: filteredQuotations,
                    page: page,
                    pages: Math.ceil(count / limit),
                    total: count
                }
            );
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.getAllQuotationForUsers = async (req, res) => {
    try {
        const { user_type, _id } = req.userData.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        let quotations = [];

        if (user_type === 'USER') {
            const [
                events,
                farmOrchardWineries,
                personalOrBusinesses,
                disasterReliefs,
                constructions,
                recreationalSite
            ] = await Promise.all([
                Event.find({ user: _id }),
                FarmOrchardWinery.find({ user: _id }),
                PersonalOrBusiness.find({ user: _id }),
                DisasterRelief.find({ user: _id }),
                Construction.find({ user: _id }),
                RecreationalSite.find({ user: _id }),
            ]);

            quotations = [
                ...events.map(event => ({ ...event.toObject(), type: 'event' })),
                ...farmOrchardWineries.map(farmOrchardWinery => ({ ...farmOrchardWinery.toObject(), type: 'farm-orchard-winery' })),
                ...personalOrBusinesses.map(personalOrBusiness => ({ ...personalOrBusiness.toObject(), type: 'personal-or-business' })),
                ...disasterReliefs.map(disasterRelief => ({ ...disasterRelief.toObject(), type: 'disaster-relief' })),
                ...constructions.map(construction => ({ ...construction.toObject(), type: 'construction' })),
                ...recreationalSite.map(recreationalSite => ({ ...recreationalSite.toObject(), type: 'recreational-site' }))
            ];

            quotations.sort((a, b) => b.createdAt - a.createdAt);
        } else {
            // Handle other user types if needed
            return apiResponse.ErrorResponse(res, "Invalid user_type");
        }

        const count = quotations.length;

        return apiResponse.successResponseWithData(
            res,
            "Quotations retrieved successfully",
            {
                quotations: quotations.slice((page - 1) * limit, page * limit),
                page: page,
                pages: Math.ceil(count / limit),
                total: count
            }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.getSpefcificQuotationQuoteId = async (req, res) => {
    try {
        const { user_type, _id } = req.userData.user;
        const quoteId = req.body.quote_id;

        if (user_type === 'USER') {
            const quotations = await Promise.all([
                Event.findOne({ _id: quoteId, user: _id }),
                FarmOrchardWinery.findOne({ _id: quoteId, user: _id }),
                PersonalOrBusiness.findOne({ _id: quoteId, user: _id }),
                DisasterRelief.findOne({ _id: quoteId, user: _id }),
                Construction.findOne({ _id: quoteId, user: _id }),
                RecreationalSite.findOne({ _id: quoteId, user: _id }),
            ]).then(async ([event, farmOrchardWinery, personalOrBusiness, disasterRelief, construction, recreationalSite]) => {
                const quotations = [];
                if (event) {
                    quotations.push({ ...event.toObject(), type: 'event' });
                    const costDetails = event.costDetails;

                    const quotationId = event._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "Event",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }

                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                    const inventories = await Inventory.find({ quote_id: event._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                if (farmOrchardWinery) {
                    quotations.push({ ...farmOrchardWinery.toObject(), type: 'farm-orchard-winery' });
                    const costDetails = farmOrchardWinery.costDetails;

                    const quotationId = farmOrchardWinery._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "FarmOrchardWinery",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }

                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                    const inventories = await Inventory.find({ quote_id: farmOrchardWinery._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                if (personalOrBusiness) {
                    quotations.push({ ...personalOrBusiness.toObject(), type: 'personal-or-business' });
                    const costDetails = personalOrBusiness.costDetails;

                    const quotationId = personalOrBusiness._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "PersonalOrBusiness",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }

                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                    const inventories = await Inventory.find({ quote_id: personalOrBusiness._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                if (disasterRelief) {
                    quotations.push({ ...disasterRelief.toObject(), type: 'disaster-relief' });
                    const costDetails = disasterRelief.costDetails;

                    const quotationId = disasterRelief._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "DisasterRelief",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }

                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                    const inventories = await Inventory.find({ quote_id: disasterRelief._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                if (construction) {
                    quotations.push({ ...construction.toObject(), type: 'construction' });
                    const costDetails = construction.costDetails;

                    const quotationId = construction._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "Construction",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                    const inventories = await Inventory.find({ quote_id: construction._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                if (recreationalSite) {
                    quotations.push({ ...recreationalSite.toObject(), type: 'recreational-site' });
                    const costDetails = recreationalSite.costDetails;

                    const quotationId = recreationalSite._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "RecreationalSite",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }

                    const inventories = await Inventory.find({ quote_id: recreationalSite._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                return quotations;
            });

            if (quotations.length === 0) {
                return apiResponse.notFoundResponse(res, 'Quotation not found');
            }

            return apiResponse.successResponseWithData(
                res,
                "Quotation retrieved successfully",
                {
                    quotation: quotations[0],
                }
            );
        } else {
            const quotations = await Promise.all([
                Event.findOne({ _id: quoteId }),
                FarmOrchardWinery.findOne({ _id: quoteId }),
                PersonalOrBusiness.findOne({ _id: quoteId }),
                DisasterRelief.findOne({ _id: quoteId }),
                Construction.findOne({ _id: quoteId }),
                RecreationalSite.findOne({ _id: quoteId }),
            ]).then(async ([event, farmOrchardWinery, personalOrBusiness, disasterRelief, construction, recreationalSite]) => {
                const quotations = [];
                if (event) {
                    quotations.push({ ...event.toObject(), type: 'event' });
                    const costDetails = event.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                    const inventories = await Inventory.find({ quote_id: event._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                if (farmOrchardWinery) {
                    quotations.push({ ...farmOrchardWinery.toObject(), type: 'farm-orchard-winery' });
                    const costDetails = farmOrchardWinery.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                    const inventories = await Inventory.find({ quote_id: farmOrchardWinery._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                if (personalOrBusiness) {
                    quotations.push({ ...personalOrBusiness.toObject(), type: 'personal-or-business' });
                    const costDetails = personalOrBusiness.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                    const inventories = await Inventory.find({ quote_id: personalOrBusiness._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                if (disasterRelief) {
                    quotations.push({ ...disasterRelief.toObject(), type: 'disaster-relief' });
                    const costDetails = disasterRelief.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                    const inventories = await Inventory.find({ quote_id: disasterRelief._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                if (construction) {
                    quotations.push({ ...construction.toObject(), type: 'construction' });
                    const costDetails = construction.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                    const inventories = await Inventory.find({ quote_id: construction._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                if (recreationalSite) {
                    quotations.push({ ...recreationalSite.toObject(), type: 'recreational-site' });
                    const costDetails = recreationalSite.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }

                    const inventories = await Inventory.find({ quote_id: recreationalSite._id }).select('qrId');
                    quotations[0].inventories = inventories;
                }
                return quotations;
            });

            if (quotations.length === 0) {
                return apiResponse.notFoundResponse(res, 'Quotation not found');
            }

            return apiResponse.successResponseWithData(
                res,
                "Quotation retrieved successfully",
                {
                    quotation: quotations[0],
                }
            );
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.quotatByIdAndType = async (req, res) => {
    try {
        const { quotationId, quotationType } = req.query;
        const quoteModel = require(`../../models/${quotationType}/${quotationType}.schema`);
        const quotation = await quoteModel.find({
            _id: quotationId,
        });

        if (!quotation) {
            return apiResponse.ErrorResponse(res, "Quotation not found");
        }

        return apiResponse.successResponseWithData(
            res,
            "Quotation retrieved successfully",
            quotation
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.cancelQuotation = async (req, res) => {
    try {
        const { quotationId, quotationType } = req.body;

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

        quotation.status = 'cancelled';

        await quotation.save();

        return apiResponse.successResponse(res, "Quotations canceled");
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
