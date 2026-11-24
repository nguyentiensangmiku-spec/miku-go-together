// ================================================================
// SERVER CHUNG CHO CẢ 4 MÀN WORLD 12 (12-1, 12-2, 12-3, 12-4)
// ================================================================

function serializeWorld12(w12) {
    if (w12.mode === 'windFans') {
        return {
            enabled: true,
            mode: 'windFans',
            fans: w12.fans
        };
    }

    if (w12.mode === 'flyScroll') {
        return {
            enabled: true,
            mode: 'flyScroll'
        };
    }

    if (w12.mode === 'finalRun') {
        return {
            enabled: true,
            mode: 'finalRun',
            bridgeButton: w12.bridgeButton,
            bridge: w12.bridge,
            bridgeOpen: w12.bridgeOpen,
            bridgeCurX: Math.round(w12.bridgeCurX),
            gap2Lava: w12.gap2Lava,
            thankYouText: w12.thankYouText
        };
    }

    return {
        enabled: true,
        mode: w12.mode,
        shieldPlayerId: w12.shieldPlayerId,
        lasers: w12.lasers,
        button: w12.button,
        buttonPressed: w12.buttonPressed,
        risingStep: w12.risingStep ? {
            x: w12.risingStep.x,
            y: Math.round(w12.risingStep.y * 10) / 10,
            w: w12.risingStep.w,
            h: w12.risingStep.h,
            startY: w12.risingStep.startY
        } : null,
        block: w12.block ? {
            x: Math.round(w12.block.x * 10) / 10,
            y: Math.round(w12.block.y * 10) / 10,
            w: w12.block.w,
            h: w12.block.h,
            active: w12.block.active
        } : null
    };
}

function initLevelState(room, levelData, playerIds) {
    if (!levelData.lastPark || !levelData.lastPark.enabled) return;

    const cfg = levelData.lastPark;
    const mode = cfg.mode || 'laserShield';

    // --- WORLD 12 - MÀN 12-1: 2 LASER NGANG + KHIÊN DỌC + KHỐI [1] ---
    if (mode === 'laserShield') {
        const shieldIdx = Math.min(cfg.shieldPlayerIndex || 0, Math.max(0, playerIds.length - 1));
        const shieldPlayerId = playerIds[shieldIdx] || null;

        const total = Math.max(1, playerIds.length);
        const gap = Math.min(54, Math.floor(420 / total));
        const prevPlayerPos = {};

        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 245 + idx * gap;
            p.y = 391;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
            prevPlayerPos[id] = { x: p.x, y: p.y };
        });

        const w12 = {
            enabled: true,
            mode,
            shieldPlayerId,
            lasers: (cfg.lasers || []).map(l => ({ ...l })),
            button: cfg.button ? { ...cfg.button } : null,
            buttonPressed: false,
            risingStep: cfg.risingStep ? { ...cfg.risingStep, raised: false } : null,
            block: cfg.block ? { ...cfg.block, vy: 0, active: false } : null,
            prevPlayerPos
        };

        room.state._world12 = w12;
        room.state.world12 = serializeWorld12(w12);
        return;
    }

    // --- WORLD 12 - MÀN 12-2: 2 QUẠT GIÓ THỔI NGƯỢC & XẾP CHỒNG LẤY CHÌA KHÓA ---
    if (mode === 'windFans') {
        const total = Math.max(1, playerIds.length);
        const gap = Math.min(48, Math.floor(380 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 220 + idx * gap;
            p.y = 396;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
        });

        if (cfg.autoKeyHeight && levelData.key) {
            const keyY = total === 1
                ? 315
                : Math.max(46, Math.round(435 - total * 39 - 135));
            room.levelData = {
                ...levelData,
                key: { ...levelData.key, y: keyY }
            };
        }

        const w12 = {
            enabled: true,
            mode: 'windFans',
            fans: (cfg.fans || []).map(f => ({ ...f }))
        };

        room.state._world12 = w12;
        room.state.world12 = serializeWorld12(w12);
        return;
    }

    // --- WORLD 12 - MÀN 12-3: BAY VÁN TRƯỢT & KHUNG HÌNH TỰ ĐỘNG KÉO ---
    if (mode === 'flyScroll') {
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            p.x = 85 + col * 95;
            p.y = 55 + row * 95;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
        });

        const w12 = {
            enabled: true,
            mode: 'flyScroll'
        };

        room.state._world12 = w12;
        room.state.world12 = serializeWorld12(w12);
        return;
    }

    // --- WORLD 12 - MÀN 12-4: CHẠY TỰ ĐỘNG KÉO HÌNH + CẦU NỐI HỐ DUNG NHAM + THANK YOU ---
    if (mode === 'finalRun') {
        const total = Math.max(1, playerIds.length);
        const gap = Math.min(44, Math.floor(420 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 70 + idx * gap;
            p.y = 401;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
        });

        const bridge = cfg.bridge ? { ...cfg.bridge } : null;
        const w12 = {
            enabled: true,
            mode: 'finalRun',
            bridgeButton: cfg.bridgeButton ? { ...cfg.bridgeButton } : null,
            bridge,
            bridgeOpen: false,
            bridgeCurX: bridge ? (bridge.x + bridge.w) : 0,
            gap2Lava: cfg.gap2Lava ? { ...cfg.gap2Lava } : null,
            thankYouText: cfg.thankYouText ? { ...cfg.thankYouText } : null
        };

        room.state._world12 = w12;
        room.state.world12 = serializeWorld12(w12);
    }
}

function updateRoom(room, pass, players, totalPlayers, now, helpers) {
    const w12 = room.state && room.state._world12;
    if (!w12 || !w12.enabled) return;

    const { io, getCatBox, rectOverlap } = helpers;

    // --- CẬP NHẬT MÀN 12-4: NÚT ĐỎ TRƯỢT CẦU CHE HỐ DUNG NHAM 2 ---
    if (w12.mode === 'finalRun') {
        let changed = false;

        if (!w12.bridgeOpen && w12.bridgeButton) {
            const trigger = {
                x: w12.bridgeButton.x - 2,
                y: w12.bridgeButton.y - 6,
                w: w12.bridgeButton.w + 4,
                h: w12.bridgeButton.h + 10
            };
            if (players.some(p => rectOverlap(getCatBox(p), trigger))) {
                w12.bridgeOpen = true;
                changed = true;
            }
        }

        if (w12.bridgeOpen && w12.bridge && w12.bridgeCurX > w12.bridge.x) {
            w12.bridgeCurX = Math.max(w12.bridge.x, w12.bridgeCurX - (w12.bridge.speed || 14));
            changed = true;
        }

        if (changed) {
            const serialized = serializeWorld12(w12);
            room.state.world12 = serialized;
            io.to(pass).emit('world12Sync', serialized);
        }
        return;
    }

    // --- CẬP NHẬT MÀN 12-1: LASER SHIELD & KHỐI [1] ---
    if (w12.mode === 'laserShield') {
        if (!w12.shieldPlayerId || !room.players[w12.shieldPlayerId]) {
            const ids = Object.keys(room.players);
            w12.shieldPlayerId = ids[0] || null;
        }

        if (!w12.prevPlayerPos) w12.prevPlayerPos = {};

        const platforms = room.levelData.platforms || [];
        const solids = [...platforms];
        if (w12.risingStep && w12.risingStep.y < w12.risingStep.startY) {
            solids.push(w12.risingStep);
        }

        if (w12.button && !w12.buttonPressed) {
            const trigger = {
                x: w12.button.x - 2,
                y: w12.button.y - 6,
                w: w12.button.w + 4,
                h: w12.button.h + 10
            };
            const hitByCat = players.some(p => rectOverlap(getCatBox(p), trigger));
            const hitByBlock = w12.block && rectOverlap(w12.block, trigger);
            if (hitByCat || hitByBlock) {
                w12.buttonPressed = true;
                if (w12.risingStep) w12.risingStep.raised = true;
            }
        }

        if (w12.risingStep && w12.risingStep.raised && w12.risingStep.y > w12.risingStep.upY) {
            w12.risingStep.y = Math.max(w12.risingStep.upY, w12.risingStep.y - (w12.risingStep.speed || 3.5));
        }

        const blk = w12.block;
        if (blk) {
            const maxMapX = (room.levelData.width || 1360) - 30;

            let carrierDx = 0;
            for (const p of players) {
                const prev = w12.prevPlayerPos[p.id];
                if (!prev) continue;
                const box = getCatBox(p);
                const onHeadHoriz = blk.x + blk.w > prev.x + 2 && blk.x < prev.x + box.w - 2;
                const onHeadVert = Math.abs((blk.y + blk.h) - prev.y) <= 8;
                if (onHeadHoriz && onHeadVert) {
                    const dx = p.x - prev.x;
                    if (Math.abs(dx) > 0.01 && Math.abs(dx) < 40) {
                        carrierDx = dx;
                        break;
                    }
                }
            }

            if (carrierDx !== 0) {
                const nextX = blk.x + carrierDx;
                const testBoxX = { x: nextX, y: blk.y + 2, w: blk.w, h: blk.h - 4 };
                if (!solids.some(s => rectOverlap(testBoxX, s)) && nextX >= 30 && nextX + blk.w <= maxMapX) {
                    blk.x = nextX;
                }
            }

            let pushDir = 0;
            for (const p of players) {
                const box = getCatBox(p);
                const vertOverlap = box.y + box.h > blk.y + 4 && box.y < blk.y + blk.h - 4;
                if (!vertOverlap) continue;

                if (p.vx > 0 && box.x + box.w >= blk.x - 10 && box.x + box.w <= blk.x + 14) {
                    pushDir = 1;
                    break;
                }
                if (p.vx < 0 && box.x <= blk.x + blk.w + 10 && box.x >= blk.x + blk.w - 14) {
                    pushDir = -1;
                    break;
                }
            }

            blk.active = pushDir !== 0;

            if (pushDir !== 0) {
                const step = pushDir * (blk.speed || 3.2);
                const nextX = blk.x + step;
                const testBoxX = { x: nextX, y: blk.y + 2, w: blk.w, h: blk.h - 4 };
                const blocked = solids.some(s => rectOverlap(testBoxX, s));
                if (!blocked && nextX >= 30 && nextX + blk.w <= maxMapX) {
                    blk.x = nextX;
                }
            }

            blk.vy = Math.min(12, (blk.vy || 0) + 0.9);
            const nextY = blk.y + blk.vy;
            let supportY = null;

            for (const s of solids) {
                if (blk.x + blk.w > s.x + 2 && blk.x < s.x + s.w - 2) {
                    if (blk.y + blk.h <= s.y + 14 && nextY + blk.h >= s.y) {
                        if (supportY === null || s.y < supportY) supportY = s.y;
                    }
                }
            }

            for (const p of players) {
                const box = getCatBox(p);
                if (blk.x + blk.w > box.x + 2 && blk.x < box.x + box.w - 2) {
                    if (blk.y + blk.h <= box.y + 18 && nextY + blk.h >= box.y) {
                        const headY = Math.floor(box.y);
                        if (supportY === null || headY < supportY) supportY = headY;
                    }
                }
            }

            if (supportY !== null) {
                blk.y = supportY - blk.h;
                blk.vy = 0;
            } else {
                blk.y = Math.min((room.levelData.height || 500) - blk.h, nextY);
            }
        }

        w12.prevPlayerPos = {};
        players.forEach(p => {
            w12.prevPlayerPos[p.id] = { x: p.x, y: p.y };
        });

        const serialized = serializeWorld12(w12);
        room.state.world12 = serialized;
        io.to(pass).emit('world12Sync', serialized);
    }
}

function registerSocket(socket, helpers) {
    // Dành sẵn nếu muốn mở rộng phím đặc biệt cho World 12
}

module.exports = {
    initLevelState,
    updateRoom,
    registerSocket
};