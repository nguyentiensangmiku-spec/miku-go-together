// ================================================================
// SERVER CHUNG CHO CẢ 4 MÀN WORLD 11 (11-1, 11-2, 11-3, 11-4)
// ================================================================

function getRootCarrierId(w11, id) {
    let cur = id;
    const visited = new Set();
    while (w11.captured[cur] && !visited.has(cur)) {
        visited.add(cur);
        cur = w11.captured[cur];
    }
    return cur;
}

function serializeWorld11(w11) {
    const out = {
        enabled: true,
        mode: w11.mode,
        hintText: w11.hintText || '',
        hintX: w11.hintX || 340,
        hintY: w11.hintY || 225,
        suctionRange: w11.suctionRange || 340,
        suctionVertical: w11.suctionVertical || 105,
        pullSpeedX: w11.pullSpeedX || 5.4,
        pullSpeedY: w11.pullSpeedY || 4.2,
        holding: { ...w11.holding },
        captured: { ...w11.captured },
        sucking: { ...w11.sucking },
        bullets: w11.bullets.map(b => ({
            id: b.id,
            x: Math.round(b.x * 10) / 10,
            y: Math.round(b.y * 10) / 10,
            r: b.r,
            color: b.color,
            carryingId: b.carryingId || null
        }))
    };

    // Dữ liệu riêng của Màn 11-4 (Bục bay, Khối [1], 2 Nút Đỏ & Nắp hầm Chìa khóa)
    if (w11.mode === 'suctionFerry') {
        out.pitLid = w11.pitLid;
        out.pitOpen = w11.pitOpen;
        out.btn1 = w11.btn1;
        out.btn2 = w11.btn2;
        out.btn1Pressed = w11.btn1Pressed;
        out.btn2Pressed = w11.btn2Pressed;
        out.countdown = w11.countdown;
        out.countdownPos = w11.countdownPos;
        out.ferry = w11.ferry ? {
            x: Math.round(w11.ferry.x * 10) / 10,
            y: w11.ferry.y,
            w: w11.ferry.w,
            h: w11.ferry.h
        } : null;
        out.block = w11.block ? {
            x: Math.round(w11.block.x * 10) / 10,
            y: Math.round(w11.block.y * 10) / 10,
            w: w11.block.w,
            h: w11.block.h,
            alive: w11.block.alive,
            active: w11.block.active
        } : null;
    }

    return out;
}

function initLevelState(room, levelData, playerIds) {
    if (!levelData.handGimmick || !levelData.handGimmick.enabled) return;

    const cfg = levelData.handGimmick;
    const mode = cfg.mode || 'captureGun';

    const w11 = {
        enabled: true,
        mode,
        hintText: cfg.hintText || '',
        hintX: cfg.hintX || 340,
        hintY: cfg.hintY || 225,
        bulletSpeed: cfg.bulletSpeed || 10.5,
        maxRange: cfg.maxRange || 440,
        suctionRange: cfg.suctionRange || 340,
        suctionVertical: cfg.suctionVertical || 105,
        pullSpeedX: cfg.pullSpeedX || 5.4,
        pullSpeedY: cfg.pullSpeedY || 4.2,
        holding: {},
        captured: {},
        sucking: {},
        bullets: [],
        cooldowns: {},
        nextBulletId: 1
    };

    // Vị trí xuất phát riêng cho Màn 11-2
    if (mode === 'suctionGun' && cfg.leftSpawns && cfg.rightSpawnStart) {
        const total = playerIds.length;
        const leftCount = total <= 1 ? 0 : (total === 2 ? 1 : Math.min(cfg.leftSpawns.length, Math.floor(total / 2)));

        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            if (idx < leftCount) {
                const sp = cfg.leftSpawns[idx];
                p.x = sp.x;
                p.y = sp.y;
                p.facing = 1;
            } else {
                const rIdx = idx - leftCount;
                const gap = Math.min(54, Math.floor(340 / Math.max(1, total - leftCount)));
                p.x = cfg.rightSpawnStart.x + rIdx * gap;
                p.y = cfg.rightSpawnStart.y;
                p.facing = -1;
            }
            p.vx = 0;
            p.vy = 0;
        });
    }

    // Khởi tạo trạng thái & vị trí xuất phát 2 tầng cho Màn 11-4
    if (mode === 'suctionFerry') {
        w11.pitLid = cfg.pitLid ? { ...cfg.pitLid } : null;
        w11.pitOpen = false;
        w11.btn1 = cfg.btn1 ? { ...cfg.btn1 } : null;
        w11.btn2 = cfg.btn2 ? { ...cfg.btn2 } : null;
        w11.btn1Pressed = false;
        w11.btn2Pressed = false;
        w11.countdownSec = cfg.countdownSec || 9;
        w11.countdown = 0;
        w11.countdownEndAt = 0;
        w11.countdownPos = cfg.countdownPos || { x: 562, y: 258 };
        w11.ferry = cfg.ferry ? {
            ...cfg.ferry,
            state: 'idle', // idle | countdown | goingRight | pauseMid | goingLeft | arrivedEnd
            pauseUntil: 0,
            targetRightX: cfg.ferry.midX
        } : null;
        w11.block = cfg.block ? {
            ...cfg.block,
            vx: 0,
            vy: 0,
            alive: true,
            active: false,
            respawnAt: 0
        } : null;

        // Chia nửa phòng đứng tầng trên (cùng khối [1]), nửa phòng đứng tầng dưới giống video
        const total = playerIds.length;
        const topCount = total <= 1 ? 1 : Math.ceil(total / 2);
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            if (idx < topCount) {
                const gap = Math.min(62, Math.floor(250 / Math.max(1, topCount)));
                p.x = 230 + idx * gap;
                p.y = 149;
                p.facing = 1;
            } else {
                const bIdx = idx - topCount;
                const gap = Math.min(62, Math.floor(260 / Math.max(1, total - topCount)));
                p.x = 135 + bIdx * gap;
                p.y = 306;
                p.facing = 1;
            }
            p.vx = 0;
            p.vy = 0;
        });
    }

    room.state._world11 = w11;
    room.state.world11 = serializeWorld11(w11);
}

function releaseCapturedPlayer(room, pass, victimId, x, y, facing, io) {
    const w11 = room.state && room.state._world11;
    if (!w11) return;

    const p = room.players[victimId];
    delete w11.captured[victimId];

    if (!p) return;
    const safeX = Math.max(32, Math.min((room.levelData.width || 2420) - 70, Math.round(x)));
    const safeY = Math.max(32, Math.min((room.levelData.height || 500) - 80, Math.round(y)));

    p.x = safeX;
    p.y = safeY;
    p.vx = 0;
    p.vy = -2.5;
    p.facing = facing || 1;

    io.to(pass).emit('world11Release', {
        id: victimId,
        x: p.x,
        y: p.y,
        vx: 0,
        vy: -2.5,
        facing: p.facing
    });
}

function updateSuctionFerry(room, pass, players, now, helpers) {
    const w11 = room.state._world11;
    const { io, getCatBox, rectOverlap } = helpers;

    // Dọn trạng thái hút nếu người chơi đã vào cửa
    for (const pid in w11.sucking) {
        const p = room.players[pid];
        if (!p || p.enteredDoor) delete w11.sucking[pid];
    }

    // 1. Kiểm tra Nút Đỏ 1 (bắt đầu đếm ngược 9s -> chạy bục bay)
    let btn1Step = false;
    if (w11.btn1) {
        const trigger1 = { x: w11.btn1.x - 2, y: w11.btn1.y - 6, w: w11.btn1.w + 4, h: w11.btn1.h + 10 };
        btn1Step = players.some(p => rectOverlap(getCatBox(p), trigger1));
    }
    w11.btn1Pressed = btn1Step;

    const ferry = w11.ferry;
    let ferryDx = 0;

    if (ferry) {
        if (btn1Step && ferry.state === 'idle') {
            ferry.state = 'countdown';
            w11.countdownEndAt = now + w11.countdownSec * 1000;
            w11.countdown = w11.countdownSec;
        }

        if (ferry.state === 'countdown') {
            const remMs = w11.countdownEndAt - now;
            if (remMs <= 0) {
                w11.countdown = 0;
                ferry.state = 'goingRight';
                ferry.targetRightX = w11.pitOpen ? ferry.endX : ferry.midX;
            } else {
                w11.countdown = Math.ceil(remMs / 1000);
            }
        } else if (ferry.state === 'goingRight') {
            // Nếu nắp hầm vừa mở trong lúc đang bay -> cho phép đi tiếp sang bờ phải nếu đã cầm Chìa khóa
            if (w11.pitOpen && (room.state.keyHolder || room.state.doorUnlocked)) {
                ferry.targetRightX = ferry.endX;
            }
            const prevX = ferry.x;
            ferry.x = Math.min(ferry.targetRightX, ferry.x + (ferry.speed || 3.6));
            ferryDx = ferry.x - prevX;

            if (ferry.x >= ferry.targetRightX) {
                if (ferry.targetRightX >= ferry.endX) {
                    ferry.state = 'arrivedEnd';
                    ferry.pauseUntil = now + 5000;
                } else {
                    ferry.state = 'pauseMid';
                    ferry.pauseUntil = now + 1100;
                }
            }
        } else if (ferry.state === 'pauseMid') {
            if (now >= ferry.pauseUntil) {
                ferry.state = 'goingLeft';
            }
        } else if (ferry.state === 'arrivedEnd') {
            // Nếu tất cả chưa sang bờ phải và có người đứng bên trái -> tự quay lại đón sau 5s
            if (now >= ferry.pauseUntil) {
                const someoneLeft = players.some(p => p.x < 1900);
                if (someoneLeft) ferry.state = 'goingLeft';
            }
        } else if (ferry.state === 'goingLeft') {
            const prevX = ferry.x;
            ferry.x = Math.max(ferry.startX, ferry.x - (ferry.speed || 3.6) * 1.15);
            ferryDx = ferry.x - prevX;
            if (ferry.x <= ferry.startX) {
                ferry.state = 'idle';
            }
        }
    }

    // 2. Cập nhật vật lý Khối trắng [1] (đẩy tay, hút bằng Súng Hút Gió, đi theo bục bay & rơi xuống Nút Đỏ 2)
    const blk = w11.block;
    if (blk) {
        if (!blk.alive) {
            if (now >= blk.respawnAt) {
                blk.x = blk.respawnX;
                blk.y = blk.respawnY;
                blk.vx = 0;
                blk.vy = 0;
                blk.alive = true;
            }
        } else {
            const solids = [...(room.levelData.platforms || [])];
            if (w11.pitLid && !w11.pitOpen) solids.push(w11.pitLid);
            if (ferry) solids.push({ x: ferry.x, y: ferry.y, w: ferry.w, h: ferry.h, isFerry: true });

            // Nếu khối [1] đang nằm trên bục bay thì tự di chuyển ngang theo bục bay
            if (ferry && Math.abs(ferryDx) > 0.001) {
                const onFerryHoriz = blk.x + blk.w > ferry.x - ferryDx + 2 && blk.x < ferry.x - ferryDx + ferry.w - 2;
                const onFerryVert = Math.abs((blk.y + blk.h) - ferry.y) <= 6;
                if (onFerryHoriz && onFerryVert) {
                    blk.x += ferryDx;
                }
            }

            // Kiểm tra lực đẩy ngang từ mèo
            let moveX = 0;
            let moveY = 0;
            let beingSucked = false;
            blk.active = false;

            for (const p of players) {
                const box = getCatBox(p);
                const vertOverlap = box.y + box.h > blk.y + 4 && box.y < blk.y + blk.h - 4;
                if (vertOverlap) {
                    if (p.vx > 0 && box.x + box.w >= blk.x - 10 && box.x + box.w <= blk.x + 14) {
                        moveX += 3.2;
                        blk.active = true;
                    } else if (p.vx < 0 && box.x <= blk.x + blk.w + 10 && box.x >= blk.x + blk.w - 14) {
                        moveX -= 3.2;
                        blk.active = true;
                    }
                }
            }

            // Kiểm tra lực hút từ Súng Hút Gió (giữ phím E)
            const blkCx = blk.x + blk.w / 2;
            const blkCy = blk.y + blk.h / 2;
            const range = w11.suctionRange || 330;
            const vRange = w11.suctionVertical || 115;

            for (const sid in w11.sucking) {
                if (!w11.sucking[sid]) continue;
                const s = room.players[sid];
                if (!s || s.enteredDoor) continue;

                const sBox = getCatBox(s);
                const dir = s.facing === -1 ? -1 : 1;
                const nozzleX = dir === 1 ? (sBox.x + sBox.w) : sBox.x;
                const sCy = sBox.y + sBox.h / 2;

                const dxFromNozzle = (blkCx - nozzleX) * dir;
                const dy = sCy - blkCy;

                if (dxFromNozzle >= -10 && dxFromNozzle <= range && Math.abs(dy) <= vRange) {
                    beingSucked = true;
                    blk.active = true;
                    const targetX = dir === 1 ? (sBox.x + sBox.w + 6) : (sBox.x - blk.w - 6);
                    const diffX = targetX - blk.x;
                    if (Math.abs(diffX) > 2) {
                        moveX += Math.sign(diffX) * Math.min(Math.abs(diffX), 5.2);
                    }
                    const targetY = sBox.y + sBox.h - blk.h;
                    const diffY = targetY - blk.y;
                    if (Math.abs(diffY) > 2) {
                        moveY += Math.sign(diffY) * Math.min(Math.abs(diffY), 4.0);
                    }
                }
            }

            // Di chuyển ngang khối [1] (chặn tường)
            moveX = Math.max(-6.5, Math.min(6.5, moveX));
            if (Math.abs(moveX) > 0.05) {
                const nextX = blk.x + moveX;
                const testBoxX = { x: nextX, y: blk.y + 2, w: blk.w, h: blk.h - 4 };
                const blockedX = solids.some(s => rectOverlap(testBoxX, s));
                if (!blockedX && nextX >= 26 && nextX + blk.w <= (room.levelData.width || 2400) - 26) {
                    blk.x = nextX;
                }
            }

            // Di chuyển dọc khối [1] (hút chống trọng lực, thả ra là rơi xuống)
            if (beingSucked) {
                blk.vy = 0;
                if (Math.abs(moveY) > 0.05) {
                    const nextY = blk.y + Math.max(-5, Math.min(5, moveY));
                    const testBoxY = { x: blk.x + 2, y: nextY, w: blk.w - 4, h: blk.h };
                    if (!solids.some(s => rectOverlap(testBoxY, s))) {
                        blk.y = nextY;
                    }
                }
            } else {
                blk.vy = Math.min(11, (blk.vy || 0) + 0.85);
                const nextY = blk.y + blk.vy;
                let supportY = null;

                for (const s of solids) {
                    if (blk.x + blk.w > s.x + 2 && blk.x < s.x + s.w - 2) {
                        if (blk.y + blk.h <= s.y + 14 && nextY + blk.h >= s.y) {
                            if (supportY === null || s.y < supportY) supportY = s.y;
                        }
                    }
                }

                if (supportY !== null) {
                    blk.y = supportY - blk.h;
                    blk.vy = 0;
                } else {
                    blk.y = nextY;
                }
            }

            // Kiểm tra khối [1] rơi trúng Nút Đỏ 2 trên cột giữa biển dung nham -> Mở nắp hầm Chìa khóa!
            if (w11.btn2 && !w11.pitOpen) {
                const btn2Box = { x: w11.btn2.x - 10, y: w11.btn2.y - 8, w: w11.btn2.w + 20, h: w11.btn2.h + 14 };
                if (rectOverlap({ x: blk.x, y: blk.y, w: blk.w, h: blk.h }, btn2Box)) {
                    w11.btn2Pressed = true;
                    w11.pitOpen = true;
                }
            }

            // Nếu khối [1] rơi hụt xuống dung nham -> Tự hồi lại trên tầng trên sau 0.7s
            if (blk.y + blk.h >= 465) {
                blk.alive = false;
                blk.respawnAt = now + 700;
            }
        }
    }

    const serialized = serializeWorld11(w11);
    room.state.world11 = serialized;
    io.to(pass).emit('world11Sync', serialized);
}

function updateRoom(room, pass, players, totalPlayers, now, helpers) {
    const w11 = room.state && room.state._world11;
    if (!w11 || !w11.enabled) return;

    const { io, getCatBox, circleRectOverlap } = helpers;
    let changed = false;

    // --- CHẾ ĐỘ 11-4: SÚNG HÚT GIÓ + BỤC BAY + KHỐI [1] ---
    if (w11.mode === 'suctionFerry') {
        updateSuctionFerry(room, pass, players, now, helpers);
        return;
    }

    // --- CHẾ ĐỘ 11-2: SÚNG HÚT GIÓ ---
    if (w11.mode === 'suctionGun') {
        for (const pid in w11.sucking) {
            const p = room.players[pid];
            if (!p || p.enteredDoor) {
                delete w11.sucking[pid];
                changed = true;
            }
        }
        if (changed) {
            const serialized = serializeWorld11(w11);
            room.state.world11 = serialized;
            io.to(pass).emit('world11Sync', serialized);
        }
        return;
    }

    // --- CHẾ ĐỘ 11-1 & 11-3: SÚNG THU PHỤC & HÚT LỒNG NHAU ---
    for (const shooterId in w11.holding) {
        const held = w11.holding[shooterId];
        const shooter = room.players[shooterId];
        const victim = room.players[held.id];

        if (!victim) {
            delete w11.holding[shooterId];
            changed = true;
            continue;
        }

        if (!shooter || shooter.enteredDoor) {
            const rx = shooter ? shooter.x : victim.x;
            const ry = shooter ? shooter.y : 380;
            delete w11.holding[shooterId];
            releaseCapturedPlayer(room, pass, held.id, rx, ry, 1, io);
            changed = true;
        }
    }

    for (const victimId in w11.captured) {
        const victim = room.players[victimId];
        if (!victim) {
            delete w11.captured[victimId];
            changed = true;
            continue;
        }
        const rootId = getRootCarrierId(w11, victimId);
        const carrierBullet = w11.bullets.find(b => b.carryingId === rootId);
        const rootPlayer = room.players[rootId];
        if (carrierBullet) {
            victim.x = carrierBullet.x - 18;
        } else if (rootPlayer) {
            victim.x = rootPlayer.x;
        }
        victim.y = -999;
        victim.vx = 0;
        victim.vy = 0;
    }

    if (w11.bullets.length > 0) {
        changed = true;
        const platforms = room.levelData.platforms || [];
        const remainingBullets = [];

        for (const b of w11.bullets) {
            const subSteps = 2;
            let alive = true;

            for (let s = 0; s < subSteps; s++) {
                const stepX = b.vx / subSteps;
                b.x += stepX;
                b.traveled += Math.abs(stepX);

                if (b.carryingId && room.players[b.carryingId]) {
                    room.players[b.carryingId].x = b.x - 18;
                    room.players[b.carryingId].y = -999;
                }

                let hitSolid = null;
                for (const pl of platforms) {
                    if (circleRectOverlap(b.x, b.y, b.r, pl)) {
                        hitSolid = pl;
                        break;
                    }
                }

                if (hitSolid) {
                    if (b.carryingId) {
                        const popX = b.vx > 0 ? (hitSolid.x - 38) : (hitSolid.x + hitSolid.w + 2);
                        const popY = b.y - 20;
                        releaseCapturedPlayer(room, pass, b.carryingId, popX, popY, b.vx > 0 ? 1 : -1, io);
                    }
                    alive = false;
                    break;
                }

                let hitCat = null;
                for (const p of players) {
                    if (p.id === b.shooterId || p.id === b.carryingId) continue;
                    if (w11.captured[p.id]) continue;
                    const box = getCatBox(p);
                    if (circleRectOverlap(b.x, b.y, b.r, box)) {
                        hitCat = p;
                        break;
                    }
                }

                if (hitCat) {
                    if (!b.carryingId) {
                        const shooter = room.players[b.shooterId];
                        if (shooter && !shooter.enteredDoor && !w11.holding[b.shooterId] && !w11.captured[b.shooterId]) {
                            w11.holding[b.shooterId] = { id: hitCat.id, color: hitCat.color };
                            w11.captured[hitCat.id] = b.shooterId;
                            hitCat.x = shooter.x;
                            hitCat.y = -999;
                            hitCat.vx = 0;
                            hitCat.vy = 0;
                        }
                    } else {
                        const popX = b.vx > 0 ? (hitCat.x - 38) : (hitCat.x + 38);
                        releaseCapturedPlayer(room, pass, b.carryingId, popX, b.y - 20, b.vx > 0 ? 1 : -1, io);
                    }
                    alive = false;
                    break;
                }

                if (b.traveled >= w11.maxRange || b.x < 32 || b.x > (room.levelData.width || 2420) - 32) {
                    if (b.carryingId) {
                        releaseCapturedPlayer(room, pass, b.carryingId, b.x - 18, b.y - 20, b.vx > 0 ? 1 : -1, io);
                    }
                    alive = false;
                    break;
                }
            }

            if (alive) remainingBullets.push(b);
        }

        w11.bullets = remainingBullets;
    }

    if (changed) {
        const serialized = serializeWorld11(w11);
        room.state.world11 = serialized;
        io.to(pass).emit('world11Sync', serialized);
    }
}

function registerSocket(socket, helpers) {
    const { io, rooms, getCatBox } = helpers;

    // Phím E cho Màn 11-1 & 11-3
    socket.on('world11Shoot', () => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (!room || !room.state || !room.state._world11) return;

        const w11 = room.state._world11;
        if (w11.mode !== 'captureGun') return;

        const p = room.players[socket.id];
        if (!p || p.enteredDoor || w11.captured[socket.id]) return;

        const now = Date.now();
        if (w11.cooldowns[socket.id] && now < w11.cooldowns[socket.id]) return;
        w11.cooldowns[socket.id] = now + 260;

        const box = getCatBox(p);
        const dir = p.facing === -1 ? -1 : 1;
        const startX = dir === 1 ? (box.x + box.w + 8) : (box.x - 8);
        const startY = box.y + Math.round(box.h * 0.56);

        const held = w11.holding[socket.id];
        if (held) {
            delete w11.holding[socket.id];
            w11.bullets.push({
                id: w11.nextBulletId++,
                shooterId: socket.id,
                carryingId: held.id,
                x: startX,
                y: startY,
                vx: dir * w11.bulletSpeed,
                r: 8,
                color: held.color,
                traveled: 0
            });
        } else {
            w11.bullets.push({
                id: w11.nextBulletId++,
                shooterId: socket.id,
                carryingId: null,
                x: startX,
                y: startY,
                vx: dir * w11.bulletSpeed,
                r: 6,
                color: p.color,
                traveled: 0
            });
        }

        const serialized = serializeWorld11(w11);
        room.state.world11 = serialized;
        io.to(pass).emit('world11Sync', serialized);
    });

    // Giữ/thả phím E cho Màn 11-2 & 11-4 (Súng Hút Gió)
    socket.on('world11Suction', ({ active }) => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (!room || !room.state || !room.state._world11) return;

        const w11 = room.state._world11;
        if (w11.mode !== 'suctionGun' && w11.mode !== 'suctionFerry') return;

        const p = room.players[socket.id];
        if (!p || p.enteredDoor) {
            delete w11.sucking[socket.id];
        } else if (active) {
            w11.sucking[socket.id] = true;
        } else {
            delete w11.sucking[socket.id];
        }

        const serialized = serializeWorld11(w11);
        room.state.world11 = serialized;
        io.to(pass).emit('world11Sync', serialized);
    });
}

module.exports = {
    initLevelState,
    updateRoom,
    registerSocket
};