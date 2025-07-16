import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function Header() {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    } else {
      alert('Please install MetaMask to connect your wallet.');
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-6">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <img
          src="/mintonshardeum_logo.png"
          alt="Minton Shardeum Logo"
          className="w-32 h-auto mb-4"
        />
        <h1 className="text-3xl font-bold">Minton: Forge Tokens on Shardeum</h1>
        <p className="mt-2 text-lg">Join Minton, the Token Forger, to craft your own tokens!</p>
        <button
          onClick={connectWallet}
          className="mt-4 px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
        >
          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect MetaMask'}
        </button>
      </div>
    </header>
  );
}