const express = require('express');
const router = express.Router();
const app = express();


router.get('/', async (req, res) => {
   // Extract the key from the URL query parameters
  const key = req.query.key || '';

  // Render the HTML page with an input box pre-filled with the key
  res.send(`
    <html>
      <body>
        <form action="/submit" method="post">
          <label for="userKey">Key:</label>
          <input type="text" id="userKey" name="userKey" value="${key}" required>
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/submit', (req, res) => {
  // Handle the form submission
  const userKey = req.body.userKey || '';

  // Process the userKey as needed (e.g., store it in a database)

  // Send a response to the user
  res.send(`Submitted Key: ${userKey}`);
});



module.exports = router;
