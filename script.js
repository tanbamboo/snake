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

// 特殊食物相关变量
let foodType = 'normal'; // 食物类型：normal, golden, star, ghost, diamond, slow
let specialFoodTimer = null; // 特殊食物计时器
let effectTimer = null; // 特殊效果计时器
let activeEffect = null; // 当前激活的特殊效果
let originalGameSpeed = gameSpeed; // 保存原始游戏速度
let canPassWalls = false; // 是否可以穿墙
let effectTimeLeft = 0; // 特殊效果剩余时间
let effectDisplayInterval = null; // 特殊效果显示计时器

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
        if (canPassWalls) {
            // 穿墙效果：从另一侧出现
            if (head.x < 0) head.x = maxX;
            else if (head.x > maxX) head.x = 0;
            else if (head.y < 0) head.y = maxY;
            else if (head.y > maxY) head.y = 0;
        } else {
            gameOver();
            return;
        }
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
        // 根据食物类型应用效果
        applyFoodEffect();
        
        // 生成新食物
        generateFood();
        
        // 更新分数
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
    
    // 确定食物类型
    determineFoodType();
    
    // 如果是特殊食物，设置消失计时器
    if (foodType !== 'normal') {
        if (specialFoodTimer) {
            clearTimeout(specialFoodTimer);
        }
        specialFoodTimer = setTimeout(() => {
            // 特殊食物消失，生成新的普通食物
            foodType = 'normal';
            generateFood();
        }, 10000); // 10秒后消失
    }
    
    food = newFood;
}

// 确定食物类型
function determineFoodType() {
    const random = Math.random() * 100;
    
    if (random < 60) { // 60%概率是普通食物
        foodType = 'normal';
    } else if (random < 75) { // 15%概率是金苹果
        foodType = 'golden';
    } else if (random < 85) { // 10%概率是星星
        foodType = 'star';
    } else if (random < 90) { // 5%概率是幽灵
        foodType = 'ghost';
    } else if (random < 93) { // 3%概率是钻石
        foodType = 'diamond';
    } else { // 7%概率是减速器
        foodType = 'slow';
    }
}

// 修改检查食物函数
function checkFood() {
    const head = snake[0];
    
    if (head.x === food.x && head.y === food.y) {
        // 根据食物类型应用效果
        applyFoodEffect();
        
        // 生成新食物
        generateFood();
        
        // 更新分数
        updateScore();
    }
}

// 应用食物效果
function applyFoodEffect() {
    // 清除之前的特殊效果计时器
    if (effectTimer) {
        clearTimeout(effectTimer);
        effectTimer = null;
    }
    
    // 清除效果显示计时器
    if (effectDisplayInterval) {
        clearInterval(effectDisplayInterval);
        effectDisplayInterval = null;
    }
    
    // 重置特殊效果
    resetEffects();
    
    // 根据食物类型应用不同效果
    switch(foodType) {
        case 'golden':
            // 金苹果：双倍分数
            score += 10; // 额外加10分（updateScore会再加10分）
            showEffectMessage('双倍分数！+20', '#FFD700');
            break;
            
        case 'star':
            // 星星：加速
            activeEffect = 'speed';
            effectTimeLeft = 10;
            originalGameSpeed = gameSpeed;
            gameSpeed = Math.floor(gameSpeed * 0.7); // 速度提升30%
            
            // 重新设置游戏循环
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
            
            // 设置效果结束计时器
            effectTimer = setTimeout(() => {
                gameSpeed = originalGameSpeed;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
                activeEffect = null;
            }, 10000); // 10秒后恢复
            
            showEffectMessage('加速！10秒', '#3498db');
            startEffectCountdown(10);
            break;
            
        case 'ghost':
            // 幽灵：穿墙
            activeEffect = 'ghost';
            effectTimeLeft = 8;
            canPassWalls = true;
            
            // 设置效果结束计时器
            effectTimer = setTimeout(() => {
                canPassWalls = false;
                activeEffect = null;
            }, 8000); // 8秒后恢复
            
            showEffectMessage('穿墙！8秒', '#ffffff');
            startEffectCountdown(8);
            break;
            
        case 'diamond':
            // 钻石：三倍分数
            score += 20; // 额外加20分（updateScore会再加10分）
            showEffectMessage('三倍分数！+30', '#3498db');
            break;
            
        case 'slow':
            // 减速器：减速
            activeEffect = 'slow';
            effectTimeLeft = 12;
            originalGameSpeed = gameSpeed;
            gameSpeed = Math.floor(gameSpeed * 1.2); // 速度降低20%
            
            // 重新设置游戏循环
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
            
            // 设置效果结束计时器
            effectTimer = setTimeout(() => {
                gameSpeed = originalGameSpeed;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
                activeEffect = null;
            }, 12000); // 12秒后恢复
            
            showEffectMessage('减速！12秒', '#9b59b6');
            startEffectCountdown(12);
            break;
    }
}

// 重置所有特殊效果
function resetEffects() {
    canPassWalls = false;
    gameSpeed = originalGameSpeed;
    activeEffect = null;
}

// 显示特殊效果消息
function showEffectMessage(message, color) {
    // 创建或获取效果消息元素
    let effectMsg = document.getElementById('effect-message');
    if (!effectMsg) {
        effectMsg = document.createElement('div');
        effectMsg.id = 'effect-message';
        document.querySelector('.game-container').appendChild(effectMsg);
    }
    
    // 设置消息内容和样式
    effectMsg.textContent = message;
    effectMsg.style.color = color;
    effectMsg.style.display = 'block';
    
    // 3秒后隐藏消息
    setTimeout(() => {
        effectMsg.style.display = 'none';
    }, 3000);
}

// 开始特殊效果倒计时
function startEffectCountdown(seconds) {
    effectTimeLeft = seconds;
    
    // 创建或获取倒计时元素
    let countdownEl = document.getElementById('effect-countdown');
    if (!countdownEl) {
        countdownEl = document.createElement('div');
        countdownEl.id = 'effect-countdown';
        document.querySelector('.game-container').appendChild(countdownEl);
    }
    
    countdownEl.style.display = 'block';
    
    // 更新倒计时
    function updateCountdown() {
        if (effectTimeLeft > 0) {
            countdownEl.textContent = `${activeEffect === 'speed' ? '加速' : 
                                      activeEffect === 'ghost' ? '穿墙' : 
                                      activeEffect === 'slow' ? '减速' : ''}: ${effectTimeLeft}秒`;
            effectTimeLeft--;
        } else {
            countdownEl.style.display = 'none';
            clearInterval(effectDisplayInterval);
            effectDisplayInterval = null;
        }
    }
    
    updateCountdown(); // 立即更新一次
    effectDisplayInterval = setInterval(updateCountdown, 1000);
}

// 修改检查碰撞函数，添加穿墙逻辑
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    const maxX = Math.floor(canvas.width / gridSize) - 1;
    const maxY = Math.floor(canvas.height / gridSize) - 1;
    
    if (head.x < 0 || head.x > maxX || head.y < 0 || head.y > maxY) {
        if (canPassWalls) {
            // 穿墙效果：从另一侧出现
            if (head.x < 0) head.x = maxX;
            else if (head.x > maxX) head.x = 0;
            else if (head.y < 0) head.y = maxY;
            else if (head.y > maxY) head.y = 0;
        } else {
            gameOver();
            return;
        }
    }
    
    // 检查是否撞到自己（从第4个身体部分开始检查，因为蛇不可能撞到紧邻头部的身体部分）
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// 修改绘制函数，添加特殊食物的绘制
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    drawGrid();
    
    // 绘制食物
    drawFood();
    
    // 绘制蛇
    for (let i = 0; i < snake.length; i++) {
        // 蛇头
        if (i === 0) {
            ctx.fillStyle = '#2ecc71';
            ctx.strokeStyle = '#27ae60';
        } 
        // 蛇身 - 使用渐变色
        else {
            const gradientPosition = i / snake.length;
            ctx.fillStyle = `hsl(${145 - gradientPosition * 30}, 70%, 50%)`;
            ctx.strokeStyle = `hsl(${145 - gradientPosition * 30}, 70%, 40%)`;
            
            // 如果有幽灵效果，让蛇身半透明
            if (activeEffect === 'ghost') {
                ctx.globalAlpha = 0.6;
            }
        }
        
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        
        // 重置透明度
        ctx.globalAlpha = 1.0;
    }
    
    // 绘制蛇眼睛
    drawSnakeEyes(snake[0]);
}

// 绘制食物函数
function drawFood() {
    switch(foodType) {
        case 'normal':
            // 普通食物 - 红色
            ctx.fillStyle = '#e74c3c';
            ctx.strokeStyle = '#c0392b';
            break;
        case 'golden':
            // 金苹果 - 金色，带闪烁效果
            const time = new Date().getTime() / 200;
            const brightness = Math.floor(80 + Math.sin(time) * 20);
            ctx.fillStyle = `rgb(255, ${brightness + 150}, 0)`;
            ctx.strokeStyle = '#ff8c00';
            break;
        case 'star':
            // 星星 - 蓝色
            ctx.fillStyle = '#3498db';
            ctx.strokeStyle = '#2980b9';
            break;
        case 'ghost':
            // 幽灵 - 半透明白色
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
            break;
        case 'diamond':
            // 钻石 - 蓝色钻石形状
            ctx.fillStyle = '#1abc9c';
            ctx.strokeStyle = '#16a085';
            break;
        case 'slow':
            // 减速器 - 紫色
            ctx.fillStyle = '#9b59b6';
            ctx.strokeStyle = '#8e44ad';
            break;
    }
    
    // 绘制食物基本形状
    if (foodType === 'diamond') {
        // 钻石形状
        drawDiamond(food.x, food.y);
    } else if (foodType === 'star') {
        // 星星形状
        drawStar(food.x, food.y);
    } else {
        // 其他食物为方形
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }
}

// 绘制钻石形状
function drawDiamond(x, y) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    const size = gridSize * 0.8;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size / 2); // 上点
    ctx.lineTo(centerX + size / 2, centerY); // 右点
    ctx.lineTo(centerX, centerY + size / 2); // 下点
    ctx.lineTo(centerX - size / 2, centerY); // 左点
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
}

// 绘制星星形状
function drawStar(x, y) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    const outerRadius = gridSize * 0.4;
    const innerRadius = gridSize * 0.2;
    const spikes = 5;
    
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = Math.PI / spikes * i;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 绘制蛇眼睛
function drawSnakeEyes(head) {
    const eyeSize = gridSize * 0.2;
    const eyeOffset = gridSize * 0.25;
    
    ctx.fillStyle = 'white';
    
    // 根据蛇的方向调整眼睛位置
    switch(direction) {
        case 'up':
            // 眼睛在上方
            ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
            break;
        case 'down':
            // 眼睛在下方
            ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
        case 'left':
            // 眼睛在左侧
            ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
        case 'right':
            // 眼睛在右侧
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
    }
    
    // 绘制瞳孔
    ctx.fillStyle = 'black';
    const pupilSize = eyeSize * 0.6;
    const pupilOffset = (eyeSize - pupilSize) / 2;
    
    switch(direction) {
        case 'up':
            ctx.fillRect(head.x * gridSize + eyeOffset + pupilOffset, head.y * gridSize + eyeOffset + pupilOffset, pupilSize, pupilSize);
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize + pupilOffset, head.y * gridSize + eyeOffset + pupilOffset, pupilSize, pupilSize);
            break;
        case 'down':
            ctx.fillRect(head.x * gridSize + eyeOffset + pupilOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize + pupilOffset, pupilSize, pupilSize);
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize + pupilOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize + pupilOffset, pupilSize, pupilSize);
            break;
        case 'left':
            ctx.fillRect(head.x * gridSize + eyeOffset + pupilOffset, head.y * gridSize + eyeOffset + pupilOffset, pupilSize, pupilSize);
            ctx.fillRect(head.x * gridSize + eyeOffset + pupilOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize + pupilOffset, pupilSize, pupilSize);
            break;
        case 'right':
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize + pupilOffset, head.y * gridSize + eyeOffset + pupilOffset, pupilSize, pupilSize);
            ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize + pupilOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize + pupilOffset, pupilSize, pupilSize);
            break;
    }
}

// 绘制网格背景
function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
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
    
    // 清除所有特殊效果
    if (effectTimer) {
        clearTimeout(effectTimer);
    }
    if (specialFoodTimer) {
        clearTimeout(specialFoodTimer);
    }
    if (effectDisplayInterval) {
        clearInterval(effectDisplayInterval);
    }
    
    // 重置特殊效果
    resetEffects();
}

// 当页面加载完成后初始化游戏
window.onload = initGame;