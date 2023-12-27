const Inventory_management = require('../../models/inventory_management/inventory_management.schema');
const apiResponse = require("../../helpers/apiResponse");
const Inventory_type = require('../../models/inventory_types/inventory_types.schema');

// POST /inventory/save-type
// POST /inventory/save-type
async function saveTypeDetails(req, res) {
    try {
        const { types } = req.body;
        if (!types) {
            return apiResponse.validationError(res, 'Types field is required');
        }
        const inventoryType = await Inventory_type.create({ types });
        return apiResponse.successResponseWithData(res, "Inventory type saved successfully", inventoryType);
    } catch (error) {
        return apiResponse.ErrorResponse(res, 'Internal server error');
    }
}

// GET /inventory/get-type-list
async function getTypeDetails(req, res) {
    try {
        const inventoryTypes = await Inventory_type.find();
        return apiResponse.successResponseWithData(res, "Inventory types retrieved successfully", inventoryTypes);
    } catch (error) {
        return apiResponse.ErrorResponse(res, 'Internal server error');
    }
}

// PUT /inventory/edit-type-list/:id
async function updateTypeDetails(req, res) {
    try {
        const { id } = req.params;
        const { types } = req.body;
        const updatedInventoryType = await Inventory_type.findByIdAndUpdate(id, { types }, { new: true });
        if (!updatedInventoryType) {
            return apiResponse.notFoundResponse(res, 'Inventory type not found');
        }
        return apiResponse.successResponseWithData(res, "Inventory type updated successfully", updatedInventoryType);
    } catch (error) {
        return apiResponse.ErrorResponse(res, 'Internal server error');
    }
}

// DELETE /inventory/delete-type-list/:id
async function deleteTypeDetails(req, res) {
    try {
        const { id } = req.params;
        const deletedInventoryType = await Inventory_type.findByIdAndRemove(id);
        if (!deletedInventoryType) {
            return apiResponse.notFoundResponse(res, 'Inventory type not found');
        }
        return apiResponse.successResponse(res, "Inventory type deleted successfully");
    } catch (error) {
        return apiResponse.ErrorResponse(res, 'Internal server error');
    }
}

// POST /inventory/save-category
async function saveCategoryDetails(req, res) {
    try {
        const { category } = req.body;
        if (!category) {
            return apiResponse.validationError(res, 'Category field is required');
        }
        const inventoryCategory = await Inventory_management.create({ category });
        return apiResponse.successResponseWithData(res, "Inventory category saved successfully", inventoryCategory);
    } catch (error) {
        return apiResponse.ErrorResponse(res, 'Internal server error');
    }
}

// GET /inventory/get-category-list
async function getCategoryDetails(req, res) {
    try {
        const inventoryCategories = await Inventory_management.find();
        return apiResponse.successResponseWithData(res, "Inventory categories retrieved successfully", inventoryCategories);
    } catch (error) {
        return apiResponse.ErrorResponse(res, 'Internal server error');
    }
}

// PUT /inventory/edit-category-list/:id
async function updateCategoryDetails(req, res) {
    try {
        const { id } = req.params;
        const { category } = req.body;
        const updatedInventoryCategory = await Inventory_management.findByIdAndUpdate(
            id,
            { category },
            { new: true }
        );
        if (!updatedInventoryCategory) {
            return apiResponse.notFoundResponse(res, 'Inventory category not found');
        }
        return apiResponse.successResponseWithData(res, "Inventory category updated successfully", updatedInventoryCategory);
    } catch (error) {
        return apiResponse.ErrorResponse(res, 'Internal server error');
    }
}

// DELETE /inventory/delete-category-list/:id
async function deleteCategoryDetails(req, res) {
    try {
        const { id } = req.params;
        const deletedInventoryCategory = await Inventory_management.findByIdAndRemove(id);
        if (!deletedInventoryCategory) {
            return apiResponse.notFoundResponse(res, 'Inventory category not found');
        }
        return apiResponse.successResponse(res, "Inventory category deleted successfully");
    } catch (error) {
        return apiResponse.ErrorResponse(res, 'Internal server error');
    }
}

module.exports = {
    saveTypeDetails,
    getTypeDetails,
    updateTypeDetails,
    deleteTypeDetails,
    saveCategoryDetails,
    getCategoryDetails,
    updateCategoryDetails,
    deleteCategoryDetails,
};
