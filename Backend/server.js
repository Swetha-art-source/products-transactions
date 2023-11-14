// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const uri = process.env.MongoURI;

// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// API to initialize the database
app.get('/initialize-database', async (req, res) => {
  try {
    // Fetch data from the third-party API
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;
    console.log(data);

    // Initialize the database with seed data
    await Transaction.insertMany(data);

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const productRoutes = require('./routes/Product');
app.use('/products', productRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
