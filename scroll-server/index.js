const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.get('/ping', (req, res) => {
  res.status(200).send('Scroll server is alive!');
});

app.listen(port, () => {
  console.log(`Scroll server listening on port ${port}`);
});