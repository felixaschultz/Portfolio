const React = require('react');
const ReactDOMServer = require('react-dom/server');
const App = require('../modules/App').default;
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    fs.readFile(path.resolve('./index.html'), 'utf-8', (err, data) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        const app = ReactDOMServer.renderToString(<App />);

        res.setHeader('Content-Type', 'text/html');
        res.send(data.replace('<div id="app"></div>', `<div id="app">${app}</div>`));
    });
};