import { useState } from 'react';
import { ethers } from 'ethers';
import Header from '../components/Header';

const factoryABI = [
  "function createToken(string memory name, string memory symbol, uint256 initialSupply, uint8 decimals, bool isMintable) public returns (address)",
  "event TokenCreated(address tokenAddress, string name, string symbol, address creator)"
];

export default function Home() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [decimals, setDecimals] = useState(18);
  const [isMintable, setIsMintable] = useState(false);
  const [network, setNetwork] = useState('testnet');
  const [status, setStatus] = useState('');

  const createToken = async () => {
    if (!name || !symbol || !supply || decimals < 0 || decimals > 18) {
      setStatus('Please fill all fields correctly. Decimals must be 0–18.');
      return;
    }
    try {
      setStatus('Connecting to wallet...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const factory = new ethers.Contract(
        'FACTORY_ADDRESS', // Replace with your deployed MintonFactory address
        factoryABI,
        signer
      );
      setStatus('Forging token with Minton...');
      const tx = await factory.createToken(name, symbol, supply, decimals, isMintable);
      const receipt = await tx.wait();
      setStatus(`Minton forged your token at: ${receipt.logs[0].address}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Header />
      <h2>Minton’s Token Forge</h2>
      <p>Minton says: Let’s craft your token on Shardeum!</p>
      <form>
        <div style={{ marginBottom: '10px' }}>
          <label>Token Name: </label>
          <input
            type="text"
            placeholder="e.g., My Token"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Symbol: </label>
          <input
            type="text"
            placeholder="e.g., MTK"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Initial Supply: </label>
          <input
            type="number"
            placeholder="e.g., 1000000"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Decimals: </label>
          <input
            type="number"
            placeholder="e.g., 18"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={isMintable}
              onChange={(e) => setIsMintable(e.target.checked)}
            />
            Mintable (Minton can forge more!)
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Network: </label>
          <select value={network} onChange={(e) => setNetwork(e.target.value)}>
            <option value="testnet">Shardeum Testnet</option>
            <option value="mainnet" disabled>Shardeum Mainnet (Coming Soon)</option>
          </select>
        </div>
        <button
          type="button"
          onClick={createToken}
          style={{ padding: '10px 20px', background: '#00b4d8', color: 'white', border: 'none' }}
        >
          Forge with Minton!
        </button>
      </form>
      <p>{status}</p>
    </div>
  );
}