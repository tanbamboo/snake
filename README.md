# 贪吃蛇游戏

## 项目简介

这是一个使用HTML5、CSS3和JavaScript开发的经典贪吃蛇游戏。游戏具有简洁美观的界面，流畅的操作体验，支持键盘和触屏操作，适合各种设备使用。

## 功能特点

- **响应式设计**：适配不同屏幕尺寸，在电脑和移动设备上均可流畅运行
- **美观界面**：精心设计的游戏界面，包括渐变色蛇身和动态眼睛
- **游戏控制**：支持键盘方向键和屏幕按钮双重控制方式
- **分数系统**：实时记录当前分数和历史最高分（使用localStorage保存）
- **游戏状态**：包含开始、暂停、继续、重新开始等多种状态控制
- **特殊食物系统**：
  - 金苹果：双倍分数
  - 星星：临时加速
  - 幽灵：临时穿墙能力
  - 钻石：三倍分数
  - 减速器：临时减速
- **视觉效果**：
  - 渐变色蛇身
  - 特殊形状食物
  - 效果提示和倒计时

## 技术栈

- HTML5 Canvas：用于游戏画面渲染
- CSS3：实现界面样式和响应式布局
- JavaScript：实现游戏逻辑和交互功能
- localStorage：保存游戏最高分记录

## 如何运行

### 在线运行

直接在浏览器中打开`index.html`文件即可开始游戏。

### 本地部署

1. 克隆或下载本项目到本地
2. 使用任意现代浏览器打开`index.html`文件
3. 开始游戏！

## 游戏控制

### 键盘控制

- **方向键**：控制蛇的移动方向（上、下、左、右）
- **空格键**：暂停/继续游戏
- **回车键**：开始游戏

### 触屏控制（移动设备）

游戏界面下方提供了方向控制按钮，点击对应按钮控制蛇的移动方向。

## 游戏规则

1. 控制蛇吃到食物（红色方块）可增加分数和蛇的长度
2. 撞到墙壁或自己的身体会导致游戏结束
3. 每吃到一个食物得10分
4. 游戏会记录并显示历史最高分

## 项目结构

- `index.html`：游戏的HTML结构
- `style.css`：游戏的样式表
- `script.js`：游戏的JavaScript逻辑代码

## 开发者信息

这是一个用于学习和娱乐的开源项目，欢迎贡献代码或提出改进建议。

## 未来计划

- 难度级别
- 多人模式
- 主题切换
- 排行榜系统

## 许可证

MIT License