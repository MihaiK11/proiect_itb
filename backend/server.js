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

// Endpoint to handle minting request
app.post('/mintSUI', (req, res) => {
    const packageId = "0x1cee72a9d2690a4d0b0b2a558792eca5b53da9c20dcaee1ec5ccb70ceb585e07";
    const treasuryCap = "0x2568eb7019eff57460e8b1c3de63c707d3619f1eecad441f8c102714a0c5ae7c"; // Replace with actual object ID
    const adminCap = "0x7ee61a0a96b708891d2f4782fabea44683b78a4f2a524f3384aa890891752176"; // Replace with actual admin cap object ID
    const {amount, recipient} = req.body;

    // Build the Sui CLI command with the full path to sui.exe
    const command = `${suiPath} client call --package ${packageId} --module ITBToken --function mint --args ${treasuryCap} ${amount} ${recipient} ${adminCap}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
            return res.status(500).json({ success: false, message: stderr });
        }

        console.log(`Command executed successfully: ${stdout}`);
        res.json({ success: true, message: stdout });
    });
});
const deployedContractAddressEth = "0x7865ce0ef00739d7A241ef152247eB161D8B653B";
const privateKeyEth = "8b34a90d54e6a60d89c469dbd4c2aa0e0a62f0a5796fb7eb96c51e6d1713d696";
const rpcUrlEth = "https://eth-sepolia.g.alchemy.com/v2/MD0O5D9yaXGif4cUAP046835sl7fBItR";
app.post('/mintETH', async (req, res) => {
    const { recipientAddress, amount } = req.body;

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
        res.json({ success: true, message: `Successfully minted ${amount} tokens to ${recipientAddress}` });
    } catch (error) {
        console.error(`Error minting tokens: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Endpoint to burn ETH
app.post('/burnETH', async (req, res) => {
    const { amount, fromAddress } = req.body;
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

        res.json({ success: true, message: `Successfully burned ${amount} tokens from ${fromAddress}` });
    } catch (error) {
        console.error('Error burning tokens:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Set the server to listen on port 5000 (or whatever port you're using)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
