const mongoose = require("mongoose");
const winston = require('winston')

const database = mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    if (process.env.NODE_ENV !== "test") {
        winston.info(`Child process: ${process.pid} is connected to DB`);
    } else {
        winston.info(`Server process: ${process.pid} is connected to DB`);
    }
})
    .catch(err => {
        winston.error("App starting error:" + err.message);
        process.exit(1);
    });

module.exports = database;