const { ethers } = require('ethers');

const PRIVATE_KEY = '0xc276449edd84fdc65f274bb7668e8845129c4a0b892b53059dfd2863e3acfa11';
const TEST_BUYER = '0xfe05914BdFAD80734D55b91015Dd09c6dA0Ae5fB';

const PIT_MARKET = '0x1d6975d2C0e466928b7dEB47fe48fAD3624A983B';
const SKIN_TRACE = '0x1Deed2c283b950439E1AfE726AEb7Ee257E6aa41';
const PERSEA_TOKEN = '0x58fe512A24A5d3160a8B161C64623f40d4bD113d';

const RPC_URL = 'https://testnet-rpc.monad.xyz';

const PIT_MARKET_ABI = [
  'function VERIFIED_BUYER() view returns (bytes32)',
  'function grantRole(bytes32 role, address account)',
];

const SKIN_TRACE_ABI = [
  'function PRODUCER_ROLE() view returns (bytes32)',
  'function grantRole(bytes32 role, address account)',
];

const PERSEA_TOKEN_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log('Admin wallet:', wallet.address);

  const pitMarket = new ethers.Contract(PIT_MARKET, PIT_MARKET_ABI, wallet);
  const skinTrace = new ethers.Contract(SKIN_TRACE, SKIN_TRACE_ABI, wallet);
  const perseaToken = new ethers.Contract(PERSEA_TOKEN, PERSEA_TOKEN_ABI, wallet);

  // 1. Grant VERIFIED_BUYER
  console.log('\n1. Granting VERIFIED_BUYER role...');
  const verifiedBuyerRole = await pitMarket.VERIFIED_BUYER();
  console.log('Role hash:', verifiedBuyerRole);
  
  const tx1 = await pitMarket.grantRole(verifiedBuyerRole, TEST_BUYER);
  console.log('TX:', tx1.hash);
  await tx1.wait();
  console.log('✅ VERIFIED_BUYER granted');

  // 2. Grant PRODUCER_ROLE
  console.log('\n2. Granting PRODUCER_ROLE...');
  const producerRole = await skinTrace.PRODUCER_ROLE();
  console.log('Role hash:', producerRole);
  
  const tx2 = await skinTrace.grantRole(producerRole, TEST_BUYER);
  console.log('TX:', tx2.hash);
  await tx2.wait();
  console.log('✅ PRODUCER_ROLE granted');

  // 3. Transfer PERSEA tokens
  console.log('\n3. Transferring 1000 PERSEA tokens...');
  const amount = ethers.parseUnits('1000', 18);
  const tx3 = await perseaToken.transfer(TEST_BUYER, amount);
  console.log('TX:', tx3.hash);
  await tx3.wait();
  console.log('✅ 1000 PERSEA tokens transferred');

  console.log('\n🎉 Setup complete for:', TEST_BUYER);
}

main().catch(console.error);
