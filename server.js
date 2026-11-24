const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { loadAllWorlds } = require('./levels/levelLoader');
const serverExtra = require('./server_extra');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/levels', (req, res) => {
    res.json(loadAllWorlds());
});

const rooms = {};

const LOBBY_LEVEL = {
    id: 'LOBBY',
    name: 'PHÒNG CHỜ',
    isLobby: true,
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 140, y: 390 },
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },
        { x: 870, y: 0, w: 30, h: 500 },
        { x: 30, y: 0, w: 840, h: 28 },
        { x: 30, y: 440, w: 840, h: 60 },
        { x: 180, y: 345, w: 120, h: 22 },
        { x: 600, y: 345, w: 120, h: 22 },
        { x: 380, y: 260, w: 140, h: 22 }
    ]
};

function createLobbyState() {
    return {
        keyHolder: null, keyVisible: false, doorUnlocked: false, cleared: false,
        timeLeft: null, timeUp: false, scrollX: 0,
        elevators: [], pushBlocks: [], buttons: [], gates: [],
        movingPlatforms: [], crumblingBlocks: [], coins: [],
        colorBlocks: [], enemies: [], pipeEnemies: []
    };
}

const CAT_COLORS = [
    { fill: '#ff8a80', border: '#ff5252' },
    { fill: '#82ccdd', border: '#1e90ff' },
    { fill: '#99ff99', border: '#00d230' },
    { fill: '#fff59d', border: '#d4c300' },
    { fill: '#ffb3ff', border: '#e066ff' },
    { fill: '#ffbe76', border: '#ff793f' },
    { fill: '#d29bff', border: '#9c51ff' },
    { fill: '#dcdde1', border: '#8c929c' }
];

const TETROMINOES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]]
];

function rotateMatrix(mat) {
    const rows = mat.length;
    const cols = mat[0].length;
    const res = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            res[c][rows - 1 - r] = mat[r][c];
        }
    }
    return res;
}

function canPlaceTetrisGrid(t, shape, px, py) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;
            const gx = px + c;
            const gy = py + r;
            if (gx < 0 || gx >= t.cols || gy >= t.rows) return false;
            if (gy >= 0 && t.grid[gy][gx]) return false;
        }
    }
    return true;
}

function overlapsOtherTetrisPiece(t, shape, px, py, ignoreId) {
    for (const pid in t.pieces) {
        if (pid === ignoreId) continue;
        const other = t.pieces[pid];
        if (!other) continue;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const gx = px + c;
                const gy = py + r;
                const or = gy - other.y;
                const oc = gx - other.x;
                if (or >= 0 && or < other.shape.length && oc >= 0 && oc < other.shape[0].length && other.shape[or][oc]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function spawnTetrisPiece(t, playerId, slotIdx, color) {
    const base = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    const shape = base.map(row => [...row]);
    const chuteW = t.cols / t.slotCount;
    const startX = Math.max(0, Math.min(t.cols - shape[0].length, Math.floor(slotIdx * chuteW + (chuteW - shape[0].length) / 2)));
    const piece = {
        id: playerId,
        slotIdx,
        shape,
        x: startX,
        y: 0,
        color
    };
    if (!canPlaceTetrisGrid(t, shape, startX, 0)) {
        return null;
    }
    t.pieces[playerId] = piece;
    return piece;
}

function serializeTetris(t) {
    return {
        enabled: t.enabled,
        cols: t.cols,
        rows: t.rows,
        slotCount: t.slotCount,
        linesLeft: t.linesLeft,
        status: t.status,
        grid: t.grid,
        pieces: t.pieces
    };
}

function lockTetrisPiece(room, pass, playerId) {
    const t = room.state.tetris;
    const piece = t.pieces[playerId];
    if (!piece) return;

    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (!piece.shape[r][c]) continue;
            const gx = piece.x + c;
            const gy = piece.y + r;
            if (gy >= 0 && gy < t.rows && gx >= 0 && gx < t.cols) {
                t.grid[gy][gx] = piece.color;
            }
        }
    }

    let cleared = 0;
    for (let r = t.rows - 1; r >= 0; r--) {
        if (t.grid[r].every(cell => cell !== null)) {
            t.grid.splice(r, 1);
            t.grid.unshift(Array(t.cols).fill(null));
            cleared++;
            r++;
        }
    }

    if (cleared > 0) {
        t.linesLeft = Math.max(0, t.linesLeft - cleared);
    }

    if (t.linesLeft <= 0) {
        t.status = 'ok';
        t.pieces = {};
        room.state.doorUnlocked = true;
        io.to(pass).emit('keyUpdated', { keyHolder: null, doorUnlocked: true });
        io.to(pass).emit('tetrisSync', serializeTetris(t));
        return;
    }

    const toppedOut = t.grid[0].some(c => c !== null) || t.grid[1].some(c => c !== null);
    if (toppedOut) {
        t.status = 'failed';
        t.pieces = {};
        io.to(pass).emit('tetrisSync', serializeTetris(t));
        if (!t.restarting) {
            t.restarting = true;
            setTimeout(() => {
                if (rooms[pass] && rooms[pass].state && rooms[pass].state.tetris && rooms[pass].state.tetris.restarting) {
                    startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                }
            }, 1300);
        }
        return;
    }

    const spawned = spawnTetrisPiece(t, playerId, piece.slotIdx, piece.color);
    if (!spawned) {
        t.status = 'failed';
        t.pieces = {};
        io.to(pass).emit('tetrisSync', serializeTetris(t));
        if (!t.restarting) {
            t.restarting = true;
            setTimeout(() => {
                if (rooms[pass] && rooms[pass].state && rooms[pass].state.tetris && rooms[pass].state.tetris.restarting) {
                    startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                }
            }, 1300);
        }
    }
}

function getRequiredCount(reqRule, totalPlayers) {
    if (reqRule === 'ALL') return totalPlayers;
    if (reqRule === 'ALL_MINUS_ONE') return Math.max(1, totalPlayers - 1);
    if (reqRule === 'MOST') return Math.max(1, totalPlayers >= 4 ? totalPlayers - 2 : 1);
    if (reqRule === 'HALF') return Math.max(1, Math.ceil(totalPlayers / 2));
    if (reqRule === 'THIRD') return Math.max(1, Math.ceil(totalPlayers / 3));
    if (reqRule === 'QUARTER') return Math.max(1, Math.floor(totalPlayers / 4));
    return Math.min(totalPlayers, Number(reqRule) || 1);
}

function rectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function circleRectOverlap(cx, cy, r, rect) {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) <= r * r;
}

function getCatBox(p) {
    const s = p.scale || 1;
    return { x: p.x, y: p.y, w: Math.round(36 * s), h: Math.round(39 * s) };
}

function startLevelForRoom(room, worldKey, levelKey) {
    const worlds = loadAllWorlds();
    const levelData = worlds[worldKey] && worlds[worldKey][levelKey];
    if (!levelData) return false;

    const playerIds = Object.keys(room.players);
    const totalPlayers = Math.max(1, playerIds.length);

    let countdownPuzzleState = null;
    if (levelData.countdownPuzzle && levelData.countdownPuzzle.enabled) {
        const cpCfg = levelData.countdownPuzzle;
        const count = Math.min(totalPlayers, cpCfg.slots.length);
        const startSec = cpCfg.startSeconds || 10.0;
        const target = Number((count * (cpCfg.targetPerPlayer || 0.5)).toFixed(2));

        countdownPuzzleState = {
            enabled: true,
            target: target,
            status: 'running',
            lastTick: Date.now(),
            sum: Number((count * startSec).toFixed(2)),
            timers: cpCfg.slots.slice(0, count).map(slot => ({
                ...slot,
                w: 36,
                h: 12,
                time: startSec,
                stopped: false
            }))
        };
    }

    let tetrisState = null;
    if (levelData.tetris && levelData.tetris.enabled) {
        const tCfg = levelData.tetris;
        const slotCount = Math.min(8, totalPlayers);
        const cols = slotCount === 1 ? 10 : (slotCount === 2 ? 12 : Math.min(32, slotCount * 4));
        const rows = tCfg.rows || 15;
        tetrisState = {
            enabled: true,
            cols,
            rows,
            slotCount,
            linesLeft: tCfg.targetLines || 10,
            dropIntervalMs: tCfg.dropIntervalMs || 650,
            lastDrop: Date.now(),
            status: 'playing',
            restarting: false,
            grid: Array.from({ length: rows }, () => Array(cols).fill(null)),
            pieces: {}
        };
        playerIds.slice(0, slotCount).forEach((pid, idx) => {
            spawnTetrisPiece(tetrisState, pid, idx, room.players[pid].color);
        });
    }

    let breakoutState = null;
    if (levelData.breakout && levelData.breakout.enabled) {
        const bCfg = levelData.breakout;
        const area = bCfg.area || { x: 170, y: 24, w: 560, h: 448 };
        const cols = bCfg.cols || 16;
        const brickW = area.w / cols;
        const brickH = bCfg.brickH || 22;
        const startY = bCfg.brickStartY || 80;
        const rowColors = bCfg.rowColors || [
            { fill: '#74b9ff', border: '#0984e3' },
            { fill: '#ff7675', border: '#d63031' },
            { fill: '#7bed9f', border: '#2ed573' }
        ];
        const specialList = bCfg.specialBricks || [];

        const bricks = [];
        rowColors.forEach((color, r) => {
            for (let c = 0; c < cols; c++) {
                const x1 = Math.round(area.x + c * brickW);
                const x2 = Math.round(area.x + (c + 1) * brickW);
                const sp = specialList.find(sb => sb.row === r && sb.col === c);
                bricks.push({
                    x: x1,
                    y: startY + r * brickH,
                    w: Math.max(10, x2 - x1),
                    h: brickH,
                    color: sp ? { fill: '#fff5d6', border: '#e1b12c' } : color,
                    special: sp ? sp.type : null,
                    extraBalls: sp ? (sp.extraBalls || 2) : 0,
                    broken: false
                });
            }
        });

        breakoutState = {
            enabled: true,
            area,
            ballRadius: bCfg.ballRadius || 9,
            ballSpeed: bCfg.ballSpeed || 6.0,
            bricks,
            bumpers: (bCfg.bumpers || []).map(bp => ({ ...bp })),
            balls: [],
            cleared: false,
            failed: false,
            restarting: false
        };
    }

    room.world = String(worldKey);
    room.level = String(levelKey);
    room.levelData = levelData;
    room.state = {
        keyHolder: null,
        keyVisible: !levelData.keyRequiresAllCoins && !levelData.keyRequiresPuzzle,
        doorUnlocked: false,
        cleared: false,
        timeLeft: levelData.timeLimit ? Number(levelData.timeLimit) : null,
        timeUp: false,
        lastTimerTick: Date.now(),
        levelStartTime: Date.now(),
        scrollX: 0,
        playerOrder: playerIds,
        countdownPuzzle: countdownPuzzleState,
        tetris: tetrisState,
        breakout: breakoutState,
        elevators: (levelData.elevators || []).map(e => ({
            id: e.id,
            x: e.x,
            y: e.startY,
            startY: e.startY,
            endY: e.endY,
            w: e.w,
            h: e.h,
            required: e.required,
            speed: e.speed || 2,
            remaining: getRequiredCount(e.required, totalPlayers)
        })),
        pushBlocks: (levelData.pushBlocks || []).map(b => ({
            id: b.id,
            x: b.x,
            y: b.y,
            w: b.w,
            h: b.h,
            minX: b.minX,
            maxX: b.maxX,
            required: b.required,
            speed: b.speed || 2.5,
            pushMargin: b.pushMargin || null,
            pitX: b.pitX || null,
            pitStopY: b.pitStopY || null,
            fallen: false,
            remaining: getRequiredCount(b.required, totalPlayers)
        })),
        buttons: (levelData.buttons || []).map(btn => ({
            ...btn,
            pressed: false
        })),
        gates: (levelData.gates || []).map(g => ({
            ...g,
            y: g.startY
        })),
        movingPlatforms: (levelData.movingPlatforms || []).map(m => ({
            ...m
        })),
        crumblingBlocks: (levelData.crumblingBlocks || []).map(cb => ({
            ...cb,
            triggeredAt: null,
            broken: false
        })),
        coins: (levelData.coins || []).map((c, idx) => ({
            id: `coin_${idx}`,
            x: c.x,
            y: c.y,
            w: c.w || 22,
            h: c.h || 32,
            collected: false
        })),
        colorBlocks: (levelData.colorBlocks || []).map((cb, idx) => {
            const ownerId = playerIds.length > 0 ? playerIds[(cb.ownerIdx ?? idx) % playerIds.length] : null;
            const color = (ownerId && room.players[ownerId]) ? room.players[ownerId].color : CAT_COLORS[idx % CAT_COLORS.length];
            return {
                id: cb.id || `cblk_${idx}`,
                x: cb.x,
                y: cb.y,
                w: cb.w,
                h: cb.h,
                vy: 0,
                speed: cb.speed || 4.5,
                color
            };
        }),
        ghost: (levelData.ghost && levelData.ghost.enabled) ? {
            enabled: true,
            x: levelData.ghost.x || 715,
            y: levelData.ghost.y || 235,
            baseY: levelData.ghost.y || 235,
            patrolX: levelData.ghost.patrolX || 400,
            state: 'sleep',
            nextChange: Date.now() + 2600,
            graceUntil: 0,
            snapshot: {},
            caughtIds: [],
            targetX: 0,
            targetY: 0,
            attackStart: 0,
            reachedTarget: false,
            restarting: false
        } : null,
        trafficLight: (levelData.trafficLight && levelData.trafficLight.enabled) ? {
            enabled: true,
            state: 'blue',
            nextChange: Date.now() + (levelData.trafficLight.initialBlue || 6000),
            graceUntil: 0,
            snapshot: {},
            caughtIds: [],
            restarting: false
        } : null,
        enemies: (levelData.enemies || []).map((en, idx) => ({
            id: en.id || `en_${idx}`,
            x: en.x,
            y: en.y,
            w: en.w || 38,
            h: en.h || 24,
            minX: en.minX,
            maxX: en.maxX,
            speed: en.speed || -2.4,
            mode: en.mode || 'loop'
        })),
        shyGhost: (levelData.shyGhost && levelData.shyGhost.enabled) ? {
            enabled: true,
            x: levelData.shyGhost.x || 90,
            y: levelData.shyGhost.y || 150,
            w: levelData.shyGhost.w || 54,
            h: levelData.shyGhost.h || 54,
            speed: levelData.shyGhost.speed || 3.1,
            facing: 1,
            state: 'shy',
            hasKey: false,
            keyX: levelData.key ? levelData.key.x : 0,
            keyY: levelData.key ? levelData.key.y : 0,
            caughtIds: [],
            restarting: false
        } : null,
        pipeEnemies: (levelData.pipeEnemies || []).map((pe, idx) => ({
            id: pe.id || `pipe_${idx}`,
            x: pe.x,
            y: pe.y,
            w: pe.w || 72,
            h: pe.h || 92,
            monsterW: pe.monsterW || 46,
            monsterH: pe.monsterH || 30,
            cycleMs: pe.cycleMs || 4000,
            upDuration: pe.upDuration || 1800,
            monsterOffset: 0
        })),
        moveGauge: (levelData.moveGauge && levelData.moveGauge.enabled) ? {
            enabled: true,
            value: 100,
            max: 100,
            drainRate: levelData.moveGauge.drainRate || 14,
            regenRate: levelData.moveGauge.regenRate || 45,
            lastTick: Date.now(),
            depleted: false,
            restarting: false
        } : null
    };

    const halfCount = Math.ceil(playerIds.length / 2);
    playerIds.forEach((id, idx) => {
        const p = room.players[id];
        if (levelData.breakout && levelData.breakout.enabled && room.state.breakout) {
            const area = room.state.breakout.area;
            const slotW = area.w / totalPlayers;
            p.x = Math.round(area.x + idx * slotW + (slotW - 36) / 2);
            p.y = area.y + area.h - 39;

            room.state.breakout.balls.push({
                id: `ball_${idx}`,
                x: p.x + 18,
                y: p.y - 54,
                vx: 0,
                vy: 0,
                r: room.state.breakout.ballRadius,
                speed: room.state.breakout.ballSpeed,
                active: false,
                alive: true,
                hitCooldown: 0
            });
        } else if (levelData.tetris && levelData.tetris.enabled) {
            if (idx < halfCount) {
                p.x = 365 - (halfCount - 1 - idx) * 48;
            } else {
                p.x = 500 + (idx - halfCount) * 48;
            }
            p.y = 435;
        } else if (room.state.countdownPuzzle && room.state.countdownPuzzle.timers[idx]) {
            p.x = room.state.countdownPuzzle.timers[idx].spawnX;
            p.y = room.state.countdownPuzzle.timers[idx].spawnY;
        } else if (levelData.spawnStacked) {
            p.x = levelData.spawn.x;
            p.y = levelData.spawn.y - idx * 40;
        } else {
            p.x = levelData.spawn.x + idx * 42;
            p.y = levelData.spawn.y;
        }
        p.vx = 0;
        p.vy = 0;
        p.facing = 1;
        p.scale = 1;
        p.enteredDoor = false;

        p.shield = null;
        if (levelData.shields && levelData.shields.enabled) {
            if (playerIds.length === 1) p.shield = 'both';
            else if (idx === 0 || idx === 2) p.shield = 'top';
            else if (idx === 1) p.shield = 'right';
        }
    });

    // Ổ cắm khởi tạo riêng cho World 9 - 12 (server_extra.js)
    if (serverExtra && serverExtra.initLevelState) {
        serverExtra.initLevelState(room, levelData, playerIds, { getCatBox, rectOverlap, getRequiredCount });
    }

    io.to(room.pass).emit('levelLoaded', {
        world: room.world,
        level: room.level,
        levelData: room.levelData,
        roomState: room.state,
        players: room.players
    });
    return true;
}

// Vòng lặp cập nhật toàn bộ cơ chế động trên Server (30 lần/giây)
setInterval(() => {
    const now = Date.now();
    for (const pass in rooms) {
        const room = rooms[pass];
        if (!room.state || !room.levelData || room.state.cleared || room.state.timeUp) continue;

        const players = Object.values(room.players).filter(p => !p.enteredDoor);
        const totalPlayers = Object.keys(room.players).length;
        if (totalPlayers === 0) continue;

        // 1. Cập nhật Thang máy
        let elevChanged = false;
        room.state.elevators.forEach(elev => {
            const reqCount = getRequiredCount(elev.required, totalPlayers);
            let onElev = 0;
            players.forEach(p => {
                const box = getCatBox(p);
                const centerX = box.x + box.w / 2;
                const bottomY = box.y + box.h;
                if (centerX >= elev.x + 8 && centerX <= elev.x + elev.w - 8 && bottomY <= elev.y + 18 && bottomY >= elev.y - 360) {
                    onElev++;
                }
            });

            const newRem = Math.max(0, reqCount - onElev);
            if (elev.remaining !== newRem) { elev.remaining = newRem; elevChanged = true; }

            const targetY = newRem === 0 ? elev.endY : elev.startY;
            if (elev.y > targetY) {
                elev.y = Math.max(targetY, elev.y - elev.speed);
                elevChanged = true;
            } else if (elev.y < targetY) {
                elev.y = Math.min(targetY, elev.y + elev.speed);
                elevChanged = true;
            }
        });
        if (elevChanged) io.to(pass).emit('elevatorsSync', room.state.elevators);

        // 2. Cập nhật Khối đẩy đếm số
        let blockChanged = false;
        room.state.pushBlocks.forEach(b => {
            if (b.fallen) {
                if (b.y < b.pitStopY) {
                    const dropSpeed = room.levelData.flyMode ? 14 : 10;
                    b.y = Math.min(b.pitStopY, b.y + dropSpeed);
                    blockChanged = true;
                }
                return;
            }

            const pushMargin = b.pushMargin || (room.levelData.flyMode ? 36 : 18);
            const reqCount = getRequiredCount(b.required, totalPlayers);
            let pushRight = 0;
            let pushLeft = 0;

            players.forEach(p => {
                const box = getCatBox(p);
                const vertOverlap = box.y + box.h > b.y + 4 && box.y < b.y + b.h - 4;
                if (!vertOverlap) return;

                if (box.x + box.w >= b.x - pushMargin && box.x + box.w <= b.x + 16 && p.vx > 0) pushRight++;
                if (box.x <= b.x + b.w + pushMargin && box.x >= b.x + b.w - 16 && p.vx < 0) pushLeft++;
            });

            const activePush = Math.max(pushRight, pushLeft);
            const newRem = Math.max(0, reqCount - activePush);
            if (b.remaining !== newRem) { b.remaining = newRem; blockChanged = true; }

            if (pushRight >= reqCount && b.x < b.maxX) {
                b.x = Math.min(b.maxX, b.x + b.speed);
                blockChanged = true;
            } else if (pushLeft >= reqCount && b.x > b.minX) {
                b.x = Math.max(b.minX, b.x - b.speed);
                blockChanged = true;
            }

            if (b.pitX && b.x >= b.pitX) {
                b.fallen = true;
                b.remaining = 0;
                blockChanged = true;
            }
        });
        if (blockChanged) io.to(pass).emit('blocksSync', room.state.pushBlocks);

        // 3. Cập nhật Nút bấm & Cổng chắn
        let gateChanged = false;
        const hasButtons = room.state.buttons && room.state.buttons.length > 0;
        const hasGates = room.state.gates && room.state.gates.length > 0;

        if (hasButtons || hasGates) {
            (room.state.buttons || []).forEach(btn => {
                if (btn.oneTime && btn.pressed) return;
                const triggerBox = { x: btn.x - 2, y: btn.y - 6, w: btn.w + 4, h: btn.h + 10 };
                let isPressed = false;

                for (const p of players) {
                    if (rectOverlap(getCatBox(p), triggerBox)) {
                        isPressed = true;
                        break;
                    }
                }
                if (!isPressed) {
                    for (const b of room.state.pushBlocks) {
                        if (rectOverlap({ x: b.x, y: b.y, w: b.w, h: b.h }, triggerBox)) {
                            isPressed = true;
                            break;
                        }
                    }
                }

                if (btn.pressed !== isPressed) {
                    btn.pressed = isPressed;
                    gateChanged = true;
                    if (isPressed && btn.addTime && room.state.timeLeft !== null) {
                        room.state.timeLeft += Number(btn.addTime);
                        io.to(pass).emit('timerSync', room.state.timeLeft);
                    }
                }
            });

            (room.state.gates || []).forEach(g => {
                let shouldOpen = false;
                if (g.openOnKey) {
                    shouldOpen = Boolean(room.state.keyHolder || room.state.doorUnlocked);
                } else {
                    const linkedBtn = (room.state.buttons || []).find(b => b.gateId === g.id);
                    shouldOpen = linkedBtn ? linkedBtn.pressed : false;
                }

                const targetY = shouldOpen ? g.openY : g.startY;
                const step = g.speed || 6;

                if (g.y > targetY) {
                    g.y = Math.max(targetY, g.y - step);
                    gateChanged = true;
                } else if (g.y < targetY) {
                    if (!shouldOpen) {
                        const catUnderGate = players.some(p => {
                            const box = getCatBox(p);
                            return box.x + box.w > g.x + 2 && box.x < g.x + g.w - 2 && box.y < g.startY + g.h;
                        });
                        if (!catUnderGate) {
                            g.y = Math.min(targetY, g.y + step);
                            gateChanged = true;
                        }
                    } else {
                        g.y = Math.min(targetY, g.y + step);
                        gateChanged = true;
                    }
                }
            });

            if (gateChanged) {
                io.to(pass).emit('gatesSync', {
                    buttons: room.state.buttons,
                    gates: room.state.gates
                });
            }
        }

        // 4. Cập nhật Thanh di động tự động
        if (room.state.movingPlatforms && room.state.movingPlatforms.length > 0) {
            room.state.movingPlatforms.forEach(m => {
                if (m.speedX) {
                    m.x += m.speedX;
                    if (m.x <= m.minX) { m.x = m.minX; m.speedX = Math.abs(m.speedX); }
                    if (m.x >= m.maxX) { m.x = m.maxX; m.speedX = -Math.abs(m.speedX); }
                }
                if (m.speedY) {
                    m.y += m.speedY;
                    if (m.y <= m.minY) { m.y = m.minY; m.speedY = Math.abs(m.speedY); }
                    if (m.y >= m.maxY) { m.y = m.maxY; m.speedY = -Math.abs(m.speedY); }
                }
            });
            io.to(pass).emit('movingPlatformsSync', room.state.movingPlatforms);
        }

        // 5. Cập nhật Gạch tự vỡ
        if (room.state.crumblingBlocks && room.state.crumblingBlocks.length > 0) {
            let cbChanged = false;
            room.state.crumblingBlocks.forEach(cb => {
                if (cb.broken) return;
                if (!cb.triggeredAt) {
                    const stepped = players.some(p => {
                        const box = getCatBox(p);
                        return box.x + box.w > cb.x + 2 &&
                            box.x < cb.x + cb.w - 2 &&
                            Math.abs((box.y + box.h) - cb.y) <= 10;
                    });
                    if (stepped) {
                        cb.triggeredAt = now;
                        cbChanged = true;
                    }
                } else if (now - cb.triggeredAt >= (cb.delay || 420)) {
                    cb.broken = true;
                    cbChanged = true;
                }
            });
            if (cbChanged) io.to(pass).emit('crumblingSync', room.state.crumblingBlocks);
        }

        // 6. Cập nhật Xu vàng & Hiện chìa khóa
        if (room.state.coins && room.state.coins.length > 0) {
            let coinChanged = false;
            room.state.coins.forEach(c => {
                if (c.collected) return;
                const touched = players.some(p => rectOverlap(getCatBox(p), c));
                if (touched) {
                    c.collected = true;
                    coinChanged = true;
                }
            });

            if (coinChanged) {
                const allCollected = room.state.coins.every(c => c.collected);
                if (allCollected && !room.state.keyVisible) {
                    room.state.keyVisible = true;
                }
                io.to(pass).emit('coinsSync', {
                    coins: room.state.coins,
                    keyVisible: room.state.keyVisible
                });
            }
        }

        // 7. Cập nhật Đồng hồ đếm ngược chung (World 3)
        if (room.state.timeLeft !== null && now - room.state.lastTimerTick >= 1000) {
            room.state.lastTimerTick = now;
            room.state.timeLeft = Math.max(0, room.state.timeLeft - 1);
            io.to(pass).emit('timerSync', room.state.timeLeft);

            if (room.state.timeLeft === 0) {
                room.state.timeUp = true;
                io.to(pass).emit('timeUp');
                setTimeout(() => {
                    if (rooms[pass] && rooms[pass].state && rooms[pass].state.timeUp) {
                        startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                    }
                }, 1800);
            }
        }

        // 8. Cập nhật Camera tự động kéo (World 4 - Màn 4-2)
        const AUTO_SCROLL_MULTIPLIER = 1.3;
        if (room.levelData.autoScroll && room.levelData.autoScroll.enabled) {
            const delay = room.levelData.autoScroll.delay || 0;
            if (now - room.state.levelStartTime >= delay) {
                const maxScroll = Math.max(0, room.levelData.width - 900);
                if (room.state.scrollX < maxScroll) {
                    room.state.scrollX = Math.min(maxScroll, room.state.scrollX + (room.levelData.autoScroll.speed || 3));
                    io.to(pass).emit('scrollSync', room.state.scrollX);
                }
            }
        }

        // 9. Cập nhật Đồng hồ dừng theo nút bấm (World 4 - Màn 4-3)
        if (room.state.countdownPuzzle && room.state.countdownPuzzle.enabled && room.state.countdownPuzzle.status === 'running') {
            const cp = room.state.countdownPuzzle;
            const dt = (now - cp.lastTick) / 1000;
            cp.lastTick = now;

            let anyZero = false;
            cp.timers.forEach(t => {
                if (t.stopped) return;

                const btnBox = { x: t.btnX - 2, y: t.btnY - 6, w: t.w + 4, h: t.h + 10 };
                const stepped = players.some(p => rectOverlap(getCatBox(p), btnBox));

                if (stepped) {
                    t.stopped = true;
                } else {
                    t.time = Math.max(0, t.time - dt);
                    if (t.time <= 0) {
                        t.time = 0;
                        anyZero = true;
                    }
                }
            });

            cp.sum = Number(cp.timers.reduce((acc, t) => acc + t.time, 0).toFixed(2));
            const allStopped = cp.timers.every(t => t.stopped);

            if (anyZero || (allStopped && (cp.sum <= 0 || cp.sum >= cp.target))) {
                cp.status = 'failed';
                io.to(pass).emit('countdownSync', cp);
                setTimeout(() => {
                    if (rooms[pass] && rooms[pass].state && rooms[pass].state.countdownPuzzle && rooms[pass].state.countdownPuzzle.status === 'failed') {
                        startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                    }
                }, 1500);
            } else if (allStopped && cp.sum > 0 && cp.sum < cp.target) {
                cp.status = 'success';
                room.state.keyVisible = true;
                io.to(pass).emit('countdownSync', cp);
            } else {
                io.to(pass).emit('countdownSync', cp);
            }
        }

        // 10. Cập nhật Khối màu xếp tháp (World 6)
        if (room.state.colorBlocks && room.state.colorBlocks.length > 0) {
            let cbChanged = false;
            const blocks = room.state.colorBlocks;
            const platforms = room.levelData.platforms || [];

            const sortedByBottom = [...blocks].sort((a, b) => (b.y + b.h) - (a.y + a.h));
            sortedByBottom.forEach(b => {
                const prevY = b.y;
                b.vy = Math.min(12, (b.vy || 0) + 1.4);
                const nextY = b.y + b.vy;
                let supportY = null;

                for (const p of platforms) {
                    if (b.x + b.w > p.x + 2 && b.x < p.x + p.w - 2) {
                        if (b.y + b.h <= p.y + 14 && nextY + b.h >= p.y) {
                            if (supportY === null || p.y < supportY) supportY = p.y;
                        }
                    }
                }

                for (const o of blocks) {
                    if (o === b) continue;
                    if (b.x + b.w > o.x + 2 && b.x < o.x + o.w - 2) {
                        if (b.y + b.h <= o.y + 14 && nextY + b.h >= o.y) {
                            if (supportY === null || o.y < supportY) supportY = o.y;
                        }
                    }
                }

                if (supportY !== null) {
                    b.y = supportY - b.h;
                    b.vy = 0;
                } else {
                    b.y = nextY;
                    if (b.y + b.h > room.levelData.height) {
                        b.y = room.levelData.height - b.h;
                        b.vy = 0;
                    }
                }
                if (Math.abs(b.y - prevY) > 0.01) cbChanged = true;
            });

            blocks.forEach(b => {
                let pushDir = 0;
                for (const p of players) {
                    if (p.color.fill !== b.color.fill) continue;
                    const box = getCatBox(p);
                    const vertOverlap = box.y + box.h > b.y + 4 && box.y < b.y + b.h - 4;
                    if (!vertOverlap) continue;

                    if (p.vx > 0 && box.x + box.w >= b.x - 10 && box.x + box.w <= b.x + 14) {
                        pushDir = 1;
                        break;
                    }
                    if (p.vx < 0 && box.x <= b.x + b.w + 10 && box.x >= b.x + b.w - 14) {
                        pushDir = -1;
                        break;
                    }
                }
                if (pushDir === 0) return;

                const carried = [];
                const queue = [b];
                const visited = new Set([b]);
                while (queue.length > 0) {
                    const cur = queue.shift();
                    for (const o of blocks) {
                        if (visited.has(o)) continue;
                        const horiz = o.x + o.w > cur.x + 2 && o.x < cur.x + cur.w - 2;
                        const onTop = Math.abs((o.y + o.h) - cur.y) <= 4;
                        if (horiz && onTop) {
                            visited.add(o);
                            carried.push(o);
                            queue.push(o);
                        }
                    }
                }

                const step = pushDir * (b.speed || 4.5);

                const moveBlockSafely = (blk, delta, ignoreSet) => {
                    let allowed = delta;
                    if (allowed > 0) {
                        if (blk.x + allowed + blk.w > room.levelData.width) {
                            allowed = room.levelData.width - blk.w - blk.x;
                        }
                        for (const p of platforms) {
                            if (blk.y + blk.h > p.y + 2 && blk.y < p.y + p.h - 2) {
                                if (blk.x + blk.w <= p.x + 2 && blk.x + blk.w + allowed > p.x) {
                                    allowed = Math.min(allowed, p.x - (blk.x + blk.w));
                                }
                            }
                        }
                        for (const o of blocks) {
                            if (o === blk || ignoreSet.has(o)) continue;
                            if (blk.y + blk.h > o.y + 2 && blk.y < o.y + o.h - 2) {
                                if (blk.x + blk.w <= o.x + 2 && blk.x + blk.w + allowed > o.x) {
                                    allowed = Math.min(allowed, o.x - (blk.x + blk.w));
                                }
                            }
                        }
                        allowed = Math.max(0, allowed);
                    } else if (allowed < 0) {
                        if (blk.x + allowed < 0) allowed = -blk.x;
                        for (const p of platforms) {
                            if (blk.y + blk.h > p.y + 2 && blk.y < p.y + p.h - 2) {
                                if (blk.x >= p.x + p.w - 2 && blk.x + allowed < p.x + p.w) {
                                    allowed = Math.max(allowed, (p.x + p.w) - blk.x);
                                }
                            }
                        }
                        for (const o of blocks) {
                            if (o === blk || ignoreSet.has(o)) continue;
                            if (blk.y + blk.h > o.y + 2 && blk.y < o.y + o.h - 2) {
                                if (blk.x >= o.x + o.w - 2 && blk.x + allowed < o.x + o.w) {
                                    allowed = Math.max(allowed, (o.x + o.w) - blk.x);
                                }
                            }
                        }
                        allowed = Math.min(0, allowed);
                    }
                    if (Math.abs(allowed) > 0.01) {
                        blk.x += allowed;
                        cbChanged = true;
                    }
                    return allowed;
                };

                const actualBaseDx = moveBlockSafely(b, step, visited);
                if (Math.abs(actualBaseDx) > 0.01) {
                    carried.forEach(topBlk => {
                        moveBlockSafely(topBlk, actualBaseDx, visited);
                    });
                }
            });

            if (cbChanged) io.to(pass).emit('colorBlocksSync', blocks);
        }

        // 11. Cập nhật Con ma Move and Stop (World 7 - Màn 7-1)
        if (room.state.ghost && room.state.ghost.enabled) {
            const g = room.state.ghost;
            const cfg = room.levelData.ghost;

            if (g.state === 'attack') {
                const dx = (g.targetX - 30) - g.x;
                const dy = (g.targetY - 22) - g.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 22) {
                    g.x += (dx / dist) * 24;
                    g.y += (dy / dist) * 24;
                } else {
                    g.x = g.targetX - 30;
                    g.y = g.targetY - 22;
                    g.reachedTarget = true;
                }
                if (now - g.attackStart > 500) g.reachedTarget = true;

                if (g.reachedTarget && !g.restarting) {
                    g.restarting = true;
                    setTimeout(() => {
                        if (rooms[pass] && rooms[pass].state && rooms[pass].state.ghost && rooms[pass].state.ghost.restarting) {
                            startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                        }
                    }, 1100);
                }
            } else {
                if ((room.state.keyHolder || room.state.doorUnlocked) && g.x > g.patrolX) {
                    g.x = Math.max(g.patrolX, g.x - 1.1);
                }
                g.y = g.baseY + Math.sin(now * 0.004) * 7;

                if (g.state === 'sleep' && now >= g.nextChange) {
                    g.state = 'warning';
                    g.nextChange = now + (cfg.warningTime || 750);
                } else if (g.state === 'warning' && now >= g.nextChange) {
                    g.state = 'awake';
                    g.graceUntil = now + 220;
                    g.snapshot = {};
                    const minA = cfg.awakeMin || 1800;
                    const maxA = cfg.awakeMax || 2800;
                    g.nextChange = now + minA + Math.random() * (maxA - minA);
                } else if (g.state === 'awake') {
                    if (now >= g.graceUntil) {
                        const movers = [];
                        players.forEach(p => {
                            if (!g.snapshot[p.id]) {
                                g.snapshot[p.id] = { x: p.x, y: p.y };
                                return;
                            }
                            const movedDist = Math.hypot(p.x - g.snapshot[p.id].x, p.y - g.snapshot[p.id].y);
                            if (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.6 || movedDist > 2.5) {
                                movers.push(p);
                            }
                        });

                        if (movers.length > 0) {
                            g.state = 'attack';
                            g.caughtIds = movers.map(m => m.id);
                            g.targetX = movers[0].x;
                            g.targetY = movers[0].y;
                            g.attackStart = now;
                        }
                    }

                    if (g.state === 'awake' && now >= g.nextChange) {
                        g.state = 'sleep';
                        const minS = cfg.sleepMin || 2200;
                        const maxS = cfg.sleepMax || 3600;
                        g.nextChange = now + minS + Math.random() * (maxS - minS);
                    }
                }
            }

            io.to(pass).emit('ghostSync', {
                enabled: g.enabled,
                x: g.x,
                y: g.y,
                state: g.state,
                caughtIds: g.caughtIds,
                reachedTarget: g.reachedTarget
            });
        }

        // 12. Cập nhật Đèn giao thông Xanh / Đỏ (World 7 - Màn 7-2)
        if (room.state.trafficLight && room.state.trafficLight.enabled) {
            const tl = room.state.trafficLight;
            const cfg = room.levelData.trafficLight;
            const prevState = tl.state;

            if (tl.state === 'blue' && now >= tl.nextChange) {
                tl.state = 'blink';
                tl.nextChange = now + (cfg.blinkTime || 1100);
            } else if (tl.state === 'blink' && now >= tl.nextChange) {
                tl.state = 'red';
                tl.graceUntil = now + 260;
                tl.snapshot = {};
                const minR = cfg.redMin || 2400;
                const maxR = cfg.redMax || 3200;
                tl.nextChange = now + minR + Math.random() * (maxR - minR);
            } else if (tl.state === 'red') {
                if (now >= tl.graceUntil) {
                    const movers = [];
                    players.forEach(p => {
                        if (!tl.snapshot[p.id]) {
                            tl.snapshot[p.id] = { x: p.x, y: p.y };
                            return;
                        }
                        const movedDist = Math.hypot(p.x - tl.snapshot[p.id].x, p.y - tl.snapshot[p.id].y);
                        if (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.6 || movedDist > 2.5) {
                            movers.push(p);
                        }
                    });

                    if (movers.length > 0) {
                        tl.state = 'caught';
                        tl.caughtIds = movers.map(m => m.id);
                        if (!tl.restarting) {
                            tl.restarting = true;
                            setTimeout(() => {
                                if (rooms[pass] && rooms[pass].state && rooms[pass].state.trafficLight && rooms[pass].state.trafficLight.restarting) {
                                    startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                                }
                            }, 1100);
                        }
                    }
                }

                if (tl.state === 'red' && now >= tl.nextChange) {
                    tl.state = 'blue';
                    const minB = cfg.blueMin || 4200;
                    const maxB = cfg.blueMax || 5400;
                    tl.nextChange = now + minB + Math.random() * (maxB - minB);
                }
            }

            if (prevState !== tl.state) {
                io.to(pass).emit('trafficLightSync', {
                    enabled: tl.enabled,
                    state: tl.state,
                    caughtIds: tl.caughtIds
                });
            }
        }

        // 13. Cập nhật Sâu xanh tuần tra (World 7 - Màn 7-2 & 7-4)
        if (room.state.enemies && room.state.enemies.length > 0) {
            const frozenByLight = room.state.trafficLight &&
                (room.state.trafficLight.state === 'red' || room.state.trafficLight.state === 'caught');
            const frozenByGauge = room.state.moveGauge && room.state.moveGauge.depleted;

            if (!frozenByLight && !frozenByGauge) {
                room.state.enemies.forEach(en => {
                    en.x += en.speed;
                    if (en.mode === 'loop') {
                        if (en.speed < 0 && en.x < en.minX) en.x = en.maxX;
                        else if (en.speed > 0 && en.x > en.maxX) en.x = en.minX;
                    } else {
                        if (en.x <= en.minX) { en.x = en.minX; en.speed = Math.abs(en.speed); }
                        if (en.x >= en.maxX) { en.x = en.maxX; en.speed = -Math.abs(en.speed); }
                    }
                });
                io.to(pass).emit('enemiesSync', room.state.enemies);
            }
        }

        // 14. Cập nhật Con Ma Thẹn Thùng (World 7 - Màn 7-3)
        if (room.state.shyGhost && room.state.shyGhost.enabled) {
            const sg = room.state.shyGhost;

            if (sg.state !== 'caught') {
                if (now - room.state.levelStartTime < 900) {
                    sg.state = 'shy';
                } else {
                    const sgCx = sg.x + sg.w / 2;
                    const sgCy = sg.y + sg.h / 2;
                    const isWatched = players.some(p => {
                        const box = getCatBox(p);
                        const pCx = box.x + box.w / 2;
                        if (sgCx < pCx - 8 && p.facing === -1) return true;
                        if (sgCx > pCx + 8 && p.facing === 1) return true;
                        return false;
                    });

                    if (isWatched) {
                        sg.state = 'shy';
                    } else {
                        sg.state = 'chase';
                        let nearest = players[0];
                        let minDist = Infinity;
                        players.forEach(p => {
                            const box = getCatBox(p);
                            const d = Math.hypot((box.x + box.w / 2) - sgCx, (box.y + box.h / 2) - sgCy);
                            if (d < minDist) { minDist = d; nearest = p; }
                        });

                        if (nearest) {
                            const nBox = getCatBox(nearest);
                            const tx = nBox.x + nBox.w / 2 - sg.w / 2;
                            const ty = nBox.y + nBox.h / 2 - sg.h / 2;
                            const dx = tx - sg.x;
                            const dy = ty - sg.y;
                            const dist = Math.hypot(dx, dy) || 1;
                            sg.x += (dx / dist) * sg.speed;
                            sg.y += (dy / dist) * sg.speed;
                            if (Math.abs(dx) > 2) sg.facing = dx >= 0 ? 1 : -1;
                        }
                    }

                    if (!sg.hasKey && !room.state.keyHolder && !room.state.doorUnlocked && room.levelData.key) {
                        if (rectOverlap({ x: sg.x, y: sg.y, w: sg.w, h: sg.h }, room.levelData.key)) {
                            sg.hasKey = true;
                        }
                    }
                    if (sg.hasKey) {
                        sg.keyX = Math.round(sg.x + (sg.w - 26) / 2);
                        sg.keyY = Math.round(sg.y + sg.h + 4);
                    }

                    const ghostHitbox = { x: sg.x + 8, y: sg.y + 8, w: sg.w - 16, h: sg.h - 16 };
                    const hitPlayers = players.filter(p => rectOverlap(getCatBox(p), ghostHitbox));
                    if (hitPlayers.length > 0) {
                        sg.state = 'caught';
                        sg.caughtIds = hitPlayers.map(p => p.id);
                        if (!sg.restarting) {
                            sg.restarting = true;
                            setTimeout(() => {
                                if (rooms[pass] && rooms[pass].state && rooms[pass].state.shyGhost && rooms[pass].state.shyGhost.restarting) {
                                    startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                                }
                            }, 950);
                        }
                    }
                }
            }

            io.to(pass).emit('shyGhostSync', {
                enabled: sg.enabled,
                x: sg.x,
                y: sg.y,
                w: sg.w,
                h: sg.h,
                facing: sg.facing,
                state: sg.state,
                hasKey: sg.hasKey,
                keyX: sg.keyX,
                keyY: sg.keyY,
                caughtIds: sg.caughtIds
            });
        }

        // 15. Cập nhật Quái gai trong Ống cống xanh (World 7 - Màn 7-3)
        if (room.state.pipeEnemies && room.state.pipeEnemies.length > 0) {
            const elapsed = now - room.state.levelStartTime;
            room.state.pipeEnemies.forEach(pe => {
                const phase = elapsed % pe.cycleMs;
                const transition = 320;
                if (phase < transition) {
                    pe.monsterOffset = (phase / transition) * pe.monsterH;
                } else if (phase < pe.upDuration) {
                    pe.monsterOffset = pe.monsterH;
                } else if (phase < pe.upDuration + transition) {
                    pe.monsterOffset = (1 - (phase - pe.upDuration) / transition) * pe.monsterH;
                } else {
                    pe.monsterOffset = 0;
                }
            });
            io.to(pass).emit('pipeEnemiesSync', room.state.pipeEnemies);
        }

        // 16. Cập nhật Thanh Năng Lượng Di Chuyển (World 7 - Màn 7-4)
        if (room.state.moveGauge && room.state.moveGauge.enabled) {
            const mg = room.state.moveGauge;
            const dt = (now - mg.lastTick) / 1000;
            mg.lastTick = now;

            if (!mg.depleted) {
                const anyMoving = players.some(p => Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.6);
                const prevVal = mg.value;

                if (anyMoving) {
                    mg.value = Math.max(0, mg.value - mg.drainRate * dt);
                } else {
                    mg.value = Math.min(mg.max, mg.value + mg.regenRate * dt);
                }

                if (mg.value <= 0) {
                    mg.value = 0;
                    mg.depleted = true;
                    io.to(pass).emit('moveGaugeSync', {
                        enabled: true,
                        value: 0,
                        max: mg.max,
                        depleted: true
                    });
                    if (!mg.restarting) {
                        mg.restarting = true;
                        setTimeout(() => {
                            if (rooms[pass] && rooms[pass].state && rooms[pass].state.moveGauge && rooms[pass].state.moveGauge.restarting) {
                                startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                            }
                        }, 1100);
                    }
                } else if (Math.abs(mg.value - prevVal) > 0.05) {
                    io.to(pass).emit('moveGaugeSync', {
                        enabled: true,
                        value: Number(mg.value.toFixed(1)),
                        max: mg.max,
                        depleted: false
                    });
                }
            }
        }

        // 17. Cập nhật Xếp gạch Tetris đồng đội (World 8 - Màn 8-1 & 8-3)
        if (room.state.tetris && room.state.tetris.enabled && room.state.tetris.status === 'playing') {
            const t = room.state.tetris;
            if (now - t.lastDrop >= t.dropIntervalMs) {
                t.lastDrop = now;
                const pieceIds = Object.keys(t.pieces);
                for (const pid of pieceIds) {
                    if (t.status !== 'playing') break;
                    const piece = t.pieces[pid];
                    if (!piece) continue;
                    if (canPlaceTetrisGrid(t, piece.shape, piece.x, piece.y + 1)) {
                        if (!overlapsOtherTetrisPiece(t, piece.shape, piece.x, piece.y + 1, pid)) {
                            piece.y += 1;
                        }
                    } else {
                        lockTetrisPiece(room, pass, pid);
                    }
                }
                if (t.status === 'playing') {
                    io.to(pass).emit('tetrisSync', serializeTetris(t));
                }
            }
        }

        // 18. Cập nhật Bắn bóng phá gạch Breakout (World 8 - Màn 8-2 & 8-4)
        if (room.state.breakout && room.state.breakout.enabled && !room.state.breakout.failed) {
            const b = room.state.breakout;
            const area = b.area;
            const subSteps = 2;
            const extraBallsToAdd = [];

            const breakBrick = (br) => {
                br.broken = true;
                if (br.special === 'multiBall') {
                    const count = br.extraBalls || 2;
                    for (let k = 0; k < count; k++) {
                        const spread = count === 1 ? 0.5 : (k / (count - 1));
                        const angle = Math.PI * (0.28 + spread * 0.44) + (Math.random() - 0.5) * 0.14;
                        const spd = b.ballSpeed || 6.0;
                        extraBallsToAdd.push({
                            id: `ball_ex_${now}_${k}_${Math.floor(Math.random() * 1000)}`,
                            x: br.x + br.w / 2,
                            y: br.y + br.h + b.ballRadius + 2,
                            vx: Math.cos(angle) * spd,
                            vy: Math.max(2.5, Math.abs(Math.sin(angle) * spd)),
                            r: b.ballRadius,
                            speed: spd,
                            active: true,
                            alive: true,
                            hitCooldown: now + 120
                        });
                    }
                }
            };

            b.balls.forEach(ball => {
                if (!ball.alive) return;

                if (!ball.active) {
                    for (const p of players) {
                        const helmetBox = { x: p.x - 6, y: p.y - 12, w: 48, h: 24 };
                        if (circleRectOverlap(ball.x, ball.y, ball.r, helmetBox)) {
                            ball.active = true;
                            const rel = Math.max(-0.8, Math.min(0.8, (ball.x - (p.x + 18)) / 24));
                            let vx = rel * ball.speed * 0.72 + (p.vx || 0) * 0.25;
                            if (Math.abs(vx) < 0.7) vx = (Math.random() < 0.5 ? -1 : 1) * 1.1;
                            const maxVx = ball.speed * 0.82;
                            vx = Math.max(-maxVx, Math.min(maxVx, vx));
                            ball.vx = vx;
                            ball.vy = -Math.sqrt(Math.max(4, ball.speed * ball.speed - vx * vx));
                            ball.y = p.y - 12 - ball.r;
                            ball.hitCooldown = now + 90;
                            break;
                        }
                    }
                    return;
                }

                for (let s = 0; s < subSteps; s++) {
                    if (!ball.alive) break;
                    const stepVx = ball.vx / subSteps;
                    const stepVy = ball.vy / subSteps;

                    ball.x += stepVx;
                    if (ball.x - ball.r < area.x) {
                        ball.x = area.x + ball.r;
                        ball.vx = Math.abs(ball.vx);
                    } else if (ball.x + ball.r > area.x + area.w) {
                        ball.x = area.x + area.w - ball.r;
                        ball.vx = -Math.abs(ball.vx);
                    }

                    for (const bp of (b.bumpers || [])) {
                        if (circleRectOverlap(ball.x, ball.y, ball.r, bp)) {
                            if (stepVx > 0) ball.x = bp.x - ball.r - 0.5;
                            else if (stepVx < 0) ball.x = bp.x + bp.w + ball.r + 0.5;
                            ball.vx = -ball.vx;
                            break;
                        }
                    }

                    for (const br of b.bricks) {
                        if (br.broken) continue;
                        if (circleRectOverlap(ball.x, ball.y, ball.r, br)) {
                            breakBrick(br);
                            ball.vx = -ball.vx;
                            break;
                        }
                    }

                    ball.y += stepVy;
                    if (ball.y - ball.r < area.y) {
                        ball.y = area.y + ball.r;
                        ball.vy = Math.abs(ball.vy);
                    }

                    for (const bp of (b.bumpers || [])) {
                        if (circleRectOverlap(ball.x, ball.y, ball.r, bp)) {
                            if (stepVy > 0) ball.y = bp.y - ball.r - 0.5;
                            else if (stepVy < 0) ball.y = bp.y + bp.h + ball.r + 0.5;
                            ball.vy = -ball.vy;
                            break;
                        }
                    }

                    for (const br of b.bricks) {
                        if (br.broken) continue;
                        if (circleRectOverlap(ball.x, ball.y, ball.r, br)) {
                            breakBrick(br);
                            ball.vy = -ball.vy;
                            break;
                        }
                    }

                    if (now >= (ball.hitCooldown || 0)) {
                        for (const p of players) {
                            const helmetBox = { x: p.x - 6, y: p.y - 12, w: 48, h: 18 };
                            if ((ball.vy > 0 || (p.vy && p.vy < 0)) && circleRectOverlap(ball.x, ball.y, ball.r, helmetBox)) {
                                const rel = Math.max(-0.85, Math.min(0.85, (ball.x - (p.x + 18)) / 26));
                                let vx = rel * ball.speed * 0.8 + (p.vx || 0) * 0.25;
                                const maxVx = ball.speed * 0.85;
                                vx = Math.max(-maxVx, Math.min(maxVx, vx));
                                ball.vx = vx;
                                ball.vy = -Math.sqrt(Math.max(4, ball.speed * ball.speed - vx * vx));
                                ball.y = p.y - 12 - ball.r;
                                ball.hitCooldown = now + 90;
                                break;
                            }
                        }
                    }

                    if (ball.y + ball.r >= area.y + area.h) {
                        if (b.cleared) {
                            ball.y = area.y + area.h - ball.r;
                            ball.vy = -Math.abs(ball.vy);
                        } else {
                            ball.alive = false;
                        }
                    }
                }
            });

            if (extraBallsToAdd.length > 0) {
                b.balls.push(...extraBallsToAdd);
            }

            if (!b.cleared && b.bricks.every(br => br.broken)) {
                b.cleared = true;
                room.state.keyVisible = true;
            }

            if (!b.cleared && b.balls.every(ball => !ball.alive)) {
                b.failed = true;
                if (!b.restarting) {
                    b.restarting = true;
                    setTimeout(() => {
                        if (rooms[pass] && rooms[pass].state && rooms[pass].state.breakout && rooms[pass].state.breakout.restarting) {
                            startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                        }
                    }, 1200);
                }
            }

            io.to(pass).emit('breakoutSync', {
                enabled: b.enabled,
                area: b.area,
                bricks: b.bricks,
                bumpers: b.bumpers,
                balls: b.balls,
                cleared: b.cleared,
                failed: b.failed
            });
        }

        // 19. Ổ cắm cập nhật riêng cho World 9 - 12 (server_extra.js)
        if (serverExtra && serverExtra.updateRoom) {
            serverExtra.updateRoom(room, pass, players, totalPlayers, now, {
                io, rooms, startLevelForRoom, getCatBox, rectOverlap, circleRectOverlap, getRequiredCount
            });
        }
    }
}, 33);

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ playerName, roomPass, maxPlayers }) => {
        const cleanName = (playerName || '').trim();
        const cleanPass = (roomPass || '').trim().toUpperCase();

        if (!cleanName || !cleanPass) {
            socket.emit('joinError', 'Vui lòng nhập đầy đủ Tên nhân vật và Mã phòng!');
            return;
        }

        if (!rooms[cleanPass]) {
            rooms[cleanPass] = {
                pass: cleanPass,
                maxPlayers: Number(maxPlayers) || 2,
                hostId: socket.id,
                world: null,
                level: null,
                levelData: LOBBY_LEVEL,
                state: createLobbyState(),
                players: {}
            };
        }

        const room = rooms[cleanPass];
        const currentCount = Object.keys(room.players).length;

        if (currentCount >= room.maxPlayers) {
            socket.emit('joinError', `Phòng đã đầy (${currentCount}/${room.maxPlayers} người)!`);
            return;
        }

        const usedFills = Object.values(room.players).map(p => p.color.fill);
        const catColor = CAT_COLORS.find(c => !usedFills.includes(c.fill)) || CAT_COLORS[0];

        room.players[socket.id] = {
            id: socket.id,
            name: cleanName,
            color: catColor,
            x: 100 + currentCount * 42,
            y: 360,
            vx: 0,
            vy: 0,
            facing: 1,
            scale: 1,
            enteredDoor: false
        };

        socket.join(cleanPass);
        socket.roomPass = cleanPass;

        socket.emit('joinedSuccess', { roomPass: cleanPass, myId: socket.id });
        io.to(cleanPass).emit('roomUpdate', room);
        socket.emit('levelLoaded', {
            world: room.world,
            level: room.level,
            levelData: room.levelData,
            roomState: room.state,
            players: room.players
        });
    });

    socket.on('selectLevel', ({ world, level }) => {
        const pass = socket.roomPass;
        if (pass && rooms[pass]) startLevelForRoom(rooms[pass], world, level);
    });

    socket.on('restartLevel', () => {
        const pass = socket.roomPass;
        if (pass && rooms[pass] && rooms[pass].world && rooms[pass].level) {
            startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
        }
    });

    socket.on('playerMove', ({ x, y, vx, vy, facing, scale }) => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (room && room.players[socket.id]) {
            const p = room.players[socket.id];
            p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.facing = facing;
            p.scale = scale || 1;
            socket.to(pass).emit('playerMoved', { id: socket.id, x, y, vx, vy, facing, scale: p.scale });
        }
    });

    socket.on('tetrisInput', ({ action }) => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (!room || !room.state || !room.state.tetris || room.state.tetris.status !== 'playing') return;

        const t = room.state.tetris;
        const piece = t.pieces[socket.id];
        if (!piece) return;

        let changed = false;
        if (action === 'left') {
            if (canPlaceTetrisGrid(t, piece.shape, piece.x - 1, piece.y) &&
                !overlapsOtherTetrisPiece(t, piece.shape, piece.x - 1, piece.y, socket.id)) {
                piece.x -= 1;
                changed = true;
            }
        } else if (action === 'right') {
            if (canPlaceTetrisGrid(t, piece.shape, piece.x + 1, piece.y) &&
                !overlapsOtherTetrisPiece(t, piece.shape, piece.x + 1, piece.y, socket.id)) {
                piece.x += 1;
                changed = true;
            }
        } else if (action === 'rotate') {
            const rotated = rotateMatrix(piece.shape);
            const kicks = [0, -1, 1, -2, 2];
            for (const dx of kicks) {
                if (canPlaceTetrisGrid(t, rotated, piece.x + dx, piece.y) &&
                    !overlapsOtherTetrisPiece(t, rotated, piece.x + dx, piece.y, socket.id)) {
                    piece.shape = rotated;
                    piece.x += dx;
                    changed = true;
                    break;
                }
            }
        } else if (action === 'down') {
            if (canPlaceTetrisGrid(t, piece.shape, piece.x, piece.y + 1)) {
                if (!overlapsOtherTetrisPiece(t, piece.shape, piece.x, piece.y + 1, socket.id)) {
                    piece.y += 1;
                    changed = true;
                }
            } else {
                lockTetrisPiece(room, pass, socket.id);
                if (t.status === 'playing') changed = true;
            }
        }

        if (changed && t.status === 'playing') {
            io.to(pass).emit('tetrisSync', serializeTetris(t));
        }
    });

    socket.on('pickupKey', () => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (room && room.state && room.state.keyVisible && !room.state.keyHolder && !room.state.doorUnlocked) {
            room.state.keyHolder = socket.id;
            if (room.state.shyGhost && room.state.shyGhost.hasKey) {
                room.state.shyGhost.hasKey = false;
                io.to(pass).emit('shyGhostSync', room.state.shyGhost);
            }
            io.to(pass).emit('keyUpdated', { keyHolder: socket.id, doorUnlocked: false });
        }
    });

    socket.on('unlockDoor', () => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (room && room.state && room.state.keyHolder === socket.id && !room.state.doorUnlocked) {
            room.state.doorUnlocked = true;
            room.state.keyHolder = null;
            io.to(pass).emit('keyUpdated', { keyHolder: null, doorUnlocked: true });
        }
    });

    socket.on('enterDoor', () => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (room && room.state && room.state.doorUnlocked && !room.state.timeUp && room.players[socket.id]) {
            room.players[socket.id].enteredDoor = true;
            io.to(pass).emit('playerEnteredDoor', socket.id);

            const allEntered = Object.values(room.players).every(p => p.enteredDoor);
            if (allEntered && !room.state.cleared) {
                room.state.cleared = true;
                io.to(pass).emit('levelCleared');

                setTimeout(() => {
                    if (!rooms[pass]) return;
                    const w = Number(room.world);
                    const l = Number(room.level);
                    let moved = false;
                    if (l < 4) moved = startLevelForRoom(room, String(w), String(l + 1));
                    if (!moved) moved = startLevelForRoom(room, String(w + 1), '1');
                    if (!moved) io.to(pass).emit('noNextLevel');
                }, 2000);
            }
        }
    });

    // Ổ cắm nhận phím đặc biệt cho World 9 - 12 (server_extra.js)
    if (serverExtra && serverExtra.registerSocket) {
        serverExtra.registerSocket(socket, {
            io, rooms, startLevelForRoom, getCatBox, rectOverlap, circleRectOverlap
        });
    }

    socket.on('disconnect', () => {
        const pass = socket.roomPass;
        if (pass && rooms[pass] && rooms[pass].players[socket.id]) {
            if (rooms[pass].state && rooms[pass].state.keyHolder === socket.id) {
                rooms[pass].state.keyHolder = null;
                io.to(pass).emit('keyUpdated', { keyHolder: null, doorUnlocked: rooms[pass].state.doorUnlocked });
            }
            if (rooms[pass].state && rooms[pass].state.tetris && rooms[pass].state.tetris.pieces) {
                delete rooms[pass].state.tetris.pieces[socket.id];
            }
            delete rooms[pass].players[socket.id];
            const remainingIds = Object.keys(rooms[pass].players);
            if (remainingIds.length === 0) {
                delete rooms[pass];
            } else {
                if (rooms[pass].hostId === socket.id) rooms[pass].hostId = remainingIds[0];
                io.to(pass).emit('roomUpdate', rooms[pass]);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`MIKU GO TOGETHER dang chay tai: http://localhost:${PORT}`);
});