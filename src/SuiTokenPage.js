import React, { useState, useEffect } from 'react';
import {useWallet, WalletProvider, ConnectButton} from '@suiet/wallet-kit';

const SuiTokenPage = () => {
    const { connected, connect, disconnect, account, error } = useWallet();
    const [balance, setBalance] = useState(null);


    return (

        <div>
            <WalletProvider>
                <h2>SUI Token Management</h2>
                {!connected ? (
                    <div>
                        <p>Connect your wallet to manage SUI tokens</p>
                        <ConnectButton onClick={connect}>Connect Wallet</ConnectButton>
                    </div>
                ) : (
                    <div>
                        <p>Connected Account: {account.address}</p>
                        {balance !== null && <p>Balance: {balance} SUI</p>}
                        <button onClick={disconnect}>Disconnect</button>
                    </div>
                )}
            </WalletProvider>
        </div>
    );
};

export default SuiTokenPage;
