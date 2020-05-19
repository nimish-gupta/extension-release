const isNone = (val) => val === null || val === undefined;
const isNotNone = (val) => !isNone(val);

module.exports = { isNone, isNotNone };
