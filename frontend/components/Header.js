import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function Header() {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts[0] || null);
      });
    }
  }, []);

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
        alert('Failed to connect MetaMask. Please try again.');
      }
    } else {
      alert('Please install MetaMask to connect your wallet.');
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/mintonshardeum_logo.png"
            alt="Minton Shardeum Logo"
            className="w-24 h-auto mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold">Minton: Forge Tokens on Shardeum</h1>
            <p className="text-sm">Join Minton, the Token Forger, to craft your own tokens!</p>
          </div>
        </div>
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
        >
          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect MetaMask'}
        </button>
      </div>
    </header>
  );
}