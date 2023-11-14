// src/components/TransactionStatistics.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionStatistics.css'

const TransactionStatistics = ({ selectedMonth }) => {
  const [statistics, setStatistics] = useState({
    totalAmountOfSale: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/products/statistics?month=${selectedMonth}`);
        const { totalPriceSold, totalSoldItems, totalNotSoldItems } = response.data.statistics;

        setStatistics({
          totalAmountOfSale: totalPriceSold || 0,
          totalSoldItems: totalSoldItems || 0,
          totalNotSoldItems: totalNotSoldItems || 0,
        });
      } catch (error) {
        console.error('Error fetching transaction statistics:', error);
      }
    };

    fetchStatistics();
  }, [selectedMonth]);

  return (
    <div>
      <h2>Transaction Statistics</h2>
      <div>
        <p>Total Amount of Sale: ${statistics.totalAmountOfSale.toFixed(2)}</p>
        <p>Total Sold Items: {statistics.totalSoldItems}</p>
        <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
      </div>
    </div>
  );
};

export default TransactionStatistics;
