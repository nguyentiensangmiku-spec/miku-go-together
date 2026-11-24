// ================================================================
// SERVER CHUNG CHO CẢ 4 MÀN WORLD 13 (13-1, 13-2, 13-3, 13-4)
// ================================================================

function serializeWorld13(w13) {
    if (w13.mode === 'helloPark') {
        return {
            enabled: true,
            mode: 'helloPark',
            button: w13.button,
            buttonPressed: w13.buttonPressed,
            lift: w13.lift ? {
                x: w13.lift.x,
                y: Math.round(w13.lift.y * 10) / 10,
                w: w13.lift.w,
                h: w13.lift.h,
                startY: w13.lift.startY
            } : null
        };
    }

    if (w13.mode === 'carryBlock') {
        return {
            enabled: true,
            mode: 'carryBlock',
            spikes: (w13.spikes || [])
                .filter(s => s.state !== 'broken')
                .map(s => ({
                    x: s.x,
                    y: Math.round(s.y),
                    w: s.w,
                    h: s.h,
                    state: s.state
                })),
            block: w13.block ? {
                x: Math.round(w13.block.x * 10) / 10,
                y: Math.round(w13.block.y * 10) / 10,
                w: w13.block.w,
                h: w13.block.h,
                remaining: w13.block.remaining
            } : null
        };
    }

    if (w13.mode === 'shootPillar') {
        return {
            enabled: true,
            mode: 'shootPillar',
            launcher: w13.launcher,
            pillar: w13.pillar ? {
                pivotX: w13.pillar.pivotX,
                pivotY: w13.pillar.pivotY,
                segSize: w13.pillar.segSize,
                segCount: w13.pillar.segCount,
                angle: Math.round(w13.pillar.angle * 100) / 100,
                falling: w13.pillar.falling,
                fallen: w13.pillar.fallen
            } : null
        };
    }

    if (w13.mode === 'multiButtons') {
        return {
            enabled: true,
            mode: 'multiButtons',
            buttons: w13.buttons,
            spikes: w13.spikes,
            targetCount: w13.targetCount,
            remaining: w13.remaining,
            unlocked: w13.unlocked
        };
    }

    return { enabled: true, mode: w13.mode };
}

function initLevelState(room, levelData, playerIds, helpers) {
    if (!levelData.world13 || !levelData.world13.enabled) return;

    const cfg = levelData.world13;
    const mode = cfg.mode || 'helloPark';
    const total = Math.max(1, playerIds.length);

    // --- WORLD 13 - MÀN 13-1: SÀN NHÚN & NÚT ĐỎ NÂNG BỤC ---
    if (mode === 'helloPark') {
        const gap = Math.min(44, Math.floor(330 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 70 + idx * gap;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
        });

        const w13 = {
            enabled: true,
            mode: 'helloPark',
            button: cfg.button ? { ...cfg.button } : null,
            buttonPressed: false,
            lift: cfg.lift ? { ...cfg.lift } : null
        };

        room.state._world13 = w13;
        room.state.world13 = serializeWorld13(w13);
        return;
    }

    // --- WORLD 13 - MÀN 13-2: NÚT LÒ XO + ĐẨY KHỐI [N-1] + TỪNG GAI ĐỎ TỰ DẬP ---
    if (mode === 'carryBlock') {
        const prevPlayerPos = {};
        const gap = Math.min(44, Math.floor(340 / total));

        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 120 + idx * gap;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
            prevPlayerPos[id] = { x: p.x, y: p.y };
        });

        if (cfg.autoKeyHeight && levelData.key) {
            const keyY = Math.max(42, Math.min(310, Math.round(445 - 48 - total * 39 - 45)));
            room.levelData = {
                ...levelData,
                key: { ...levelData.key, y: keyY }
            };
        }

        const reqCount = helpers && helpers.getRequiredCount
            ? helpers.getRequiredCount(cfg.block.required, total)
            : Math.max(1, total - 1);

        const spikes = [];
        if (cfg.ceilingSpikes) {
            const cs = cfg.ceilingSpikes;
            const sw = cs.spikeWidth || 30;
            const fallSpeed = cs.fallSpeed || 24;
            let idx = 0;
            for (let sx = cs.x; sx < cs.x + cs.w; sx += sw) {
                const w = Math.min(sw, cs.x + cs.w - sx);
                spikes.push({
                    id: idx++,
                    x: sx,
                    y: cs.y,
                    w,
                    h: cs.h || 16,
                    speed: fallSpeed,
                    state: 'idle'
                });
            }
        }

        const w13 = {
            enabled: true,
            mode: 'carryBlock',
            spikes,
            block: cfg.block ? {
                ...cfg.block,
                vy: 0,
                remaining: reqCount
            } : null,
            prevPlayerPos,
            restarting: false
        };

        room.state._world13 = w13;
        room.state.world13 = serializeWorld13(w13);
        return;
    }

    // --- WORLD 13 - MÀN 13-3: BỆ PHÓNG (>>) HÚC ĐỔ CỘT TƯỜNG XANH 9 ĐỐT ---
    if (mode === 'shootPillar') {
        const gap = Math.min(44, Math.floor(320 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 60 + idx * gap;
            p.y = 276;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
        });

        const pCfg = cfg.pillar || {};
        const w13 = {
            enabled: true,
            mode: 'shootPillar',
            launcher: cfg.launcher ? { ...cfg.launcher } : { x: 515, y: 268, w: 108, h: 48 },
            pillar: {
                pivotX: pCfg.pivotX || 1058,
                pivotY: pCfg.pivotY || 445,
                segSize: pCfg.segSize || 48,
                segCount: pCfg.segCount || 9,
                tipAngle: pCfg.tipAngle || 42,
                angle: 0,
                angularVel: 0,
                falling: false,
                fallen: false,
                lastAnyHitAt: 0,
                hitCooldowns: {}
            }
        };

        room.state._world13 = w13;
        room.state.world13 = serializeWorld13(w13);
        return;
    }

    // --- WORLD 13 - MÀN 13-4: ĐẠP ĐỒNG THỜI 7 NÚT ĐỎ HIỆN CHÌA KHÓA ---
    if (mode === 'multiButtons') {
        const gap = Math.min(44, Math.floor(360 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 70 + idx * gap;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
        });

        const buttons = (cfg.buttons || []).map(b => ({ ...b, pressed: false }));
        // Phòng 8 người yêu cầu đủ 7 nút như video; phòng ít người tự canh theo sĩ số (1..7)
        const targetCount = Math.min(buttons.length, total);

        const w13 = {
            enabled: true,
            mode: 'multiButtons',
            buttons,
            spikes: (cfg.spikes || []).map(s => ({ ...s })),
            targetCount,
            remaining: targetCount,
            unlocked: false
        };

        room.state._world13 = w13;
        room.state.world13 = serializeWorld13(w13);
    }
}

function updateRoom(room, pass, players, totalPlayers, now, helpers) {
    const w13 = room.state && room.state._world13;
    if (!w13 || !w13.enabled) return;

    const { io, rooms, startLevelForRoom, getCatBox, rectOverlap, getRequiredCount } = helpers;

    // --- CẬP NHẬT MÀN 13-1 ---
    if (w13.mode === 'helloPark') {
        let changed = false;

        if (w13.button) {
            const trigger = {
                x: w13.button.x - 2,
                y: w13.button.y - 6,
                w: w13.button.w + 4,
                h: w13.button.h + 10
            };
            const pressed = players.some(p => rectOverlap(getCatBox(p), trigger));
            if (pressed !== w13.buttonPressed) {
                w13.buttonPressed = pressed;
                changed = true;
            }
        }

        if (w13.lift) {
            const targetY = w13.buttonPressed ? w13.lift.upY : w13.lift.startY;
            const speed = w13.lift.speed || 3.2;
            if (w13.lift.y > targetY) {
                w13.lift.y = Math.max(targetY, w13.lift.y - speed);
                changed = true;
            } else if (w13.lift.y < targetY) {
                w13.lift.y = Math.min(targetY, w13.lift.y + speed);
                changed = true;
            }
        }

        if (changed) {
            const serialized = serializeWorld13(w13);
            room.state.world13 = serialized;
            io.to(pass).emit('world13Sync', serialized);
        }
        return;
    }

    // --- CẬP NHẬT MÀN 13-2: ĐẨY & ĐỘI KHỐI [N-1] + GAI ĐỎ DẬP XUỐNG ---
    if (w13.mode === 'carryBlock') {
        if (!w13.prevPlayerPos) w13.prevPlayerPos = {};
        const blk = w13.block;
        const solids = room.levelData.platforms || [];
        const maxMapX = (room.levelData.width || 2000) - 30;

        if (blk) {
            let carrierDx = 0;
            for (const p of players) {
                const prev = w13.prevPlayerPos[p.id];
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

            const reqCount = getRequiredCount ? getRequiredCount(blk.required, totalPlayers) : Math.max(1, totalPlayers - 1);
            const pushMargin = Math.max(40, reqCount * 38);
            let pushRight = 0;
            let pushLeft = 0;

            players.forEach(p => {
                const box = getCatBox(p);
                const vertOverlap = box.y + box.h > blk.y + 4 && box.y < blk.y + blk.h - 4;
                if (!vertOverlap) return;

                if (box.x + box.w >= blk.x - pushMargin && box.x + box.w <= blk.x + 16 && p.vx > 0) pushRight++;
                if (box.x <= blk.x + blk.w + pushMargin && box.x >= blk.x + blk.w - 16 && p.vx < 0) pushLeft++;
            });

            const activePush = Math.max(pushRight, pushLeft);
            blk.remaining = Math.max(0, reqCount - activePush);

            let pushDir = 0;
            if (pushRight >= reqCount) pushDir = 1;
            else if (pushLeft >= reqCount) pushDir = -1;

            if (pushDir !== 0) {
                const nextX = blk.x + pushDir * (blk.speed || 3.2);
                const testBoxX = { x: nextX, y: blk.y + 2, w: blk.w, h: blk.h - 4 };
                if (!solids.some(s => rectOverlap(testBoxX, s)) && nextX >= 30 && nextX + blk.w <= maxMapX) {
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

        const triggerRestart = () => {
            if (w13.restarting) return;
            w13.restarting = true;
            setTimeout(() => {
                if (rooms[pass] && rooms[pass].state && rooms[pass].state._world13 && rooms[pass].state._world13.restarting) {
                    startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                }
            }, 420);
        };

        const blkShield = blk ? { x: blk.x - 4, y: blk.y - 2, w: blk.w + 8, h: blk.h + 4 } : null;

        for (const sp of (w13.spikes || [])) {
            if (sp.state === 'broken') continue;

            if (sp.state === 'idle') {
                const playerBelow = players.some(p => {
                    const box = getCatBox(p);
                    return box.x + box.w > sp.x + 2 && box.x < sp.x + sp.w - 2 && box.y >= sp.y - 4;
                });
                if (playerBelow) {
                    sp.state = 'falling';
                }
            }

            if (sp.state === 'falling') {
                const prevY = sp.y;
                sp.y += sp.speed || 24;
                const sweptBox = { x: sp.x + 3, y: prevY, w: Math.max(4, sp.w - 6), h: (sp.y + sp.h) - prevY };

                if (blkShield && rectOverlap(sweptBox, blkShield)) {
                    sp.state = 'broken';
                    continue;
                }

                const hitCat = players.some(p => {
                    const box = getCatBox(p);
                    const pHit = { x: box.x + 4, y: box.y + 4, w: Math.max(4, box.w - 8), h: Math.max(4, box.h - 6) };
                    return rectOverlap(sweptBox, pHit);
                });
                if (hitCat) {
                    sp.state = 'broken';
                    triggerRestart();
                    continue;
                }

                if (sp.y + sp.h >= 445) {
                    sp.state = 'broken';
                }
            }
        }

        w13.prevPlayerPos = {};
        players.forEach(p => {
            w13.prevPlayerPos[p.id] = { x: p.x, y: p.y };
        });

        const serialized = serializeWorld13(w13);
        room.state.world13 = serialized;
        io.to(pass).emit('world13Sync', serialized);
        return;
    }

    // --- CẬP NHẬT MÀN 13-3: CỘT TƯỜNG XANH 9 ĐỐT TỰ HỒI & ĐỔ RẠP ---
    if (w13.mode === 'shootPillar' && w13.pillar) {
        const pil = w13.pillar;
        let changed = false;

        if (pil.falling && !pil.fallen) {
            pil.angularVel = Math.min(9.5, (pil.angularVel || 1.8) + 0.55);
            pil.angle = Math.min(90, pil.angle + pil.angularVel);
            if (pil.angle >= 90) {
                pil.angle = 90;
                pil.falling = false;
                pil.fallen = true;
                pil.angularVel = 0;
            }
            changed = true;
        } else if (!pil.fallen && pil.angle > 0) {
            if (now - pil.lastAnyHitAt > 380) {
                const restoreRate = totalPlayers <= 2
                    ? 0.06
                    : Math.min(0.24, 0.06 + (totalPlayers - 2) * 0.03);
                pil.angle = Math.max(0, pil.angle - restoreRate);
                changed = true;
            }
        }

        if (changed) {
            const serialized = serializeWorld13(w13);
            room.state.world13 = serialized;
            io.to(pass).emit('world13Sync', serialized);
        }
        return;
    }

    // --- CẬP NHẬT MÀN 13-4: ĐẾM SỐ NÚT ĐỎ ĐANG ĐƯỢC ĐẠP ĐỒNG THỜI ---
    if (w13.mode === 'multiButtons') {
        let changed = false;
        let pressedCount = 0;

        // Cập nhật mục tiêu nếu có người mới vào/thoát phòng
        const dynamicTarget = Math.min(w13.buttons.length, Math.max(1, totalPlayers));
        if (w13.targetCount !== dynamicTarget) {
            w13.targetCount = dynamicTarget;
            changed = true;
        }

        w13.buttons.forEach(btn => {
            const trigger = {
                x: btn.x - 2,
                y: btn.y - 6,
                w: btn.w + 4,
                h: btn.h + 10
            };
            const isPressed = players.some(p => rectOverlap(getCatBox(p), trigger));
            if (isPressed) pressedCount++;
            if (btn.pressed !== isPressed) {
                btn.pressed = isPressed;
                changed = true;
            }
        });

        const newRem = Math.max(0, w13.targetCount - pressedCount);
        if (w13.remaining !== newRem) {
            w13.remaining = newRem;
            changed = true;
        }

        if (newRem === 0 && !w13.unlocked) {
            w13.unlocked = true;
            room.state.keyVisible = true;
            changed = true;
        }

        if (changed) {
            const serialized = serializeWorld13(w13);
            room.state.world13 = serialized;
            io.to(pass).emit('world13Sync', serialized);
        }
    }
}

function registerSocket(socket, helpers) {
    const { io, rooms } = helpers;

    // Nhận cú húc từ bệ phóng vào cột tường xanh 9 đốt ở Màn 13-3
    socket.on('world13HitPillar', ({ hitY }) => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (!room || !room.state || !room.state._world13) return;

        const w13 = room.state._world13;
        if (w13.mode !== 'shootPillar' || !w13.pillar) return;

        const pil = w13.pillar;
        if (pil.fallen || pil.falling) return;

        const p = room.players[socket.id];
        if (!p || p.enteredDoor) return;

        const now = Date.now();
        if (pil.hitCooldowns[socket.id] && now < pil.hitCooldowns[socket.id]) return;
        pil.hitCooldowns[socket.id] = now + 350;

        const totalPlayers = Math.max(1, Object.keys(room.players).length);
        const basePush = totalPlayers <= 2
            ? 10.5
            : Math.max(6.8, 12.2 - totalPlayers * 0.65);

        const heightBonus = (typeof hitY === 'number' && hitY < 320) ? 1.15 : 1.0;
        pil.angle = Math.min(90, pil.angle + basePush * heightBonus);
        pil.lastAnyHitAt = now;

        if (pil.angle >= pil.tipAngle) {
            pil.falling = true;
            pil.angularVel = 1.8;
        }

        const serialized = serializeWorld13(w13);
        room.state.world13 = serialized;
        io.to(pass).emit('world13Sync', serialized);
    });
}

module.exports = {
    initLevelState,
    updateRoom,
    registerSocket
};