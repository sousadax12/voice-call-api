const twilio = require('twilio');

module.exports = async function (context, req) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
        context.res = {
            status: 500,
            body: 'Environment variables not set correctly',
        };
        return;
    }

    const client = new twilio(accountSid, authToken);

    try {
        const verifiedCallerIds = await client.outgoingCallerIds.list();

        const callPromises = verifiedCallerIds.map(async (callerId) => {
            return client.calls.create({
                url: 'http://demo.twilio.com/docs/voice.xml', // Replace with your desired XML or TwiML Bin URL
                to: callerId.phoneNumber,
                from: twilioPhoneNumber,
            });
        });

        const calls = await Promise.all(callPromises);

        context.res = {
            status: 200,
            body: `Calls initiated with SIDs: ${calls.map((call) => call.sid).join(', ')}`,
        };
    } catch (error) {
        context.log('Error initiating calls:', error);
        context.res = {
            status: 500,
            body: 'Failed to initiate calls',
        };
    }
};
