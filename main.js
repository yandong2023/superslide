// Game board configuration
const BOARD_SIZE = 4;
const CELL_SIZE = 100;
const BOARD_PADDING = 5;

// Block types and their sizes
const BLOCKS = {
  HERO: { width: 2, height: 2, color: '#9333ea' },
  VERTICAL: { width: 1, height: 2, color: '#7e22ce' },
  HORIZONTAL: { width: 2, height: 1, color: '#6b21a8' },
  SMALL: { width: 1, height: 1, color: '#581c87' }
};

// Initial layout of the puzzle
const INITIAL_LAYOUT = [
  { type: 'HERO', x: 1, y: 0 },
  { type: 'VERTICAL', x: 0, y: 0 },
  { type: 'VERTICAL', x: 3, y: 0 },
  { type: 'HORIZONTAL', x: 0, y: 2 },
  { type: 'HORIZONTAL', x: 2, y: 2 },
  { type: 'SMALL', x: 0, y: 3 },
  { type: 'SMALL', x: 1, y: 3 },
  { type: 'SMALL', x: 2, y: 3 },
  { type: 'SMALL', x: 3, y: 3 }
];

class KlotskiGame {
  constructor(container) {
    this.container = container;
    this.blocks = [];
    this.selectedBlock = null;
    this.moves = 0;

    this.init();
  }

  init() {
    // Set up the game container
    this.container.style.width = `${BOARD_SIZE * CELL_SIZE + BOARD_PADDING * 2}px`;
    this.container.style.height = `${BOARD_SIZE * CELL_SIZE + BOARD_PADDING * 2}px`;
    this.container.style.position = 'relative';
    this.container.style.backgroundColor = '#1f2937';
    this.container.style.padding = `${BOARD_PADDING}px`;

    // Create blocks
    INITIAL_LAYOUT.forEach(block => {
      this.createBlock(block);
    });

    // Add event listeners
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  createBlock({ type, x, y }) {
    const blockConfig = BLOCKS[type];
    const block = document.createElement('div');
    block.className = 'block';
    block.style.width = `${blockConfig.width * CELL_SIZE - 4}px`;
    block.style.height = `${blockConfig.height * CELL_SIZE - 4}px`;
    block.style.backgroundColor = blockConfig.color;
    block.style.left = `${x * CELL_SIZE + BOARD_PADDING}px`;
    block.style.top = `${y * CELL_SIZE + BOARD_PADDING}px`;

    this.blocks.push({
      element: block,
      x,
      y,
      width: blockConfig.width,
      height: blockConfig.height,
      type
    });

    this.container.appendChild(block);
  }

  handleMouseDown(e) {
    const block = this.blocks.find(block => {
      const rect = block.element.getBoundingClientRect();
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
    });

    if (block) {
      this.selectedBlock = block;
      this.offsetX = e.clientX - block.element.offsetLeft;
      this.offsetY = e.clientY - block.element.offsetTop;
      block.element.style.zIndex = '10';
    }
  }

  handleMouseMove(e) {
    if (!this.selectedBlock) return;

    const newX = e.clientX - this.offsetX;
    const newY = e.clientY - this.offsetY;

    // Convert to grid coordinates
    const gridX = Math.round((newX - BOARD_PADDING) / CELL_SIZE);
    const gridY = Math.round((newY - BOARD_PADDING) / CELL_SIZE);

    // Check bounds
    if (gridX < 0 || gridY < 0 || 
        gridX + this.selectedBlock.width > BOARD_SIZE || 
        gridY + this.selectedBlock.height > BOARD_SIZE) {
      return;
    }

    // Check collision with other blocks
    const hasCollision = this.blocks.some(block => {
      if (block === this.selectedBlock) return false;
      return this.checkCollision(
        {x: gridX, y: gridY, width: this.selectedBlock.width, height: this.selectedBlock.height},
        block
      );
    });

    if (!hasCollision) {
      this.selectedBlock.element.style.left = `${newX}px`;
      this.selectedBlock.element.style.top = `${newY}px`;
    }
  }

  checkCollision(block1, block2) {
    return !(block1.x + block1.width <= block2.x ||
             block2.x + block2.width <= block1.x ||
             block1.y + block1.height <= block2.y ||
             block2.y + block2.height <= block1.y);
  }

  handleMouseUp() {
    if (!this.selectedBlock) return;

    // Snap to grid
    const gridX = Math.round((this.selectedBlock.element.offsetLeft - BOARD_PADDING) / CELL_SIZE);
    const gridY = Math.round((this.selectedBlock.element.offsetTop - BOARD_PADDING) / CELL_SIZE);

    this.selectedBlock.element.style.left = `${gridX * CELL_SIZE + BOARD_PADDING}px`;
    this.selectedBlock.element.style.top = `${gridY * CELL_SIZE + BOARD_PADDING}px`;
    this.selectedBlock.element.style.zIndex = '1';

    this.selectedBlock.x = gridX;
    this.selectedBlock.y = gridY;

    this.moves++;
    this.checkWin();

    this.selectedBlock = null;
  }

  checkWin() {
    const heroBlock = this.blocks.find(block => block.type === 'HERO');
    if (heroBlock.x === 1 && heroBlock.y === 3) {
      setTimeout(() => {
        alert(`Congratulations! You solved the puzzle in ${this.moves} moves!`);
      }, 100);
    }
  }
}

// Initialize the game
const gameContainer = document.getElementById('game-container');
const game = new KlotskiGame(gameContainer);