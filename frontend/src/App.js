// src/App.js
import React, { useState } from 'react';
import TransactionTable from './components/Transaction/TransactionTable';
import TransactionStatistics from './components/Statistics/TransactionStatistics';


const App = () => {
  const [selectedMonth, setSelectedMonth] = useState('March');

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <div>
      <h1>Products   Application</h1>
      <div>
        <label>
          Select Month:
          <select value={selectedMonth} onChange={handleMonthChange}>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>
      </div>
      
      <TransactionTable selectedMonth={selectedMonth} />
      <TransactionStatistics selectedMonth={selectedMonth} />
    
    </div>
  );
};

export default App;
