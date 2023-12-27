const router = require('express').Router();
const trackingController = require('./tracking.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

router.post('/save-tracking', checkAuth, hasRole('ADMIN'), trackingController.saveTracking);
router.put('/update-tracking/:trackingId', checkAuth, hasRole('ADMIN'), trackingController.updateTracking);
router.get('/list', checkAuth, hasRole('ADMIN'), trackingController.getTrackingList);
router.get('/find-by-quotation', checkAuth, hasRole('USER'), trackingController.fetchTrackingList);
router.get('/find-by-id/:id', trackingController.getTrackingById);

module.exports = router;