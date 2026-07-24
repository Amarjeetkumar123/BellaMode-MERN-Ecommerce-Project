const Setting = require('../models/setting.model');
const { LoggerClass } = require('../exception/LoggerClass');

// Returns a store's settings doc, creating a default one if missing.
async function getSettings(storeId) {
    const loggerClass = new LoggerClass('getSettings::', arguments);
    let settings = await Setting.findOne({ store: storeId });
    if (!settings) settings = await Setting.create({ store: storeId });
    loggerClass.writeDebugLogs(settings);
    return settings;
}

async function updateSettings(storeId, data) {
    const loggerClass = new LoggerClass('updateSettings::', arguments);
    const settings = await Setting.findOneAndUpdate(
        { store: storeId },
        { $set: { ...data, store: storeId, update_date: Date.now() } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    loggerClass.writeDebugLogs(settings);
    return settings;
}

module.exports = { getSettings, updateSettings };
