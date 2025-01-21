import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import {
  WalletProvider,
  useWallet,
  ConnectButton,
  addressEllipsis,
} from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css'; // Ensure Suiet styles are included

import { Transaction } from '@mysten/sui/transactions';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const AdminConfig = {
  address: '0x65cf341ef4886d78efbd78b7b1eec6b14087e12c49ccb65654133b6745dfcf7c',
  coinType: '0xfb218dc3bc933a9f9b5fdd65eec5af14d1a67e5d7785859c59c6c8ecee5811c1::ITBToken::ITBTOKEN',
};

const App = () => {
  const [ethAddress, setEthAddress] = useState(null);
  const [amount, setAmount] = useState('');
  const [suiPrivateKey, setSuiPrivateKey] = useState('');
  const [status, setStatus] = useState('');
  const [suiAddress, setSuiAddress] = useState(null);
  const [transferType, setTransferType] = useState('eth-to-sui'); // Default transfer type


  const wallet = useWallet();
  const connectEthWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setEthAddress(accounts[0]);
      } else {
        alert('MetaMask is not installed. Please install it to proceed.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };
  const mergeCoin = async (suiPrivateKey) => {
    try {
      const keypair = Ed25519Keypair.fromSecretKey(suiPrivateKey)
      const client = new SuiClient({
        url: getFullnodeUrl('devnet'),
      });
      const coins = await client.getCoins({
        owner: wallet.account.address,
        coinType: AdminConfig.coinType,
      })
      let coinsArray = []
      for (const coin of coins.data) {
        coinsArray.push(coin.coinObjectId)
      }
      if (coinsArray.length === 0) {
        console.log('No coins found');
        return;
      }

      if (coinsArray.length === 1) {
        console.log('One coin, not need merge');
        return;
      }
      const lastCoin = coinsArray[coinsArray.length - 1];
      coinsArray.pop();


      const tx = new Transaction();
      tx.mergeCoins(lastCoin, coinsArray);
      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
      });
      console.log({ result });


    } catch (error) {
      console.error("Error sending transaction:", error);
      setStatus('Transaction failed');
    }
  }

  const transferCoin = async (amount, recipientAddress, suiPrivateKey) => {
    if (!wallet.connected) {
      setStatus('Please connect to Suiet Wallet');
      return;
    }
    try {
      const keypair = Ed25519Keypair.fromSecretKey(suiPrivateKey);
      const client = new SuiClient({
        url: getFullnodeUrl('devnet'),
      });
      const coins = await client.getCoins({
        owner: wallet.account.address,
        coinType:AdminConfig.coinType,
      })

      const decimals = 9;
      const amountDecimal = amount * 10 ** decimals

      const tx = new Transaction();
      const coin = tx.splitCoins(coins.data[0].coinObjectId, [amountDecimal]);
      tx.transferObjects([coin], recipientAddress);
        const result = await client.signAndExecuteTransaction({
            signer: keypair,
            transaction: tx,
        });
        console.log({ result });
    } catch (error) {
        console.error('Error getting coins:', error);
    }
  }

  const sui_to_eth = async (amount, recipientAddress) => {
    try {
      const client = new SuiClient({
        url: getFullnodeUrl('devnet'),
      });
      const coins = await client.getCoins({
        owner: AdminConfig.address,
        coinType: AdminConfig.coinType,
      })

      const decimals = 9;
      const amountDecimal = amount * 10 ** decimals
      let coin_to_burn;
      for (const coin of coins.data) {
        const txn = await client.getObject({
          id: coin.coinObjectId,
          options: { showContent: true },
        });
        if (txn.data.content.fields['balance'] == amountDecimal) {
          coin_to_burn = txn.data.content.fields['id'].id;
          break;
        }
      }
      console.log(coin_to_burn);
      const backendUrl = 'http://localhost:5000/Sui_to_Eth'; // Backend API URL
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coin_id: coin_to_burn,
          recipientAddress: recipientAddress,
          amount: amount,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Successfully transfered ${amount} IBT to ${recipientAddress}`);
      } else {
        alert('Error transfering tokens: ' + data.message);
      }

    } catch (error) {
      console.error("Error sending transaction:", error);
      setStatus('Transaction failed');
    }
  }

  const handleTransaction = async (amount, suiPrivateKey) => {
    if (!wallet.connected) {
      setStatus('Please connect to Suiet Wallet');
      return;
    }
    const recipientAddress = ethAddress; // Replace with the recipient's address
    mergeCoin(suiPrivateKey);
    transferCoin(amount, AdminConfig.address, suiPrivateKey);
    sui_to_eth(amount,recipientAddress);

  };

  const handleEth_to_Sui = async (amount) => {
    try {
      const backendUrl = 'http://localhost:5000/Eth_to_Sui'; // Backend API URL
      const recipient = wallet.account.address;
      const fromAddress = ethAddress;
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientAddress: recipient,
          fromAddress: fromAddress,
          amount: amount,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully transfered ${amount} IBT to ${recipient}`);
      } else {
        alert('Error transfering tokens: ' + data.message);
      }
    } catch (error) {
      console.error('Error tranfering:', error);
    }
  }

  // Update SUI wallet address after connection
  useEffect(() => {
    if (wallet.connected && wallet.account?.address) {
      setSuiAddress(wallet.account.address);
    }
  }, [wallet.connected, wallet.account]);

  return (
      <WalletProvider>
        <Router>
          <div className="container">
            <Routes>
              <Route path="" element={<h1>Welcome to IBT Token Management</h1>} />
            </Routes>

            <div>
              {/* Ethereum Wallet Connect */}
              <div>
                <button className="connect-btn" onClick={connectEthWallet}>
                  Connect Ethereum Wallet
                </button>
                <p>
                  <strong>Ethereum Wallet Address:</strong>{' '}
                  <span>{ethAddress || 'Not Connected'}</span>
                </p>
              </div>

              {/* SUI Wallet Connect */}
              <div>
                <div className='sui-connect-btn'>
                  <ConnectButton/>
                </div>
                <p>
                  <strong>SUI Wallet Address:</strong>{' '}
                  <span>{suiAddress || 'Not Connected'}</span>
                </p>
              </div>
              <h3>Select Transfer Type</h3>
              <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value)}
              >
                <option value="eth-to-sui">ETH to SUI</option>
                <option value="sui-to-eth">SUI to ETH</option>
              </select>

              {/* Conditional Rendering Based on Transfer Type */}
              {transferType === 'eth-to-sui' && (
                  <div>
                    <h4>Transfer ETH to SUI</h4>
                    <label htmlFor="eth-to-sui-amount">Amount:</label>
                    <input
                        type="number"
                        id="eth-to-sui-amount"
                        placeholder="Enter ETH amount"
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <button className="transfer-btn" onClick={() => handleEth_to_Sui(amount)}>
                      Transfer to SUI
                    </button>
                  </div>
              )}

              {transferType === 'sui-to-eth' && (
                  <div>
                    <h4>Transfer SUI to ETH</h4>
                    <label htmlFor="sui-private-key">Private Key:</label>
                    <input
                        type="text"
                        id="sui-private-key"
                        placeholder="Enter private key"
                        onChange={(e) => setSuiPrivateKey(e.target.value)}
                    />
                    <label htmlFor="sui-amount">Amount:</label>
                    <input
                        type="number"
                        id="sui-amount"
                        placeholder="Enter amount"
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <button className="transfer-btn" onClick={() => handleTransaction(amount, suiPrivateKey)}>
                      Transfer to ETH
                    </button>
                    {status && <p>{status}</p>}
                  </div>
              )}
            </div>
          </div>
        </Router>
      </WalletProvider>
  );
};

export default App;
