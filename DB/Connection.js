const mongoose = require('mongoose');

const ConnectToDB = (url) => {
    if (!url) return;
    try {
        mongoose.connect(url)
            .then(() => {
                console.log("Connected to DB");
            })
    } catch (error) {
        console.log(`Error occurred: ${err}`);
    }
};

module.exports = ConnectToDB;
