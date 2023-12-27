const router = require('express').Router();
const serviceController = require('./services.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

// save a new service
router.post('/save', checkAuth, hasRole('ADMIN'), serviceController.save);
router.get('/list', serviceController.getAllServices);
router.delete('/delete/:id', checkAuth, hasRole('ADMIN'), serviceController.deleteService);
router.put('/update/:id', checkAuth, hasRole('ADMIN'), serviceController.updateService);
router.post('/find-by-name', serviceController.getServiceByName);
router.post('/mail-acknowledgement', serviceController.mailServiceAcknowledgement);

module.exports = router;