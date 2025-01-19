import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';
import { fromHex } from '@mysten/bcs';

const App = () => {
  const [ethAddress, setEthAddress] = useState(null);
  const [amount, setAmount] = useState('');
  const [coinObjectId, setCoinObjectId] = useState('');
  const [suiPrivateKey, setSuiPrivateKey] = useState('');
  const [status, setStatus] = useState('');
  const [suiAddress, setSuiAddress] = useState(null);

  const wallet = useWallet();
  // Function to connect to MetaMask and fetch Ethereum wallet address
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
        coinType:"0x48413f341295b75b0f46b0ed253530972eef0ea7516f4a6fdb22a777f3b08901::ITBToken::ITBTOKEN"
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
        coinType:"0x48413f341295b75b0f46b0ed253530972eef0ea7516f4a6fdb22a777f3b08901::ITBToken::ITBTOKEN"
      })

      const tx = new Transaction();
      const coin = tx.splitCoins(coins.data[0].coinObjectId, [amount]);
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
  const handleTransaction = async (amount, suiPrivateKey) => {
    if (!wallet.connected) {
      setStatus('Please connect to Suiet Wallet');
      return;
    }
    const recipientAddress = '0x790c9af276e8d2067883d16428f41f26062a0cee250bbe0b46cb82951ef231de';  // Replace with the recipient's address
    mergeCoin(suiPrivateKey);
    const decimals = 9;
    const amountDecimal = amount * 10 ** decimals
    transferCoin(amountDecimal, recipientAddress, suiPrivateKey);

  };

  const handleEth_to_Sui = async (amount) => {
    try {
      const backendUrl = 'http://localhost:5000/Eth_to_Sui'; // Backend API URL
      const recipient = "0xa3e443abd11d108ead4df93ab2764d7724a440fa5d2760ee833e548a6123f4d0";
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
          <div>

            <Routes>
              <Route path="" element={<h1>Welcome to IBT Token Management</h1>} />
            </Routes>
          </div>

          {/* Transfer Section */}
          <div>
            <h3>Transfer Tokens</h3>

            {/* Ethereum Wallet Connect */}
            <div>
              <button onClick={connectEthWallet}>
                Connect Ethereum Wallet
              </button>
              <p>
                <strong>Ethereum Wallet Address:</strong>{' '}
                {ethAddress || 'Not Connected'}
              </p>
            </div>

            {/* SUI Wallet Connect */}
            <div>
              <ConnectButton />
              <p>
                <strong>SUI Wallet Address:</strong>{' '}
                {suiAddress || 'Not Connected'}
              </p>
              {/* ETH to SUI Transfer */}
              <div>
                <label htmlFor="eth-to-sui-amount">Amount to Transfer (ETH to SUI):</label>
                <input
                    type="number"
                    id="eth-to-sui-amount"
                    placeholder="Enter ETH amount"
                    onChange={(e) => setAmount(e.target.value)} // Capture the input value
                />
                <button onClick={() => handleEth_to_Sui(amount)}>Transfer to SUI</button>
              </div>
            </div>

            {/* SUI to SUI Transfer */}
            <div>
              <label htmlFor="sui-private-key">
                Private Key:
              </label>
              <input
                  type="text"
                  id="sui-private-key"
                  placeholder="Enter private key"
                  onChange={(e) => setSuiPrivateKey(e.target.value)}
              />
              <label htmlFor="sui-amount">
                Amount to Transfer (in MIST):
              </label>
              <input
                  type="number"
                  id="sui-amount"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
              />
              <button onClick={() => handleTransaction(amount, suiPrivateKey)}>
                Transfer SUI
              </button>
              {status && <p>{status}</p>}
            </div>
          </div>
        </Router>
      </WalletProvider>
  );
};

export default App;
