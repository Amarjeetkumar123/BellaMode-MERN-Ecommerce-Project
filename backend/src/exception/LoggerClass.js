// Per-function debug tracer (JS port of pronnelbackend/api/exception/LoggerClass.ts).
// Usage in a DAO/service function:
//   const loggerClass = new LoggerClass('saveProduct::', arguments);
//   ... do work ...
//   loggerClass.writeDebugLogs(result);
// When the log level is `debug`, it emits { INPUT, OUTPUT, TIMETAKEN } for the call;
// at higher levels it is a no-op, so instrumenting every function is cheap.
const { performance } = require('perf_hooks');
const logger = require('../config/logger');

class LoggerClass {
    constructor(functionName, functionArguments) {
        this.functionName = functionName;
        this.startTime = performance.now();
        // Only capture (potentially large) inputs when we'll actually print them.
        if (logger.isDebugEnabled()) {
            this.functionArguments = functionArguments;
        }
    }

    writeDebugLogs(outputParams) {
        if (!logger.isDebugEnabled()) return;
        const output = this.isPrintable(outputParams) ? outputParams : {};
        logger.debug(this.functionName, {
            INPUT: this.functionArguments,
            OUTPUT: output,
            TIMETAKEN: Math.round(performance.now() - this.startTime),
        });
    }

    // Guards against dumping non-serializable values (Mongoose docs cast fine via inspect,
    // but streams/functions etc. are skipped).
    isPrintable(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return true;
        if (Number.isFinite(value)) return true;
        if (value instanceof Map || value instanceof Set) return true;
        if (value.constructor === Array.prototype.constructor) return true;
        if (value.constructor === Object.prototype.constructor) return true;
        // Mongoose documents / query results are objects too — allow them through.
        if (typeof value === 'object') return true;
        return false;
    }
}

module.exports = { LoggerClass };
