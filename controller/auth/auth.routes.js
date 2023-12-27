const router = require('express').Router();
const authController = require('./auth.controller');
const { userValidationRules, loginValidationRules, passwordValidationRules, nameValidationRules } = require('./auth.schema')
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');
const upload = require('../../helpers/multer');
const apiResponse = require("../../helpers/apiResponse");
const multer = require("multer");

// login for existing users
router.post('/login', loginValidationRules(), validate, authController.loginUser);

//register a new user
router.post('/register', userValidationRules(), validate, authController.registerUsers);

///Get specific User Details
router.get('/get-specific-user/:id', checkAuth, authController.specificUserDetails);

//get the list of all user
router.get('/get-all-users', authController.getListAllUsers)

//update User profile
router.post('/update-user-profile', checkAuth, authController.updateProfile)

//Update User Profile Image
router.put('/update-profile-image', checkAuth, upload.single("profile_picture"), authController.updateProfileImage)

router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return apiResponse.validationError(res, " File is too large");
        }

        if (error.code === "LIMIT_FILE_COUNT") {
            return apiResponse.validationError(res, "File limit reached");
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return apiResponse.validationError(res, "File type not supported!");
        }
    }
});

// sent otp to user
router.post('/send-otp', authController.sendOtp);

// reset password
router.post('/reset-password', authController.resetPassword);

router.post('/send-phone-otp', authController.sendPhoneOtp);
router.post('/verify-phonne', authController.verifyPhoneOtp);


module.exports = router;