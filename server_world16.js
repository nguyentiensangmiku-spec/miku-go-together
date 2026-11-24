// ================================================================
// SERVER CHUNG CHO CẢ 4 MÀN WORLD 16 (16-1, 16-2, 16-3, 16-4)
// ================================================================

function circleRectOverlap(cx, cy, r, rect) {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (r * r);
}

function serializeWorld16(w16) {
    if (w16.mode === 'dangerPillars') {
        return {
            enabled: true,
            mode: 'dangerPillars',
            ceilingY: w16.ceilingY,
            chamberLeftX: w16.chamberLeftX,
            chamberRightX: w16.chamberRightX,
            trapTriggered: w16.trapTriggered,
            pillars: (w16.pillars || []).map(p => ({
                x: p.x,
                w: p.w,
                bottomY: Math.round(p.bottomY * 10) / 10
            })),
            wavyY: Math.round(w16.wavyY * 10) / 10,
            caught: w16.caught,
            caughtIds: w16.caughtIds
        };
    }

    if (w16.mode === 'sawBlock') {
        return {
            enabled: true,
            mode: 'sawBlock',
            floatingPlatform: w16.floatingPlatform,
            saws: (w16.saws || []).map(s => ({
                id: s.id,
                x: Math.round(s.x * 10) / 10,
                y: Math.round(s.y * 10) / 10,
                r: s.r,
                dir: s.dir,
                state: s.state,
                angle: Math.round(s.angle * 100) / 100
            })),
            blocks: (w16.blocks || []).map(b => ({
                id: b.id,
                x: Math.round(b.x * 10) / 10,
                y: Math.round(b.y * 10) / 10,
                w: b.w,
                h: b.h,
                remaining: b.remaining
            })),
            caught: w16.caught,
            caughtIds: w16.caughtIds
        };
    }

    return { enabled: true, mode: w16.mode };
}

function initLevelState(room, levelData, playerIds, helpers) {
    if (!levelData.world16 || !levelData.world16.enabled) return;

    const cfg = levelData.world16;
    const mode = cfg.mode || 'dangerPillars';
    const total = Math.max(1, playerIds.length);

    // --- WORLD 16 - MÀN 16-1: 4 CỘT XANH SẬP ĐỠ BẰNG ĐẦU + SÓNG XANH HẠ DẦN ---
    if (mode === 'dangerPillars') {
        const gap = Math.min(46, Math.floor(390 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 75 + idx * gap;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
            p.scale = 1;
        });

        const allPositions = cfg.pillarPositions || [];
        const activeCount = total >= 5
            ? allPositions.length
            : Math.min(allPositions.length, Math.max(1, total - 1));

        const selectedPositions = allPositions.slice(allPositions.length - activeCount);
        const startBottomY = cfg.pillarStartBottomY || 256;

        const pillars = selectedPositions.map(pos => ({
            x: pos.x,
            w: pos.w || 44,
            bottomY: startBottomY,
            dropSpeed: cfg.pillarDropSpeed || 4.8
        }));

        const keyTeam = Math.max(1, total - activeCount);
        let keyY = 262;
        if (keyTeam >= 4) keyY = 148;
        else if (keyTeam === 3) keyY = 186;
        else if (keyTeam === 2) keyY = 224;

        if (levelData.key) {
            room.levelData = {
                ...levelData,
                key: { ...levelData.key, y: keyY }
            };
        }

        const w16 = {
            enabled: true,
            mode: 'dangerPillars',
            ceilingY: cfg.ceilingY || 28,
            chamberFloorY: cfg.chamberFloorY || 350,
            chamberLeftX: cfg.chamberLeftX || 776,
            chamberRightX: cfg.chamberRightX || 1412,
            pillars,
            wavyY: cfg.wavyStartY || 38,
            wavyMaxY: cfg.wavyMaxY || 326,
            wavySpeed: cfg.wavySpeed || 0.56,
            trapTriggered: false,
            triggeredAt: 0,
            caught: false,
            caughtIds: [],
            restarting: false
        };

        room.state._world16 = w16;
        room.state.world16 = serializeWorld16(w16);
        return;
    }

    // --- WORLD 16 - MÀN 16-2: 2 LƯỠI CƯA XANH + 2 KHỐI ĐẨY [ALL] & [1] ---
    if (mode === 'sawBlock') {
        const gap = Math.min(44, Math.floor(380 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 75 + idx * gap;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
            p.scale = 1;
        });

        const getReq = (req) => {
            if (helpers && helpers.getRequiredCount) return helpers.getRequiredCount(req, total);
            if (req === 'ALL') return total;
            return Math.min(total, Number(req) || 1);
        };

        const blocks = (cfg.blocks || []).map(b => ({
            ...b,
            vy: 0,
            remaining: getReq(b.required)
        }));

        const sawsCfg = cfg.saws || (cfg.saw ? [cfg.saw] : []);
        const saws = sawsCfg.map((sCfg, idx) => ({
            id: sCfg.id || `saw_${idx}`,
            x: sCfg.x,
            y: sCfg.y,
            r: sCfg.r || 46,
            vy: 0,
            dir: sCfg.startDir || -1,
            startDir: sCfg.startDir || -1,
            rollSpeed: sCfg.rollSpeed || 470,
            state: 'idle', // idle | dropping | rolling
            angle: 0
        }));

        const w16 = {
            enabled: true,
            mode: 'sawBlock',
            floorY: cfg.floorY || 445,
            leftWallX: cfg.leftWallX || 30,
            rightWallX: cfg.rightWallX || 1930,
            floatingPlatform: cfg.floatingPlatform ? { ...cfg.floatingPlatform } : null,
            saws,
            blocks,
            lastTick: Date.now(),
            caught: false,
            caughtIds: [],
            restarting: false
        };

        room.state._world16 = w16;
        room.state.world16 = serializeWorld16(w16);
    }
}

function updateRoom(room, pass, players, totalPlayers, now, helpers) {
    const w16 = room.state && room.state._world16;
    if (!w16 || !w16.enabled) return;

    const { io, rooms, startLevelForRoom, getCatBox, rectOverlap, getRequiredCount } = helpers;

    // --- CẬP NHẬT MÀN 16-1 ---
    if (w16.mode === 'dangerPillars') {
        if (w16.caught) return;

        let changed = false;

        if (!w16.trapTriggered && (room.state.keyHolder || room.state.doorUnlocked)) {
            w16.trapTriggered = true;
            w16.triggeredAt = now;
            changed = true;
        }

        if (w16.trapTriggered) {
            const dropDelay = totalPlayers <= 1 ? 1100 : 0;

            if (now - w16.triggeredAt >= dropDelay) {
                for (const pil of w16.pillars) {
                    if (pil.bottomY >= w16.chamberFloorY) continue;

                    const nextBottom = Math.min(w16.chamberFloorY, pil.bottomY + (pil.dropSpeed || 4.8));
                    let supportY = null;

                    for (const p of players) {
                        const box = getCatBox(p);
                        const horizSupport = box.x + box.w > pil.x - 4 && box.x < pil.x + pil.w + 4;
                        if (!horizSupport) continue;

                        if (box.y < w16.chamberFloorY - 20 && pil.bottomY <= box.y + 14 && nextBottom >= box.y - 1) {
                            const headStop = Math.floor(box.y) - 1;
                            if (supportY === null || headStop < supportY) {
                                supportY = headStop;
                            }
                        }
                    }

                    const finalBottom = supportY !== null
                        ? Math.max(pil.bottomY, Math.min(nextBottom, supportY))
                        : nextBottom;

                    if (Math.abs(finalBottom - pil.bottomY) > 0.05) {
                        pil.bottomY = finalBottom;
                        changed = true;
                    }
                }
            }

            if (w16.wavyY < w16.wavyMaxY) {
                w16.wavyY = Math.min(w16.wavyMaxY, w16.wavyY + (w16.wavySpeed || 0.56));
                changed = true;
            }

            const wavyHitbox = {
                x: w16.chamberLeftX,
                y: w16.wavyY - 4,
                w: w16.chamberRightX - w16.chamberLeftX,
                h: 9
            };

            const hitPlayers = players.filter(p => {
                const box = getCatBox(p);
                const catHit = { x: box.x + 5, y: box.y + 4, w: Math.max(4, box.w - 10), h: Math.max(4, box.h - 8) };
                return rectOverlap(catHit, wavyHitbox);
            });

            if (hitPlayers.length > 0) {
                w16.caught = true;
                w16.caughtIds = hitPlayers.map(p => p.id);
                changed = true;

                if (!w16.restarting) {
                    w16.restarting = true;
                    setTimeout(() => {
                        const r = rooms[pass];
                        if (r && r.state && r.state._world16 && r.state._world16.restarting) {
                            startLevelForRoom(r, r.world, r.level);
                        }
                    }, 850);
                }
            }
        }

        if (changed) {
            const serialized = serializeWorld16(w16);
            room.state.world16 = serialized;
            io.to(pass).emit('world16Sync', serialized);
        }
        return;
    }

    // --- CẬP NHẬT MÀN 16-2: 2 KHỐI ĐẨY [ALL] / [1] & 2 LƯỠI CƯA XANH ---
    if (w16.mode === 'sawBlock') {
        const dt = Math.min(0.05, Math.max(0.008, (now - (w16.lastTick || now)) / 1000));
        w16.lastTick = now;

        if (w16.caught) return;

        const solids = [...(room.levelData.platforms || [])];
        if (w16.floatingPlatform) solids.push(w16.floatingPlatform);

        // 1. Cập nhật 2 khối đẩy
        for (const blk of w16.blocks) {
            const reqCount = getRequiredCount
                ? getRequiredCount(blk.required, totalPlayers)
                : (blk.required === 'ALL' ? totalPlayers : Math.min(totalPlayers, Number(blk.required) || 1));

            const pushMargin = Math.max(42, reqCount * 42);
            let pushRight = 0;
            let pushLeft = 0;

            players.forEach(p => {
                const box = getCatBox(p);
                const vertOverlap = box.y + box.h > blk.y + 4 && box.y < blk.y + blk.h - 4;
                if (!vertOverlap) return;

                if (box.x + box.w >= blk.x - pushMargin && box.x + box.w <= blk.x + 16 && p.vx > 0.1) pushRight++;
                if (box.x <= blk.x + blk.w + pushMargin && box.x >= blk.x + blk.w - 16 && p.vx < -0.1) pushLeft++;
            });

            const activePush = Math.max(pushRight, pushLeft);
            blk.remaining = Math.max(0, reqCount - activePush);

            let pushDir = 0;
            if (pushRight >= reqCount && reqCount > 0) pushDir = 1;
            else if (pushLeft >= reqCount && reqCount > 0) pushDir = -1;

            if (pushDir !== 0) {
                const stepX = pushDir * (blk.speed || 3.3);
                const nextX = Math.max(w16.leftWallX, Math.min(w16.rightWallX - blk.w, blk.x + stepX));
                const testBoxX = { x: nextX, y: blk.y + 2, w: blk.w, h: blk.h - 4 };
                const hitSolid = solids.some(s => rectOverlap(testBoxX, s));
                const hitOther = w16.blocks.some(ob => ob !== blk && rectOverlap(testBoxX, { x: ob.x, y: ob.y + 2, w: ob.w, h: ob.h - 4 }));

                if (!hitSolid && !hitOther) {
                    const actualDx = nextX - blk.x;
                    blk.x = nextX;

                    for (const ob of w16.blocks) {
                        if (ob === blk) continue;
                        const onTopH = ob.x + ob.w > blk.x - actualDx + 2 && ob.x < blk.x - actualDx + blk.w - 2;
                        const onTopV = Math.abs((ob.y + ob.h) - blk.y) <= 6;
                        if (onTopH && onTopV) {
                            const obNextX = Math.max(w16.leftWallX, Math.min(w16.rightWallX - ob.w, ob.x + actualDx));
                            if (!solids.some(s => rectOverlap({ x: obNextX, y: ob.y + 2, w: ob.w, h: ob.h - 4 }, s))) {
                                ob.x = obNextX;
                            }
                        }
                    }
                }
            }
        }

        // Trọng lực cho các khối đẩy
        for (const blk of w16.blocks) {
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

            for (const ob of w16.blocks) {
                if (ob === blk) continue;
                if (blk.x + blk.w > ob.x + 2 && blk.x < ob.x + ob.w - 2) {
                    if (blk.y + blk.h <= ob.y + 14 && nextY + blk.h >= ob.y) {
                        if (supportY === null || ob.y < supportY) supportY = ob.y;
                    }
                }
            }

            if (supportY !== null) {
                blk.y = supportY - blk.h;
                blk.vy = 0;
            } else {
                blk.y = Math.min(w16.floorY - blk.h, nextY);
            }
        }

        // 2. Cập nhật đồng thời CẢ 2 Lưỡi cưa xanh
        const keyTaken = Boolean(room.state.keyHolder || room.state.doorUnlocked);

        for (const saw of (w16.saws || [])) {
            if (saw.state === 'idle') {
                saw.angle += 3.2 * dt;
                if (keyTaken) {
                    saw.state = 'dropping';
                    saw.vy = 180;
                }
            } else if (saw.state === 'dropping') {
                saw.angle += 7.5 * dt;
                saw.vy = Math.min(980, (saw.vy || 0) + 2100 * dt);
                saw.y += saw.vy * dt;

                // Nếu rơi sượt cạnh khối đẩy thì trượt nhẹ sang mép để rơi xuống sàn không bị kẹt
                for (const blk of w16.blocks) {
                    if (circleRectOverlap(saw.x, saw.y, saw.r, blk)) {
                        if (saw.x <= blk.x + blk.w / 2) {
                            saw.x = Math.max(w16.leftWallX + saw.r, blk.x - saw.r - 1);
                            saw.dir = -1;
                        } else {
                            saw.x = Math.min(w16.rightWallX - saw.r, blk.x + blk.w + saw.r + 1);
                            saw.dir = 1;
                        }
                    }
                }

                if (saw.y + saw.r >= w16.floorY) {
                    saw.y = w16.floorY - saw.r;
                    saw.vy = 0;
                    saw.state = 'rolling';
                    saw.dir = saw.startDir || -1;
                }
            } else if (saw.state === 'rolling') {
                saw.x += saw.dir * (saw.rollSpeed || 470) * dt;
                saw.angle += saw.dir * 10.5 * dt;

                // Dội lại khi chạm tường trái / phải
                if (saw.x - saw.r <= w16.leftWallX) {
                    saw.x = w16.leftWallX + saw.r;
                    saw.dir = 1;
                } else if (saw.x + saw.r >= w16.rightWallX) {
                    saw.x = w16.rightWallX - saw.r;
                    saw.dir = -1;
                }

                // Cả 2 khối [ALL] và [1] khi nằm trên sàn đều chặn và dội ngược lưỡi cưa
                for (const blk of w16.blocks) {
                    if (blk.y + blk.h < w16.floorY - 40) continue;
                    if (!circleRectOverlap(saw.x, saw.y, saw.r, blk)) continue;

                    if (saw.dir > 0) {
                        saw.x = blk.x - saw.r - 0.5;
                        saw.dir = -1;
                    } else {
                        saw.x = blk.x + blk.w + saw.r + 0.5;
                        saw.dir = 1;
                    }
                }
            }
        }

        // Nếu 2 bánh răng lăn đụng nhau trên sàn thì tự dội ngược nhau
        const saws = w16.saws || [];
        if (saws.length >= 2 && saws[0].state === 'rolling' && saws[1].state === 'rolling') {
            const dist = Math.abs(saws[1].x - saws[0].x);
            const minD = saws[0].r + saws[1].r;
            if (dist < minD) {
                const mid = (saws[0].x + saws[1].x) / 2;
                if (saws[0].x <= saws[1].x) {
                    saws[0].x = mid - minD / 2 - 0.5;
                    saws[1].x = mid + minD / 2 + 0.5;
                    saws[0].dir = -1;
                    saws[1].dir = 1;
                } else {
                    saws[1].x = mid - minD / 2 - 0.5;
                    saws[0].x = mid + minD / 2 + 0.5;
                    saws[1].dir = -1;
                    saws[0].dir = 1;
                }
            }
        }

        // 3. Kiểm tra 2 bánh răng chém trúng người chơi -> nổ mắt (x x) & chơi lại màn
        const hitPlayers = players.filter(p => {
            const box = getCatBox(p);
            const catHit = { x: box.x + 5, y: box.y + 5, w: Math.max(4, box.w - 10), h: Math.max(4, box.h - 10) };
            return saws.some(saw => circleRectOverlap(saw.x, saw.y, saw.r - 5, catHit));
        });

        if (hitPlayers.length > 0) {
            w16.caught = true;
            w16.caughtIds = hitPlayers.map(p => p.id);
            if (!w16.restarting) {
                w16.restarting = true;
                setTimeout(() => {
                    const r = rooms[pass];
                    if (r && r.state && r.state._world16 && r.state._world16.restarting) {
                        startLevelForRoom(r, r.world, r.level);
                    }
                }, 850);
            }
        }

        const serialized = serializeWorld16(w16);
        room.state.world16 = serialized;
        io.to(pass).emit('world16Sync', serialized);
    }
}

function registerSocket(socket, helpers) {
    // Dành sẵn cho các phím bấm riêng của Màn 16-3, 16-4
}

module.exports = {
    initLevelState,
    updateRoom,
    registerSocket
};