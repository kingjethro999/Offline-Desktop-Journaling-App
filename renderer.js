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
const toolbar = document.getElementById('toolbar');
const wordCountText = document.getElementById('word-count-text');
const headingSelect = document.getElementById('heading-select');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const templatesBtn = document.getElementById('templates-btn');
const templatesModal = document.getElementById('templates-modal');
const closeTemplatesModal = document.getElementById('close-templates-modal');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModal = document.getElementById('close-settings-modal');
const themeSelect = document.getElementById('theme-select');
const autoSaveInterval = document.getElementById('auto-save-interval');
const exportDataBtn = document.getElementById('export-data-btn');
const importDataBtn = document.getElementById('import-data-btn');
const moodTracker = document.getElementById('mood-tracker');
const writingStreak = document.getElementById('writing-streak');
const streakText = document.querySelector('.streak-text');
const lockEntryBtn = document.getElementById('lock-entry-btn');
const setupPinBtn = document.getElementById('setup-pin-btn');
const changePinBtn = document.getElementById('change-pin-btn');
const pinSetupModal = document.getElementById('pin-setup-modal');
const pinEntryModal = document.getElementById('pin-entry-modal');
const closePinSetupModal = document.getElementById('close-pin-setup-modal');
const closePinEntryModal = document.getElementById('close-pin-entry-modal');
const pinInput = document.getElementById('pin-input');
const pinConfirm = document.getElementById('pin-confirm');
const pinEntryInput = document.getElementById('pin-entry-input');
const savePinBtn = document.getElementById('save-pin-btn');
const cancelPinSetupBtn = document.getElementById('cancel-pin-setup-btn');
const unlockEntryBtn = document.getElementById('unlock-entry-btn');
const cancelPinEntryBtn = document.getElementById('cancel-pin-entry-btn');
const tagsContainer = document.getElementById('tags-container');
const tagsInput = document.getElementById('tags-input');
const tagsDisplay = document.getElementById('tags-display');
const promptsBtn = document.getElementById('prompts-btn');
const promptsModal = document.getElementById('prompts-modal');
const closePromptsModal = document.getElementById('close-prompts-modal');
const promptsGrid = document.getElementById('prompts-grid');
const newPromptBtn = document.getElementById('new-prompt-btn');
const duplicateEntryBtn = document.getElementById('duplicate-entry-btn');
const quickNoteBtn = document.getElementById('quick-note-btn');
const quickNotesModal = document.getElementById('quick-notes-modal');
const closeQuickNotesModal = document.getElementById('close-quick-notes-modal');
const quickNoteInput = document.getElementById('quick-note-input');
const saveQuickNoteBtn = document.getElementById('save-quick-note-btn');
const cancelQuickNoteBtn = document.getElementById('cancel-quick-note-btn');
const markdownToggleBtn = document.getElementById('markdown-toggle-btn');
const markdownPreview = document.getElementById('markdown-preview');
const fontSelector = document.getElementById('font-selector');
const journalSelector = document.getElementById('journal-selector');
const manageJournalsBtn = document.getElementById('manage-journals-btn');
const manageJournalsModal = document.getElementById('manage-journals-modal');
const closeManageJournalsModal = document.getElementById('close-manage-journals-modal');
const journalsList = document.getElementById('journals-list');
const newJournalName = document.getElementById('new-journal-name');
const createJournalBtn = document.getElementById('create-journal-btn');

// State variables
let currentDate = '';
let isOnline = true;
let entryDates = [];
let saveTimeout = null;
let lastSavedContent = '';
let currentTheme = 'light';
let allEntries = [];
let filteredEntries = [];
let currentMood = null;
let writingStreakCount = 0;
let isEntryLocked = false;
let userPin = null;
let currentTags = [];
let isMarkdownMode = false;
let currentJournal = 'main';
let journals = [];

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
    journalContent.contentEditable = 'false';
    toolbar.style.display = 'none';
    moodTracker.style.display = 'none';
    tagsContainer.style.display = 'none';
    editorMessage.textContent = 'Please turn off your WiFi to start writing.';
    editorMessage.classList.add('visible');
  } else {
    statusIndicator.classList.add('offline');
    statusText.textContent = 'Offline - Ready to Write';
    journalContent.contentEditable = 'true';
    toolbar.style.display = 'flex';
    moodTracker.style.display = 'flex';
    tagsContainer.style.display = 'flex';
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

// Update word and character count
function updateWordCount() {
  const text = journalContent.textContent || journalContent.innerText || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  
  // Calculate reading time (average 200 words per minute)
  const readingTime = words > 0 ? Math.ceil(words / 200) : 0;
  const readingTimeText = readingTime === 1 ? '1 min read' : `${readingTime} min read`;
  
  wordCountText.textContent = `${words} words, ${characters} characters • ${readingTimeText}`;
}

// Rich text editor functions
function execCommand(command, value = null) {
  document.execCommand(command, false, value);
  journalContent.focus();
  updateWordCount();
}

// Update toolbar button states
function updateToolbarState() {
  const commands = ['bold', 'italic', 'underline'];
  commands.forEach(cmd => {
    const btn = document.querySelector(`[data-command="${cmd}"]`);
    if (btn) {
      btn.classList.toggle('active', document.queryCommandState(cmd));
    }
  });

  // Update heading select
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const element = range.commonAncestorContainer.parentElement;
    const tagName = element.tagName ? element.tagName.toLowerCase() : '';
    headingSelect.value = ['h1', 'h2', 'h3'].includes(tagName) ? tagName : '';
  }
}

// Theme management functions
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Update icon
  const icon = themeToggleBtn.querySelector('.icon');
  icon.src = currentTheme === 'light' ? 'icons/moon-outline.svg' : 'icons/sunny-outline.svg';

  // Save theme preference
  localStorage.setItem('journal-theme', currentTheme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('journal-theme') || 'light';
  currentTheme = savedTheme;
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Set initial icon
  const icon = themeToggleBtn.querySelector('.icon');
  icon.src = currentTheme === 'light' ? 'icons/moon-outline.svg' : 'icons/sunny-outline.svg';
}

// Search functionality
async function searchEntries(query) {
  if (!query.trim()) {
    filteredEntries = [...allEntries];
    return;
  }

  const searchTerm = query.toLowerCase();
  filteredEntries = [];

  for (const entry of allEntries) {
    const content = entry.content.toLowerCase();
    const date = entry.date.toLowerCase();

    // Get tags for this entry
    const savedTags = localStorage.getItem(`tags-${entry.date}`);
    const tags = savedTags ? JSON.parse(savedTags) : [];
    const tagsText = tags.join(' ').toLowerCase();

    if (content.includes(searchTerm) || date.includes(searchTerm) || tagsText.includes(searchTerm)) {
      filteredEntries.push(entry);
    }
  }
}

function clearSearch() {
  searchInput.value = '';
  filteredEntries = [...allEntries];
  displayEntries();
}

function displayEntries() {
  const entriesToShow = filteredEntries.length > 0 ? filteredEntries : allEntries;

  // Clear existing list
  while (dateList.firstChild) {
    dateList.removeChild(dateList.firstChild);
  }

  if (entriesToShow.length === 0) {
    const noEntriesMsg = document.createElement('div');
    noEntriesMsg.className = 'no-entries-message';
    noEntriesMsg.textContent = searchInput.value.trim() ? 'No entries found matching your search.' : 'No entries yet. Start writing!';
    dateList.appendChild(noEntriesMsg);
  } else {
    // Add date items to list
    entriesToShow.forEach(entry => {
      const dateItem = document.createElement('div');
      dateItem.className = 'date-item';
      if (entry.date === currentDate) {
        dateItem.classList.add('active');
      }
      dateItem.textContent = formatDateForDisplay(entry.date);
      dateItem.dataset.date = entry.date;
      dateItem.addEventListener('click', () => loadEntry(entry.date));
      dateList.appendChild(dateItem);
    });
  }
}

// Template functionality
const templates = {
  'daily-reflection': `
    <h2>Daily Reflection - ${new Date().toLocaleDateString()}</h2>
    <h3>What went well today?</h3>
    <p></p>
    
    <h3>What could have gone better?</h3>
    <p></p>
    
    <h3>What did I learn today?</h3>
    <p></p>
    
    <h3>How am I feeling right now?</h3>
    <p></p>
  `,
  'gratitude': `
    <h2>Gratitude Journal - ${new Date().toLocaleDateString()}</h2>
    <h3>Three things I'm grateful for today:</h3>
    <ol>
      <li></li>
      <li></li>
      <li></li>
    </ol>
    
    <h3>Someone who made my day better:</h3>
    <p></p>
    
    <h3>A small moment of joy:</h3>
    <p></p>
  `,
  'goals': `
    <h2>Goals & Planning - ${new Date().toLocaleDateString()}</h2>
    <h3>Today's main goals:</h3>
    <ul>
      <li></li>
      <li></li>
      <li></li>
    </ul>
    
    <h3>Progress on long-term goals:</h3>
    <p></p>
    
    <h3>What I want to accomplish this week:</h3>
    <p></p>
    
    <h3>Challenges I'm facing:</h3>
    <p></p>
  `,
  'mood': `
    <h2>Mood Check - ${new Date().toLocaleDateString()}</h2>
    <h3>Current mood (1-10):</h3>
    <p></p>
    
    <h3>Energy level (1-10):</h3>
    <p></p>
    
    <h3>What's affecting my mood today?</h3>
    <p></p>
    
    <h3>What can I do to improve my mood?</h3>
    <p></p>
    
    <h3>Emotions I'm experiencing:</h3>
    <p></p>
  `
};

function openTemplatesModal() {
  templatesModal.style.display = 'block';
}

function closeTemplatesModalFunc() {
  templatesModal.style.display = 'none';
}

function insertTemplate(templateType) {
  if (templates[templateType]) {
    journalContent.innerHTML = templates[templateType];
    updateWordCount();
    closeTemplatesModalFunc();
    journalContent.focus();
  }
}

// Settings functionality
function openSettingsModal() {
  settingsModal.style.display = 'block';
  // Update settings UI with current values
  themeSelect.value = currentTheme;
  autoSaveInterval.value = localStorage.getItem('auto-save-interval') || '1';
}

function closeSettingsModalFunc() {
  settingsModal.style.display = 'none';
}

function exportJournalData() {
  try {
    const exportData = {
      entries: allEntries,
      settings: {
        theme: currentTheme,
        autoSaveInterval: autoSaveInterval.value
      },
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSaveStatus('Journal data exported successfully!');
  } catch (err) {
    console.error('Error exporting data:', err);
    showSaveStatus('Error exporting data');
  }
}

function importJournalData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        if (importData.entries && Array.isArray(importData.entries)) {
          // Import entries
          for (const entry of importData.entries) {
            await ipcRenderer.invoke('save-entry', {
              date: entry.date,
              content: entry.content
            });
          }

          // Import settings
          if (importData.settings) {
            if (importData.settings.theme) {
              currentTheme = importData.settings.theme;
              document.documentElement.setAttribute('data-theme', currentTheme);
              const icon = themeToggleBtn.querySelector('.icon');
              icon.src = currentTheme === 'light' ? 'icons/moon-outline.svg' : 'icons/sunny-outline.svg';
              localStorage.setItem('journal-theme', currentTheme);
            }
            if (importData.settings.autoSaveInterval) {
              localStorage.setItem('auto-save-interval', importData.settings.autoSaveInterval);
              autoSaveInterval.value = importData.settings.autoSaveInterval;
            }
          }

          // Refresh the app
          await loadDateList();
          showSaveStatus('Journal data imported successfully!');
        } else {
          showSaveStatus('Invalid journal data file');
        }
      } catch (err) {
        console.error('Error importing data:', err);
        showSaveStatus('Error importing data');
      }
    }
  };
  input.click();
}

// Mood tracking functionality
function setMood(mood) {
  currentMood = mood;

  // Update UI
  const moodBtns = document.querySelectorAll('.mood-btn');
  moodBtns.forEach(btn => {
    btn.classList.remove('selected');
    if (parseInt(btn.dataset.mood) === mood) {
      btn.classList.add('selected');
    }
  });

  // Save mood for current entry
  if (currentDate) {
    localStorage.setItem(`mood-${currentDate}`, mood);
  }
}

function loadMoodForEntry(date) {
  const savedMood = localStorage.getItem(`mood-${date}`);
  if (savedMood) {
    setMood(parseInt(savedMood));
  } else {
    currentMood = null;
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => btn.classList.remove('selected'));
  }
}

// Writing streak functionality
function calculateWritingStreak() {
  const today = new Date();
  let streak = 0;

  // Check consecutive days backwards from today
  for (let i = 0; i < 365; i++) { // Check up to a year
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = formatDateForStorage(checkDate);

    // Check if there's an entry for this date
    const hasEntry = allEntries.some(entry => entry.date === dateStr);

    if (hasEntry) {
      streak++;
    } else if (i > 0) { // Don't break on first day if no entry today
      break;
    }
  }

  writingStreakCount = streak;
  updateStreakDisplay();
}

function updateStreakDisplay() {
  if (writingStreakCount === 0) {
    streakText.textContent = '0 day streak';
  } else if (writingStreakCount === 1) {
    streakText.textContent = '1 day streak';
  } else {
    streakText.textContent = `${writingStreakCount} day streak`;
  }
}

// PIN Lock functionality
function loadUserPin() {
  userPin = localStorage.getItem('journal-pin');
  updatePinButtons();
}

function updatePinButtons() {
  if (userPin) {
    setupPinBtn.style.display = 'none';
    changePinBtn.style.display = 'inline-flex';
  } else {
    setupPinBtn.style.display = 'inline-flex';
    changePinBtn.style.display = 'none';
  }
}

function setupPin() {
  const pin = pinInput.value;
  const confirmPin = pinConfirm.value;

  if (pin.length !== 4 || !/^\d+$/.test(pin)) {
    showSaveStatus('PIN must be 4 digits');
    return;
  }

  if (pin !== confirmPin) {
    showSaveStatus('PINs do not match');
    return;
  }

  userPin = pin;
  localStorage.setItem('journal-pin', pin);
  updatePinButtons();
  closePinSetupModalFunc();
  showSaveStatus('PIN setup successfully!');

  // Clear inputs
  pinInput.value = '';
  pinConfirm.value = '';
}

function changePin() {
  pinSetupModal.style.display = 'block';
  pinInput.focus();
}

function lockEntry() {
  if (!userPin) {
    showSaveStatus('Please setup a PIN first in Settings');
    return;
  }

  if (!currentDate) {
    showSaveStatus('No entry selected');
    return;
  }

  if (isEntryLocked) {
    // Unlock entry
    unlockEntry();
  } else {
    // Lock entry
    isEntryLocked = true;
    lockEntryBtn.classList.add('locked');
    lockEntryBtn.querySelector('.icon').src = 'icons/unlock.svg';
    lockEntryBtn.title = 'Unlock Entry';

    // Save locked state
    localStorage.setItem(`locked-${currentDate}`, 'true');
    showSaveStatus('Entry locked');
  }
}

function unlockEntry() {
  if (!isEntryLocked) return;

  // Show PIN entry modal
  pinEntryModal.style.display = 'block';
  pinEntryInput.focus();
}

function verifyPin() {
  const enteredPin = pinEntryInput.value;

  if (enteredPin === userPin) {
    // Correct PIN - unlock entry
    isEntryLocked = false;
    lockEntryBtn.classList.remove('locked');
    lockEntryBtn.querySelector('.icon').src = 'icons/lock.svg';
    lockEntryBtn.title = 'Lock Entry';

    // Remove locked state
    localStorage.removeItem(`locked-${currentDate}`);
    closePinEntryModalFunc();
    showSaveStatus('Entry unlocked');

    // Clear input
    pinEntryInput.value = '';
  } else {
    showSaveStatus('Incorrect PIN');
    pinEntryInput.value = '';
    pinEntryInput.focus();
  }
}

function checkEntryLockStatus(date) {
  const isLocked = localStorage.getItem(`locked-${date}`) === 'true';
  isEntryLocked = isLocked;

  if (isLocked) {
    lockEntryBtn.classList.add('locked');
    lockEntryBtn.querySelector('.icon').src = 'icons/unlock.svg';
    lockEntryBtn.title = 'Unlock Entry';
  } else {
    lockEntryBtn.classList.remove('locked');
    lockEntryBtn.querySelector('.icon').src = 'icons/lock.svg';
    lockEntryBtn.title = 'Lock Entry';
  }
}

// PIN Modal functions
function openPinSetupModal() {
  pinSetupModal.style.display = 'block';
  pinInput.focus();
}

function closePinSetupModalFunc() {
  pinSetupModal.style.display = 'none';
  pinInput.value = '';
  pinConfirm.value = '';
}

function closePinEntryModalFunc() {
  pinEntryModal.style.display = 'none';
  pinEntryInput.value = '';
}

// Tags functionality
function addTag(tagText) {
  const tag = tagText.trim().toLowerCase();
  if (tag && !currentTags.includes(tag)) {
    currentTags.push(tag);
    updateTagsDisplay();
    saveTagsForEntry();
  }
}

function removeTag(tagToRemove) {
  currentTags = currentTags.filter(tag => tag !== tagToRemove);
  updateTagsDisplay();
  saveTagsForEntry();
}

function updateTagsDisplay() {
  tagsDisplay.innerHTML = '';
  currentTags.forEach(tag => {
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
      ${tag}
      <button class="tag-remove" onclick="removeTag('${tag}')">×</button>
    `;
    tagsDisplay.appendChild(tagElement);
  });
}

function saveTagsForEntry() {
  if (currentDate) {
    localStorage.setItem(`tags-${currentDate}`, JSON.stringify(currentTags));
  }
}

function loadTagsForEntry(date) {
  const savedTags = localStorage.getItem(`tags-${date}`);
  if (savedTags) {
    currentTags = JSON.parse(savedTags);
  } else {
    currentTags = [];
  }
  updateTagsDisplay();
}

// Writing Prompts functionality
const writingPrompts = [
  {
    category: "Reflection",
    prompts: [
      "What was the highlight of your day and why?",
      "Describe a moment today when you felt truly grateful.",
      "What's one thing you learned about yourself today?",
      "If you could relive one moment from today, which would it be?",
      "What emotion did you feel most strongly today?"
    ]
  },
  {
    category: "Growth",
    prompts: [
      "What's one small step you took toward a goal today?",
      "Describe a challenge you faced and how you handled it.",
      "What's something you want to improve about yourself?",
      "What advice would you give to your past self?",
      "What's a skill you'd like to develop?"
    ]
  },
  {
    category: "Relationships",
    prompts: [
      "Who made you smile today and why?",
      "Describe a meaningful conversation you had recently.",
      "What's something you appreciate about someone in your life?",
      "How did you show kindness to someone today?",
      "What's a relationship you'd like to strengthen?"
    ]
  },
  {
    category: "Creativity",
    prompts: [
      "If you could create anything without limits, what would it be?",
      "Describe your ideal creative space.",
      "What's a creative project you've been putting off?",
      "What inspires your creativity most?",
      "If you could learn any art form, what would it be?"
    ]
  },
  {
    category: "Future",
    prompts: [
      "Where do you see yourself in one year?",
      "What's a dream you've been too afraid to pursue?",
      "What would you do if you had unlimited time and resources?",
      "What legacy do you want to leave behind?",
      "What's one thing you want to accomplish this month?"
    ]
  },
  {
    category: "Mindfulness",
    prompts: [
      "What sounds did you notice today that you usually ignore?",
      "Describe your current surroundings in detail.",
      "What's one thing you're looking forward to tomorrow?",
      "How did you practice self-care today?",
      "What's something beautiful you observed today?"
    ]
  }
];

function getRandomPrompts(count = 6) {
  const allPrompts = [];
  writingPrompts.forEach(category => {
    category.prompts.forEach(prompt => {
      allPrompts.push({
        category: category.category,
        text: prompt
      });
    });
  });
  
  // Shuffle and return random prompts
  const shuffled = allPrompts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function displayPrompts() {
  promptsGrid.innerHTML = '';
  const prompts = getRandomPrompts();
  
  prompts.forEach(prompt => {
    const promptElement = document.createElement('div');
    promptElement.className = 'prompt-item';
    promptElement.innerHTML = `
      <h4>${prompt.category}</h4>
      <p>${prompt.text}</p>
    `;
    promptElement.addEventListener('click', () => {
      insertPrompt(prompt.text);
    });
    promptsGrid.appendChild(promptElement);
  });
}

function insertPrompt(promptText) {
  if (journalContent.innerHTML.trim() === '') {
    journalContent.innerHTML = `<p><strong>Writing Prompt:</strong> ${promptText}</p><p></p>`;
  } else {
    journalContent.innerHTML += `<p><br><strong>Writing Prompt:</strong> ${promptText}</p><p></p>`;
  }
  updateWordCount();
  closePromptsModalFunc();
  journalContent.focus();
}

function openPromptsModal() {
  displayPrompts();
  promptsModal.style.display = 'block';
}

function closePromptsModalFunc() {
  promptsModal.style.display = 'none';
}

// Entry Duplication functionality
function duplicateEntry() {
  if (!currentDate) {
    showSaveStatus('No entry selected to duplicate');
    return;
  }
  
  if (!journalContent.innerHTML.trim()) {
    showSaveStatus('No content to duplicate');
    return;
  }
  
  // Create a new entry for today
  const today = formatDateForStorage(new Date());
  
  // Check if today's entry already exists
  if (today === currentDate) {
    showSaveStatus('Cannot duplicate to the same date');
    return;
  }
  
  // Copy content to new entry
  journalContent.innerHTML = journalContent.innerHTML;
  currentDate = today;
  lastSavedContent = '';
  
  // Update UI
  currentDateHeader.textContent = formatDateForDisplay(today);
  
  // Copy mood if exists
  const savedMood = localStorage.getItem(`mood-${currentDate}`);
  if (savedMood) {
    setMood(parseInt(savedMood));
  }
  
  // Copy tags if exist
  const savedTags = localStorage.getItem(`tags-${currentDate}`);
  if (savedTags) {
    currentTags = JSON.parse(savedTags);
    updateTagsDisplay();
  }
  
  // Save the duplicated entry
  saveEntry();
  
  // Refresh date list
  loadDateList();
  
  showSaveStatus('Entry duplicated successfully!');
}

// Quick Notes functionality
function openQuickNotesModal() {
  quickNotesModal.style.display = 'block';
  quickNoteInput.focus();
}

function closeQuickNotesModalFunc() {
  quickNotesModal.style.display = 'none';
  quickNoteInput.value = '';
}

function saveQuickNote() {
  const noteText = quickNoteInput.value.trim();
  if (!noteText) {
    showSaveStatus('Please enter a note');
    return;
  }
  
  // Create a timestamp for the quick note
  const timestamp = new Date().toISOString();
  const noteData = {
    text: noteText,
    timestamp: timestamp,
    type: 'quick-note'
  };
  
  // Save to localStorage
  const quickNotes = JSON.parse(localStorage.getItem('quick-notes') || '[]');
  quickNotes.unshift(noteData); // Add to beginning
  
  // Keep only last 50 quick notes
  if (quickNotes.length > 50) {
    quickNotes.splice(50);
  }
  
  localStorage.setItem('quick-notes', JSON.stringify(quickNotes));
  
  closeQuickNotesModalFunc();
  showSaveStatus('Quick note saved!');
}

function getQuickNotes() {
  return JSON.parse(localStorage.getItem('quick-notes') || '[]');
}

// Markdown Support functionality
function parseMarkdown(text) {
  // Simple markdown parser for basic formatting
  let html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Entry links (format: [[YYYY-MM-DD]] or [[YYYY-MM-DD|Custom Text]])
    .replace(/\[\[(\d{4}-\d{2}-\d{2})(?:\|([^\]]+))?\]\]/g, (match, date, text) => {
      const linkText = text || date;
      return `<a href="#" class="entry-link" data-date="${date}">${linkText}</a>`;
    })
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Fix list formatting
  html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
  html = html.replace(/<\/ul><ul>/g, '');
  
  return html;
}

function toggleMarkdownMode() {
  isMarkdownMode = !isMarkdownMode;
  
  if (isMarkdownMode) {
    // Switch to markdown mode
    markdownToggleBtn.classList.add('active');
    markdownPreview.style.display = 'block';
    journalContent.style.display = 'none';
    updateMarkdownPreview();
  } else {
    // Switch to rich text mode
    markdownToggleBtn.classList.remove('active');
    markdownPreview.style.display = 'none';
    journalContent.style.display = 'block';
  }
}

function updateMarkdownPreview() {
  if (!isMarkdownMode) return;
  
  const text = journalContent.textContent || journalContent.innerText || '';
  const html = parseMarkdown(text);
  markdownPreview.innerHTML = html;
  
  // Add click handlers for entry links
  const entryLinks = markdownPreview.querySelectorAll('.entry-link');
  entryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const date = e.target.getAttribute('data-date');
      if (date) {
        loadEntry(date);
      }
    });
  });
}

// Custom Font functionality
function changeFont(fontFamily) {
  // Remove existing font classes
  const fontClasses = ['font-system', 'font-serif', 'font-sans-serif', 'font-monospace', 
                      'font-georgia', 'font-verdana', 'font-helvetica', 'font-palatino'];
  fontClasses.forEach(cls => {
    journalContent.classList.remove(cls);
    markdownPreview.classList.remove(cls);
  });
  
  // Add new font class
  if (fontFamily !== 'system') {
    journalContent.classList.add(`font-${fontFamily}`);
    markdownPreview.classList.add(`font-${fontFamily}`);
  }
  
  // Save font preference
  localStorage.setItem('journal-font', fontFamily);
}

function loadFontPreference() {
  const savedFont = localStorage.getItem('journal-font') || 'system';
  fontSelector.value = savedFont;
  changeFont(savedFont);
}

// Multiple Journals functionality
function loadJournals() {
  const savedJournals = localStorage.getItem('journals');
  if (savedJournals) {
    journals = JSON.parse(savedJournals);
  } else {
    // Initialize with default journal
    journals = [
      { id: 'main', name: 'Main Journal', created: new Date().toISOString() }
    ];
    saveJournals();
  }
  updateJournalSelector();
}

function saveJournals() {
  localStorage.setItem('journals', JSON.stringify(journals));
}

function updateJournalSelector() {
  journalSelector.innerHTML = '';
  journals.forEach(journal => {
    const option = document.createElement('option');
    option.value = journal.id;
    option.textContent = journal.name;
    if (journal.id === currentJournal) {
      option.selected = true;
    }
    journalSelector.appendChild(option);
  });
}

function switchJournal(journalId) {
  if (journalId === currentJournal) return;
  
  // Save current entry before switching
  if (currentDate) {
    saveEntry();
  }
  
  currentJournal = journalId;
  localStorage.setItem('current-journal', journalId);
  
  // Clear current content
  journalContent.innerHTML = '';
  currentDate = '';
  currentTags = [];
  currentMood = null;
  
  // Update UI
  currentDateHeader.textContent = 'Select a date';
  updateTagsDisplay();
  
  // Load entries for new journal
  loadDateList();
  
  showSaveStatus(`Switched to ${getJournalName(journalId)}`);
}

function getJournalName(journalId) {
  const journal = journals.find(j => j.id === journalId);
  return journal ? journal.name : 'Unknown Journal';
}

function createJournal(name) {
  if (!name.trim()) {
    showSaveStatus('Please enter a journal name');
    return;
  }
  
  const journalId = name.toLowerCase().replace(/\s+/g, '-');
  
  // Check if journal already exists
  if (journals.find(j => j.id === journalId)) {
    showSaveStatus('A journal with this name already exists');
    return;
  }
  
  const newJournal = {
    id: journalId,
    name: name.trim(),
    created: new Date().toISOString()
  };
  
  journals.push(newJournal);
  saveJournals();
  updateJournalSelector();
  updateJournalsList();
  
  newJournalName.value = '';
  showSaveStatus(`Created journal: ${name}`);
}

function deleteJournal(journalId) {
  if (journalId === 'main') {
    showSaveStatus('Cannot delete the main journal');
    return;
  }
  
  if (confirm('Are you sure you want to delete this journal? All entries will be lost.')) {
    journals = journals.filter(j => j.id !== journalId);
    saveJournals();
    updateJournalSelector();
    updateJournalsList();
    
    // Switch to main journal if current journal was deleted
    if (currentJournal === journalId) {
      switchJournal('main');
    }
    
    showSaveStatus('Journal deleted');
  }
}

function openManageJournalsModal() {
  updateJournalsList();
  manageJournalsModal.style.display = 'block';
}

function closeManageJournalsModalFunc() {
  manageJournalsModal.style.display = 'none';
}

function updateJournalsList() {
  journalsList.innerHTML = '';
  
  journals.forEach(journal => {
    const journalItem = document.createElement('div');
    journalItem.className = 'journal-item';
    if (journal.id === currentJournal) {
      journalItem.classList.add('current');
    }
    
    // Get entry count for this journal
    const entryCount = getJournalEntryCount(journal.id);
    
    journalItem.innerHTML = `
      <div class="journal-info">
        <div class="journal-name">${journal.name}</div>
        <div class="journal-stats">${entryCount} entries • Created ${new Date(journal.created).toLocaleDateString()}</div>
      </div>
      <div class="journal-actions">
        ${journal.id !== currentJournal ? `<button class="journal-action-btn switch" data-id="${journal.id}">Switch</button>` : ''}
        ${journal.id !== 'main' ? `<button class="journal-action-btn delete" data-id="${journal.id}">Delete</button>` : ''}
      </div>
    `;
    
    journalsList.appendChild(journalItem);
  });
  
  // Add event listeners
  journalsList.querySelectorAll('.journal-action-btn.switch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const journalId = e.target.getAttribute('data-id');
      switchJournal(journalId);
      closeManageJournalsModalFunc();
    });
  });
  
  journalsList.querySelectorAll('.journal-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const journalId = e.target.getAttribute('data-id');
      deleteJournal(journalId);
    });
  });
}

function getJournalEntryCount(journalId) {
  // This would need to be implemented with the main process
  // For now, return a placeholder
  return 0;
}

// Load entry for a specific date
async function loadEntry(date) {
  try {
    currentDate = date;

    // Update UI
    currentDateHeader.textContent = formatDateForDisplay(date);

    // Get entry content from main process
    const entry = await ipcRenderer.invoke('read-entry', date);
    journalContent.innerHTML = entry.content;
    lastSavedContent = entry.content;
    updateWordCount();

    // Update active state in sidebar
    const dateItems = document.querySelectorAll('.date-item');
    dateItems.forEach(item => {
      if (item.dataset.date === date) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Load mood for this entry
    loadMoodForEntry(date);

    // Load tags for this entry
    loadTagsForEntry(date);

    // Check lock status for this entry
    checkEntryLockStatus(date);

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

  const content = journalContent.innerHTML;

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
  journalContent.innerHTML = '';
  lastSavedContent = '';
  updateWordCount();

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

    // Load all entries with content for search functionality
    allEntries = [];
    for (const date of entryDates) {
      const entry = await ipcRenderer.invoke('read-entry', date);
      allEntries.push({ date, content: entry.content });
    }

    // Sort by date (newest first)
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update filtered entries
    filteredEntries = [...allEntries];

    // Calculate writing streak
    calculateWritingStreak();

    // Display entries
    displayEntries();
  } catch (err) {
    console.error('Error loading date list:', err);
  }
}

// Initialize the application
async function initApp() {
  // Load saved theme
  loadTheme();

  // Load user PIN
  loadUserPin();
  
  // Load font preference
  loadFontPreference();
  
  // Load journals
  loadJournals();
  
  // Load current journal
  const savedJournal = localStorage.getItem('current-journal');
  if (savedJournal && journals.find(j => j.id === savedJournal)) {
    currentJournal = savedJournal;
  }

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
themeToggleBtn.addEventListener('click', toggleTheme);
clearSearchBtn.addEventListener('click', clearSearch);
templatesBtn.addEventListener('click', openTemplatesModal);
closeTemplatesModal.addEventListener('click', closeTemplatesModalFunc);
settingsBtn.addEventListener('click', openSettingsModal);
closeSettingsModal.addEventListener('click', closeSettingsModalFunc);
exportDataBtn.addEventListener('click', exportJournalData);
importDataBtn.addEventListener('click', importJournalData);

// Search functionality
searchInput.addEventListener('input', async (e) => {
  const query = e.target.value;
  await searchEntries(query);
  displayEntries();
});

// Template item click handlers
document.addEventListener('click', (e) => {
  if (e.target.closest('.template-item')) {
    const templateType = e.target.closest('.template-item').dataset.template;
    insertTemplate(templateType);
  }
});

// Close modal when clicking outside
templatesModal.addEventListener('click', (e) => {
  if (e.target === templatesModal) {
    closeTemplatesModalFunc();
  }
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    closeSettingsModalFunc();
  }
});

// Settings form controls
themeSelect.addEventListener('change', (e) => {
  currentTheme = e.target.value;
  document.documentElement.setAttribute('data-theme', currentTheme);
  const icon = themeToggleBtn.querySelector('.icon');
  icon.src = currentTheme === 'light' ? 'icons/moon-outline.svg' : 'icons/sunny-outline.svg';
  localStorage.setItem('journal-theme', currentTheme);
});

autoSaveInterval.addEventListener('change', (e) => {
  localStorage.setItem('auto-save-interval', e.target.value);
});

// Mood tracking event listeners
document.addEventListener('click', (e) => {
  if (e.target.matches('.mood-btn')) {
    const mood = parseInt(e.target.dataset.mood);
    setMood(mood);
  }
});

// PIN Lock event listeners
lockEntryBtn.addEventListener('click', lockEntry);
setupPinBtn.addEventListener('click', openPinSetupModal);
changePinBtn.addEventListener('click', changePin);
closePinSetupModal.addEventListener('click', closePinSetupModalFunc);
closePinEntryModal.addEventListener('click', closePinEntryModalFunc);
savePinBtn.addEventListener('click', setupPin);
cancelPinSetupBtn.addEventListener('click', closePinSetupModalFunc);
unlockEntryBtn.addEventListener('click', verifyPin);
cancelPinEntryBtn.addEventListener('click', closePinEntryModalFunc);

// PIN input validation
pinInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

pinConfirm.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

pinEntryInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

// Close PIN modals when clicking outside
pinSetupModal.addEventListener('click', (e) => {
  if (e.target === pinSetupModal) {
    closePinSetupModalFunc();
  }
});

pinEntryModal.addEventListener('click', (e) => {
  if (e.target === pinEntryModal) {
    closePinEntryModalFunc();
  }
});

// Tags event listeners
tagsInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const tagText = tagsInput.value.trim();
    if (tagText) {
      addTag(tagText);
      tagsInput.value = '';
    }
  }
});

tagsInput.addEventListener('blur', (e) => {
  const tagText = e.target.value.trim();
  if (tagText) {
    addTag(tagText);
    e.target.value = '';
  }
});

// Writing Prompts event listeners
promptsBtn.addEventListener('click', openPromptsModal);
closePromptsModal.addEventListener('click', closePromptsModalFunc);
newPromptBtn.addEventListener('click', displayPrompts);

// Entry Duplication event listener
duplicateEntryBtn.addEventListener('click', duplicateEntry);

// Quick Notes event listeners
quickNoteBtn.addEventListener('click', openQuickNotesModal);
closeQuickNotesModal.addEventListener('click', closeQuickNotesModalFunc);
saveQuickNoteBtn.addEventListener('click', saveQuickNote);
cancelQuickNoteBtn.addEventListener('click', closeQuickNotesModalFunc);

// Markdown toggle event listener
markdownToggleBtn.addEventListener('click', toggleMarkdownMode);

// Font selector event listener
fontSelector.addEventListener('change', (e) => {
  changeFont(e.target.value);
});

// Journal management event listeners
journalSelector.addEventListener('change', (e) => {
  switchJournal(e.target.value);
});

manageJournalsBtn.addEventListener('click', openManageJournalsModal);
closeManageJournalsModal.addEventListener('click', closeManageJournalsModalFunc);
createJournalBtn.addEventListener('click', () => {
  createJournal(newJournalName.value);
});

newJournalName.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    createJournal(newJournalName.value);
  }
});

// Close prompts modal when clicking outside
promptsModal.addEventListener('click', (e) => {
  if (e.target === promptsModal) {
    closePromptsModalFunc();
  }
});

// Close quick notes modal when clicking outside
quickNotesModal.addEventListener('click', (e) => {
  if (e.target === quickNotesModal) {
    closeQuickNotesModalFunc();
  }
});

// Close manage journals modal when clicking outside
manageJournalsModal.addEventListener('click', (e) => {
  if (e.target === manageJournalsModal) {
    closeManageJournalsModalFunc();
  }
});

journalContent.addEventListener('input', () => {
  if (!isOnline) {
    debouncedSave();
    updateWordCount();
  }
  // Update markdown preview if in markdown mode
  if (isMarkdownMode) {
    updateMarkdownPreview();
  }
});

// Rich text editor event listeners
journalContent.addEventListener('keyup', updateToolbarState);
journalContent.addEventListener('mouseup', updateToolbarState);
journalContent.addEventListener('selectionchange', updateToolbarState);

// Toolbar button event listeners
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-command]')) {
    e.preventDefault();
    const command = e.target.dataset.command;
    execCommand(command);
  }
});

// Heading select event listener
headingSelect.addEventListener('change', (e) => {
  const value = e.target.value;
  if (value) {
    execCommand('formatBlock', value);
  } else {
    execCommand('formatBlock', 'div');
  }
});

// Initialize the app
initApp();

