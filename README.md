# Bitcraft Wiki

Bitcraft crafting recipe database and TODO planner built with Gatsby.

## 🚀 Live Demo

Visit the live site: [https://yuehara.github.io/bitcraft-wiki](https://yuehara.github.io/bitcraft-wiki)

## ✨ Features

- **Crafting Recipe Database**: Browse and search through thousands of Bitcraft crafting recipes
- **Interactive TODO Planner**: Add items to your crafting TODO list and automatically calculate required materials
- **Material Tree Visualization**: See the complete crafting dependency tree with intermediate materials organized by depth
- **Smart Filtering**: Filter items by tier, rarity, and recipe availability
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🛠️ Technology Stack

- **Gatsby** - Static site generator
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **GitHub Pages** - Hosting
- **GitHub Actions** - CI/CD

## 🏗️ Development

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yuehara/bitcraft-wiki.git
cd bitcraft-wiki

# Install dependencies
npm install

# Start development server
npm run develop
```

### Available Scripts

```bash
npm run develop    # Start development server
npm run build      # Build for production
npm run serve      # Serve production build locally
npm run clean      # Clean Gatsby cache
npm run deploy     # Build and deploy to GitHub Pages
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── CraftingList.tsx    # Main crafting interface
│   ├── CraftingTodo.tsx    # TODO list component
│   ├── ItemCard.tsx        # Individual item display
│   └── MaterialCard.tsx    # Material display component
├── context/
│   └── CraftingContext.tsx # Global state management
├── data/
│   └── crafting_data.json  # Bitcraft recipe database
└── pages/
    └── index.tsx           # Main page
```

## 🎮 How to Use

1. **Search Items**: Use the search bar and filters to find specific crafting items
2. **Add to TODO**: Click "Add to TODO" on any item to plan your crafting
3. **Adjust Quantities**: Use the +/- buttons to set how many you need
4. **View Materials**: The right panel automatically shows all required base materials and intermediate items
5. **Depth Visualization**: Materials are organized by crafting depth, showing the complete dependency tree

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Roadmap

- [ ] GraphQL integration for better data management
- [ ] Individual item detail pages
- [ ] User accounts and saved TODO lists
- [ ] Recipe optimization suggestions
- [ ] Export TODO lists to various formats

---

Made with ❤️ for the Bitcraft community
