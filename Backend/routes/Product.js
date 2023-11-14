// routes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Transaction = require('../models/Transaction');

// API to list all transactions

router.get('/transactions', async (req, res) => {
    try {
        const { page = 1, perPage = 10, search, month } = req.query;
    
        // Constructing the query based on search and month parameters
        const query = {};

        if (month) {
            // Convert month name to its corresponding numerical value
            const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;

            // Use the $expr and $eq operators to match the month
            query.$expr = { $eq: [{ $month: '$dateOfSale' }, monthNumber] };
        }

    
        if (search) {
          // Constructing the $or query properly
          const searchAsNumber = parseFloat(search);
          const searchRegex = new RegExp(search, 'i');
          query.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { price: !isNaN(searchAsNumber) ? searchAsNumber : null },
          ];
        }
    
        // Apply pagination
        const transactions = await Transaction.find(query)
          .skip((page - 1) * perPage)
          .limit(parseInt(perPage));

          console.log('Query:', query);
          console.log('Number of Documents:', transactions.length);

          if (transactions.length === 0) {
            return res.status(404).json({ message: 'No items found' });
          }
    
        res.status(200).json(transactions);
        console.log('Query:', query);
        console.log('Number of Documents:', transactions.length);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

router.get('/statistics', async (req, res) => {
  try {
    // Extract the month query parameter from the request
    const month = req.query.month;

    // Check if the month parameter is provided
    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required' });
    }

    console.log('Requested Month:', month);

    // Parse month parameter to case-insensitive regex for MongoDB query
    const monthRegex = new RegExp(`^${month}$`, 'i');

    // Use MongoDB aggregation to calculate statistics for the specified month
    const result = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: '$dateOfSale' }, new Date(month + '-01').getMonth() + 1]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPriceSold: { $sum: { $cond: { if: { $eq: ['$sold', true] }, then: '$price', else: 0 } } },
          totalSoldItems: { $sum: { $cond: { if: { $eq: ['$sold', true] }, then: 1, else: 0 } } },
          totalNotSoldItems: { $sum: { $cond: { if: { $eq: ['$sold', false] }, then: 1, else: 0 } } }
        }
      }
    ]);
    console.log(result)

    // Extract the result from the aggregation
    const statistics = result.length > 0 ? result[0] : { totalPrice: 0, totalSoldItems: 0, totalNotSoldItems: 0 };

    res.json({ statistics });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/barChart', async (req, res) => {
  try {
    const month = req.query.month;

    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required' });
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: '$dateOfSale' }, new Date(`${month}-01`).getMonth() + 1],
          },
        },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$price', 100] }, then: '0 - 100' },
                { case: { $lte: ['$price', 200] }, then: '101 - 200' },
                { case: { $lte: ['$price', 300] }, then: '201 - 300' },
                { case: { $lte: ['$price', 400] }, then: '301 - 400' },
                { case: { $lte: ['$price', 500] }, then: '401 - 500' },
                { case: { $lte: ['$price', 600] }, then: '501 - 600' },
                { case: { $lte: ['$price', 700] }, then: '601 - 700' },
                { case: { $lte: ['$price', 800] }, then: '701 - 800' },
                { case: { $lte: ['$price', 900] }, then: '801 - 900' },
                { case: { $gte: ['$price', 901] }, then: '901-above' },
              ],
              default: 'Unknown',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priceRange: '$_id',
          itemCount: '$count',
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

router.get('/pieChart', async (req, res) => {
  try {
    const month = req.query.month;

    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required' });
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: '$dateOfSale' }, new Date(`${month}-01`).getMonth() + 1],
          },
        },
      },
      {
        $group: {
          _id: '$category',
          itemCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          itemCount: 1,
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/combinedData', async (req, res) => {
  try {
    const month = req.query.month;

    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required' });
    }

    // Make requests to the three APIs in parallel
    const [statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
      axios.get(`http://localhost:5000/products/statistics?month=${month}`),
      axios.get(`http://localhost:5000/products/barChart?month=${month}`),
      axios.get(`http://localhost:5000/products/pieChart?month=${month}`),
    ]);

    // Extract data from the responses
    const statisticsData = statisticsResponse.data;
    const barChartData = barChartResponse.data;
    const pieChartData = pieChartResponse.data;

    // Combine the responses into a final JSON
    const combinedResponse = {
      statistics: statisticsData,
      barChart: barChartData,
      pieChart: pieChartData,
    };

    res.json(combinedResponse);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/transactions/:id', async (req, res) => {
    try {
        const id = req.params.id;

    // Convert the id to a number (assuming id is a number)
    const numericId = parseInt(id, 10);

    // Find a transaction with the provided numeric id
    const transaction = await Transaction.findOne({ id: numericId });
    
        if (!transaction) {
          return res.status(404).json({ error: 'Transaction not found' });
        }
    
        res.status(200).json(transaction);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

module.exports = router;
