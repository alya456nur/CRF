const path = require('path');

module.exports = {
    entry: './src/index.js', // Main JS file
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
};