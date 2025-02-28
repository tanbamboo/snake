// 游戏变量
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let newDirection = 'right';
let gameSpeed = 100; // 毫秒
let gridSize = 20;
let gameInterval;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let isPaused = false;
let isGameOver = false;
let isGameStarted = false;

// DOM 元素
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');

// 移动控制按钮
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// 初始化游戏
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // 更新画布尺寸
    updateCanvasSize();
    
    // 初始化蛇
    resetGame();
    
    // 显示高分
    highScoreElement.textContent = highScore;
    
    // 添加事件监听器
    document.addEventListener('keydown', handleKeyPress);
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
    
    // 移动端控制
    upBtn.addEventListener('click', () => changeDirection('up'));
    downBtn.addEventListener('click', () => changeDirection('down'));
    leftBtn.addEventListener('click', () => changeDirection('left'));
    rightBtn.addEventListener('click', () => changeDirection('right'));
    
    // 响应窗口大小变化
    window.addEventListener('resize', updateCanvasSize);
    
    // 绘制初始状态
    draw();
}

// 更新画布尺寸
function updateCanvasSize() {
    // 获取画布容器的宽度
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth - 40; // 减去内边距
    
    // 如果是移动设备，调整画布大小
    if (window.innerWidth <= 768) {
        canvas.width = 300;
        canvas.height = 300;
    } else {
        // 确保画布不超过容器宽度
        canvas.width = Math.min(400, containerWidth);
        canvas.height = Math.min(400, containerWidth);
    }
    
    // 调整网格大小
    gridSize = Math.floor(canvas.width / 20);
    
    // 如果游戏已经开始，重新绘制
    if (isGameStarted) {
        draw();
    }
}

// 开始游戏
function startGame() {
    if (!isGameStarted) {
        isGameStarted = true;
        isGameOver = false;
        gameOverElement.classList.add('hidden');
        gameInterval = setInterval(gameLoop, gameSpeed);
        startBtn.disabled = true;
    }
}

// 游戏循环
function gameLoop() {
    if (!isPaused && !isGameOver) {
        moveSnake();
        checkCollision();
        if (!isGameOver) {
            checkFood();
            draw();
        }
    }
}

// 重置游戏
function resetGame() {
    // 清除之前的游戏循环
    clearInterval(gameInterval);
    
    // 重置游戏状态
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    direction = 'right';
    newDirection = 'right';
    score = 0;
    isPaused = false;
    isGameOver = false;
    isGameStarted = false;
    
    // 生成食物
    generateFood();
    
    // 更新分数显示
    scoreElement.textContent = score;
    
    // 隐藏游戏结束界面
    gameOverElement.classList.add('hidden');
    
    // 重置按钮状态
    startBtn.disabled = false;
    
    // 绘制初始状态
    draw();
}

// 暂停/继续游戏
function togglePause() {
    if (!isGameStarted || isGameOver) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

// 处理键盘输入
function handleKeyPress(e) {
    switch(e.key) {
        case 'ArrowUp':
            changeDirection('up');
            break;
        case 'ArrowDown':
            changeDirection('down');
            break;
        case 'ArrowLeft':
            changeDirection('left');
            break;
        case 'ArrowRight':
            changeDirection('right');
            break;
        case ' ':
            // 空格键暂停/继续
            togglePause();
            break;
        case 'Enter':
            // 回车键开始游戏
            if (!isGameStarted) {
                startGame();
            }
            break;
    }
}

// 改变方向
function changeDirection(newDir) {
    // 防止180度转弯
    if ((newDir === 'up' && direction !== 'down') ||
        (newDir === 'down' && direction !== 'up') ||
        (newDir === 'left' && direction !== 'right') ||
        (newDir === 'right' && direction !== 'left')) {
        newDirection = newDir;
    }
    
    // 如果游戏未开始，按方向键也可以开始游戏
    if (!isGameStarted) {
        startGame();
    }
}

// 移动蛇
function moveSnake() {
    // 更新方向
    direction = newDirection;
    
    // 根据当前方向计算新的头部位置
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch(direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 将新头部添加到蛇身体的前面
    snake.unshift(head);
    
    // 如果没有吃到食物，移除尾部；否则保留尾部，蛇身体增长
    if (head.x === food.x && head.y === food.y) {
        // 吃到食物，生成新食物，增加分数
        generateFood();
        updateScore();
    } else {
        // 没吃到食物，移除尾部
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    const maxX = Math.floor(canvas.width / gridSize) - 1;
    const maxY = Math.floor(canvas.height / gridSize) - 1;
    
    if (head.x < 0 || head.x > maxX || head.y < 0 || head.y > maxY) {
        gameOver();
        return;
    }
    
    // 检查是否撞到自己（从第4个身体部分开始检查，因为蛇不可能撞到紧邻头部的身体部分）
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// 检查是否吃到食物
function checkFood() {
    const head = snake[0];
    
    if (head.x === food.x && head.y === food.y) {
        generateFood();
        updateScore();
    }
}

// 生成食物
function generateFood() {
    const maxX = Math.floor(canvas.width / gridSize) - 1;
    const maxY = Math.floor(canvas.height / gridSize) - 1;
    
    // 生成随机位置
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
        
        // 检查食物是否生成在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 更新分数
function updateScore() {
    score += 10;
    scoreElement.textContent = score;
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    
    // 显示游戏结束界面
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
    
    // 重置按钮状态
    startBtn.disabled = false;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    drawGrid();
    
    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 头部使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#2ecc71';
        } else {
            // 身体部分使用渐变色
            const greenValue = Math.floor(180 - (index * 3));
            ctx.fillStyle = `rgb(46, ${Math.max(greenValue, 100)}, 113)`;
        }
        
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        
        // 为蛇的每个部分添加边框
        ctx.strokeStyle = '#27ae60';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        
        // 为蛇头添加眼睛
        if (index === 0) {
            drawSnakeEyes(segment);
        }
    });
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    
    const cols = Math.floor(canvas.width / gridSize);
    const rows = Math.floor(canvas.height / gridSize);
    
    // 绘制垂直线
    for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

// 绘制蛇的眼睛
function drawSnakeEyes(head) {
    const eyeSize = gridSize / 5;
    const eyeOffset = gridSize / 3;
    
    ctx.fillStyle = '#000';
    
    // 根据方向绘制眼睛
    switch(direction) {
        case 'up':
            // 向上时眼睛在上半部分左右两侧
            ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
            break;
        case 'down':
            // 向下时眼睛在下半部分左右两侧
            ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
        case 'left':
            // 向左时眼睛在左半部分上下两侧
            ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
        case 'right':
            // 向右时眼睛在右半部分上下两侧
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);