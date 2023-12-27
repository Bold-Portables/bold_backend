const router = require('express').Router();
const inventoryController = require('./inventory.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');
// save a new service
router.post('/create-inventory-details', checkAuth, hasRole('ADMIN'), inventoryController.saveNewGeneratedQrCOde);
router.put('/edit-inventory-details/:id', checkAuth, hasRole('ADMIN'), inventoryController.editGeneratedQrCOde);
router.delete('/delete-inventory-details/:id', checkAuth, hasRole('ADMIN'), inventoryController.deleteNewGeneratedQrCOde);
router.get('/show', inventoryController.getQrCodeDetails);
router.post('/assign-qrcode-to-quote', checkAuth, hasRole('ADMIN'), inventoryController.assignQrCodeToQuote);
router.get('/get-qr-code-details-status', checkAuth, hasRole('ADMIN'), inventoryController.getQrCodesByStatus);
router.get('/get-deatils-by-qr_code_value/:id', inventoryController.getInventoryByQRCodeValue);
router.get('/getQrCodesByQuotation/:quoteId/:quoteType', checkAuth, hasRole('ADMIN'), inventoryController.getQrCodesByQuotation);
router.post('/revert-qr-code-value', checkAuth, hasRole('ADMIN'), inventoryController.revertQrCodeValue);
router.post('/change-status-to-pending', checkAuth, hasRole('ADMIN'), inventoryController.changeStatusToPending);
router.get('/get-filter-details', checkAuth, hasRole('ADMIN'), inventoryController.getFilterDetails);
router.post('/auto-assign-qrcode-to-quote', checkAuth, hasRole('ADMIN'), inventoryController.autoAssignQrCodeToQuote);
router.post('/find-by-qrcodes-quote-type-id', checkAuth, hasRole('ADMIN'), inventoryController.findByQutationTypeAndId);
router.post('/reinitialize-qr-code-value', checkAuth, hasRole('ADMIN'), inventoryController.reinitializeQrCodeValue);
router.get('/list-by-qr-id', checkAuth, hasRole('ADMIN'), inventoryController.findByQrId);

module.exports = router;