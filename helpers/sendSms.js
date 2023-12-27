const ClickSend = require('clicksend');
const axios = require('axios');


const username = process.env.CLICKSEND_USERNAME;
const apiKey = process.env.CLICKSEND_KEY;

exports.sendSMS = async (number, text) => {
    const url = 'https://rest.clicksend.com/v3/sms/send';
    const to = number // Recipient phone number
    // const from = 'BoldPortable'; // Sender ID or phone number
    const body = text;

    try {
        const response = await axios.post(url, {
            messages: [
                {
                    source: 'sdk',
                    body: body,
                    to: to,
                    // from: from,
                },
            ],
        }, {
            auth: {
                username: username,
                password: apiKey,
            },
        });

        console.log('sent', response.data.data.messages);
    } catch (error) {
        console.error('error', error);
    }
};  
  