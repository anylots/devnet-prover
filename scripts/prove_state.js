const { BigNumber } = require("ethers")
const { ethers } = require('ethers');
const Rollup_Artifact = require("./Rollup.json");
const fs = require('fs');
require("dotenv").config({ path: ".env" });

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {

    await challengeState(28);

}

async function challengeState(batchIndex) {
    let privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    let customHttpProvider = new ethers.providers.JsonRpcProvider(
        "http://localhost:9545"
    );

    const signer = new ethers.Wallet(privateKey, customHttpProvider);
    console.log("signer.address: " + signer.address);

    let rollup_address = requireEnv("ROLLUP_ADDRESS");
    console.log("rollup_address: " + rollup_address);

    let rollup = new ethers.Contract(rollup_address, Rollup_Artifact.abi, signer);

    const proof = ethers.utils.hexlify(fs.readFileSync("../prover/proof/batch_28/proof_batch_agg.data"));
    let tx = await rollup.proveState(batchIndex, proof);
    await tx.wait();
    console.log("==============================");
    let receipt = await customHttpProvider.getTransactionReceipt(tx.hash);
    console.log("challengeState_receipt: " + JSON.stringify(receipt));
}

function loadFunctionData() {
    const inputBuffer = fs.readFileSync('./input.data');
    const inputString = inputBuffer.toString();

    const abiInterface = new ethers.utils.Interface(Rollup_Artifact.abi);
    const decoded = abiInterface.decodeFunctionData("commitBatch", inputString);
    // console.log(decoded[0].chunks);
    return decoded;


}
/**
 * Load environment variables 
 * 
 * @param {*} entry 
 * @returns 
 */
function requireEnv(entry) {
    if (process.env[entry]) {
        return process.env[entry]
    } else {
        throw new Error(`${entry} not defined in .env`)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
