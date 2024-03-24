const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve your index.html file as a static file
app.use('/', express.static(path.join(__dirname, '.')));

app.listen(port, () => {
    console.log(`Documentation portal listening at http://localhost:${port}`);
});