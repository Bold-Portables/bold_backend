const twilio = require('twilio');

const accountSid = process.env.TWILLIO_SID;
const authToken = process.env.TWILLIO_TOKEN;
const fromPhone = process.env.TWILLIO_PHONE;

const client = twilio(accountSid, authToken);


exports.sendSMS = async (number, text) => {
    try {

        const message = await client.messages.create({
            body: text,
            from: fromPhone,
            to: number, // Updated recipient phone number
        });

        console.log(message.sid);
    } catch (error) {
        console.error(error);
    }
};

