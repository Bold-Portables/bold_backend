const router = require('express').Router();
const userController = require('./user.controller');
const checkAuth = require('../../middleware/checkAuth');
const upload = require('../../helpers/multer');
const { hasRole } = require('../../middleware/checkRole');

router.post('/save-profile', checkAuth, hasRole('USER'), userController.updateProfile);
router.post('/save-image', checkAuth, hasRole('USER'), upload.single("profile_picture"), userController.updateProfileImage);
router.post('/send-mail-multi-user', checkAuth, hasRole('ADMIN'), userController.sendMailToMultipleUser);
router.get('/find-user', checkAuth, hasRole('ADMIN'), userController.findUsersByQuery);

module.exports = router;