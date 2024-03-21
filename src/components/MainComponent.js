// src/components/MainComponent.js
import React, { useEffect, useState } from 'react';
import web3 from '../utils/web3'; // Import Web3 instance

const MainComponent = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    // Fetch accounts from the local blockchain
    const fetchAccounts = async () => {
      const accs = await web3.eth.getAccounts();
      setAccounts(accs);
    };

    fetchAccounts();
  }, []);

  return (
    <div>
      <h1>Accounts:</h1>
      <ul>
        {accounts.map(account => (
          <li key={account}>{account}</li>
        ))}
      </ul>
    </div>
  );
};

export default MainComponent;
