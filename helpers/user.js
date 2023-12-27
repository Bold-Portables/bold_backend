const User = require('../models/user/user.schema');
const mailer = require('./nodemailer');
const bcrypt = require('bcrypt');

function generateRandomPassword(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
  
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
  
    return result;
}

  
exports.createUser = async (userData) => {
    try {
        const { name, email, cellNumber } = userData;
        const tempPassword = generateRandomPassword(8);
        // Hash the temporary password
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Set your password',
            text: `Hi ${name},\n\nYour username is ${email}, and temprory password is ${tempPassword}. You may reset your password by logging in to account\n\nThanks,\nBold Portable Team`
        };

        const existingUser = await User.findOne({ email });

        if (existingUser) {

            const mailOptionsForExistingUser = {
                from: process.env.MAIL_FROM,
                to: email,
                subject: 'Thank You for Your Quotation',
                html: `
                  <html>
                  <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px;">
                    <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <h1 style="color: #333; margin-bottom: 20px;">Hi ${name},</h1>
                      <p style="color: #555; margin-bottom: 20px;">
                        Thank you for choosing Bold Portable for your quotation. We appreciate your interest in our services.
                        Our team is working diligently to provide you with the best possible solution for your needs.
                      </p>
                      <p style="color: #555; margin-bottom: 20px;">
                        If you have any questions or need further assistance, please don't hesitate to reach out to us.
                        We are here to help you throughout the process.
                      </p>
                      <p style="color: #555; margin-bottom: 20px;">
                        We look forward to serving you and providing you with a seamless experience.
                      </p>
                      <p style="color: #555;">Best regards,</p>
                      <p style="color: #555;">Bold Portable Team</p>
                    </div>
                  </body>
                  </html>
                `
            };
              
            mailer.sendMail(mailOptionsForExistingUser);
            return { error: false, message: "User exist", user: existingUser };
        }

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            mobile: cellNumber,
            user_type: 'USER'
        });

        const createdUser = await newUser.save();

        if (createdUser) {
            mailer.sendMail(mailOptions);

            return { error: false, message: "User created", user: newUser };
        } else {
            return { error: true, message: 'User not created' };
        }        
    } catch (error) {
        if (error.code === 11000 && error.keyPattern) {
            const fields = Object.keys(error.keyPattern).join(', ');
            return { error: true, message: `Duplicate key error. The combination of ${fields} already exists.` };
        }
        return { error: true, message: error.message };
    }
};