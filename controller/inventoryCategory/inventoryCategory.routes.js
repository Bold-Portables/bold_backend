const router = require('express').Router();
const inventoryCategoryController = require('./inventoryCategory.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');
// save a new serviceinventoryController
router.post('/save-category', checkAuth, hasRole('ADMIN'), inventoryCategoryController.saveCategoryDetails);
router.post('/save-type', checkAuth, hasRole('ADMIN'), inventoryCategoryController.saveTypeDetails);
router.get('/get-category-list', inventoryCategoryController.getCategoryDetails);
router.get('/get-type-list', inventoryCategoryController.getTypeDetails);
router.put('/edit-type-list/:id', checkAuth, hasRole('ADMIN'), inventoryCategoryController.updateTypeDetails);
router.put('/edit-category-list/:id', checkAuth, hasRole('ADMIN'), inventoryCategoryController.updateCategoryDetails);
router.delete('/delete-category-list/:id', checkAuth, hasRole('ADMIN'), inventoryCategoryController.deleteCategoryDetails);
router.delete('/delete-type-list/:id', checkAuth, hasRole('ADMIN'), inventoryCategoryController.deleteTypeDetails);

module.exports = router;