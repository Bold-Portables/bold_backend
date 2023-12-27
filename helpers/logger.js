var {createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

var logger = createLogger({
	format: format.combine(
		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
		format.prettyPrint()		
	),
	transports: [
		new (transports.Console)({ json: true, timestamp: true }),
		new transports.DailyRotateFile({ filename: "logs/debug-%DATE%.log", json: false })
	],
	exceptionHandlers: [
		new (transports.Console)({ json: false, timestamp: true }),
		new transports.DailyRotateFile({ filename: "logs/exceptions-%DATE%.log", json: false }),
	],
	exitOnError: false
});

module.exports = logger;