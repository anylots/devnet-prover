const { BigNumber } = require("ethers")
const { ethers } = require('ethers');
const Rollup_Artifact = require("../artifacts/contracts/Rollup.sol/Rollup.json");
const fs = require('fs');

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {

    await commitBatch();
    // for (let i = 0; i < 100; i++) {


    //     await new Promise(resolve => setTimeout(resolve, 10000));  

    //     // await challengeState(i + 1);
    // }

}

async function commitBatch() {
    let privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    let customHttpProvider = new ethers.providers.JsonRpcProvider(
        "http://localhost:8545"
    );

    const signer = new ethers.Wallet(privateKey, customHttpProvider);
    console.log("signer.address: " + signer.address);
    let rollup = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", Rollup_Artifact.abi, signer);

    let batchSignature = {
        version: 1,
        signers: [1, 2, 3],
        signature: "0x010203"
    };

    let batchData = {
        batchData: {
            version: 1,
            parentBatchHeader: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("parentBatchHeader")),
            chunks: ["0x010203", "0x040506"],
            skippedL1MessageBitmap: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("skippedL1MessageBitmap")),
            prevStateRoot: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("prevStateRoot")),
            postStateRoot: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("postStateRoot")),
            withdrawalRoot: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("withdrawalRoot")),
            signature: batchSignature
        }, version: 1,
        sequencerIndex: [1, 2, 3],
        signature: "0x010203"
    };

    // let input = loadFunctionData();

    let batch = loadBatchData();
    console.log("batch: " + batch.withdrawalRoot);


    let tx = await rollup.commitBatch(batch.batchData, batch.version, batch.sequencerIndex, batch.signature);
    // console.log("tx: " + JSON.stringify(tx));

    await tx.wait();

    console.log("==============================");
    let receipt = await customHttpProvider.getTransactionReceipt(tx.hash);
    console.log("receipt: " + JSON.stringify(receipt));
}

async function challengeState(batchIndex) {
    let privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    let customHttpProvider = new ethers.providers.JsonRpcProvider(
        "http://localhost:8545"
    );

    const signer = new ethers.Wallet(privateKey, customHttpProvider);
    console.log("signer.address: " + signer.address);
    let rollup = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", Rollup_Artifact.abi, signer);


    let tx = await rollup.challengeState(batchIndex);
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

function loadBatchData() {
    const inputBuffer = fs.readFileSync('./batch.json');
    const inputString = inputBuffer.toString();

    return JSON.parse(inputString);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
