// SuiTokenPage.js
import React, { useState } from 'react';
import { ConnectButton } from '@suiet/wallet-kit';

const SuiTokenPage = () => {
    return (
        <div>
            {/* Suiet Wallet Connection */}
            <div>
                <h2>Suiet Wallet Connection</h2>
                <ConnectButton />
            </div>
        </div>
    );
};

export default SuiTokenPage;
