// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VerificationRegistry
 * @dev Implements decentralized registry for content fingerprints (SHA-256) on Polygon Amoy.
 * Stores only content hashes, source URLs, and timestamps without storing raw biometric or personal data.
 */
contract VerificationRegistry {
    struct VerificationRecord {
        bytes32 contentHash;
        string sourceUrl;
        uint256 timestamp;
        address registeredBy;
    }

    // Mapping from contentHash (bytes32) to VerificationRecord
    mapping(bytes32 => VerificationRecord) private _records;

    // Track total registered items
    uint256 public totalRegistrations;

    // Event emitted when new content fingerprint is registered
    event ContentRegistered(
        bytes32 indexed contentHash,
        string sourceUrl,
        uint256 timestamp,
        address indexed registeredBy
    );

    /**
     * @notice Registers a new content fingerprint.
     * @param _contentHash SHA-256 fingerprint formatted as bytes32.
     * @param _sourceUrl Discovered source or candidate URL.
     */
    function registerContent(bytes32 _contentHash, string calldata _sourceUrl) external returns (bool) {
        require(_contentHash != bytes32(0), "Invalid content hash");
        require(bytes(_sourceUrl).length > 0, "Source URL cannot be empty");
        require(_records[_contentHash].timestamp == 0, "Content hash already registered");

        _records[_contentHash] = VerificationRecord({
            contentHash: _contentHash,
            sourceUrl: _sourceUrl,
            timestamp: block.timestamp,
            registeredBy: msg.sender
        });

        totalRegistrations += 1;

        emit ContentRegistered(_contentHash, _sourceUrl, block.timestamp, msg.sender);
        return true;
    }

    /**
     * @notice Verifies whether a content hash exists and retrieves its registration details.
     * @param _contentHash SHA-256 fingerprint formatted as bytes32.
     * @return exists True if registered on-chain.
     * @return sourceUrl The registered source URL.
     * @return timestamp The block timestamp of registration.
     * @return registeredBy Address of the registrant.
     */
    function verifyContent(bytes32 _contentHash)
        external
        view
        returns (
            bool exists,
            string memory sourceUrl,
            uint256 timestamp,
            address registeredBy
        )
    {
        VerificationRecord memory record = _records[_contentHash];
        if (record.timestamp == 0) {
            return (false, "", 0, address(0));
        }
        return (true, record.sourceUrl, record.timestamp, record.registeredBy);
    }

    /**
     * @notice Checks if a content hash exists in the registry.
     * @param _contentHash SHA-256 fingerprint.
     */
    function recordExists(bytes32 _contentHash) external view returns (bool) {
        return _records[_contentHash].timestamp != 0;
    }
}
