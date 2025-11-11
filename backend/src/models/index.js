/**
 * Models Index
 * Central export for all models
 */

const User = require('./User');
const Settings = require('./Settings');
const SearchHistory = require('./SearchHistory');
const Log = require('./Log');

module.exports = {
    User,
    Settings,
    SearchHistory,
    Log
};
