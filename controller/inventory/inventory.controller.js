const Inventory = require('../../models/inventory/inventory.schema');
const apiResponse = require("../../helpers/apiResponse");
const mailer = require("../../helpers/nodemailer");
const qrcode = require('qrcode');
const { v4: UUIDV4 } = require('uuid');
const Event = require('../../models/event/event.schema');
const FarmOrchardWinery = require('../../models/farm_orchard_winery/farm_orchard_winery.schema');
const PersonalOrBusiness = require('../../models/personalOrBusiness/personal_or_business_site.schema');
const DisasterRelief = require('../../models/disasterRelief/disasterRelief.schema');
const Construction = require('../../models/construction/construction.schema');
const RecreationalSite = require('../../models/recreationalSite/recreationalSite.schema');
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

exports.saveNewGeneratedQrCOde = async (req, res) => {
    try {
        const { productName, description, type, category, quantity, gender, intial_value } = req.body;

        const savedInventories = [];

        const lastInventory = await Inventory.findOne().sort({ createdAt: -1 }).limit(1);

        let lastQrId = lastInventory && lastInventory.qrId && !isNaN(lastInventory.qrId) ? lastInventory.qrId : 0;

        let qrId = parseInt(lastQrId) + 1;

        for (let i = 0; i < quantity; i++) {
            qrId = parseInt(qrId);
            // const uniqueId = await generateStrings();
            const paddedQrId = qrId.toString().padStart(4, '0');

            const scanningValue = `${productName}-${paddedQrId}-${type}-${category}-${gender}`;
            const formattedValue = `${process.env.APP_URL}/services/${scanningValue.replace(/\s/g, '')}`;
            // Create a new inventory instance
            const inventory = new Inventory({
                productName,
                description,
                category,
                quantity: 1, // Set quantity as 1 for each inventory
                gender,
                type,
                qrId: paddedQrId,
                qrCodeValue: formattedValue,
                intial_value: formattedValue,
                created_value: scanningValue,
                qrCode: await generateQRCode(formattedValue, paddedQrId) // Generate and assign unique QR code
            });

            // Save the inventory record
            const savedInventory = await inventory.save();
            savedInventories.push(savedInventory);

            qrId++;
        }

        return apiResponse.successResponseWithData(res, 'Inventories saved successfully', savedInventories);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.editGeneratedQrCOde = async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, description, type, category, gender } = req.body;

        const updatedInventory = await Inventory.findById(id);

        if (!updatedInventory) {
            return apiResponse.notFoundResponse(res, 'Inventory not found');
        }

        // Generate a new unique identifier
        const uniqueId = updatedInventory.qrId;

        const scanningValue = `${productName}-${uniqueId}-${type}-${category}-${gender}`;
        const formattedValue = scanningValue.replace(/\s/g, '');

        // Update the inventory properties
        updatedInventory.productName = productName;
        updatedInventory.description = description;
        updatedInventory.type = type;
        updatedInventory.category = category;
        updatedInventory.gender = gender;
        updatedInventory.qrCodeValue = formattedValue;

        // Generate the QR code image
        const qrCodeImage = await generateQRCode(scanningValue, uniqueId);
        updatedInventory.qrCode = qrCodeImage;

        // Save the updated inventory
        const savedInventory = await updatedInventory.save();

        return apiResponse.successResponseWithData(res, 'Inventory updated successfully', savedInventory);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.deleteNewGeneratedQrCOde = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedInventory = await Inventory.findByIdAndRemove(id);

        if (!deletedInventory) {
            return apiResponse.notFoundResponse(res, 'Inventory not found');
        }

        return apiResponse.successResponse(res, 'Inventory deleted successfully');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.getInventoryByQRCodeValue = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if the qrCodeValue is provided in the query parameters
        if (!id) {
            return apiResponse.errorResponse(res, 'Id is missing in the query parameters');
        }

        // Find the inventory based on the qrCodeValue
        const inventory = await Inventory.findOne({ created_value: id });
        // Check if the inventory with the given qrCodeValue exists
        if (!inventory) {
            return apiResponse.ErrorResponse(res, 'Inventory not found');
        }

        // Return the inventory data as a success response
        return apiResponse.successResponseWithData(res, 'Inventory found', inventory);
    } catch (error) {
        // Handle any errors that occur during the process
        return apiResponse.ErrorResponserrorResponse(res, error.message);
    }
};


// async function generateQRCode(scanningValue) {
//     try {
//         const formattedValue = scanningValue.replace(/\s/g, '');

//         // Generate QR code in SVG format
//         const qrCodeSVG = await qrcode.toString(formattedValue, { type: 'svg' });

//         return `data:image/svg+xml;utf8,${qrCodeSVG}`;
//     } catch (error) {
//         console.error('Error generating QR code:', error);
//         throw error;
//     }
// }

async function generateQRCode(scanningValue, additionalText=null) {
    try {
        const formattedValue = scanningValue.replace(/\s/g, '');

        // Generate QR code in SVG format
        let qrCodeSVG = await qrcode.toString(formattedValue, { type: 'svg' });

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(qrCodeSVG, 'image/svg+xml');
        const svgElement = xmlDoc.documentElement;
        svgElement.setAttribute('viewBox', '0 0 41 50');

        let modifiedSVG = new XMLSerializer().serializeToString(xmlDoc);

        if (additionalText) {
            modifiedSVG = await replaceLastOccurrence(modifiedSVG, '</svg>', `<text x="21" y="43" font-family="Arial" fill="#000000" font-size="5" text-anchor="middle" alignment-baseline="middle">${additionalText}</text></svg>`);
        }

        return `data:image/svg+xml;utf8,${modifiedSVG}`;


    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

async function replaceLastOccurrence(inputString, searchTerm, replacement) {
    const lastIndexOfTerm = inputString.lastIndexOf(searchTerm);

    if (lastIndexOfTerm === -1) {
        return inputString;
    }

    const modifiedString = inputString.substring(0, lastIndexOfTerm) + replacement +
        inputString.substring(lastIndexOfTerm + searchTerm.length);

    return modifiedString;
}


async function generateStrings() {
    const randomNumber = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
    const paddedString = randomNumber.toString().padStart(4, '0'); // Pad with leading zeros if needed
    return paddedString;
}


exports.getQrCodeDetails = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page number (default: 1)
        const limit = parseInt(req.query.limit) || 10; // Number of items per page (default: 10)

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Find inventory items with pagination
        const inventory = await Inventory.find()
            .skip(skip)
            .limit(limit)
            .exec();

        if (inventory.length === 0) {
            return apiResponse.notFoundResponse(res, 'Inventory not found');
        }

        return apiResponse.successResponseWithData(res, 'Inventory details', inventory);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.assignQrCodeToQuote = async (req, res) => {
    try {
        const { _ids, quoteId, quoteType } = req.body;

        // Find the inventories by IDs
        const inventories = await Inventory.find({ _id: { $in: _ids } });
        if (!inventories || inventories.length === 0) {
            return apiResponse.notFoundResponse(res, 'Inventories not found');
        }

        // Check if any inventory is already assigned to an active quotation
        const isAnyActive = inventories.some((inventory) => inventory.status === 'active');
        if (isAnyActive) {
            return apiResponse.ErrorResponse(res, 'One or more inventories are already assigned to an active quotation');
        }

        // Loop through each inventory and update the quote_id, quote_type, and status fields
        for (let i = 0; i < inventories.length; i++) {
            const inventory = inventories[i];
            // Update the quote_id, quote_type, and status fields
            inventory.quote_id = quoteId;
            inventory.quote_type = quoteType;
            inventory.status = 'active';

            // Append the quoteType and quoteId to the existing qrCodeValue
            // const updatedQrCodeValue = `${process.env.APP_URL}/services?quotationId=${quoteId}&quotationType=${quoteType}&qrId=${inventory._id}`;
            //Assinged QR code needs to be Modified
            // inventory.qrCode = await generateQRCode(decodeURIComponent(updatedQrCodeValue));
            // Update the qrCodeValue field with the updated QR code value
            // inventory.qrCodeValue = updatedQrCodeValue;

            // Save the updated inventory
            await inventory.save();
        }

        return apiResponse.successResponse(res, 'QR codes assigned and inventory updated');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.getQrCodesByStatus = async ({ query }, res) => {
    try {
        let { status, page, limit } = query;
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        const findQuery = status ? { status } : {};

        // Fetch the data without aggregation, using find(), skip(), and limit()
        const qrCodes = await Inventory.find(findQuery)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limitNumber)

        const totalCount = await Inventory.countDocuments(findQuery);

        if (!qrCodes || qrCodes.length === 0) {
            return apiResponse.notFoundResponse(res, 'No QR codes found');
        }

        return apiResponse.successResponseWithData(res, 'QR codes fetched successfully', {
            qrCodes,
            totalCount,
        });
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};




exports.getQrCodesByQuotation = async (req, res) => {
    try {
        const { quoteId, quoteType } = req.params;
        console.log(quoteId, quoteType)

        // Find QR codes with the provided quotation ID and quotation type
        const qrCodes = await Inventory.find({ quote_id: quoteId, quote_type: quoteType })
            .select('qrCode')
            .exec();

        if (!qrCodes || qrCodes.length === 0) {
            return apiResponse.notFoundResponse(res, 'No QR codes found for the given quotation');
        }

        return apiResponse.successResponseWithData(res, 'QR codes fetched successfully', qrCodes);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.revertQrCodeValue = async (req, res) => {
    try {
        const { quoteId, quoteType } = req.body;

        // Find the inventories with the provided quoteId and quoteType in the qrCodeValue
        const inventories = await Inventory.find({ qrCodeValue: { $regex: `${quoteType}-${quoteId}$` } });

        if (!inventories || inventories.length === 0) {
            return apiResponse.notFoundResponse(res, 'Inventories not found with the provided quoteId and quoteType');
        }

        // Loop through each inventory and revert the qrCodeValue
        for (let i = 0; i < inventories.length; i++) {
            const inventory = inventories[i];

            // Remove the provided quoteId and quoteType from the qrCodeValue
            const updatedQrCodeValue = inventory.qrCodeValue.replace(`-${quoteType}-${quoteId}`, '');

            // Generate and assign the updated QR code
            // inventory.qrCode = await generateQRCode(updatedQrCodeValue);

            // Update the qrCodeValue field with the updated QR code value
            inventory.qrCodeValue = updatedQrCodeValue;

            // Set the status of the inventory to "completed"
            inventory.status = 'completed';

            // Save the updated inventory
            await inventory.save();
        }

        return apiResponse.successResponse(res, 'QR codes reverted and inventory updated');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.changeStatusToPending = async (req, res) => {
    try {
        const { ids } = req.body;

        // Find the inventories with the provided IDs and status "completed"
        const inventories = await Inventory.find({ _id: { $in: ids }, status: 'completed' });

        if (!inventories || inventories.length === 0) {
            return apiResponse.notFoundResponse(res, 'No inventories found with the provided IDs and status "completed"');
        }

        // Loop through each inventory and change the status to "pending"
        for (let i = 0; i < inventories.length; i++) {
            const inventory = inventories[i];

            // Update the status to "pending"
            inventory.status = 'pending';

            // Save the updated inventory
            await inventory.save();
        }

        return apiResponse.successResponse(res, 'Status changed to "pending" for the selected inventories');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.getFilterDetails = async (req, res) => {
    try {
        const { category, type, gender, page, limit } = req.query;

        // Prepare the filter object based on the provided query parameters
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (type) {
            filter.type = type;
        }
        if (gender) {
            filter.gender = gender;
        }
        filter.status = 'pending'; // Add this line to filter by 'status' property with 'pending' value

        // Convert page and limit parameters to integers (with default values)
        const pageNo = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10; // Default to 10 items per page

        // Calculate the number of items to skip based on the page number and limit
        const skipItems = (pageNo - 1) * pageSize;

        // Find the matching inventory items based on the filter and apply pagination
        const filteredInventory = await Inventory.find(filter).skip(skipItems).limit(pageSize).sort({ updatedAt: -1 });

        return apiResponse.successResponseWithData(res, 'Filtered inventory items retrieved successfully', filteredInventory);
    } catch (error) {
        console.log(error.message);
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.autoAssignQrCodeToQuote = async (req, res) => {
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
                console.log('djkdjkd', quotation)
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

        let required_stuff = replaceWorkerType(quotation.workerTypes);

        function replaceWorkerType(workerTypes) {
            return workerTypes.includes('both') ? 'other' : workerTypes;
        }

        // console.log(required_stuff);

        let quantity = quotation.numUnits;
        const inventories = await Inventory.find();
        const modifiedProductTypes = quotation.productTypes.replace(/\s/g, "");
        const searchValues = [required_stuff, modifiedProductTypes];

        const matchingInventories = inventories.filter((inventory) =>
            inventory.status === 'pending' && searchValues.some((searchValue) => inventory.qrCodeValue.includes(searchValue))
        );
        const count = matchingInventories.length;
        console.log(count)
        if (count < quantity) {
            return apiResponse.ErrorResponse(res, 'Inventory does not have the number of product as asked by User');
        }
        else {
            // Extract the IDs from matchingInventories and store them in an array
            const inventoryIds = matchingInventories.map((inventory) => inventory._id);

            const inventoriesToUpdate = await Inventory.find({ _id: { $in: inventoryIds } });

            if (!inventoriesToUpdate || inventoriesToUpdate.length === 0) {
                return apiResponse.notFoundResponse(res, 'Inventories not found');
            }

            // Update only the first 'quantity' number of inventories in the inventoriesToUpdate array
            for (let i = 0; i < quantity; i++) {
                const inventory = inventoriesToUpdate[i];
                inventory.quote_id = quotationId;
                inventory.quote_type = quotationType;
                inventory.status = 'active';

                // Append the quoteType and quoteId to the existing qrCodeValue
                const updatedQrCodeValue = `${inventory.qrCodeValue}-${quotationType}-${quotationId}`;

                // Generate and assign the updated QR code
                // inventory.qrCode = await generateQRCode(updatedQrCodeValue);

                // Update the qrCodeValue field with the updated QR code value
                inventory.qrCodeValue = updatedQrCodeValue;

                // Save the updated inventory
                await inventory.save();
            }

            return apiResponse.successResponse(res, 'QR codes assigned and inventory updated');
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.findByQutationTypeAndId = async (req, res) => {
    try {
        const { quotationId, quotationType, page = 1, limit = 10 } = req.body;
        const searchString = "quotationId=" + quotationId + "&quotationType=" + quotationType

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

        const skip = (page - 1) * limit;

        const inventories = await Inventory.find({ qrCodeValue: { $regex: searchString, $options: "i" } })
            .skip(skip)
            .limit(limit);

        const totalItems = await Inventory.countDocuments({ qrCodeValue: { $regex: searchString, $options: "i" } });

        const totalPages = Math.ceil(totalItems / limit);

        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems
        };

        // Return the response with the inventories and pagination details
        return apiResponse.successResponseWithData(res, 'Records fetched successfully', { inventories, quotation, pagination });
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.reinitializeQrCodeValue = async (req, res) => {
    try {
        const { inventory_id } = req.body;

        const inventory = await Inventory.findOne({ _id: inventory_id });

        if (!inventory) {
            return apiResponse.notFoundResponse(res, 'Inventory not found');
        }

        inventory.status = "pending";
        inventory.quote_id = null;
        inventory.quote_type = null;

        await inventory.save();

        return apiResponse.successResponse(res, 'QR code value reverted to intial value');

    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.findByQrId = async (req, res) => {
    try {
        const { qrId, productName, gender, type, status, category, page = 1, limit = 10 } = req.query;

        let query = {};

        if (qrId) query.qrId = { $regex: new RegExp(qrId, 'i') };
        if (productName) query.productName = { $regex: new RegExp(productName, 'i') };
        if (gender) query.gender = { $regex: new RegExp(gender, 'i') };
        if (type) query.type = { $regex: new RegExp(type, 'i') };
        if (status) query.status = { $regex: new RegExp(status, 'i') };
        if (category) query.category = { $regex: new RegExp(category, 'i') };

        const skip = (page - 1) * limit;

        const inventories = await Inventory.find(query)
            .skip(skip)
            .limit(limit);

        const totalItems = await Inventory.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems
        };

        return apiResponse.successResponseWithData(res, 'Records fetched successfully', { inventories, pagination });
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};




