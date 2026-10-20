// 宣告全域變數：題目庫、選項陣列、目標區陣列、分數、交卷狀態與彩帶粒子陣列
let questions = []; // 存放 6 個題目物件的陣列
let draggableOptions = []; // 存放下方 6 個可拖曳選項物件的陣列
let dropZones = []; // 存放 6 個題目對應的目標放置區陣列
let confettis = []; // 存放全螢幕慶祝彩帶粒子的陣列
let score = 0; // 紀錄最終答對題數與得分
let isSubmitted = false; // 紀錄是否已經完成交卷
let submitButton; // 交卷按鈕 DOM 物件
let retryButton; // 重新測驗按鈕 DOM 物件

// 初始化題目資料庫 (6 道國小基礎數學題目)
function initQuestionsData() { // initQuestionsData 開始
  questions = [ // 建立 6 道題目資料
    { id: 0, title: "1. 3 + 2 = ?", answer: "5", type: "apples", count1: 3, count2: 2 }, // 第 1 題
    { id: 1, title: "2. 8 - 3 = ?", answer: "5", type: "birds", count1: 8, count2: 3 }, // 第 2 題
    { id: 2, title: "3. 4 + 4 = ?", answer: "8", type: "flowers", count1: 4, count2: 4 }, // 第 3 題
    { id: 3, title: "4. 6 + 3 = ?", answer: "9", type: "stars", count1: 6, count2: 3 }, // 第 4 題
    { id: 4, title: "5. 7 - 5 = ?", answer: "2", type: "balloons", count1: 7, count2: 5 }, // 第 5 題
    { id: 5, title: "6. 5 + 5 = ?", answer: "10", type: "candies", count1: 5, count2: 5 } // 第 6 題
  ]; // 題目資料陣列結束
} // initQuestionsData 結束

// p5.js setup 初始化設定函式
function setup() { // setup 開始
  createCanvas(windowWidth, windowHeight); // 建立全螢幕畫布
  rectMode(CENTER); // 設定矩形繪製中心點對齊
  textAlign(CENTER, CENTER); // 設定文字對齊居中
  initQuestionsData(); // 初始化題目資料
  initUIAndLayout(); // 初始化題目板塊與拖曳選項佈局
  createControls(); // 初始化交卷與重來按鈕
} // setup 結束

// 視窗尺寸改變時觸發響應式重新佈局
function windowResized() { // windowResized 開始
  resizeCanvas(windowWidth, windowHeight); // 調整畫布尺寸為當前視窗大小
  repositionLayout(); // 重新計算與定位所有題目區與拖曳選項位置
} // windowResized 結束

// 初始化控制按鈕（交卷按鈕與重來按鈕）
function createControls() { // createControls 開始
  submitButton = createButton("交卷看成績"); // 建立交卷按鈕
  submitButton.style("font-size", "18px"); // 設定字體大小
  submitButton.style("font-weight", "bold"); // 設定粗體
  submitButton.style("background-color", "#4CAF50"); // 設定綠色背景
  submitButton.style("color", "white"); // 設定白色文字
  submitButton.style("border", "none"); // 移除邊框
  submitButton.style("border-radius", "10px"); // 設定圓角
  submitButton.style("padding", "10px 20px"); // 設定按鈕內距
  submitButton.style("cursor", "pointer"); // 滑鼠懸停顯示手型
  submitButton.mousePressed(handleSubmit); // 註冊點擊處理事件

  retryButton = createButton("重新測驗"); // 建立重新測驗按鈕
  retryButton.style("font-size", "18px"); // 設定字體大小
  retryButton.style("font-weight", "bold"); // 設定粗體
  retryButton.style("background-color", "#2196F3"); // 設定藍色背景
  retryButton.style("color", "white"); // 設定白色文字
  retryButton.style("border", "none"); // 移除邊框
  retryButton.style("border-radius", "10px"); // 設定圓角
  retryButton.style("padding", "10px 20px"); // 設定按鈕內距
  retryButton.style("cursor", "pointer"); // 滑鼠懸停顯示手型
  retryButton.mousePressed(resetQuiz); // 註冊重置處理事件
  retryButton.hide(); // 預設隱藏重來按鈕

  repositionButtons(); // 定位按鈕位置
} // createControls 結束

// 按鈕定位計算
function repositionButtons() { // repositionButtons 開始
  if (submitButton) submitButton.position(width / 2 - 60, height - 55); // 置中定位於底部
  if (retryButton) retryButton.position(width / 2 - 50, height - 55); // 置中定位於底部
} // repositionButtons 結束

// 計算與建立 6 題格狀版面與 6 個可拖曳選項
function initUIAndLayout() { // initUIAndLayout 開始
  dropZones = []; // 清空目標放置區
  draggableOptions = []; // 清空可拖曳選項

  // 1. 計算 6 題目的網格佈局 (寬度大於 800 時採 3x2，小螢幕採 2x3)
  let cols = width > 800 ? 3 : 2; // 計算網格列數
  let rows = Math.ceil(questions.length / cols); // 計算網格行數
  let gridW = (width - 60) / cols; // 單一題目卡片寬度
  let gridH = (height * 0.65) / rows; // 單一題目卡片高度

  for (let i = 0; i < questions.length; i++) { // 走訪 6 個題目
    let c = i % cols; // 當前列索引
    let r = Math.floor(i / cols); // 當前行索引
    let x = 30 + c * gridW + gridW / 2; // 卡片中心 X 座標
    let y = 70 + r * gridH + gridH / 2; // 卡片中心 Y 座標

    dropZones.push({ // 新增目標放置區
      questionId: i, // 對應題目編號
      x: x, // 位置 X
      y: y + gridH * 0.22, // 放置區定位於卡片偏下方
      w: Math.min(100, gridW * 0.4), // 放置區寬度
      h: 40, // 放置區高度
      cardX: x, // 卡片中心 X
      cardY: y, // 卡片中心 Y
      cardW: gridW - 15, // 卡片整體寬度
      cardH: gridH - 10, // 卡片整體高度
      occupiedOption: null // 目前放置的選項（初始為空）
    }); // 目標區新增結束
  } // 迴圈結束

  // 2. 建立 6 個可拖曳選項（汲取正確答案並進行隨機打亂）
  let optionValues = questions.map(q => q.answer); // 收集 6 個題目的答案
  let shuffledValues = shuffleArray([...optionValues]); // 隨機打亂答案順序

  let optW = Math.min(110, (width - 40) / 6 - 10); // 計算每個選項區塊寬度
  let startX = width / 2 - (6 * (optW + 10)) / 2 + optW / 2; // 設定選項區起始 X 座標
  let optY = height - 100; // 設定選項區 Y 座標（底部上方）

  for (let i = 0; i < 6; i++) { // 迴圈建立 6 個選項
    let ox = startX + i * (optW + 10); // 計算當前選項初始 X
    draggableOptions.push(new DraggableOption(ox, optY, optW, 45, shuffledValues[i], i)); // 建立選項物件
  } // 迴圈結束
} // initUIAndLayout 結束

// 重新佈局（響應式調整）
function repositionLayout() { // repositionLayout 開始
  initUIAndLayout(); // 重新建立卡片與選項的位置計算
  repositionButtons(); // 重新計算按鈕位置
} // repositionLayout 結束

// 陣列隨機洗牌函式
function shuffleArray(arr) { // shuffleArray 開始
  for (let i = arr.length - 1; i > 0; i--) { // 倒序走訪陣列
    let j = Math.floor(random(i + 1)); // 隨機產生交換索引
    [arr[i], arr[j]] = [arr[j], arr[i]]; // 交換陣列元素
  } // 迴圈結束
  return arr; // 回傳洗牌後的陣列
} // shuffleArray 結束

// p5.js 主繪圖循環函式
function draw() { // draw 開始
  background(240, 244, 248); // 設定舒適的淡灰藍色背景

  drawTitleHeader(); // 繪製頁面上方總標題與說明
  drawQuestionCards(); // 繪製 6 個題目卡片與 GIF 動態效果
  drawDropZones(); // 繪製 6 個題目答題放置框

  // 更新並繪製所有 6 個拖曳選項
  for (let opt of draggableOptions) { // 走訪所有選項
    opt.update(); // 更新拖曳座標
    opt.display(); // 繪製選項卡片
  } // 迴圈結束

  // 若已交卷則繪製成績結算與彩帶特效
  if (isSubmitted) { // 判斷交卷狀態
    drawResultOverlay(); // 繪製成績統計彈窗
    let percentage = (score / questions.length) * 100; // 計算得分百分比
    if (percentage > 60) { // 高於 60% 得分
      updateAndDrawConfetti(); // 繪製繽紛彩帶動畫
    } // if 結束
  } // isSubmitted if 結束
} // draw 結束

// 繪製頁面頂部標題
function drawTitleHeader() { // drawTitleHeader 開始
  fill(30, 40, 60); // 標題顏色深藍色
  textSize(24); // 設定標題字體大小
  textStyle(BOLD); // 粗體字型
  text("國小數學趣味測驗 (請將下方 6 個答案拖至對應題目框)", width / 2, 30); // 繪製標題文字
} // drawTitleHeader 結束

// 繪製 6 個題目卡片與繪製內部 GIF 動畫
function drawQuestionCards() { // drawQuestionCards 開始
  for (let i = 0; i < dropZones.length; i++) { // 走訪 6 個題目板塊
    let zone = dropZones[i]; // 取得對應板塊資料
    let q = questions[i]; // 取得題目資料

    // 繪製卡片白色背景與圓角邊框
    fill(255); // 白色背景
    stroke(210); // 淺灰邊框
    strokeWeight(2); // 邊框厚度
    rect(zone.cardX, zone.cardY, zone.cardW, zone.cardH, 12); // 繪製題目面板

    // 繪製題目文字標題
    fill(50); // 文字灰色
    noStroke(); // 無邊框
    textSize(16); // 字體大小
    textStyle(BOLD); // 粗體
    text(q.title, zone.cardX, zone.cardY - zone.cardH * 0.35); // 繪製題目題目名稱

    // 繪製動態視覺 GIF 效果區塊
    drawAnimatedGraphic(q, zone.cardX, zone.cardY - zone.cardH * 0.05); // 呼叫動態畫圖函式
  } // 迴圈結束
} // drawQuestionCards 結束

// 繪製各題目的模擬 GIF 動態視覺插圖
function drawAnimatedGraphic(q, cx, cy) { // drawAnimatedGraphic 開始
  push(); // 儲存繪圖狀態
  translate(cx, cy); // 將原點位移至插圖中心
  let t = millis() * 0.003; // 計算時間參數創造平滑動畫

  if (q.type === "apples") { // 第一題：蘋果彈跳動畫
    for (let i = 0; i < q.count1; i++) drawApple(-40 + i * 18, sin(t + i) * 4); // 第一組蘋果
    textSize(14); fill(100); text("+", 10, 0); // 加號
    for (let i = 0; i < q.count2; i++) drawApple(25 + i * 18, cos(t + i) * 4); // 第二組蘋果
  } else if (q.type === "birds") { // 第二題：小鳥翅膀拍打動畫
    for (let i = 0; i < q.count1; i++) drawBird(-60 + i * 16, sin(t * 3 + i) * 5); // 小鳥拍翅動畫
  } else if (q.type === "flowers") { // 第三題：花朵微風擺動動畫
    for (let i = 0; i < q.count1 + q.count2; i++) drawFlower(-60 + i * 16, 0, sin(t + i) * 0.2); // 花朵搖曳
  } else if (q.type === "stars") { // 第四題：星星閃爍動畫
    for (let i = 0; i < q.count1 + q.count2; i++) drawStar(-60 + i * 15, 0, 8, 4, sin(t * 2 + i) * 2 + 6); // 星星閃爍
  } else if (q.type === "balloons") { // 第五題：氣球上下浮動動畫
    for (let i = 0; i < q.count1; i++) drawBalloon(-50 + i * 16, cos(t + i) * 6); // 氣球浮動
  } else if (q.type === "candies") { // 第六題：糖果旋轉動畫
    for (let i = 0; i < q.count1 + q.count2; i++) drawCandy(-60 + i * 14, sin(t * 2 + i) * 3); // 糖果動態
  } // if-else 結束
  pop(); // 還原狀態
} // drawAnimatedGraphic 結束

// 輔助動態繪製函式：蘋果
function drawApple(x, yOff) { // drawApple 開始
  push(); translate(x, yOff); noStroke(); fill(230, 70, 70); ellipse(0, 0, 14, 14); fill(100, 180, 60); ellipse(2, -7, 6, 4); pop();
} // drawApple 結束

// 輔助動態繪製函式：小鳥
function drawBird(x, wingY) { // drawBird 開始
  push(); translate(x, 0); noStroke(); fill(70, 160, 240); ellipse(0, 0, 12, 10); fill(255, 180, 0); triangle(6, -2, 10, 0, 6, 2); fill(40, 130, 220); triangle(-2, 0, -8, -wingY, 0, 2); pop();
} // drawBird 結束

// 輔助動態繪製函式：花朵
function drawFlower(x, y, rot) { // drawFlower 開始
  push(); translate(x, y); rotate(rot); noStroke(); fill(255, 110, 130); for (let a = 0; a < TWO_PI; a += PI / 2.5) ellipse(cos(a) * 5, sin(a) * 5, 6, 6); fill(255, 210, 80); ellipse(0, 0, 6, 6); pop();
} // drawFlower 結束

// 輔助動態繪製函式：星星
function drawStar(x, y, radius1, radius2, npoints) { // drawStar 開始
  push(); translate(x, y); fill(255, 200, 0); noStroke(); let angle = TWO_PI / npoints; let halfAngle = angle / 2.0; beginShape(); for (let a = 0; a < TWO_PI; a += angle) { let sx = cos(a) * radius2; let sy = sin(a) * radius2; vertex(sx, sy); sx = cos(a + halfAngle) * radius1; sy = sin(a + halfAngle) * radius1; vertex(sx, sy); } endShape(CLOSE); pop();
} // drawStar 結束

// 輔助動態繪製函式：氣球
function drawBalloon(x, yOff) { // drawBalloon 開始
  push(); translate(x, yOff); noStroke(); fill(180, 100, 230); ellipse(0, -4, 12, 15); stroke(150); strokeWeight(1); line(0, 3.5, 0, 10); pop();
} // drawBalloon 結束

// 輔助動態繪製函式：糖果
function drawCandy(x, yOff) { // drawCandy 開始
  push(); translate(x, yOff); noStroke(); fill(255, 130, 170); ellipse(0, 0, 10, 10); triangle(-5, 0, -9, -4, -9, 4); triangle(5, 0, 9, -4, 9, 4); pop();
} // drawCandy 結束

// 繪製 6 個題目的答題放置區域
function drawDropZones() { // drawDropZones 開始
  for (let zone of dropZones) { // 走訪 6 個放置區
    stroke(160); // 虛線框顏色
    strokeWeight(2); // 框線厚度
    fill(zone.occupiedOption ? 240 : 250); // 若被放置答案填滿淺色背景
    rect(zone.x, zone.y, zone.w, zone.h, 8); // 繪製答題框矩形

    if (!zone.occupiedOption) { // 若目前尚無放置答案
      noStroke(); // 隱藏邊框
      fill(160); // 灰色提示字
      textSize(12); // 小字體
      text("放入答案", zone.x, zone.y); // 繪製導引提示文字
    } // if 結束
  } // 迴圈結束
} // drawDropZones 結束

// 繪製最終結算成績對話框
function drawResultOverlay() { // drawResultOverlay 開始
  push(); // 儲存狀態
  fill(0, 0, 0, 140); // 半透明黑背景遮罩
  rect(width / 2, height / 2, width, height); // 覆蓋全螢幕

  fill(255); // 結算面板白色卡片
  stroke(0, 0, 0, 30); // 卡片陰影
  rect(width / 2, height / 2 - 20, 360, 200, 16); // 繪製面板卡片

  let totalPercent = Math.round((score / questions.length) * 100); // 計算得分百分比
  fill(40); // 標題顏色
  textSize(22); // 標題字體大小
  text("測驗結果結算", width / 2, height / 2 - 80); // 標題文字

  textSize(32); // 大號得分數字
  if (totalPercent >= 60) { // 當得分大於等於 60% (答對 4 題以上)
    fill(76, 175, 80); // 綠色合格字體
    text("得分: " + totalPercent + " 分 (通過！)", width / 2, height / 2 - 25); // 讚美訊息
  } else { // 低於 60%
    fill(244, 67, 54); // 紅色未通過字體
    text("得分: " + totalPercent + " 分 (加油！)", width / 2, height / 2 - 25); // 加油訊息
  } // if-else 結束

  textSize(16); fill(100); // 細節資訊顏色
  text("您答對了 " + score + " / 6 道題目", width / 2, height / 2 + 25); // 答對題數顯示
  pop(); // 還原狀態
} // drawResultOverlay 結束

// 可拖曳選項類別 (Class)
class DraggableOption { // 類別開始
  constructor(x, y, w, h, textVal, id) { // 建構子
    this.startX = x; // 紀錄原始 X 座標
    this.startY = y; // 紀錄原始 Y 座標
    this.x = x; // 當前 X 座標
    this.y = y; // 當前 Y 座標
    this.w = w; // 寬度
    this.h = h; // 高度
    this.textVal = textVal; // 文字數值 (答案)
    this.id = id; // 選項識別碼
    this.isDragging = false; // 拖曳中狀態標籤
  } // 建構子結束

  update() { // 位置跟隨更新
    if (this.isDragging && !isSubmitted) { // 當正在拖曳且未交卷時
      this.x = mouseX; // 當前 X 跟隨滑鼠
      this.y = mouseY; // 當前 Y 跟隨滑鼠
    } // if 結束
  } // update 結束

  display() { // 繪製卡片方法
    push(); translate(this.x, this.y); // 平移原點
    if (this.isDragging) { // 拖曳狀態樣式
      fill(255, 235, 59); stroke(255, 152, 0); strokeWeight(3); // 黃底橘框高亮
    } else { // 靜態樣式
      fill(255); stroke(180); strokeWeight(2); // 白底灰框
    } // if-else 結束
    rect(0, 0, this.w, this.h, 10); // 繪製選項圓角卡片
    fill(40); noStroke(); textSize(18); textStyle(BOLD); text(this.textVal, 0, 0); // 繪製答案數字
    pop(); // 還原狀態
  } // display 結束

  contains(px, py) { // 判斷點 (px, py) 是否在卡片範圍內
    return px > this.x - this.w / 2 && px < this.x + this.w / 2 &&
           py > this.y - this.h / 2 && py < this.y + this.h / 2;
  } // contains 結束
} // DraggableOption 類別結束

// 滑鼠按下 (mousePressed) 拖曳觸發 logic
function mousePressed() { // mousePressed 開始
  if (isSubmitted) return; // 若已經交卷則忽略操作

  for (let opt of draggableOptions) { // 走訪 6 個選項
    if (opt.contains(mouseX, mouseY)) { // 若點擊於該選項上
      opt.isDragging = true; // 開啟拖曳狀態
      
      // 若該選項原本已放置在某放置區，解除該放置區佔用狀態
      for (let zone of dropZones) { // 走訪放置區
        if (zone.occupiedOption === opt) { // 匹配已被佔用放置區
          zone.occupiedOption = null; // 清空放置狀態
        } // if 結束
      } // 迴圈結束
      break; // 停止尋找
    } // if 結束
  } // 迴圈結束
} // mousePressed 結束

// 滑鼠放開 (mouseReleased) 吸附或彈回 logic
function mouseReleased() { // mouseReleased 開始
  if (isSubmitted) return; // 若已交卷則忽略

  for (let opt of draggableOptions) { // 走訪選項
    if (opt.isDragging) { // 找出被釋放的拖曳選項
      opt.isDragging = false; // 關閉拖曳狀態
      let isPlaced = false; // 紀錄是否成功吸附進任何題目放置區

      for (let zone of dropZones) { // 走訪 6 個放置區
        if (mouseX > zone.x - zone.w / 2 && mouseX < zone.x + zone.w / 2 && // 水平範圍匹配
            mouseY > zone.y - zone.h / 2 && mouseY < zone.y + zone.h / 2) { // 垂直範圍匹配
          
          if (zone.occupiedOption && zone.occupiedOption !== opt) { // 若該放置區已有其他答案
            zone.occupiedOption.x = zone.occupiedOption.startX; // 讓舊答案彈回底部原位
            zone.occupiedOption.y = zone.occupiedOption.startY; // 讓舊答案彈回底部原位
          } // if 結束

          opt.x = zone.x; // 選項吸附至該放置區中心 X
          opt.y = zone.y; // 選項吸附至該放置區中心 Y
          zone.occupiedOption = opt; // 更新目標區佔用者為當前選項
          isPlaced = true; // 標記吸附成功
          break; // 離開放置區迴圈
        } // if 結束
      } // 迴圈結束

      if (!isPlaced) { // 若沒有落入任何答題放置框
        opt.x = opt.startX; // 彈回下方原始位置 X
        opt.y = opt.startY; // 彈回下方原始位置 Y
      } // if 結束
    } // if 結束
  } // 迴圈結束
} // mouseReleased 結束

// 交卷按鈕點擊處理與完成判斷
function handleSubmit() { // handleSubmit 開始
  if (isSubmitted) return; // 避免重複交卷

  // 1. 檢查 6 個題目的放置區是否全部完成填寫
  let filledCount = 0; // 計算已填寫數量
  for (let zone of dropZones) { // 走訪所有放置區
    if (zone.occupiedOption !== null) filledCount++; // 若有填入答案累加 1
  } // 迴圈結束

  if (filledCount < 6) { // 若未滿 6 題
    alert("請完成所有 6 個題目的答案拖放後再交卷喔！(目前已完成 " + filledCount + "/6 題)"); // 提醒視窗
    return; // 終止流程
  } // if 結束

  // 2. 開始計算 6 題得分
  score = 0; // 重置分數
  for (let i = 0; i < dropZones.length; i++) { // 走訪 6 個題目對應放置區
    let zone = dropZones[i]; // 取得放置區
    let q = questions[i]; // 取得對應題目
    if (zone.occupiedOption && zone.occupiedOption.textVal === q.answer) { // 判斷答案是否正確
      score++; // 正確則分數加 1
    } // if 結束
  } // 迴圈結束

  isSubmitted = true; // 設定狀態為已交卷
  submitButton.hide(); // 隱藏交卷按鈕
  retryButton.show(); // 顯示重新測驗按鈕

  // 3. 計算得分率，若 > 60% (答對 4 題以上) 觸發彩帶動畫
  if ((score / questions.length) * 100 > 60) { // 判斷得分是否高於 60%
    createConfettiParticles(); // 產生慶祝彩帶
  } // if 結束
} // handleSubmit 結束

// 重置測驗狀態
function resetQuiz() { // resetQuiz 開始
  isSubmitted = false; // 重置交卷狀態
  score = 0; // 重置分數
  confettis = []; // 清空彩帶
  retryButton.hide(); // 隱藏重新測驗按鈕
  submitButton.show(); // 顯示交卷按鈕
  initUIAndLayout(); // 重新計算與隨機洗牌選項
} // resetQuiz 結束

// 產生彩帶粒子
function createConfettiParticles() { // createConfettiParticles 開始
  confettis = []; // 清空現有粒子
  for (let i = 0; i < 150; i++) { // 產生 150 個繽紛彩帶粒子
    confettis.push({ // 新增粒子物件
      x: random(width), // 隨機 X
      y: random(-height, 0), // 螢幕上方隨機 Y
      size: random(6, 12), // 隨機尺寸
      color: color(random(255), random(255), random(255)), // 隨機繽紛色彩
      speedY: random(2, 6), // 隨機下落速度
      speedX: random(-2, 2), // 隨機飄移速度
      rotation: random(TWO_PI), // 隨機角度
      rotSpeed: random(-0.1, 0.1) // 隨機旋轉角速度
    }); // 物件新增結束
  } // 迴圈結束
} // createConfettiParticles 結束

// 更新並繪製全螢幕瀑布彩帶特效
function updateAndDrawConfetti() { // updateAndDrawConfetti 開始
  push(); // 儲存狀態
  for (let c of confettis) { // 走訪彩帶粒子
    c.y += c.speedY; // 下降運動
    c.x += c.speedX; // 左右搖擺
    c.rotation += c.rotSpeed; // 旋轉角度

    if (c.y > height) { // 出螢幕底端重置回頂端
      c.y = -10; // 重置至頂部
      c.x = random(width); // 隨機水平位置
    } // if 結束

    translate(c.x, c.y); // 平移原點
    rotate(c.rotation); // 旋轉
    fill(c.color); // 填色
    noStroke(); // 無邊框
    rect(0, 0, c.size, c.size * 1.5); // 繪製長方形彩帶紙片
    rotate(-c.rotation); // 還原旋轉
    translate(-c.x, -c.y); // 還原平移
  } // 迴圈結束
  pop(); // 還原狀態
} // updateAndDrawConfetti 結束