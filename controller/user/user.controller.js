const User = require('../../models/user/user.schema');
const apiResponse = require("../../helpers/apiResponse");
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mailer = require("../../helpers/nodemailer");

exports.updateProfile = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        const { name, mobile, address, password } = req.body;

        let update = { name, mobile, address };

        // Hash the new password if it exists
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            update.password = hashedPassword;
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id },
            update,
            { new: true }
        );

        if (updatedUser) {
            return apiResponse.successResponseWithData(res, "Data updated", updatedUser);
        } else {
            return apiResponse.ErrorResponse(res, "Profile not updated");
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }

};

exports.updateProfileImage = async (req, res) => {
    try {
        const { _id } = req.userData.user;

        if (!req.file) {
            return apiResponse.ErrorResponse(res, "No file found");
        }

        const user = await User.findById(_id);

        if (!user) {
            return apiResponse.notFoundResponse(res, "User not found");
        }

        // Delete old profile picture file if it exists
        if (user.profile_picture) {
            await fs.unlink(user.profile_picture).catch(err => {
                console.error("Failed to delete old profile picture file:", err);
            });
        }

        // Update user's profile picture
        user.profile_picture = req.file.path;
        const updatedUser = await user.save();

        if (updatedUser) {
            console.log("File uploaded successfully");
            return apiResponse.successResponseWithData(res, "User image uploaded successfully", updatedUser);
        } else {
            console.warn("Failed to update user profile picture");
            return apiResponse.ErrorResponse(res, "Failed to update user profile picture");
        }
    } catch (error) {
        console.error("Error updating profile image:", error);
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.sendMailToMultipleUser = async (req, res) => {
    try {
        const { emailList, subject, message } = req.body;

        // Check if emailList is provided and is an array
        if (!Array.isArray(emailList) || emailList.length === 0) {
            return apiResponse.ErrorResponse(res, 'Invalid emailList');
        }

        // Find users based on the provided email addresses
        // const users = await User.find({ email: { $in: emailList } });

        // if (!users || users.length === 0) {
        //     return apiResponse.notFoundResponse(res, 'Users not found');
        // }

        // Loop through each email address and send mail
        for (const userEmail of emailList) {
            const mailOptions = {
                from: process.env.MAIL_FROM,
                to: userEmail,
                subject,
                text: message
            };

            await mailer.sendMail(mailOptions);
        }

        return apiResponse.successResponseWithData(res, 'Emails sent successfully');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.findUsersByQuery = async (req, res) => {
    try {
        const query = req.query.query; // Access the query parameter from the request URL
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Check if query parameter is empty or not provided
        if (!query || query.trim() === '') {
            // Return the whole list of users
            const allUsers = await User.find({ user_type: { $ne: 'ADMIN' } })
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit);

            return apiResponse.successResponseWithData(res, "All Users", allUsers, allUsers.length);
        }

        const foundUsers = await findUsersByNameEmailOrMobile(query);

        if (foundUsers.length === 0) {
            return apiResponse.ErrorResponse(res, 'No users found');
        }

        return apiResponse.successResponseWithData(res, "Data Retrieved Successfully", foundUsers, foundUsers.length);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


// Function to find users based on name, email, or mobile
const findUsersByNameEmailOrMobile = async (query) => {
    const searchQuery = query.toLowerCase();

    const foundUsers = await User.find({
        $and: [
            {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } },
                    { mobile: { $regex: searchQuery, $options: 'i' } }
                ]
            },
            { user_type: { $ne: 'ADMIN' } }
        ]
    });

    return foundUsers;
};





