const router = require('express').Router();
const quotationsController = require('./saveCostQuotation.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

//Create Quotation for Constructions.
router.post('/save-cost-quotation', checkAuth, hasRole('ADMIN'), quotationsController.createCostManagement);

module.exports = router;