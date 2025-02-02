const mongoose = require('mongoose');

const ConnectToDB = (url) => {
    if (!url) return;
    try {
        mongoose
            .connect(process.env.DB_URL)
            .then(() => console.log("Databse Connected"))
            .catch((err) => console.error("MongoDB Connection Error:", err));
    } catch (error) {
        console.log(`Error occurred: ${err}`);
    }
};

module.exports = ConnectToDB;
