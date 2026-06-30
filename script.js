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