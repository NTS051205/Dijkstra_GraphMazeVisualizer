# Dijkstra Graph & Maze Visualizer

A comprehensive web application for visualizing Dijkstra's shortest path algorithm on both graphs and mazes. This project provides interactive tools for learning, teaching, and experimenting with graph algorithms and maze solving.

## Demo

- [Live Demo](https://nts051205.github.io/Dijkstra_GraphMazeVisualizer/)

## Features

### Dijkstra Visualization
- Interactive graph with draggable nodes and weighted edges
- Step-by-step or automatic execution of Dijkstra's algorithm
- Visual highlights for current node, visited nodes, and shortest path
- Adjustable animation speed and detailed log output
- Code viewer with line-by-line highlighting

### Maze Game
- 35x35 customizable maze grid
- Tools to set start/end points, add/remove walls, bombs, and draw custom paths
- Random maze generation with multiple solutions and cycles
- Animated solution finder and real-time statistics (steps, bombs hit, score, path length)

### Shortest Path Sandbox
- Free-form graph editor: add/move nodes, create weighted edges
- Set start/end nodes, run Dijkstra, and visualize the shortest path
- Step-by-step execution and random graph generation

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, etc.)
- No installation required for demo. For local use, download or clone the repository.
- ## 💻 Browser Compatibility

### Desktop
| Browser      | Minimum Version     |
|--------------|---------------------|
| Chrome       | 88+                 |
| Firefox      | 85+                 |
| Safari       | 14+                 |
| Edge         | 88+ (Chromium)      |
| Opera        | 74+                 |

### Mobile
| Browser            | Minimum Version     |
|--------------------|---------------------|
| Chrome             | 88+                 |
| Safari iOS         | 14+                 |
| Samsung Internet   | 15+                 |
| Opera Mobile       | 63+                 |


### Installation

```bash
git clone https://github.com/NTS051205/Dijkstra_GraphMazeVisualizer.git
cd Dijkstra_GraphMazeVisualizer
# Open index.html in your browser
```

### Usage
1. Open `index.html` in your browser.
2. Use the tabs to switch between Dijkstra Visualization, Maze Game, and Sandbox.
3. Interact with the UI to create graphs/mazes, set start/end points, and run the algorithms.

## Project Structure

```text
├─ index.html     # Main interface
├─ graph.js       # Graph structure and Dijkstra visualization logic
├─ maze.js        # Maze generation, game logic, and pathfinding
├─ sandbox.js     # Custom graph editor and Dijkstra for user graphs
├─ code.js        # Dijkstra algorithm code for code viewer
├─ styles.css     # General styles for the app
├─ maze.css       # Maze-specific styles and animations
├─ README.md      # Project documentation
```

This project is organized as a single-page web application with modular JavaScript and CSS files. Below is a detailed description of each file:

- **index.html**: The main HTML file. It contains the structure for all three main features (Dijkstra Visualization, Maze Game, Sandbox) and loads all scripts and styles.
- **graph.js**: Implements the Dijkstra Visualization using D3.js. Handles graph creation, node/edge manipulation, algorithm animation, and code highlighting.
- **maze.js**: Contains the Maze Game logic, including maze generation, user interaction, pathfinding, and statistics tracking.
- **sandbox.js**: Provides a free-form graph editor for custom shortest path problems. Users can add nodes/edges, set weights, and run Dijkstra step-by-step or automatically.
- **code.js**: Example code for Dijkstra's algorithm, used for code display and highlighting in the visualization tab.
- **styles.css**: General styles for the application, including graph and sandbox visualizations.
- **maze.css**: Styles specific to the Maze Game, including grid, cell types, and animations.
- **README.md**: Project documentation.

### How the Application Works

- The application is fully client-side and requires no backend or build process.
- All logic is implemented in JavaScript and runs in the browser.
- The UI is divided into three main tabs:
  1. **Dijkstra Visualization**: For learning and visualizing the algorithm on random graphs.
  2. **Maze Game**: For interactive maze solving and pathfinding challenges.
  3. **Sandbox**: For experimenting with custom graphs and shortest path scenarios.
- Each feature is isolated in its own script for maintainability and clarity.

### Customization & Extension

- You can easily modify the UI or add new features by editing the corresponding JS/CSS files.
- The project is suitable for educational use, algorithm demonstrations, and as a base for more advanced visualizations.

## Screenshots

<!-- Add screenshots here to showcase the UI and features -->

## Author

- [NTS051205](https://github.com/NTS051205)

## License

This project is licensed under the MIT License.
