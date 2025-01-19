import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { WalletProvider, useWallet as useSuiWallet, ConnectButton, addressEllipsis} from '@suiet/wallet-kit';
import EthTokenPage from './EthTokenPage';
import SuiTokenPage from './SuiTokenPage';

const App = () => {
    const [ethAddress, setEthAddress] = useState(null);
    const [suiAddress, setSuiAddress] = useState(null);

    const [amount, setAmount] = useState(0);

    const wallet = useSuiWallet();
    // Function to connect to MetaMask and fetch Ethereum wallet address
    const connectEthWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setEthAddress(accounts[0]);
            } else {
                alert('MetaMask is not installed. Please install it to proceed.');
            }
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    };

    const connectSuiWallet = async () => {
        return;
    };
    // Function to get the connected SUI wallet address
    const { connected, account } = useSuiWallet();

    useEffect(() => {
        if (connected && account?.address) {
            setSuiAddress(account.address);
        }
    }, [connected, account]);

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


    return (
        <WalletProvider>
            <Router>
                <div>
                    <h1>Welcome to IBT Token Management</h1>
                    {/*<nav>*/}
                    {/*    <ul>*/}
                    {/*        <li>*/}
                    {/*            <Link to="/">Home</Link>*/}
                    {/*        </li>*/}
                    {/*        <li>*/}
                    {/*            <Link to="/eth">ETH Wallet Connect</Link>*/}
                    {/*        </li>*/}
                    {/*        <li>*/}
                    {/*            <Link to="/sui">SUI Wallet Connect</Link>*/}
                    {/*        </li>*/}
                    {/*    </ul>*/}
                    {/*</nav>*/}

                    <Routes>
                        <Route path="/sui" element={<SuiTokenPage />} />
                        <Route path="/eth" element={<EthTokenPage />} />
                        <Route path="/"/>
                    </Routes>
                </div>

                {/* Transfer Section */}
                <div>
                    <h3>Transfer Tokens</h3>
                    <div>
                        <button onClick={connectEthWallet}>Connect Ethereum Wallet</button>
                        <p>
                            <strong>Ethereum Wallet Address:</strong>{' '}
                            {ethAddress || 'Not Connected'}
                        </p>
                    </div>
                    <div>
                        <ConnectButton onClick={connectSuiWallet()}>Connect SUI Wallet</ConnectButton>
                    </div>

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

                    {/* SUI to ETH Transfer*/}
                    <div>
                        <label htmlFor="sui-to-eth-amount">Amount to Transfer (SUI to ETH):</label>
                        <input
                            type="number"
                            id="sui-to-eth-amount"
                            placeholder="Enter SUI amount"
                            onChange={(e) => setAmount(e.target.value)} // Capture the input value
                        />
                        <button>Transfer to ETH</button>
                    </div>
                </div>
            </Router>
        </WalletProvider>
    );
};

export default App;
