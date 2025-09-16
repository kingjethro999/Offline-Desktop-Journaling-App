const { ipcRenderer } = require('electron');

// DOM Elements
const journalContent = document.getElementById('journal-content');
const currentDateHeader = document.getElementById('current-date');
const dateList = document.getElementById('date-list');
const newEntryBtn = document.getElementById('new-entry-btn');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const editorMessage = document.getElementById('editor-message');
const saveStatus = document.getElementById('save-status');

// State variables
let currentDate = '';
let isOnline = true;
let entryDates = [];
let saveTimeout = null;
let lastSavedContent = '';

// Format date to YYYY-MM-DD (for file storage)
function formatDateForStorage(date) {
  return date.toISOString().split('T')[0];
}

// Format date for display (e.g., "April 25, 2025")
function formatDateForDisplay(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Update network status UI
function updateNetworkStatusUI(online) {
  isOnline = online;
  
  statusIndicator.classList.remove('online', 'offline');
  
  if (online) {
    statusIndicator.classList.add('online');
    statusText.textContent = 'Online - Cannot Edit';
    journalContent.disabled = true;
    editorMessage.textContent = 'Please turn off your WiFi to start writing.';
    editorMessage.classList.add('visible');
  } else {
    statusIndicator.classList.add('offline');
    statusText.textContent = 'Offline - Ready to Write';
    journalContent.disabled = false;
    editorMessage.classList.remove('visible');
  }
}

// Show temporary save status message
function showSaveStatus(message) {
  saveStatus.textContent = message;
  saveStatus.classList.add('visible');
  
  setTimeout(() => {
    saveStatus.classList.remove('visible');
  }, 2000);
}

// Load entry for a specific date
async function loadEntry(date) {
  try {
    currentDate = date;
    
    // Update UI
    currentDateHeader.textContent = formatDateForDisplay(date);
    
    // Get entry content from main process
    const entry = await ipcRenderer.invoke('read-entry', date);
    journalContent.value = entry.content;
    lastSavedContent = entry.content;
    
    // Update active state in sidebar
    const dateItems = document.querySelectorAll('.date-item');
    dateItems.forEach(item => {
      if (item.dataset.date === date) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Check network status to determine if editing is allowed
    const online = await ipcRenderer.invoke('check-network-status');
    updateNetworkStatusUI(online);
    
  } catch (err) {
    console.error('Error loading entry:', err);
  }
}

// Save current entry
async function saveEntry() {
  if (!currentDate) return;
  
  const content = journalContent.value;
  
  // Don't save if content hasn't changed
  if (content === lastSavedContent) return;
  
  try {
    await ipcRenderer.invoke('save-entry', {
      date: currentDate,
      content: content
    });
    
    lastSavedContent = content;
    showSaveStatus('Saved');
    
    // Refresh date list to ensure new entry appears
    loadDateList();
    
  } catch (err) {
    console.error('Error saving entry:', err);
    showSaveStatus('Error saving');
  }
}

// Auto-save with debounce
function debouncedSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveEntry();
  }, 1000); // 1 second delay
}

// Create a new entry for today
async function createNewEntry() {
  const today = formatDateForStorage(new Date());
  currentDate = today;
  
  // Clear current content
  journalContent.value = '';
  lastSavedContent = '';
  
  // Update UI
  currentDateHeader.textContent = formatDateForDisplay(today);
  
  // Try to load existing entry for today (if any)
  await loadEntry(today);
  
  // Focus on the text area if offline
  if (!isOnline) {
    journalContent.focus();
  }
}

// Load the list of entry dates from main process
async function loadDateList() {
  try {
    entryDates = await ipcRenderer.invoke('get-entry-dates');
    
    // Clear existing list
    while (dateList.firstChild) {
      dateList.removeChild(dateList.firstChild);
    }
    
    if (entryDates.length === 0) {
      const noEntriesMsg = document.createElement('div');
      noEntriesMsg.className = 'no-entries-message';
      noEntriesMsg.textContent = 'No entries yet. Start writing!';
      dateList.appendChild(noEntriesMsg);
    } else {
      // Add date items to list
      entryDates.forEach(date => {
        const dateItem = document.createElement('div');
        dateItem.className = 'date-item';
        if (date === currentDate) {
          dateItem.classList.add('active');
        }
        dateItem.textContent = formatDateForDisplay(date);
        dateItem.dataset.date = date;
        dateItem.addEventListener('click', () => loadEntry(date));
        dateList.appendChild(dateItem);
      });
    }
  } catch (err) {
    console.error('Error loading date list:', err);
  }
}

// Initialize the application
async function initApp() {
  // Listen for network status updates from main process
  ipcRenderer.on('network-status', (event, online) => {
    updateNetworkStatusUI(online);
  });
  
  // Load the list of dates
  await loadDateList();
  
  // Create a new entry if no entries exist
  if (entryDates.length === 0) {
    await createNewEntry();
  } else {
    // Load the most recent entry
    await loadEntry(entryDates[0]);
  }
  
  // Check current network status
  const online = await ipcRenderer.invoke('check-network-status');
  updateNetworkStatusUI(online);
}

// Event Listeners
newEntryBtn.addEventListener('click', createNewEntry);

journalContent.addEventListener('input', () => {
  if (!isOnline) {
    debouncedSave();
  }
});

// Initialize the app
initApp();

