const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');

const createPaymentIntent = async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
        });

        const qrCodeUrl = await QRCode.toDataURL(
            `upi://pay?pa=${process.env.MERCHANT_UPI_ID}&pn=${process.env.MERCHANT_NAME}&am=${amount / 100}&cu=${currency}&mode=02`
        );

        res.send({
            clientSecret: paymentIntent.client_secret,
            qrCodeUrl,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).send({ error: "Failed to create payment intent" });
    }
};


module.exports = { createPaymentIntent };
