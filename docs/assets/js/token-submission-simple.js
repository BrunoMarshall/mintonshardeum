const web3 = new Web3('https://api-mezame.shardeum.org/');

const FACTORY_ADDRESS = "0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4";

const FACTORY_ABI = [
  {
    "inputs": [],
    "name": "getDeployedTokens",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const ERC20_ABI = [
  {"constant": true, "inputs": [], "name": "name", "outputs": [{"name": "", "type": "string"}], "type": "function"},
  {"constant": true, "inputs": [], "name": "symbol", "outputs": [{"name": "", "type": "string"}], "type": "function"},
  {"constant": true, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"},
  {"constant": true, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"}
];

let currentMode = 'auto';
let tokenData = {};
let logoFile = null;
let logoDataUrl = null;

console.log("🚀 Token submission script loaded");

// Wait for wallet connection from app.js
function checkWalletAndLoadTokens() {
  web3.eth.getAccounts().then(accounts => {
    if (accounts.length > 0 && currentMode === 'auto') {
      console.log("✅ Wallet connected, loading tokens for:", accounts[0]);
      loadUserTokens(accounts[0]);
    } else if (accounts.length === 0 && currentMode === 'auto') {
      console.log("⚠️ No wallet connected in auto mode");
      document.getElementById('auto-token-info').innerHTML = `
        <div class="info-banner">
          <h3>🔗 Connect Your Wallet First</h3>
          <p>Please connect your MetaMask wallet using the button above to auto-detect your tokens.</p>
        </div>
      `;
    }
  }).catch(err => {
    console.error("Error checking wallet:", err);
  });
}

// Listen for wallet connection events from app.js
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    console.log("👤 Account changed, reloading tokens...");
    if (accounts.length > 0 && currentMode === 'auto') {
      loadUserTokens(accounts[0]);
    }
  });
}

// Mode Switching
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    console.log("🔀 Switching to mode:", btn.dataset.mode);
    currentMode = btn.dataset.mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update mode displays
    document.querySelectorAll('.submission-mode').forEach(m => m.classList.remove('active'));
    document.getElementById(`${currentMode}-mode`).classList.add('active');
    
    // Reset
    document.getElementById('submission-result').style.display = 'none';
    
    // If switching to auto, check wallet and load tokens
    if (currentMode === 'auto') {
      console.log("🔄 Auto mode activated");
      checkWalletAndLoadTokens();
    }
  });
});

// AUTO MODE: Load user's tokens
async function loadUserTokens(userAddress) {
  console.log("🔍 Loading tokens for address:", userAddress);
  
  const infoDiv = document.getElementById('auto-token-info');
  const formDiv = document.getElementById('auto-form');
  
  try {
    infoDiv.innerHTML = '<p class="loading-text">🔍 Searching for your tokens...</p>';
    
    const factory = new web3.eth.Contract(FACTORY_ABI, FACTORY_ADDRESS);
    console.log("📡 Fetching all deployed tokens...");
    
    const allTokens = await factory.methods.getDeployedTokens().call();
    console.log("📊 Total tokens found:", allTokens.length);
    
    // Get user's tokens by checking each one
    const userTokens = [];
    const tokensToCheck = Math.min(10, allTokens.length);
    
    console.log(`🔎 Checking last ${tokensToCheck} tokens for your balance...`);
    
    for (let i = allTokens.length - 1; i >= Math.max(0, allTokens.length - tokensToCheck); i--) {
      try {
        const tokenAddress = allTokens[i];
        console.log(`  Checking token ${i + 1}/${allTokens.length}:`, tokenAddress);
        
        const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
        
        // Check balance (creator should have supply)
        const balance = await tokenContract.methods.balanceOf(userAddress).call();
        console.log(`    Balance:`, balance);
        
        if (BigInt(balance) > 0) {
          console.log(`    ✅ Found token with balance!`);
          
          const [name, symbol, decimals] = await Promise.all([
            tokenContract.methods.name().call(),
            tokenContract.methods.symbol().call(),
            tokenContract.methods.decimals().call()
          ]);
          
          userTokens.push({
            address: web3.utils.toChecksumAddress(tokenAddress),
            name,
            symbol,
            decimals: Number(decimals)
          });
          
          console.log(`    Token details:`, { name, symbol, decimals });
        }
      } catch (err) {
        console.error('    ❌ Error checking token:', err);
      }
    }
    
    console.log("📋 User tokens found:", userTokens.length);
    
    if (userTokens.length === 0) {
      console.log("⚠️ No tokens found for user");
      infoDiv.innerHTML = `
        <div class="no-tokens-found">
          <p>❌ No tokens found for your wallet</p>
          <p>Make sure you:</p>
          <ul>
            <li>Minted a token on MintonShardeum</li>
            <li>Are connected with the same wallet</li>
            <li>Are on Shardeum EVM Testnet (Chain ID: 8119)</li>
          </ul>
          <p><strong>Try:</strong> Switch to Manual mode instead</p>
        </div>
      `;
      formDiv.style.display = 'none';
      return;
    }
    
    // Show token selection if multiple
    if (userTokens.length === 1) {
      console.log("✅ Auto-selecting single token");
      selectToken(userTokens[0]);
    } else {
      console.log("🎯 Showing token selector for", userTokens.length, "tokens");
      showTokenSelector(userTokens);
    }
    
  } catch (error) {
    console.error('❌ Error loading tokens:', error);
    infoDiv.innerHTML = `
      <div class="error-message">
        <p>❌ Failed to load tokens</p>
        <p>Error: ${error.message}</p>
        <p>Please try Manual mode or refresh the page</p>
      </div>
    `;
  }
}

function showTokenSelector(tokens) {
  console.log("📋 Displaying token selector");
  const infoDiv = document.getElementById('auto-token-info');
  
  let html = '<div class="token-selector"><h3>Select Your Token:</h3>';
  tokens.forEach((token, index) => {
    html += `
      <div class="token-option" onclick="selectTokenByIndex(${index})">
        <div class="token-option-info">
          <strong>${token.symbol}</strong> - ${token.name}
          <br><small>${token.address}</small>
        </div>
        <button class="btn-select">Select →</button>
      </div>
    `;
  });
  html += '</div>';
  
  infoDiv.innerHTML = html;
  
  // Store tokens globally for selection
  window.availableTokens = tokens;
  console.log("✅ Token selector displayed");
}

window.selectTokenByIndex = function(index) {
  console.log("🎯 Token selected:", index);
  selectToken(window.availableTokens[index]);
};

function selectToken(token) {
  console.log("✅ Selecting token:", token);
  tokenData = token;
  
  document.getElementById('auto-name').textContent = token.name;
  document.getElementById('auto-symbol').textContent = token.symbol;
  document.getElementById('auto-address').textContent = token.address;
  document.getElementById('auto-decimals').textContent = token.decimals;
  
  document.getElementById('auto-token-info').style.display = 'none';
  document.getElementById('auto-form').style.display = 'block';
  
  console.log("📝 Token form displayed");
}

// AUTO MODE: Logo Upload
document.getElementById('auto-logo-file').addEventListener('change', (e) => {
  console.log("📷 Logo file selected (auto mode)");
  handleLogoUpload(e, 'auto');
});

// AUTO MODE: Submit
document.getElementById('auto-submit-btn').addEventListener('click', () => {
  console.log("🚀 Auto submit clicked");
  if (!tokenData.address || !logoFile) {
    console.error("❌ Missing data:", { tokenData, logoFile });
    alert('Missing token data or logo!');
    return;
  }
  generateInstructions();
});

// MANUAL MODE: Verify
document.getElementById('manual-verify-btn').addEventListener('click', async () => {
  console.log("🔍 Manual verify clicked");
  const address = document.getElementById('manual-address').value.trim();
  
  if (!address || !web3.utils.isAddress(address)) {
    alert('Please enter a valid contract address!');
    return;
  }
  
  const btn = document.getElementById('manual-verify-btn');
  btn.textContent = '⏳ Verifying...';
  btn.disabled = true;
  
  try {
    console.log("📡 Verifying token:", address);
    const contract = new web3.eth.Contract(ERC20_ABI, address);
    const [name, symbol, decimals] = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.decimals().call()
    ]);
    
    console.log("✅ Token verified:", { name, symbol, decimals });
    
    tokenData = {
      address: web3.utils.toChecksumAddress(address),
      name,
      symbol,
      decimals: Number(decimals)
    };
    
    document.getElementById('manual-name').textContent = name;
    document.getElementById('manual-symbol').textContent = symbol;
    document.getElementById('manual-decimals').textContent = decimals;
    
    document.getElementById('manual-token-info').style.display = 'block';
    document.getElementById('manual-logo-section').style.display = 'block';
    
    alert(`✅ Token verified!\n\nName: ${name}\nSymbol: ${symbol}`);
    
  } catch (error) {
    console.error("❌ Verification failed:", error);
    alert('❌ Failed to verify token. Make sure:\n- Address is correct\n- Contract is on Shardeum testnet\n- Contract implements ERC-20');
  } finally {
    btn.textContent = '🔍 Verify Contract';
    btn.disabled = false;
  }
});

// MANUAL MODE: Logo Upload
document.getElementById('manual-logo-file').addEventListener('change', (e) => {
  console.log("📷 Logo file selected (manual mode)");
  handleLogoUpload(e, 'manual');
});

// MANUAL MODE: Submit
document.getElementById('manual-form').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log("🚀 Manual submit clicked");
  if (!tokenData.address || !logoFile) {
    alert('Please verify token and upload logo!');
    return;
  }
  generateInstructions();
});

// Shared Logo Upload Handler
function handleLogoUpload(e, mode) {
  console.log(`📷 Handling logo upload for ${mode} mode`);
  const file = e.target.files[0];
  if (!file) return;
  
  const validationDiv = document.getElementById(`${mode}-logo-validation`);
  const previewDiv = document.getElementById(`${mode}-logo-preview`);
  const submitBtn = document.getElementById(`${mode}-submit-btn`);
  
  validationDiv.innerHTML = '';
  validationDiv.className = 'validation-message';
  submitBtn.disabled = true;
  logoFile = null;
  logoDataUrl = null;
  
  console.log("📊 File info:", { name: file.name, type: file.type, size: file.size });
  
  if (file.type !== 'image/png') {
    console.error("❌ Wrong file type:", file.type);
    validationDiv.innerHTML = '❌ Must be PNG format';
    validationDiv.className = 'validation-message error';
    e.target.value = '';
    previewDiv.innerHTML = '<span class="upload-placeholder">📷<br>Click to upload<br>256x256 PNG</span>';
    return;
  }
  
  if (file.size > 200 * 1024) {
    console.error("❌ File too large:", file.size);
    validationDiv.innerHTML = `❌ File too large: ${(file.size / 1024).toFixed(0)}KB (max 200KB)`;
    validationDiv.className = 'validation-message error';
    e.target.value = '';
    previewDiv.innerHTML = '<span class="upload-placeholder">📷<br>Click to upload<br>256x256 PNG</span>';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      console.log("📐 Image dimensions:", img.width, "x", img.height);
      
      if (img.width !== 256 || img.height !== 256) {
        console.error("❌ Wrong dimensions");
        validationDiv.innerHTML = `❌ Must be 256x256px (yours: ${img.width}x${img.height}px)`;
        validationDiv.className = 'validation-message error';
        e.target.value = '';
        previewDiv.innerHTML = '<span class="upload-placeholder">📷<br>Click to upload<br>256x256 PNG</span>';
        return;
      }
      
      logoFile = file;
      logoDataUrl = event.target.result;
      
      console.log("✅ Logo validated successfully");
      
      validationDiv.innerHTML = `✅ Perfect! ${(file.size / 1024).toFixed(1)}KB`;
      validationDiv.className = 'validation-message success';
      previewDiv.innerHTML = `<img src="${logoDataUrl}" alt="Logo">`;
      submitBtn.disabled = false;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// Generate Instructions
function generateInstructions() {
  console.log("📝 Generating instructions for:", tokenData);
  
  const logoFileName = `${tokenData.address}.png`;
  
  const tokenEntry = {
    address: tokenData.address,
    name: tokenData.name,
    symbol: tokenData.symbol,
    decimals: tokenData.decimals,
    logoURI: `https://raw.githubusercontent.com/BrunoMarshall/MintonDex/main/logos/${logoFileName}`
  };
  
  const jsonString = JSON.stringify(tokenEntry, null, 6);
  const jsonWithComma = ',\n    ' + jsonString.split('\n').join('\n    ');
  
  const instructions = `
<div class="submission-instructions-simple">
  <div class="success-banner">
    <h2>🎉 Almost There!</h2>
    <p>Just 2 simple steps to list <strong>${tokenData.symbol}</strong> on MintonDEX</p>
  </div>
  
  <div class="step-box">
    <div class="step-header">
      <span class="step-num">1</span>
      <h3>Upload Logo to GitHub</h3>
    </div>
    <ol class="simple-steps">
      <li>Download your logo using the button below</li>
      <li>Go to: <a href="https://github.com/BrunoMarshall/MintonDex/upload/main/logos" target="_blank">MintonDex/logos folder</a></li>
      <li>Click "choose your files" and upload <code>${logoFileName}</code></li>
      <li>Commit with message: <code>Add ${tokenData.symbol} logo</code></li>
    </ol>
    
    <button id="download-logo-btn" class="btn-download">
      📥 Download Logo (${logoFileName})
    </button>
  </div>
  
  <div class="step-box">
    <div class="step-header">
      <span class="step-num">2</span>
      <h3>Add Token to List</h3>
    </div>
    <ol class="simple-steps">
      <li>Go to: <a href="https://github.com/BrunoMarshall/MintonDex/edit/main/tokenlist.json" target="_blank">Edit tokenlist.json</a></li>
      <li>Find the last token entry (before the closing <code>]</code>)</li>
      <li>Add a <strong>comma</strong> after the last <code>}</code></li>
      <li>Paste the code below</li>
      <li>Commit with message: <code>Add ${tokenData.symbol} token</code></li>
    </ol>
    
    <div class="code-box-simple">
      <div class="code-actions">
        <button class="btn-copy-code" onclick="copyCode()">📋 Copy Token Entry</button>
      </div>
      <pre><code id="token-json">${escapeHtml(jsonWithComma)}</code></pre>
    </div>
    
    <div class="warning-note">
      ⚠️ <strong>Important:</strong> Make sure there's a comma after the previous token!
    </div>
  </div>
  
  <div class="final-note">
    <h3>✅ That's It!</h3>
    <p>After both commits, <strong>create a pull request</strong>:</p>
    <a href="https://github.com/BrunoMarshall/MintonDex/compare" target="_blank" class="btn-github-large">
      Create Pull Request →
    </a>
    <p class="review-time">We'll review and approve within 24 hours!</p>
  </div>
  
  <div class="token-summary-box">
    <h4>Your Token:</h4>
    <p><strong>${tokenData.symbol}</strong> - ${tokenData.name}</p>
    <p><code>${tokenData.address}</code></p>
  </div>
</div>
  `;
  
  const resultDiv = document.getElementById('submission-result');
  resultDiv.innerHTML = instructions;
  resultDiv.style.display = 'block';
  
  console.log("✅ Instructions generated and displayed");
  
  setTimeout(() => {
    resultDiv.scrollIntoView({ behavior: 'smooth' });
  }, 100);
  
  document.getElementById('download-logo-btn').addEventListener('click', () => {
    console.log("📥 Downloading logo");
    const link = document.createElement('a');
    link.download = logoFileName;
    link.href = logoDataUrl;
    link.click();
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyCode() {
  const code = document.getElementById('token-json').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = event.target;
    const original = btn.textContent;
    btn.textContent = '✅ Copied!';
    btn.style.background = '#00C851';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
    }, 2000);
    console.log("✅ Code copied to clipboard");
  });
}

window.copyCode = copyCode;

// Initialize on page load
window.addEventListener("load", () => {
  console.log("🎬 Submit token page loaded");
  // Check wallet connection after a short delay to let app.js initialize
  setTimeout(checkWalletAndLoadTokens, 500);
});

console.log("✅ Token submission script loaded");