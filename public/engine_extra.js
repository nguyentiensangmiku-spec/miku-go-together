// ================================================================
// FILE MỞ RỘNG ĐỒ HỌA & CƠ CHẾ RIÊNG CHO WORLD 9, 10, 11, 12
// (Độc lập hoàn toàn, không làm ảnh hưởng World 1 - 8 trong engine.js)
// ================================================================
window.GameEngineExtra = (function () {
    let switchBannerText = '';
    let switchBannerUntil = 0;
    let lastLavaEmit = 0;

    // Tự động đăng ký nhận dữ liệu từ server cho tất cả các World 9 - 12
    function bindSocket(socket, engine) {
        socket.on('ballParkSync', (bpData) => {
            const ctx = engine.getContext();
            if (!ctx.roomState) return;
            ctx.roomState.ballPark = bpData;
            if (bpData && bpData.broken) {
                ctx.roomState.keyVisible = true;
            }
        });

        socket.on('tiltMazeSync', (tmData) => {
            const env = engine.getContext();
            if (!env.roomState) return;

            const oldTm = env.roomState.tiltMaze;
            const me = env.players && env.players[env.myId];
            if (oldTm && me && !me.enteredDoor) {
                const myW = Math.round(36 * (me.scale || 1));
                const myH = Math.round(39 * (me.scale || 1));
                const pairs = [
                    [oldTm.leftScale, tmData.leftScale],
                    [oldTm.rightScale, tmData.rightScale]
                ];
                pairs.forEach(([os, ns]) => {
                    if (!os || !ns) return;
                    const dy = ns.y - os.y;
                    if (Math.abs(dy) < 0.01) return;
                    const onHoriz = me.x + myW > os.x + 2 && me.x < os.x + os.w - 2;
                    const onVert = Math.abs((me.y + myH) - os.y) <= 10;
                    if (onHoriz && onVert) me.y += dy;
                });
            }

            env.roomState.tiltMaze = tmData;
            if (tmData && tmData.buttonPressed) {
                env.roomState.keyVisible = true;
            }
        });

        socket.on('brickWallSync', (bwData) => {
            const env = engine.getContext();
            if (!env.roomState) return;
            env.roomState.brickWall = bwData;
        });

        socket.on('ballVolleySync', (bvData) => {
            const env = engine.getContext();
            if (!env.roomState) return;
            env.roomState.ballVolley = bvData;
            if (bvData && bvData.broken) {
                env.roomState.keyVisible = true;
            }
        });

        socket.on('twoPlayersSync', (tpData) => {
            const env = engine.getContext();
            if (!env.roomState) return;
            env.roomState.twoPlayers = tpData;
        });

        socket.on('twoPlayers2Sync', (tp2Data) => {
            const env = engine.getContext();
            if (!env.roomState) return;

            // Kéo chú mèo di chuyển mượt theo 2 thang máy ký hiệu ở Chặng 4 (Màn 10-2)
            const oldTp2 = env.roomState.twoPlayers2;
            const me = env.players && env.players[env.myId];
            if (oldTp2 && oldTp2.elevators && tp2Data && tp2Data.elevators && me && !me.enteredDoor) {
                const myW = Math.round(36 * (me.scale || 1));
                const myH = Math.round(39 * (me.scale || 1));
                tp2Data.elevators.forEach((ne, idx) => {
                    const oe = oldTp2.elevators[idx];
                    if (!oe) return;
                    const dy = ne.y - oe.y;
                    if (Math.abs(dy) < 0.01) return;
                    const onHoriz = me.x + myW > oe.x + 2 && me.x < oe.x + oe.w - 2;
                    const onVert = Math.abs((me.y + myH) - oe.y) <= 12;
                    if (onHoriz && onVert) me.y += dy;
                });
            }

            env.roomState.twoPlayers2 = tp2Data;
        });

        socket.on('twoPlayersPairSwitch', ({ players: syncedPlayers, keyHolder, doorUnlocked, banner }) => {
            const env = engine.getContext();
            if (!env.players || !env.roomState) return;
            for (const id in syncedPlayers) {
                if (env.players[id]) {
                    Object.assign(env.players[id], syncedPlayers[id]);
                }
            }
            env.roomState.keyHolder = keyHolder;
            env.roomState.doorUnlocked = doorUnlocked;
            if (banner) {
                switchBannerText = banner;
                switchBannerUntil = Date.now() + 2000;
            }
        });
    }

    function onStart() {
        switchBannerText = '';
        switchBannerUntil = 0;
        lastLavaEmit = 0;
    }

    // Các khối chắn / gạch cứng / bục động riêng của World 9 - 12
    function getExtraSolids({ roomState }) {
        const solids = [];

        if (roomState && roomState.ballPark && roomState.ballPark.enabled) {
            const bp = roomState.ballPark;
            if (bp.cannon) {
                solids.push({ x: bp.cannon.x, y: bp.cannon.y, w: bp.cannon.w, h: bp.cannon.h });
            }
            if (!bp.broken && bp.target) {
                solids.push({ x: bp.target.x, y: bp.target.y, w: bp.target.w, h: bp.target.h });
            }
        }

        if (roomState && roomState.tiltMaze && roomState.tiltMaze.enabled) {
            const tm = roomState.tiltMaze;
            if (tm.leftScale) {
                solids.push({ x: tm.leftScale.x, y: tm.leftScale.y, w: tm.leftScale.w, h: tm.leftScale.h, isElevator: true });
            }
            if (tm.rightScale) {
                solids.push({ x: tm.rightScale.x, y: tm.rightScale.y, w: tm.rightScale.w, h: tm.rightScale.h, isElevator: true });
            }
        }

        if (roomState && roomState.brickWall && roomState.brickWall.enabled) {
            (roomState.brickWall.bricks || []).forEach(br => {
                if (!br.broken) {
                    solids.push({ x: br.x, y: br.y, w: br.w, h: br.h });
                }
            });
        }

        if (roomState && roomState.ballVolley && roomState.ballVolley.enabled) {
            const bv = roomState.ballVolley;
            if (!bv.broken && bv.target) {
                solids.push({ x: bv.target.x, y: bv.target.y, w: bv.target.w, h: bv.target.h });
            }
            if (bv.cannon) {
                solids.push({ x: bv.cannon.x, y: bv.cannon.y, w: bv.cannon.w, h: bv.cannon.h });
            }
        }

        if (roomState && roomState.twoPlayers && roomState.twoPlayers.enabled) {
            const tp = roomState.twoPlayers;
            if (tp.pillar2 && tp.pillar2.y < 495) {
                solids.push({ x: tp.pillar2.x, y: tp.pillar2.y, w: tp.pillar2.w, h: tp.pillar2.h });
            }
            if (tp.bridgeOpen && tp.bridge) {
                solids.push({ x: tp.bridge.x, y: tp.bridge.y, w: tp.bridge.w, h: tp.bridge.h });
            } else {
                (tp.stage2Platforms || []).forEach(pl => {
                    if (pl.active) solids.push({ x: pl.x, y: pl.y, w: pl.w, h: pl.h });
                });
            }
            (tp.crumblingBlocks || []).forEach(cb => {
                if (!cb.broken) solids.push({ x: cb.x, y: cb.y, w: cb.w, h: cb.h });
            });
            if (tp.gate && tp.gate.y + tp.gate.h > (tp.gate.openY || 204) + 8) {
                solids.push({ x: tp.gate.x, y: tp.gate.y, w: tp.gate.w, h: tp.gate.h });
            }
        }

        // World 10 - Màn 10-2: Bậc thềm Chặng 1, Cầu Chặng 2, Cổng cao Chặng 3 & 2 Thang máy Chặng 4
        if (roomState && roomState.twoPlayers2 && roomState.twoPlayers2.enabled) {
            const tp2 = roomState.twoPlayers2;
            if (tp2.ledge1Open && tp2.ledge1) {
                solids.push({ x: tp2.ledge1.x, y: tp2.ledge1.y, w: tp2.ledge1.w, h: tp2.ledge1.h });
            }
            if (tp2.bridge2Open && tp2.bridge2) {
                solids.push({ x: tp2.bridge2.x, y: tp2.bridge2.y, w: tp2.bridge2.w, h: tp2.bridge2.h });
            }
            if (tp2.gate3) {
                solids.push({ x: tp2.gate3.x, y: tp2.gate3.y, w: tp2.gate3.w, h: tp2.gate3.h });
            }
            (tp2.elevators || []).forEach(e => {
                solids.push({ x: e.x, y: e.y, w: e.w, h: e.h, isElevator: true });
            });
        }

        return solids;
    }

    // Xử lý hồi sinh tại chặng hiện tại cho Màn 10-1 & Màn 10-2
    function updatePhysics({ levelData, roomState, me, rectOverlap, getCatSize, socket }) {
        if (!roomState || !me) return;

        // Màn 10-1
        if (roomState.twoPlayers && roomState.twoPlayers.enabled) {
            const tp = roomState.twoPlayers;
            const { w: myW, h: myH } = getCatSize(me);

            if (me.y > levelData.height + 5 && tp.respawn) {
                me.x = tp.respawn.x;
                me.y = tp.respawn.y;
                me.vx = 0;
                me.vy = 0;
                return;
            }

            if (tp.lava) {
                const myBox = { x: me.x + 4, y: me.y + 4, w: Math.max(4, myW - 8), h: Math.max(4, myH - 8) };
                if (rectOverlap(myBox, tp.lava)) {
                    const now = Date.now();
                    if (now - lastLavaEmit > 500) {
                        lastLavaEmit = now;
                        socket.emit('twoPlayersRespawnStage');
                    }
                    if (tp.respawn) {
                        me.x = tp.respawn.x;
                        me.y = tp.respawn.y;
                        me.vx = 0;
                        me.vy = 0;
                    }
                }
            }
        }

        // Màn 10-2: Rơi xuống vực Chặng 2 -> hồi sinh ngay trên đỉnh vách Chặng 2 (không reset màn)
        if (roomState.twoPlayers2 && roomState.twoPlayers2.enabled) {
            const tp2 = roomState.twoPlayers2;
            if (me.y > levelData.height + 5 && tp2.respawn) {
                me.x = tp2.respawn.x;
                me.y = tp2.respawn.y;
                me.vx = 0;
                me.vy = 0;
                return;
            }
        }
    }

    // Vẽ Màn 9-1: Hũ nhốt chìa khóa, Đại bác & Quả bóng cam
    function drawBallPark(ctx, { levelData, roomState, drawKeyIcon }) {
        const bp = roomState && roomState.ballPark;
        if (!bp || !bp.enabled) return;

        if (bp.cannon) {
            const c = bp.cannon;
            const recoil = bp.warning ? 3 : 0;
            const cx = c.x + 8 + recoil;
            const cy = c.y + 18;

            if (bp.warning && Math.floor(Date.now() / 80) % 2 === 0) {
                ctx.fillStyle = '#ff4757';
                ctx.beginPath();
                ctx.arc(c.x + 2, cy + 12, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = bp.warning ? '#ff5e57' : '#ff8c3a';
            ctx.strokeStyle = '#d35400';
            ctx.lineWidth = 2.5;
            ctx.fillRect(cx - 4, cy + 4, 24, 16);
            ctx.strokeRect(cx - 4, cy + 4, 24, 16);

            ctx.fillRect(cx + 14, cy, 26, 24);
            ctx.strokeRect(cx + 14, cy, 26, 24);

            ctx.fillStyle = '#d35400';
            ctx.fillRect(cx + 16, cy + 24, 22, 8);
        }

        if (!bp.broken && bp.target) {
            const t = bp.target;
            const shake = bp.hitFlash ? (Math.random() - 0.5) * 4 : 0;
            const tx = Math.round(t.x + 4 + shake);
            const ty = Math.round(t.y + 4);
            const tw = t.w - 8;
            const th = t.h - 4;

            if (levelData.key && drawKeyIcon) {
                drawKeyIcon(levelData.key.x + shake, levelData.key.y);
            }

            ctx.fillStyle = bp.hitFlash ? 'rgba(255, 118, 117, 0.55)' : 'rgba(255, 165, 2, 0.35)';
            ctx.fillRect(tx, ty, tw, th);

            ctx.strokeStyle = '#ff8c3a';
            ctx.lineWidth = 3.5;
            ctx.strokeRect(tx, ty, tw, th);
            ctx.fillStyle = '#ff8c3a';
            ctx.fillRect(tx + 8, ty - 4, tw - 16, 6);

            if (bp.hits >= 1) {
                ctx.strokeStyle = '#d35400';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(tx + tw, ty + 14);
                ctx.lineTo(tx + tw - 16, ty + 24);
                ctx.lineTo(tx + tw - 8, ty + 36);
                ctx.stroke();
            }
            if (bp.hits >= 2) {
                ctx.strokeStyle = '#c0392b';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(tx + 2, ty + 18);
                ctx.lineTo(tx + 20, ty + 28);
                ctx.lineTo(tx + 12, ty + 46);
                ctx.moveTo(tx + 20, ty + 28);
                ctx.lineTo(tx + tw - 4, ty + 42);
                ctx.stroke();
            }
        }

        if (bp.ball) {
            const bx = Math.round(bp.ball.x);
            const by = Math.round(bp.ball.y);
            ctx.beginPath();
            ctx.arc(bx, by, bp.ball.r, 0, Math.PI * 2);
            ctx.fillStyle = '#ff793f';
            ctx.fill();
            ctx.strokeStyle = '#d35400';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            const angle = -(bp.ball.x * 0.08);
            ctx.beginPath();
            ctx.arc(bx + Math.cos(angle) * 4, by + Math.sin(angle) * 4, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffeaa7';
            ctx.fill();
        }

        if (bp.popEffect) {
            const px = bp.popEffect.x;
            const py = bp.popEffect.y;
            ctx.strokeStyle = '#ff6b2b';
            ctx.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
                const a = (Math.PI * 2 * i) / 6;
                ctx.beginPath();
                ctx.moveTo(px + Math.cos(a) * 6, py + Math.sin(a) * 6);
                ctx.lineTo(px + Math.cos(a) * 16, py + Math.sin(a) * 16);
                ctx.stroke();
            }
        }
    }

    // Vẽ Màn 9-2: Ống thả bóng, 3 thanh nghiêng, Nút đỏ, Bóng lăn & 2 Đĩa cân
    function drawTiltMaze(ctx, { levelData, roomState }) {
        const tm = roomState && roomState.tiltMaze;
        if (!tm || !tm.enabled) return;

        const orange = levelData.groundColor || '#ff8c3a';

        if (tm.spawner) {
            const sx = tm.spawner.x;
            ctx.fillStyle = orange;
            ctx.fillRect(sx - 13, 0, 26, 26);
            ctx.fillRect(sx - 16, 22, 6, 14);
            ctx.fillRect(sx + 10, 22, 6, 14);
        }

        ctx.fillStyle = orange;
        (tm.planks || []).forEach(pl => {
            ctx.save();
            ctx.translate(pl.cx, pl.cy);
            ctx.rotate(tm.angle || 0);
            ctx.fillRect(-pl.w / 2, -pl.h / 2, pl.w, pl.h);
            ctx.restore();
        });

        if (tm.button) {
            const btn = tm.button;
            const btnH = tm.buttonPressed ? 4 : btn.h;
            const btnY = btn.y + (btn.h - btnH);
            ctx.fillStyle = '#ff2e2e';
            ctx.fillRect(btn.x, btnY, btn.w, btnH);
            ctx.fillStyle = '#b30000';
            ctx.fillRect(btn.x - 3, btn.y + btn.h - 3, btn.w + 6, 3);
        }

        if (tm.ball) {
            const bx = Math.round(tm.ball.x);
            const by = Math.round(tm.ball.y);
            ctx.beginPath();
            ctx.arc(bx, by, tm.ball.r, 0, Math.PI * 2);
            ctx.fillStyle = '#fff8e7';
            ctx.fill();
            ctx.strokeStyle = orange;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.fillStyle = orange;
        if (tm.leftScale) {
            ctx.fillRect(Math.round(tm.leftScale.x), Math.round(tm.leftScale.y), tm.leftScale.w, tm.leftScale.h);
        }
        if (tm.rightScale) {
            ctx.fillRect(Math.round(tm.rightScale.x), Math.round(tm.rightScale.y), tm.rightScale.w, tm.rightScale.h);
        }
    }

    // Vẽ Màn 9-3: Tường gạch màu vuông & các quả bóng cam
    function drawBrickWall(ctx, { roomState }) {
        const bw = roomState && roomState.brickWall;
        if (!bw || !bw.enabled) return;

        (bw.bricks || []).forEach(br => {
            if (br.broken) return;
            ctx.fillStyle = br.color.fill;
            ctx.strokeStyle = br.color.border;
            ctx.lineWidth = 3;
            ctx.fillRect(br.x + 1.5, br.y + 1.5, br.w - 3, br.h - 3);
            ctx.strokeRect(br.x + 1.5, br.y + 1.5, br.w - 3, br.h - 3);
        });

        (bw.balls || []).forEach(ball => {
            if (ball.alive === false) return;
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
    }

    // Vẽ Màn 9-4: Đại bác trên gờ cao, Hũ nhốt chìa khóa & Bóng tâng viền cam
    function drawBallVolley(ctx, { levelData, roomState, drawKeyIcon }) {
        const bv = roomState && roomState.ballVolley;
        if (!bv || !bv.enabled) return;

        const orange = levelData.groundColor || '#ff8c3a';

        if (bv.cannon) {
            const c = bv.cannon;
            const recoil = bv.warning ? 3 : 0;
            const cx = c.x + recoil;
            const cy = c.y + 6;

            if (bv.warning && Math.floor(Date.now() / 80) % 2 === 0) {
                ctx.fillStyle = '#ff4757';
                ctx.beginPath();
                ctx.arc(c.x - 4, cy + 12, 7, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = bv.warning ? '#ff5e57' : orange;
            ctx.strokeStyle = '#d35400';
            ctx.lineWidth = 2.5;
            ctx.fillRect(cx, cy + 5, 22, 14);
            ctx.strokeRect(cx, cy + 5, 22, 14);

            ctx.fillRect(cx + 16, cy, 28, 24);
            ctx.strokeRect(cx + 16, cy, 28, 24);
            ctx.fillStyle = '#d35400';
            ctx.fillRect(cx + 18, cy + 24, 24, 14);
        }

        if (!bv.broken && bv.target) {
            const t = bv.target;
            const tx = Math.round(t.x + 2);
            const ty = Math.round(t.y + 4);
            const tw = t.w - 4;
            const th = t.h - 4;

            if (levelData.key && drawKeyIcon) {
                drawKeyIcon(levelData.key.x, levelData.key.y);
            }

            ctx.fillStyle = 'rgba(255, 165, 2, 0.34)';
            ctx.fillRect(tx, ty, tw, th);

            ctx.strokeStyle = orange;
            ctx.lineWidth = 3.5;
            ctx.strokeRect(tx, ty, tw, th);

            ctx.fillStyle = orange;
            ctx.fillRect(tx + 9, ty - 5, tw - 18, 6);
        }

        if (bv.ball) {
            const bx = Math.round(bv.ball.x);
            const by = Math.round(bv.ball.y);
            ctx.beginPath();
            ctx.arc(bx, by, bv.ball.r, 0, Math.PI * 2);
            ctx.fillStyle = '#fff8e7';
            ctx.fill();
            ctx.strokeStyle = orange;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        if (bv.popEffect) {
            const px = bv.popEffect.x;
            const py = bv.popEffect.y;
            ctx.strokeStyle = '#ff6b2b';
            ctx.lineWidth = 3;
            for (let i = 0; i < 8; i++) {
                const a = (Math.PI * 2 * i) / 8;
                ctx.beginPath();
                ctx.moveTo(px + Math.cos(a) * 6, py + Math.sin(a) * 6);
                ctx.lineTo(px + Math.cos(a) * 18, py + Math.sin(a) * 18);
                ctx.stroke();
            }
        }
    }

    // Vẽ World 10 - Màn 10-1
    function drawTwoPlayers(ctx, { levelData, roomState }) {
        const tp = roomState && roomState.twoPlayers;
        if (!tp || !tp.enabled) return;

        const orange = levelData.groundColor || '#ff8c3a';

        if (tp.pillar2 && tp.pillar2.y < 498) {
            ctx.fillStyle = orange;
            ctx.fillRect(tp.pillar2.x, tp.pillar2.y, tp.pillar2.w, tp.pillar2.h);
        }

        ctx.fillStyle = orange;
        if (tp.bridgeOpen && tp.bridge) {
            ctx.fillRect(tp.bridge.x, tp.bridge.y, tp.bridge.w, tp.bridge.h);
        } else {
            (tp.stage2Platforms || []).forEach(pl => {
                if (pl.active) {
                    ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
                }
            });
        }

        if (tp.lava) {
            const h = tp.lava;
            ctx.strokeStyle = orange;
            ctx.lineWidth = 5;
            ctx.beginPath();
            for (let x = h.x; x <= h.x + h.w; x += 16) {
                const waveY = h.y + Math.sin(x * 0.22 + Date.now() * 0.005) * 5;
                if (x === h.x) ctx.moveTo(x, waveY);
                else ctx.lineTo(x, waveY);
            }
            ctx.stroke();
        }

        (tp.crumblingBlocks || []).forEach(cb => {
            if (cb.broken) return;
            const shakeX = cb.triggeredAt ? (Math.random() - 0.5) * 4 : 0;
            const shakeY = cb.triggeredAt ? (Math.random() - 0.5) * 4 : 0;
            ctx.fillStyle = cb.triggeredAt ? '#ffe0cc' : '#ffffff';
            ctx.strokeStyle = cb.triggeredAt ? '#ff6b2b' : '#b2bec3';
            ctx.lineWidth = 3;
            ctx.fillRect(cb.x + shakeX + 1, cb.y + shakeY + 1, cb.w - 2, cb.h - 2);
            ctx.strokeRect(cb.x + shakeX + 1, cb.y + shakeY + 1, cb.w - 2, cb.h - 2);
        });

        if (tp.gate) {
            ctx.fillStyle = orange;
            ctx.fillRect(tp.gate.x, tp.gate.y, tp.gate.w, tp.gate.h);
        }

        (tp.buttons || []).forEach(btn => {
            const btnH = btn.pressed ? 5 : btn.h;
            const btnY = btn.y + (btn.h - btnH);
            ctx.fillStyle = '#ff2e2e';
            ctx.fillRect(btn.x, btnY, btn.w, btnH);
            ctx.fillStyle = '#b30000';
            ctx.fillRect(btn.x - 3, btn.y + btn.h - 3, btn.w + 6, 3);
        });
    }

    // Vẽ biểu tượng trong hộp vuông thang máy Màn 10-2 (↑ / △ / × / -)
    function drawSignIcon(ctx, cx, cy, symbol, color) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (symbol === 'up') {
            ctx.beginPath();
            ctx.moveTo(cx, cy + 13);
            ctx.lineTo(cx, cy - 12);
            ctx.moveTo(cx - 10, cy - 2);
            ctx.lineTo(cx, cy - 13);
            ctx.lineTo(cx + 10, cy - 2);
            ctx.stroke();
        } else if (symbol === 'tri') {
            ctx.beginPath();
            ctx.moveTo(cx, cy - 12);
            ctx.lineTo(cx + 13, cy + 11);
            ctx.lineTo(cx - 13, cy + 11);
            ctx.closePath();
            ctx.stroke();
        } else if (symbol === 'x') {
            ctx.beginPath();
            ctx.moveTo(cx - 10, cy - 10);
            ctx.lineTo(cx + 10, cy + 10);
            ctx.moveTo(cx + 10, cy - 10);
            ctx.lineTo(cx - 10, cy + 10);
            ctx.stroke();
        } else {
            // Dấu '-' (tạm khóa chờ đồng đội)
            ctx.beginPath();
            ctx.moveTo(cx - 11, cy);
            ctx.lineTo(cx + 11, cy);
            ctx.stroke();
        }
    }

    // Vẽ World 10 - Màn 10-2: Bậc thềm Chặng 1, Cầu Chặng 2, Cổng cao Chặng 3, 3 nút đỏ & 2 Thang máy ký hiệu
    function drawTwoPlayers2(ctx, { levelData, roomState }) {
        const tp2 = roomState && roomState.twoPlayers2;
        if (!tp2 || !tp2.enabled) return;

        const orange = levelData.groundColor || '#ff8c3a';

        // 1. Bậc thềm nhỏ nhô ra ở Chặng 1
        if (tp2.ledge1Open && tp2.ledge1) {
            ctx.fillStyle = orange;
            ctx.fillRect(tp2.ledge1.x, tp2.ledge1.y, tp2.ledge1.w, tp2.ledge1.h);
        }

        // 2. Cầu sàn phẳng Chặng 2
        if (tp2.bridge2Open && tp2.bridge2) {
            ctx.fillStyle = orange;
            ctx.fillRect(tp2.bridge2.x, tp2.bridge2.y, tp2.bridge2.w, tp2.bridge2.h);
        }

        // 3. Cột cổng dọc màu cam Chặng 3
        if (tp2.gate3) {
            ctx.fillStyle = orange;
            ctx.fillRect(tp2.gate3.x, tp2.gate3.y, tp2.gate3.w, tp2.gate3.h);
        }

        // 4. 3 nút bấm đỏ của Chặng 1, 2, 3
        (tp2.buttons || []).forEach(btn => {
            const btnH = btn.pressed ? 5 : btn.h;
            const btnY = btn.y + (btn.h - btnH);
            ctx.fillStyle = '#ff2e2e';
            ctx.fillRect(btn.x, btnY, btn.w, btnH);
            ctx.fillStyle = '#b30000';
            ctx.fillRect(btn.x - 3, btn.y + btn.h - 3, btn.w + 6, 3);
        });

        // 5. 2 Thang máy & Khung biển ký hiệu vuông ở Chặng 4
        (tp2.elevators || []).forEach(e => {
            const ey = Math.round(e.y);
            ctx.fillStyle = orange;
            ctx.fillRect(e.x, ey, e.w, e.h);

            const boxSize = 56;
            const bx = Math.round(e.x + (e.w - boxSize) / 2);
            const by = ey - 112;
            const frameColor = e.failFlash ? '#ff4757' : orange;

            ctx.fillStyle = '#fff8e7';
            ctx.strokeStyle = frameColor;
            ctx.lineWidth = 4;
            ctx.fillRect(bx, by, boxSize, boxSize);
            ctx.strokeRect(bx, by, boxSize, boxSize);

            drawSignIcon(ctx, bx + boxSize / 2, by + boxSize / 2, e.symbol, frameColor);
        });
    }

    // Vẽ Mũ bảo hộ vàng trên đầu các chú mèo ở Màn 9-3
    function drawHardHatExtra(ctx, p) {
        const px = Math.round(p.x);
        const py = Math.round(p.y);
        const w = 36;

        ctx.fillStyle = '#ffe033';
        ctx.strokeStyle = '#d49a00';
        ctx.lineWidth = 2;
        ctx.fillRect(px + 2, py - 9, w - 4, 11);
        ctx.strokeRect(px + 2, py - 9, w - 4, 11);

        ctx.fillStyle = '#fff176';
        ctx.fillRect(px + 8, py - 12, w - 16, 5);

        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(px - 4, py + 1, w + 8, 5);
        ctx.strokeRect(px - 4, py + 1, w + 8, 5);
    }

    function drawWorldBeforePlayers(ctx, env) {
        drawBallPark(ctx, env);
        drawTiltMaze(ctx, env);
        drawBrickWall(ctx, env);
        drawBallVolley(ctx, env);
        drawTwoPlayers(ctx, env);
        drawTwoPlayers2(ctx, env);
    }

    function drawWorldAfterPlayers(ctx, { levelData, players }) {
        if (levelData && levelData.brickWall && levelData.brickWall.enabled) {
            Object.values(players || {}).forEach(p => {
                if (!p.enteredDoor) drawHardHatExtra(ctx, p);
            });
        }
    }

    function drawRelayHUD(ctx, canvas, tpObj, roomState, players, myId) {
        const namesText = (tpObj.activeNames && tpObj.activeNames.length)
            ? tpObj.activeNames.join(' & ')
            : '';
        const label = `CHẶNG ${tpObj.stage + 1}/${tpObj.totalStages}` + (namesText ? `  |  ${namesText}` : '');

        ctx.font = '900 16px Segoe UI';
        const textW = ctx.measureText(label).width;
        const boxW = Math.max(210, Math.round(textW + 36));
        const boxH = 34;
        const boxX = Math.round((canvas.width - boxW) / 2);
        const boxY = 12;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ff8c3a';
        ctx.lineWidth = 3;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = '#ff8c3a';
        ctx.textAlign = 'center';
        ctx.fillText(label, canvas.width / 2, boxY + 23);

        const me = players && players[myId];
        const isWaiting = me && me.enteredDoor && !(tpObj.activeIds || []).includes(myId) && !roomState.cleared;
        if (isWaiting) {
            const waitW = 350;
            const waitH = 34;
            const waitX = Math.round((canvas.width - waitW) / 2);
            const waitY = canvas.height - 46;
            ctx.fillStyle = 'rgba(255, 248, 231, 0.92)';
            ctx.strokeStyle = '#ff8c3a';
            ctx.lineWidth = 2.5;
            ctx.fillRect(waitX, waitY, waitW, waitH);
            ctx.strokeRect(waitX, waitY, waitW, waitH);
            ctx.fillStyle = '#ff6b2b';
            ctx.font = 'bold 15px Segoe UI';
            ctx.fillText('Đang xem đồng đội chơi — sắp tới lượt bạn!', canvas.width / 2, waitY + 22);
        }

        if (switchBannerText && Date.now() < switchBannerUntil) {
            ctx.fillStyle = '#ff6b2b';
            ctx.font = '900 32px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(switchBannerText, canvas.width / 2, 92);
        }
    }

    function drawHUD(ctx, canvas, { roomState, players, myId }) {
        if (roomState && roomState.ballPark && roomState.ballPark.enabled) {
            const bp = roomState.ballPark;
            const boxW = 190;
            const boxH = 38;
            const boxX = Math.round((canvas.width - boxW) / 2);
            const boxY = 38;

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = bp.broken ? '#2ed573' : '#ff8c3a';
            ctx.lineWidth = 3.5;
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            ctx.fillStyle = bp.broken ? '#2ed573' : '#ff8c3a';
            ctx.font = '900 20px Segoe UI';
            ctx.textAlign = 'center';
            const label = bp.broken
                ? 'VỠ HŨ! LẤY CHÌA!'
                : `ĐẬP HŨ: ${bp.hits}/${bp.maxHits}`;
            ctx.fillText(label, canvas.width / 2, boxY + 26);
        }

        if (roomState && roomState.brickWall && roomState.brickWall.enabled) {
            const bw = roomState.brickWall;
            const aliveBalls = (bw.balls || []).filter(b => b.alive !== false).length;
            ctx.fillStyle = '#fff8e7';
            ctx.font = '900 18px Segoe UI';
            ctx.textAlign = 'right';
            ctx.fillText(`Bóng còn: ${aliveBalls}`, canvas.width - 22, 23);

            if (bw.failed) {
                ctx.fillStyle = 'rgba(255, 248, 231, 0.78)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ff4757';
                ctx.font = '900 54px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('HẾT BÓNG!', canvas.width / 2, canvas.height / 2 + 16);
            }
        }

        if (roomState && roomState.twoPlayers && roomState.twoPlayers.enabled) {
            drawRelayHUD(ctx, canvas, roomState.twoPlayers, roomState, players, myId);
        }

        if (roomState && roomState.twoPlayers2 && roomState.twoPlayers2.enabled) {
            drawRelayHUD(ctx, canvas, roomState.twoPlayers2, roomState, players, myId);
        }
    }

    return {
        bindSocket,
        onStart,
        getExtraSolids,
        updatePhysics,
        drawWorldBeforePlayers,
        drawWorldAfterPlayers,
        drawHUD
    };
})();