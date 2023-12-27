const router = require('express').Router();
const contactController = require('./contacts.controller');

// save a new service
router.post('/save', contactController.save);
router.post('/send-query', contactController.queryMail);
router.post('/send-custom-mail', contactController.sendCustomMail);

module.exports = router;