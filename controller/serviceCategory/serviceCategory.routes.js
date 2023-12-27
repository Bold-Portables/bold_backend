const router = require('express').Router();
const serviceCategoryController = require('./serviceCategory.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

// save a new service
router.post('/save', checkAuth, hasRole('ADMIN'), serviceCategoryController.save);
router.post('/edit', checkAuth, hasRole('ADMIN'), serviceCategoryController.edit);
router.delete('/delete/:categoryId', checkAuth, hasRole('ADMIN'), serviceCategoryController.delete);
router.get('/list', checkAuth, hasRole('ADMIN'), serviceCategoryController.listAllWithPagination);

module.exports = router;