// src/components/TransactionTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionTable.css';

const TransactionTable = ({ selectedMonth }) => {
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/products/transactions?month=${selectedMonth}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSearch = () => {
    fetchTransactions();
  };

  const handleClearSearch = () => {
    setSearchText('');
    fetchTransactions();
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, currentPage]);

  return (
    <div>
      <h2>Transaction Table</h2>
      <div>
        <div>
          <label>
            Search Transaction:
            <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <button onClick={handleSearch}>Search</button>
            <button onClick={handleClearSearch}>Clear Search</button>
          </label>
        </div>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Image</th>
              <th>Sold</th>
              <th>Date of Sale</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>{transaction.price}</td>
                <td>{transaction.category}</td>
                <td>
                  {transaction.image && <img src={transaction.image} alt="Transaction" style={{ maxWidth: '100px', maxHeight: '100px' }} />}
                </td>
                <td>{transaction.sold}</td>
                <td>{transaction.dateOfSale}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <button onClick={handlePrevPage}>Previous</button>
          <span>Page {currentPage}</span>
          <button onClick={handleNextPage}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
