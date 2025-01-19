import React, { useState } from 'react';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { useWallet } from '@suiet/wallet-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize QueryClient
const queryClient = new QueryClient();

// Config options for the networks
const { networkConfig } = createNetworkConfig({
    localnet: { url: getFullnodeUrl('localnet') },
    mainnet: { url: getFullnodeUrl('mainnet') },
    devnet: { url: getFullnodeUrl('devnet') },
});

// JSON-RPC Endpoint for Sui
const SUI_RPC_URL = getFullnodeUrl('devnet'); // Replace with the desired network URL

const SuiTokenPage = () => {
    const { connected, address } = useWallet();
    const [amount, setAmount] = useState(0.0);  // Allow decimal numbers
    const [recipient, setRecipient] = useState('');

    const mintTokens = async () => {
        if (!connected) {
            alert('Please connect your wallet!');
            return;
        }

        if (amount <= 0 || !recipient) {
            alert('Please enter a valid amount and recipient address.');
            return;
        }

        try {
            // ITBToken decimals (18 decimals)
            const DECIMALS = 18;
            const scaledAmount = (amount * Math.pow(18, DECIMALS)).toString();  // Scale amount by 10^18

            // Backend API URL (adjust to your backend server URL)
            const backendUrl = 'http://localhost:5000/mintSUI'; // Your backend server

            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: scaledAmount,  // Send the scaled amount
                    recipient,
                }),
            });

            const result = await response.json();
            if (result.success) {
                alert('Minting successful! Check the console for details.');
            } else {
                throw new Error(result.message || 'Minting failed');
            }
        } catch (error) {
            console.error('Minting failed:', error);
            alert('Minting failed. Check the console for details.');
        }
    };

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider options={networkConfig.devnet}>
                <WalletProvider>
                    <div>
                        <h1>IBT Token Management</h1>
                        <h3>Wallet Conection</h3>
                        <p>Connected: {connected ? 'Yes' : 'No'}</p>
                    </div>
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
};

export default SuiTokenPage;
