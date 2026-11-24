const socket = io();

const menuScreen = document.getElementById('menu-screen');
const roomScreen = document.getElementById('room-screen');
const worldPanel = document.getElementById('world-panel');
const gamePanel = document.getElementById('game-panel');

const inputName = document.getElementById('player-name');
const inputPass = document.getElementById('room-pass');
const modeButtons = document.querySelectorAll('.mode-btn');
const errorMsg = document.getElementById('error-msg');
const btnJoin = document.getElementById('btn-join');

const hudPass = document.getElementById('hud-pass');
const hudMode = document.getElementById('hud-mode');
const hudCount = document.getElementById('hud-count');
const worldTabs = document.getElementById('world-tabs');
const levelGrid = document.getElementById('level-grid');
const emptyWorldMsg = document.getElementById('empty-world-msg');

let selectedMaxPlayers = 2;
let allWorlds = {};
let activeWorldKey = null;
let myId = null;

if (!window.drawPixelCat) {
    window.drawPixelCat = function (ctx, x, y, color, name = '', scale = 1) {
        const p = 3;
        const { fill, border } = color;
        const sprite = [
            'BBB......BBB',
            'BFFBBBBBBFFB',
            'BFFFFFFFFFFB',
            'BFFFFFFFFFFB',
            'BFFFFFFFFFFB',
            'BFFEFFFFEFFB',
            'BFFEFFFFEFFB',
            'BFFFFFFFFFFB',
            'BBBFFFFFFBBB',
            '..BFFFFFFB..',
            '..BWFWWFWB..',
            '..BFFFFFFB..',
            '..BBB..BBB..',
            '............'
        ];

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        for (let row = 0; row < sprite.length; row++) {
            for (let col = 0; col < sprite[row].length; col++) {
                const ch = sprite[row][col];
                if (ch === '.') continue;
                if (ch === 'B') ctx.fillStyle = border;
                else if (ch === 'F') ctx.fillStyle = fill;
                else if (ch === 'E') ctx.fillStyle = '#000000';
                else if (ch === 'W') ctx.fillStyle = '#ffffff';
                ctx.fillRect(col * p, row * p, p, p);
            }
        }
        ctx.restore();

        if (name) {
            ctx.fillStyle = '#111111';
            ctx.font = 'bold 12px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(name, x + (12 * p * scale) / 2, y - 6);
        }
    };
}

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMaxPlayers = Number(btn.dataset.max);
    });
});

btnJoin.addEventListener('click', () => {
    errorMsg.textContent = '';
    socket.emit('joinRoom', {
        playerName: inputName.value,
        roomPass: inputPass.value,
        maxPlayers: selectedMaxPlayers
    });
});

socket.on('joinError', (msg) => {
    errorMsg.textContent = msg;
});

socket.on('joinedSuccess', async ({ roomPass, myId: id }) => {
    myId = id;
    hudPass.textContent = roomPass;
    menuScreen.classList.add('hidden');
    roomScreen.classList.remove('hidden');

    GameEngine.init(document.getElementById('gameCanvas'), socket, myId);
    await loadWorldsFromServer();
});

async function loadWorldsFromServer() {
    const res = await fetch('/api/levels');
    const data = await res.json();

    allWorlds = {};
    for (const wKey in data) {
        if (Object.keys(data[wKey]).length > 0) {
            allWorlds[wKey] = data[wKey];
        }
    }
    renderWorldSelection();
}

function renderWorldSelection() {
    const worldKeys = Object.keys(allWorlds);
    worldTabs.innerHTML = '';
    levelGrid.innerHTML = '';

    if (worldKeys.length === 0) {
        emptyWorldMsg.classList.remove('hidden');
        return;
    }

    emptyWorldMsg.classList.add('hidden');
    if (!activeWorldKey || !allWorlds[activeWorldKey]) {
        activeWorldKey = worldKeys[0];
    }

    worldKeys.forEach(wKey => {
        const btn = document.createElement('button');
        btn.className = 'world-tab' + (wKey === activeWorldKey ? ' active' : '');
        btn.textContent = `WORLD ${wKey}`;
        btn.onclick = () => {
            activeWorldKey = wKey;
            renderWorldSelection();
        };
        worldTabs.appendChild(btn);
    });

    const levels = allWorlds[activeWorldKey];

    if (levels._meta && levels._meta.offlineOnly) {
        const noticeBox = document.createElement('div');
        noticeBox.className = 'empty-msg';
        noticeBox.style.gridColumn = '1 / -1';
        noticeBox.style.fontSize = '26px';
        noticeBox.style.color = '#ff6b2b';
        noticeBox.style.letterSpacing = '2px';
        noticeBox.textContent = levels._meta.message || 'ONLY OFFLINE';
        levelGrid.appendChild(noticeBox);
        return;
    }

    for (const lKey in levels) {
        if (lKey === '_meta') continue;
        const lv = levels[lKey];
        const card = document.createElement('div');
        card.className = 'level-card';
        card.innerHTML = `
            <div>
                <div class="level-num">${activeWorldKey}-${lKey}</div>
                <div class="level-name">${lv.name || `MÀN ${activeWorldKey}-${lKey}`}</div>
            </div>
            <button class="btn-play-small">CHƠI</button>
        `;
        card.querySelector('button').onclick = () => {
            socket.emit('selectLevel', { world: activeWorldKey, level: lKey });
        };
        levelGrid.appendChild(card);
    }
}

socket.on('roomUpdate', (room) => {
    const players = Object.values(room.players);
    hudMode.textContent = `${room.maxPlayers} NGƯỜI`;
    hudCount.textContent = `${players.length}/${room.maxPlayers}`;

    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    players.forEach((p, idx) => {
        window.drawPixelCat(ctx, 30 + idx * 95, 38, p.color, p.name);
    });

    // Cập nhật trực tiếp người chơi vào/ra ngay trong Sảnh chờ chạy nhảy
    if (typeof GameEngine !== 'undefined' && GameEngine.getContext) {
        const env = GameEngine.getContext();
        if (env && env.levelData && env.levelData.isLobby && env.players) {
            for (const id in room.players) {
                if (!env.players[id]) env.players[id] = room.players[id];
            }
            for (const id in env.players) {
                if (!room.players[id]) delete env.players[id];
            }
        }
    }
});

socket.on('levelLoaded', ({ levelData, roomState, players }) => {
    worldPanel.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    GameEngine.start(levelData, roomState, players);
});

socket.on('playerMoved', (data) => GameEngine.updatePlayerPosition(data));
socket.on('keyUpdated', (data) => GameEngine.updateKey(data));
socket.on('elevatorsSync', (elevs) => GameEngine.updateElevators(elevs));
socket.on('blocksSync', (blocks) => GameEngine.updateBlocks(blocks));
socket.on('gatesSync', (data) => GameEngine.updateGates(data));
socket.on('movingPlatformsSync', (movs) => GameEngine.updateMovingPlatforms(movs));
socket.on('crumblingSync', (blocks) => GameEngine.updateCrumblingBlocks(blocks));
socket.on('coinsSync', (data) => GameEngine.updateCoins(data));
socket.on('timerSync', (timeLeft) => GameEngine.updateTimer(timeLeft));
socket.on('timeUp', () => GameEngine.markTimeUp());
socket.on('scrollSync', (scrollX) => GameEngine.updateScroll(scrollX));
socket.on('countdownSync', (cp) => GameEngine.updateCountdown(cp));
socket.on('colorBlocksSync', (blocks) => GameEngine.updateColorBlocks(blocks));
socket.on('ghostSync', (g) => GameEngine.updateGhost(g));
socket.on('trafficLightSync', (tl) => GameEngine.updateTrafficLight(tl));
socket.on('enemiesSync', (enemies) => GameEngine.updateEnemies(enemies));
socket.on('shyGhostSync', (sg) => GameEngine.updateShyGhost(sg));
socket.on('pipeEnemiesSync', (pes) => GameEngine.updatePipeEnemies(pes));
socket.on('moveGaugeSync', (mg) => GameEngine.updateMoveGauge(mg));
socket.on('tetrisSync', (t) => GameEngine.updateTetris(t));
socket.on('breakoutSync', (b) => GameEngine.updateBreakout(b));
socket.on('playerEnteredDoor', (id) => GameEngine.markEnteredDoor(id));
socket.on('levelCleared', () => GameEngine.markCleared());

// Tự động kết nối toàn bộ tín hiệu mới của World 9 - 12 (engine_extra.js)
if (window.GameEngineExtra && window.GameEngineExtra.bindSocket) {
    window.GameEngineExtra.bindSocket(socket, GameEngine);
}

socket.on('noNextLevel', () => {
    GameEngine.stop();
    alert('Chúc mừng! Bạn đã phá đảo hết các màn hiện có. Hãy quay lại chọn màn hoặc thêm màn mới!');
    gamePanel.classList.add('hidden');
    worldPanel.classList.remove('hidden');
});

document.getElementById('btn-show-worlds').addEventListener('click', () => {
    GameEngine.stop();
    gamePanel.classList.add('hidden');
    worldPanel.classList.remove('hidden');
    loadWorldsFromServer();
});

document.getElementById('btn-restart').addEventListener('click', () => {
    socket.emit('restartLevel');
});

document.addEventListener('click', (e) => {
    if (e.target && e.target.tagName === 'BUTTON') {
        e.target.blur();
    }
});