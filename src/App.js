// App.js
import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { WalletProvider } from '@suiet/wallet-kit';
import EthTokenPage from "./EthTokenPage";
import SuiTokenPage from './SuiTokenPage';


const App = () => {
    const [ethAmount, setEthAmount] = useState('');
    const [suiAmount, setSuiAmount] = useState('');
    const [recipient, setRecipient] = useState('');

    const handleEthTransfer = async () => {};
    const handleSuiTransfer = async () => {};
    return (
        <WalletProvider>
            <Router>
                <div>
                    <h1>Welcome to IBT Token Management</h1>
                    <nav>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/sui">SUI Token Management</Link>
                            </li>
                            <li>
                                <Link to="/eth">ETH Token Management</Link>
                            </li>
                        </ul>
                    </nav>

                    <Routes>
                        <Route path="/sui" element={<SuiTokenPage />} />
                        <Route path="/eth" element={<EthTokenPage />} />
                        <Route
                            path="/"
                            element={<h2>Home Page: Welcome to the Token Management App!</h2>}
                        />
                    </Routes>

                    <div>
                        <h2>ETH to SUI / SUI to ETH Transfer</h2>

                        <div>
                            <h3>Ethereum Transfer</h3>
                            <input
                                type="text"
                                placeholder="Recipient Address"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Amount (ETH)"
                                value={ethAmount}
                                onChange={(e) => setEthAmount(e.target.value)}
                            />
                            <button onClick={handleEthTransfer}>Transfer ETH</button>
                        </div>

                        <div>
                            <h3>SUI Transfer</h3>
                            <input
                                type="text"
                                placeholder="Recipient Address"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Amount (SUI)"
                                value={suiAmount}
                                onChange={(e) => setSuiAmount(e.target.value)}
                            />
                            <button onClick={handleSuiTransfer}>Transfer SUI</button>
                        </div>
                    </div>
                </div>
            </Router>
        </WalletProvider>
    );
};

export default App;
