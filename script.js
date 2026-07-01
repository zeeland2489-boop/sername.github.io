let currentUser = null;
let members = [
  { id: "admin", name: "Admin", password: "admin123", isAdmin: true },
  { id: "1209700574918", name: "Administrator", password: "admin123", isAdmin: true }
];
let messages = [];
let menuLinks = [];

function login() {
  const userId = document.getElementById('userId').value.trim();

  if (!userId) {
    alert('Please enter your User ID');
    return;
  }

  let user = members.find(m => m.id === userId);
  
  if (!user) {
    alert('User ID not found. Please contact admin to register.');
    return;
  }

  currentUser = user;
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('chatPage').classList.remove('hidden');
  document.getElementById('userDisplay').textContent = `Welcome, ${currentUser.name} 👋`;
  
  if (currentUser.isAdmin) {
    document.getElementById('adminBtn').classList.remove('hidden');
    updateMembersList();
    document.getElementById('addMenuSection').classList.remove('hidden');
  }

  document.getElementById('userId').value = '';
  displayMessages();
  displayMenuLinks();
  loadMenuFromStorage();
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
  }
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();

  if (!text || !currentUser) return;

  const message = {
    userId: currentUser.id,
    username: currentUser.name,
    text: text,
    timestamp: new Date().toLocaleTimeString(),
    isFile: false
  };

  messages.push(message);
  input.value = '';
  displayMessages();
  scrollToBottom();
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

function displayMessages() {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '';

  messages.forEach(msg => {
    const msgEl = document.createElement('div');
    msgEl.className = msg.userId === currentUser.id ? 'message own' : 'message other';
    
    let content = msg.text;
    let mediaContent = '';

    if (msg.isFile) {
      const fileExtension = msg.fileName.split('.').pop().toLowerCase();
      const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(fileExtension);
      const isVideo = ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(fileExtension);

      if (isAudio) {
        content = `<span>🎵 ${msg.fileName}</span>`;
        const audioMime = getMimeType(msg.fileUrl);
        mediaContent = `<div class="message-media"><audio controls style="width: 100%;"><source src="${msg.fileUrl}" type="${audioMime}"></audio></div>`;
      } else if (isVideo) {
        content = `<span>🎬 ${msg.fileName}</span>`;
        const videoMime = getMimeType(msg.fileUrl);
        mediaContent = `<div class="message-media"><video controls style="width: 100%;"><source src="${msg.fileUrl}" type="${videoMime}"></video></div>`;
      } else {
        content = `<a class="media-link" href="${msg.fileUrl}" download="${msg.fileName}">📥 ${msg.fileName}</a>`;
      }
    }
    
    msgEl.innerHTML = `
      <div class="message-user">${msg.username}</div>
      <div class="message-content">${content}</div>
      ${mediaContent}
      <div class="message-time">${msg.timestamp}</div>
    `;
    messagesDiv.appendChild(msgEl);
  });
}

function toggleAdminPanel() {
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

function addMenuLink() {
  const title = document.getElementById('menuTitle').value.trim();
  const url = document.getElementById('menuUrl').value.trim();
  const type = document.getElementById('menuType').value;

  if (!title || !url) {
    alert('Please enter title and URL/HTML content');
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
  alert('✅ Menu link added successfully!');
}

function deleteMenuLink(id) {
  if (confirm('Delete this menu link?')) {
    menuLinks = menuLinks.filter(m => m.id !== id);
    saveMenuToStorage();
    displayMenuLinks();
    updateMenuManageList();
    alert('✅ Menu link deleted!');
  }
}

function openMenuLink(menuItem) {
  if (menuItem.type === 'url') {
    window.open(menuItem.url, '_blank');
  } else if (menuItem.type === 'html') {
    document.getElementById('modalTitle').textContent = menuItem.title;
    document.getElementById('modalBody').innerHTML = menuItem.url;
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
    menuDiv.innerHTML = `
      <a onclick="openMenuLink({id: ${item.id}, title: '${item.title.replace(/'/g, "\\'")}', url: '${item.url.replace(/'/g, "\\'")}', type: '${item.type}'})">${item.title}</a>
    `;
    menuContainer.appendChild(menuDiv);
  });
}

function updateMenuManageList() {
  const list = document.getElementById('menuManageList');
  list.innerHTML = '';

  if (!currentUser.isAdmin) return;

  menuLinks.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span><strong>${item.title}</strong> (${item.type === 'url' ? '🔗' : '📄'})</span>
      <button class="delete-btn" onclick="deleteMenuLink(${item.id})">Delete</button>
    `;
    list.appendChild(li);
  });
}

function saveMenuToStorage() {
  localStorage.setItem('chatMenuLinks', JSON.stringify(menuLinks));
}

function loadMenuFromStorage() {
  const saved = localStorage.getItem('chatMenuLinks');
  if (saved) {
    menuLinks = JSON.parse(saved);
    displayMenuLinks();
    updateMenuManageList();
  }
}

function addMember() {
  const memberId = document.getElementById('newMemberId').value.trim();
  const memberName = document.getElementById('newMemberName').value.trim();
  const memberPass = document.getElementById('newMemberPass').value.trim();

  if (!memberId || !memberName || !memberPass) {
    alert('Please enter Member ID, Name, and Password');
    return;
  }

  const exists = members.find(m => m.id === memberId);
  if (exists) {
    alert('Member ID already exists');
    return;
  }

  members.push({ id: memberId, name: memberName, password: memberPass, isAdmin: false });
  document.getElementById('newMemberId').value = '';
  document.getElementById('newMemberName').value = '';
  document.getElementById('newMemberPass').value = '';
  updateMembersList();
  alert('✅ Member added successfully!');
}

function deleteMember(id) {
  if (id === 'admin' || id === '1209700574918') {
    alert('Cannot delete admin account');
    return;
  }

  if (confirm('Delete this member?')) {
    members = members.filter(m => m.id !== id);
    updateMembersList();
    alert('✅ Member deleted successfully!');
  }
}

function updateMembersList() {
  const list = document.getElementById('membersList');
  list.innerHTML = '';

  members.forEach(member => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span><strong>${member.name}</strong> (ID: ${member.id})${member.isAdmin ? ' 👑' : ''}</span>
      ${member.id !== 'admin' && member.id !== '1209700574918' ? `<button class="delete-btn" onclick="deleteMember('${member.id}')">Delete</button>` : ''}
    `;
    list.appendChild(li);
  });
}

function scrollToBottom() {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

document.getElementById('messageInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendMessage();
});

document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const message = {
        userId: currentUser.id,
        username: currentUser.name,
        text: `File: ${file.name}`,
        fileName: file.name,
        fileUrl: event.target.result,
        timestamp: new Date().toLocaleTimeString(),
        isFile: true
      };
      messages.push(message);
      displayMessages();
      scrollToBottom();
    };
    reader.readAsDataURL(file);
    document.getElementById('fileInput').value = '';
  }
});

document.getElementById('htmlModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeHtmlModal();
  }
});