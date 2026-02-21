#!/bin/bash

# PERSÉA Protocol - Comprehensive Smart Contract Tests
# Wallet with 1 MON
export WALLET_ADDRESS=0xfe05914BdFAD80734D55b91015Dd09c6dA0Ae5fB
export RPC_URL=https://testnet-rpc.monad.xyz
export CHAIN_ID=10143

# Contract addresses
export SKIN_TRACE=0xD4934103857Df1AF9d6760b37DF480f92aD952e9
export PIT_MARKET=0xA8b6E9E1DB21Aa05A1BBD7e887926604058651C5
export SEED_SCORE=0x3f173943211b524dd08bd68de462C26DB5F69578
export SEED_CONSENT=0xb576afB7cb76AA0Bc6Cd88e0a1F97E3e1583573D
export PERSEA_TOKEN=0x27fe9ACA3c32E1df31a470b23f29E3Ce91F8ff04

echo "=== PERSÉA Protocol Smart Contract Tests ==="
echo ""

# 1. Check PERSEA Token Balance
echo "=== 1. PERSEA Token Balance ==="
balance=$(cast balance $WALLET_ADDRESS --erc20 $PERSEA_TOKEN --rpc-url $RPC_URL)
echo "PERSEA Balance: $balance PERSEA"
echo ""

# 2. Grant PRODUCER_ROLE to test wallet
echo "=== 2. Granting PRODUCER_ROLE to test wallet ==="
# Use the admin wallet (deployer) to grant role
admin_wallet=0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A
admin_pk=c276449edd84fdc65f274bb7668e8845129c4a0b892b53059dfd2863e3acfa11

# Grant PRODUCER_ROLE
PRODUCER_ROLE=$(cast keccak256 "PRODUCER_ROLE" --rpc-url $RPC_URL)
echo "PRODUCER_ROLE hash: $PRODUCER_ROLE"

cast send $SKIN_TRACE "setListedStatus(uint256 0) true" --private-key $admin_pk --rpc-url $RPC_URL

# Grant role
role_tx=$(cast send $SKIN_TRACE "grantRole(address(uint256 0) $WALLET_ADDRESS" --private-key $admin_pk --rpc-url $RPC_URL)
echo "Grant role tx: $role_tx"
echo ""

# Wait for confirmation
sleep 2
echo ""

# 3. Register a Batch
echo "=== 2. Registering a Batch ==="
batch_tx=$(cast send $SKIN_TRACE "registerBatch(uint8(0) uint256(500000) string "Hass") uint8(0) string "ipfs://test-hash" int256(19340400) int256(-102364600) --private-key $admin_pk --rpc-url $RPC_URL --legacy)
echo "Register batch tx: $batch_tx"
echo ""

# Wait for tx
sleep 5
echo ""

# 4. Get Batch Info
echo "=== 2. Query Batch Info ==="
batch_info=$(cast call $SKIN_TRACE"getBatch(uint256 0) --rpc-url $RPC_URL)
echo "Batch Info:"
echo "$batch_info"
echo ""

# 5. Check Total Batches
echo "=== 1. Total Batches ==="
total=$(cast call $SKIN_TRACE"totalBatches --rpc-url $RPC_URL)
echo "Total batches: $total"
echo ""

# 6. Create Listing in PitMarket
echo "=== 1. Creating Listing ==="
listing_tx=$(cast send $PIT_MARKET"createListing(uint256(0) uint256(1000000000000000) address(0x27fe9ACA3c32E1df31a470b23f29E3Ce91F8ff04) --private-key $admin_pk --rpc-url $RPC_URL --legacy)
echo "Create listing tx: $listing_tx"
echo ""

# Wait
sleep 3
echo ""

# 7. Get Listing Info
echo "=== 1. Get Listing Info ==="
listing_info=$(cast call $PIT_MARKET"getListing(uint256(0) --rpc-url $RPC_URL);
echo "Listing Info:"
echo "$listing_info"
echo ""

# 8. Get Floor Prices
echo "=== 1. Floor Prices ==="
floor_seed=$(cast call $PIT_MARKET"floorPrices(uint8(0) --rpc-url $RPC_URL);
floor_peel=$(cast call $PIT_MARKET"floorPrices(uint8(1) --rpc-url $RPC_URL);
floor_pulp=$(cast call $PIT_MARKET"floorPrices(uint8(2) --rpc-url $RPC_URL);
floor_biomass=$(cast call $PIT_MARKET"floorPrices(uint8(3) --rpc-url $RPC_URL);
echo "Floor Price SEED: $floor_seed wei"
echo "Floor Price PEEL: $floor_peel wei"
echo "Floor Price PULP: $floor_pulp wei"
echo "Floor Price BIOMASS: $floor_biomass wei"
echo ""

# 9. Check Green Score
echo "=== 1. Green Score ==="
green_score=$(cast call $SEED_SCORE"getGreenScore(address(uint256 0) $WALLET_ADDRESS) --rpc-url $RPC_URL);
echo "Green Score: $green_score"
echo ""

# 10. Check Consent
echo "=== 1. Consent Status ==="
consent=$(cast call $SEED_CONSENT"hasConsent(address(uint256 0) $WALLET_ADDRESS) --rpc-url $RPC_URL);
echo "Has Consent: $consent"
echo ""

echo "=== ALL TESTS COMPLETED ==="
