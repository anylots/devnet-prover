const { BigNumber } = require("ethers")
const { ethers } = require('ethers');
const Token_Artifact = require("../src/abi/Token.json");

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {

    ///prepare deployer
    let privateKey = "1212121212121212121212121212121212121212121212121212121212121212";
    let customHttpProvider = new ethers.providers.JsonRpcProvider(
        "http://localhost:6688"
    );
    const signer = new ethers.Wallet(privateKey, customHttpProvider);
    console.log("signer.address: " + signer.address);


    ///deploy ERC20 Token
    let TokenFactory = new ethers.ContractFactory(Token_Artifact.abi, Token_Artifact.bytecode, signer);
    const token = await TokenFactory.deploy(BigNumber.from(10 ** 12).mul(BigNumber.from(10 ** 6)));
    console.log("contract deploying...");

    await token.deployed();
    console.log("token address:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
