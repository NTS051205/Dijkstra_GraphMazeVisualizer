class MazeGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.size = 35; // 35x35 maze
        this.currentTool = null;
        this.maze = [];
        this.startPoint = null;
        this.goalPoint = null;
        this.isDrawing = false;
        this.solution = [];
        this.visited = new Set();
        this.path = [];
        this.bombsHit = 0;
        this.score = 0;

        // Stats elements
        this.stepCountElement = document.getElementById('step-count');
        this.bombCountElement = document.getElementById('bomb-count');
        this.scoreElement = document.getElementById('score');
        this.pathLengthElement = document.getElementById('path-length');

        this.initializeMaze();
        this.setupEventListeners();
        this.updateStats();
    }

    initializeMaze() {
        this.container.innerHTML = '';
        this.maze = [];
        this.visited.clear();
        this.solution = [];

        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';

        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('tr');
            const mazeRow = [];
            
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('td');
                cell.className = 'maze-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                row.appendChild(cell);
                mazeRow.push({
                    type: 'empty',
                    element: cell
                });
            }
            
            table.appendChild(row);
            this.maze.push(mazeRow);
        }
        
        this.container.appendChild(table);
    }

    setupEventListeners() {
        // Tool selection
        const tools = ['set-start', 'set-goal', 'add-wall', 'add-bomb', 'draw-path'];
        tools.forEach(toolId => {
            document.getElementById(toolId).addEventListener('click', () => {
                this.setCurrentTool(toolId);
            });
        });

        // Control buttons
        document.getElementById('generate-maze').addEventListener('click', () => this.generateRandomMaze());
        document.getElementById('show-solution').addEventListener('click', () => this.showSolution());
        document.getElementById('reset-path').addEventListener('click', () => this.resetPath());
        document.getElementById('clear-maze').addEventListener('click', () => this.clearMaze());

        // Mouse events for drawing
        this.container.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('maze-cell')) {
                this.isDrawing = true;
                this.handleCellClick(e.target);
            }
        });

        this.container.addEventListener('mouseover', (e) => {
            if (this.isDrawing && e.target.classList.contains('maze-cell')) {
                this.handleCellClick(e.target);
                }
            });

        document.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
    }

    setCurrentTool(toolId) {
        document.querySelectorAll('.maze-tool').forEach(tool => tool.classList.remove('active'));
        document.getElementById(toolId).classList.add('active');
        this.currentTool = toolId;
    }

    handleCellClick(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        switch (this.currentTool) {
            case 'set-start':
                this.setStart(row, col);
                break;
            case 'set-goal':
                this.setGoal(row, col);
                break;
            case 'add-wall':
                this.setWall(row, col);
                break;
            case 'add-bomb':
                this.setBomb(row, col);
                break;
            case 'draw-path':
                this.drawPath(row, col);
                break;
            }
    }

    setStart(row, col) {
        if (this.startPoint) {
            this.maze[this.startPoint.row][this.startPoint.col].type = 'empty';
            this.maze[this.startPoint.row][this.startPoint.col].element.className = 'maze-cell';
        }
        this.startPoint = { row, col };
        this.maze[row][col].type = 'start';
        this.maze[row][col].element.className = 'maze-cell maze-start';
        }
        
    setGoal(row, col) {
        if (this.goalPoint) {
            this.maze[this.goalPoint.row][this.goalPoint.col].type = 'empty';
            this.maze[this.goalPoint.row][this.goalPoint.col].element.className = 'maze-cell';
        }
        this.goalPoint = { row, col };
        this.maze[row][col].type = 'goal';
        this.maze[row][col].element.className = 'maze-cell maze-goal';
    }

    setWall(row, col) {
        if (this.maze[row][col].type === 'wall') {
            this.maze[row][col].type = 'empty';
            this.maze[row][col].element.className = 'maze-cell';
        } else {
            this.maze[row][col].type = 'wall';
            this.maze[row][col].element.className = 'maze-cell maze-wall';
            }
        }
        
    setBomb(row, col) {
        if (this.maze[row][col].type === 'bomb') {
            this.maze[row][col].type = 'empty';
            this.maze[row][col].element.className = 'maze-cell';
        } else {
            this.maze[row][col].type = 'bomb';
            this.maze[row][col].element.className = 'maze-cell maze-bomb';
    }
    }

    drawPath(row, col) {
        if (this.maze[row][col].type === 'wall') {
            alert('Không thể đi qua tường!');
            return;
        }
        
        if (this.maze[row][col].type === 'path') {
            // Xóa đường đi từ điểm này trở đi
            const index = this.path.findIndex(p => p.row === row && p.col === col);
            if (index !== -1) {
                const removedCells = this.path.splice(index);
                removedCells.forEach(({row, col}) => {
                    if (this.maze[row][col].type === 'path') {
                        this.maze[row][col].type = 'empty';
                        this.maze[row][col].element.className = 'maze-cell';
                    }
                });
            }
        } else {
            // Thêm điểm mới vào đường đi
            if (this.path.length === 0) {
                // Chỉ có thể bắt đầu từ điểm xuất phát
                if (this.maze[row][col].type !== 'start') {
                    alert('Bạn phải bắt đầu từ điểm xuất phát!');
                    return;
                }
            } else {
                // Kiểm tra xem có thể đi đến ô mới không
                const lastCell = this.path[this.path.length - 1];
                if (Math.abs(row - lastCell.row) + Math.abs(col - lastCell.col) !== 1) {
                    alert('Chỉ có thể di chuyển sang ô liền kề!');
                    return;
                }
            }
            
            // Kiểm tra và xử lý khi đi qua bom
            if (this.maze[row][col].type === 'bomb') {
                this.bombsHit++;
                this.maze[row][col].element.classList.add('bomb-hit');
                setTimeout(() => {
                    this.maze[row][col].element.classList.remove('bomb-hit');
                    alert('Bạn đã gặp bom! +100 điểm');
                }, 500);
            }
            
            this.path.push({row, col});
            if (this.maze[row][col].type !== 'start' && this.maze[row][col].type !== 'goal') {
                this.maze[row][col].type = 'path';
                this.maze[row][col].element.className = 'maze-cell maze-path';
            }

            // Kiểm tra khi đến đích
            if (this.maze[row][col].type === 'goal') {
                setTimeout(() => {
                    const finalScore = this.calculateScore();
                    alert(`Chúc mừng! Bạn đã hoàn thành!\nSố bước: ${this.path.length}\nSố bom đã gặp: ${this.bombsHit}\nĐiểm số: ${finalScore}`);
                }, 100);
            }
            }
            
            this.updateStats();
        }
        
    generateRandomMaze() {
        this.clearMaze();
        
        // Initialize the maze with walls
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.maze[i][j].type = 'wall';
                this.maze[i][j].element.className = 'maze-cell maze-wall';
            }
        }

        // Choose a random starting point (odd coordinates)
        const startX = 1 + Math.floor(Math.random() * (this.size - 2) / 2) * 2;
        const startY = 1 + Math.floor(Math.random() * (this.size - 2) / 2) * 2;

        // Carve passages using recursive backtracking
        this.carvePassages(startX, startY);

        // Add more cycles to create multiple paths
        this.addCycles();
        
        // Add additional random passages to ensure connectivity
        this.addRandomPassages();
        
        // Add start and end points
        let startPoint = this.findRandomEmptyCell();
        this.setStart(startPoint.row, startPoint.col);

        let endPoint = this.findRandomEmptyCell();
        // Make sure start and end are not too close
        while (this.manhattanDistance(startPoint, endPoint) < this.size / 2) {
            endPoint = this.findRandomEmptyCell();
        }
        this.setGoal(endPoint.row, endPoint.col);

        // Add bombs
        const bombCount = Math.floor(this.size / 4);
        for (let i = 0; i < bombCount; i++) {
            const bombPoint = this.findRandomEmptyCell();
            this.setBomb(bombPoint.row, bombPoint.col);
        }
    }

    carvePassages(x, y) {
        const directions = [
            [0, -2], // North
            [2, 0],  // East
            [0, 2],  // South
            [-2, 0]  // West
        ];

        // Randomize directions
        this.shuffleArray(directions);

        // Mark current cell as passage
        this.maze[y][x].type = 'empty';
        this.maze[y][x].element.className = 'maze-cell';

        // Explore in each direction
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
        
            // Check if the new position is within the grid and is a wall
            if (this.isInGrid(nx, ny) && this.maze[ny][nx].type === 'wall') {
                // Carve a passage by making the wall in between a passage too
                this.maze[y + dy/2][x + dx/2].type = 'empty';
                this.maze[y + dy/2][x + dx/2].element.className = 'maze-cell';
                this.carvePassages(nx, ny);
            }
        }
    }

    addCycles() {
        // Increase the number of cycles to create more alternative paths
        const cycles = Math.floor(this.size * 1.5); // Increased from size/10 to size*1.5

        for (let i = 0; i < cycles; i++) {
            // Find a random wall that connects two passages
            let x, y;
            do {
                x = 1 + Math.floor(Math.random() * (this.size - 2));
                y = 1 + Math.floor(Math.random() * (this.size - 2));
            } while (
                this.maze[y][x].type !== 'wall' ||
                !this.isWallConnectingPassages(x, y)
            );

            // Remove the wall to create a cycle
            this.maze[y][x].type = 'empty';
            this.maze[y][x].element.className = 'maze-cell';
        }
    }

    isWallConnectingPassages(x, y) {
        const horizontalPassages = 
            this.isInGrid(x-1, y) && this.maze[y][x-1].type === 'empty' &&
            this.isInGrid(x+1, y) && this.maze[y][x+1].type === 'empty';

        const verticalPassages = 
            this.isInGrid(x, y-1) && this.maze[y-1][x].type === 'empty' &&
            this.isInGrid(x, y+1) && this.maze[y+1][x].type === 'empty';

        return horizontalPassages || verticalPassages;
    }

    isInGrid(x, y) {
        return y >= 0 && y < this.size && x >= 0 && x < this.size;
    }

    findRandomEmptyCell() {
        let x, y;
        do {
            x = Math.floor(Math.random() * this.size);
            y = Math.floor(Math.random() * this.size);
        } while (this.maze[y][x].type !== 'empty');

        return {row: y, col: x};
    }

    manhattanDistance(point1, point2) {
        return Math.abs(point1.row - point2.row) + Math.abs(point1.col - point2.col);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async showSolution() {
        if (!this.startPoint || !this.goalPoint) {
            alert('Vui lòng đặt điểm bắt đầu và điểm đích trước!');
            return;
    }

        this.resetPath();
        const path = await this.findPath();
        if (path) {
            // Cập nhật đường đi và tính điểm
            this.path = path;
        this.bombsHit = 0;

            path.forEach(({ row, col }) => {
                if (this.maze[row][col].type === 'bomb') {
                    this.bombsHit++;
                }
            });
        
            // Cập nhật thống kê
        this.updateStats();
        } else {
            alert('Không tìm thấy đường đi!');
        }
    }

    async findPath() {
        const queue = [[this.startPoint]];
        const visited = new Set();
        const key = (row, col) => `${row},${col}`;
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        while (queue.length > 0) {
            const path = queue.shift();
            const { row, col } = path[path.length - 1];

            if (row === this.goalPoint.row && col === this.goalPoint.col) {
                // Animate the final path
                for (let i = 0; i < path.length; i++) {
                    const { row, col } = path[i];
                    if (this.maze[row][col].type !== 'start' && this.maze[row][col].type !== 'goal') {
                        this.maze[row][col].element.className = 'maze-cell maze-solution';
                        await delay(50);
                }
                }
        return path;
    }

            if (!visited.has(key(row, col))) {
                visited.add(key(row, col));
            
                // Animate exploration
                if (this.maze[row][col].type !== 'start' && this.maze[row][col].type !== 'goal') {
                    this.maze[row][col].element.className = 'maze-cell exploring';
                    await delay(20);
                    this.maze[row][col].element.className = 'maze-cell maze-visited';
                }

                // Check all adjacent cells
                const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (const [dx, dy] of directions) {
                    const newRow = row + dx;
                    const newCol = col + dy;

                    if (
                        newRow >= 0 && newRow < this.size &&
                        newCol >= 0 && newCol < this.size &&
                        this.maze[newRow][newCol].type !== 'wall' &&
                        !visited.has(key(newRow, newCol))
                    ) {
                        queue.push([...path, { row: newRow, col: newCol }]);
                }
            }
        }
        }

        return null;
    }

    resetPath() {
        this.path = [];
        this.bombsHit = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.maze[i][j].type === 'path' || this.maze[i][j].element.classList.contains('maze-solution')) {
                    this.maze[i][j].type = 'empty';
                    this.maze[i][j].element.className = 'maze-cell';
                }
                this.maze[i][j].element.classList.remove('maze-visited');
            }
        }
        this.updateStats();
    }

    clearMaze() {
        this.startPoint = null;
        this.goalPoint = null;
        this.path = [];
        this.bombsHit = 0;
        this.initializeMaze();
        this.updateStats();
    }

    updateStats() {
        this.stepCountElement.textContent = this.path.length;
        this.bombCountElement.textContent = this.bombsHit;
        this.scoreElement.textContent = this.calculateScore();
        this.pathLengthElement.textContent = this.path.length;
    }

    calculateScore() {
        // Tính điểm dựa trên độ dài đường đi và số bom đã gặp
        if (this.path.length === 0) return 0;
        
        let score = 1000; // Điểm ban đầu
        score -= this.path.length * 10; // Trừ điểm cho mỗi bước đi
        score += this.bombsHit * 100; // Cộng điểm cho mỗi bom (thay vì trừ)
        
        return Math.max(0, score); // Điểm không thể âm
    }

    addRandomPassages() {
        // Add random passages to create more alternative paths
        const passages = Math.floor(this.size * 0.8); // 80% of maze size
        
        for (let i = 0; i < passages; i++) {
            let x, y;
            do {
                x = 1 + Math.floor(Math.random() * (this.size - 2));
                y = 1 + Math.floor(Math.random() * (this.size - 2));
            } while (this.maze[y][x].type !== 'wall');
                
            // Check if removing this wall would create a valid passage
            if (this.isValidPassage(x, y)) {
                this.maze[y][x].type = 'empty';
                this.maze[y][x].element.className = 'maze-cell';
                    }
                }
    }
    
    isValidPassage(x, y) {
        // Check if removing this wall would create a valid passage
        // A valid passage connects two empty cells
        const horizontalPassages = 
            this.isInGrid(x-1, y) && this.maze[y][x-1].type === 'empty' &&
            this.isInGrid(x+1, y) && this.maze[y][x+1].type === 'empty';

        const verticalPassages = 
            this.isInGrid(x, y-1) && this.maze[y-1][x].type === 'empty' &&
            this.isInGrid(x, y+1) && this.maze[y+1][x].type === 'empty';
            
        // Also check for diagonal connections to create more interesting paths
        const diagonalPassages = 
            (this.isInGrid(x-1, y-1) && this.maze[y-1][x-1].type === 'empty' &&
             this.isInGrid(x+1, y+1) && this.maze[y+1][x+1].type === 'empty') ||
            (this.isInGrid(x+1, y-1) && this.maze[y-1][x+1].type === 'empty' &&
             this.isInGrid(x-1, y+1) && this.maze[y+1][x-1].type === 'empty');

        return horizontalPassages || verticalPassages || diagonalPassages;
    }
} 