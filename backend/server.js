const { ethers } = require('ethers');

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all origins
app.use(cors()); // This allows all origins (e.g., http://localhost:3000) to make requests to your server

// Path to the sui.exe executable
const suiPath = "C:\\Users\\mikek\\UVT\\sui\\sui.exe";  // Replace with your actual path
const packageId = "0x48413f341295b75b0f46b0ed253530972eef0ea7516f4a6fdb22a777f3b08901";
const treasuryCap = "0x09a8ba4c97b295644bb7bb7483ee84c3e55fb158ff9551253282697c2f742a00"; // Replace with actual object ID
const adminCap = "0x419706cfbe541eee5c728a86fc2a574b83b126838a68ed802ee32cf2142424f0"; // Replace with actual admin cap object ID
// Endpoint to handle minting request
const mintSUI = async (recipient, amount) => {
    const decimals = 9;
    const mintAmount = (amount * 10 ** decimals).toString()
    // Build the Sui CLI command with the full path to sui.exe
    const command = `${suiPath} client call --package ${packageId} --module ITBToken --function mint --args ${treasuryCap} ${mintAmount} ${recipient} ${adminCap}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
        }

        console.log(`Command executed successfully: ${stdout}`);
    });
};

const splitCoin = async (fromAdress, amount) => {
    const decimals = 9;
    const splitAmount = (amount * 10 ** decimals).toString()
    let coin_object_id = "0x6e29a32fcba349053493d371a35e7e9abd11b7ae86545af3975ffc1805a1c646";
    const command = `${suiPath} client split-coin ${coin_object_id} ${splitAmount}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
        }
        return stdout;
        console.log(`Command executed successfully: ${stdout}`);
    });
}
app.post('/Sui_to_Eth', async (req, res) => {
    const { recipientAddress, fromAddress, amount } = req.body;

    const decimals = 9;
    const burnAmount = (amount * 10 ** decimals).toString()

    let coin = splitCoin(fromAddress, burnAmount);
    return coin;
});
const deployedContractAddressEth = "0x7865ce0ef00739d7A241ef152247eB161D8B653B";
const privateKeyEth = "8b34a90d54e6a60d89c469dbd4c2aa0e0a62f0a5796fb7eb96c51e6d1713d696";
const rpcUrlEth = "https://eth-sepolia.g.alchemy.com/v2/MD0O5D9yaXGif4cUAP046835sl7fBItR";

const mintETH = async (recipientAddress, amount) => {
    try {
        // Set up the provider and wallet
        const provider = new ethers.JsonRpcProvider(rpcUrlEth);
        const wallet = new ethers.Wallet(privateKeyEth, provider);

        // ABI for the mint function
        const tokenABI = [
            "function mint(address to, uint256 amount) public"
        ];

        const tokenContract = new ethers.Contract(deployedContractAddressEth, tokenABI, wallet);

        // Convert amount to appropriate format (with 18 decimals for ERC20)
        const decimals = 18;
        const mintAmount = ethers.parseUnits(amount.toString(), decimals);

        // Send mint transaction
        const tx = await tokenContract.mint(recipientAddress, mintAmount);
        await tx.wait(); // Wait for the transaction to be mined

        console.log(`Successfully minted ${amount} tokens to ${recipientAddress}`);
    } catch (error) {
        console.error(`Error minting tokens: ${error.message}`);
    }
};


// Endpoint to burn ETH
const burnETH = async (fromAddress, amount) =>{
    try {
        const provider = new ethers.JsonRpcProvider(rpcUrlEth);
        const wallet = new ethers.Wallet(privateKeyEth, provider);

        const tokenABI = [
            "function burn(address from, uint256 amount) public"
        ];

        const tokenContract = new ethers.Contract(deployedContractAddressEth, tokenABI, wallet);
        const decimals = 18;
        const burnAmount = ethers.parseUnits(amount.toString(), decimals);

        const tx = await tokenContract.burn(fromAddress, burnAmount);
        await tx.wait();

    } catch (error) {
        console.error('Error burning tokens:', error);
    }
};

app.post('/Eth_to_Sui', async (req, res) => {
    const { recipientAddress, fromAddress, amount } = req.body;
    // Burn ETH
    await burnETH(fromAddress, amount);

    // Mint SUI tokens
    await mintSUI(recipientAddress, amount);

    res.json({ success: true });
});
// Set the server to listen on port 5000 (or whatever port you're using)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
