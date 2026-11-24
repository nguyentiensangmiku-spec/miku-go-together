// ================================================================
// FILE MỞ RỘNG SERVER RIÊNG CHO WORLD 9, 10, 11, 12
// (Độc lập hoàn toàn, không làm ảnh hưởng World 1 - 8 trong server.js)
// ================================================================

function buildPlayerPairs(playerIds) {
    if (playerIds.length <= 1) return [playerIds.slice()];
    const pairs = [];
    for (let i = 0; i < playerIds.length; i += 2) {
        if (i + 1 < playerIds.length) {
            pairs.push([playerIds[i], playerIds[i + 1]]);
        } else {
            pairs.push([playerIds[i], playerIds[0]]);
        }
    }
    return pairs;
}

function makePlayersSyncMap(room) {
    const map = {};
    for (const id in room.players) {
        const p = room.players[id];
        map[id] = {
            x: p.x,
            y: p.y,
            vx: p.vx,
            vy: p.vy,
            facing: p.facing,
            scale: p.scale || 1,
            enteredDoor: Boolean(p.enteredDoor)
        };
    }
    return map;
}

function serializeTwoPlayers(tp, room) {
    const activeIds = tp.pairs[tp.activePairIdx] || [];
    const activeNames = activeIds
        .map(id => room.players[id] && room.players[id].name)
        .filter(Boolean);

    return {
        enabled: true,
        stage: tp.stage,
        totalStages: tp.checkpoints.length + 1,
        activeIds,
        activeNames,
        respawn: tp.respawn,
        buttons: tp.buttons.map(b => ({
            id: b.id, x: b.x, y: b.y, w: b.w, h: b.h, pressed: b.pressed
        })),
        pillar2: tp.pillar2 ? {
            x: tp.pillar2.x, y: Math.round(tp.pillar2.y), w: tp.pillar2.w, h: tp.pillar2.h
        } : null,
        stage2Platforms: tp.stage2Platforms.map(pl => ({
            id: pl.id, x: pl.x, y: pl.y, w: pl.w, h: pl.h, active: pl.active
        })),
        bridge: tp.bridge,
        bridgeOpen: tp.bridgeOpen,
        lava: tp.lava,
        crumblingBlocks: tp.crumblingBlocks.map(cb => ({
            id: cb.id, x: cb.x, y: cb.y, w: cb.w, h: cb.h,
            triggeredAt: cb.triggeredAt, broken: cb.broken
        })),
        gate: tp.gate ? {
            x: tp.gate.x, y: Math.round(tp.gate.y), w: tp.gate.w, h: tp.gate.h,
            openY: tp.gate.openY, closedY: tp.gate.closedY
        } : null
    };
}

function pickNextSignSymbol(currentSym) {
    const pool = ['up', 'tri', 'x'].filter(s => s !== currentSym);
    return pool[Math.floor(Math.random() * pool.length)];
}

function serializeTwoPlayers2(tp2, room, now) {
    const activeIds = tp2.pairs[tp2.activePairIdx] || [];
    const activeNames = activeIds
        .map(id => room.players[id] && room.players[id].name)
        .filter(Boolean);

    return {
        enabled: true,
        stage: tp2.stage,
        totalStages: 4,
        activeIds,
        activeNames,
        respawn: tp2.respawn,
        buttons: tp2.buttons.map(b => ({
            id: b.id, x: b.x, y: b.y, w: b.w, h: b.h, pressed: b.pressed
        })),
        ledge1: tp2.ledge1,
        ledge1Open: tp2.ledge1Open,
        bridge2: tp2.bridge2,
        bridge2Open: tp2.bridge2Open,
        gate3: tp2.gate3 ? {
            x: tp2.gate3.x, y: Math.round(tp2.gate3.y), w: tp2.gate3.w, h: tp2.gate3.h
        } : null,
        elevators: tp2.elevators.map(e => ({
            id: e.id,
            x: e.x,
            y: Math.round(e.y * 10) / 10,
            w: e.w,
            h: e.h,
            tier: e.tier,
            symbol: (now < tp2.failUntil) ? 'x' : (e.locked ? 'dash' : e.symbol),
            failFlash: now < tp2.failUntil
        }))
    };
}

function initLevelState(room, levelData, playerIds) {
    // --- WORLD 9 - MÀN 9-1: BALL PARK (Đại bác bắn bóng & Hũ chìa khóa) ---
    if (levelData.ballPark && levelData.ballPark.enabled) {
        const cfg = levelData.ballPark;
        room.state.ballPark = {
            enabled: true,
            floorY: cfg.floorY || 454,
            ballRadius: cfg.ballRadius || 11,
            maxHits: cfg.maxHits || 3,
            speeds: cfg.speeds || [6.8, 9.6, 12.6],
            reloadMs: cfg.reloadMs || 1500,
            warningMs: cfg.warningMs || 450,
            target: { ...cfg.target },
            cannon: { ...cfg.cannon },
            hits: 0,
            broken: false,
            warning: false,
            hitFlashUntil: 0,
            nextFireAt: Date.now() + 1800,
            ball: null,
            popEffect: null
        };

        const count = Math.max(1, playerIds.length);
        const startX = 135;
        const endX = 645;
        const gap = count > 1 ? Math.min(72, (endX - startX) / (count - 1)) : 0;
        const totalSpan = gap * (count - 1);
        const firstX = Math.round((startX + endX - totalSpan) / 2);

        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = Math.round(firstX + idx * gap);
            p.y = (cfg.floorY || 454) - 39;
        });
    }

    // --- WORLD 9 - MÀN 9-2: CÂN BẬP BÊNH LĂN BÓNG (TILT MAZE) ---
    if (levelData.tiltMaze && levelData.tiltMaze.enabled) {
        const cfg = levelData.tiltMaze;
        room.state.tiltMaze = {
            enabled: true,
            box: { ...cfg.box },
            spawner: { ...cfg.spawner },
            ballRadius: cfg.ballRadius || 10,
            maxAngle: cfg.maxAngle || 0.14,
            button: { ...cfg.button },
            leftScale: { ...cfg.leftScale },
            rightScale: { ...cfg.rightScale },
            planks: (cfg.planks || []).map(pl => ({ ...pl })),
            angle: 0,
            leftCount: 0,
            rightCount: 0,
            buttonPressed: false,
            ball: {
                x: cfg.spawner.x,
                y: cfg.spawner.y + 12,
                vx: 0,
                vy: 0,
                r: cfg.ballRadius || 10,
                hitFloorAt: null
            },
            respawnAt: 0
        };

        const count = Math.max(1, playerIds.length);
        const gap = count > 1 ? Math.min(46, 320 / (count - 1)) : 0;
        const firstX = Math.round(450 - (gap * (count - 1)) / 2 - 18);
        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = Math.round(firstX + idx * gap);
            p.y = 429;
        });
    }

    // --- WORLD 9 - MÀN 9-3: ĐẬP TƯỜNG GẠCH NGANG (BRICK WALL) ---
    if (levelData.brickWall && levelData.brickWall.enabled) {
        const cfg = levelData.brickWall;
        const size = cfg.brickSize || 46;
        const ceilingY = cfg.ceilingY || 32;
        const floorY = cfg.floorY || 446;
        const colors = cfg.colors || {};

        const bricks = (cfg.layout || []).map((item, idx) => ({
            id: `bw_${idx}`,
            x: item.x,
            y: ceilingY + item.row * size,
            row: item.row,
            w: size,
            h: size,
            color: colors[item.color] || { fill: '#74b9ff', border: '#0984e3' },
            broken: false
        }));

        const totalP = Math.max(1, playerIds.length);
        const spawnY = (ceilingY + 8 * size) - 39;
        const catGap = totalP > 1 ? Math.min(68, 490 / (totalP - 1)) : 0;
        const startCatX = 95;

        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = Math.round(startCatX + idx * catGap);
            p.y = spawnY;
        });

        const ballCount = Math.max(4, totalP);
        const balls = [];
        for (let i = 0; i < ballCount; i++) {
            let bx;
            if (i < totalP) {
                bx = Math.round(startCatX + i * catGap) + 18;
            } else {
                bx = Math.round(startCatX + i * 74) + 18;
            }
            bx = Math.min(620, bx);
            balls.push({
                id: `bwb_${i}`,
                x: bx,
                y: spawnY - 62,
                vx: 0,
                vy: 0,
                r: cfg.ballRadius || 9,
                speed: cfg.ballSpeed || 6.4,
                active: false,
                alive: true,
                hitCooldown: 0
            });
        }

        room.state.brickWall = {
            enabled: true,
            floorY,
            ceilingY,
            leftWallX: cfg.leftWallX || 30,
            rightWallX: cfg.rightWallX || 1720,
            overhang: cfg.overhang ? { ...cfg.overhang } : null,
            wallCols: cfg.wallCols || [],
            bricks,
            balls,
            failed: false,
            restarting: false
        };
    }

    // --- WORLD 9 - MÀN 9-4: TÂNG BÓNG CHUYỀN TAY ĐẬP VỠ HŨ (BALL VOLLEY) ---
    if (levelData.ballVolley && levelData.ballVolley.enabled) {
        const cfg = levelData.ballVolley;
        room.state.ballVolley = {
            enabled: true,
            floorY: cfg.floorY || 458,
            ceilingY: cfg.ceilingY || 28,
            leftWallX: cfg.leftWallX || 26,
            rightWallX: cfg.rightWallX || 874,
            ballRadius: cfg.ballRadius || 10,
            gravity: cfg.gravity || 0.22,
            fireVx: cfg.fireVx || -4.2,
            fireVy: cfg.fireVy || -0.8,
            reloadMs: cfg.reloadMs || 1200,
            warningMs: cfg.warningMs || 400,
            target: { ...cfg.target },
            cannon: { ...cfg.cannon },
            ledge: cfg.ledge ? { ...cfg.ledge } : null,
            broken: false,
            warning: false,
            nextFireAt: Date.now() + 1400,
            ball: null,
            popEffect: null
        };

        const count = Math.max(1, playerIds.length);
        const startX = 140;
        const endX = 660;
        const gap = count > 1 ? Math.min(82, (endX - startX) / (count - 1)) : 0;
        const totalSpan = gap * (count - 1);
        const firstX = count === 1 ? 620 : Math.round((startX + endX - totalSpan) / 2);

        playerIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p) return;
            p.x = Math.round(firstX + idx * gap);
            p.y = (cfg.floorY || 458) - 39;
        });
    }

    // --- WORLD 10 - MÀN 10-1: TWO PLAYERS RELAY ---
    if (levelData.twoPlayers && levelData.twoPlayers.enabled) {
        const cfg = levelData.twoPlayers;
        const pairs = buildPlayerPairs(playerIds);
        const activeIds = pairs[0] || [];
        const spawn = cfg.spawn || levelData.spawn || { x: 100, y: 375 };

        playerIds.forEach(id => {
            const p = room.players[id];
            if (!p) return;
            const activeIdx = activeIds.indexOf(id);
            if (activeIdx >= 0) {
                p.enteredDoor = false;
                p.x = spawn.x + activeIdx * 54;
                p.y = spawn.y;
                p.vx = 0;
                p.vy = 0;
                p.scale = 1;
            } else {
                p.enteredDoor = true;
                p.x = spawn.x;
                p.y = spawn.y;
                p.vx = 0;
                p.vy = 0;
                p.scale = 1;
            }
        });

        const tp = {
            enabled: true,
            pairs,
            activePairIdx: 0,
            stage: 0,
            respawn: { x: spawn.x, y: spawn.y },
            checkpoints: (cfg.checkpoints || []).map(cp => ({ ...cp })),
            buttons: (cfg.buttons || []).map(b => ({ ...b, pressed: false, holdUntil: 0 })),
            pillar2: cfg.pillar2 ? { ...cfg.pillar2 } : null,
            stage2Platforms: (cfg.stage2Platforms || []).map(pl => ({ ...pl, active: false })),
            bridge: cfg.bridge ? { ...cfg.bridge } : null,
            bridgeOpen: false,
            lava: cfg.lava ? { ...cfg.lava } : null,
            crumblingBlocks: (cfg.crumblingBlocks || []).map(cb => ({
                ...cb, triggeredAt: null, broken: false
            })),
            gate: cfg.gate ? { ...cfg.gate } : null
        };

        room.state.twoPlayers = serializeTwoPlayers(tp, room);
        room.state._twoPlayersInternal = tp;
    }

    // --- WORLD 10 - MÀN 10-2: TWO PLAYERS RELAY (Chồng đầu + Thang máy ký hiệu) ---
    if (levelData.twoPlayers2 && levelData.twoPlayers2.enabled) {
        const cfg = levelData.twoPlayers2;
        const pairs = buildPlayerPairs(playerIds);
        const activeIds = pairs[0] || [];
        const spawn = cfg.spawn || levelData.spawn || { x: 110, y: 385 };
        const now = Date.now();

        playerIds.forEach(id => {
            const p = room.players[id];
            if (!p) return;
            const activeIdx = activeIds.indexOf(id);
            if (activeIdx >= 0) {
                p.enteredDoor = false;
                p.x = spawn.x + activeIdx * 56;
                p.y = spawn.y;
                p.vx = 0;
                p.vy = 0;
                p.scale = 1;
            } else {
                p.enteredDoor = true;
                p.x = spawn.x;
                p.y = spawn.y;
                p.vx = 0;
                p.vy = 0;
                p.scale = 1;
            }
        });

        const tp2 = {
            enabled: true,
            pairs,
            activePairIdx: 0,
            stage: 0,
            respawn: { x: spawn.x, y: spawn.y },
            buttons: (cfg.buttons || []).map(b => ({ ...b, pressed: false })),
            ledge1: cfg.ledge1 ? { ...cfg.ledge1 } : null,
            ledge1Open: false,
            bridge2: cfg.bridge2 ? { ...cfg.bridge2 } : null,
            bridge2Open: false,
            gate3: cfg.gate3 ? { ...cfg.gate3 } : null,
            gate3Open: false,
            failUntil: 0,
            elevators: (cfg.elevators || []).map((e, idx) => ({
                id: e.id || `el_${idx}`,
                x: e.x,
                y: e.tiersY[0],
                targetY: e.tiersY[0],
                w: e.w || 120,
                h: e.h || 18,
                tiersY: [...e.tiersY],
                tier: 0,
                symbol: idx === 0 ? 'tri' : 'up',
                prevSymbol: 'tri',
                lastChangeAt: now,
                nextChangeAt: now + 620 + idx * 240,
                locked: false,
                cooldownUntil: 0,
                groundedMap: {}
            }))
        };

        room.state.twoPlayers2 = serializeTwoPlayers2(tp2, room, now);
        room.state._twoPlayers2Internal = tp2;
    }
}

function switchPairInPlace(tpObj, room, pass, io, bannerText) {
    if (tpObj.pairs.length <= 1) return;

    const oldIds = tpObj.pairs[tpObj.activePairIdx] || [];
    const oldPositions = oldIds.map(id => {
        const p = room.players[id];
        return p ? { x: p.x, y: p.y, facing: p.facing } : { x: tpObj.respawn.x, y: tpObj.respawn.y, facing: 1 };
    });

    const nextPairIdx = (tpObj.activePairIdx + 1) % tpObj.pairs.length;
    const newIds = tpObj.pairs[nextPairIdx] || [];

    if (room.state.keyHolder) {
        const holderOldIdx = oldIds.indexOf(room.state.keyHolder);
        if (holderOldIdx >= 0 && newIds[holderOldIdx]) {
            room.state.keyHolder = newIds[holderOldIdx];
            io.to(pass).emit('keyUpdated', {
                keyHolder: room.state.keyHolder,
                doorUnlocked: room.state.doorUnlocked
            });
        }
    }

    for (const pid in room.players) {
        const p = room.players[pid];
        const newIdx = newIds.indexOf(pid);
        if (newIdx >= 0) {
            const pos = oldPositions[newIdx] || oldPositions[0] || { x: tpObj.respawn.x, y: tpObj.respawn.y, facing: 1 };
            p.enteredDoor = false;
            p.x = pos.x;
            p.y = pos.y;
            p.vx = 0;
            p.vy = 0;
            p.scale = 1;
            p.facing = pos.facing || 1;
        } else {
            p.enteredDoor = true;
            p.vx = 0;
            p.vy = 0;
        }
    }

    tpObj.activePairIdx = nextPairIdx;
    io.to(pass).emit('twoPlayersPairSwitch', {
        players: makePlayersSyncMap(room),
        keyHolder: room.state.keyHolder,
        doorUnlocked: room.state.doorUnlocked,
        banner: bannerText
    });
}

function updateRoom(room, pass, players, totalPlayers, now, helpers) {
    const { io, rooms, startLevelForRoom, getCatBox, rectOverlap, circleRectOverlap } = helpers;

    // --- WORLD 9 - MÀN 9-1: CẬP NHẬT BÓNG & HŨ CHÌA KHÓA ---
    if (room.state.ballPark && room.state.ballPark.enabled) {
        const bp = room.state.ballPark;
        let changed = false;

        if (bp.popEffect && now >= bp.popEffect.until) {
            bp.popEffect = null;
            changed = true;
        }

        if (!bp.broken) {
            if (!bp.ball) {
                const shouldWarn = now >= (bp.nextFireAt - bp.warningMs);
                if (bp.warning !== shouldWarn) {
                    bp.warning = shouldWarn;
                    changed = true;
                }

                if (now >= bp.nextFireAt) {
                    const spdIdx = Math.min(bp.hits, bp.speeds.length - 1);
                    const speed = bp.speeds[spdIdx] || 7;
                    bp.ball = {
                        x: bp.cannon.x - 4,
                        y: bp.floorY - bp.ballRadius,
                        r: bp.ballRadius,
                        vx: -speed
                    };
                    bp.warning = false;
                    changed = true;
                }
            } else {
                const subSteps = 2;
                for (let s = 0; s < subSteps; s++) {
                    if (!bp.ball) break;
                    bp.ball.x += bp.ball.vx / subSteps;
                    changed = true;

                    let blockedByCat = null;
                    for (const p of players) {
                        const box = getCatBox(p);
                        const catHitbox = {
                            x: box.x + 4,
                            y: box.y + 4,
                            w: Math.max(8, box.w - 8),
                            h: Math.max(8, box.h - 6)
                        };
                        if (circleRectOverlap(bp.ball.x, bp.ball.y, bp.ball.r, catHitbox)) {
                            blockedByCat = p;
                            break;
                        }
                    }

                    if (blockedByCat) {
                        bp.popEffect = {
                            x: Math.round(bp.ball.x),
                            y: Math.round(bp.ball.y),
                            until: now + 350
                        };
                        bp.ball = null;
                        bp.nextFireAt = now + bp.reloadMs;
                        break;
                    }

                    if (bp.ball.x - bp.ball.r <= bp.target.x + bp.target.w) {
                        bp.hits += 1;
                        bp.hitFlashUntil = now + 400;
                        bp.popEffect = {
                            x: Math.round(bp.target.x + bp.target.w),
                            y: Math.round(bp.ball.y),
                            until: now + 350
                        };
                        bp.ball = null;

                        if (bp.hits >= bp.maxHits) {
                            bp.broken = true;
                            room.state.keyVisible = true;
                        } else {
                            bp.nextFireAt = now + bp.reloadMs + 350;
                        }
                        break;
                    }
                }
            }
        }

        if (changed) {
            io.to(pass).emit('ballParkSync', {
                enabled: bp.enabled,
                hits: bp.hits,
                maxHits: bp.maxHits,
                broken: bp.broken,
                warning: bp.warning,
                hitFlash: now < bp.hitFlashUntil,
                target: bp.target,
                cannon: bp.cannon,
                ball: bp.ball,
                popEffect: bp.popEffect
            });
        }
    }

    // --- WORLD 9 - MÀN 9-2: CẬP NHẬT CÂN BẬP BÊNH & BÓNG LĂN ---
    if (room.state.tiltMaze && room.state.tiltMaze.enabled) {
        const tm = room.state.tiltMaze;

        let leftCount = 0;
        let rightCount = 0;
        players.forEach(p => {
            const box = getCatBox(p);
            const cx = box.x + box.w / 2;
            const bottom = box.y + box.h;
            const ls = tm.leftScale;
            const rs = tm.rightScale;

            if (cx >= ls.x - 4 && cx <= ls.x + ls.w + 4 && bottom <= ls.y + 16 && bottom >= ls.y - 180) {
                leftCount++;
            } else if (cx >= rs.x - 4 && cx <= rs.x + rs.w + 4 && bottom <= rs.y + 16 && bottom >= rs.y - 180) {
                rightCount++;
            }
        });
        tm.leftCount = leftCount;
        tm.rightCount = rightCount;

        const diff = rightCount - leftCount;
        const stepAngle = totalPlayers <= 2 ? 0.12 : (totalPlayers <= 4 ? 0.08 : 0.055);
        const targetAngle = Math.max(-tm.maxAngle, Math.min(tm.maxAngle, diff * stepAngle));
        const angleStep = 0.0075;
        if (tm.angle < targetAngle) tm.angle = Math.min(targetAngle, tm.angle + angleStep);
        else if (tm.angle > targetAngle) tm.angle = Math.max(targetAngle, tm.angle - angleStep);

        const shift = (tm.angle / tm.maxAngle) * 8;
        const targetLeftY = tm.leftScale.baseY - shift;
        const targetRightY = tm.rightScale.baseY + shift;
        tm.leftScale.y += (targetLeftY - tm.leftScale.y) * 0.25;
        tm.rightScale.y += (targetRightY - tm.rightScale.y) * 0.25;

        if (!tm.ball) {
            if (now >= tm.respawnAt) {
                tm.ball = {
                    x: tm.spawner.x,
                    y: tm.spawner.y + 12,
                    vx: 0,
                    vy: 0,
                    r: tm.ballRadius,
                    hitFloorAt: null
                };
            }
        } else {
            const b = tm.ball;
            const subSteps = 3;
            const gravity = 0.62;
            const cosNeg = Math.cos(-tm.angle);
            const sinNeg = Math.sin(-tm.angle);
            const cosPos = Math.cos(tm.angle);
            const sinPos = Math.sin(tm.angle);

            for (let s = 0; s < subSteps; s++) {
                b.vy += gravity / subSteps;
                if (b.vy > 11) b.vy = 11;
                b.x += b.vx / subSteps;
                b.y += b.vy / subSteps;

                for (const pl of tm.planks) {
                    const dx = b.x - pl.cx;
                    const dy = b.y - pl.cy;
                    const lx = dx * cosNeg - dy * sinNeg;
                    const ly = dx * sinNeg + dy * cosNeg;
                    const hw = pl.w / 2;
                    const hh = pl.h / 2;

                    const clx = Math.max(-hw, Math.min(hw, lx));
                    const cly = Math.max(-hh, Math.min(hh, ly));
                    const dlx = lx - clx;
                    const dly = ly - cly;
                    const distSq = dlx * dlx + dly * dly;

                    if (distSq < b.r * b.r) {
                        let nlx, nly, pen;
                        if (distSq > 0.0001) {
                            const dist = Math.sqrt(distSq);
                            nlx = dlx / dist;
                            nly = dly / dist;
                            pen = b.r - dist;
                        } else {
                            nlx = 0;
                            nly = -1;
                            pen = b.r + hh + ly;
                        }

                        const nx = nlx * cosPos - nly * sinPos;
                        const ny = nlx * sinPos + nly * cosPos;
                        b.x += nx * pen;
                        b.y += ny * pen;

                        const vn = b.vx * nx + b.vy * ny;
                        if (vn < 0) {
                            const bounce = 0.18;
                            b.vx -= (1 + bounce) * vn * nx;
                            b.vy -= (1 + bounce) * vn * ny;
                        }

                        const tx = -ny;
                        const ty = nx;
                        let vt = b.vx * tx + b.vy * ty;
                        vt *= 0.992;
                        const maxRoll = 6.4;
                        if (vt > maxRoll) vt = maxRoll;
                        if (vt < -maxRoll) vt = -maxRoll;
                        const vnAfter = b.vx * nx + b.vy * ny;
                        b.vx = tx * vt + nx * vnAfter;
                        b.vy = ty * vt + ny * vnAfter;
                    }
                }

                if (b.x - b.r < tm.box.leftX) {
                    b.x = tm.box.leftX + b.r;
                    b.vx = Math.abs(b.vx) * 0.45;
                } else if (b.x + b.r > tm.box.rightX) {
                    b.x = tm.box.rightX - b.r;
                    b.vx = -Math.abs(b.vx) * 0.45;
                }

                if (b.y + b.r >= tm.box.bottomY) {
                    b.y = tm.box.bottomY - b.r;
                    if (b.vy > 0) b.vy = -b.vy * 0.22;
                    b.vx *= 0.96;
                    if (!b.hitFloorAt) b.hitFloorAt = now;
                }

                if (!tm.buttonPressed) {
                    const btnHitbox = {
                        x: tm.button.x - 2,
                        y: tm.button.y - 2,
                        w: tm.button.w + 4,
                        h: tm.button.h + 4
                    };
                    if (circleRectOverlap(b.x, b.y, b.r, btnHitbox)) {
                        tm.buttonPressed = true;
                        room.state.keyVisible = true;
                    }
                }
            }

            if (b.hitFloorAt && now - b.hitFloorAt >= 1050) {
                tm.ball = null;
                tm.respawnAt = now + 450;
            }
        }

        io.to(pass).emit('tiltMazeSync', {
            enabled: tm.enabled,
            box: tm.box,
            spawner: tm.spawner,
            button: tm.button,
            buttonPressed: tm.buttonPressed,
            leftScale: tm.leftScale,
            rightScale: tm.rightScale,
            planks: tm.planks,
            angle: Number(tm.angle.toFixed(4)),
            ball: tm.ball ? { x: Math.round(tm.ball.x * 10) / 10, y: Math.round(tm.ball.y * 10) / 10, r: tm.ball.r } : null
        });
    }

    // --- WORLD 9 - MÀN 9-3: CẬP NHẬT ĐẬP TƯỜNG GẠCH NGANG (BRICK WALL) ---
    if (room.state.brickWall && room.state.brickWall.enabled && !room.state.brickWall.failed) {
        const bw = room.state.brickWall;
        const subSteps = 2;

        bw.balls.forEach(ball => {
            if (!ball.alive) return;

            if (!ball.active) {
                for (const p of players) {
                    const helmetBox = { x: p.x - 7, y: p.y - 12, w: 50, h: 24 };
                    if (circleRectOverlap(ball.x, ball.y, ball.r, helmetBox)) {
                        ball.active = true;
                        const rel = Math.max(-0.85, Math.min(0.85, (ball.x - (p.x + 18)) / 24));
                        let vx = rel * ball.speed * 0.78 + (p.vx || 0) * 0.42;
                        if (Math.abs(vx) < 1.3) vx = 2.4;
                        const maxVx = ball.speed * 0.86;
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
                if (ball.x - ball.r < bw.leftWallX) {
                    ball.x = bw.leftWallX + ball.r;
                    ball.vx = Math.abs(ball.vx);
                } else if (ball.x + ball.r > bw.rightWallX) {
                    ball.x = bw.rightWallX - ball.r;
                    ball.vx = -Math.abs(ball.vx);
                }

                if (bw.overhang && circleRectOverlap(ball.x, ball.y, ball.r, bw.overhang)) {
                    if (stepVx > 0) ball.x = bw.overhang.x - ball.r - 0.5;
                    else if (stepVx < 0) ball.x = bw.overhang.x + bw.overhang.w + ball.r + 0.5;
                    ball.vx = -ball.vx;
                }

                for (const br of bw.bricks) {
                    if (br.broken) continue;
                    if (circleRectOverlap(ball.x, ball.y, ball.r, br)) {
                        br.broken = true;
                        ball.vx = -ball.vx;
                        break;
                    }
                }

                ball.y += stepVy;
                if (ball.y - ball.r < bw.ceilingY) {
                    ball.y = bw.ceilingY + ball.r;
                    ball.vy = Math.abs(ball.vy);
                }

                if (bw.overhang && circleRectOverlap(ball.x, ball.y, ball.r, bw.overhang)) {
                    if (stepVy > 0) ball.y = bw.overhang.y - ball.r - 0.5;
                    else if (stepVy < 0) ball.y = bw.overhang.y + bw.overhang.h + ball.r + 0.5;
                    ball.vy = -ball.vy;
                }

                for (const br of bw.bricks) {
                    if (br.broken) continue;
                    if (circleRectOverlap(ball.x, ball.y, ball.r, br)) {
                        br.broken = true;
                        ball.vy = -ball.vy;
                        break;
                    }
                }

                if (Math.abs(ball.vy) < 1.6) {
                    ball.vy = (ball.vy >= 0 ? 1 : -1) * 1.8;
                    const mag = Math.hypot(ball.vx, ball.vy) || 1;
                    ball.vx = (ball.vx / mag) * ball.speed;
                    ball.vy = (ball.vy / mag) * ball.speed;
                }

                if (now >= (ball.hitCooldown || 0)) {
                    for (const p of players) {
                        const helmetBox = { x: p.x - 7, y: p.y - 12, w: 50, h: 20 };
                        if ((ball.vy > 0 || (p.vy && p.vy < 0)) && circleRectOverlap(ball.x, ball.y, ball.r, helmetBox)) {
                            const rel = Math.max(-0.88, Math.min(0.88, (ball.x - (p.x + 18)) / 24));
                            let vx = rel * ball.speed * 0.85 + (p.vx || 0) * 0.45;
                            const maxVx = ball.speed * 0.88;
                            vx = Math.max(-maxVx, Math.min(maxVx, vx));
                            ball.vx = vx;
                            ball.vy = -Math.sqrt(Math.max(4, ball.speed * ball.speed - vx * vx));
                            ball.y = p.y - 12 - ball.r;
                            ball.hitCooldown = now + 90;
                            break;
                        }
                    }
                }

                if (ball.y + ball.r >= bw.floorY) {
                    ball.alive = false;
                }
            }
        });

        const aliveCount = bw.balls.filter(b => b.alive).length;
        if (aliveCount === 0 && !room.state.doorUnlocked) {
            const pathBlocked = bw.wallCols.some(colX => {
                const lowerBricks = bw.bricks.filter(br => br.x === colX && br.row >= 6);
                return lowerBricks.length > 0 && lowerBricks.every(br => !br.broken);
            });
            if (pathBlocked) {
                bw.failed = true;
                if (!bw.restarting) {
                    bw.restarting = true;
                    setTimeout(() => {
                        if (rooms[pass] && rooms[pass].state && rooms[pass].state.brickWall && rooms[pass].state.brickWall.restarting) {
                            startLevelForRoom(rooms[pass], rooms[pass].world, rooms[pass].level);
                        }
                    }, 1400);
                }
            }
        }

        io.to(pass).emit('brickWallSync', {
            enabled: bw.enabled,
            floorY: bw.floorY,
            bricks: bw.bricks.filter(br => !br.broken),
            balls: bw.balls.filter(b => b.alive).map(b => ({
                x: Math.round(b.x * 10) / 10,
                y: Math.round(b.y * 10) / 10,
                r: b.r
            })),
            failed: bw.failed
        });
    }

    // --- WORLD 9 - MÀN 9-4: CẬP NHẬT TÂNG BÓNG CHUYỀN TAY ĐẬP VỠ HŨ (BALL VOLLEY) ---
    if (room.state.ballVolley && room.state.ballVolley.enabled) {
        const bv = room.state.ballVolley;
        let changed = false;

        if (bv.popEffect && now >= bv.popEffect.until) {
            bv.popEffect = null;
            changed = true;
        }

        if (!bv.broken) {
            if (!bv.ball) {
                const shouldWarn = now >= (bv.nextFireAt - bv.warningMs);
                if (bv.warning !== shouldWarn) {
                    bv.warning = shouldWarn;
                    changed = true;
                }

                if (now >= bv.nextFireAt) {
                    bv.ball = {
                        x: bv.cannon.x - 8,
                        y: bv.cannon.y + 18,
                        vx: bv.fireVx,
                        vy: bv.fireVy,
                        r: bv.ballRadius,
                        hitCooldown: 0
                    };
                    bv.warning = false;
                    changed = true;
                }
            } else {
                const b = bv.ball;
                const subSteps = 2;
                changed = true;

                for (let s = 0; s < subSteps; s++) {
                    if (!bv.ball) break;

                    b.vy += bv.gravity / subSteps;
                    if (b.vy > 9.5) b.vy = 9.5;
                    b.x += b.vx / subSteps;
                    b.y += b.vy / subSteps;

                    if (b.y - b.r < bv.ceilingY) {
                        b.y = bv.ceilingY + b.r;
                        b.vy = Math.abs(b.vy) * 0.65;
                    }

                    if (b.x - b.r < bv.leftWallX) {
                        b.x = bv.leftWallX + b.r;
                        b.vx = Math.abs(b.vx) * 0.35;
                    }

                    if (b.x + b.r > bv.rightWallX) {
                        b.x = bv.rightWallX - b.r;
                        b.vx = -Math.abs(b.vx) * 0.65;
                    }

                    if (bv.ledge && circleRectOverlap(b.x, b.y, b.r, bv.ledge)) {
                        if (b.vy > 0 && b.y < bv.ledge.y + 8) {
                            b.y = bv.ledge.y - b.r;
                            b.vy = -Math.abs(b.vy) * 0.6;
                        } else if (b.vx > 0 && b.x < bv.ledge.x + 8) {
                            b.x = bv.ledge.x - b.r;
                            b.vx = -Math.abs(b.vx) * 0.6;
                        } else {
                            b.y = bv.ledge.y + bv.ledge.h + b.r;
                            b.vy = Math.abs(b.vy) * 0.6;
                        }
                    }

                    const jarHitbox = {
                        x: bv.target.x - 2,
                        y: bv.target.y - 2,
                        w: bv.target.w + 4,
                        h: bv.target.h + 2
                    };
                    if (circleRectOverlap(b.x, b.y, b.r, jarHitbox)) {
                        bv.broken = true;
                        room.state.keyVisible = true;
                        bv.popEffect = {
                            x: Math.round(bv.target.x + bv.target.w / 2),
                            y: Math.round(bv.target.y + bv.target.h / 2),
                            until: now + 450
                        };
                        bv.ball = null;
                        break;
                    }

                    if (now >= (b.hitCooldown || 0)) {
                        for (const p of players) {
                            const box = getCatBox(p);
                            const catHitbox = {
                                x: box.x - 4,
                                y: box.y - 4,
                                w: box.w + 8,
                                h: box.h + 4
                            };
                            if (circleRectOverlap(b.x, b.y, b.r, catHitbox)) {
                                const catCx = box.x + box.w / 2;
                                const rel = Math.max(-1, Math.min(1, (b.x - catCx) / (box.w * 0.65)));
                                let nextVx = b.vx * 0.58 + rel * 3.1 + (p.vx || 0) * 0.48;
                                nextVx = Math.max(-6.0, Math.min(5.0, nextVx));

                                b.vx = nextVx;
                                b.vy = (p.vy && p.vy < -1.5) ? -8.4 : -7.2;
                                b.y = Math.min(b.y, box.y - b.r - 1);
                                b.hitCooldown = now + 140;
                                break;
                            }
                        }
                    }

                    if (bv.ball && b.y + b.r >= bv.floorY) {
                        bv.popEffect = {
                            x: Math.round(b.x),
                            y: Math.round(bv.floorY - 6),
                            until: now + 350
                        };
                        bv.ball = null;
                        bv.nextFireAt = now + bv.reloadMs;
                        break;
                    }
                }
            }
        }

        if (changed) {
            io.to(pass).emit('ballVolleySync', {
                enabled: bv.enabled,
                broken: bv.broken,
                warning: bv.warning,
                target: bv.target,
                cannon: bv.cannon,
                ball: bv.ball ? {
                    x: Math.round(bv.ball.x * 10) / 10,
                    y: Math.round(bv.ball.y * 10) / 10,
                    r: bv.ball.r
                } : null,
                popEffect: bv.popEffect
            });
        }
    }

    // --- WORLD 10 - MÀN 10-1: CẬP NHẬT TWO PLAYERS RELAY ---
    if (room.state._twoPlayersInternal && room.state._twoPlayersInternal.enabled) {
        const tp = room.state._twoPlayersInternal;
        const soloTestMode = totalPlayers === 1;

        const btnMap = {};
        tp.buttons.forEach(btn => {
            if (btn.oneTime && btn.pressed) {
                btnMap[btn.id] = true;
                return;
            }
            const triggerBox = { x: btn.x - 2, y: btn.y - 6, w: btn.w + 4, h: btn.h + 10 };
            const stepped = players.some(p => rectOverlap(getCatBox(p), triggerBox));

            if (stepped) {
                btn.pressed = true;
                if (soloTestMode && !btn.oneTime) btn.holdUntil = now + 3800;
            } else if (soloTestMode && now < (btn.holdUntil || 0)) {
                btn.pressed = true;
            } else {
                btn.pressed = false;
            }
            btnMap[btn.id] = btn.pressed;
        });

        if (tp.pillar2) {
            const p2 = tp.pillar2;
            const targetY = (btnMap.btn1a || btnMap.btn1b) ? p2.upY : p2.downY;
            if (p2.y > targetY) p2.y = Math.max(targetY, p2.y - (p2.speed || 9));
            else if (p2.y < targetY) p2.y = Math.min(targetY, p2.y + (p2.speed || 9));
        }

        if (btnMap.btn2d) {
            tp.bridgeOpen = true;
        }
        tp.stage2Platforms.forEach(pl => {
            pl.active = !tp.bridgeOpen && Boolean(btnMap[pl.btnId]);
        });

        tp.crumblingBlocks.forEach(cb => {
            if (cb.broken) return;
            if (!cb.triggeredAt) {
                const stepped = players.some(p => {
                    const box = getCatBox(p);
                    return box.x + box.w > cb.x + 2 &&
                        box.x < cb.x + cb.w - 2 &&
                        Math.abs((box.y + box.h) - cb.y) <= 10;
                });
                if (stepped) cb.triggeredAt = now;
            } else if (now - cb.triggeredAt >= (cb.delay || 480)) {
                cb.broken = true;
            }
        });

        if (tp.gate) {
            const g = tp.gate;
            const shouldOpen = Boolean((btnMap.btn4a && btnMap.btn4b) || btnMap.btn4c);
            const targetY = shouldOpen ? g.openY : g.closedY;
            const step = g.speed || 7;

            if (g.y > targetY) {
                g.y = Math.max(targetY, g.y - step);
            } else if (g.y < targetY) {
                const catUnderGate = players.some(p => {
                    const box = getCatBox(p);
                    return box.x + box.w > g.x + 2 && box.x < g.x + g.w - 2 && box.y < g.closedY + g.h;
                });
                if (!catUnderGate) {
                    g.y = Math.min(targetY, g.y + step);
                }
            }
        }

        if (tp.stage < tp.checkpoints.length) {
            const nextCp = tp.checkpoints[tp.stage];
            const activeIds = (tp.pairs[tp.activePairIdx] || []).filter(id => room.players[id] && !room.players[id].enteredDoor);
            const allReached = activeIds.length > 0 && activeIds.every(id => {
                const p = room.players[id];
                const okX = p.x >= nextCp.triggerX;
                const okMinY = nextCp.minY !== undefined ? p.y >= nextCp.minY : true;
                const okMaxY = nextCp.maxY !== undefined ? p.y <= nextCp.maxY : true;
                return okX && okMinY && okMaxY;
            });

            if (allReached) {
                tp.stage += 1;
                tp.respawn = { x: nextCp.respawnX, y: nextCp.respawnY };
                switchPairInPlace(tp, room, pass, io, `CHẶNG ${tp.stage + 1}: ĐỔI CẶP CHƠI!`);
            }
        }

        const serialized = serializeTwoPlayers(tp, room);
        room.state.twoPlayers = serialized;
        io.to(pass).emit('twoPlayersSync', serialized);
    }

    // --- WORLD 10 - MÀN 10-2: CẬP NHẬT 3 NÚT CHẶNG & 2 THANG MÁY KÝ HIỆU ---
    if (room.state._twoPlayers2Internal && room.state._twoPlayers2Internal.enabled) {
        const tp2 = room.state._twoPlayers2Internal;

        // 1. Kiểm tra 3 nút đỏ chuyển chặng (bấm 1 lần là mở công trình vĩnh viễn + đổi cặp chơi)
        tp2.buttons.forEach(btn => {
            if (btn.pressed) return;
            const triggerBox = { x: btn.x - 2, y: btn.y - 6, w: btn.w + 4, h: btn.h + 10 };
            const stepped = players.some(p => rectOverlap(getCatBox(p), triggerBox));
            if (!stepped) return;

            btn.pressed = true;
            if (btn.id === 'btn1') tp2.ledge1Open = true;
            if (btn.id === 'btn2') tp2.bridge2Open = true;
            if (btn.id === 'btn3') tp2.gate3Open = true;

            if (btn.stage >= tp2.stage) {
                tp2.stage = btn.stage + 1;
                tp2.respawn = { x: btn.respawnX, y: btn.respawnY };
                switchPairInPlace(tp2, room, pass, io, `CHẶNG ${tp2.stage + 1}: ĐỔI CẶP CHƠI!`);
            }
        });

        // 2. Kéo nâng cột cổng cao Chặng 3 khi btn3 đã bấm
        if (tp2.gate3 && tp2.gate3Open) {
            const g = tp2.gate3;
            if (g.y > g.openY) {
                g.y = Math.max(g.openY, g.y - (g.speed || 6));
            }
        }

        // 3. Chặng 4: Cập nhật 2 thang máy ký hiệu (↑ / △ / × / -)
        const elevs = tp2.elevators || [];
        if (elevs.length === 2) {
            const soloMode = totalPlayers === 1;

            // Xoay vòng biểu tượng khi không trong trạng thái phạt × và không bị khóa -
            if (now >= tp2.failUntil) {
                elevs.forEach(e => {
                    if (!e.locked && now >= e.nextChangeAt) {
                        e.prevSymbol = e.symbol;
                        e.symbol = pickNextSignSymbol(e.symbol);
                        e.lastChangeAt = now;
                        e.nextChangeAt = now + 620;
                    }
                });
            }

            // Kiểm tra mèo nhảy bật lên từ mặt từng thang máy
            let triggeredFail = false;
            elevs.forEach((e, idx) => {
                const other = elevs[1 - idx];

                players.forEach(p => {
                    const box = getCatBox(p);
                    const onHoriz = box.x + box.w > e.x + 2 && box.x < e.x + e.w - 2;
                    const onTop = Math.abs((box.y + box.h) - e.y) <= 14;

                    if (onHoriz && onTop && (p.vy || 0) >= -1) {
                        e.groundedMap[p.id] = now;
                    } else if (
                        onHoriz &&
                        (p.vy || 0) < -4 &&
                        e.groundedMap[p.id] &&
                        (now - e.groundedMap[p.id]) <= 240 &&
                        now >= e.cooldownUntil &&
                        now >= tp2.failUntil
                    ) {
                        delete e.groundedMap[p.id];
                        e.cooldownUntil = now + 420;

                        if (e.locked) return;

                        // Ưu ái 160ms trễ mạng nếu biểu tượng vừa rời khỏi mũi tên ↑
                        const hitUp = e.symbol === 'up' || (e.prevSymbol === 'up' && (now - e.lastChangeAt) <= 160);
                        const hitCross = e.symbol === 'x' && !hitUp;

                        if (hitUp) {
                            const maxTier = e.tiersY.length - 1;
                            if (e.tier < maxTier) {
                                e.tier += 1;
                                e.targetY = e.tiersY[e.tier];
                            }

                            if (!soloMode) {
                                if (e.tier > other.tier) {
                                    e.locked = true;
                                } else if (e.tier === other.tier) {
                                    e.locked = false;
                                    other.locked = false;
                                }
                            }
                        } else if (hitCross) {
                            triggeredFail = true;
                        }
                    }
                });
            });

            // Nếu 1 trong 2 người nhảy trúng dấu × -> Nháy × và tụt cả 2 thang máy về đáy!
            if (triggeredFail) {
                tp2.failUntil = now + 750;
                elevs.forEach((e, idx) => {
                    e.tier = 0;
                    e.targetY = e.tiersY[0];
                    e.locked = false;
                    e.cooldownUntil = now + 800;
                    e.symbol = idx === 0 ? 'tri' : 'up';
                    e.nextChangeAt = now + 900 + idx * 220;
                });
            }

            // Di chuyển mượt 2 thang máy tới độ cao bậc mục tiêu
            elevs.forEach(e => {
                const moveSpd = e.y > e.targetY ? 4.5 : 6.0;
                if (e.y > e.targetY) e.y = Math.max(e.targetY, e.y - moveSpd);
                else if (e.y < e.targetY) e.y = Math.min(e.targetY, e.y + moveSpd);
            });
        }

        const serialized2 = serializeTwoPlayers2(tp2, room, now);
        room.state.twoPlayers2 = serialized2;
        io.to(pass).emit('twoPlayers2Sync', serialized2);
    }
}

function registerSocket(socket, helpers) {
    const { io, rooms } = helpers;

    // Hồi sinh lại đầu Chặng 3 & khôi phục 3 khối gạch trắng khi chạm dung nham ở Màn 10-1
    socket.on('twoPlayersRespawnStage', () => {
        const pass = socket.roomPass;
        const room = rooms[pass];
        if (!room || !room.state || !room.state._twoPlayersInternal) return;

        const tp = room.state._twoPlayersInternal;
        tp.crumblingBlocks.forEach(cb => {
            cb.triggeredAt = null;
            cb.broken = false;
        });

        const activeIds = tp.pairs[tp.activePairIdx] || [];
        activeIds.forEach((id, idx) => {
            const p = room.players[id];
            if (!p || p.enteredDoor) return;
            p.x = tp.respawn.x + idx * 46;
            p.y = tp.respawn.y;
            p.vx = 0;
            p.vy = 0;
            p.scale = 1;
        });

        io.to(pass).emit('twoPlayersPairSwitch', {
            players: makePlayersSyncMap(room),
            keyHolder: room.state.keyHolder,
            doorUnlocked: room.state.doorUnlocked,
            banner: ''
        });
        io.to(pass).emit('twoPlayersSync', serializeTwoPlayers(tp, room));
    });
}

const world10_3 = require('./server_10_3');
const world10_4 = require('./server_10_4');
const world11 = require('./server_world11');
const world12 = require('./server_world12');
const world13 = require('./server_world13');
const world14 = require('./server_world14');
const world15 = require('./server_world15');
const world16 = require('./server_world16');

module.exports = {
    initLevelState(room, levelData, playerIds, helpers) {
        initLevelState(room, levelData, playerIds, helpers);
        world10_3.initLevelState(room, levelData, playerIds, helpers);
        world10_4.initLevelState(room, levelData, playerIds, helpers);
        world11.initLevelState(room, levelData, playerIds, helpers);
        world12.initLevelState(room, levelData, playerIds, helpers);
        world13.initLevelState(room, levelData, playerIds, helpers);
        world14.initLevelState(room, levelData, playerIds, helpers);
        world15.initLevelState(room, levelData, playerIds, helpers);
        world16.initLevelState(room, levelData, playerIds, helpers);
    },
    updateRoom(room, pass, players, totalPlayers, now, helpers) {
        updateRoom(room, pass, players, totalPlayers, now, helpers);
        world10_3.updateRoom(room, pass, players, totalPlayers, now, helpers);
        world10_4.updateRoom(room, pass, players, totalPlayers, now, helpers);
        world11.updateRoom(room, pass, players, totalPlayers, now, helpers);
        world12.updateRoom(room, pass, players, totalPlayers, now, helpers);
        world13.updateRoom(room, pass, players, totalPlayers, now, helpers);
        world14.updateRoom(room, pass, players, totalPlayers, now, helpers);
        world15.updateRoom(room, pass, players, totalPlayers, now, helpers);
        world16.updateRoom(room, pass, players, totalPlayers, now, helpers);
    },
    registerSocket(socket, helpers) {
        registerSocket(socket, helpers);
        world11.registerSocket(socket, helpers);
        world12.registerSocket(socket, helpers);
        world13.registerSocket(socket, helpers);
        world14.registerSocket(socket, helpers);
        world15.registerSocket(socket, helpers);
        world16.registerSocket(socket, helpers);
    }
};