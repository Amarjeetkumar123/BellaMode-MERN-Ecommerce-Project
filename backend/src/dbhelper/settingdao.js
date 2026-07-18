const Setting = require('../models/setting.model');

// Returns the singleton settings doc, creating a default one if missing.
async function getSettings() {
    let settings = await Setting.findOne({ key: 'brand' });
    if (!settings) settings = await Setting.create({ key: 'brand' });
    return settings;
}

async function updateSettings(data) {
    return Setting.findOneAndUpdate(
        { key: 'brand' },
        { $set: { ...data, update_date: Date.now() } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
}

module.exports = { getSettings, updateSettings };
