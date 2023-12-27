const router = require('express').Router();
const adminEmailController = require('./adminEmail.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

router.post('/send', checkAuth, hasRole('ADMIN'), adminEmailController.send);
router.post('/save', checkAuth, hasRole('ADMIN'), adminEmailController.save);
router.post('/update', checkAuth, hasRole('ADMIN'), adminEmailController.updateBySlug);
router.get('/list', checkAuth, hasRole('ADMIN'), adminEmailController.listAdminEmails);

module.exports = router;