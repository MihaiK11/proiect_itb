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
const packageId = "0xfb218dc3bc933a9f9b5fdd65eec5af14d1a67e5d7785859c59c6c8ecee5811c1";
const treasuryCap = "0x9009e5395095c4241c29ebd5d08ee473fcb4a7ce58bd3fa0b68d7e8bfd0ed3a1"; // Replace with actual object ID
const adminCap = "0x7406e489f11efc601a9dcdad8de267a31d9a97da0ad1ad27545e8665653e5f38"; // Replace with actual admin cap object ID
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

        console.log(`Successfully minted SUI token amount: ${amount} to recipient: ${recipient}`);
    });
};
const burnSui = async (coin_id) => {
    const command = `${suiPath} client call --package ${packageId} --module ITBToken --function burn --args ${treasuryCap} ${coin_id} ${adminCap}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
        }

        console.log(`Successfully burned SUI token with id: ${coin_id}`);
    });
}
app.post('/Sui_to_Eth', async (req, res) => {
    const {coin_id, recipientAddress, amount} = req.body;

    // Burn SUI tokens
    await burnSui(coin_id);

    // Mint ETH
    await mintETH(recipientAddress, amount);
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

        console.log(`Successfully burned ${amount} tokens from ${fromAddress}`);
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
