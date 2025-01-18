import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { WalletProvider, ConnectButton } from '@suiet/wallet-kit';

const App = () => {
    const [account, setAccount] = useState(null);
    const [ethBalance, setEthBalance] = useState(null);
    const [ibtBalance, setIbtBalance] = useState(null);

    const tokenAddress = '0x7865ce0ef00739d7A241ef152247eB161D8B653B';
    const tokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function mint(address to, uint256 amount) public",
        "function burn(address from, uint256 amount) public"
    ];

    const connectMetaMask = async () => {
        if (!window.ethereum) {
            alert('MetaMask is not installed. Please install it to use this feature!');
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);

            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            const ethBalance = await provider.getBalance(userAddress);

            setAccount(userAddress);
            setEthBalance(ethers.formatEther(ethBalance));

            const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
            const rawIbtBalance = await tokenContract.balanceOf(userAddress);
            const decimals = 18;
            const formattedIbtBalance = ethers.formatUnits(rawIbtBalance, decimals);

            setIbtBalance(formattedIbtBalance);
        } catch (error) {
            console.error('Error connecting to MetaMask or fetching balances:', error);
        }
    };

    const mintEthToken = async (recipient, amount) => {
        try {
            if (!window.ethereum) {
                alert('MetaMask is not installed. Please install it to use this feature!');
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

            const decimals = 18;
            const mintAmount = ethers.parseUnits(amount.toString(), decimals);

            const tx = await tokenContract.mint(recipient, mintAmount);
            await tx.wait();

            alert(`Successfully minted ${amount} IBT to ${recipient}`);
        } catch (error) {
            console.error('Error minting tokens:', error);
        }
    };

    const burnEthToken = async (amount) => {
        try {
            if (!window.ethereum) {
                alert('MetaMask is not installed. Please install it to use this feature!');
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

            const decimals = 18;
            const burnAmount = ethers.parseUnits(amount.toString(), decimals);

            const tx = await tokenContract.burn(account, burnAmount);
            await tx.wait();

            alert(`Successfully burned ${amount} IBT from ${account}`);
        } catch (error) {
            console.error('Error burning tokens:', error);
        }
    };

    return (
        <WalletProvider>
            <div>
                <h1>IBT Token Management</h1>
                {/* MetaMask Connection */}
                <div>
                    <h2>MetaMask Connection</h2>
                    <button onClick={connectMetaMask}>Connect MetaMask</button>
                    {account && (
                        <div>
                            <p>Connected Account: {account}</p>
                            <p>ETH Balance: {ethBalance} ETH</p>
                            <p>IBT Token Balance: {ibtBalance} IBT</p>

                            <h2>Mint IBT Tokens</h2>
                            <input type="text" id="recipient" placeholder="Recipient Address" />
                            <input type="number" id="mintAmount" placeholder="Amount" />
                            <button
                                onClick={() => {
                                    const recipient = document.getElementById('recipient').value;
                                    const amount = parseFloat(document.getElementById('mintAmount').value);
                                    mintEthToken(recipient, amount);
                                }}
                            >
                                Mint Tokens
                            </button>

                            <h2>Burn IBT Tokens</h2>
                            <input type="number" id="burnAmount" placeholder="Amount" />
                            <button
                                onClick={() => {
                                    const amount = parseFloat(document.getElementById('burnAmount').value);
                                    burnEthToken(amount);
                                }}
                            >
                                Burn Tokens
                            </button>
                        </div>
                    )}
                </div>

                {/* Suiet Wallet Connection */}
                <div>
                    <h2>Suiet Wallet Connection</h2>
                    <ConnectButton />
                </div>
            </div>
        </WalletProvider>
    );
};

export default App;
