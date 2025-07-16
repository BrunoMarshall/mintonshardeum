import { useState } from 'react';
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
    setStatus('Connect MetaMask to forge your token.');
    // Token creation logic will be implemented once contract is deployed
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Minton’s Token Forge</h2>
        <p className="text-gray-600 mb-6">Minton says: Let’s craft your token on Shardeum!</p>
        <form className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Token Name</label>
            <input
              type="text"
              placeholder="e.g., My Token"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Symbol</label>
            <input
              type="text"
              placeholder="e.g., MTK"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Initial Supply</label>
            <input
              type="number"
              placeholder="e.g., 1000000"
              value={supply}
              onChange={(e) => setSupply(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Decimals</label>
            <input
              type="number"
              placeholder="e.g., 18"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isMintable}
                onChange={(e) => setIsMintable(e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700 font-medium">Mintable (Minton can forge more!)</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="testnet">Shardeum Testnet</option>
              <option value="mainnet" disabled>Shardeum Mainnet (Coming Soon)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={createToken}
            className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Forge with Minton!
          </button>
        </form>
        {status && <p className="mt-4 text-center text-gray-700">{status}</p>}
      </main>
    </div>
  );
}