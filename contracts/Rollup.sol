// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity =0.8.16;

contract Rollup {
    struct BatchData {
        uint8 version;
        bytes parentBatchHeader;
        bytes[] chunks;
        bytes skippedL1MessageBitmap;
        bytes32 prevStateRoot;
        bytes32 postStateRoot;
        bytes32 withdrawalRoot;
        BatchSignature signature;
    }

    struct BatchSignature {
        uint256 version;
        uint256[] signers;
        bytes signature;
    }

    struct BatchChallenge {
        uint64 batchIndex;
        address challenger;
        uint256 challengeDeposit;
        uint256 startTime;
        bool finished;
    }

    uint256 lastBatchIndex;

    /**
     * @notice Store Challenge Information.(batchIndex => BatchChallenge)
     */
    mapping(uint256 => BatchChallenge) public challenges;

    event CommitBatch(uint256 indexed batchIndex, bytes32 indexed batchHash);

    event ChallengeState(
        uint64 indexed batchIndex,
        address challenger,
        uint256 challengeDeposit
    );

    event ChallengeRes(uint64 indexed batchIndex, address winner, string res);

    function commitBatch(BatchData calldata batchData) external {
        uint256 _chunksLength = batchData.chunks.length;
        require(_chunksLength > 0, "batch is empty");

        lastBatchIndex = lastBatchIndex + 1;
        bytes32 batchHash = computeBatchHash(lastBatchIndex, uint256(1));
        emit CommitBatch(lastBatchIndex, batchHash);
    }

    function challengeState(uint64 batchIndex) external payable {
        require(0 < batchIndex, "Batch already finalized");

        challenges[batchIndex] = BatchChallenge(
            batchIndex,
            msg.sender,
            msg.value,
            block.timestamp,
            false
        );
        emit ChallengeState(batchIndex, msg.sender, msg.value);
    }

    function proveState(
        uint64 _batchIndex,
        bytes calldata _aggrProof
    ) external {
        require(_aggrProof.length > 0, "Invalid proof");
        require(
            !challenges[_batchIndex].finished,
            "challenge already finished"
        );

        // compute public input hash
        // verify batch

        challenges[_batchIndex].finished = true;
        emit ChallengeRes(_batchIndex, address(0), "prove success");
    }

    function batchInChallenge(uint256 batchIndex) public view returns (bool) {
        return
            challenges[batchIndex].challenger != address(0) &&
            !challenges[batchIndex].finished;
    }

    function isChallenger(address _challenger) external pure returns (bool) {
        return true;
    }

    function FINALIZATION_PERIOD_SECONDS() external pure returns (uint256) {
        return uint256(86400);
    }

    function PROOF_WINDOW() external pure returns (uint256) {
        return uint256(86400);
    }

    function isBatchFinalized(
        uint256 _batchIndex
    ) external pure returns (bool) {
        return false;
    }

    function computeBatchHash(
        uint256 batchPtr,
        uint256 length
    ) internal pure returns (bytes32 _batchHash) {
        // in the current version, the hash is: keccak(BatchHeader without timestamp)
        assembly {
            _batchHash := keccak256(batchPtr, length)
        }
    }
}
