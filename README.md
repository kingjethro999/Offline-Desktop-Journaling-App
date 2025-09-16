# Warp - Offline Journal App

A beautiful, feature-rich offline journal application built with Electron. Write your thoughts without distractions - the app only allows editing when you're offline, encouraging mindful, uninterrupted writing.

## ✨ Features

### 🎨 Rich Text Editing
- **Bold, italic, and underline** formatting
- **Headers** (H1, H2, H3) for structured writing
- **Bullet and numbered lists** for organized thoughts
- **Real-time word and character count** to track your writing progress
- **Reading time estimates** - see how long entries take to read
- **Markdown support** - toggle between rich text and markdown editing
- **Live markdown preview** - see formatted output as you type
- **Custom fonts** - choose from multiple font families

### 🌙 Themes
- **Light and dark themes** with smooth transitions
- **Persistent theme preference** - your choice is remembered
- **Beautiful, modern UI** that adapts to your preferred theme

### 🔍 Search Functionality
- **Search through all entries** by content, date, or tags
- **Real-time search** as you type
- **Clear search** button for easy reset
- **Smart filtering** that shows relevant entries instantly
- **Tag-based search** - find entries by their tags

### 🏷️ Tags & Categories
- **Custom tags** - organize entries by mood, topic, or any category
- **Visual tag display** - see all tags for each entry
- **Easy tag management** - add tags by pressing Enter, remove with ×
- **Tag-based organization** - search and filter by tags
- **Persistent tag storage** - tags saved with each entry

### 📝 Entry Templates
- **Daily Reflection** - structured prompts for daily journaling
- **Gratitude Journal** - focus on positive experiences
- **Goals & Planning** - track your objectives and progress
- **Mood Check** - monitor your emotional well-being

### 😊 Mood Tracking
- **5-point mood scale** with emoji indicators
- **Per-entry mood tracking** - save your emotional state with each entry
- **Visual mood selection** - intuitive emoji-based interface
- **Persistent mood data** - moods saved and loaded with entries

### 🔥 Writing Streaks
- **Consecutive day tracking** - see your journaling consistency
- **Visual streak counter** - fire emoji with day count
- **Automatic calculation** - tracks entries across all dates
- **Motivation boost** - gamify your writing habit

### 💾 Data Management
- **Auto-save** with visual indicators
- **Offline-first** - your data stays local and private
- **Date-based organization** - entries sorted by date
- **Persistent storage** - never lose your thoughts
- **Export/Import** - backup and restore your journal data
- **Professional icons** - clean SVG icons throughout the interface

### 🔒 Privacy & Security
- **100% offline** - your journal never leaves your device
- **No internet required** for writing
- **Local file storage** - complete control over your data
- **Entry encryption** - lock sensitive entries with a 4-digit PIN
- **PIN protection** - setup and change your security PIN in settings
- **Per-entry locking** - lock individual entries independently

### 💡 Writing Inspiration
- **Writing prompts** - overcome writer's block with inspiring questions
- **Categorized prompts** - reflection, growth, relationships, creativity, future, mindfulness
- **Random prompt generation** - get fresh ideas with each click
- **Prompt insertion** - add prompts directly to your entries
- **Quick notes** - jot down thoughts without creating full entries
- **Entry duplication** - copy previous entries as templates

### 🔗 Advanced Features
- **Entry linking** - reference other entries with `[[YYYY-MM-DD]]` syntax
- **Multiple journals** - create separate journals for work, personal, travel, etc.
- **Journal management** - create, switch, and delete journals
- **Journal statistics** - see entry counts and creation dates
- **Persistent journal selection** - your current journal is remembered

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd warp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm run dev
   ```

### Usage
1. **Disconnect from the internet** to enable writing mode
2. **Click "New"** to create a new entry for today
3. **Use the toolbar** to format your text with bold, italic, headers, and lists
4. **Try templates** by clicking the "Templates" button for structured prompts
5. **Track your mood** using the 5-point emoji scale when offline
6. **Add tags** to organize your entries by topic or mood
7. **Lock sensitive entries** with the lock button (requires PIN setup)
8. **Monitor your streak** with the fire emoji counter in the header
9. **Search entries** using the search bar in the sidebar
10. **Toggle themes** with the moon/sun button in the header
11. **Setup PIN protection** in settings for entry encryption
12. **Export/Import data** through the settings modal for backups

## 🛠️ Technical Details

### Built With
- **Electron** - Cross-platform desktop app framework
- **HTML5/CSS3** - Modern web technologies
- **Vanilla JavaScript** - No heavy frameworks, just clean code
- **Node.js** - Backend functionality

### Architecture
- **Main Process** (`main.mjs`) - Handles file operations and network monitoring
- **Renderer Process** (`renderer.js`) - Manages UI interactions and rich text editing
- **Local Storage** - Journal entries stored as JSON files in user data directory

### File Structure
```
warp/
├── main.mjs          # Main Electron process
├── main.cjs          # CommonJS entry point
├── index.html        # Main UI structure
├── styles.css        # Styling and themes
├── renderer.js       # Frontend logic
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## 🎯 Philosophy

Warp is designed around the principle of **mindful writing**. By requiring you to disconnect from the internet to write, it creates a focused, distraction-free environment for reflection and self-expression. The rich feature set supports various journaling styles while maintaining simplicity and elegance.

## 🔮 Future Features

- **Multiple journals** for different purposes (work, personal, travel)
- **Entry encryption** for sensitive thoughts
- **Backup and restore** functionality
- **Writing streaks** and progress tracking
- **Mood tracking** with visual indicators
- **Writing prompts** for inspiration
- **Entry linking** to reference other entries
- **Export options** (PDF, Markdown, etc.)

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

---

**Happy Journaling! 📖✨**
