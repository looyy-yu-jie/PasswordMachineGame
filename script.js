const colors = ['red', 'green', 'orange', 'blue', 'yellow', 'purple', 'cyan'];
let secretCode = [];
let currentRow = 0;
const maxRows = 7;
const codeLength = 4;

function generateSecretCode() {
    const availableColors = [...colors];
    secretCode = []; // 重置密码数组
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        secretCode.push(availableColors[randomIndex]);
        availableColors.splice(randomIndex, 1);
    }
    console.log("生成的密码是：", secretCode); // 调试信息改为中文
}

function createGrid() {
    const gameDiv = document.getElementById('game');
    for (let row = 0; row < maxRows; row++) {
        // 创建行容器
        const rowContainer = document.createElement('div');
        rowContainer.classList.add('row');

        // 创建右侧 2x2 反馈指示灯
        const feedbackDiv = document.createElement('div');
        feedbackDiv.classList.add('feedback');
        feedbackDiv.dataset.row = row;
        for (let i = 0; i < codeLength; i++) {
            const indicatorDiv = document.createElement('div');
            indicatorDiv.classList.add('indicator');
            feedbackDiv.appendChild(indicatorDiv);
        }

        // 创建右侧 cell 网格
        const gridDiv = document.createElement('div');
        gridDiv.classList.add('grid');
        gridDiv.dataset.row = row;
        for (let col = 0; col < codeLength; col++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.dataset.col = col;
            cellDiv.addEventListener('click', () => selectColor(row, col));
            gridDiv.appendChild(cellDiv);
        }

        rowContainer.appendChild(feedbackDiv);
        rowContainer.appendChild(gridDiv);
        gameDiv.appendChild(rowContainer);
    }
}

function createColorControls() {
    const controlsDiv = document.getElementById('controls');
    controlsDiv.style.cursor = 'inherit';
    controlsDiv.innerHTML = '';

    // 创建颜色选择按钮容器，改为纵向排列
    const colorContainer = document.createElement('div');
    colorContainer.style.display = 'flex';
    colorContainer.style.flexDirection = 'column';  // 纵向排列
    colorContainer.style.gap = '30px';              // 增大间隔
    colorContainer.style.justifyContent = 'center';
    colorContainer.style.width = '100%';

    colors.forEach((color, index) => {
        const button = document.createElement('button');
        button.classList.add('color-button');
        button.style.backgroundColor = color;
        button.dataset.color = color;
        button.style.position = 'relative';
        button.setAttribute('draggable', 'false');  // 禁用拖拽
        button.style.webkitUserDrag = 'none';

        // 添加数字标签
        const label = document.createElement('span');
        label.textContent = index + 1;
        label.style.position = 'absolute';
        label.style.top = '50%';
        label.style.left = '50%';
        label.style.transform = 'translate(-50%, -50%)';
        label.style.color = '#fff';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        button.appendChild(label);

        button.addEventListener('click', () => setColor(color));
        colorContainer.appendChild(button);
    });
    controlsDiv.appendChild(colorContainer);
}

let selectedColor = null;

function setColor(color) {
    selectedColor = color;
    // 创建一个 canvas 用于生成游标图片（32×32 像素）
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 32, 32);
    // 将生成的图片转换为 data URL，并设置为游标，同时指定热点坐标（16,16）
    document.body.style.cursor = `url(${canvas.toDataURL("image/png")}) 16 16, auto`;
}

function selectColor(row, col) {
    if (row === currentRow && selectedColor) {
        // 检查当前行内是否已存在此颜色
        const currentRowCells = document.querySelectorAll(`.grid[data-row="${row}"] .cell`);
        for (const cell of currentRowCells) {
            if (cell.dataset.color === selectedColor) {
                customAlert("颜色不能重复");
                return;
            }
        }
        const cell = document.querySelector(`.grid[data-row="${row}"] .cell[data-col="${col}"]`);
        cell.style.backgroundColor = selectedColor;
        cell.dataset.color = selectedColor;
        // 放下后重置鼠标游标为默认
        document.body.style.cursor = "default";
    }
}

function submitGuess() {
    if (currentRow >= maxRows) return;

    const rowDiv = document.querySelector(`.grid[data-row="${currentRow}"]`);
    const cells = rowDiv.querySelectorAll('.cell');
    const guess = [];

    for (const cell of cells) {
        if (!cell.dataset.color) {
            customAlert("请填写完本行所有颜色！");
            return;
        }
        guess.push(cell.dataset.color);
    }

    let correctPositions = 0;
    let correctColors = 0;
    const secretCodeCopy = [...secretCode];
    const guessCopy = [...guess];

    // 检查位置正确的颜色
    for (let i = 0; i < codeLength; i++) {
        if (guessCopy[i] === secretCodeCopy[i]) {
            correctPositions++;
            guessCopy[i] = null;
            secretCodeCopy[i] = null;
        }
    }

    // 检查颜色正确但位置错误的情况
    for (let i = 0; i < codeLength; i++) {
        if (guessCopy[i]) {
            const index = secretCodeCopy.indexOf(guessCopy[i]);
            if (index > -1) {
                correctColors++;
                secretCodeCopy[index] = null;
            }
        }
    }

    updateFeedback(currentRow, correctPositions, correctColors);

    if (correctPositions === codeLength) {
        customAlert("恭喜你破解了密码！密码是：" + secretCode.map(c => colorNames[c]).join("、"));
        return;
    }

    currentRow++;

    if (currentRow >= maxRows) {
        customAlert("你的机会用完了，密码是：" + secretCode.map(c => colorNames[c]).join("、"));
    }
}

function updateFeedback(row, correctPositions, correctColors) {
    const feedbackDiv = document.querySelector(`.feedback[data-row="${row}"]`);
    if (!feedbackDiv) return;
    const indicators = feedbackDiv.querySelectorAll('.indicator');

    // 重置所有指示灯为默认颜色
    indicators.forEach(indicator => indicator.style.backgroundColor = '#eee');

    // 先显示位置和颜色都正确的数量（绿色指示灯）
    for (let i = 0; i < correctPositions; i++) {
        indicators[i].style.backgroundColor = 'green';
    }
    
    // 显示其他剩余的为红色指示灯
    for (let i = correctPositions; i < codeLength; i++) {
        indicators[i].style.backgroundColor = 'red';
    }
}

function restartGame() {
    // 重置全局状态
    currentRow = 0;
    secretCode = [];
    selectedColor = null;
    document.getElementById('result').textContent = ""; // 清空结果展示
    // 清空游戏区域内容
    const gameDiv = document.getElementById('game');
    gameDiv.innerHTML = '';
    // 重新生成密码和网格
    generateSecretCode();
    createGrid();
}

generateSecretCode();
createGrid();
createColorControls();
createActionButtons();

// 添加规则内容折叠控制
document.getElementById('toggleRules').addEventListener('click', function () {
    const content = document.getElementById('rules-content');
    if (content.style.display === 'none') {
        content.style.display = 'block';
        this.textContent = '[隐藏]';
    } else {
        content.style.display = 'none';
        this.textContent = '[显示]';
    }
});
const colorNames = {
    red: "红色",
    green: "绿色",
    orange: "橙色",
    blue: "蓝色",
    yellow: "黄色",
    purple: "紫色",
    cyan: "青色"
};
// ...其他代码...
document.addEventListener('click', function (e) {
    // 如果点击的目标不在 .color-button 或 .cell 内，则取消选择
    if (!e.target.closest('.color-button') && !e.target.closest('.cell')) {
        selectedColor = null;
        document.body.style.cursor = 'default';
    }
});

// 自定义确认弹窗方法
function customConfirm(message, onConfirm) {
    const overlay = document.getElementById('customConfirmOverlay');
    const msg = document.getElementById('customConfirmMessage');
    msg.textContent = message;
    overlay.style.display = 'flex';

    document.getElementById('customConfirmOk').onclick = function () {
        overlay.style.display = 'none';
        onConfirm();
    }
    document.getElementById('customConfirmCancel').onclick = function () {
        overlay.style.display = 'none';
    }
}

function createActionButtons() {
    const actionsDiv = document.getElementById('actions');
    actionsDiv.innerHTML = '';

    // 创建操作按钮容器（水平排列，重开在左，提交在右）
    const actionContainer = document.createElement('div');
    actionContainer.style.display = 'flex';
    actionContainer.style.flexDirection = 'row';
    actionContainer.style.justifyContent = 'space-between';
    actionContainer.style.alignItems = 'center';
    actionContainer.style.width = '100%';
    actionContainer.style.gap = '10px';

    const restartButton = document.createElement('button');
    restartButton.textContent = '重开';
    restartButton.classList.add('action-button');
    restartButton.addEventListener('click', () => {
        customConfirm("确定要重新开始游戏吗？", restartGame);
    });
    actionContainer.appendChild(restartButton);

    const submitButton = document.createElement('button');
    submitButton.textContent = '提交';
    submitButton.classList.add('action-button');
    submitButton.addEventListener('click', submitGuess);
    actionContainer.appendChild(submitButton);

    actionsDiv.appendChild(actionContainer);
}
function customAlert(message) {
    const overlay = document.getElementById("customAlertOverlay");
    const msg = document.getElementById("customAlertMessage");
    msg.textContent = message;
    overlay.style.display = "flex";
    document.getElementById("customAlertOk").onclick = function () {
        overlay.style.display = "none";
    };
}

