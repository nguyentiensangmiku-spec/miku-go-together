// ================================================================
// SERVER CHUNG CHO CẢ 4 MÀN WORLD 14 (14-1, 14-2, 14-3, 14-4)
// ================================================================

function serializeWorld14(w14) {
    if (w14.mode === 'dontTouch') {
        return {
            enabled: true,
            mode: 'dontTouch',
            gauge: Math.round(w14.gauge * 10) / 10,
            maxGauge: w14.maxGauge,
            depleted: w14.depleted,
            unlocked: w14.unlocked,
            icePlatforms: w14.icePlatforms,
            buttons: w14.buttons,
            touchPoints: w14.touchPoints
        };
    }

    if (w14.mode === 'ropeTrapBridge') {
        return {
            enabled: true,
            mode: 'ropeTrapBridge',
            bridgeActive: w14.bridgeActive,
            bridge: w14.bridge,
            trapTopBlocks: w14.trapTopBlocks,
            trapButtons: w14.trapButtons,
            triggeredIdx: w14.triggeredIdx
        };
    }

    if (w14.mode === 'dontTouchFinal') {
        return {
            enabled: true,
            mode: 'dontTouchFinal',
            gauge: Math.round(w14.gauge * 10) / 10,
            maxGauge: w14.maxGauge,
            depleted: w14.depleted,
            touchPoints: w14.touchPoints,
            sweeper: w14.sweeper ? {
                x: Math.round(w14.sweeper.x * 10) / 10,
                y: w14.sweeper.y,
                w: w14.sweeper.w,
                h: w14.sweeper.h
            } : null,
            fan: w14.fan,
            carrier: w14.carrier ? {
                x: Math.round(w14.carrier.x * 10) / 10,
                y: w14.carrier.y,
                w: w14.carrier.w,
                h: w14.carrier.h,
                startX: w14.carrier.startX,
                endX: w14.carrier.endX,
                remaining: w14.carrier.remaining,
                activated: w14.carrier.activated
            } : null,
            pitHazard: w14.pitHazard
        };
    }

    return {
        enabled: true,
        mode: w14.mode
    };
}

function buildDontTouchButtons(cfg, count) {
    const n = Math.max(1, Math.min(8, count));
    const spacing = cfg.buttonSpacing || 74;
    const rightX = cfg.buttonRightX || 1710;
    const btnY = cfg.buttonY || 174;
    const startX = rightX - (n - 1) * spacing;
    const list = [];
    for (let i = 0; i < n; i++) {
        list.push({
            id: `w14_b_${i}`,
            x: Math.round(startX + i * spacing),
            y: btnY,
            w: 34,
            h: 12,
            pressed: false
        });
    }
    return list;
}

// Hàm dùng chung kiểm tra chạm nhau & tụt thanh hồng DON'T TOUCH ME! (cho Màn 14-2 & 14-4)
function updateDontTouchGauge(w14, room, pass, players, now, dt, helpers) {
    const { rooms, startLevelForRoom, getCatBox, rectOverlap } = helpers;
    const prevTouchCount = w14.touchPoints.length;
    const touchPoints = [];
    let changed = false;

    if (!w14.depleted && now - w14.startTime >= 1200) {
        for (let i = 0; i < players.length; i++) {
            const a = getCatBox(players[i]);
            const aTouch = { x: a.x - 2, y: a.y - 2, w: a.w + 4, h: a.h + 4 };
            for (let j = i + 1; j < players.length; j++) {
                const b = getCatBox(players[j]);
                const bTouch = { x: b.x - 2, y: b.y - 2, w: b.w + 4, h: b.h + 4 };
                if (rectOverlap(aTouch, bTouch)) {
                    touchPoints.push({
                        x: Math.round((a.x + a.w / 2 + b.x + b.w / 2) / 2),
                        y: Math.round((a.y + a.h / 2 + b.y + b.h / 2) / 2)
                    });
                }
            }
        }

        if (touchPoints.length > 0) {
            const drain = w14.drainRate * Math.min(3, touchPoints.length) * dt;
            w14.gauge = Math.max(0, w14.gauge - drain);
            changed = true;

            if (w14.gauge <= 0) {
                w14.gauge = 0;
                w14.depleted = true;
                if (!w14.restarting) {
                    w14.restarting = true;
                    setTimeout(() => {
                        if (rooms[pass] && rooms[pass].state && rooms[pass].state._world14 && rooms[pass].state._world14.restarting) {
                            startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                        }
                    }, 1150);
                }
            }
        }
    }

    w14.touchPoints = touchPoints;
    if (touchPoints.length > 0 || prevTouchCount > 0) changed = true;
    return changed;
}

function initLevelState(room, levelData, playerIds, helpers) {
    if (!levelData.world14 || !levelData.world14.enabled) return;

    const cfg = levelData.world14;
    const mode = cfg.mode || 'distanceRope';
    const total = Math.max(1, playerIds.length);

    // --- WORLD 14 - MÀN 14-1: DÂY XANH NỐI ĐỘI + SÂU XANH + HỐ CHÌA KHÓA + THANG MÁY ---
    if (mode === 'distanceRope') {
        const gap = Math.min(44, Math.floor(350 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 75 + idx * gap;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
        });

        const w14 = {
            enabled: true,
            mode: 'distanceRope'
        };

        room.state._world14 = w14;
        room.state.world14 = serializeWorld14(w14);
        return;
    }

    // --- WORLD 14 - MÀN 14-2: DON'T TOUCH ME! + SÀN BĂNG TRƠN + HÀNG N NÚT ĐỎ ---
    if (mode === 'dontTouch') {
        const spacing = total <= 1 ? 0 : Math.min(82, Math.floor(600 / (total - 1)));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 65 + idx * spacing;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
        });

        const w14 = {
            enabled: true,
            mode: 'dontTouch',
            cfg,
            gauge: 100,
            maxGauge: 100,
            drainRate: cfg.drainRate || 34,
            depleted: false,
            restarting: false,
            unlocked: false,
            startTime: Date.now(),
            lastTick: Date.now(),
            icePlatforms: (cfg.icePlatforms || []).map(ip => ({ ...ip })),
            buttons: buildDontTouchButtons(cfg, total),
            touchPoints: []
        };

        room.state._world14 = w14;
        room.state.world14 = serializeWorld14(w14);
        return;
    }

    // --- WORLD 14 - MÀN 14-3: DÂY XANH NỐI ĐỘI + CẦU NỔI BẪY 4 KHỐI CHẤM ĐỎ ---
    if (mode === 'ropeTrapBridge') {
        const gap = Math.min(44, Math.floor(410 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 65 + idx * gap;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
        });

        const w14 = {
            enabled: true,
            mode: 'ropeTrapBridge',
            bridgeActive: true,
            bridge: cfg.bridge ? { ...cfg.bridge } : null,
            trapTopBlocks: (cfg.trapTopBlocks || []).map(b => ({ ...b })),
            trapButtons: (cfg.trapButtons || []).map(b => ({ ...b })),
            triggeredIdx: -1
        };

        room.state._world14 = w14;
        room.state.world14 = serializeWorld14(w14);
        return;
    }

    // --- WORLD 14 - MÀN 14-4: DON'T TOUCH ME! + KHỐI MÀU NGẪU NHIÊN + THANH GẠT + QUẠT + BỤC CHỞ [ALL] ---
    if (mode === 'dontTouchFinal') {
        // Xếp các chú mèo đứng giãn cách đều nhau phía bên phải khối màu
        const spacing = total <= 1 ? 0 : Math.min(82, Math.floor(660 / (total - 1)));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 185 + idx * spacing;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
        });

        // Đổi màu khối đẩy ngẫu nhiên theo 1 người chơi bất kỳ trong phòng giống hệt video
        if (room.state.colorBlocks && room.state.colorBlocks.length > 0 && playerIds.length > 0) {
            const randId = playerIds[Math.floor(Math.random() * playerIds.length)];
            if (room.players[randId]) {
                room.state.colorBlocks[0].color = room.players[randId].color;
            }
        }

        const w14 = {
            enabled: true,
            mode: 'dontTouchFinal',
            gauge: 100,
            maxGauge: 100,
            drainRate: cfg.drainRate || 32,
            depleted: false,
            restarting: false,
            startTime: Date.now(),
            lastTick: Date.now(),
            touchPoints: [],
            sweeper: cfg.sweeper ? {
                ...cfg.sweeper,
                dir: -1
            } : null,
            fan: cfg.fan ? { ...cfg.fan } : null,
            carrier: cfg.carrier ? {
                ...cfg.carrier,
                remaining: total,
                activated: false
            } : null,
            pitHazard: cfg.pitHazard ? { ...cfg.pitHazard } : null
        };

        room.state._world14 = w14;
        room.state.world14 = serializeWorld14(w14);
    }
}

function updateRoom(room, pass, players, totalPlayers, now, helpers) {
    const w14 = room.state && room.state._world14;
    if (!w14 || !w14.enabled) return;

    const { io, getCatBox, rectOverlap } = helpers;

    // --- CẬP NHẬT MÀN 14-2 ---
    if (w14.mode === 'dontTouch') {
        const dt = Math.min(0.1, (now - w14.lastTick) / 1000);
        w14.lastTick = now;
        let changed = false;

        const neededButtons = Math.max(1, Math.min(8, totalPlayers));
        if (!w14.unlocked && w14.buttons.length !== neededButtons) {
            w14.buttons = buildDontTouchButtons(w14.cfg || {}, neededButtons);
            changed = true;
        }

        let pressedCount = 0;
        w14.buttons.forEach(btn => {
            const trigger = { x: btn.x - 2, y: btn.y - 6, w: btn.w + 4, h: btn.h + 10 };
            const isPressed = players.some(p => rectOverlap(getCatBox(p), trigger));
            if (isPressed) pressedCount++;
            if (btn.pressed !== isPressed) {
                btn.pressed = isPressed;
                changed = true;
            }
        });

        if (!w14.unlocked && w14.buttons.length > 0 && pressedCount >= w14.buttons.length) {
            w14.unlocked = true;
            room.state.keyVisible = true;
            changed = true;
        }

        if (updateDontTouchGauge(w14, room, pass, players, now, dt, helpers)) {
            changed = true;
        }

        if (changed) {
            const serialized = serializeWorld14(w14);
            room.state.world14 = serialized;
            io.to(pass).emit('world14Sync', serialized);
        }
        return;
    }

    // --- CẬP NHẬT MÀN 14-3 ---
    if (w14.mode === 'ropeTrapBridge' && w14.bridgeActive) {
        let hitIdx = -1;
        for (let i = 0; i < (w14.trapButtons || []).length; i++) {
            const tb = w14.trapButtons[i];
            const trigger = { x: tb.x - 3, y: tb.y - 3, w: tb.w + 6, h: tb.h + 6 };
            if (players.some(p => rectOverlap(getCatBox(p), trigger))) {
                hitIdx = i;
                break;
            }
        }

        if (hitIdx !== -1) {
            w14.bridgeActive = false;
            w14.triggeredIdx = hitIdx;
            const serialized = serializeWorld14(w14);
            room.state.world14 = serialized;
            io.to(pass).emit('world14Sync', serialized);
        }
        return;
    }

    // --- CẬP NHẬT MÀN 14-4: THANH GẠT NGANG + BỤC CHỞ DÀI [ALL] + DON'T TOUCH ME! ---
    if (w14.mode === 'dontTouchFinal') {
        const dt = Math.min(0.1, (now - w14.lastTick) / 1000);
        w14.lastTick = now;

        // 1. Thanh tường xanh dọc quét liên tục qua lại trên cao nguyên & bục Chìa khóa
        if (w14.sweeper && !w14.depleted) {
            const sw = w14.sweeper;
            sw.x += sw.dir * (sw.speed || 2.3);
            if (sw.x <= sw.minX) {
                sw.x = sw.minX;
                sw.dir = 1;
            } else if (sw.x >= sw.maxX) {
                sw.x = sw.maxX;
                sw.dir = -1;
            }
        }

        // 2. Bục chở dài [ALL]: đủ tất cả thành viên đứng lên -> tự trượt dọc đường ray về sàn đích
        if (w14.carrier && !w14.depleted) {
            const c = w14.carrier;
            if (!c.activated) {
                let onCarrier = 0;
                players.forEach(p => {
                    const box = getCatBox(p);
                    const cx = box.x + box.w / 2;
                    const bottomY = box.y + box.h;
                    if (cx >= c.x + 4 && cx <= c.x + c.w - 4 && bottomY <= c.y + 18 && bottomY >= c.y - 24) {
                        onCarrier++;
                    }
                });
                c.remaining = Math.max(0, totalPlayers - onCarrier);
                if (c.remaining === 0 && totalPlayers > 0) {
                    c.activated = true;
                }
            } else if (c.x < c.endX) {
                c.x = Math.min(c.endX, c.x + (c.speed || 2.2));
            }
        }

        // 3. Kiểm tra chạm nhau & tụt thanh hồng DON'T TOUCH ME!
        updateDontTouchGauge(w14, room, pass, players, now, dt, helpers);

        const serialized = serializeWorld14(w14);
        room.state.world14 = serialized;
        io.to(pass).emit('world14Sync', serialized);
    }
}

function registerSocket(socket, helpers) {
    // Dành sẵn nếu cần mở rộng thêm phím đặc biệt
}

module.exports = {
    initLevelState,
    updateRoom,
    registerSocket
};