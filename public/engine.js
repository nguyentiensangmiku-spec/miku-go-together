window.GameEngine = (function () {
    const CAT_W = 36;
    const CAT_H = 39;
    const GRAVITY = 0.55;
    const MOVE_SPEED = 4.2;
    const JUMP_FORCE = -11.5;
    const SCALE_STEPS = [0.45, 0.72, 1.0, 1.65, 2.35, 3.0];
    const CAM_MARGIN = 6;

    let canvas, ctx, socket, myId;
    let levelData = null;
    let roomState = null;
    let players = {};
    let cameraX = 0;
    let cameraZoom = 1;
    let animId = null;
    let keys = {};
    let levelStartClientTime = 0;

    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            if (levelData) e.preventDefault();
        }

        if (levelData && roomState && roomState.tetris && roomState.tetris.enabled && roomState.tetris.status === 'playing' && socket) {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                socket.emit('tetrisInput', { action: 'left' });
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                socket.emit('tetrisInput', { action: 'right' });
            } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                socket.emit('tetrisInput', { action: 'down' });
            } else if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !e.repeat) {
                socket.emit('tetrisInput', { action: 'rotate' });
            }
        }

        // Ổ cắm phím bấm cho World 9 - 12 (engine_extra.js)
        if (levelData && window.GameEngineExtra && window.GameEngineExtra.onKeyDown) {
            window.GameEngineExtra.onKeyDown(e, { levelData, roomState, players, myId, socket });
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
        if (levelData && window.GameEngineExtra && window.GameEngineExtra.onKeyUp) {
            window.GameEngineExtra.onKeyUp(e, { levelData, roomState, players, myId, socket });
        }
    });

    function init(canvasEl, socketInstance, playerId) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        socket = socketInstance;
        myId = playerId;
    }

    function start(newLevelData, newRoomState, newPlayers) {
        levelData = newLevelData;
        roomState = newRoomState;
        players = newPlayers;
        cameraX = (newRoomState && newRoomState.scrollX) || 0;
        cameraZoom = 1;
        levelStartClientTime = Date.now();
        updateSharedCamera(true);
        if (window.GameEngineExtra && window.GameEngineExtra.onStart) {
            window.GameEngineExtra.onStart({ levelData, roomState, players, myId });
        }
        if (animId) cancelAnimationFrame(animId);
        loop();
    }

    function stop() {
        levelData = null;
        if (animId) cancelAnimationFrame(animId);
    }

    function getContext() {
        return { levelData, roomState, players, myId };
    }

    function getCatSize(p) {
        const s = (p && p.scale) || 1;
        return { w: Math.round(CAT_W * s), h: Math.round(CAT_H * s) };
    }

    // Giới hạn phạm vi đi ngang để cả phòng không tách xa nhau quá 1 khung hình chung
    function getSharedHorizontalBounds(myW, prevX) {
        let minX = 0;
        let maxX = levelData.width - myW;

        // Màn bật dynamicCamera cho phép đi tự do toàn bản đồ, camera sẽ tự thu nhỏ theo
        if (levelData.dynamicCamera) {
            return { minX, maxX };
        }

        if (levelData.autoScroll && levelData.autoScroll.enabled) {
            minX = cameraX + 4;
            maxX = cameraX + canvas.width - myW - 4;
            return { minX, maxX };
        }

        if (levelData.width > canvas.width) {
            const others = Object.values(players).filter(p => p.id !== myId && !p.enteredDoor);
            if (others.length > 0) {
                const maxSpan = canvas.width - CAM_MARGIN * 2;
                let othersMinX = Infinity;
                let othersMaxX = -Infinity;
                others.forEach(o => {
                    const oSize = getCatSize(o);
                    if (o.x < othersMinX) othersMinX = o.x;
                    if (o.x + oSize.w > othersMaxX) othersMaxX = o.x + oSize.w;
                });

                const sharedMinX = othersMaxX - maxSpan;
                const sharedMaxX = othersMinX + maxSpan - myW;
                const refX = (prevX !== undefined) ? prevX : 0;

                minX = Math.max(minX, Math.min(refX, sharedMinX));
                maxX = Math.min(maxX, Math.max(refX, sharedMaxX));
            }
        }

        return { minX, maxX };
    }

    // Khung hình chung cho tất cả người chơi đang ở ngoài cửa (hỗ trợ tự thu phóng khi bật dynamicCamera)
    function updateSharedCamera(instant = false) {
        if (!levelData || !canvas) return;

        if (levelData.dynamicCamera) {
            const activePlayers = Object.values(players).filter(p => !p.enteredDoor);
            if (activePlayers.length === 0) return;

            let minX = Infinity;
            let maxX = -Infinity;
            activePlayers.forEach(p => {
                const { w } = getCatSize(p);
                if (p.x < minX) minX = p.x;
                if (p.x + w > maxX) maxX = p.x + w;
            });

            const padX = 130; // Chừa khoảng thoáng 2 bên mép màn hình
            const minZoom = Math.min(1, canvas.width / Math.max(canvas.width, levelData.width));
            const spanX = (maxX - minX) + padX * 2;
            const desiredZoom = Math.max(minZoom, Math.min(1, canvas.width / spanX));

            cameraZoom = instant
                ? desiredZoom
                : cameraZoom + (desiredZoom - cameraZoom) * 0.12;

            const viewW = canvas.width / cameraZoom;
            const maxCam = Math.max(0, levelData.width - viewW);
            const groupCenter = (minX + maxX) / 2;
            const desiredCam = Math.max(0, Math.min(maxCam, groupCenter - viewW / 2));

            if (instant) {
                cameraX = desiredCam;
            } else {
                cameraX += (desiredCam - cameraX) * 0.16;
                cameraX = Math.max(0, Math.min(maxCam, cameraX));
            }
            return;
        }

        cameraZoom = 1;

        if (levelData.autoScroll && levelData.autoScroll.enabled) {
            const targetScroll = (roomState && roomState.scrollX) || 0;
            cameraX = instant ? targetScroll : cameraX + (targetScroll - cameraX) * 0.35;
            return;
        }

        const maxCam = Math.max(0, levelData.width - canvas.width);
        if (maxCam <= 0) {
            cameraX = 0;
            return;
        }

        const activePlayers = Object.values(players).filter(p => !p.enteredDoor);
        if (activePlayers.length === 0) return;

        let minX = Infinity;
        let maxX = -Infinity;
        activePlayers.forEach(p => {
            const { w } = getCatSize(p);
            if (p.x < minX) minX = p.x;
            if (p.x + w > maxX) maxX = p.x + w;
        });

        const groupCenter = (minX + maxX) / 2;
        let desiredCam = groupCenter - canvas.width / 2;

        const allowedMinCam = Math.max(0, maxX - canvas.width + CAM_MARGIN);
        const allowedMaxCam = Math.min(maxCam, minX - CAM_MARGIN);

        if (allowedMinCam <= allowedMaxCam) {
            desiredCam = Math.max(allowedMinCam, Math.min(allowedMaxCam, desiredCam));
        } else {
            desiredCam = Math.max(0, Math.min(maxCam, desiredCam));
        }

        if (instant) {
            cameraX = desiredCam;
        } else {
            cameraX += (desiredCam - cameraX) * 0.14;
            if (allowedMinCam <= allowedMaxCam) {
                cameraX = Math.max(allowedMinCam, Math.min(allowedMaxCam, cameraX));
            } else {
                cameraX = Math.max(0, Math.min(maxCam, cameraX));
            }
        }
    }

    function updatePlayerPosition(data) {
        const o = players[data.id];
        if (!o) return;

        const oldX = o.x;
        const oldY = o.y;
        const oldSize = getCatSize(o);

        Object.assign(o, data);

        // Vật lý đứng trên đầu đồng đội: người dưới di chuyển thì người trên tự động đi theo & đồng bộ ngay lập tức
        const me = players[myId];
        if (!levelData || levelData.flyMode || !me || me.enteredDoor || data.id === myId || o.enteredDoor) return;
        if (roomState && (roomState.cleared || roomState.timeUp)) return;
        if (roomState && roomState.tetris && roomState.tetris.enabled && roomState.tetris.status !== 'ok') return;

        const dx = o.x - oldX;
        const dy = o.y - oldY;
        if ((Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) || Math.abs(dx) > 60 || Math.abs(dy) > 60) return;
        if (me.vy !== undefined && me.vy < -0.5) return;

        const { w: myW, h: myH } = getCatSize(me);
        const onTopHoriz = me.x + myW > oldX + 1 && me.x < oldX + oldSize.w - 1;
        const onTopVert = Math.abs((me.y + myH) - oldY) <= 12;
        if (!onTopHoriz || !onTopVert) return;

        const beforeX = me.x;
        const beforeY = me.y;
        const solids = getSolidRects();
        const isBreakout = Boolean(levelData.breakout && levelData.breakout.enabled);

        // 1. Kéo ngang theo người dưới (có chặn tường, đồng đội khác & biên khung hình chung)
        if (Math.abs(dx) >= 0.001) {
            const prevX = me.x;
            me.x += dx;

            const bounds = getSharedHorizontalBounds(myW, prevX);
            if (me.x < bounds.minX) me.x = bounds.minX;
            if (me.x > bounds.maxX) me.x = bounds.maxX;

            const boxX = { x: me.x, y: me.y, w: myW, h: myH };
            for (const s of solids) {
                if (s.isElevator) continue;
                if (rectOverlap(boxX, s)) {
                    if (dx > 0 && prevX + myW <= s.x + 12) {
                        me.x = s.x - myW;
                    } else if (dx < 0 && prevX >= s.x + s.w - 12) {
                        me.x = s.x + s.w;
                    }
                    boxX.x = me.x;
                }
            }

            if (!isBreakout) {
                const otherCats = Object.values(players).filter(p => p.id !== myId && p.id !== data.id && !p.enteredDoor);
                for (const oc of otherCats) {
                    const ocSize = getCatSize(oc);
                    if (me.y + myH > oc.y + 8 && me.y < oc.y + ocSize.h - 8) {
                        const ocBox = { x: oc.x, y: oc.y, w: ocSize.w, h: ocSize.h };
                        if (rectOverlap(boxX, ocBox)) {
                            if (dx > 0) me.x = oc.x - myW;
                            else if (dx < 0) me.x = oc.x + ocSize.w;
                            boxX.x = me.x;
                        }
                    }
                }
            }
        }

        // 2. Kéo dọc theo người dưới (khi đi thang máy, thanh di động hoặc rơi xuống bậc)
        if (dy < 0 || (dy > 0 && dy <= 16)) {
            const prevTop = me.y;
            const prevBottom = me.y + myH;
            me.y += dy;

            const boxY = { x: me.x, y: me.y, w: myW, h: myH };
            for (const s of solids) {
                if (rectOverlap(boxY, s)) {
                    if (dy < 0 && !s.isElevator && prevTop >= s.y + s.h - 14) {
                        me.y = s.y + s.h;
                    } else if (dy > 0 && prevBottom <= s.y + 16) {
                        me.y = s.y - myH;
                    }
                    boxY.y = me.y;
                }
            }
        }

        // Gửi ngay vị trí mới về Server để tab mèo dưới (và người thứ 3 xếp chồng) nhận được tức thì
        if (socket && (Math.abs(me.x - beforeX) > 0.001 || Math.abs(me.y - beforeY) > 0.001)) {
            socket.emit('playerMove', {
                x: me.x,
                y: me.y,
                vx: me.vx || 0,
                vy: me.vy || 0,
                facing: me.facing || 1,
                scale: me.scale || 1
            });
        }
    }

    function updateKey({ keyHolder, doorUnlocked }) {
        if (roomState) {
            roomState.keyHolder = keyHolder;
            roomState.doorUnlocked = doorUnlocked;
        }
    }

    function updateElevators(newElevs) {
        if (!roomState) return;
        const oldElevs = roomState.elevators || [];
        const me = players[myId];

        if (me && !me.enteredDoor) {
            const { w: myW, h: myH } = getCatSize(me);
            newElevs.forEach((ne, idx) => {
                const oe = oldElevs[idx];
                if (!oe) return;
                const dy = ne.y - oe.y;
                if (dy === 0) return;

                const fullyOnElev = me.x >= oe.x && me.x + myW <= oe.x + oe.w;
                const onTopHoriz = dy < 0
                    ? (me.x + myW > oe.x + 2 && me.x < oe.x + oe.w - 2)
                    : fullyOnElev;
                const onTopVert = Math.abs((me.y + myH) - oe.y) <= 10;
                if (onTopHoriz && onTopVert) me.y += dy;
            });
        }
        roomState.elevators = newElevs;
    }

    function updateMovingPlatforms(newMovs) {
        if (!roomState) return;
        const oldMovs = roomState.movingPlatforms || [];
        const me = players[myId];

        if (me && !me.enteredDoor) {
            const { w: myW, h: myH } = getCatSize(me);
            newMovs.forEach((nm, idx) => {
                const om = oldMovs[idx];
                if (!om) return;
                const dx = nm.x - om.x;
                const dy = nm.y - om.y;

                const onTopHoriz = me.x + myW > om.x + 2 && me.x < om.x + om.w - 2;
                const onTopVert = Math.abs((me.y + myH) - om.y) <= 10;
                if (onTopHoriz && onTopVert) {
                    me.x += dx;
                    me.y += dy;
                }

                if (dx !== 0) {
                    const vertOverlap = me.y + myH > nm.y + 4 && me.y < nm.y + nm.h - 4;
                    const horizOverlap = me.x < nm.x + nm.w && me.x + myW > nm.x;
                    if (vertOverlap && horizOverlap) {
                        if (dx > 0) me.x = nm.x + nm.w;
                        else me.x = nm.x - myW;
                    }
                }
            });
        }
        roomState.movingPlatforms = newMovs;
    }

    function updateColorBlocks(newBlocks) {
        if (!roomState) return;
        const oldBlocks = roomState.colorBlocks || [];
        const me = players[myId];

        if (me && !me.enteredDoor) {
            const { w: myW, h: myH } = getCatSize(me);
            newBlocks.forEach((nb, idx) => {
                const ob = oldBlocks[idx];
                if (!ob) return;
                const dx = nb.x - ob.x;
                const dy = nb.y - ob.y;
                if (dx === 0 && dy === 0) return;

                const onTopHoriz = me.x + myW > ob.x + 2 && me.x < ob.x + ob.w - 2;
                const onTopVert = Math.abs((me.y + myH) - ob.y) <= 10;
                if (onTopHoriz && onTopVert) {
                    me.x += dx;
                    me.y += dy;
                }
            });
        }
        roomState.colorBlocks = newBlocks;
    }

    function updateGhost(ghostData) {
        if (roomState) roomState.ghost = ghostData;
    }

    function updateTrafficLight(tlData) {
        if (roomState) roomState.trafficLight = tlData;
    }

    function updateEnemies(newEnemies) {
        if (roomState) roomState.enemies = newEnemies;
    }

    function updateShyGhost(sgData) {
        if (roomState) roomState.shyGhost = sgData;
    }

    function updatePipeEnemies(pes) {
        if (roomState) roomState.pipeEnemies = pes;
    }

    function updateMoveGauge(mgData) {
        if (roomState) roomState.moveGauge = mgData;
    }

    function updateTetris(tData) {
        if (roomState) {
            roomState.tetris = tData;
            if (tData && tData.status === 'ok') {
                roomState.doorUnlocked = true;
            }
        }
    }

    function updateBreakout(bData) {
        if (roomState) {
            roomState.breakout = bData;
            if (bData && bData.cleared) {
                roomState.keyVisible = true;
            }
        }
    }

    function updateBlocks(newBlocks) {
        if (roomState) roomState.pushBlocks = newBlocks;
    }

    function updateGates({ buttons, gates }) {
        if (roomState) {
            roomState.buttons = buttons;
            roomState.gates = gates;
        }
    }

    function updateCrumblingBlocks(newBlocks) {
        if (roomState) roomState.crumblingBlocks = newBlocks;
    }

    function updateCoins({ coins, keyVisible }) {
        if (roomState) {
            roomState.coins = coins;
            roomState.keyVisible = keyVisible;
        }
    }

    function updateTimer(timeLeft) {
        if (roomState) roomState.timeLeft = timeLeft;
    }

    function updateScroll(scrollX) {
        if (roomState) roomState.scrollX = scrollX;
    }

    function updateCountdown(cp) {
        if (roomState) {
            roomState.countdownPuzzle = cp;
            if (cp && cp.status === 'success') {
                roomState.keyVisible = true;
            }
        }
    }

    function markTimeUp() {
        if (roomState) roomState.timeUp = true;
    }

    function markEnteredDoor(id) {
        if (players[id]) players[id].enteredDoor = true;
    }

    function markCleared() {
        if (roomState) roomState.cleared = true;
    }

    function formatSec(val) {
        const v = Math.max(0, Number(val) || 0);
        const whole = Math.floor(v);
        const frac = Math.floor((v - whole) * 100);
        return `${String(whole).padStart(2, '0')}.${String(frac).padStart(2, '0')}`;
    }

    function getActiveRopeOrder() {
        const order = (roomState && roomState.playerOrder) ? roomState.playerOrder : Object.keys(players);
        return order.filter(id => players[id] && !players[id].enteredDoor);
    }

    function getLaserBeam(laser) {
        const activePlayers = Object.values(players).filter(p => !p.enteredDoor);

        if (laser.dir === 'down') {
            let endY = laser.y + laser.maxLen;
            for (const p of activePlayers) {
                if (p.shield === 'top' || p.shield === 'both') {
                    const { w: pw } = getCatSize(p);
                    const sx = p.x - 12;
                    const sw = pw + 24;
                    const sy = p.y - 12;
                    if (laser.x >= sx && laser.x <= sx + sw && sy >= laser.y && sy < endY) {
                        endY = sy;
                    }
                }
            }
            return { x: laser.x - 4, y: laser.y, w: 8, h: Math.max(0, endY - laser.y), endX: laser.x, endY };
        }

        if (laser.dir === 'left') {
            let endX = laser.x - laser.maxLen;
            for (const p of activePlayers) {
                if (p.shield === 'right' || p.shield === 'both') {
                    const { w: pw, h: ph } = getCatSize(p);
                    const sx = p.x + pw + 6;
                    const sy = p.y - 8;
                    const sh = ph + 12;
                    if (laser.y >= sy && laser.y <= sy + sh && sx <= laser.x && sx + 6 > endX) {
                        endX = sx + 6;
                    }
                }
            }
            return { x: endX, y: laser.y - 4, w: Math.max(0, laser.x - endX), h: 8, endX, endY: laser.y };
        }

        return { x: laser.x, y: laser.y, w: 0, h: 0, endX: laser.x, endY: laser.y };
    }

    function getSolidRects() {
        const rects = [...(levelData.platforms || [])];
        if (roomState && roomState.elevators) {
            roomState.elevators.forEach(e => {
                rects.push({ x: e.x, y: e.y, w: e.w, h: e.h, isElevator: true });
            });
        }
        if (roomState && roomState.movingPlatforms) {
            roomState.movingPlatforms.forEach(m => {
                rects.push({
                    x: m.x, y: m.y, w: m.w, h: m.h,
                    isElevator: m.speedY !== 0 && !m.speedX
                });
            });
        }
        if (roomState && roomState.pushBlocks) {
            roomState.pushBlocks.forEach(b => {
                if (b.fallen && b.y >= 490) return;
                rects.push({ x: b.x, y: b.y, w: b.w, h: b.h, isPushBlock: true });
            });
        }
        if (roomState && roomState.colorBlocks) {
            roomState.colorBlocks.forEach(cb => {
                rects.push({ x: cb.x, y: cb.y, w: cb.w, h: cb.h, isColorBlock: true });
            });
        }
        if (roomState && roomState.gates) {
            roomState.gates.forEach(g => {
                if (g.openOnKey && g.y >= g.openY) return;
                rects.push({ x: g.x, y: g.y, w: g.w, h: g.h, isGate: true });
            });
        }
        if (roomState && roomState.crumblingBlocks) {
            roomState.crumblingBlocks.forEach(cb => {
                if (!cb.broken) {
                    rects.push({ x: cb.x, y: cb.y, w: cb.w, h: cb.h, isCrumbling: true });
                }
            });
        }
        if (roomState && roomState.pipeEnemies) {
            roomState.pipeEnemies.forEach(pe => {
                rects.push({ x: pe.x, y: pe.y, w: pe.w, h: pe.h, isPipe: true });
            });
        }
        // Ổ cắm tường/khối chắn riêng cho World 9 - 12 (engine_extra.js)
        if (window.GameEngineExtra && window.GameEngineExtra.getExtraSolids) {
            const extraSolids = window.GameEngineExtra.getExtraSolids({ levelData, roomState });
            if (extraSolids && extraSolids.length) rects.push(...extraSolids);
        }
        return rects;
    }

    function rectOverlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function tryChangeScale(me, dir, solids) {
        const curScale = me.scale || 1;
        let closestIdx = 0;
        let minDiff = 999;
        SCALE_STEPS.forEach((s, i) => {
            const d = Math.abs(s - curScale);
            if (d < minDiff) { minDiff = d; closestIdx = i; }
        });

        const nextIdx = Math.max(0, Math.min(SCALE_STEPS.length - 1, closestIdx + dir));
        if (nextIdx === closestIdx) return;

        const nextScale = SCALE_STEPS[nextIdx];
        const oldW = Math.round(CAT_W * curScale);
        const oldH = Math.round(CAT_H * curScale);
        const newW = Math.round(CAT_W * nextScale);
        const newH = Math.round(CAT_H * nextScale);

        const nextX = me.x - (newW - oldW) / 2;
        const nextY = me.y - (newH - oldH);

        if (dir > 0) {
            const testBox = { x: nextX + 2, y: nextY + 2, w: newW - 4, h: newH - 4 };
            if (solids.some(s => rectOverlap(testBox, s))) return;
        }

        me.x = nextX;
        me.y = nextY;
        me.scale = nextScale;
    }

    function updatePhysics() {
        const me = players[myId];
        if (!me || me.enteredDoor || roomState.cleared || roomState.timeUp) return;
        if (roomState.ghost && roomState.ghost.state === 'attack') return;
        if (roomState.trafficLight && roomState.trafficLight.state === 'caught') return;
        if (roomState.shyGhost && roomState.shyGhost.state === 'caught') return;
        if (roomState.moveGauge && roomState.moveGauge.depleted) return;
        if (roomState.tetris && roomState.tetris.enabled && roomState.tetris.status !== 'ok') return;
        if (window.GameEngineExtra && window.GameEngineExtra.shouldLockPlayer &&
            window.GameEngineExtra.shouldLockPlayer({ levelData, roomState, me })) return;

        if (!me.scale) me.scale = 1;
        let { w: myW, h: myH } = getCatSize(me);

        const solids = getSolidRects();
        const others = Object.values(players).filter(p => p.id !== myId && !p.enteredDoor);
        const isBreakout = Boolean(levelData.breakout && levelData.breakout.enabled);

        // Kiểm tra có mèo nào đang đứng đè trên đầu không -> nếu có thì không cho nhảy
        const hasCatOnHead = !levelData.flyMode && others.some(o => {
            const oSize = getCatSize(o);
            const horizOverlap = me.x + myW > o.x + 3 && me.x < o.x + oSize.w - 3;
            const onMyHead = (o.y + oSize.h) <= me.y + 10 && (o.y + oSize.h) >= me.y - 8;
            return horizOverlap && onMyHead;
        });

        me.vx = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) {
            me.vx = -MOVE_SPEED;
            me.facing = -1;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            me.vx = MOVE_SPEED;
            me.facing = 1;
        }

        if (levelData.flyMode) {
            me.vy = 0;
            if (keys['ArrowUp'] || keys['KeyW']) me.vy = -MOVE_SPEED;
            if (keys['ArrowDown'] || keys['KeyS']) me.vy = MOVE_SPEED;
        } else {
            if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && me.onGround && !hasCatOnHead) {
                me.vy = JUMP_FORCE;
                me.onGround = false;
            }
            me.vy += GRAVITY;
            if (me.vy > 14) me.vy = 14;
        }

        if (levelData.rope && levelData.rope.enabled) {
            const activeIds = getActiveRopeOrder();
            const myIdx = activeIds.indexOf(myId);
            const maxDist = levelData.rope.maxDist || 145;
            const neighbors = [];
            if (myIdx > 0) neighbors.push(players[activeIds[myIdx - 1]]);
            if (myIdx >= 0 && myIdx < activeIds.length - 1) neighbors.push(players[activeIds[myIdx + 1]]);

            let hangingOnRope = false;
            neighbors.forEach(nb => {
                if (!nb) return;
                const dx = nb.x - me.x;
                const dy = nb.y - me.y;
                const dist = Math.hypot(dx, dy);

                if (dist > maxDist) {
                    const excess = dist - maxDist;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    me.vx += nx * Math.min(excess * 0.28, 6.5);
                    if (dy < -12) {
                        hangingOnRope = true;
                        me.vy += ny * Math.min(excess * 0.35, 8);
                        if (me.vy > 1.5) me.vy *= 0.65;
                    } else if (dy > 12) {
                        me.vy += ny * Math.min(excess * 0.12, 2.5);
                    }
                }
            });

            if (hangingOnRope && !me.onGround && (keys['ArrowUp'] || keys['KeyW'] || keys['Space'])) {
                if (me.vy > -3.5) me.vy = -5.5;
            }
        }

        // --- VA CHẠM TRỤC X (kèm giới hạn khung hình chung của cả phòng) ---
        const prevX = me.x;
        me.x += me.vx;

        const bounds = getSharedHorizontalBounds(myW, prevX);
        if (me.x < bounds.minX) me.x = bounds.minX;
        if (me.x > bounds.maxX) me.x = bounds.maxX;

        const myBoxX = { x: me.x, y: me.y, w: myW, h: myH };
        for (const s of solids) {
            if (s.isElevator) continue;
            if (rectOverlap(myBoxX, s)) {
                if (me.vx > 0 && prevX + myW <= s.x + 12) {
                    me.x = s.x - myW;
                } else if (me.vx < 0 && prevX >= s.x + s.w - 12) {
                    me.x = s.x + s.w;
                }
                myBoxX.x = me.x;
            }
        }

        if (!levelData.flyMode && !isBreakout) {
            for (const o of others) {
                const oSize = getCatSize(o);
                if (me.y + myH > o.y + 8 && me.y < o.y + oSize.h - 8) {
                    const oBox = { x: o.x, y: o.y, w: oSize.w, h: oSize.h };
                    if (rectOverlap(myBoxX, oBox)) {
                        if (me.vx > 0) me.x = o.x - myW;
                        else if (me.vx < 0) me.x = o.x + oSize.w;
                        myBoxX.x = me.x;
                    }
                }
            }
        }

        // --- VA CHẠM TRỤC Y ---
        const prevTop = me.y;
        const prevBottom = me.y + myH;
        me.y += me.vy;
        me.onGround = false;

        if (levelData.flyMode) {
            if (me.y < 4) me.y = 4;
            if (me.y + myH > levelData.height - 4) me.y = levelData.height - myH - 4;
        }

        const myBoxY = { x: me.x, y: me.y, w: myW, h: myH };
        for (const s of solids) {
            if (rectOverlap(myBoxY, s)) {
                const snapTolerance = s.isElevator ? 22 : 16;
                if (me.vy >= 0 && prevBottom <= s.y + snapTolerance) {
                    me.y = s.y - myH;
                    me.vy = 0;
                    me.onGround = true;
                } else if (me.vy < 0 && !s.isElevator && prevTop >= s.y + s.h - 14) {
                    me.y = s.y + s.h;
                    me.vy = 0;
                }
                myBoxY.y = me.y;
            }
        }

        // Va chạm trục Y giữa các chú mèo: đứng trên đầu & chặn đụng đầu từ dưới lên
        if (!levelData.flyMode) {
            for (const o of others) {
                const oSize = getCatSize(o);
                const horizOverlap = me.x + myW > o.x + 3 && me.x < o.x + oSize.w - 3;
                if (!horizOverlap) continue;

                if (me.vy >= 0 && prevBottom <= o.y + 16 && me.y + myH >= o.y) {
                    me.y = o.y - myH;
                    me.vy = 0;
                    me.onGround = true;
                } else if (me.vy < 0 && prevTop >= o.y + oSize.h - 14 && me.y < o.y + oSize.h) {
                    me.y = o.y + oSize.h;
                    me.vy = 0;
                }
            }

            const footBox = { x: me.x + 2, y: me.y + myH - 6, w: myW - 4, h: 8 };
            for (const pad of (levelData.bouncePads || [])) {
                if (me.vy >= 0 && rectOverlap(footBox, pad)) {
                    me.y = pad.y - myH;
                    me.vy = pad.force || -15.5;
                    me.onGround = false;
                    break;
                }
            }
        }

        if (levelData.sizeButtons && levelData.sizeButtons.length > 0) {
            const myFoot = { x: me.x + 2, y: me.y + myH - 8, w: Math.max(8, myW - 4), h: 10 };
            const hitSizeBtn = levelData.sizeButtons.find(sb => rectOverlap(myFoot, sb));
            if (hitSizeBtn) {
                if (!me.onSizeBtn) {
                    me.onSizeBtn = true;
                    tryChangeScale(me, hitSizeBtn.type === 'grow' ? 1 : -1, solids);
                    ({ w: myW, h: myH } = getCatSize(me));
                }
            } else {
                me.onSizeBtn = false;
            }
        }

        const myFullBox = { x: me.x, y: me.y, w: myW, h: myH };
        const myHazardBox = { x: me.x + 4, y: me.y + 4, w: Math.max(4, myW - 8), h: Math.max(4, myH - 8) };
        const hitHazard = (levelData.hazards || []).some(h => {
            if (h.type === 'redWall') return rectOverlap(myHazardBox, h);
            if (h.type === 'dontPush') {
                const btnHitbox = { x: h.x + 4, y: h.y + 2, w: Math.max(8, h.w - 8), h: h.h - 2 };
                return rectOverlap(myFullBox, btnHitbox);
            }
            return rectOverlap(myFullBox, h);
        });

        const myLaserBox = { x: me.x + 5, y: me.y + 5, w: Math.max(4, myW - 10), h: Math.max(4, myH - 10) };
        const hitLaser = (levelData.lasers || []).some(l => rectOverlap(myLaserBox, getLaserBeam(l)));

        const hitEnemy = (roomState.enemies || []).some(en => {
            const enBox = { x: en.x + 4, y: en.y + 4, w: Math.max(8, en.w - 8), h: Math.max(8, en.h - 4) };
            return rectOverlap(myHazardBox, enBox);
        });

        const hitPipeMonster = (roomState.pipeEnemies || []).some(pe => {
            if (!pe.monsterOffset || pe.monsterOffset <= 6) return false;
            const mx = pe.x + (pe.w - pe.monsterW) / 2 + 4;
            const my = pe.y - pe.monsterOffset + 4;
            const mBox = { x: mx, y: my, w: pe.monsterW - 8, h: pe.monsterOffset - 4 };
            return rectOverlap(myHazardBox, mBox);
        });

        // Ổ cắm vật lý riêng cho World 9 - 12 (engine_extra.js)
        let extraRestart = false;
        if (window.GameEngineExtra && window.GameEngineExtra.updatePhysics) {
            const extraRes = window.GameEngineExtra.updatePhysics({
                levelData, roomState, players, myId, me, keys, solids, rectOverlap, getCatSize, socket
            });
            if (extraRes && extraRes.restart) extraRestart = true;
        }

        if (hitHazard || hitLaser || hitEnemy || hitPipeMonster || extraRestart || me.y > levelData.height + 60) {
            socket.emit('restartLevel');
            return;
        }

        if (levelData.key && roomState.keyVisible !== false && !roomState.keyHolder && !roomState.doorUnlocked) {
            const activeKeyBox = (roomState.shyGhost && roomState.shyGhost.hasKey)
                ? { x: roomState.shyGhost.keyX - 4, y: roomState.shyGhost.keyY - 2, w: 34, h: 42 }
                : levelData.key;
            if (rectOverlap(myFullBox, activeKeyBox)) {
                socket.emit('pickupKey');
            }
        }

        if (levelData.door) {
            const touchingDoor = rectOverlap(myFullBox, levelData.door);
            if (touchingDoor) {
                if (roomState.keyHolder === myId && !roomState.doorUnlocked) {
                    socket.emit('unlockDoor');
                } else if (roomState.doorUnlocked && !me.enteredDoor) {
                    if ((me.scale || 1) <= 1.1) {
                        socket.emit('enterDoor');
                    }
                }
            }
        }

        socket.emit('playerMove', {
            x: me.x, y: me.y, vx: me.vx, vy: me.vy, facing: me.facing, scale: me.scale || 1
        });
    }

    function drawKeyIcon(x, y) {
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#c89d00';
        ctx.lineWidth = 2;
        ctx.fillRect(x + 4, y, 16, 14);
        ctx.strokeRect(x + 4, y, 16, 14);
        ctx.fillStyle = levelData.bgColor;
        ctx.fillRect(x + 9, y + 4, 6, 6);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 9, y + 14, 6, 18);
        ctx.fillRect(x + 15, y + 20, 6, 4);
        ctx.fillRect(x + 15, y + 27, 6, 4);
    }

    function drawCoinIcon(c) {
        ctx.fillStyle = '#5c5310';
        ctx.fillRect(c.x + 3, c.y, c.w - 6, c.h);
        ctx.fillRect(c.x, c.y + 4, c.w, c.h - 8);

        ctx.fillStyle = '#e6c619';
        ctx.fillRect(c.x + 4, c.y + 3, c.w - 8, c.h - 6);
        ctx.fillRect(c.x + 3, c.y + 6, c.w - 6, c.h - 12);

        ctx.fillStyle = '#fff59d';
        ctx.fillRect(c.x + 8, c.y + 7, 4, c.h - 14);
    }

    function drawLaserBeam(laser) {
        const beam = getLaserBeam(laser);
        const phase = Date.now() * 0.015;

        ctx.fillStyle = '#ff8c3a';
        if (laser.dir === 'down') {
            ctx.fillRect(laser.x - 10, laser.y - 2, 20, 10);
        } else if (laser.dir === 'left') {
            ctx.fillRect(laser.x - 8, laser.y - 10, 10, 20);
        }

        ctx.strokeStyle = '#ff8c3a';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        if (laser.dir === 'down') {
            for (let y = laser.y + 6; y <= beam.endY; y += 6) {
                const wx = laser.x + Math.sin(y * 0.28 + phase) * 3.5;
                if (y === laser.y + 6) ctx.moveTo(wx, y);
                else ctx.lineTo(wx, y);
            }
        } else if (laser.dir === 'left') {
            for (let x = laser.x - 6; x >= beam.endX; x -= 6) {
                const wy = laser.y + Math.sin(x * 0.28 + phase) * 3.5;
                if (x === laser.x - 6) ctx.moveTo(x, wy);
                else ctx.lineTo(x, wy);
            }
        }
        ctx.stroke();
    }

    function drawPlayerShield(p) {
        if (!p.shield) return;
        const { w: pw, h: ph } = getCatSize(p);
        ctx.fillStyle = p.color.fill;
        ctx.strokeStyle = p.color.border;
        ctx.lineWidth = 2;

        if (p.shield === 'top' || p.shield === 'both') {
            const sx = Math.round(p.x) - 12;
            const sy = Math.round(p.y) - 12;
            ctx.fillRect(sx, sy, pw + 24, 6);
            ctx.strokeRect(sx, sy, pw + 24, 6);
        }
        if (p.shield === 'right' || p.shield === 'both') {
            const sx = Math.round(p.x) + pw + 6;
            const sy = Math.round(p.y) - 8;
            ctx.fillRect(sx, sy, 6, ph + 12);
            ctx.strokeRect(sx, sy, 6, ph + 12);
        }
    }

    function drawHoverBoard(p) {
        const { w: pw, h: ph } = getCatSize(p);
        ctx.fillStyle = p.color.fill;
        ctx.strokeStyle = p.color.border;
        ctx.lineWidth = 2.5;
        ctx.fillRect(Math.round(p.x) - 8, Math.round(p.y) + ph - 7, pw + 16, 8);
        ctx.strokeRect(Math.round(p.x) - 8, Math.round(p.y) + ph - 7, pw + 16, 8);
    }

    function drawHardHat(p) {
        const px = Math.round(p.x);
        const py = Math.round(p.y);

        ctx.fillStyle = '#ffe033';
        ctx.strokeStyle = '#d49a00';
        ctx.lineWidth = 2;
        ctx.fillRect(px + 2, py - 9, CAT_W - 4, 11);
        ctx.strokeRect(px + 2, py - 9, CAT_W - 4, 11);

        ctx.fillStyle = '#fff176';
        ctx.fillRect(px + 8, py - 12, CAT_W - 16, 5);

        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(px - 4, py + 1, CAT_W + 8, 5);
        ctx.strokeRect(px - 4, py + 1, CAT_W + 8, 5);
    }

    function drawGhost(g) {
        if (!g || !g.enabled) return;
        const shakeX = g.state === 'warning' ? (Math.random() - 0.5) * 4 : 0;
        const gx = Math.round(g.x + shakeX);
        const gy = Math.round(g.y);
        const isRed = g.state === 'awake' || g.state === 'attack';

        const fill = g.state === 'attack' ? '#ff4757'
            : (g.state === 'awake' ? '#ff6b6b'
            : (g.state === 'warning' ? '#ff9eb5' : '#ffd1dc'));
        const border = isRed ? '#c0392b' : '#ff8fa3';

        ctx.fillStyle = fill;
        ctx.strokeStyle = border;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(gx + 18, gy);
        ctx.lineTo(gx + 68, gy);
        ctx.quadraticCurveTo(gx + 86, gy, gx + 86, gy + 24);
        ctx.lineTo(gx + 86, gy + 58);
        ctx.quadraticCurveTo(gx + 98, gy + 66, gx + 96, gy + 78);
        ctx.quadraticCurveTo(gx + 82, gy + 84, gx + 68, gy + 80);
        ctx.lineTo(gx + 18, gy + 80);
        ctx.quadraticCurveTo(gx, gy + 80, gx, gy + 58);
        ctx.lineTo(gx, gy + 24);
        ctx.quadraticCurveTo(gx, gy, gx + 18, gy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#3d1e2e';
        if (g.state === 'sleep') {
            ctx.fillRect(gx + 16, gy + 44, 14, 4);
            ctx.fillRect(gx + 46, gy + 44, 14, 4);

            const floatY = Math.sin(Date.now() * 0.006) * 4;
            ctx.fillStyle = '#d63031';
            ctx.font = '900 18px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('z', gx + 96, gy + 6 + floatY);
            ctx.font = '900 24px Segoe UI';
            ctx.fillText('Z', gx + 110, gy - 12 - floatY);
        } else if (g.state === 'warning') {
            ctx.fillRect(gx + 18, gy + 41, 12, 7);
            ctx.fillRect(gx + 48, gy + 41, 12, 7);
            ctx.fillStyle = '#e74c3c';
            ctx.font = '900 26px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('!', gx + 44, gy - 10);
        } else if (g.state === 'awake') {
            ctx.fillRect(gx + 18, gy + 40, 12, 9);
            ctx.fillRect(gx + 48, gy + 40, 12, 9);
            ctx.fillStyle = fill;
            ctx.fillRect(gx + 18, gy + 38, 6, 4);
            ctx.fillRect(gx + 54, gy + 38, 6, 4);
        } else {
            ctx.fillRect(gx + 18, gy + 36, 12, 14);
            ctx.fillRect(gx + 48, gy + 36, 12, 14);
        }
    }

    function drawShyGhost(sg) {
        if (!sg || !sg.enabled) return;
        const bob = sg.state === 'chase' ? Math.sin(Date.now() * 0.01) * 3 : 0;
        const gx = Math.round(sg.x);
        const gy = Math.round(sg.y + bob);
        const w = sg.w || 54;
        const h = sg.h || 54;

        ctx.save();
        if (sg.facing < 0) {
            ctx.translate(gx + w, gy);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(gx, gy);
        }

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(14, 2);
        ctx.lineTo(w - 14, 2);
        ctx.quadraticCurveTo(w - 2, 2, w - 2, 18);
        ctx.lineTo(w - 2, h - 10);
        ctx.quadraticCurveTo(w - 2, h - 2, w - 12, h - 2);
        ctx.lineTo(12, h - 2);
        ctx.quadraticCurveTo(-4, h - 2, -6, h - 12);
        ctx.quadraticCurveTo(2, h - 18, 4, h - 26);
        ctx.lineTo(4, 18);
        ctx.quadraticCurveTo(4, 2, 14, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (sg.state === 'shy') {
            ctx.fillStyle = '#ff7675';
            ctx.fillRect(16, 22, 10, 4);
            ctx.fillRect(34, 22, 10, 4);
            ctx.fillStyle = '#fab1a0';
            ctx.fillRect(14, 29, 7, 4);
            ctx.fillRect(39, 29, 7, 4);
        } else {
            ctx.fillStyle = '#2d3436';
            ctx.fillRect(19, 17, 6, 9);
            ctx.fillRect(35, 17, 6, 9);
            ctx.fillStyle = '#ff5252';
            ctx.fillRect(24, 30, 12, 9);
        }
        ctx.restore();
    }

    function drawPipeEnemy(pe) {
        const px = Math.round(pe.x);
        const py = Math.round(pe.y);

        if (pe.monsterOffset > 1) {
            const mw = pe.monsterW;
            const mh = pe.monsterH;
            const mx = Math.round(px + (pe.w - mw) / 2);
            const my = Math.round(py - pe.monsterOffset);

            ctx.fillStyle = '#a55eea';
            ctx.strokeStyle = '#6c3483';
            ctx.lineWidth = 2.5;
            ctx.fillRect(mx, my + 8, mw, mh - 4);
            ctx.strokeRect(mx, my + 8, mw, mh - 4);

            const spikePositions = [mx + 6, mx + mw / 2 - 4, mx + mw - 14];
            spikePositions.forEach(sx => {
                ctx.fillStyle = '#a55eea';
                ctx.fillRect(sx, my, 8, 9);
                ctx.strokeRect(sx, my, 8, 9);
            });

            ctx.fillStyle = '#111111';
            ctx.fillRect(mx + 10, my + 15, 5, 5);
            ctx.fillRect(mx + mw - 15, my + 15, 5, 5);
        }

        ctx.fillStyle = '#00e676';
        ctx.strokeStyle = '#00994d';
        ctx.lineWidth = 3;
        ctx.fillRect(px + 4, py + 16, pe.w - 8, pe.h - 16);
        ctx.strokeRect(px + 4, py + 16, pe.w - 8, pe.h - 16);

        ctx.fillStyle = '#00e676';
        ctx.fillRect(px, py, pe.w, 18);
        ctx.strokeRect(px, py, pe.w, 18);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 10, py + 3, 7, 12);
        ctx.fillRect(px + 12, py + 20, 7, pe.h - 24);
    }

    function drawEnemy(en) {
        const ex = Math.round(en.x);
        const wobble = Math.sin(Date.now() * 0.014) * 1.5;
        const ey = Math.round(en.y + wobble);

        ctx.fillStyle = '#9be564';
        ctx.strokeStyle = '#4e9a36';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ex + 2, ey + en.h);
        ctx.lineTo(ex + 2, ey + 10);
        ctx.quadraticCurveTo(ex + 2, ey, ex + 14, ey);
        ctx.lineTo(ex + en.w - 14, ey + 4);
        ctx.quadraticCurveTo(ex + en.w - 2, ey + 8, ex + en.w - 2, ey + en.h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#111111';
        if (en.speed <= 0) {
            ctx.fillRect(ex + 8, ey + 10, 4, 5);
            ctx.fillRect(ex + 17, ey + 10, 4, 5);
        } else {
            ctx.fillRect(ex + en.w - 21, ey + 10, 4, 5);
            ctx.fillRect(ex + en.w - 12, ey + 10, 4, 5);
        }
    }

    function drawTrafficLight(tl) {
        if (!tl || !tl.enabled) return;
        const boxW = 132;
        const boxH = 66;
        const boxX = (canvas.width - boxW) / 2;
        const boxY = 14;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ff8c3a';
        ctx.lineWidth = 4;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        const blinkOn = Math.floor(Date.now() / 140) % 2 === 0;
        const blueLit = tl.state === 'blue' || (tl.state === 'blink' && blinkOn);
        const redLit = tl.state === 'red' || tl.state === 'caught';

        ctx.beginPath();
        ctx.arc(boxX + 36, boxY + 33, 20, 0, Math.PI * 2);
        ctx.fillStyle = blueLit ? '#2196f3' : '#162244';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(boxX + 96, boxY + 33, 20, 0, Math.PI * 2);
        ctx.fillStyle = redLit ? (tl.state === 'caught' ? '#ff4757' : '#ff7675') : '#4a1414';
        ctx.fill();
    }

    function drawMoveGauge(mg) {
        if (!mg || !mg.enabled) return;
        const boxW = 246;
        const boxH = 44;
        const boxX = Math.round((canvas.width - boxW) / 2);
        const boxY = 16;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        const ratio = Math.max(0, Math.min(1, (mg.value || 0) / (mg.max || 100)));
        const innerW = Math.round((boxW - 8) * ratio);
        if (innerW > 0) {
            ctx.fillStyle = ratio <= 0.25 ? '#ff5252' : '#ff8a8a';
            ctx.fillRect(boxX + 4, boxY + 4, innerW, boxH - 8);
        }

        ctx.strokeStyle = '#ff8c3a';
        ctx.lineWidth = 4;
        ctx.strokeRect(boxX, boxY, boxW, boxH);
    }

    function drawTetrisBoard(t) {
        if (!t || !t.enabled) return;
        const cell = 21;
        const boardW = t.cols * cell;
        const boardH = t.rows * cell;
        const boardX = Math.round((canvas.width - boardW) / 2);
        const boardY = 58;

        ctx.fillStyle = levelData.groundColor || '#ff8c3a';
        ctx.fillRect(0, 0, canvas.width, boardY);
        ctx.fillRect(0, boardY, boardX, boardH);
        ctx.fillRect(boardX + boardW, boardY, canvas.width - (boardX + boardW), boardH);

        ctx.fillStyle = levelData.bgColor || '#fff8e7';
        ctx.fillRect(boardX, boardY, boardW, boardH);

        ctx.strokeStyle = 'rgba(255, 140, 58, 0.14)';
        ctx.lineWidth = 1;
        for (let c = 1; c < t.cols; c++) {
            ctx.beginPath();
            ctx.moveTo(boardX + c * cell, boardY);
            ctx.lineTo(boardX + c * cell, boardY + boardH);
            ctx.stroke();
        }
        for (let r = 1; r < t.rows; r++) {
            ctx.beginPath();
            ctx.moveTo(boardX, boardY + r * cell);
            ctx.lineTo(boardX + boardW, boardY + r * cell);
            ctx.stroke();
        }

        const drawCell = (gx, gy, color) => {
            const x = boardX + gx * cell;
            const y = boardY + gy * cell;
            ctx.fillStyle = color.fill;
            ctx.strokeStyle = color.border;
            ctx.lineWidth = 2;
            ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
            ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
        };

        for (let r = 0; r < t.rows; r++) {
            for (let c = 0; c < t.cols; c++) {
                if (t.grid[r] && t.grid[r][c]) {
                    drawCell(c, r, t.grid[r][c]);
                }
            }
        }

        if (t.pieces) {
            Object.values(t.pieces).forEach(piece => {
                for (let r = 0; r < piece.shape.length; r++) {
                    for (let c = 0; c < piece.shape[r].length; c++) {
                        if (piece.shape[r][c]) {
                            drawCell(piece.x + c, piece.y + r, piece.color);
                        }
                    }
                }
            });
        }

        if (t.slotCount > 1) {
            const chuteW = t.cols / t.slotCount;
            ctx.fillStyle = levelData.groundColor || '#ff8c3a';
            for (let i = 1; i < t.slotCount; i++) {
                const divX = Math.round(boardX + i * chuteW * cell) - 5;
                ctx.fillRect(divX, boardY, 10, cell * 2);
            }
        }

        const boxW = 92;
        const boxH = 40;
        const boxX = Math.round((canvas.width - boxW) / 2);
        const boxY = 9;
        ctx.fillStyle = '#fff8e7';
        ctx.strokeStyle = '#ff6b2b';
        ctx.lineWidth = 3;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = '#ff8c3a';
        ctx.font = '900 28px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(String(t.linesLeft), canvas.width / 2, boxY + 30);

        if (levelData.tetris && levelData.tetris.speedUpBanner && t.status === 'playing') {
            const elapsed = Date.now() - levelStartClientTime;
            if (elapsed < 3200) {
                const progress = elapsed / 3200;
                const textX = -120 + progress * (canvas.width + 240);
                ctx.fillStyle = '#ff8c3a';
                ctx.font = '900 34px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('SPEED UP', textX, boardY + 115);
            }
        }

        if (t.status === 'ok') {
            ctx.fillStyle = '#ff8c3a';
            ctx.font = '900 54px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('OK', canvas.width / 2, boardY + boardH / 2 + 18);
        } else if (t.status === 'failed') {
            ctx.fillStyle = '#ff4757';
            ctx.font = '900 44px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER!', canvas.width / 2, boardY + boardH / 2 + 16);
        }
    }

    function drawBreakout(b) {
        if (!b || !b.enabled) return;

        (b.bricks || []).forEach(br => {
            if (br.broken) return;
            ctx.fillStyle = br.color.fill;
            ctx.strokeStyle = br.color.border;
            ctx.lineWidth = 2.5;
            ctx.fillRect(br.x + 1, br.y + 1, br.w - 2, br.h - 2);
            ctx.strokeRect(br.x + 1, br.y + 1, br.w - 2, br.h - 2);

            if (br.special === 'multiBall') {
                ctx.fillStyle = '#e67e22';
                ctx.font = '900 15px Segoe UI';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('!', br.x + br.w / 2, br.y + br.h / 2 + 1);
                ctx.textBaseline = 'alphabetic';
            }
        });

        (b.bumpers || []).forEach(bp => {
            ctx.fillStyle = '#ff8c3a';
            ctx.strokeStyle = '#ff6b2b';
            ctx.lineWidth = 2.5;
            ctx.fillRect(bp.x, bp.y, bp.w, bp.h);
            ctx.strokeRect(bp.x, bp.y, bp.w, bp.h);
        });

        (b.balls || []).forEach(ball => {
            if (!ball.alive) return;
            const bx = Math.round(ball.x);
            const by = Math.round(ball.y);
            ctx.beginPath();
            ctx.arc(bx, by, ball.r, 0, Math.PI * 2);
            ctx.fillStyle = '#ff8c3a';
            ctx.fill();
            ctx.strokeStyle = '#ff6b2b';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        if (b.failed) {
            ctx.fillStyle = '#ff4757';
            ctx.font = '900 44px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('HẾT BÓNG!', canvas.width / 2, canvas.height / 2);
        }
    }

    function draw() {
        if (!levelData) return;

        ctx.fillStyle = levelData.bgColor || '#fff8e7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (roomState.tetris && roomState.tetris.enabled) {
            drawTetrisBoard(roomState.tetris);
        }

        ctx.save();
        if (levelData.dynamicCamera && cameraZoom < 0.999) {
            const offsetY = canvas.height - levelData.height * cameraZoom;
            ctx.translate(0, offsetY);
            ctx.scale(cameraZoom, cameraZoom);
            ctx.translate(-cameraX, 0);
        } else {
            ctx.translate(-Math.round(cameraX), 0);
        }

        ctx.fillStyle = levelData.groundColor || '#ff8c3a';
        (roomState.gates || []).forEach(g => {
            ctx.fillRect(g.x, g.y, g.w, g.h);
        });

        ctx.fillStyle = levelData.groundColor || '#ff8c3a';
        (levelData.platforms || []).forEach(p => {
            ctx.fillRect(p.x, p.y, p.w, p.h);
        });

        if (roomState.breakout && roomState.breakout.enabled) {
            drawBreakout(roomState.breakout);
        }

        (roomState.pipeEnemies || []).forEach(pe => drawPipeEnemy(pe));

        (roomState.colorBlocks || []).forEach(cb => {
            const bx = Math.round(cb.x);
            const by = Math.round(cb.y);
            ctx.fillStyle = cb.color.fill;
            ctx.strokeStyle = cb.color.border;
            ctx.lineWidth = 3;
            ctx.fillRect(bx + 1.5, by + 1.5, cb.w - 3, cb.h - 3);
            ctx.strokeRect(bx + 1.5, by + 1.5, cb.w - 3, cb.h - 3);
        });

        (levelData.sizeButtons || []).forEach(sb => {
            ctx.fillStyle = '#ff2e2e';
            ctx.fillRect(sb.x, sb.y, sb.w, sb.h);
            ctx.fillStyle = '#b30000';
            ctx.fillRect(sb.x - 3, sb.y + sb.h - 3, sb.w + 6, 3);

            const cx = sb.x + sb.w / 2;
            const cy = sb.y - 22;
            ctx.fillStyle = '#ff8c3a';
            ctx.fillRect(cx - 10, cy - 3, 20, 6);
            if (sb.type === 'grow') {
                ctx.fillRect(cx - 3, cy - 10, 6, 20);
            }
        });

        if (roomState.countdownPuzzle && roomState.countdownPuzzle.enabled) {
            const cp = roomState.countdownPuzzle;
            cp.timers.forEach(t => {
                const boxW = 120;
                const boxH = 42;
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = t.time <= 0 ? '#ff4757' : '#ff8c3a';
                ctx.lineWidth = 3.5;
                ctx.fillRect(t.boxX, t.boxY, boxW, boxH);
                ctx.strokeRect(t.boxX, t.boxY, boxW, boxH);

                ctx.fillStyle = t.time <= 0 ? '#ff4757' : '#ff8c3a';
                ctx.font = '900 26px Consolas, monospace';
                ctx.textAlign = 'center';
                ctx.fillText(formatSec(t.time), t.boxX + boxW / 2, t.boxY + 30);

                const btnH = t.stopped ? 5 : t.h;
                const btnY = t.btnY + (t.h - btnH);
                ctx.fillStyle = '#ff2e2e';
                ctx.fillRect(t.btnX, btnY, t.w, btnH);
                ctx.fillStyle = '#b30000';
                ctx.fillRect(t.btnX - 3, t.btnY + t.h - 3, t.w + 6, 3);
            });
        }

        (levelData.lasers || []).forEach(l => drawLaserBeam(l));

        (levelData.bouncePads || []).forEach(pad => {
            const tileW = 24;
            for (let x = pad.x; x < pad.x + pad.w - 4; x += tileW) {
                const w = Math.min(tileW - 2, pad.x + pad.w - x);
                ctx.strokeStyle = '#ff8c3a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 2, pad.y + 4);
                ctx.lineTo(x + w - 2, pad.y + pad.h);
                ctx.moveTo(x + w - 2, pad.y + 4);
                ctx.lineTo(x + 2, pad.y + pad.h);
                ctx.stroke();

                ctx.fillStyle = '#ff6b2b';
                ctx.fillRect(x, pad.y, w, 5);
            }
        });

        (levelData.hazards || []).forEach(h => {
            if (h.type === 'redWall') {
                ctx.fillStyle = '#ff5e57';
                ctx.fillRect(h.x, h.y, h.w, h.h);
            } else if (h.type === 'dontPush') {
                ctx.fillStyle = '#ff2e2e';
                ctx.fillRect(h.x, h.y, h.w, h.h);
                ctx.fillStyle = '#b30000';
                ctx.fillRect(h.x - 3, h.y + h.h - 3, h.w + 6, 3);

                const cx = h.x + h.w / 2;
                ctx.fillStyle = '#ff8c3a';
                ctx.fillRect(cx - 2, h.y - 18, 4, 8);
                ctx.beginPath();
                ctx.moveTo(cx - 7, h.y - 11);
                ctx.lineTo(cx + 7, h.y - 11);
                ctx.lineTo(cx, h.y - 4);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#ff8c3a';
                ctx.font = '900 16px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText("DON'T PUSH!", cx, h.y - 24);
            } else {
                ctx.strokeStyle = '#ff8c3a';
                ctx.lineWidth = 5;
                ctx.beginPath();
                const step = 18;
                for (let x = h.x; x <= h.x + h.w; x += step) {
                    const waveY = h.y + Math.sin(x * 0.2) * 5;
                    if (x === h.x) ctx.moveTo(x, waveY);
                    else ctx.lineTo(x, waveY);
                }
                ctx.stroke();
            }
        });

        (roomState.crumblingBlocks || []).forEach(cb => {
            if (cb.broken) return;
            const shakeX = cb.triggeredAt ? (Math.random() - 0.5) * 4 : 0;
            const shakeY = cb.triggeredAt ? (Math.random() - 0.5) * 4 : 0;
            ctx.fillStyle = cb.triggeredAt ? '#ffe0cc' : '#ffffff';
            ctx.strokeStyle = cb.triggeredAt ? '#ff6b2b' : '#b2bec3';
            ctx.lineWidth = 3;
            ctx.fillRect(cb.x + shakeX + 1, cb.y + shakeY + 1, cb.w - 2, cb.h - 2);
            ctx.strokeRect(cb.x + shakeX + 1, cb.y + shakeY + 1, cb.w - 2, cb.h - 2);
        });

        ctx.fillStyle = levelData.groundColor || '#ff8c3a';
        (roomState.movingPlatforms || []).forEach(m => {
            ctx.fillRect(Math.round(m.x), Math.round(m.y), m.w, m.h);
        });

        (roomState.buttons || []).forEach(btn => {
            const btnH = btn.pressed ? 5 : btn.h;
            const btnY = btn.y + (btn.h - btnH);
            ctx.fillStyle = '#ff2e2e';
            ctx.fillRect(btn.x, btnY, btn.w, btnH);
            ctx.fillStyle = '#b30000';
            ctx.fillRect(btn.x - 3, btn.y + btn.h - 3, btn.w + 6, 3);
        });

        (roomState.pushBlocks || []).forEach(b => {
            if (b.fallen && b.y >= 495) return;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#ff8c3a';
            ctx.lineWidth = 4;
            ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
            ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);

            if (!b.fallen) {
                ctx.fillStyle = '#ff8c3a';
                ctx.font = `900 ${b.w < 60 ? 22 : 32}px Segoe UI`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(b.remaining), b.x + b.w / 2, b.y + b.h / 2);
                ctx.textBaseline = 'alphabetic';
            }
        });

        (roomState.elevators || []).forEach(e => {
            const signW = 54;
            const signH = 34;
            const signX = e.x + (e.w - signW) / 2;
            const signY = e.y - signH - 14;

            ctx.fillStyle = '#ff8c3a';
            ctx.fillRect(e.x + e.w / 2 - 3, signY + signH, 6, 14);

            ctx.fillStyle = '#fff8e7';
            ctx.strokeStyle = '#ff8c3a';
            ctx.lineWidth = 4;
            ctx.fillRect(signX, signY, signW, signH);
            ctx.strokeRect(signX, signY, signW, signH);

            ctx.fillStyle = '#ff8c3a';
            ctx.font = '900 22px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(String(e.remaining), signX + signW / 2, signY + 25);

            ctx.fillStyle = '#ff8c3a';
            ctx.fillRect(e.x, e.y, e.w, e.h);
        });

        (roomState.coins || []).forEach(c => {
            if (!c.collected) drawCoinIcon(c);
        });

        (roomState.enemies || []).forEach(en => drawEnemy(en));

        if (levelData.door) {
            const d = levelData.door;
            if (roomState.doorUnlocked) {
                ctx.fillStyle = '#111111';
                ctx.fillRect(d.x, d.y, d.w, d.h);
            } else {
                ctx.fillStyle = '#c49a6c';
                ctx.fillRect(d.x, d.y, d.w, d.h);
                ctx.fillStyle = '#5c4033';
                ctx.fillRect(d.x + 8, d.y + 30, 8, 8);
            }
        }

        if (levelData.key && roomState.keyVisible !== false && !roomState.doorUnlocked) {
            if (!roomState.keyHolder) {
                if (roomState.shyGhost && roomState.shyGhost.hasKey) {
                    drawKeyIcon(roomState.shyGhost.keyX, roomState.shyGhost.keyY);
                } else {
                    drawKeyIcon(levelData.key.x, levelData.key.y);
                }
            } else if (players[roomState.keyHolder]) {
                const holder = players[roomState.keyHolder];
                const { w: hw } = getCatSize(holder);
                drawKeyIcon(holder.x + (holder.facing === 1 ? -24 : hw + 2), holder.y - 10);
            }
        }

        if (levelData.rope && levelData.rope.enabled) {
            const activeIds = getActiveRopeOrder();
            ctx.strokeStyle = '#ff8c3a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < activeIds.length - 1; i++) {
                const p1 = players[activeIds[i]];
                const p2 = players[activeIds[i + 1]];
                const s1 = getCatSize(p1);
                const s2 = getCatSize(p2);
                ctx.moveTo(p1.x + s1.w / 2, p1.y + s1.h * 0.65);
                ctx.lineTo(p2.x + s2.w / 2, p2.y + s2.h * 0.65);
            }
            ctx.stroke();
        }

        // Ổ cắm vẽ đồ vật nền cho World 9 - 12 (engine_extra.js)
        if (window.GameEngineExtra && window.GameEngineExtra.drawWorldBeforePlayers) {
            window.GameEngineExtra.drawWorldBeforePlayers(ctx, { levelData, roomState, players, myId, getCatSize, drawKeyIcon });
        }

        Object.values(players).forEach(p => {
            if (p.enteredDoor) return;
            window.drawPixelCat(ctx, Math.round(p.x), Math.round(p.y), p.color, p.name, p.scale || 1);

            const caughtByGhost = roomState.ghost && roomState.ghost.reachedTarget &&
                roomState.ghost.caughtIds && roomState.ghost.caughtIds.includes(p.id);
            const caughtByLight = roomState.trafficLight && roomState.trafficLight.state === 'caught' &&
                roomState.trafficLight.caughtIds && roomState.trafficLight.caughtIds.includes(p.id);
            const caughtByShyGhost = roomState.shyGhost && roomState.shyGhost.state === 'caught' &&
                roomState.shyGhost.caughtIds && roomState.shyGhost.caughtIds.includes(p.id);
            const depletedGauge = roomState.moveGauge && roomState.moveGauge.depleted;

            if (caughtByGhost || caughtByLight || caughtByShyGhost || depletedGauge) {
                ctx.fillStyle = '#111111';
                ctx.font = '900 13px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('x  x', Math.round(p.x) + 18, Math.round(p.y) + 21);
            }
            if (levelData.breakout && levelData.breakout.enabled) drawHardHat(p);
            if (levelData.flyMode) drawHoverBoard(p);
            drawPlayerShield(p);
        });

        if (roomState.ghost) drawGhost(roomState.ghost);
        if (roomState.shyGhost) drawShyGhost(roomState.shyGhost);

        // Ổ cắm vẽ hiệu ứng phủ trên nhân vật cho World 9 - 12 (engine_extra.js)
        if (window.GameEngineExtra && window.GameEngineExtra.drawWorldAfterPlayers) {
            window.GameEngineExtra.drawWorldAfterPlayers(ctx, { levelData, roomState, players, myId, getCatSize });
        }

        ctx.restore();

        const total = Object.keys(players).length;
        const alive = Object.values(players).filter(p => !p.enteredDoor).length;
        const onOrangeBg = (roomState.tetris && roomState.tetris.enabled) ||
            (roomState.breakout && roomState.breakout.enabled);
        ctx.fillStyle = onOrangeBg ? '#fff8e7' : '#ff8c3a';
        ctx.font = '900 19px Segoe UI';
        ctx.textAlign = 'left';
        let hudText = `${levelData.id} | ${total - alive}/${total}`;
        if (roomState.coins && roomState.coins.length > 0) {
            const leftCoins = roomState.coins.filter(c => !c.collected).length;
            hudText += ` | Xu: ${leftCoins}`;
        }
        ctx.fillText(hudText, 18, 36);

        if (roomState.breakout && roomState.breakout.enabled) {
            const leftBricks = (roomState.breakout.bricks || []).filter(br => !br.broken).length;
            ctx.font = '900 17px Segoe UI';
            ctx.fillText(`Gạch: ${leftBricks}`, 18, 66);
        }

        if (roomState.trafficLight) drawTrafficLight(roomState.trafficLight);
        if (roomState.moveGauge) drawMoveGauge(roomState.moveGauge);

        if (roomState.countdownPuzzle && roomState.countdownPuzzle.enabled) {
            const cp = roomState.countdownPuzzle;
            const centerX = canvas.width / 2 + 25;
            const boxW = 128;
            const boxH = 42;
            const boxX = centerX - boxW / 2;
            const boxY = 16;

            const isSuccess = cp.status === 'success';
            const isFailed = cp.status === 'failed';
            const mainColor = isSuccess ? '#1e90ff' : (isFailed ? '#ff4757' : '#ff8c3a');

            ctx.fillStyle = '#ff8c3a';
            ctx.font = '900 25px Consolas, monospace';
            ctx.textAlign = 'right';
            ctx.fillText('00.00  <', boxX - 14, boxY + 30);
            ctx.textAlign = 'left';
            ctx.fillText(`<  ${formatSec(cp.target)}`, boxX + boxW + 14, boxY + 30);

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = mainColor;
            ctx.lineWidth = 4;
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            ctx.fillStyle = mainColor;
            ctx.textAlign = 'center';
            ctx.fillText(formatSec(cp.sum), centerX, boxY + 30);

            if (isFailed) {
                ctx.strokeStyle = '#ff4757';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.moveTo(boxX + 8, boxY + boxH / 2);
                ctx.lineTo(boxX + boxW - 8, boxY + boxH / 2);
                ctx.stroke();
            }
        }

        if (roomState.timeLeft !== null && roomState.timeLeft !== undefined) {
            const boxW = 140;
            const boxH = 44;
            const boxX = (canvas.width - boxW) / 2;
            const boxY = 14;

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#ff8c3a';
            ctx.lineWidth = 4;
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            const sec = String(roomState.timeLeft).padStart(2, '0');
            ctx.fillStyle = roomState.timeLeft <= 10 ? '#e74c3c' : '#ff8c3a';
            ctx.font = '900 28px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(`00:${sec}`, canvas.width / 2, boxY + 32);
        }

        // Ổ cắm vẽ HUD / lớp phủ màn hình cho World 9 - 12 (engine_extra.js)
        if (window.GameEngineExtra && window.GameEngineExtra.drawHUD) {
            window.GameEngineExtra.drawHUD(ctx, canvas, { levelData, roomState, players, myId, cameraX });
        }

        if (roomState.timeUp) {
            ctx.fillStyle = 'rgba(255, 248, 231, 0.78)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff6b2b';
            ctx.font = '900 60px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('TIME UP!', canvas.width / 2, canvas.height / 2 + 20);
        }

        if (roomState.cleared) {
            ctx.fillStyle = 'rgba(255, 248, 231, 0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff8c3a';
            ctx.font = '900 64px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('CLEAR!', canvas.width / 2, canvas.height / 2 + 20);
        }
    }

    function loop() {
        updatePhysics();
        updateSharedCamera(false);
        draw();
        animId = requestAnimationFrame(loop);
    }

    return {
        init, start, stop, getContext,
        updatePlayerPosition, updateKey, updateElevators, updateMovingPlatforms,
        updateColorBlocks, updateGhost, updateTrafficLight, updateEnemies,
        updateShyGhost, updatePipeEnemies, updateMoveGauge, updateTetris, updateBreakout,
        updateBlocks, updateGates, updateCrumblingBlocks,
        updateCoins, updateTimer, updateScroll, updateCountdown,
        markTimeUp, markEnteredDoor, markCleared
    };
})();