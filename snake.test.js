// snake.test.js
describe('Snake Game Tests', () => {
  // 全局变量模拟
  let snake, food, direction, newDirection;
  
  // 模拟依赖函数
  const generateFood = jest.fn();
  const updateScore = jest.fn();
  
  beforeEach(() => {
    // 在每个测试前重置状态
    snake = [
      { x: 5, y: 10 }, // 头部
      { x: 4, y: 10 }, // 身体
      { x: 3, y: 10 }  // 尾部
    ];
    food = { x: 6, y: 10 }; // 默认食物位置
    direction = 'right';
    newDirection = 'right';
    
    // 重置模拟函数
    generateFood.mockClear();
    updateScore.mockClear();
  });
  
  // 测试函数定义
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
  
  test('蛇向右移动时，头部应该向右移动一格', () => {
    // 初始设置
    direction = 'right';
    newDirection = 'right';
    const initialLength = snake.length;
    const initialHead = { ...snake[0] };
    
    // 确保食物不在蛇头部的下一个位置
    food = { x: 10, y: 10 }; // 将食物放在远离蛇头的位置
    
    // 执行
    moveSnake();
    
    // 验证
    expect(snake.length).toBe(initialLength); // 长度不变
    expect(snake[0].x).toBe(initialHead.x + 1); // x坐标+1
    expect(snake[0].y).toBe(initialHead.y); // y坐标不变
    expect(snake[snake.length - 1].x).not.toBe(3); // 尾部已移除
    expect(generateFood).not.toHaveBeenCalled();
    expect(updateScore).not.toHaveBeenCalled();
  });
  
  test('蛇向左移动时，头部应该向左移动一格', () => {
    // 初始设置
    direction = 'right'; // 当前方向
    newDirection = 'left'; // 新方向
    const initialLength = snake.length;
    const initialHead = { ...snake[0] };
    
    // 执行
    moveSnake();
    
    // 验证
    expect(snake.length).toBe(initialLength); // 长度不变
    expect(snake[0].x).toBe(initialHead.x - 1); // x坐标-1
    expect(snake[0].y).toBe(initialHead.y); // y坐标不变
    expect(generateFood).not.toHaveBeenCalled();
    expect(updateScore).not.toHaveBeenCalled();
  });
  
  test('蛇向上移动时，头部应该向上移动一格', () => {
    // 初始设置
    direction = 'right'; // 当前方向
    newDirection = 'up'; // 新方向
    const initialLength = snake.length;
    const initialHead = { ...snake[0] };
    
    // 执行
    moveSnake();
    
    // 验证
    expect(snake.length).toBe(initialLength); // 长度不变
    expect(snake[0].x).toBe(initialHead.x); // x坐标不变
    expect(snake[0].y).toBe(initialHead.y - 1); // y坐标-1
    expect(generateFood).not.toHaveBeenCalled();
    expect(updateScore).not.toHaveBeenCalled();
  });
  
  test('蛇向下移动时，头部应该向下移动一格', () => {
    // 初始设置
    direction = 'right'; // 当前方向
    newDirection = 'down'; // 新方向
    const initialLength = snake.length;
    const initialHead = { ...snake[0] };
    
    // 执行
    moveSnake();
    
    // 验证
    expect(snake.length).toBe(initialLength); // 长度不变
    expect(snake[0].x).toBe(initialHead.x); // x坐标不变
    expect(snake[0].y).toBe(initialHead.y + 1); // y坐标+1
    expect(generateFood).not.toHaveBeenCalled();
    expect(updateScore).not.toHaveBeenCalled();
  });
  
  test('蛇吃到食物时，应该增长并生成新食物', () => {
    // 初始设置 - 让蛇头部下一步会到达食物位置
    snake[0] = { x: 5, y: 10 };
    food = { x: 6, y: 10 };
    direction = 'right';
    newDirection = 'right';
    const initialLength = snake.length;
    
    // 执行
    moveSnake();
    
    // 验证
    expect(snake.length).toBe(initialLength + 1); // 长度增加1
    expect(snake[0].x).toBe(food.x); // 头部到达食物位置
    expect(snake[0].y).toBe(food.y);
    expect(generateFood).toHaveBeenCalledTimes(1); // 生成新食物
    expect(updateScore).toHaveBeenCalledTimes(1); // 更新分数
  });
  
  test('方向更新应该从newDirection获取', () => {
    // 初始设置
    direction = 'up';
    newDirection = 'right';
    
    // 执行
    moveSnake();
    
    // 验证
    expect(direction).toBe('right'); // 方向已更新
  });
  
  test('蛇移动后应该保持正确的身体结构', () => {
    // 初始设置
    snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
    ];
    direction = 'right';
    newDirection = 'right';
    
    // 确保食物不在蛇头部的下一个位置
    food = { x: 10, y: 10 }; // 将食物放在远离蛇头的位置
    
    // 执行
    moveSnake();
    
    // 验证 - 检查整个蛇的结构
    expect(snake).toEqual([
      { x: 6, y: 10 }, // 新头部
      { x: 5, y: 10 }, // 原头部变成第二节
      { x: 4, y: 10 }  // 原第二节变成第三节，原尾部被移除
    ]);
  });
});