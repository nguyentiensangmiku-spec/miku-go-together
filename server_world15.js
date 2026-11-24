// ================================================================
// SERVER CHUNG CHO CẢ 4 MÀN WORLD 15 (15-1, 15-2, 15-3, 15-4)
// ================================================================

function pointInCone(px, py, cone) {
    const dx = px - cone.ax;
    const dy = py - cone.ay;
    const distSq = dx * dx + dy * dy;
    if (distSq > cone.radius * cone.radius) return false;
    if (distSq < 1) return true;

    let diff = Math.atan2(dy, dx) - cone.dirAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return Math.abs(diff) <= cone.halfAngle;
}

function boxHitsCone(box, cone) {
    const x1 = box.x + 5;
    const y1 = box.y + 5;
    const x2 = box.x + Math.max(6, box.w - 5);
    const y2 = box.y + Math.max(6, box.h - 5);
    const xm = (x1 + x2) / 2;
    const ym = (y1 + y2) / 2;

    return (
        pointInCone(xm, ym, cone) ||
        pointInCone(x1, y1, cone) ||
        pointInCone(x2, y1, cone) ||
        pointInCone(x1, y2, cone) ||
        pointInCone(x2, y2, cone) ||
        pointInCone(xm, y1, cone) ||
        pointInCone(xm, y2, cone) ||
        pointInCone(x1, ym, cone) ||
        pointInCone(x2, ym, cone)
    );
}

function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = copy[i];
        copy[i] = copy[j];
        copy[j] = tmp;
    }
    return copy;
}

function serializeWorld15(w15) {
    if (w15.mode === 'spotlights') {
        return {
            enabled: true,
            mode: 'spotlights',
            tunnelRect: w15.tunnelRect,
            checkpoint: w15.checkpoint,
            checkpointReached: w15.checkpointReached,
            checkpointJustHitAt: w15.checkpointJustHitAt,
            tallState: w15.tallState,
            shortState: w15.shortState,
            zone2State: w15.zone2State,
            zone1TallCones: w15.zone1TallCones,
            zone1ShortCones: w15.zone1ShortCones,
            zone2RoofCones: w15.zone2RoofCones,
            zone3TiltedCone: w15.zone3TiltedCone,
            caught: w15.caught,
            caughtIds: w15.caughtIds
        };
    }

    if (w15.mode === 'trackCarrier') {
        return {
            enabled: true,
            mode: 'trackCarrier',
            carrier: {
                x: Math.round(w15.carrier.x * 10) / 10,
                y: Math.round(w15.carrier.y * 10) / 10,
                w: w15.carrier.w,
                h: w15.carrier.h,
                remaining: w15.carrier.remaining,
                activated: w15.carrier.activated
            },
            waypoints: w15.waypoints,
            redWalls: w15.redWalls,
            redSpikes: w15.redSpikes,
            pitHazard: w15.pitHazard
        };
    }

    if (w15.mode === 'skillFormation') {
        return {
            enabled: true,
            mode: 'skillFormation',
            startButton: w15.startButton,
            buttonPressed: w15.buttonPressed,
            countdown: w15.countdown,
            carrier: {
                x: Math.round(w15.carrier.x * 10) / 10,
                y: Math.round(w15.carrier.y * 10) / 10,
                w: w15.carrier.w,
                h: w15.carrier.h,
                activated: w15.carrier.activated
            },
            waypoints: w15.waypoints,
            redWalls: w15.redWalls,
            pitHazards: w15.pitHazards,
            anchorId: w15.anchorId,
            linkedIds: Object.keys(w15.links || {}),
            linkedPositions: w15.linkedPositions || {}
        };
    }

    if (w15.mode === 'rememberMatch') {
        return {
            enabled: true,
            mode: 'rememberMatch',
            halfDx: w15.halfDx,
            playerScale: w15.playerScale,
            phase: w15.phase,
            timeLeft: w15.timeLeft,
            showGo: w15.showGo,
            targets: w15.targets,
            boxes: (w15.boxes || []).map(b => ({
                id: b.id,
                ownerId: b.ownerId,
                color: b.color,
                x: Math.round(b.x * 10) / 10,
                y: Math.round(b.y * 10) / 10,
                w: b.w,
                h: b.h,
                targetX: b.targetX,
                targetY: b.targetY
            })),
            results: w15.results,
            revealCount: w15.revealCount,
            failedReset: w15.failedReset
        };
    }

    return { enabled: true, mode: w15.mode };
}

function initLevelState(room, levelData, playerIds, helpers) {
    if (!levelData.world15 || !levelData.world15.enabled) {
        room._w15CheckpointRespawn = null;
        return;
    }

    const cfg = levelData.world15;
    const mode = cfg.mode || 'spotlights';
    const total = Math.max(1, playerIds.length);

    // --- WORLD 15 - MÀN 15-1: ĐÈN PHA ĐỘI HÌNH + HẦM CHECKPOINT ---
    if (mode === 'spotlights') {
        const respawnAtCP = room._w15CheckpointRespawn === '15-1';
        room._w15CheckpointRespawn = null;

        const cp = cfg.checkpoint || { spawnX: 2210, spawnY: 406 };
        const startX = respawnAtCP ? cp.spawnX : 75;
        const startY = respawnAtCP ? cp.spawnY : 406;
        const maxSpan = respawnAtCP ? 360 : 340;
        const gap = Math.min(44, Math.floor(maxSpan / total));

        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = startX + idx * gap;
            p.y = startY;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
            p.scale = 1;
        });

        const w15 = {
            enabled: true,
            mode: 'spotlights',
            startTime: Date.now(),
            tunnelRect: cfg.tunnelRect ? { ...cfg.tunnelRect } : null,
            checkpoint: cfg.checkpoint ? { ...cfg.checkpoint } : null,
            checkpointReached: respawnAtCP,
            checkpointJustHitAt: 0,
            zone1Timing: cfg.zone1Timing || { activeMs: 2200, telegraphMs: 650 },
            zone2Timing: cfg.zone2Timing || { offMs: 4400, telegraphMs: 1000, activeMs: 2000 },
            zone1TallCones: (cfg.zone1TallCones || []).map(c => ({ ...c })),
            zone1ShortCones: (cfg.zone1ShortCones || []).map(c => ({ ...c })),
            zone2RoofCones: (cfg.zone2RoofCones || []).map(c => ({ ...c })),
            zone3TiltedCone: cfg.zone3TiltedCone ? { ...cfg.zone3TiltedCone } : null,
            tallState: 'active',
            shortState: 'off',
            zone2State: 'off',
            caught: false,
            caughtIds: [],
            restarting: false
        };

        room.state._world15 = w15;
        room.state.world15 = serializeWorld15(w15);
        return;
    }

    // --- WORLD 15 - MÀN 15-2: BỤC CHỞ TỐC ĐỘ CAO + KHỐI L GAI NHỌN + CẶP TRỤ ĐỎ KẸP ĐÔI ---
    if (mode === 'trackCarrier') {
        const gap = Math.min(44, Math.floor(350 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 65 + idx * gap;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
            p.scale = 1;
        });

        const wps = (cfg.waypoints || []).map(pt => ({ ...pt }));
        const startPt = wps[0] || { x: 510, y: 428 };
        const cCfg = cfg.carrier || {};

        const w15 = {
            enabled: true,
            mode: 'trackCarrier',
            carrier: {
                x: startPt.x,
                y: startPt.y,
                w: cCfg.w || 320,
                h: cCfg.h || 18,
                speed: cCfg.speed || 3.6,
                remaining: total,
                activated: false,
                wpIdx: 1
            },
            waypoints: wps,
            redWalls: (cfg.redWalls || []).map(rw => ({ ...rw })),
            redSpikes: (cfg.redSpikes || []).map(sp => ({ ...sp })),
            pitHazard: cfg.pitHazard ? { ...cfg.pitHazard } : null
        };

        room.state._world15 = w15;
        room.state.world15 = serializeWorld15(w15);
        return;
    }

    // --- WORLD 15 - MÀN 15-3: KỸ NĂNG GHÉP ĐỘI HÌNH CỨNG (E / SHIFT) + BỤC NHỎ CHẠY ĐƯỜNG RAY ---
    if (mode === 'skillFormation') {
        const gap = Math.min(44, Math.floor(380 / total));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 260 + idx * gap;
            p.y = 406;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
            p.scale = 1;
        });

        const wps = (cfg.waypoints || []).map(pt => ({ ...pt }));
        const startPt = wps[0] || { x: 800, y: 428 };
        const cCfg = cfg.carrier || {};

        const w15 = {
            enabled: true,
            mode: 'skillFormation',
            startButton: cfg.startButton ? { ...cfg.startButton } : { x: 715, y: 433, w: 36, h: 12 },
            buttonPressed: false,
            countdownStartAt: 0,
            countdown: 0,
            carrier: {
                x: startPt.x,
                y: startPt.y,
                w: cCfg.w || 112,
                h: cCfg.h || 16,
                speed: cCfg.speed || 2.8,
                activated: false,
                wpIdx: 1
            },
            waypoints: wps,
            redWalls: (cfg.redWalls || []).map(rw => ({ ...rw })),
            pitHazards: (cfg.pitHazards || []).map(ph => ({ ...ph })),
            anchorId: null,
            links: {},
            linkedPositions: {},
            restarting: false
        };

        room.state._world15 = w15;
        room.state.world15 = serializeWorld15(w15);
        return;
    }

    // --- WORLD 15 - MÀN 15-4: REMEMBER! 2 MÀN HÌNH SO SÁNH + HỘP MÀU ĐẨY THEO MÀU ---
    if (mode === 'rememberMatch') {
        const pScale = cfg.playerScale || 0.72;
        const catH = Math.round(39 * pScale);
        const boxSize = cfg.boxSize || 26;
        const memSec = cfg.memorizeSec || 15;
        const playSec = cfg.playSec || 30;

        // Xếp cả phòng ngay ngắn dưới sàn đáy của khung bên phải
        const gap = total <= 1 ? 0 : Math.min(42, Math.floor(310 / (total - 1)));
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = 486 + idx * gap;
            p.y = 462 - catH;
            p.vx = 0;
            p.vy = 0;
            p.facing = 1;
            p.scale = pScale;
        });

        const allSpots = shuffleArray((cfg.candidateSpots || []).map((sp, idx) => ({ ...sp, _id: idx })));
        const usedSpotIds = new Set();

        // 1. Tạo tối đa 3 hộp màu (ứng với các người chơi ngẫu nhiên trong phòng) & chọn mốc đích luôn giải được
        const startSlots = cfg.boxStartSlots || [
            { x: 573, floorY: 244, zone: 'upperLeft' },
            { x: 580, floorY: 352, zone: 'lowerLeft' },
            { x: 762, floorY: 242, zone: 'upperRight' }
        ];
        const boxCount = Math.min(startSlots.length, total);
        const boxOwnerIds = shuffleArray(playerIds).slice(0, boxCount);
        const boxes = [];

        for (let i = 0; i < boxCount; i++) {
            const ownerId = boxOwnerIds[i];
            const owner = room.players[ownerId];
            const slot = startSlots[i];

            // Chọn mốc đích ở tầng bằng hoặc thấp hơn (lowerLeft / lowerRight / floor) và cách xa vị trí xuất phát
            let chosen = allSpots.find(sp =>
                !usedSpotIds.has(sp._id) &&
                !sp.catOnly &&
                (sp.zone === 'lowerLeft' || sp.zone === 'lowerRight' || sp.zone === 'floor') &&
                sp.floorY >= slot.floorY &&
                (sp.floorY > slot.floorY || Math.abs(sp.x - slot.x) > 65)
            );
            if (!chosen) {
                chosen = allSpots.find(sp => !usedSpotIds.has(sp._id) && !sp.catOnly && sp.floorY >= slot.floorY);
            }
            if (!chosen) {
                chosen = { _id: -1 - i, x: 548 + i * 70, floorY: 462 };
            }
            usedSpotIds.add(chosen._id);

            boxes.push({
                id: `w15_box_${i}`,
                ownerId,
                color: owner ? owner.color : { fill: '#ff9ff3', border: '#c44569' },
                x: slot.x,
                y: slot.floorY - boxSize,
                w: boxSize,
                h: boxSize,
                vy: 0,
                speed: cfg.boxSpeed || 3.2,
                targetX: chosen.x,
                targetY: chosen.floorY - boxSize,
                targetFloorY: chosen.floorY
            });
        }

        // 2. Chọn mốc đích không trùng lặp cho từng người chơi
        const remainingSpots = allSpots.filter(sp => !usedSpotIds.has(sp._id));
        const targets = playerIds.map((id, idx) => {
            const p = room.players[id];
            const sp = remainingSpots[idx] || allSpots[idx % Math.max(1, allSpots.length)] || { x: 540, floorY: 462 };
            return {
                playerId: id,
                color: p ? p.color : { fill: '#ff8c3a', border: '#c45b00' },
                x: sp.x,
                y: sp.floorY - catH,
                floorY: sp.floorY
            };
        });

        room.state.keyVisible = false;

        const w15 = {
            enabled: true,
            mode: 'rememberMatch',
            halfDx: cfg.halfDx || 446,
            playerScale: pScale,
            phase: 'memorize',
            phaseStartAt: Date.now(),
            memSec,
            playSec,
            timeLeft: memSec,
            showGo: false,
            toleranceX: cfg.toleranceX || 34,
            toleranceY: cfg.toleranceY || 18,
            targets,
            boxes,
            results: [],
            revealCount: 0,
            nextRevealAt: 0,
            doneCheckAt: 0,
            failedReset: false,
            restarting: false
        };

        room.state._world15 = w15;
        room.state.world15 = serializeWorld15(w15);
    }
}

function updateRoom(room, pass, players, totalPlayers, now, helpers) {
    const w15 = room.state && room.state._world15;
    if (!w15 || !w15.enabled) return;

    const { io, rooms, startLevelForRoom, getCatBox, rectOverlap } = helpers;

    // --- CẬP NHẬT MÀN 15-1 ---
    if (w15.mode === 'spotlights') {
        if (w15.caught) return;

        let changed = false;
        const elapsed = now - w15.startTime;

        const z1Act = w15.zone1Timing.activeMs || 2200;
        const z1Tel = w15.zone1Timing.telegraphMs || 650;
        const z1Cycle = (z1Act + z1Tel) * 2;
        const t1 = elapsed % z1Cycle;

        let nextTall = 'off';
        let nextShort = 'off';
        if (t1 < z1Act) nextTall = 'active';
        else if (t1 < z1Act + z1Tel) nextShort = 'telegraph';
        else if (t1 < z1Act * 2 + z1Tel) nextShort = 'active';
        else nextTall = 'telegraph';

        if (w15.tallState !== nextTall || w15.shortState !== nextShort) {
            w15.tallState = nextTall;
            w15.shortState = nextShort;
            changed = true;
        }

        const z2Off = w15.zone2Timing.offMs || 4400;
        const z2Tel = w15.zone2Timing.telegraphMs || 1000;
        const z2Act = w15.zone2Timing.activeMs || 2000;
        const z2Cycle = z2Off + z2Tel + z2Act;
        const t2 = elapsed % z2Cycle;

        let nextZ2 = 'off';
        if (t2 < z2Off) nextZ2 = 'off';
        else if (t2 < z2Off + z2Tel) nextZ2 = 'telegraph';
        else nextZ2 = 'active';

        if (w15.zone2State !== nextZ2) {
            w15.zone2State = nextZ2;
            changed = true;
        }

        if (!w15.checkpointReached && w15.checkpoint) {
            const cp = w15.checkpoint;
            const cpBox = { x: cp.triggerX, y: cp.triggerY, w: cp.triggerW, h: cp.triggerH };
            if (players.some(p => rectOverlap(getCatBox(p), cpBox))) {
                w15.checkpointReached = true;
                w15.checkpointJustHitAt = now;
                changed = true;
            }
        }

        if (elapsed >= 600) {
            const activeCones = [];
            if (w15.tallState === 'active') activeCones.push(...w15.zone1TallCones);
            if (w15.shortState === 'active') activeCones.push(...w15.zone1ShortCones);
            if (w15.zone2State === 'active') {
                activeCones.push(...w15.zone2RoofCones);
                if (w15.zone3TiltedCone) activeCones.push(w15.zone3TiltedCone);
            }

            if (activeCones.length > 0) {
                const hitPlayers = players.filter(p => {
                    const box = getCatBox(p);
                    return activeCones.some(cone => boxHitsCone(box, cone));
                });

                if (hitPlayers.length > 0) {
                    w15.caught = true;
                    w15.caughtIds = hitPlayers.map(p => p.id);
                    changed = true;

                    if (!w15.restarting) {
                        w15.restarting = true;
                        setTimeout(() => {
                            const r = rooms[pass];
                            if (r && r.state && r.state._world15 && r.state._world15.restarting) {
                                if (r.state._world15.checkpointReached) {
                                    r._w15CheckpointRespawn = '15-1';
                                }
                                startLevelForRoom(r, r.world, r.level);
                            }
                        }, 850);
                    }
                }
            }
        }

        if (changed) {
            const serialized = serializeWorld15(w15);
            room.state.world15 = serialized;
            io.to(pass).emit('world15Sync', serialized);
        }
        return;
    }

    // --- CẬP NHẬT MÀN 15-2 ---
    if (w15.mode === 'trackCarrier' && w15.carrier) {
        const c = w15.carrier;
        let changed = false;

        if (!c.activated) {
            let onCarrier = 0;
            players.forEach(p => {
                const box = getCatBox(p);
                const cx = box.x + box.w / 2;
                const bottomY = box.y + box.h;
                if (cx >= c.x + 2 && cx <= c.x + c.w - 2 && bottomY <= c.y + 18 && bottomY >= c.y - 320) {
                    onCarrier++;
                }
            });
            const newRem = Math.max(0, totalPlayers - onCarrier);
            if (c.remaining !== newRem) {
                c.remaining = newRem;
                changed = true;
            }
            if (newRem === 0 && totalPlayers > 0) {
                c.activated = true;
                changed = true;
            }
        } else if (c.wpIdx < w15.waypoints.length) {
            const target = w15.waypoints[c.wpIdx];
            const dx = target.x - c.x;
            const dy = target.y - c.y;
            const dist = Math.hypot(dx, dy);
            const spd = c.speed || 3.6;

            if (dist <= spd) {
                c.x = target.x;
                c.y = target.y;
                c.wpIdx++;
            } else {
                c.x += (dx / dist) * spd;
                c.y += (dy / dist) * spd;
            }
            changed = true;
        }

        if (changed) {
            const serialized = serializeWorld15(w15);
            room.state.world15 = serialized;
            io.to(pass).emit('world15Sync', serialized);
        }
        return;
    }

    // --- CẬP NHẬT MÀN 15-3 ---
    if (w15.mode === 'skillFormation') {
        const c = w15.carrier;

        if (!c.activated) {
            if (w15.countdownStartAt === 0 && w15.startButton) {
                const sb = w15.startButton;
                const trigger = { x: sb.x - 2, y: sb.y - 6, w: sb.w + 4, h: sb.h + 10 };
                if (players.some(p => rectOverlap(getCatBox(p), trigger))) {
                    w15.buttonPressed = true;
                    w15.countdownStartAt = now;
                    w15.countdown = 3;
                }
            } else if (w15.countdownStartAt > 0) {
                const leftSec = Math.ceil((3000 - (now - w15.countdownStartAt)) / 1000);
                if (leftSec <= 0) {
                    w15.countdown = 0;
                    c.activated = true;
                } else {
                    w15.countdown = leftSec;
                }
            }
        } else if (c.wpIdx < w15.waypoints.length) {
            const target = w15.waypoints[c.wpIdx];
            const dx = target.x - c.x;
            const dy = target.y - c.y;
            const dist = Math.hypot(dx, dy);
            const spd = c.speed || 2.8;

            if (dist <= spd) {
                c.x = target.x;
                c.y = target.y;
                c.wpIdx++;
            } else {
                c.x += (dx / dist) * spd;
                c.y += (dy / dist) * spd;
            }
        }

        const linkedPositions = {};
        if (w15.anchorId && (!room.players[w15.anchorId] || room.players[w15.anchorId].enteredDoor)) {
            delete w15.links[w15.anchorId];
            const remIds = Object.keys(w15.links).filter(id => room.players[id] && !room.players[id].enteredDoor);
            if (remIds.length > 0) {
                w15.anchorId = remIds[0];
                const newAnchor = room.players[w15.anchorId];
                remIds.forEach(id => {
                    const p = room.players[id];
                    w15.links[id] = { dx: p.x - newAnchor.x, dy: p.y - newAnchor.y };
                });
            } else {
                w15.anchorId = null;
                w15.links = {};
            }
        }

        if (w15.anchorId && room.players[w15.anchorId]) {
            const anchor = room.players[w15.anchorId];
            for (const id in w15.links) {
                if (id === w15.anchorId) continue;
                const p = room.players[id];
                if (!p || p.enteredDoor) {
                    delete w15.links[id];
                    continue;
                }
                const off = w15.links[id];
                p.x = anchor.x + off.dx;
                p.y = anchor.y + off.dy;
                p.vx = anchor.vx || 0;
                p.vy = 0;
                linkedPositions[id] = { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 };
            }
        }
        w15.linkedPositions = linkedPositions;

        if (!w15.restarting) {
            for (const p of players) {
                const box = getCatBox(p);
                const hitBox = { x: box.x + 5, y: box.y + 5, w: Math.max(4, box.w - 10), h: Math.max(4, box.h - 10) };

                if (room.levelData.key && room.state.keyVisible !== false && !room.state.keyHolder && !room.state.doorUnlocked) {
                    if (rectOverlap(box, room.levelData.key)) {
                        room.state.keyHolder = p.id;
                        io.to(pass).emit('keyUpdated', { keyHolder: p.id, doorUnlocked: false });
                    }
                }

                const hitRed = (w15.redWalls || []).some(rw => rectOverlap(hitBox, rw));
                const hitPit = (w15.pitHazards || []).some(ph => rectOverlap(hitBox, ph));
                if (hitRed || hitPit) {
                    w15.restarting = true;
                    setTimeout(() => {
                        const r = rooms[pass];
                        if (r && r.state && r.state._world15 && r.state._world15.restarting) {
                            startLevelForRoom(r, r.world, r.level);
                        }
                    }, 350);
                    break;
                }
            }
        }

        const serialized = serializeWorld15(w15);
        room.state.world15 = serialized;
        io.to(pass).emit('world15Sync', serialized);
        return;
    }

    // --- CẬP NHẬT MÀN 15-4: REMEMBER! 2 MÀN HÌNH SO SÁNH + HỘP MÀU ---
    if (w15.mode === 'rememberMatch') {
        let changed = false;
        const elapsedSec = (now - w15.phaseStartAt) / 1000;

        // Cập nhật vật lý đẩy & rơi cho các hộp màu trong pha xếp đội hình (play) và sau khi giải xong
        if ((w15.phase === 'play' || w15.phase === 'cleared_puzzle') && w15.boxes && w15.boxes.length > 0) {
            const solids = [
                ...(room.levelData.platforms || []),
                // Cầu lò xo giữa 2 bục dưới giúp đẩy hộp mượt từ bục dưới-trái sang dưới-phải mà không lọt khe
                { x: 654, y: 352, w: 38, h: 20 }
            ];

            for (const b of w15.boxes) {
                const oldX = b.x;
                const oldY = b.y;

                // 1. Chỉ đúng người chơi trùng màu mới đẩy được hộp
                const owner = room.players[b.ownerId];
                let pushDir = 0;
                if (owner && !owner.enteredDoor) {
                    const pBox = getCatBox(owner);
                    const vertOverlap = pBox.y + pBox.h > b.y + 4 && pBox.y < b.y + b.h - 4;
                    if (vertOverlap) {
                        if (pBox.x + pBox.w >= b.x - 8 && pBox.x + pBox.w <= b.x + 12 && owner.vx > 0) {
                            pushDir = 1;
                        } else if (pBox.x <= b.x + b.w + 8 && pBox.x >= b.x + b.w - 12 && owner.vx < 0) {
                            pushDir = -1;
                        }
                    }
                }

                if (pushDir !== 0) {
                    const nextX = Math.max(464, Math.min(882 - b.w, b.x + pushDir * (b.speed || 3.2)));
                    const testX = { x: nextX, y: b.y + 2, w: b.w, h: b.h - 4 };
                    const hitWall = solids.some(s => rectOverlap(testX, s));
                    const hitOtherBox = w15.boxes.some(ob => ob !== b && rectOverlap(testX, ob));
                    if (!hitWall && !hitOtherBox) {
                        b.x = nextX;
                    }
                }

                // 2. Trọng lực hộp màu (đỡ bởi sàn/bục/cầu lò xo và các hộp màu khác)
                b.vy = Math.min(10, (b.vy || 0) + 0.8);
                const nextY = b.y + b.vy;
                let supportY = null;

                for (const s of solids) {
                    if (b.x + b.w > s.x + 2 && b.x < s.x + s.w - 2) {
                        if (b.y + b.h <= s.y + 14 && nextY + b.h >= s.y) {
                            if (supportY === null || s.y < supportY) supportY = s.y;
                        }
                    }
                }
                for (const ob of w15.boxes) {
                    if (ob === b) continue;
                    if (b.x + b.w > ob.x + 2 && b.x < ob.x + ob.w - 2) {
                        if (b.y + b.h <= ob.y + 14 && nextY + b.h >= ob.y) {
                            if (supportY === null || ob.y < supportY) supportY = ob.y;
                        }
                    }
                }

                if (supportY !== null) {
                    b.y = supportY - b.h;
                    b.vy = 0;
                } else {
                    b.y = Math.min(462 - b.h, nextY);
                }

                if (Math.abs(b.x - oldX) > 0.05 || Math.abs(b.y - oldY) > 0.05) {
                    changed = true;
                }
            }
        }

        // 1. Pha GHI NHỚ (15s)
        if (w15.phase === 'memorize') {
            const newTime = Math.max(0, Math.ceil(w15.memSec - elapsedSec));
            if (newTime !== w15.timeLeft) {
                w15.timeLeft = newTime;
                changed = true;
            }
            if (elapsedSec >= w15.memSec) {
                w15.phase = 'play';
                w15.phaseStartAt = now;
                w15.timeLeft = w15.playSec;
                w15.showGo = true;
                changed = true;
            }
        }
        // 2. Pha XẾP ĐỘI HÌNH & ĐẨY HỘP (30s)
        else if (w15.phase === 'play') {
            const showGoNow = elapsedSec < 1.3;
            if (showGoNow !== w15.showGo) {
                w15.showGo = showGoNow;
                changed = true;
            }

            const newTime = Math.max(0, Math.ceil(w15.playSec - elapsedSec));
            if (newTime !== w15.timeLeft) {
                w15.timeLeft = newTime;
                changed = true;
            }

            if (elapsedSec >= w15.playSec) {
                w15.phase = 'finish';
                w15.phaseStartAt = now;
                w15.timeLeft = 0;
                w15.showGo = false;
                changed = true;
            }
        }
        // 3. Pha FINISH (1s): Khóa cứng vị trí & tính điểm cho CẢ người chơi lẫn hộp màu
        else if (w15.phase === 'finish') {
            if (now - w15.phaseStartAt >= 1000) {
                const catW = Math.round(36 * w15.playerScale);
                const catH = Math.round(39 * w15.playerScale);

                const catResults = (w15.targets || []).map(tg => {
                    const p = room.players[tg.playerId];
                    if (!p || p.enteredDoor) {
                        return {
                            kind: 'cat',
                            targetX: tg.x,
                            targetY: tg.y,
                            w: catW,
                            h: catH,
                            actualX: null,
                            actualY: null,
                            ok: false
                        };
                    }
                    const pCx = p.x + catW / 2;
                    const pBottom = p.y + catH;
                    const tCx = tg.x + catW / 2;
                    const ok = Math.abs(pCx - tCx) <= w15.toleranceX &&
                               Math.abs(pBottom - tg.floorY) <= w15.toleranceY;
                    return {
                        kind: 'cat',
                        targetX: tg.x,
                        targetY: tg.y,
                        w: catW,
                        h: catH,
                        actualX: Math.round(p.x),
                        actualY: Math.round(p.y),
                        ok
                    };
                });

                const boxResults = (w15.boxes || []).map(b => {
                    const bCx = b.x + b.w / 2;
                    const bBottom = b.y + b.h;
                    const tCx = b.targetX + b.w / 2;
                    const ok = Math.abs(bCx - tCx) <= w15.toleranceX &&
                               Math.abs(bBottom - b.targetFloorY) <= w15.toleranceY;
                    return {
                        kind: 'box',
                        targetX: b.targetX,
                        targetY: b.targetY,
                        w: b.w,
                        h: b.h,
                        actualX: Math.round(b.x),
                        actualY: Math.round(b.y),
                        ok
                    };
                });

                // Quét chấm điểm theo thứ tự từ trên xuống dưới, trái sang phải giống video
                w15.results = [...catResults, ...boxResults].sort((a, b) => {
                    if (Math.abs(a.targetY - b.targetY) > 20) return a.targetY - b.targetY;
                    return a.targetX - b.targetX;
                });

                w15.phase = 'checking';
                w15.revealCount = 0;
                w15.nextRevealAt = now + 400;
                w15.doneCheckAt = 0;
                changed = true;
            }
        }
        // 4. Pha CHẤM ĐIỂM TỪNG VỊ TRÍ (sai dù chỉ 1 mèo hoặc 1 hộp -> reset toàn bộ màn)
        else if (w15.phase === 'checking') {
            if (w15.revealCount < w15.results.length) {
                if (now >= w15.nextRevealAt) {
                    w15.revealCount++;
                    w15.nextRevealAt = now + 480;
                    if (w15.revealCount >= w15.results.length) {
                        w15.doneCheckAt = now + 1500;
                        w15.failedReset = w15.results.some(r => !r.ok);
                    }
                    changed = true;
                }
            } else if (w15.doneCheckAt > 0 && now >= w15.doneCheckAt) {
                const allCorrect = w15.results.length > 0 && w15.results.every(r => r.ok);
                if (allCorrect) {
                    w15.phase = 'cleared_puzzle';
                    room.state.keyVisible = true;
                    changed = true;
                } else if (!w15.restarting) {
                    w15.restarting = true;
                    startLevelForRoom(room, room.world, room.level);
                    return;
                }
            }
        }

        if (changed) {
            const serialized = serializeWorld15(w15);
            room.state.world15 = serialized;
            io.to(pass).emit('world15Sync', serialized);
        }
    }
}

function registerSocket(socket, helpers) {
    const { io, rooms } = helpers;

    // Phím E / Shift cho Màn 15-3
    socket.on('world15ToggleLink', () => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (!room || !room.state || !room.state._world15) return;

        const w15 = room.state._world15;
        if (w15.mode !== 'skillFormation') return;

        const me = room.players[socket.id];
        if (!me || me.enteredDoor) return;

        if (w15.links[socket.id]) {
            delete w15.links[socket.id];
            if (w15.anchorId === socket.id) {
                const remIds = Object.keys(w15.links).filter(id => room.players[id] && !room.players[id].enteredDoor);
                if (remIds.length > 0) {
                    w15.anchorId = remIds[0];
                    const newAnchor = room.players[w15.anchorId];
                    remIds.forEach(id => {
                        const p = room.players[id];
                        w15.links[id] = { dx: p.x - newAnchor.x, dy: p.y - newAnchor.y };
                    });
                } else {
                    w15.anchorId = null;
                }
            }
        } else {
            if (!w15.anchorId || !room.players[w15.anchorId]) {
                w15.anchorId = socket.id;
                w15.links[socket.id] = { dx: 0, dy: 0 };
            } else {
                const anchor = room.players[w15.anchorId];
                w15.links[socket.id] = { dx: me.x - anchor.x, dy: me.y - anchor.y };
            }
        }

        const serialized = serializeWorld15(w15);
        room.state.world15 = serialized;
        io.to(pass).emit('world15Sync', serialized);
    });

    // Phím F cho Màn 15-4: chấm điểm ngay khi đã xếp xong người & hộp màu
    socket.on('world15ForceCheck', () => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (!room || !room.state || !room.state._world15) return;

        const w15 = room.state._world15;
        if (w15.mode !== 'rememberMatch' || w15.phase !== 'play') return;

        w15.phase = 'finish';
        w15.phaseStartAt = Date.now();
        w15.timeLeft = 0;
        w15.showGo = false;

        const serialized = serializeWorld15(w15);
        room.state.world15 = serialized;
        io.to(pass).emit('world15Sync', serialized);
    });
}

module.exports = {
    initLevelState,
    updateRoom,
    registerSocket
};