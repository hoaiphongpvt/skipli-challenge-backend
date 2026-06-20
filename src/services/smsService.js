const { Vonage } = require('@vonage/server-sdk');
const { Channels } = require('@vonage/messages');

const vonage = new Vonage(
 {
 apiKey: 'b79eecd9',
 apiSecret: process.env.VONAGE_API_SECRET,
 }
);

exports.sendSMS = () => { vonage.messages.send({
 messageType: 'text',
 channel: Channels.SMS,
 text: 'This is an SMS text message sent using the Vonage Messages API',
 to: "84855559851",
 from: "Vonage APIs",
})
 .then(({ messageUUID }) => console.log(messageUUID))
 .catch((error) => console.error(error));
}
