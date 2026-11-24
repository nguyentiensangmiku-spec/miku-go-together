// ================================================================
// ĐỒ HỌA & VẬT LÝ CHUNG CHO CẢ 4 MÀN WORLD 15 (15-1 -> 15-4)
// Tông màu Trắng - Xanh lá chuẩn Pico Park 2
// ================================================================
(function () {
    const base = window.GameEngineExtra;
    if (!base) return;

    const origBindSocket = base.bindSocket;
    const origOnStart = base.onStart;
    const origOnKeyDown = base.onKeyDown;
    const origShouldLock = base.shouldLockPlayer;
    const origGetExtraSolids = base.getExtraSolids;
    const origUpdatePhysics = base.updatePhysics;
    const origDrawBefore = base.drawWorldBeforePlayers;
    const origDrawAfter = base.drawWorldAfterPlayers;
    const origDrawHUD = base.drawHUD;

    function fillRoundedRect(ctx, x, y, w, h, r) {
        const rad = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rad, y);
        ctx.lineTo(x + w - rad, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
        ctx.lineTo(x + w, y + h - rad);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
        ctx.lineTo(x + rad, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
        ctx.lineTo(x, y + rad);
        ctx.quadraticCurveTo(x, y, x + rad, y);
        ctx.closePath();
        ctx.fill();
    }

    function drawSpotlightCone(ctx, cone, state) {
        if (!cone || state === 'off') return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cone.ax, cone.ay);
        ctx.arc(cone.ax, cone.ay, cone.radius, cone.dirAngle - cone.halfAngle, cone.dirAngle + cone.halfAngle);
        ctx.closePath();

        ctx.fillStyle = state === 'telegraph' ? 'rgba(255, 255, 255, 0.28)' : '#ffffff';
        ctx.fill();
        ctx.restore();
    }

    function drawGreenSpring(ctx, x, y, w, h, green) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = green;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 3);
        ctx.lineTo(x + w - 2, y + h - 2);
        ctx.moveTo(x + w - 2, y + 3);
        ctx.lineTo(x + 2, y + h - 2);
        ctx.stroke();

        ctx.fillStyle = green;
        ctx.fillRect(x, y, w, 3.5);
        ctx.fillRect(x, y + h - 3, w, 3);
    }

    function drawColorBox(ctx, x, y, w, h, color) {
        const rx = Math.round(x);
        const ry = Math.round(y);
        ctx.fillStyle = (color && color.fill) || '#ff9ff3';
        ctx.strokeStyle = (color && color.border) || '#999999';
        ctx.lineWidth = 2.5;
        ctx.fillRect(rx + 1, ry + 1, w - 2, h - 2);
        ctx.strokeRect(rx + 1, ry + 1, w - 2, h - 2);

        // Vệt sáng nhỏ ở góc trên-trái giúp phân biệt hộp màu rõ với chú mèo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(rx + 4, ry + 4, w - 10, 3);
    }

    function drawBlueCircle(ctx, cx, cy, r = 20) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#1e90ff';
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.restore();
    }

    function drawCrossMark(ctx, cx, cy, size = 16) {
        ctx.save();
        ctx.strokeStyle = '#ff3b30';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - size, cy - size);
        ctx.lineTo(cx + size, cy + size);
        ctx.moveTo(cx + size, cy - size);
        ctx.lineTo(cx - size, cy + size);
        ctx.stroke();
        ctx.restore();
    }

    base.onStart = function (env) {
        if (origOnStart) origOnStart(env);
        const w15 = env.roomState && env.roomState.world15;
        const me = env.players && env.players[env.myId];
        if (w15 && w15.mode === 'rememberMatch' && me) {
            me.scale = w15.playerScale || 0.72;
        }
    };

    base.onKeyDown = function (e, env) {
        if (origOnKeyDown) origOnKeyDown(e, env);
        const w15 = env.roomState && env.roomState.world15;
        if (!w15 || !w15.enabled || e.repeat) return;

        if (w15.mode === 'skillFormation') {
            if (e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                if (env.socket) env.socket.emit('world15ToggleLink');
            }
        }

        if (w15.mode === 'rememberMatch' && w15.phase === 'play' && e.code === 'KeyF') {
            if (env.socket) env.socket.emit('world15ForceCheck');
        }
    };

    base.bindSocket = function (socket, engine) {
        if (origBindSocket) origBindSocket(socket, engine);

        socket.on('world15Sync', (w15) => {
            const env = engine.getContext();
            if (!env.roomState) return;

            const oldW15 = env.roomState.world15;
            const me = env.players && env.players[env.myId];

            if (oldW15 && w15 && (w15.mode === 'trackCarrier' || w15.mode === 'skillFormation') && oldW15.carrier && w15.carrier && me && !me.enteredDoor) {
                const isLockedFollower = w15.mode === 'skillFormation' &&
                    w15.anchorId && w15.anchorId !== env.myId &&
                    (w15.linkedIds || []).includes(env.myId);

                if (!isLockedFollower) {
                    const dx = w15.carrier.x - oldW15.carrier.x;
                    const dy = w15.carrier.y - oldW15.carrier.y;
                    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                        const myW = Math.round(36 * (me.scale || 1));
                        const myH = Math.round(39 * (me.scale || 1));
                        const oc = oldW15.carrier;
                        const onHoriz = me.x + myW > oc.x + 2 && me.x < oc.x + oc.w - 2;
                        const onVert = Math.abs((me.y + myH) - oc.y) <= 18;
                        if (onHoriz && onVert) {
                            me.x += dx;
                            me.y += dy;
                        }
                    }
                }
            }

            // Kéo mèo đi theo hộp màu nếu đang đứng trên đầu hộp màu ở Màn 15-4
            if (oldW15 && w15 && w15.mode === 'rememberMatch' && oldW15.boxes && w15.boxes && me && !me.enteredDoor) {
                const myW = Math.round(36 * (me.scale || 1));
                const myH = Math.round(39 * (me.scale || 1));
                w15.boxes.forEach((nb, idx) => {
                    const ob = oldW15.boxes[idx];
                    if (!ob) return;
                    const dx = nb.x - ob.x;
                    const dy = nb.y - ob.y;
                    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                        const onHoriz = me.x + myW > ob.x + 2 && me.x < ob.x + ob.w - 2;
                        const onVert = Math.abs((me.y + myH) - ob.y) <= 10;
                        if (onHoriz && onVert) {
                            me.x += dx;
                            me.y += dy;
                        }
                    }
                });
            }

            if (w15 && w15.mode === 'skillFormation' && w15.linkedPositions && env.players) {
                for (const id in w15.linkedPositions) {
                    if (env.players[id] && !env.players[id].enteredDoor) {
                        env.players[id].x = w15.linkedPositions[id].x;
                        env.players[id].y = w15.linkedPositions[id].y;
                        env.players[id].vy = 0;
                    }
                }
            }

            if (w15 && w15.mode === 'rememberMatch' && w15.phase === 'cleared_puzzle') {
                env.roomState.keyVisible = true;
            }

            env.roomState.world15 = w15;
        });
    };

    base.shouldLockPlayer = function (env) {
        if (origShouldLock && origShouldLock(env)) return true;
        const w15 = env.roomState && env.roomState.world15;
        if (!w15 || !w15.enabled) return false;

        if (w15.mode === 'spotlights' && w15.caught) return true;

        if (w15.mode === 'rememberMatch') {
            if (w15.phase === 'memorize' || w15.phase === 'finish' || w15.phase === 'checking') {
                return true;
            }
        }

        if (w15.mode === 'skillFormation' && w15.anchorId && w15.anchorId !== env.myId) {
            if ((w15.linkedIds || []).includes(env.myId)) return true;
        }
        return false;
    };

    base.getExtraSolids = function (env) {
        const solids = origGetExtraSolids ? origGetExtraSolids(env) : [];
        const w15 = env.roomState && env.roomState.world15;
        if (!w15 || !w15.enabled) return solids;

        if ((w15.mode === 'trackCarrier' || w15.mode === 'skillFormation') && w15.carrier) {
            solids.push({
                x: w15.carrier.x,
                y: w15.carrier.y,
                w: w15.carrier.w,
                h: w15.carrier.h,
                isElevator: true
            });
        }

        // Hộp màu ở Màn 15-4 là vật thể cứng (có thể đẩy & nhảy đứng lên trên)
        if (w15.mode === 'rememberMatch' && w15.boxes) {
            w15.boxes.forEach(b => {
                solids.push({ x: b.x, y: b.y, w: b.w, h: b.h, isColorBlock: true });
            });
        }

        return solids;
    };

    base.updatePhysics = function (env) {
        const res = origUpdatePhysics ? origUpdatePhysics(env) : null;
        if (res && res.restart) return res;

        const { roomState, me, rectOverlap, getCatSize } = env;
        const w15 = roomState && roomState.world15;
        if (!w15 || !w15.enabled || w15.mode !== 'trackCarrier' || !me || me.enteredDoor) return res;

        const { w: myW, h: myH } = getCatSize(me);
        const myBox = { x: me.x + 5, y: me.y + 5, w: Math.max(4, myW - 10), h: Math.max(4, myH - 10) };

        for (const rw of (w15.redWalls || [])) {
            if (rectOverlap(myBox, rw)) return { restart: true };
        }

        for (const sp of (w15.redSpikes || [])) {
            const upperPart = { x: sp.x + 8, y: sp.y, w: Math.max(8, sp.w - 16), h: sp.h * 0.52 };
            const tipPart = { x: sp.x + sp.w * 0.28, y: sp.y + sp.h * 0.52, w: sp.w * 0.44, h: sp.h * 0.44 };
            if (rectOverlap(myBox, upperPart) || rectOverlap(myBox, tipPart)) return { restart: true };
        }

        if (w15.pitHazard && rectOverlap(myBox, w15.pitHazard)) return { restart: true };

        return res;
    };

    base.drawWorldBeforePlayers = function (ctx, env) {
        if (origDrawBefore) origDrawBefore(ctx, env);
        const { levelData, roomState } = env;
        const w15 = roomState && roomState.world15;
        if (!w15 || !w15.enabled) return;

        const green = (levelData && levelData.groundColor) || '#4cd100';

        // --- MÀN 15-1 ---
        if (w15.mode === 'spotlights') {
            if (w15.tunnelRect) {
                const tr = w15.tunnelRect;
                ctx.fillStyle = '#bdbdbd';
                ctx.fillRect(tr.x, tr.y, tr.w, tr.h);
            }

            (w15.zone1TallCones || []).forEach(c => drawSpotlightCone(ctx, c, w15.tallState));
            (w15.zone1ShortCones || []).forEach(c => drawSpotlightCone(ctx, c, w15.shortState));
            (w15.zone2RoofCones || []).forEach(c => drawSpotlightCone(ctx, c, w15.zone2State));
            if (w15.zone3TiltedCone) drawSpotlightCone(ctx, w15.zone3TiltedCone, w15.zone2State);

            ctx.fillStyle = green;
            (levelData.platforms || []).forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

            if (w15.checkpoint) {
                const cp = w15.checkpoint;
                const poleX = cp.x;
                const poleBottomY = 445;
                const poleTopY = cp.y;

                ctx.fillStyle = w15.checkpointReached ? '#2e7d00' : '#4a8f1d';
                ctx.font = '900 18px "Segoe UI", Consolas, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('CHECKPOINT', poleX + 6, poleTopY - 8);

                ctx.fillStyle = w15.checkpointReached ? '#2e7d00' : '#3d7a16';
                ctx.fillRect(poleX, poleTopY, 5, poleBottomY - poleTopY);

                ctx.fillStyle = w15.checkpointReached ? '#4cd100' : '#5aa826';
                ctx.beginPath();
                ctx.moveTo(poleX + 5, poleTopY + 2);
                ctx.lineTo(poleX + 42, poleTopY + 17);
                ctx.lineTo(poleX + 5, poleTopY + 32);
                ctx.closePath();
                ctx.fill();

                if (w15.checkpointReached) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
            return;
        }

        // --- MÀN 15-2 ---
        if (w15.mode === 'trackCarrier') {
            const c = w15.carrier;

            if (w15.waypoints && w15.waypoints.length > 1 && c) {
                ctx.save();
                ctx.strokeStyle = green;
                ctx.lineWidth = 4;
                ctx.setLineDash([10, 10]);
                ctx.beginPath();
                w15.waypoints.forEach((pt, idx) => {
                    const cx = pt.x + c.w / 2;
                    const cy = pt.y + c.h / 2;
                    if (idx === 0) ctx.moveTo(cx, cy);
                    else ctx.lineTo(cx, cy);
                });
                ctx.stroke();
                ctx.restore();
            }

            ctx.fillStyle = '#ff6363';
            (w15.redWalls || []).forEach(rw => fillRoundedRect(ctx, rw.x, rw.y, rw.w, rw.h, 14));

            (w15.redSpikes || []).forEach(sp => {
                ctx.beginPath();
                ctx.moveTo(sp.x, sp.y - 4);
                ctx.lineTo(sp.x + sp.w, sp.y - 4);
                ctx.lineTo(sp.x + sp.w / 2 + 5, sp.y + sp.h - 4);
                ctx.quadraticCurveTo(sp.x + sp.w / 2, sp.y + sp.h + 2, sp.x + sp.w / 2 - 5, sp.y + sp.h - 4);
                ctx.closePath();
                ctx.fill();
            });

            if (c) {
                ctx.fillStyle = green;
                fillRoundedRect(ctx, Math.round(c.x), Math.round(c.y), c.w, c.h, 8);

                if (!c.activated) {
                    const boxW = 54;
                    const boxH = 54;
                    const boxX = Math.round(c.x + c.w / 2 - boxW / 2);
                    const boxY = Math.round(c.y - 108);

                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = green;
                    ctx.lineWidth = 4;
                    ctx.fillRect(boxX, boxY, boxW, boxH);
                    ctx.strokeRect(boxX, boxY, boxW, boxH);

                    ctx.fillStyle = green;
                    ctx.font = '900 32px Segoe UI';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(String(c.remaining ?? 0), boxX + boxW / 2, boxY + boxH / 2 + 2);
                    ctx.textBaseline = 'alphabetic';
                }
            }

            if (w15.pitHazard) {
                const h = w15.pitHazard;
                ctx.strokeStyle = green;
                ctx.lineWidth = 5;
                ctx.beginPath();
                const phase = Date.now() * 0.008;
                for (let x = h.x; x <= h.x + h.w; x += 14) {
                    const wy = h.y + Math.sin(x * 0.18 + phase) * 5;
                    if (x === h.x) ctx.moveTo(x, wy);
                    else ctx.lineTo(x, wy);
                }
                ctx.stroke();
            }
            return;
        }

        // --- MÀN 15-3 ---
        if (w15.mode === 'skillFormation') {
            const c = w15.carrier;

            ctx.fillStyle = green;
            ctx.font = '900 36px "Segoe UI", Consolas, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('PRESS E / SHIFT TO LINK', 105, 225);

            if (w15.waypoints && w15.waypoints.length > 1 && c) {
                ctx.save();
                ctx.strokeStyle = green;
                ctx.lineWidth = 4;
                ctx.setLineDash([10, 10]);
                ctx.beginPath();
                w15.waypoints.forEach((pt, idx) => {
                    const cx = pt.x + c.w / 2;
                    const cy = pt.y + c.h / 2;
                    if (idx === 0) ctx.moveTo(cx, cy);
                    else ctx.lineTo(cx, cy);
                });
                ctx.stroke();
                ctx.restore();
            }

            ctx.fillStyle = '#ff6363';
            (w15.redWalls || []).forEach(rw => fillRoundedRect(ctx, rw.x, rw.y, rw.w, rw.h, 14));

            if (w15.startButton) {
                const sb = w15.startButton;
                const h = w15.buttonPressed ? 4 : sb.h;
                const y = sb.y + (sb.h - h);
                ctx.fillStyle = '#ff2e2e';
                ctx.fillRect(sb.x, y, sb.w, h);
                ctx.fillStyle = '#b30000';
                ctx.fillRect(sb.x - 3, sb.y + sb.h - 3, sb.w + 6, 3);

                if (w15.countdown > 0) {
                    ctx.fillStyle = green;
                    ctx.font = '900 44px Segoe UI';
                    ctx.textAlign = 'center';
                    ctx.fillText(String(w15.countdown), sb.x + sb.w / 2, sb.y - 54);
                }
            }

            if (c) {
                ctx.fillStyle = green;
                fillRoundedRect(ctx, Math.round(c.x), Math.round(c.y), c.w, c.h, 8);
            }

            (w15.pitHazards || []).forEach(h => {
                ctx.strokeStyle = green;
                ctx.lineWidth = 5;
                ctx.beginPath();
                const phase = Date.now() * 0.008;
                for (let x = h.x; x <= h.x + h.w; x += 14) {
                    const wy = h.y + Math.sin(x * 0.18 + phase) * 5;
                    if (x === h.x) ctx.moveTo(x, wy);
                    else ctx.lineTo(x, wy);
                }
                ctx.stroke();
            });
            return;
        }

        // --- MÀN 15-4: 2 MÀN HÌNH SO SÁNH + HỘP MÀU ĐẨY THEO MÀU ---
        if (w15.mode === 'rememberMatch') {
            const halfDx = w15.halfDx || 446;
            const pScale = w15.playerScale || 0.72;

            // 1. Vẽ chân bàn xanh trang trí dưới các bục cho cả 2 nửa
            ctx.fillStyle = green;
            [18, 464].forEach(x0 => {
                // Chân bục trên-trái
                ctx.fillRect(x0 + 82, 264, 16, 16);
                ctx.fillRect(x0 + 146, 264, 16, 16);
                // Chân bục trên-phải (khớp x = 718 / 272)
                ctx.fillRect(x0 + 254, 262, 16, 16);
                ctx.fillRect(x0 + 302, 262, 16, 16);
                ctx.fillRect(x0 + 350, 262, 16, 16);
                // Chân bục dưới-trái
                ctx.fillRect(x0 + 68, 372, 16, 16);
                ctx.fillRect(x0 + 121, 372, 16, 16);
                ctx.fillRect(x0 + 174, 372, 16, 16);
                // Chân bục dưới-phải
                ctx.fillRect(x0 + 228, 372, 16, 16);
                ctx.fillRect(x0 + 281, 372, 16, 16);
                ctx.fillRect(x0 + 334, 372, 16, 16);
            });

            // 2. Phủ lại bàn bật lò xo mini sang tông Trắng - Xanh lá cho cả 2 nửa
            (levelData.bouncePads || []).forEach(pad => {
                drawGreenSpring(ctx, pad.x, pad.y, pad.w, pad.h, green);
                drawGreenSpring(ctx, pad.x - halfDx, pad.y, pad.w, pad.h, green);
            });

            // 3. Vẽ cửa đích đối xứng trên nửa trái
            if (levelData.door) {
                const d = levelData.door;
                ctx.fillStyle = '#c49a6c';
                ctx.fillRect(d.x - halfDx, d.y, d.w, d.h);
                ctx.fillStyle = '#5c4033';
                ctx.fillRect(d.x - halfDx + 8, d.y + 30, 8, 8);
            }

            // 4. Vẽ chữ REMEMBER!, đội hình mèo mẫu & vị trí hộp màu mẫu bên nửa trái
            ctx.fillStyle = green;
            ctx.font = '900 32px "Segoe UI", Consolas, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('REMEMBER!', 215, 428);

            (w15.targets || []).forEach(tg => {
                if (window.drawPixelCat) {
                    window.drawPixelCat(ctx, Math.round(tg.x - halfDx), Math.round(tg.y), tg.color, '', pScale);
                }
            });

            (w15.boxes || []).forEach(b => {
                // Hộp màu mẫu ở vị trí đích trên nửa trái
                drawColorBox(ctx, b.targetX - halfDx, b.targetY, b.w, b.h, b.color);
                // Hộp màu thực tế để đẩy trên nửa phải
                drawColorBox(ctx, b.x, b.y, b.w, b.h, b.color);
            });

            // 5. Trong pha xếp đội hình (play & finish): kéo rèm xám đen che kín toàn bộ nửa màn hình trái!
            if (w15.phase === 'play' || w15.phase === 'finish') {
                ctx.fillStyle = '#4a4a4a';
                ctx.fillRect(18, 16, 418, 446);
            }
        }
    };

    base.drawWorldAfterPlayers = function (ctx, env) {
        if (origDrawAfter) origDrawAfter(ctx, env);
        const { roomState, players, getCatSize } = env;
        const w15 = roomState && roomState.world15;
        if (!w15 || !w15.enabled) return;

        if (w15.mode === 'spotlights' && w15.caught && w15.caughtIds) {
            Object.values(players || {}).forEach(p => {
                if (p.enteredDoor || !w15.caughtIds.includes(p.id)) return;
                ctx.fillStyle = '#111111';
                ctx.font = '900 13px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('x  x', Math.round(p.x) + 18, Math.round(p.y) + 21);
            });
            return;
        }

        if (w15.mode === 'skillFormation' && w15.linkedIds && w15.linkedIds.length > 0) {
            w15.linkedIds.forEach(id => {
                const p = players && players[id];
                if (!p || p.enteredDoor) return;
                const { w, h } = getCatSize(p);
                ctx.strokeStyle = id === w15.anchorId ? '#ff9f1a' : '#4cd100';
                ctx.lineWidth = 2.5;
                ctx.strokeRect(Math.round(p.x) - 2, Math.round(p.y) - 2, w + 4, h + 4);
            });
            return;
        }

        // --- MÀN 15-4: CHỮ GO!, FINISH & CHẤM ĐIỂM CẢ MÈO LẪN HỘP MÀU ---
        if (w15.mode === 'rememberMatch') {
            const halfDx = w15.halfDx || 446;

            if (w15.phase === 'play' && w15.showGo) {
                ctx.fillStyle = '#4cd100';
                ctx.font = '900 54px "Segoe UI", Consolas, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('GO!', 227, 265);
            }

            if (w15.phase === 'finish') {
                ctx.fillStyle = '#4cd100';
                ctx.font = '900 54px "Segoe UI", Consolas, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('FINISH', 673, 270);
            }

            if (w15.phase === 'checking' && w15.results && w15.results.length > 0) {
                const limit = Math.min(w15.revealCount || 0, w15.results.length);
                for (let i = 0; i < limit; i++) {
                    const r = w15.results[i];
                    const itemW = r.w || 26;
                    const itemH = r.h || 26;
                    const leftCx = r.targetX - halfDx + itemW / 2;
                    const leftCy = r.targetY + itemH / 2;
                    const rightTargetCx = r.targetX + itemW / 2;
                    const rightTargetCy = r.targetY + itemH / 2;

                    // Luôn khoanh vòng xanh dương ở vị trí mẫu bên trái
                    drawBlueCircle(ctx, leftCx, leftCy, 20);

                    if (r.ok && r.actualX !== null) {
                        // Đứng / đẩy đúng vị trí -> khoanh vòng xanh dương bên phải
                        drawBlueCircle(ctx, r.actualX + itemW / 2, r.actualY + itemH / 2, 20);
                    } else {
                        // Sai vị trí -> dấu X đỏ tại vị trí bỏ lỡ bên phải
                        drawCrossMark(ctx, rightTargetCx, rightTargetCy, 16);

                        if (r.actualX !== null) {
                            const dist = Math.hypot(r.actualX - r.targetX, r.actualY - r.targetY);
                            if (dist > 34) {
                                drawCrossMark(ctx, r.actualX + itemW / 2, r.actualY - 12, 10);
                            }
                        }
                    }
                }
            }
        }
    };

    base.drawHUD = function (ctx, canvas, env) {
        if (origDrawHUD) origDrawHUD(ctx, canvas, env);
        const w15 = env.roomState && env.roomState.world15;
        if (!w15 || !w15.enabled || w15.mode !== 'rememberMatch') return;

        if (w15.phase === 'memorize' || w15.phase === 'play') {
            const green = (env.levelData && env.levelData.groundColor) || '#4cd100';
            const boxW = 112;
            const boxH = 44;
            const boxX = Math.round((canvas.width - boxW) / 2);
            const boxY = 10;

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = green;
            ctx.lineWidth = 4;
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            ctx.fillStyle = green;
            ctx.font = '900 28px Consolas, "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(w15.timeLeft ?? 0), boxX + boxW / 2, boxY + boxH / 2 + 2);
            ctx.textBaseline = 'alphabetic';
        }
    };
})();