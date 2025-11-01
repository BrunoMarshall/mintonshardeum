// Token submission script - uses web3 from app.js
(function() {
  'use strict';
  
  // Get or create web3 instance
  let web3Instance;
  if (typeof web3 !== 'undefined') {
    // Use existing web3 from app.js
    web3Instance = web3;
  } else if (typeof window.ethereum !== 'undefined') {
    // Create new instance if needed
    web3Instance = new Web3(window.ethereum);
  } else {
    console.error('No web3 provider found');
  }

  // Network configurations
  const NETWORKS = {
    TESTNET: {
      chainId: '0x1FB7',
      chainIdNumber: 8119,
      chainName: 'Shardeum EVM Testnet',
      factoryAddress: '0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4',
      explorerUrl: 'https://explorer-mezame.shardeum.org'
    },
    MAINNET: {
      chainId: '0x1FB6',
      chainIdNumber: 8118,
      chainName: 'Shardeum',
      factoryAddress: '0x294665ec45ab8668d922474f63a03e33416d8deb',
      explorerUrl: 'https://explorer.shardeum.org'
    }
  };

  let currentNetwork = 'MAINNET';

  // Factory ABI - Only what we need
  const factoryABI = [
    {
      "inputs": [],
      "name": "getDeployedTokens",
      "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Token ABI
  const tokenABI = [
    {
      "inputs": [],
      "name": "name",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Get current network config
  async function getCurrentNetworkConfig() {
    try {
      if (!web3Instance) {
        return NETWORKS.MAINNET;
      }
      const chainId = Number(await web3Instance.eth.getChainId());
      if (chainId === NETWORKS.TESTNET.chainIdNumber) {
        currentNetwork = 'TESTNET';
        return NETWORKS.TESTNET;
      } else if (chainId === NETWORKS.MAINNET.chainIdNumber) {
        currentNetwork = 'MAINNET';
        return NETWORKS.MAINNET;
      }
      return NETWORKS.MAINNET;
    } catch (error) {
      console.error("Error detecting network:", error);
      return NETWORKS.MAINNET;
    }
  }

  // Mode switching
  const modeBtns = document.querySelectorAll('.mode-btn');
  const autoMode = document.getElementById('auto-mode');
  const manualMode = document.getElementById('manual-mode');

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (mode === 'auto') {
        autoMode.classList.add('active');
        manualMode.classList.remove('active');
        loadUserTokens();
      } else {
        manualMode.classList.add('active');
        autoMode.classList.remove('active');
      }
    });
  });

  // AUTO MODE - Load user's tokens
  async function loadUserTokens() {
    const autoTokenInfo = document.getElementById('auto-token-info');
    const autoForm = document.getElementById('auto-form');
    
    if (!window.ethereum) {
      autoTokenInfo.innerHTML = '<p class="error-text">❌ MetaMask not detected. Please install MetaMask.</p>';
      return;
    }
    
    if (!web3Instance) {
      autoTokenInfo.innerHTML = '<p class="error-text">❌ Web3 not initialized. Please refresh the page.</p>';
      return;
    }
    
    try {
      const accounts = await web3Instance.eth.getAccounts();
      
      if (accounts.length === 0) {
        autoTokenInfo.innerHTML = '<p class="loading-text">🔍 Please connect your MetaMask wallet to detect your tokens...</p>';
        return;
      }
      
      const userAddress = accounts[0];
      autoTokenInfo.innerHTML = '<p class="loading-text">⏳ Loading your tokens...</p>';
      
      const config = await getCurrentNetworkConfig();
      const factory = new web3Instance.eth.Contract(factoryABI, config.factoryAddress);
      
      let allTokens;
      try {
        allTokens = await factory.methods.getDeployedTokens().call();
      } catch (error) {
        console.error('Error calling getDeployedTokens:', error);
        autoTokenInfo.innerHTML = `
          <p class="error-text">❌ Failed to load tokens from ${config.chainName}</p>
          <p style="font-size: 14px; color: #666;">Make sure you're connected to the correct network.</p>
          <p style="font-size: 14px; color: #666;">Factory: ${config.factoryAddress}</p>
        `;
        return;
      }
      
      if (!allTokens || allTokens.length === 0) {
        autoTokenInfo.innerHTML = '<p class="error-text">No tokens found on this network.</p>';
        return;
      }
      
      const userTokens = [];
      
      for (const tokenAddress of allTokens) {
        try {
          const token = new web3Instance.eth.Contract(tokenABI, tokenAddress);
          const owner = await token.methods.owner().call();
          
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            const name = await token.methods.name().call();
            const symbol = await token.methods.symbol().call();
            const decimals = await token.methods.decimals().call();
            
            userTokens.push({
              address: tokenAddress,
              name,
              symbol,
              decimals
            });
          }
        } catch (error) {
          console.error(`Error checking token ${tokenAddress}:`, error);
        }
      }
      
      if (userTokens.length === 0) {
        autoTokenInfo.innerHTML = `
          <p class="error-text">❌ No tokens found for your address</p>
          <p style="font-size: 14px; color: #666;">Please use Manual mode or create a token first.</p>
        `;
        return;
      }
      
      // Show first token
      const firstToken = userTokens[0];
      displayAutoToken(firstToken);
      
    } catch (error) {
      console.error('Error loading tokens:', error);
      autoTokenInfo.innerHTML = `
        <p class="error-text">❌ Failed to load tokens</p>
        <p style="font-size: 14px; color: #666;">${error.message}</p>
        <p style="font-size: 14px; color: #666;">Please try Manual mode or refresh the page</p>
      `;
    }
  }

  function displayAutoToken(token) {
    const autoTokenInfo = document.getElementById('auto-token-info');
    const autoForm = document.getElementById('auto-form');
    
    document.getElementById('auto-name').textContent = token.name;
    document.getElementById('auto-symbol').textContent = token.symbol;
    document.getElementById('auto-address').textContent = token.address;
    document.getElementById('auto-decimals').textContent = token.decimals;
    
    autoTokenInfo.style.display = 'none';
    autoForm.style.display = 'block';
    
    window.currentAutoToken = token;
  }

  // Logo validation for AUTO mode
  const autoLogoFile = document.getElementById('auto-logo-file');
  const autoLogoPreview = document.getElementById('auto-logo-preview');
  const autoLogoValidation = document.getElementById('auto-logo-validation');
  const autoSubmitBtn = document.getElementById('auto-submit-btn');

  if (autoLogoFile) {
    autoLogoFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const validation = await validateLogo(file);
      
      if (validation.valid) {
        autoLogoPreview.innerHTML = `<img src="${validation.dataUrl}" alt="Logo preview" style="width: 100%; height: 100%; object-fit: contain;">`;
        autoLogoValidation.innerHTML = '<p style="color: #48bb78;">✅ Logo looks good!</p>';
        autoSubmitBtn.disabled = false;
        window.autoLogoData = validation.dataUrl;
      } else {
        autoLogoPreview.innerHTML = '<span class="upload-placeholder">📷<br>Click to upload<br>256x256 PNG</span>';
        autoLogoValidation.innerHTML = `<p style="color: #FF6B6B;">❌ ${validation.error}</p>`;
        autoSubmitBtn.disabled = true;
        window.autoLogoData = null;
      }
    });
  }

  // Logo validation for MANUAL mode
  const manualLogoFile = document.getElementById('manual-logo-file');
  const manualLogoPreview = document.getElementById('manual-logo-preview');
  const manualLogoValidation = document.getElementById('manual-logo-validation');
  const manualSubmitBtn = document.getElementById('manual-submit-btn');

  if (manualLogoFile) {
    manualLogoFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const validation = await validateLogo(file);
      
      if (validation.valid) {
        manualLogoPreview.innerHTML = `<img src="${validation.dataUrl}" alt="Logo preview" style="width: 100%; height: 100%; object-fit: contain;">`;
        manualLogoValidation.innerHTML = '<p style="color: #48bb78;">✅ Logo looks good!</p>';
        manualSubmitBtn.disabled = false;
        window.manualLogoData = validation.dataUrl;
      } else {
        manualLogoPreview.innerHTML = '<span class="upload-placeholder">📷<br>Click to upload<br>256x256 PNG</span>';
        manualLogoValidation.innerHTML = `<p style="color: #FF6B6B;">❌ ${validation.error}</p>`;
        manualSubmitBtn.disabled = true;
        window.manualLogoData = null;
      }
    });
  }

  async function validateLogo(file) {
    if (!file.type.match('image/png')) {
      return { valid: false, error: 'File must be PNG format' };
    }
    
    if (file.size > 200 * 1024) {
      return { valid: false, error: 'File must be under 200KB' };
    }
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width === 256 && img.height === 256) {
            resolve({ valid: true, dataUrl: e.target.result });
          } else {
            resolve({ valid: false, error: `Image must be exactly 256x256 pixels (yours is ${img.width}x${img.height})` });
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // AUTO mode submit
  if (autoSubmitBtn) {
    autoSubmitBtn.addEventListener('click', () => {
      if (!window.currentAutoToken || !window.autoLogoData) return;
      
      const token = window.currentAutoToken;
      showInstructions(token, window.autoLogoData);
    });
  }

  // MANUAL mode - Verify contract
  const manualVerifyBtn = document.getElementById('manual-verify-btn');
  const manualAddressInput = document.getElementById('manual-address');
  const manualTokenInfo = document.getElementById('manual-token-info');
  const manualLogoSection = document.getElementById('manual-logo-section');

  if (manualVerifyBtn) {
    manualVerifyBtn.addEventListener('click', async () => {
      const address = manualAddressInput.value.trim();
      
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        alert('Invalid address format');
        return;
      }
      
      if (!web3Instance) {
        alert('Web3 not initialized. Please refresh the page.');
        return;
      }
      
      manualVerifyBtn.textContent = '⏳ Verifying...';
      manualVerifyBtn.disabled = true;
      
      try {
        const token = new web3Instance.eth.Contract(tokenABI, address);
        
        const name = await token.methods.name().call();
        const symbol = await token.methods.symbol().call();
        const decimals = await token.methods.decimals().call();
        
        document.getElementById('manual-name').textContent = name;
        document.getElementById('manual-symbol').textContent = symbol;
        document.getElementById('manual-decimals').textContent = decimals;
        
        manualTokenInfo.style.display = 'block';
        manualLogoSection.style.display = 'block';
        
        window.currentManualToken = { address, name, symbol, decimals };
        
        manualVerifyBtn.textContent = '✅ Verified';
        setTimeout(() => {
          manualVerifyBtn.textContent = '🔍 Verify Contract';
          manualVerifyBtn.disabled = false;
        }, 2000);
        
      } catch (error) {
        alert('Failed to verify contract. Make sure it\'s a valid ERC-20 token.');
        manualVerifyBtn.textContent = '🔍 Verify Contract';
        manualVerifyBtn.disabled = false;
      }
    });
  }

  // MANUAL mode submit
  const manualForm = document.getElementById('manual-form');
  if (manualForm) {
    manualForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!window.currentManualToken || !window.manualLogoData) return;
      
      showInstructions(window.currentManualToken, window.manualLogoData);
    });
  }

  function showInstructions(token, logoData) {
    const result = document.getElementById('submission-result');
    
    const fileName = `${token.symbol.toLowerCase()}.png`;
    
    const jsonEntry = {
      "name": token.name,
      "address": token.address,
      "symbol": token.symbol,
      "decimals": parseInt(token.decimals),
      "chainId": currentNetwork === 'TESTNET' ? 8119 : 8118,
      "logoURI": `https://raw.githubusercontent.com/BrunoMarshall/mintonshardeum/main/tokens/logos/${fileName}`
    };
    
    result.innerHTML = `
      <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; margin-top: 30px;">
        <h2 style="color: #48bb78;">✅ Ready to Submit!</h2>
        
        <h3 style="margin-top: 30px;">📝 Step 2: Upload Logo to GitHub</h3>
        <ol style="line-height: 2; text-align: left;">
          <li>Go to: <a href="https://github.com/BrunoMarshall/mintonshardeum/tree/main/tokens/logos" target="_blank" style="color: #0024F1;">GitHub Logos Folder</a></li>
          <li>Click "Add file" → "Upload files"</li>
          <li>Download your validated logo: <button onclick="window.downloadLogo('${logoData}', '${fileName}')" style="background: #48bb78; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-left: 10px;">📥 Download ${fileName}</button></li>
          <li>Upload the downloaded file to GitHub</li>
          <li>Commit with message: "Add ${token.symbol} logo"</li>
        </ol>
        
        <h3 style="margin-top: 30px;">📝 Step 3: Add Token to List</h3>
        <ol style="line-height: 2; text-align: left;">
          <li>Go to: <a href="https://github.com/BrunoMarshall/mintonshardeum/blob/main/tokens/tokenlist.json" target="_blank" style="color: #0024F1;">tokenlist.json</a></li>
          <li>Click the "Edit" (pencil) icon</li>
          <li>Copy this JSON and add it to the "tokens" array:</li>
        </ol>
        
        <div style="background: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0; position: relative;">
          <button onclick="window.copyJSON()" style="position: absolute; top: 10px; right: 10px; background: #48bb78; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">📋 Copy</button>
          <pre id="json-code" style="margin: 0; overflow-x: auto; white-space: pre-wrap;">${JSON.stringify(jsonEntry, null, 2)}</pre>
        </div>
        
        <ol start="4" style="line-height: 2; text-align: left;">
          <li>Commit changes with message: "Add ${token.symbol} to tokenlist"</li>
          <li>Create Pull Request</li>
          <li>Wait for approval!</li>
        </ol>
        
        <p style="margin-top: 30px; padding: 15px; background: #e6f7ff; border-left: 4px solid #0024F1; border-radius: 4px;">
          💡 <strong>Need help?</strong> Join our <a href="https://discord.com/invite/shardeum" target="_blank" style="color: #0024F1;">Discord</a> for support!
        </p>
      </div>
    `;
    
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth' });
  }

  // Make functions globally accessible
  window.downloadLogo = function(dataUrl, fileName) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.click();
  };

  window.copyJSON = function() {
    const code = document.getElementById('json-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
      alert('✅ JSON copied to clipboard!');
    });
  };

  // Network toggle
  const networkToggle = document.getElementById('network-toggle');
  const networkIndicator = document.getElementById('network-indicator');

  function updateNetworkIndicator() {
    if (!networkIndicator) return;
    
    if (currentNetwork === 'TESTNET') {
      networkIndicator.textContent = '🔧 TESTNET';
      networkIndicator.className = 'network-indicator testnet';
      document.body.classList.remove('mainnet-mode');
      document.body.classList.add('testnet-mode');
    } else {
      networkIndicator.textContent = '🟢 MAINNET';
      networkIndicator.className = 'network-indicator mainnet';
      document.body.classList.remove('testnet-mode');
      document.body.classList.add('mainnet-mode');
    }
  }

  if (networkToggle) {
    networkToggle.addEventListener('change', async (e) => {
      currentNetwork = e.target.checked ? 'TESTNET' : 'MAINNET';
      updateNetworkIndicator();
      
      const config = NETWORKS[currentNetwork];
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: config.chainId }]
        });
        
        // Reload tokens if in auto mode
        if (autoMode && autoMode.classList.contains('active')) {
          loadUserTokens();
        }
      } catch (error) {
        console.error("Error switching network:", error);
      }
    });
  }

  // Initialize on load - wait for web3 to be available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAfterDelay);
  } else {
    initializeAfterDelay();
  }

  function initializeAfterDelay() {
    // Wait a bit for app.js to load web3
    setTimeout(async () => {
      // Try to get web3 from global scope
      if (typeof web3 !== 'undefined') {
        web3Instance = web3;
      } else if (typeof window.ethereum !== 'undefined') {
        web3Instance = new Web3(window.ethereum);
      }
      
      updateNetworkIndicator();
      
      if (window.ethereum && web3Instance) {
        try {
          const chainId = Number(await web3Instance.eth.getChainId());
          
          if (chainId === NETWORKS.MAINNET.chainIdNumber) {
            currentNetwork = 'MAINNET';
            if (networkToggle) networkToggle.checked = false;
          } else if (chainId === NETWORKS.TESTNET.chainIdNumber) {
            currentNetwork = 'TESTNET';
            if (networkToggle) networkToggle.checked = true;
          }
          
          updateNetworkIndicator();
          loadUserTokens();
          
          window.ethereum.on('accountsChanged', () => {
            if (autoMode && autoMode.classList.contains('active')) {
              loadUserTokens();
            }
          });
          
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        } catch (error) {
          console.error('Error initializing:', error);
        }
      }
    }, 500); // Wait 500ms for app.js to load
  }

})();