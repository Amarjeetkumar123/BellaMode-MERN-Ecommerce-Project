// Winston application logger (adapted from pronnelbackend/api/config/logger.js).
// Level is env-driven: CONSOLE_LOG_TYPE for the console, FILE_LOG_TYPE for the file.
const { createLogger, format, transports } = require('winston');
const util = require('util');

const { combine, splat, timestamp, printf, colorize } = format;

const CONSOLE_LEVEL = process.env.CONSOLE_LOG_TYPE || 'info';
const FILE_LEVEL = process.env.FILE_LOG_TYPE || 'error';

// `2024-… [info] : message {metadata}` — metadata objects are pretty-inspected.
const lineFormat = printf(({ level, message, timestamp: ts, ...metadata }) => {
    let msg = `${ts} [${level}] : ${message} `;
    if (metadata && Object.keys(metadata).length) {
        msg += util.inspect(metadata, { depth: 5, breakLength: Infinity, compact: true });
    }
    return msg;
});

const logger = createLogger({
    level: CONSOLE_LEVEL,
    format: combine(splat(), timestamp(), lineFormat),
    transports: [
        new transports.Console({ level: CONSOLE_LEVEL, format: combine(colorize({ all: true }), splat(), timestamp(), lineFormat) }),
        new transports.File({ filename: 'log.out', level: FILE_LEVEL }),
    ],
});

// Slow-query helper (mirrors pronnel): in debug, log every query; otherwise only slow ones.
logger.logQuery = function logQuery(modelName, queryString, timeTakenInMs) {
    if (CONSOLE_LEVEL === 'debug') {
        logger.debug(`Runtime of ${modelName} in MS: ${timeTakenInMs} Query: ${queryString}`);
    } else if (timeTakenInMs > 100) {
        logger.info(`Runtime of ${modelName} in MS: ${timeTakenInMs} Query: ${queryString}`);
    }
};

module.exports = logger;
