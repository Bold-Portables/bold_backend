const router = require('express').Router();
const qrCodeController = require('./qrCode.controller');

//Create Quotation for Constructions.
router.get('/show', qrCodeController.showQRCode);
router.get('/download', qrCodeController.downloadQRCode);
router.get('/download-service-quotation', qrCodeController.downloadServiceQuotationQRCode);

module.exports = router;