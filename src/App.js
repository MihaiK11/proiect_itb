// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { WalletProvider } from '@suiet/wallet-kit';
import EthTokenPage from "./EthTokenPage";
import SuiTokenPage from './SuiTokenPage';


const App = () => {
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
                                <Link to="/eth">ETH Wallet connect</Link>
                            </li>
                            <li>
                                <Link to="/sui">SUI Wallet connect</Link>
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
                </div>
            </Router>
        </WalletProvider>
    );
};

export default App;
