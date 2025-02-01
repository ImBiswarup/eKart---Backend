const mongoose = require('mongoose');

const ConnectToDB = (url) => {
    if (!url) return;
    try {
        mongoose
            .connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then(() => console.log("MongoDB Connected"))
            .catch((err) => console.error("MongoDB Connection Error:", err));
    } catch (error) {
        console.log(`Error occurred: ${err}`);
    }
};

module.exports = ConnectToDB;
