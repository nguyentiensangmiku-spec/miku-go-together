// ================================================================
// ĐỒ HỌA & VẬT LÝ CHUNG CHO CẢ 4 MÀN WORLD 13 (13-1 -> 13-4)
// Tông màu Trắng - Xanh lá chuẩn Pico Park 2
// ================================================================
(function () {
    const base = window.GameEngineExtra;
    if (!base) return;

    const origBindSocket = base.bindSocket;
    const origOnStart = base.onStart;
    const origGetExtraSolids = base.getExtraSolids;
    const origUpdatePhysics = base.updatePhysics;
    const origDrawBefore = base.drawWorldBeforePlayers;
    const origDrawHUD = base.drawHUD;

    const launchState = {
        active: false,
        vx: 0,
        vy: 0,
        startedAt: 0,
        cooldownUntil: 0
    };

    function getPillarSegments(pillar) {
        if (!pillar) return [];
        const segSize = pillar.segSize || 48;
        const count = pillar.segCount || 9;
        const rad = ((pillar.angle || 0) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const segs = [];

        for (let i = 0; i < count; i++) {
            const localX = -segSize / 2;
            const localY = -(i + 0.5) * segSize;
            const cx = pillar.pivotX + localX * cos - localY * sin;
            const cy = pillar.pivotY + localX * sin + localY * cos;
            segs.push({
                x: Math.round(cx - segSize / 2),
                y: Math.round(cy - segSize / 2),
                w: segSize,
                h: segSize
            });
        }
        return segs;
    }

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

    base.onStart = function (env) {
        launchState.active = false;
        launchState.cooldownUntil = 0;
        if (origOnStart) origOnStart(env);
    };

    base.bindSocket = function (socket, engine) {
        if (origBindSocket) origBindSocket(socket, engine);

        socket.on('world13Sync', (w13) => {
            const env = engine.getContext();
            if (!env.roomState) return;

            const oldW13 = env.roomState.world13;
            const me = env.players && env.players[env.myId];

            if (oldW13 && w13 && me && !me.enteredDoor) {
                const myW = Math.round(36 * (me.scale || 1));
                const myH = Math.round(39 * (me.scale || 1));

                // Kéo mèo theo bục thang máy của Màn 13-1
                if (oldW13.lift && w13.lift) {
                    const dy = w13.lift.y - oldW13.lift.y;
                    if (Math.abs(dy) > 0.01) {
                        const ol = oldW13.lift;
                        const onHoriz = me.x + myW > ol.x + 2 && me.x < ol.x + ol.w - 2;
                        const onVert = Math.abs((me.y + myH) - ol.y) <= 12;
                        if (onHoriz && onVert) me.y += dy;
                    }
                }

                // Kéo mèo theo khối đẩy [N-1] của Màn 13-2 khi đang đứng trên nó
                if (oldW13.block && w13.block) {
                    const dx = w13.block.x - oldW13.block.x;
                    const dy = w13.block.y - oldW13.block.y;
                    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                        const ob = oldW13.block;
                        const onHoriz = me.x + myW > ob.x + 2 && me.x < ob.x + ob.w - 2;
                        const onVert = Math.abs((me.y + myH) - ob.y) <= 12;
                        if (onHoriz && onVert) {
                            me.x += dx;
                            me.y += dy;
                        }
                    }
                }

                // Tránh kẹt mèo vào trong cột khi cột 9 đốt ở Màn 13-3 từ từ dựng lại
                if (w13.mode === 'shootPillar' && w13.pillar && !w13.pillar.fallen) {
                    const segs = getPillarSegments(w13.pillar);
                    for (const s of segs) {
                        if (me.x < s.x + s.w && me.x + myW > s.x && me.y < s.y + s.h && me.y + myH > s.y) {
                            me.x = Math.max(30, s.x - myW - 2);
                        }
                    }
                }
            }

            // Hiện Chìa khóa ngay lập tức ở Màn 13-4 khi đạp đủ nút đỏ cùng lúc
            if (w13 && w13.mode === 'multiButtons' && w13.unlocked) {
                env.roomState.keyVisible = true;
            }

            env.roomState.world13 = w13;
        });
    };

    base.getExtraSolids = function (env) {
        const solids = origGetExtraSolids ? origGetExtraSolids(env) : [];
        const w13 = env.roomState && env.roomState.world13;
        if (!w13 || !w13.enabled) return solids;

        if (w13.mode === 'helloPark' && w13.lift) {
            solids.push({
                x: w13.lift.x,
                y: w13.lift.y,
                w: w13.lift.w,
                h: w13.lift.h,
                isElevator: true
            });
        }

        if (w13.mode === 'carryBlock' && w13.block) {
            solids.push({
                x: w13.block.x,
                y: w13.block.y,
                w: w13.block.w,
                h: w13.block.h,
                isPushBlock: true
            });
        }

        if (w13.mode === 'shootPillar') {
            if (w13.launcher) {
                solids.push({
                    x: w13.launcher.x,
                    y: w13.launcher.y,
                    w: w13.launcher.w,
                    h: w13.launcher.h
                });
            }
            if (w13.pillar) {
                const segs = getPillarSegments(w13.pillar);
                segs.forEach(s => solids.push(s));

                if (!w13.pillar.fallen && segs.length > 0) {
                    const topSeg = segs[segs.length - 1];
                    if (topSeg.y > 0) {
                        solids.push({ x: topSeg.x, y: 0, w: topSeg.w, h: topSeg.y });
                    }
                }
            }
        }

        return solids;
    };

    base.updatePhysics = function (env) {
        const res = origUpdatePhysics ? origUpdatePhysics(env) : null;
        if (res && res.restart) return res;

        const { roomState, me, solids, socket, rectOverlap, getCatSize } = env;
        const w13 = roomState && roomState.world13;
        if (!w13 || !w13.enabled || !me || me.enteredDoor) return res;

        const { w: myW, h: myH } = getCatSize(me);

        // --- MÀN 13-4: KIỂM TRA CHẠM 2 GAI ĐỎ DƯỚI KHỐI TREO ---
        if (w13.mode === 'multiButtons') {
            const myBox = { x: me.x + 5, y: me.y + 4, w: Math.max(4, myW - 10), h: Math.max(4, myH - 8) };
            for (const sp of (w13.spikes || [])) {
                const spHit = { x: sp.x + 4, y: sp.y, w: Math.max(4, sp.w - 8), h: sp.h - 2 };
                if (rectOverlap(myBox, spHit)) {
                    return { restart: true };
                }
            }
            return res;
        }

        // --- MÀN 13-3: BỆ PHÓNG (>>) & HÚC CỘT TƯỜNG 9 ĐỐT ---
        if (w13.mode === 'shootPillar') {
            const now = Date.now();
            const L = w13.launcher;
            const pil = w13.pillar;

            if (L && !launchState.active && now >= launchState.cooldownUntil) {
                const onHoriz = me.x + myW > L.x + 8 && me.x < L.x + L.w - 8;
                const onTop = Math.abs((me.y + myH) - L.y) <= 10 && me.vy >= -1;
                if (onHoriz && onTop) {
                    launchState.active = true;
                    launchState.vx = 13.8;
                    launchState.vy = -6.8;
                    launchState.startedAt = now;
                    launchState.cooldownUntil = now + 480;
                    me.vy = launchState.vy;
                    me.facing = 1;
                }
            }

            if (launchState.active) {
                const segs = (pil && !pil.fallen) ? getPillarSegments(pil) : [];
                const subSteps = 2;
                let hitSomething = false;

                me.vy = launchState.vy;
                launchState.vy = Math.min(10, launchState.vy + 0.36);

                for (let s = 0; s < subSteps; s++) {
                    const nextX = me.x + launchState.vx / subSteps;
                    const testBox = { x: nextX, y: me.y + 2, w: myW, h: myH - 4 };

                    if (segs.length > 0 && segs.some(seg => rectOverlap(testBox, seg))) {
                        if (socket) {
                            socket.emit('world13HitPillar', { hitY: Math.round(me.y + myH / 2) });
                        }
                        launchState.active = false;
                        me.x = Math.max(30, me.x - 10);
                        me.vy = -4.2;
                        hitSomething = true;
                        break;
                    }

                    if (solids.some(sol => rectOverlap(testBox, sol))) {
                        launchState.active = false;
                        hitSomething = true;
                        break;
                    }

                    me.x = nextX;
                }

                if (!hitSomething) {
                    launchState.vx *= 0.994;
                    if (now - launchState.startedAt > 1100 || (me.y + myH >= 443 && now - launchState.startedAt > 180)) {
                        launchState.active = false;
                    }
                }
            }
        }

        return res;
    };

    base.drawWorldBeforePlayers = function (ctx, env) {
        if (origDrawBefore) origDrawBefore(ctx, env);
        const { levelData, roomState } = env;
        const w13 = roomState && roomState.world13;
        if (!w13 || !w13.enabled) return;

        const green = (levelData && levelData.groundColor) || '#4cd100';

        // Phủ họa tiết lò xo Xanh - Trắng chuẩn Pico Park 2 cho các nút lò xo của World 13
        if (levelData && levelData.bouncePads) {
            levelData.bouncePads.forEach(pad => {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(pad.x, pad.y, pad.w, pad.h);

                ctx.strokeStyle = green;
                ctx.lineWidth = 2.5;
                const step = 22;
                ctx.beginPath();
                for (let x = pad.x; x < pad.x + pad.w; x += step) {
                    const endX = Math.min(pad.x + pad.w, x + step);
                    ctx.moveTo(x, pad.y + 3);
                    ctx.lineTo(endX, pad.y + pad.h - 2);
                    ctx.moveTo(endX, pad.y + 3);
                    ctx.lineTo(x, pad.y + pad.h - 2);
                }
                ctx.stroke();

                ctx.fillStyle = green;
                ctx.fillRect(pad.x, pad.y, pad.w, 4);
                ctx.fillRect(pad.x, pad.y + pad.h - 3, pad.w, 3);
            });
        }

        // --- MÀN 13-1 ---
        if (w13.mode === 'helloPark') {
            if (w13.lift) {
                ctx.fillStyle = green;
                ctx.fillRect(w13.lift.x, Math.round(w13.lift.y), w13.lift.w, w13.lift.h);
            }

            if (w13.button) {
                const btn = w13.button;
                const h = w13.buttonPressed ? 4 : btn.h;
                const y = btn.y + (btn.h - h);
                ctx.fillStyle = '#ff2e2e';
                ctx.fillRect(btn.x, y, btn.w, h);
                ctx.fillStyle = '#b30000';
                ctx.fillRect(btn.x - 3, btn.y + btn.h - 3, btn.w + 6, 3);
            }
            return;
        }

        // --- MÀN 13-2: TỪNG GAI ĐỎ DẬP XUỐNG & KHỐI ĐẨY [N-1] ---
        if (w13.mode === 'carryBlock') {
            ctx.fillStyle = '#ff5c5c';
            (w13.spikes || []).forEach(sp => {
                ctx.beginPath();
                ctx.moveTo(sp.x, sp.y);
                ctx.lineTo(sp.x + sp.w / 2, sp.y + sp.h);
                ctx.lineTo(sp.x + sp.w, sp.y);
                ctx.closePath();
                ctx.fill();
            });

            if (w13.block) {
                const b = w13.block;
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = green;
                ctx.lineWidth = 4;
                ctx.fillRect(Math.round(b.x) + 2, Math.round(b.y) + 2, b.w - 4, b.h - 4);
                ctx.strokeRect(Math.round(b.x) + 2, Math.round(b.y) + 2, b.w - 4, b.h - 4);

                ctx.fillStyle = green;
                ctx.font = '900 24px Segoe UI';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(b.remaining ?? 0), b.x + b.w / 2, b.y + b.h / 2 + 1);
                ctx.textBaseline = 'alphabetic';
            }
            return;
        }

        // --- MÀN 13-3: BỆ PHÓNG (>>) + CHỮ "SHOOT!" + CỘT TƯỜNG XANH 9 ĐỐT ---
        if (w13.mode === 'shootPillar') {
            if (w13.launcher) {
                const L = w13.launcher;
                ctx.fillStyle = green;
                fillRoundedRect(ctx, L.x, L.y, L.w, L.h, 12);

                const shift = Math.sin(Date.now() * 0.01) * 3;
                const drawArrow = (ax, ay) => {
                    ctx.beginPath();
                    ctx.moveTo(ax, ay - 16);
                    ctx.lineTo(ax + 14, ay - 8);
                    ctx.lineTo(ax, ay);
                    ctx.closePath();
                    ctx.fill();
                };
                drawArrow(L.x + 28 + shift, L.y - 6);
                drawArrow(L.x + 58 + shift, L.y - 6);

                if (w13.pillar && !w13.pillar.fallen) {
                    ctx.fillStyle = '#222222';
                    ctx.font = '900 18px Segoe UI';
                    ctx.textAlign = 'center';
                    ctx.fillText('SHOOT!', L.x + L.w / 2, L.y - 34);
                }
            }

            if (w13.pillar) {
                const segs = getPillarSegments(w13.pillar);
                segs.forEach(s => {
                    ctx.fillStyle = green;
                    fillRoundedRect(ctx, s.x + 1, s.y + 1, s.w - 2, s.h - 2, 10);
                });
            }
            return;
        }

        // --- MÀN 13-4: VẼ 7 NÚT ĐỎ & 2 GAI ĐỎ DƯỚI KHỐI TREO ---
        if (w13.mode === 'multiButtons') {
            (w13.buttons || []).forEach(btn => {
                const h = btn.pressed ? 4 : btn.h;
                const y = btn.y + (btn.h - h);
                ctx.fillStyle = '#ff2e2e';
                ctx.fillRect(btn.x, y, btn.w, h);
                ctx.fillStyle = '#b30000';
                ctx.fillRect(btn.x - 3, btn.y + btn.h - 3, btn.w + 6, 3);
            });

            ctx.fillStyle = '#ff5c5c';
            (w13.spikes || []).forEach(sp => {
                ctx.beginPath();
                ctx.moveTo(sp.x, sp.y);
                ctx.lineTo(sp.x + sp.w / 2, sp.y + sp.h);
                ctx.lineTo(sp.x + sp.w, sp.y);
                ctx.closePath();
                ctx.fill();
            });
        }
    };

    // Vẽ bảng đếm ngược viền xanh cố định ở đỉnh màn hình cho Màn 13-4
    base.drawHUD = function (ctx, canvas, env) {
        if (origDrawHUD) origDrawHUD(ctx, canvas, env);
        const w13 = env.roomState && env.roomState.world13;
        if (!w13 || !w13.enabled || w13.mode !== 'multiButtons') return;

        const green = (env.levelData && env.levelData.groundColor) || '#4cd100';
        const boxW = 176;
        const boxH = 58;
        const boxX = Math.round((canvas.width - boxW) / 2);
        const boxY = 12;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = green;
        ctx.lineWidth = 5;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        const label = w13.remaining === 0 ? '!' : String(w13.remaining);
        ctx.fillStyle = green;
        ctx.font = '900 36px Consolas, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, boxX + boxW / 2, boxY + boxH / 2 + 2);
        ctx.textBaseline = 'alphabetic';
    };
})();