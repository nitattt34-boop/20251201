let ssIdle, ssWalk, ssAction, ssCast, ssProjectile; // 新增施法和投射物的 Sprite Sheet
const animIdle = [];
const animWalk = [];
const animAction = [];
const animCast = [];
const animProjectile = [];

// 站立動畫的設定
const IDLE_SS_WIDTH = 1115;
const IDLE_SS_HEIGHT = 46;
const IDLE_FRAME_COUNT = 14;

// 走路動畫的設定
const WALK_SS_WIDTH = 605;
const WALK_SS_HEIGHT = 60;
const WALK_FRAME_COUNT = 10;

// 新增：動作動畫的設定
const ACTION_SS_WIDTH = 443;
const ACTION_SS_HEIGHT = 53;
const ACTION_FRAME_COUNT = 7;

// 新增：施法動畫的設定
const CAST_SS_WIDTH = 124;
const CAST_SS_HEIGHT = 37;
const CAST_FRAME_COUNT = 3;

// 新增：投射物動畫的設定
const PROJECTILE_SS_WIDTH = 225;
const PROJECTILE_SS_HEIGHT = 40;
const PROJECTILE_FRAME_COUNT = 5;

// 新增：角色放大倍率
const SCALE_FACTOR = 2.5;

// 角色狀態
let charX, charY;
let speed = 6;
let direction = 1; // 1 for right, -1 for left

// 新增：跳躍相關物理變數
let isJumping = false;
let velocityY = 0;
const gravity = 0.6;
const jumpForce = -15; // 負數表示向上
let groundY;

// 新增：施法狀態
let isCasting = false;
let castFrameCounter = 0;

// 新增：投射物管理
const projectiles = [];
const projectileSpeed = 12;

// 預先載入資源
function preload() {
  // 載入站立、走路和新動作的圖片精靈
  ssIdle = loadImage('1/1all.png');
  ssWalk = loadImage('2/2all.png');
  ssAction = loadImage('3/3all.png'); // 跳躍動畫使用 '3/3all.png'
  ssCast = loadImage('4/4all.png');
  ssProjectile = loadImage('5/5all.png');
}

function setup() {
  // 建立一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);

  // 初始化角色位置
  charX = width / 2;
  groundY = height / 2; // 將初始Y設為地面
  charY = groundY;

  // --- 處理站立動畫 ---
  const idleFrameWidth = IDLE_SS_WIDTH / IDLE_FRAME_COUNT;
  for (let i = 0; i < IDLE_FRAME_COUNT; i++) {
    let frame = ssIdle.get(i * idleFrameWidth, 0, idleFrameWidth, IDLE_SS_HEIGHT);
    animIdle.push(frame);
  }

  // --- 處理走路動畫 ---
  const walkFrameWidth = WALK_SS_WIDTH / WALK_FRAME_COUNT;
  for (let i = 0; i < WALK_FRAME_COUNT; i++) {
    let frame = ssWalk.get(i * walkFrameWidth, 0, walkFrameWidth, WALK_SS_HEIGHT);
    animWalk.push(frame);
  }

  // --- 處理動作動畫 ---
  const actionFrameWidth = ACTION_SS_WIDTH / ACTION_FRAME_COUNT;
  for (let i = 0; i < ACTION_FRAME_COUNT; i++) {
    let frame = ssAction.get(i * actionFrameWidth, 0, actionFrameWidth, ACTION_SS_HEIGHT);
    animAction.push(frame);
  }

  // --- 處理施法動畫 ---
  const castFrameWidth = CAST_SS_WIDTH / CAST_FRAME_COUNT;
  for (let i = 0; i < CAST_FRAME_COUNT; i++) {
    let frame = ssCast.get(i * castFrameWidth, 0, castFrameWidth, CAST_SS_HEIGHT);
    animCast.push(frame);
  }

  // --- 處理投射物動畫 ---
  const projectileFrameWidth = PROJECTILE_SS_WIDTH / PROJECTILE_FRAME_COUNT;
  for (let i = 0; i < PROJECTILE_FRAME_COUNT; i++) {
    let frame = ssProjectile.get(i * projectileFrameWidth, 0, projectileFrameWidth, PROJECTILE_SS_HEIGHT);
    animProjectile.push(frame);
  }

  // 設定動畫播放速度 (每秒 8 格)，放慢速度
  frameRate(8);

  // 讓圖片繪製的基準點在圖片的中心
  imageMode(CENTER);
}

// 使用 keyPressed 處理單次觸發的動作，如跳躍
function keyPressed() {
  // 跳躍
  if (keyCode === UP_ARROW && !isJumping) {
    isJumping = true;
    velocityY = jumpForce;
  }
  // 施法 (空白鍵)
  if (keyCode === 32 && !isJumping && !isCasting) {
    isCasting = true;
  }
}

function draw() {
  // 設定背景顏色
  background('#bfbdc1');

  // --- 1. 物理計算 (處理跳躍) ---
  if (isJumping) {
    velocityY += gravity; // 重力持續影響速度
    charY += velocityY;   // 根據速度更新Y座標

    // 判斷是否落地
    if (charY >= groundY) {
      charY = groundY; // 確保角色不會掉到地面以下
      isJumping = false;
      velocityY = 0;
    }
  }

  // --- 2. 水平移動與方向更新 ---
  // 只有在不施法的時候才能移動
  let isWalking = false;
  if (!isCasting) {
    if (keyIsDown(RIGHT_ARROW)) {
      isWalking = true;
      direction = 1;
      charX += speed;
    } else if (keyIsDown(LEFT_ARROW)) {
      isWalking = true;
      direction = -1;
      charX -= speed;
    }
  }

  // --- 3. 根據狀態繪製角色 ---
  push();
  translate(charX, charY);
  if (direction === -1) {
    scale(-1, 1);
  }

  let frameToDraw;

  // 優先處理施法動畫
  if (isCasting) {
    const frameIndex = floor(castFrameCounter);

    castFrameCounter += 0.5; // 控制施法動畫速度
    if (castFrameCounter >= CAST_FRAME_COUNT) {
      isCasting = false;
      castFrameCounter = 0;
      projectiles.push({ x: charX, y: charY, direction: direction });
    }

    // 在施法期間，將要繪製的影格設定為施法動畫
    frameToDraw = animCast[frameIndex];
  // 如果不施法，才判斷其他狀態
  } else if (isJumping) {
    frameToDraw = animAction[frameCount % animAction.length];
  } else if (isWalking) {
    frameToDraw = animWalk[frameCount % animWalk.length];
  } else { // idle
    frameToDraw = animIdle[frameCount % animIdle.length];
  }

  // 如果有需要繪製的影格，才進行繪製
  if (frameToDraw) {
    image(frameToDraw, 0, 0, frameToDraw.width * SCALE_FACTOR, frameToDraw.height * SCALE_FACTOR);
  }

  pop(); // 恢復到之前的繪圖狀態

  // 最後，在所有角色繪圖邏輯結束後，才統一繪製投射物
  drawProjectiles();
}

// 將投射物繪製邏輯提取為一個獨立函數
function drawProjectiles() {
  // --- 4. 更新並繪製所有投射物 ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += projectileSpeed * p.direction;

    push();
    translate(p.x, p.y);
    if (p.direction === -1) {
      scale(-1, 1); // 如果投射物向左，則翻轉
    }
    const projectileFrame = animProjectile[frameCount % animProjectile.length];
    image(projectileFrame, 0, 0, projectileFrame.width * SCALE_FACTOR, projectileFrame.height * SCALE_FACTOR);
    pop();

    // 如果投射物飛出畫面，則從陣列中移除
    if (p.x > width + 100 || p.x < -100) {
      projectiles.splice(i, 1);
    }
  }
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重設地面位置和角色位置
  groundY = height / 2;
  // 如果角色不在跳躍中，將其放回地面
  if (!isJumping) {
    charY = groundY;
  }
}
