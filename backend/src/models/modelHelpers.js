// Attaches millisecond create_date/update_date fields + a pre-save hook to a schema
// (pronnel timestamp convention — epoch numbers, not Mongoose Date timestamps).
function withMsTimestamps(schema) {
    schema.add({
        create_date: { type: Number, default: () => Date.now() },
        update_date: { type: Number, default: () => Date.now() },
    });
    schema.pre('save', function (next) {
        if (this.isNew && !this.create_date) this.create_date = Date.now();
        this.update_date = Date.now();
        next();
    });
    return schema;
}

module.exports = { withMsTimestamps };
