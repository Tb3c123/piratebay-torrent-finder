/**
 * Validators Index
 * Central export point for all validators
 */

module.exports = {
    // Common validators
    common: require('./common'),
    
    // Domain-specific validators
    auth: require('./authValidator'),
    settings: require('./settingsValidator'),
    torrent: require('./torrentValidator')
};
