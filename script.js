// Enhanced Chat Application with Security Improvements

let currentUser = null;
let members = [
  { id: "admin", name: "Admin", isAdmin: true },
  { id: "1209700574918", name: "Administrator", isAdmin: true }
];
let messages = [];
let menuLinks = [];

// Configuration
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_MESSAGE_LENGTH = 5000;
const ALLOWED_FILE_TYPES = [
  'image/', 'video/', 'audio/',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Utility Functions
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeHTML(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showNotification(message, type = 'info') {
  // Simple notification (can be enhanced with a toast library)
  const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`[${emoji}] ${message}`);
  // For production, use a proper notification library
  alert(`${emoji} ${message}`);
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  // Minimum 6 characters
  return password && password.length >= 6;
}

// Authentication Functions
function login() {
  const userIdInput = document.getElementById('userId');
  const userId = userIdInput.value.trim();

  if (!userId) {
    showNotification('Please enter your User ID', 'error');
    userIdInput.focus();
    return;
  }

  if (userId.length < 3) {
    showNotification('User ID must be at least 3 characters', 'error');
    return;
  }

  let user = members.find(m => m.id === userId);

  if (!user) {
    showNotification('User ID not found. Please contact admin to register.', 'error');
    return;
  }

  currentUser = user;
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('chatPage').classList.remove('hidden');
  document.getElementById('userDisplay').textContent = `Welcome, ${escapeHTML(currentUser.name)} 👋`;

  if (currentUser.isAdmin) {
    document.getElementById('adminBtn').classList.remove('hidden');
    updateMembersList();
    document.getElementById('addMenuSection').classList.remove('hidden');
  }

  userIdInput.value = '';
  displayMessages();
  displayMenuLinks();
  loadMenuFromStorage();
  showNotification('Logged in successfully!', 'success');
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    currentUser = null;
    document.getElementById('chatPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('userId').value = '';
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('sidebar').classList.add('hidden');
    document.getElementById('htmlModal').classList.add('hidden');
    document.getElementById('userId').focus();
    showNotification('Logged out successfully', 'success');
  }
}

// Message Functions
function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();

  if (!text || !currentUser) return;

  if (text.length > MAX_MESSAGE_LENGTH) {
    showNotification(`Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`, 'error');
    return;
  }

  const message = {
    id: Date.now(),
    userId: currentUser.id,
    username: currentUser.name,
    text: text,
    timestamp: new Date().toLocaleTimeString('th-TH'),
    isFile: false
  };

  messages.push(message);
  input.value = '';
  displayMessages();
  scrollToBottom();
}

function displayMessages() {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '';

  if (messages.length === 0) {
    messagesDiv.innerHTML = '<p style="text-align: center; color: #999; font-size: 12px;">No messages yet</p>';
    return;
  }

  messages.forEach(msg => {
    const msgEl = document.createElement('div');
    msgEl.className = msg.userId === currentUser.id ? 'message own' : 'message other';
    msgEl.setAttribute('role', 'listitem');

    let content = escapeHTML(msg.text);
    let mediaContent = '';

    if (msg.isFile) {
      const fileExtension = msg.fileName.split('.').pop().toLowerCase();
      const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(fileExtension);
      const isVideo = ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(fileExtension);

      const safeFileName = escapeHTML(msg.fileName);
      const safeFileUrl = encodeURI(msg.fileUrl);

      if (isAudio) {
        content = `<span>🎵 ${safeFileName}</span>`;
        const audioMime = getMimeType(msg.fileUrl);
        mediaContent = `<div class="message-media"><audio controls><source src="${safeFileUrl}" type="${audioMime}"></audio></div>`;
      } else if (isVideo) {
        content = `<span>🎬 ${safeFileName}</span>`;
        const videoMime = getMimeType(msg.fileUrl);
        mediaContent = `<div class="message-media"><video controls><source src="${safeFileUrl}" type="${videoMime}"></video></div>`;
      } else {
        content = `<a class="media-link" href="${safeFileUrl}" download="${safeFileName}">📥 ${safeFileName}</a>`;
      }
    }

    msgEl.innerHTML = `
      <div class="message-user">${escapeHTML(msg.username)}</div>
      <div class="message-content">${content}</div>
      ${mediaContent}
      <div class="message-time">${escapeHTML(msg.timestamp)}</div>
    `;
    messagesDiv.appendChild(msgEl);
  });
}

function getMimeType(url) {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('.mp4') || urlLower.includes('video/mp4')) return 'video/mp4';
  else if (urlLower.includes('.webm')) return 'video/webm';
  else if (urlLower.includes('.avi')) return 'video/avi';
  else if (urlLower.includes('.mov')) return 'video/quicktime';
  else if (urlLower.includes('.mp3') || urlLower.includes('audio/mpeg')) return 'audio/mpeg';
  else if (urlLower.includes('.wav')) return 'audio/wav';
  else if (urlLower.includes('.ogg')) return 'audio/ogg';
  else if (urlLower.includes('.m4a')) return 'audio/mp4';
  else if (urlLower.includes('.flac')) return 'audio/flac';

  return 'application/octet-stream';
}

function scrollToBottom() {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Admin Panel Functions
function toggleAdminPanel() {
  if (!currentUser?.isAdmin) {
    showNotification('Admin access required', 'error');
    return;
  }
  const panel = document.getElementById('adminPanel');
  panel.classList.toggle('hidden');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('hidden');
}

function toggleAddMenu() {
  const addMenu = document.getElementById('addMenuSection');
  addMenu.classList.toggle('hidden');
}

// Menu Management Functions
function addMenuLink() {
  if (!currentUser?.isAdmin) {
    showNotification('Admin access required', 'error');
    return;
  }

  const title = document.getElementById('menuTitle').value.trim();
  const url = document.getElementById('menuUrl').value.trim();
  const type = document.getElementById('menuType').value;

  if (!title || !url) {
    showNotification('Please enter title and URL/HTML content', 'error');
    return;
  }

  if (title.length > 100) {
    showNotification('Title is too long (max 100 characters)', 'error');
    return;
  }

  const menuItem = {
    id: Date.now(),
    title: title,
    url: url,
    type: type
  };

  menuLinks.push(menuItem);
  saveMenuToStorage();
  displayMenuLinks();
  updateMenuManageList();

  document.getElementById('menuTitle').value = '';
  document.getElementById('menuUrl').value = '';
  document.getElementById('menuType').value = 'url';
  toggleAddMenu();
  showNotification('Menu link added successfully!', 'success');
}

function deleteMenuLink(id) {
  if (!currentUser?.isAdmin) {
    showNotification('Admin access required', 'error');
    return;
  }

  if (confirm('Delete this menu link?')) {
    menuLinks = menuLinks.filter(m => m.id !== id);
    saveMenuToStorage();
    displayMenuLinks();
    updateMenuManageList();
    showNotification('Menu link deleted!', 'success');
  }
}

function openMenuLink(id) {
  const menuItem = menuLinks.find(m => m.id === id);
  if (!menuItem) return;

  if (menuItem.type === 'url') {
    // Validate URL
    try {
      const url = new URL(menuItem.url);
      window.open(menuItem.url, '_blank');
    } catch (e) {
      showNotification('Invalid URL format', 'error');
    }
  } else if (menuItem.type === 'html') {
    document.getElementById('modalTitle').textContent = escapeHTML(menuItem.title);
    // Create iframe for safer HTML display
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '400px';
    iframe.style.border = 'none';
    iframe.sandbox.add('allow-scripts');
    modalBody.appendChild(iframe);
    iframe.srcdoc = menuItem.url;
    document.getElementById('htmlModal').classList.remove('hidden');
  }
}

function closeHtmlModal() {
  document.getElementById('htmlModal').classList.add('hidden');
}

function displayMenuLinks() {
  const menuContainer = document.getElementById('menuLinks');
  menuContainer.innerHTML = '';

  if (menuLinks.length === 0) {
    menuContainer.innerHTML = '<p style="text-align: center; color: #999; font-size: 12px;">No menu links yet</p>';
    return;
  }

  menuLinks.forEach(item => {
    const menuDiv = document.createElement('div');
    menuDiv.className = 'menu-item';
    menuDiv.setAttribute('role', 'listitem');
    const safeTitle = escapeHTML(item.title);
    menuDiv.innerHTML = `
      <button class="menu-link-btn" type="button" data-menu-id="${item.id}" aria-label="Open ${safeTitle}">${safeTitle}</button>
    `;
    menuDiv.querySelector('.menu-link-btn').addEventListener('click', () => {
      openMenuLink(item.id);
    });
    menuContainer.appendChild(menuDiv);
  });
}

function updateMenuManageList() {
  const list = document.getElementById('menuManageList');
  list.innerHTML = '';

  if (!currentUser?.isAdmin) return;

  menuLinks.forEach(item => {
    const li = document.createElement('li');
    li.setAttribute('role', 'listitem');
    const safeTitle = escapeHTML(item.title);
    li.innerHTML = `
      <span><strong>${safeTitle}</strong> (${item.type === 'url' ? '🔗' : '📄'})</span>
      <button type="button" class="delete-btn" data-menu-id="${item.id}" aria-label="Delete ${safeTitle}">Delete</button>
    `;
    li.querySelector('.delete-btn').addEventListener('click', () => {
      deleteMenuLink(item.id);
    });
    list.appendChild(li);
  });
}

function saveMenuToStorage() {
  try {
    localStorage.setItem('chatMenuLinks', JSON.stringify(menuLinks));
  } catch (e) {
    console.error('Failed to save menu:', e);
    showNotification('Failed to save menu links', 'error');
  }
}

function loadMenuFromStorage() {
  try {
    const saved = localStorage.getItem('chatMenuLinks');
    if (saved) {
      menuLinks = JSON.parse(saved);
      displayMenuLinks();
      if (currentUser?.isAdmin) {
        updateMenuManageList();
      }
    }
  } catch (e) {
    console.error('Failed to load menu:', e);
  }
}

// Member Management Functions
function addMember() {
  if (!currentUser?.isAdmin) {
    showNotification('Admin access required', 'error');
    return;
  }

  const memberId = document.getElementById('newMemberId').value.trim();
  const memberName = document.getElementById('newMemberName').value.trim();
  const memberPass = document.getElementById('newMemberPass').value.trim();

  if (!memberId || !memberName || !memberPass) {
    showNotification('Please enter Member ID, Name, and Password', 'error');
    return;
  }

  if (memberId.length < 3) {
    showNotification('Member ID must be at least 3 characters', 'error');
    return;
  }

  if (memberName.length < 2) {
    showNotification('Member name must be at least 2 characters', 'error');
    return;
  }

  if (!validatePassword(memberPass)) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }

  const exists = members.find(m => m.id === memberId);
  if (exists) {
    showNotification('Member ID already exists', 'error');
    return;
  }

  members.push({
    id: memberId,
    name: memberName,
    // In production, hash this server-side
    isAdmin: false
  });

  document.getElementById('newMemberId').value = '';
  document.getElementById('newMemberName').value = '';
  document.getElementById('newMemberPass').value = '';
  updateMembersList();
  showNotification('Member added successfully!', 'success');
}

function deleteMember(id) {
  if (!currentUser?.isAdmin) {
    showNotification('Admin access required', 'error');
    return;
  }

  if (id === 'admin' || id === '1209700574918') {
    showNotification('Cannot delete default admin account', 'error');
    return;
  }

  if (confirm('Delete this member? This action cannot be undone.')) {
    members = members.filter(m => m.id !== id);
    updateMembersList();
    showNotification('Member deleted successfully!', 'success');
  }
}

function updateMembersList() {
  const list = document.getElementById('membersList');
  list.innerHTML = '';

  members.forEach(member => {
    const li = document.createElement('li');
    li.setAttribute('role', 'listitem');
    const safeName = escapeHTML(member.name);
    const safeId = escapeHTML(member.id);
    li.innerHTML = `
      <span><strong>${safeName}</strong> (ID: ${safeId})${member.isAdmin ? ' 👑' : ''}</span>
      ${member.id !== 'admin' && member.id !== '1209700574918' ? `<button type="button" class="delete-btn" data-member-id="${member.id}" aria-label="Delete ${safeName}">Delete</button>` : ''}
    `;
    const deleteBtn = li.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        deleteMember(member.id);
      });
    }
    list.appendChild(li);
  });
}

// File Upload Function
function handleFileUpload(file) {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    showNotification(`File is too large. Maximum ${MAX_FILE_SIZE / (1024 * 1024)}MB allowed.`, 'error');
    return;
  }

  // Validate file type (optional - for production)
  // if (!ALLOWED_FILE_TYPES.some(type => file.type.startsWith(type))) {
  //   showNotification('File type not allowed', 'error');
  //   return;
  // }

  const reader = new FileReader();
  reader.onload = function (event) {
    const message = {
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.name,
      text: `File: ${file.name}`,
      fileName: file.name,
      fileUrl: event.target.result,
      timestamp: new Date().toLocaleTimeString('th-TH'),
      isFile: true
    };
    messages.push(message);
    displayMessages();
    scrollToBottom();
    showNotification('File uploaded successfully!', 'success');
  };
  reader.onerror = function () {
    showNotification('Failed to read file', 'error');
  };
  reader.readAsDataURL(file);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  // Login button and input
  const loginBtn = document.querySelector('.login-btn');
  const userIdInput = document.getElementById('userId');

  loginBtn.addEventListener('click', login);
  userIdInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') login();
  });

  // Logout button
  document.querySelector('.logout-btn').addEventListener('click', logout);

  // Chat message input
  const messageInput = document.getElementById('messageInput');
  messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Message send button
  document.querySelector('.send-btn').addEventListener('click', sendMessage);

  // File upload
  const fileBtn = document.querySelector('.file-btn');
  const fileInput = document.getElementById('fileInput');
  fileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
      this.value = '';
    }
  });

  // Menu buttons
  document.querySelector('.navbar-nav').addEventListener('click', function (e) {
    if (e.target.classList.contains('nav-item')) {
      if (e.target.textContent.includes('เมนู')) {
        toggleSidebar();
      } else if (e.target.textContent.includes('Admin')) {
        toggleAdminPanel();
      }
    }
  });

  document.querySelector('.close-sidebar').addEventListener('click', toggleSidebar);

  // Admin panel buttons
  const adminPanel = document.getElementById('adminPanel');
  adminPanel.addEventListener('click', function (e) {
    if (e.target.classList.contains('add-btn')) {
      if (e.target.textContent.includes('Member')) {
        addMember();
      } else if (e.target.textContent.includes('Menu')) {
        toggleAddMenu();
      } else if (e.target.textContent.includes('Link')) {
        addMenuLink();
      }
    }
  });

  const addMenuSection = document.getElementById('addMenuSection');
  addMenuSection.addEventListener('click', function (e) {
    if (e.target.classList.contains('cancel-btn')) {
      toggleAddMenu();
    } else if (e.target.classList.contains('add-btn')) {
      addMenuLink();
    }
  });

  // Modal close
  document.getElementById('htmlModal').addEventListener('click', function (e) {
    if (e.target === this) {
      closeHtmlModal();
    }
  });

  document.querySelector('.close-btn').addEventListener('click', closeHtmlModal);
});

// Initialize
loadMenuFromStorage();