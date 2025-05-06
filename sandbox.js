document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const canvas = document.getElementById('graph-canvas');
    const nodeTool = document.getElementById('node-tool');
    const edgeTool = document.getElementById('edge-tool');
    const runDijkstraBtn = document.getElementById('run-dijkstra');
    const stepDijkstraBtn = document.getElementById('step-dijkstra');
    const nextStepBtn = document.getElementById('next-step');
    const clearPathBtn = document.getElementById('clear-path');
    const generateRandomBtn = document.getElementById('generate-random');
    const clearAllBtn = document.getElementById('clear-all');
    const resultsContent = document.getElementById('results-content');
    const weightModal = document.getElementById('weight-modal');
    const weightInput = document.getElementById('weight-input');
    const confirmWeightBtn = document.getElementById('confirm-weight');
    const cancelWeightBtn = document.getElementById('cancel-weight');
    
    // Graph data
    let nodes = [];
    let edges = [];
    let nodeCounter = 0;
    let currentTool = 'node';
    let startNode = null;
    let endNode = null;
    let sourceNode = null;
    let targetNode = null;
    let tempEdge = null;
    let draggingNode = null;
    let offsetX = 0;
    let offsetY = 0;
    let edgeBeingCreated = null;
    let state = null;
    
    // Tool selection
    nodeTool.addEventListener('click', () => {
        currentTool = 'node';
        nodeTool.classList.add('active');
        edgeTool.classList.remove('active');
    });
    
    edgeTool.addEventListener('click', () => {
        currentTool = 'edge';
        edgeTool.classList.add('active');
        nodeTool.classList.remove('active');
    });
    
    // Canvas click event - Add node
    canvas.addEventListener('click', (e) => {
        if (currentTool === 'node') {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if we're clicking on an existing node
            const clickedNode = getNodeAtPosition(x, y);
            if (clickedNode) return;
            
            addNode(x, y);
        }
    });
    
    // Functions for node management
    function addNode(x, y) {
        const nodeId = `${nodeCounter++}`;
        const node = {
            id: nodeId,
            x: x,
            y: y,
            element: createNodeElement(nodeId, x, y)
        };
        
        nodes.push(node);
        canvas.appendChild(node.element);
        
        // Add node event listeners
        setupNodeEventListeners(node);
    }
    
    function createNodeElement(id, x, y) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'node';
        nodeElement.id = 'node-' + id;
        nodeElement.textContent = id;
        nodeElement.style.left = `${x - 20}px`;
        nodeElement.style.top = `${y - 20}px`;
        return nodeElement;
    }
    
    function setupNodeEventListeners(node) {
        const nodeElement = node.element;
        
        // Drag start
        nodeElement.addEventListener('mousedown', (e) => {
            if (currentTool === 'edge') {
                // Start creating an edge
                sourceNode = node;
                const startX = node.x;
                const startY = node.y;
                
                // Create a temporary visual edge
                tempEdge = document.createElement('div');
                tempEdge.style.position = 'absolute';
                tempEdge.style.height = '2px';
                tempEdge.style.backgroundColor = '#666';
                tempEdge.style.transformOrigin = '0 0';
                tempEdge.style.zIndex = '1';
                canvas.appendChild(tempEdge);
                
                const moveHandler = (moveEvent) => {
                    const rect = canvas.getBoundingClientRect();
                    const endX = moveEvent.clientX - rect.left;
                    const endY = moveEvent.clientY - rect.top;
                    
                    // Calculate angle and length
                    const dx = endX - startX;
                    const dy = endY - startY;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    
                    // Update temp edge style
                    tempEdge.style.width = `${length}px`;
                    tempEdge.style.left = `${startX}px`;
                    tempEdge.style.top = `${startY}px`;
                    tempEdge.style.transform = `rotate(${angle}deg)`;
                };
                
                const upHandler = (upEvent) => {
                    document.removeEventListener('mousemove', moveHandler);
                    document.removeEventListener('mouseup', upHandler);
                    
                    if (tempEdge) {
                        canvas.removeChild(tempEdge);
                        tempEdge = null;
                    }
                    
                    const rect = canvas.getBoundingClientRect();
                    const endX = upEvent.clientX - rect.left;
                    const endY = upEvent.clientY - rect.top;
                    
                    targetNode = getNodeAtPosition(endX, endY);
                    
                    if (targetNode && targetNode !== sourceNode) {
                        // Show weight modal only when manually creating an edge
                        weightModal.style.display = 'block';
                        weightInput.value = '1';
                        edgeBeingCreated = { source: sourceNode, target: targetNode };
                    }
                    
                    sourceNode = null;
                };
                
                document.addEventListener('mousemove', moveHandler);
                document.addEventListener('mouseup', upHandler);
            } else {
                // Start dragging the node
                draggingNode = node;
                const rect = nodeElement.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                
                nodeElement.style.zIndex = '10';
            }
            
            e.stopPropagation();
        });
        
        // Double click to set start node
        nodeElement.addEventListener('dblclick', () => {
            if (startNode === node) {
                node.element.classList.remove('start');
                startNode = null;
            } else {
                if (startNode) {
                    startNode.element.classList.remove('start');
                }
                startNode = node;
                node.element.classList.add('start');
            }
        });
        
        // Right click to set end node
        nodeElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (endNode === node) {
                node.element.classList.remove('end');
                endNode = null;
            } else {
                if (endNode) {
                    endNode.element.classList.remove('end');
                }
                endNode = node;
                node.element.classList.add('end');
            }
        });
    }
    
    // Mouse move event for dragging nodes
    document.addEventListener('mousemove', (e) => {
        if (draggingNode) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - offsetX + 20;
            const y = e.clientY - rect.top - offsetY + 20;
            
            draggingNode.element.style.left = `${x - 20}px`;
            draggingNode.element.style.top = `${y - 20}px`;
            
            // Update node coordinates
            draggingNode.x = x;
            draggingNode.y = y;
            
            // Update connected edges
            updateEdges(draggingNode);
        }
    });
    
    // Mouse up event to end dragging
    document.addEventListener('mouseup', () => {
        if (draggingNode) {
            draggingNode.element.style.zIndex = '2';
            draggingNode = null;
        }
    });
    
    // Weight modal buttons
    confirmWeightBtn.addEventListener('click', () => {
        const weight = parseInt(weightInput.value) || 1;
        if (edgeBeingCreated) {
            addEdge(edgeBeingCreated.source, edgeBeingCreated.target, weight);
            edgeBeingCreated = null;
        }
        weightModal.style.display = 'none';
        weightInput.value = '1';
    });
    
    cancelWeightBtn.addEventListener('click', () => {
        edgeBeingCreated = null;
        weightModal.style.display = 'none';
        weightInput.value = '1';
    });
    
    // Functions for edge management
    function addEdge(sourceNode, targetNode, weight) {
        // Check if edge already exists
        const existingEdge = edges.find(e => 
            (e.source === sourceNode && e.target === targetNode) || 
            (e.source === targetNode && e.target === sourceNode)
        );
        
        if (existingEdge) {
            // Update existing edge weight
            existingEdge.weight = weight;
            existingEdge.label.textContent = weight;
            return;
        }
        
        // Create edge element
        const edgeElement = document.createElement('div');
        edgeElement.style.position = 'absolute';
        edgeElement.style.height = '3px';
        edgeElement.style.backgroundColor = '#666';
        edgeElement.style.transformOrigin = '0 0';
        edgeElement.style.zIndex = '1';
        
        // Create weight label
        const edgeLabel = document.createElement('div');
        edgeLabel.className = 'edge-label';
        edgeLabel.textContent = weight;
        
        canvas.appendChild(edgeElement);
        canvas.appendChild(edgeLabel);
        
        const edge = {
            source: sourceNode,
            target: targetNode,
            weight: weight,
            element: edgeElement,
            label: edgeLabel
        };
        
        edges.push(edge);
        updateEdgePosition(edge);
    }
    
    function updateEdgePosition(edge) {
        const x1 = edge.source.x;
        const y1 = edge.source.y;
        const x2 = edge.target.x;
        const y2 = edge.target.y;
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        edge.element.style.width = `${length}px`;
        edge.element.style.left = `${x1}px`;
        edge.element.style.top = `${y1}px`;
        edge.element.style.transform = `rotate(${angle}deg)`;
        
        // Position the label at the middle of the edge
        edge.label.style.left = `${(x1 + x2) / 2 - 15}px`;
        edge.label.style.top = `${(y1 + y2) / 2 - 15}px`;
    }
    
    function updateEdges(node) {
        edges.forEach(edge => {
            if (edge.source === node || edge.target === node) {
                updateEdgePosition(edge);
            }
        });
    }
    
    // Helper function to find a node at given position
    function getNodeAtPosition(x, y) {
        const clickRadius = 20; // How close to the center we need to be
        
        return nodes.find(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= clickRadius;
        });
    }
    
    // Run Dijkstra button
    runDijkstraBtn.addEventListener('click', () => {
        if (!startNode) {
            alert('Vui lòng chọn điểm bắt đầu (nhấp đúp chuột vào một đỉnh)');
            return;
        }
        
        if (!endNode) {
            alert('Vui lòng chọn điểm kết thúc (nhấp chuột phải vào một đỉnh)');
            return;
        }
        
        // Clear previous path
        clearPath();
        
        // Run Dijkstra's algorithm
        const result = dijkstra(startNode);
        displayResults(result);
    });
    
    // Step Dijkstra button
    stepDijkstraBtn.addEventListener('click', () => {
        if (!startNode) {
            alert('Please set a start node (double-click on a node)');
            return;
        }
        
        if (!endNode) {
            alert('Please set an end node (right-click on a node)');
            return;
        }
        
        // Clear previous path
        clearPath();
        
        // Initialize step-by-step visualization
        state = initializeStepDijkstra();
        nextStepBtn.disabled = false;
    });
    
    // Next step button
    nextStepBtn.addEventListener('click', () => {
        if (!state) return;
        performNextStep();
    });
    
    // Clear path button
    clearPathBtn.addEventListener('click', clearPath);
    
    function clearPath() {
        // Remove path highlighting
        nodes.forEach(node => {
            if (node !== startNode && node !== endNode) {
                node.element.classList.remove('path', 'visited', 'current');
            }
        });
        
        edges.forEach(edge => {
            edge.element.style.backgroundColor = '#666';
            edge.element.style.height = '3px';
        });
        
        resultsContent.innerHTML = 'Chạy thuật toán Dijkstra để xem kết quả.';
        state = null;
        nextStepBtn.disabled = true;
        document.getElementById('current-step').textContent = '0';
        document.getElementById('total-steps').textContent = '0';
        document.getElementById('step-description').textContent = 'Nhấn "Chạy Từng Bước" để bắt đầu';
    }
    
    // Clear all button
    clearAllBtn.addEventListener('click', () => {
        while (nodes.length > 0) {
            const node = nodes.pop();
            canvas.removeChild(node.element);
        }
        
        while (edges.length > 0) {
            const edge = edges.pop();
            canvas.removeChild(edge.element);
            canvas.removeChild(edge.label);
        }
        
        startNode = null;
        endNode = null;
        nodeCounter = 0;
        resultsContent.innerHTML = 'Run Dijkstra\'s algorithm to see results.';
        clearPath();
    });
    
    // Generate random graph
    generateRandomBtn.addEventListener('click', () => {
        // Clear existing graph
        clearAllBtn.click();
        
        // Generate random nodes
        const nodeCount = Math.floor(Math.random() * 6) + 5; // 5-10 nodes
        const canvasWidth = canvas.clientWidth - 100;
        const canvasHeight = canvas.clientHeight - 100;
        
        for (let i = 0; i < nodeCount; i++) {
            const x = Math.floor(Math.random() * canvasWidth) + 50;
            const y = Math.floor(Math.random() * canvasHeight) + 50;
            addNode(x, y);
        }
        
        // Generate random edges
        const edgeCount = Math.floor(Math.random() * nodeCount * 2) + nodeCount;
        
        for (let i = 0; i < edgeCount; i++) {
            const sourceIndex = Math.floor(Math.random() * nodes.length);
            let targetIndex = Math.floor(Math.random() * nodes.length);
            
            // Ensure we don't connect a node to itself
            while (targetIndex === sourceIndex) {
                targetIndex = Math.floor(Math.random() * nodes.length);
            }
            
            const weight = Math.floor(Math.random() * 20) + 1;
            addEdge(nodes[sourceIndex], nodes[targetIndex], weight);
        }
        
        // Set random start and end nodes
        const startIndex = Math.floor(Math.random() * nodes.length);
        let endIndex = Math.floor(Math.random() * nodes.length);
        
        while (endIndex === startIndex) {
            endIndex = Math.floor(Math.random() * nodes.length);
        }
        
        setStartNode(nodes[startIndex]);
        setEndNode(nodes[endIndex]);
    });
    
    // Dijkstra's Algorithm Implementation
    function dijkstra(start) {
        // Create adjacency list representation of the graph
        const graph = {};
        nodes.forEach(node => {
            graph[node.id] = {};
        });
        
        edges.forEach(edge => {
            graph[edge.source.id][edge.target.id] = edge.weight;
            graph[edge.target.id][edge.source.id] = edge.weight; // Undirected graph
        });
        
        // Initialize distance and previous data structures
        const distances = {};
        const previous = {};
        const unvisited = new Set();
        
        nodes.forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
            unvisited.add(node.id);
        });
        
        distances[start.id] = 0;
        
        while (unvisited.size > 0) {
            // Find the unvisited node with the smallest distance
            let minDistance = Infinity;
            let current = null;
            
            unvisited.forEach(nodeId => {
                if (distances[nodeId] < minDistance) {
                    minDistance = distances[nodeId];
                    current = nodeId;
                }
            });
            
            // If we have no reachable nodes left or reached the end, break
            if (current === null || current === endNode.id) break;
            
            // Remove current from unvisited
            unvisited.delete(current);
            
            // Check each neighbor of current
            for (const neighbor in graph[current]) {
                if (unvisited.has(neighbor)) {
                    const alt = distances[current] + graph[current][neighbor];
                    if (alt < distances[neighbor]) {
                        distances[neighbor] = alt;
                        previous[neighbor] = current;
                    }
                }
            }
        }
        
        return { distances, previous };
    }
    
    // Initialize step-by-step Dijkstra
    function initializeStepDijkstra() {
        // Create adjacency list
        const graph = {};
        nodes.forEach(node => {
            graph[node.id] = {};
        });
        
        edges.forEach(edge => {
            graph[edge.source.id][edge.target.id] = edge.weight;
            graph[edge.target.id][edge.source.id] = edge.weight;
        });
        
        // Initialize data structures
        const distances = {};
        const previous = {};
        const unvisited = new Set();
        const visited = new Set();
        
        nodes.forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
            unvisited.add(node.id);
        });
        
        distances[startNode.id] = 0;
        
        // Initialize step counter
        document.getElementById('current-step').textContent = '0';
        document.getElementById('total-steps').textContent = nodes.length.toString();
        document.getElementById('step-description').textContent = 'Starting from node ' + startNode.id.replace('node-', '');
        
        return {
            graph,
            distances,
            previous,
            unvisited,
            visited,
            current: startNode.id,
            step: 0
        };
    }
    
    // Perform next step in visualization
    function performNextStep() {
        if (!state) return;
        
        const { graph, distances, previous, unvisited, visited } = state;
        
        // Clear previous step highlights
        nodes.forEach(node => {
            node.element.classList.remove('current');
            if (!visited.has(node.id)) {
                node.element.classList.remove('visited');
            }
        });
        
        edges.forEach(edge => {
            if (!visited.has(edge.source.id) || !visited.has(edge.target.id)) {
                edge.element.style.backgroundColor = '#666';
            }
        });
        
        // Find next node to visit
        let minDistance = Infinity;
        let next = null;
        
        unvisited.forEach(nodeId => {
            if (distances[nodeId] < minDistance) {
                minDistance = distances[nodeId];
                next = nodeId;
            }
        });
        
        if (next === null || next === endNode.id) {
            // Algorithm complete
            document.getElementById('step-description').textContent = 'Algorithm complete!';
            nextStepBtn.disabled = true;
            displayResults({ distances, previous });
            return;
        }
        
        // Process the next node
        const currentNode = nodes.find(n => n.id === next);
        currentNode.element.classList.add('current');
        
        // Update neighbors
        for (const neighbor in graph[next]) {
            if (unvisited.has(neighbor)) {
                const alt = distances[next] + graph[next][neighbor];
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    previous[neighbor] = next;
                    
                    // Highlight the edge
                    edges.forEach(edge => {
                        if ((edge.source.id === next && edge.target.id === neighbor) ||
                            (edge.source.id === neighbor && edge.target.id === next)) {
                            edge.element.style.backgroundColor = '#4CAF50';
                        }
                    });
                }
            }
        }
        
        // Mark as visited
        visited.add(next);
        unvisited.delete(next);
        currentNode.element.classList.add('visited');
        
        // Update state
        state.step++;
        document.getElementById('current-step').textContent = state.step.toString();
        document.getElementById('step-description').textContent = 
            `Đang xét đỉnh ${next} (khoảng cách: ${distances[next]})`;
    }
    
    // Display results and highlight the path
    function displayResults(result) {
        if (!endNode) return;
        
        const { distances, previous } = result;
        
        // Check if the end node is reachable
        if (distances[endNode.id] === Infinity) {
            resultsContent.innerHTML = '<p>Không tìm thấy đường đi từ điểm bắt đầu đến điểm kết thúc!</p>';
            return;
        }
        
        // Reconstruct the path
        const path = [];
        let current = endNode.id;
        
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }
        
        // Highlight nodes in the path
        path.forEach(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            if (node !== startNode && node !== endNode) {
                node.element.classList.add('path');
            }
        });
        
        // Highlight edges in the path
        for (let i = 0; i < path.length - 1; i++) {
            const sourceId = path[i];
            const targetId = path[i + 1];
            
            edges.forEach(edge => {
                if ((edge.source.id === sourceId && edge.target.id === targetId) ||
                    (edge.source.id === targetId && edge.target.id === sourceId)) {
                    edge.element.style.backgroundColor = '#9b59b6';
                    edge.element.style.height = '5px';
                }
            });
        }
        
        // Display results
        let html = `<p><strong>Đường đi ngắn nhất từ Đỉnh ${startNode.id} đến Đỉnh ${endNode.id}</strong></p>`;
        html += `<p>Tổng khoảng cách: ${distances[endNode.id]}</p>`;
        html += '<p>Đường đi: ';
        
        path.forEach((nodeId, index) => {
            html += nodeId;
            if (index < path.length - 1) {
                html += ' → ';
            }
        });
        html += '</p>';
        
        resultsContent.innerHTML = html;
    }
}); 