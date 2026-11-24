// ================================================================
// ĐỒ HỌA & VẬT LÝ CHUNG CHO CẢ 4 MÀN WORLD 12 (12-1 -> 12-4)
// ================================================================
(function () {
    const base = window.GameEngineExtra;
    if (!base) return;

    const origBindSocket = base.bindSocket;
    const origGetExtraSolids = base.getExtraSolids;
    const origUpdatePhysics = base.updatePhysics;
    const origDrawBefore = base.drawWorldBeforePlayers;
    const origDrawAfter = base.drawWorldAfterPlayers;

    function getHorizontalLaserBeam(laser, w12, players, getCatSize) {
        let endX = laser.x + (laser.maxLen || 1300);
        const sid = w12 && w12.shieldPlayerId;
        const holder = sid && players && players[sid];

        if (holder && !holder.enteredDoor) {
            const { h: ph } = getCatSize(holder);
            const shieldX = holder.x - 10;
            const shieldTop = holder.y - 18;
            const shieldBottom = holder.y + ph + 4;

            if (laser.y >= shieldTop && laser.y <= shieldBottom && shieldX >= laser.x && shieldX < endX) {
                endX = shieldX;
            }
        }

        return {
            x: laser.x,
            y: laser.y - 4,
            w: Math.max(0, endX - laser.x),
            h: 8,
            endX
        };
    }

    function drawFan(ctx, fan, orange) {
        const fx = Math.round(fan.x);
        const fy = Math.round(fan.y);
        const cx = fx + 18;
        const cy = fy + 22;

        ctx.fillStyle = '#fff8e7';
        ctx.strokeStyle = orange;
        ctx.lineWidth = 3;

        ctx.fillRect(fx + 6, fy + fan.h - 7, 30, 7);
        ctx.strokeRect(fx + 6, fy + fan.h - 7, 30, 7);

        ctx.fillRect(fx + 18, fy + 38, 6, fan.h - 45);
        ctx.strokeRect(fx + 18, fy + 38, 6, fan.h - 45);

        ctx.beginPath();
        ctx.arc(cx + 8, cy, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff8e7';
        ctx.fillRect(fx + 2, fy + 4, 14, 36);
        ctx.strokeRect(fx + 2, fy + 4, 14, 36);

        const spin = Math.floor(Date.now() / 65) % 2;
        ctx.fillStyle = orange;
        if (spin === 0) {
            ctx.fillRect(fx + 5, fy + 8, 8, 10);
            ctx.fillRect(fx + 5, fy + 26, 8, 10);
        } else {
            ctx.fillRect(fx + 5, fy + 16, 8, 12);
        }

        const phase = (Date.now() * 0.09) % 28;
        ctx.strokeStyle = orange;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const wy = fy + 8 + i * 9;
            const startX = fx - 8 - ((phase + i * 7) % 28);
            ctx.beginPath();
            ctx.moveTo(startX, wy);
            ctx.quadraticCurveTo(startX - 9, wy - 3, startX - 18, wy);
            ctx.stroke();
        }
    }

    base.bindSocket = function (socket, engine) {
        if (origBindSocket) origBindSocket(socket, engine);

        socket.on('world12Sync', (w12) => {
            const env = engine.getContext();
            if (!env.roomState) return;

            const oldW12 = env.roomState.world12;
            const me = env.players && env.players[env.myId];

            if (oldW12 && w12 && me && !me.enteredDoor) {
                const myW = Math.round(36 * (me.scale || 1));
                const myH = Math.round(39 * (me.scale || 1));

                if (oldW12.block && w12.block) {
                    const dx = w12.block.x - oldW12.block.x;
                    const dy = w12.block.y - oldW12.block.y;
                    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                        const ob = oldW12.block;
                        const onHoriz = me.x + myW > ob.x + 2 && me.x < ob.x + ob.w - 2;
                        const onVert = Math.abs((me.y + myH) - ob.y) <= 12;
                        if (onHoriz && onVert) {
                            me.x += dx;
                            me.y += dy;
                        }
                    }
                }

                if (oldW12.risingStep && w12.risingStep) {
                    const dy = w12.risingStep.y - oldW12.risingStep.y;
                    if (dy < -0.01) {
                        const os = oldW12.risingStep;
                        const onHoriz = me.x + myW > os.x + 2 && me.x < os.x + os.w - 2;
                        const onVert = Math.abs((me.y + myH) - os.y) <= 12;
                        if (onHoriz && onVert) me.y += dy;
                    }
                }
            }

            env.roomState.world12 = w12;
        });
    };

    base.getExtraSolids = function (env) {
        const solids = origGetExtraSolids ? origGetExtraSolids(env) : [];
        const w12 = env.roomState && env.roomState.world12;
        if (!w12 || !w12.enabled) return solids;

        if (w12.mode === 'laserShield') {
            if (w12.risingStep && w12.risingStep.y < w12.risingStep.startY) {
                solids.push({
                    x: w12.risingStep.x,
                    y: w12.risingStep.y,
                    w: w12.risingStep.w,
                    h: w12.risingStep.h,
                    isElevator: true
                });
            }
            if (w12.block) {
                solids.push({
                    x: w12.block.x,
                    y: w12.block.y,
                    w: w12.block.w,
                    h: w12.block.h,
                    isPushBlock: true
                });
            }
        }

        // Màn 12-4: Cây cầu cam nối kín hố dung nham 2 sau khi đạp Nút Đỏ
        if (w12.mode === 'finalRun' && w12.bridgeOpen && w12.bridge) {
            const curX = w12.bridgeCurX !== undefined ? w12.bridgeCurX : w12.bridge.x;
            const curW = (w12.bridge.x + w12.bridge.w) - curX;
            if (curW > 2) {
                solids.push({
                    x: curX,
                    y: w12.bridge.y,
                    w: curW,
                    h: w12.bridge.h
                });
            }
        }

        return solids;
    };

    base.updatePhysics = function (env) {
        const res = origUpdatePhysics ? origUpdatePhysics(env) : null;
        if (res && res.restart) return res;

        const { levelData, roomState, players, me, solids, rectOverlap, getCatSize } = env;
        const w12 = roomState && roomState.world12;
        if (!w12 || !w12.enabled || !me || me.enteredDoor) return res;

        const { w: myW, h: myH } = getCatSize(me);

        // --- MÀN 12-1: VA CHẠM 2 TIA LASER NGANG ---
        if (w12.mode === 'laserShield') {
            const myBox = { x: me.x + 5, y: me.y + 5, w: Math.max(4, myW - 10), h: Math.max(4, myH - 10) };
            for (const l of (w12.lasers || [])) {
                const beam = getHorizontalLaserBeam(l, w12, players, getCatSize);
                if (beam.w > 0 && rectOverlap(myBox, beam)) {
                    return { restart: true };
                }
            }
            return res;
        }

        // --- MÀN 12-2: LỰC ĐẨY TỪ 2 QUẠT GIÓ ---
        if (w12.mode === 'windFans') {
            const myCx = me.x + myW / 2;
            const myCy = me.y + myH / 2;
            let windPush = 0;

            (w12.fans || []).forEach(fan => {
                const dir = fan.dir || -1;
                const minX = dir === -1 ? (fan.x - fan.range) : (fan.x + fan.w);
                const maxX = dir === -1 ? fan.x : (fan.x + fan.w + fan.range);

                if (myCx >= minX && myCx <= maxX && myCy >= fan.topY && myCy <= fan.bottomY) {
                    windPush += dir * (fan.force || 1.6);
                }
            });

            if (Math.abs(windPush) > 0.01) {
                const nextX = Math.max(30, Math.min((levelData.width || 1960) - myW - 30, me.x + windPush));
                const testBox = { x: nextX, y: me.y + 2, w: myW, h: myH - 4 };
                if (!solids.some(s => rectOverlap(testBox, s))) {
                    me.x = nextX;
                }
            }
            return res;
        }

        // --- MÀN 12-4: HỐ DUNG NHAM 2 (KHI CẦU CHƯA MỞ) & BỊ TỤT KHỎI KHUNG HÌNH KÉO ---
        if (w12.mode === 'finalRun') {
            if (!w12.bridgeOpen && w12.gap2Lava) {
                const myBox = { x: me.x + 4, y: me.y + 4, w: Math.max(4, myW - 8), h: Math.max(4, myH - 8) };
                if (rectOverlap(myBox, w12.gap2Lava)) {
                    return { restart: true };
                }
            }
            if (roomState.scrollX && me.x + myW < roomState.scrollX - 18) {
                return { restart: true };
            }
        }

        return res;
    };

    base.drawWorldBeforePlayers = function (ctx, env) {
        if (origDrawBefore) origDrawBefore(ctx, env);
        const { levelData, roomState, players, getCatSize } = env;
        const w12 = roomState && roomState.world12;
        if (!w12 || !w12.enabled) return;

        const orange = (levelData && levelData.groundColor) || '#ff8c3a';

        // --- MÀN 12-1 ---
        if (w12.mode === 'laserShield') {
            if (w12.risingStep && w12.risingStep.y < w12.risingStep.startY) {
                ctx.fillStyle = orange;
                ctx.fillRect(w12.risingStep.x, Math.round(w12.risingStep.y), w12.risingStep.w, w12.risingStep.h);
            }

            if (w12.button) {
                const btn = w12.button;
                const h = w12.buttonPressed ? 4 : btn.h;
                const y = btn.y + (btn.h - h);
                ctx.fillStyle = '#ff2e2e';
                ctx.fillRect(btn.x, y, btn.w, h);
                ctx.fillStyle = '#b30000';
                ctx.fillRect(btn.x - 3, btn.y + btn.h - 3, btn.w + 6, 3);
            }

            if (w12.block) {
                const b = w12.block;
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = orange;
                ctx.lineWidth = 4;
                ctx.fillRect(Math.round(b.x) + 2, Math.round(b.y) + 2, b.w - 4, b.h - 4);
                ctx.strokeRect(Math.round(b.x) + 2, Math.round(b.y) + 2, b.w - 4, b.h - 4);

                ctx.fillStyle = orange;
                ctx.font = '900 24px Segoe UI';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(b.active ? '0' : '1', b.x + b.w / 2, b.y + b.h / 2 + 1);
                ctx.textBaseline = 'alphabetic';
            }

            const phase = Date.now() * 0.015;
            (w12.lasers || []).forEach(l => {
                const beam = getHorizontalLaserBeam(l, w12, players, getCatSize);

                ctx.fillStyle = orange;
                ctx.fillRect(l.x - 2, l.y - 10, 10, 20);

                if (beam.endX > l.x + 6) {
                    ctx.strokeStyle = orange;
                    ctx.lineWidth = 3.5;
                    ctx.beginPath();
                    for (let x = l.x + 6; x <= beam.endX; x += 6) {
                        const wy = l.y + Math.sin(x * 0.28 + phase) * 3.5;
                        if (x === l.x + 6) ctx.moveTo(x, wy);
                        else ctx.lineTo(x, wy);
                    }
                    ctx.stroke();
                }
            });
            return;
        }

        // --- MÀN 12-2: VẼ 2 QUẠT GIÓ ---
        if (w12.mode === 'windFans') {
            (w12.fans || []).forEach(fan => drawFan(ctx, fan, orange));
            return;
        }

        // --- MÀN 12-4: DUNG NHAM 2, CẦU TRƯỢT, NÚT ĐỎ & CHỮ "THANK YOU" ---
        if (w12.mode === 'finalRun') {
            // 1. Sóng dung nham ở phần hố 2 chưa bị cầu che
            if (w12.gap2Lava) {
                const h = w12.gap2Lava;
                const endLavaX = w12.bridgeOpen && w12.bridge ? w12.bridgeCurX : (h.x + h.w);
                if (endLavaX > h.x + 4) {
                    ctx.strokeStyle = orange;
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    for (let x = h.x; x <= endLavaX; x += 18) {
                        const waveY = h.y + Math.sin(x * 0.2) * 5;
                        if (x === h.x) ctx.moveTo(x, waveY);
                        else ctx.lineTo(x, waveY);
                    }
                    ctx.stroke();
                }
            }

            // 2. Cây cầu cam trượt nối kín hố dung nham 2
            if (w12.bridgeOpen && w12.bridge) {
                const curX = w12.bridgeCurX !== undefined ? w12.bridgeCurX : w12.bridge.x;
                const curW = (w12.bridge.x + w12.bridge.w) - curX;
                if (curW > 2) {
                    ctx.fillStyle = orange;
                    ctx.fillRect(Math.round(curX), w12.bridge.y, Math.round(curW), w12.bridge.h);
                }
            }

            // 3. Nút Đỏ kích hoạt cầu (bên trái bàn bật Lò xo)
            if (w12.bridgeButton) {
                const btn = w12.bridgeButton;
                const bh = w12.bridgeOpen ? 4 : btn.h;
                const by = btn.y + (btn.h - bh);
                ctx.fillStyle = '#ff2e2e';
                ctx.fillRect(btn.x, by, btn.w, bh);
                ctx.fillStyle = '#b30000';
                ctx.fillRect(btn.x - 3, btn.y + btn.h - 3, btn.w + 6, 3);
            }

            // 4. Dòng chữ tri ân khổng lồ "THANK YOU" màu cam giống video
            if (w12.thankYouText) {
                const ty = w12.thankYouText;
                ctx.fillStyle = orange;
                ctx.font = '900 112px Consolas, "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(ty.text || 'THANK YOU', ty.x, ty.y);
            }
        }
    };

    base.drawWorldAfterPlayers = function (ctx, env) {
        if (origDrawAfter) origDrawAfter(ctx, env);
        const { roomState, players, getCatSize } = env;
        const w12 = roomState && roomState.world12;
        if (!w12 || !w12.enabled || w12.mode !== 'laserShield') return;

        const holder = w12.shieldPlayerId && players && players[w12.shieldPlayerId];
        if (!holder || holder.enteredDoor) return;

        const { h: ph } = getCatSize(holder);
        const sx = Math.round(holder.x - 10);
        const sy = Math.round(holder.y - 18);
        const sh = ph + 22;

        ctx.fillStyle = holder.color.fill;
        ctx.strokeStyle = holder.color.border;
        ctx.lineWidth = 2;
        ctx.fillRect(sx, sy, 6, sh);
        ctx.strokeRect(sx, sy, 6, sh);
    };
})();