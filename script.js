let selectedFile = null;

function showTime() {
  const currentTime = new Date().toUTCString();
  const timeElement = document.getElementById('currentTime');
  if (timeElement) {
    timeElement.innerHTML = currentTime;
  }
}

showTime();
setInterval(showTime, 1000);

// Authentication Functions
function showLoginModal() {
  document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.add('hidden');
  document.getElementById('loginError').classList.remove('show');
}

function showRegisterModal() {
  document.getElementById('registerModal').classList.remove('hidden');
}

function closeRegisterModal() {
  document.getElementById('registerModal').classList.add('hidden');
  document.getElementById('registerError').classList.remove('show');
}

function switchToRegister() {
  closeLoginModal();
  showRegisterModal();
}

function switchToLogin() {
  closeRegisterModal();
  showLoginModal();
}

// Get user from localStorage
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Update UI based on login status
function updateAuthUI() {
  const user = getCurrentUser();
  const authButtons = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');
  
  if (user) {
    authButtons.style.display = 'none';
    userMenu.style.display = 'flex';
    document.getElementById('userName').textContent = '👤 ' + user.name;
  } else {
    authButtons.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

// Login Form Handler
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email, joinDate: user.joinDate }));
    updateAuthUI();
    closeLoginModal();
    document.getElementById('loginForm').reset();
  } else {
    errorDiv.textContent = 'Invalid email or password';
    errorDiv.classList.add('show');
  }
});

// Register Form Handler
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirm = document.getElementById('registerConfirm').value;
  const errorDiv = document.getElementById('registerError');
  
  if (password !== confirm) {
    errorDiv.textContent = 'Passwords do not match';
    errorDiv.classList.add('show');
    return;
  }
  
  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    errorDiv.classList.add('show');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.find(u => u.email === email)) {
    errorDiv.textContent = 'Email already exists';
    errorDiv.classList.add('show');
    return;
  }
  
  const joinDate = new Date().toLocaleDateString();
  users.push({ name, email, password, joinDate, favorites: [], settings: { emailNotif: true, chatNotif: true } });
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify({ name, email, joinDate }));
  
  updateAuthUI();
  closeRegisterModal();
  document.getElementById('registerForm').reset();
});

// Logout Function
function logout() {
  if(confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('currentUser');
    updateAuthUI();
    closeDashboard();
    closeSettings();
  }
}

// Initialize
updateAuthUI();

// Dashboard Functions
function showDashboard() {
  const user = getCurrentUser();
  if (!user) return;
  
  document.getElementById('dashboard').classList.remove('hidden');
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userData = users.find(u => u.email === user.email);
  
  document.getElementById('profileInfo').innerHTML = `
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
  `;
  
  document.getElementById('memberSince').textContent = user.joinDate || 'N/A';
  
  displayFavorites();
}

function closeDashboard() {
  document.getElementById('dashboard').classList.add('hidden');
}

function displayFavorites() {
  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userData = users.find(u => u.email === user.email);
  
  const favList = document.getElementById('favoritesList');
  if (userData.favorites && userData.favorites.length > 0) {
    favList.innerHTML = userData.favorites.map((fav, idx) => `
      <div class="favorite-item">
        <span>⭐ ${fav}</span>
        <button onclick="removeFavorite(${idx})">Remove</button>
      </div>
    `).join('');
  } else {
    favList.innerHTML = '<p style="color: #999;">No favorites yet</p>';
  }
}

function addFavorite() {
  const input = document.getElementById('favInput');
  const fav = input.value.trim();
  
  if (!fav) return;
  
  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userData = users.find(u => u.email === user.email);
  
  if (!userData.favorites) userData.favorites = [];
  userData.favorites.push(fav);
  
  localStorage.setItem('users', JSON.stringify(users));
  input.value = '';
  displayFavorites();
}

function removeFavorite(idx) {
  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userData = users.find(u => u.email === user.email);
  
  userData.favorites.splice(idx, 1);
  localStorage.setItem('users', JSON.stringify(users));
  displayFavorites();
}

function deleteAccount() {
  if(confirm('Are you sure? This cannot be undone!')) {
    const user = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.email === user.email);
    
    users.splice(idx, 1);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem('currentUser');
    
    updateAuthUI();
    closeDashboard();
    alert('Account deleted successfully');
  }
}

// Settings Functions
function showSettings() {
  const user = getCurrentUser();
  if (!user) return;
  
  document.getElementById('settings').classList.remove('hidden');
  loadSettings();
}

function closeSettings() {
  document.getElementById('settings').classList.add('hidden');
}

function loadSettings() {
  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userData = users.find(u => u.email === user.email);
  
  if (userData.settings) {
    document.getElementById('emailNotif').checked = userData.settings.emailNotif;
    document.getElementById('chatNotif').checked = userData.settings.chatNotif;
  }
}

function saveSettings() {
  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userData = users.find(u => u.email === user.email);
  
  userData.settings = {
    emailNotif: document.getElementById('emailNotif').checked,
    chatNotif: document.getElementById('chatNotif').checked
  };
  
  localStorage.setItem('users', JSON.stringify(users));
  alert('Settings saved successfully!');
}

document.getElementById('changePasswordForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const current = document.getElementById('currentPassword').value;
  const newPass = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmNewPassword').value;
  const errorDiv = document.getElementById('passwordError');
  
  const user = getCurrentUser();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userData = users.find(u => u.email === user.email);
  
  if (userData.password !== current) {
    errorDiv.textContent = 'Current password is incorrect';
    errorDiv.classList.add('show');
    return;
  }
  
  if (newPass !== confirm) {
    errorDiv.textContent = 'New passwords do not match';
    errorDiv.classList.add('show');
    return;
  }
  
  userData.password = newPass;
  localStorage.setItem('users', JSON.stringify(users));
  errorDiv.classList.remove('show');
  alert('Password changed successfully!');
  document.getElementById('changePasswordForm').reset();
});

// Members List
function toggleMembersList() {
  const membersList = document.getElementById('membersList');
  membersList.classList.toggle('hidden');
  
  if (!membersList.classList.contains('hidden')) {
    displayMembers();
  }
}

function displayMembers() {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const container = document.getElementById('membersContainer');
  
  if (users.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999;">No members yet</p>';
    return;
  }
  
  container.innerHTML = users.map(u => `
    <div class="member-item">
      <h4>👤 ${u.name}</h4>
      <p>📧 ${u.email}</p>
      <p>📅 Joined: ${u.joinDate}</p>
    </div>
  `).join('');
}

// Chat Functions
function toggleChat() {
  const chatSection = document.getElementById('chatSection');
  if (chatSection) {
    chatSection.classList.toggle('hidden');
    if (!chatSection.classList.contains('hidden')) {
      document.getElementById('chatInput').focus();
    }
  }
}

function isMediaUrl(url) {
  const mediaExtensions = ['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.m4a'];
  const urlLower = url.toLowerCase();
  return mediaExtensions.some(ext => urlLower.includes(ext)) || 
         url.includes('youtube.com') || url.includes('youtu.be');
}

function isYoutubeUrl(url) {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function getYoutubeEmbedUrl(url) {
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  }
  return `https://www.youtube.com/embed/${videoId}`;
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  
  if ((input.value.trim() !== '' || selectedFile) && messages) {
    const inputValue = input.value.trim();
    
    if (inputValue !== '') {
      if (isMediaUrl(inputValue)) {
        const fileContainer = document.createElement('div');
        
        if (isYoutubeUrl(inputValue)) {
          const iframe = document.createElement('iframe');
          iframe.src = getYoutubeEmbedUrl(inputValue);
          iframe.style.width = '100%';
          iframe.style.height = '200px';
          iframe.allowFullscreen = true;
          iframe.style.borderRadius = '4px';
          fileContainer.appendChild(iframe);
        } else if (inputValue.toLowerCase().endsWith('.mp3') || 
                   inputValue.toLowerCase().endsWith('.wav') || 
                   inputValue.toLowerCase().endsWith('.m4a')) {
          const audio = document.createElement('audio');
          audio.src = inputValue;
          audio.controls = true;
          audio.style.width = '100%';
          audio.style.marginTop = '5px';
          fileContainer.appendChild(audio);
        } else {
          const video = document.createElement('video');
          video.src = inputValue;
          video.controls = true;
          video.style.maxWidth = '100%';
          video.style.marginTop = '5px';
          video.style.borderRadius = '4px';
          fileContainer.appendChild(video);
        }
        
        messages.appendChild(fileContainer);
      } else {
        const userMessage = document.createElement('p');
        userMessage.textContent = 'You: ' + inputValue;
        messages.appendChild(userMessage);
      }
    }
    
    if (selectedFile) {
      const fileType = selectedFile.type;
      const fileName = selectedFile.name;
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const fileContainer = document.createElement('div');
        
        if (fileType.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = e.target.result;
          fileContainer.appendChild(img);
        } else if (fileType.startsWith('video/')) {
          const video = document.createElement('video');
          video.src = e.target.result;
          video.controls = true;
          video.style.maxWidth = '100%';
          fileContainer.appendChild(video);
        } else if (fileType.startsWith('audio/')) {
          const audio = document.createElement('audio');
          audio.src = e.target.result;
          audio.controls = true;
          audio.style.width = '100%';
          fileContainer.appendChild(audio);
        } else {
          const fileLink = document.createElement('p');
          fileLink.textContent = '📄 ' + fileName;
          fileLink.style.cursor = 'pointer';
          fileLink.style.color = '#5C6AC4';
          fileContainer.appendChild(fileLink);
        }
        
        messages.appendChild(fileContainer);
        messages.scrollTop = messages.scrollHeight;
      };
      
      reader.readAsDataURL(selectedFile);
      selectedFile = null;
      document.getElementById('chatFile').value = '';
    }
    
    messages.scrollTop = messages.scrollHeight;
    input.value = '';
    input.placeholder = 'Type a message...';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const chatInput = document.getElementById('chatInput');
  const chatFile = document.getElementById('chatFile');
  
  if (chatInput) {
    chatInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  if (chatFile) {
    chatFile.addEventListener('change', function(event) {
      selectedFile = event.target.files[0];
      if (selectedFile) {
        const chatInput = document.getElementById('chatInput');
        chatInput.placeholder = 'File: ' + selectedFile.name;
      }
    });
  }
});