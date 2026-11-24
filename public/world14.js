// ================================================================
// ĐỒ HỌA & VẬT LÝ CHUNG CHO CẢ 4 MÀN WORLD 14 (14-1 -> 14-4)
// Tông màu Trắng - Xanh lá chuẩn Pico Park 2
// ================================================================
(function () {
    const base = window.GameEngineExtra;
    if (!base) return;

    const origBindSocket = base.bindSocket;
    const origOnStart = base.onStart;
    const origShouldLock = base.shouldLockPlayer;
    const origGetExtraSolids = base.getExtraSolids;
    const origUpdatePhysics = base.updatePhysics;
    const origDrawBefore = base.drawWorldBeforePlayers;
    const origDrawAfter = base.drawWorldAfterPlayers;
    const origDrawHUD = base.drawHUD;

    // Trạng thái trượt quán tính trên sàn băng xanh (Màn 14-2)
    const iceState = {
        vx: 0,
        lastX: null,
        initialized: false
    };

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

    function drawImpactStar(ctx, cx, cy) {
        const outerR = 16;
        const innerR = 7;
        const spikes = 8;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((Date.now() * 0.015) % (Math.PI * 2));
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const ang = (i * Math.PI) / spikes;
            const px = Math.cos(ang) * r;
            const py = Math.sin(ang) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    function drawElectricFan(ctx, fan, green) {
        const fx = fan.x;
        const fy = fan.y;

        // Chân đế & thân quạt viền xanh lá
        ctx.strokeStyle = green;
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 3;

        ctx.fillRect(fx + 6, fy + fan.h - 7, 30, 7);
        ctx.strokeRect(fx + 6, fy + fan.h - 7, 30, 7);

        ctx.fillRect(fx + 18, fy + 32, 6, fan.h - 39);
        ctx.strokeRect(fx + 18, fy + 32, 6, fan.h - 39);

        // Đầu động cơ phía sau & lồng quạt hướng sang phải
        ctx.fillRect(fx + 6, fy + 16, 16, 16);
        ctx.strokeRect(fx + 6, fy + 16, 16, 16);

        ctx.beginPath();
        ctx.ellipse(fx + 32, fy + 24, 12, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cánh quạt quay liên tục bên trong lồng
        const spin = Math.sin(Date.now() * 0.03) * 14;
        ctx.beginPath();
        ctx.moveTo(fx + 32, fy + 24 - Math.abs(spin) - 3);
        ctx.lineTo(fx + 32, fy + 24 + Math.abs(spin) + 3);
        ctx.lineWidth = 4;
        ctx.stroke();

        // Các vệt gió lượn sóng thổi sang phải
        const phase = (Date.now() * 0.04) % 28;
        ctx.strokeStyle = green;
        ctx.lineWidth = 2;
        for (let row = 0; row < 3; row++) {
            const wy = fy + 8 + row * 16;
            const startX = fx + 50 + ((phase + row * 9) % 24);
            ctx.beginPath();
            for (let i = 0; i <= 24; i += 4) {
                const wx = startX + i;
                const dy = Math.sin((i + Date.now() * 0.05) * 0.35) * 3;
                if (i === 0) ctx.moveTo(wx, wy + dy);
                else ctx.lineTo(wx, wy + dy);
            }
            ctx.stroke();
        }
    }

    base.onStart = function (env) {
        iceState.vx = 0;
        iceState.lastX = null;
        iceState.initialized = false;
        if (origOnStart) origOnStart(env);
    };

    base.bindSocket = function (socket, engine) {
        if (origBindSocket) origBindSocket(socket, engine);

        socket.on('world14Sync', (w14) => {
            const env = engine.getContext();
            if (!env.roomState) return;

            const oldW14 = env.roomState.world14;
            const me = env.players && env.players[env.myId];

            if (oldW14 && w14 && w14.mode === 'dontTouchFinal' && me && !me.enteredDoor) {
                const myW = Math.round(36 * (me.scale || 1));
                const myH = Math.round(39 * (me.scale || 1));

                // 1. Kéo chú mèo đi theo bục chở dài [ALL] khi bục trượt sang phải
                if (oldW14.carrier && w14.carrier) {
                    const dx = w14.carrier.x - oldW14.carrier.x;
                    if (Math.abs(dx) > 0.01) {
                        const oc = oldW14.carrier;
                        const onHoriz = me.x + myW > oc.x + 2 && me.x < oc.x + oc.w - 2;
                        const onVert = Math.abs((me.y + myH) - oc.y) <= 12;
                        if (onHoriz && onVert) {
                            me.x += dx;
                        }
                    }
                }

                // 2. Thanh chắn dọc quét ngang đẩy mượt nhân vật đứng chắn trước mặt
                if (oldW14.sweeper && w14.sweeper) {
                    const sDx = w14.sweeper.x - oldW14.sweeper.x;
                    const ns = w14.sweeper;
                    if (Math.abs(sDx) > 0.01) {
                        const vertOverlap = me.y + myH > ns.y + 4 && me.y < ns.y + ns.h - 2;
                        const horizOverlap = me.x < ns.x + ns.w && me.x + myW > ns.x;
                        if (vertOverlap && horizOverlap) {
                            if (sDx > 0) me.x = ns.x + ns.w;
                            else me.x = ns.x - myW;
                        }
                    }
                }
            }

            env.roomState.world14 = w14;

            if (w14 && w14.mode === 'dontTouch' && w14.unlocked) {
                env.roomState.keyVisible = true;
            }
        });
    };

    base.shouldLockPlayer = function (env) {
        if (origShouldLock && origShouldLock(env)) return true;
        const w14 = env.roomState && env.roomState.world14;
        if (w14 && w14.enabled && (w14.mode === 'dontTouch' || w14.mode === 'dontTouchFinal') && w14.depleted) {
            return true;
        }
        return false;
    };

    base.getExtraSolids = function (env) {
        const solids = origGetExtraSolids ? origGetExtraSolids(env) : [];
        const w14 = env.roomState && env.roomState.world14;
        if (!w14 || !w14.enabled) return solids;

        // Màn 14-2: 2 sàn băng trơn
        if (w14.mode === 'dontTouch' && w14.icePlatforms) {
            w14.icePlatforms.forEach(ip => {
                solids.push({ x: ip.x, y: ip.y, w: ip.w, h: ip.h, isIce: true });
            });
        }

        // Màn 14-3: Cầu xanh nổi + 2 khối trên cột & 4 khối chấm đỏ
        if (w14.mode === 'ropeTrapBridge') {
            if (w14.bridgeActive) {
                if (w14.bridge) solids.push({ ...w14.bridge });
                (w14.trapTopBlocks || []).forEach(b => solids.push({ ...b }));
            }
            (w14.trapButtons || []).forEach(tb => solids.push({ ...tb }));
        }

        // Màn 14-4: Thanh gạt dọc quét ngang & Bục chở dài [ALL]
        if (w14.mode === 'dontTouchFinal') {
            if (w14.sweeper) {
                solids.push({ x: w14.sweeper.x, y: w14.sweeper.y, w: w14.sweeper.w, h: w14.sweeper.h });
            }
            if (w14.carrier) {
                solids.push({ x: w14.carrier.x, y: w14.carrier.y, w: w14.carrier.w, h: w14.carrier.h });
            }
        }

        return solids;
    };

    base.updatePhysics = function (env) {
        const res = origUpdatePhysics ? origUpdatePhysics(env) : null;
        if (res && res.restart) return res;

        const { levelData, roomState, players, myId, me, keys, solids, rectOverlap, getCatSize } = env;
        const w14 = roomState && roomState.world14;
        if (!w14 || !w14.enabled || !me || me.enteredDoor) return res;

        const { w: myW, h: myH } = getCatSize(me);

        // --- MÀN 14-4: LUỒNG GIÓ QUẠT THỔI PHẢI & KIỂM TRA HỐ SÓNG XANH ---
        if (w14.mode === 'dontTouchFinal') {
            const myBox = { x: me.x, y: me.y, w: myW, h: myH };

            if (w14.pitHazard && rectOverlap(myBox, w14.pitHazard)) {
                return { restart: true };
            }

            if (w14.fan) {
                const f = w14.fan;
                const windBox = { x: f.windX, y: f.windY, w: f.windW, h: f.windH };
                if (rectOverlap(myBox, windBox)) {
                    let nextX = me.x + (f.forceX || 1.7);
                    const testBox = { x: nextX, y: me.y, w: myW, h: myH };

                    for (const s of solids) {
                        if (s.isElevator) continue;
                        if (rectOverlap(testBox, s)) {
                            nextX = s.x - myW;
                            testBox.x = nextX;
                        }
                    }

                    const others = Object.values(players || {}).filter(p => p.id !== myId && !p.enteredDoor);
                    for (const o of others) {
                        const os = getCatSize(o);
                        if (me.y + myH > o.y + 8 && me.y < o.y + os.h - 8) {
                            const oBox = { x: o.x, y: o.y, w: os.w, h: os.h };
                            if (rectOverlap(testBox, oBox)) {
                                nextX = o.x - myW;
                                testBox.x = nextX;
                            }
                        }
                    }

                    me.x = nextX;
                }
            }
            return res;
        }

        // --- MÀN 14-2: VẬT LÝ TRƯỢT QUÁN TÍNH TRÊN SÀN BĂNG XANH ---
        if (w14.mode !== 'dontTouch') return res;

        if (!iceState.initialized || iceState.lastX === null || Math.abs(me.x - iceState.lastX) > 40) {
            iceState.vx = 0;
            iceState.lastX = me.x;
            iceState.initialized = true;
            return res;
        }

        const iceList = w14.icePlatforms || [];
        const onIce = me.onGround && iceList.some(ip =>
            me.x + myW > ip.x + 2 &&
            me.x < ip.x + ip.w - 2 &&
            Math.abs((me.y + myH) - ip.y) <= 6
        );

        const moveLeft = Boolean(keys['ArrowLeft'] || keys['KeyA']);
        const moveRight = Boolean(keys['ArrowRight'] || keys['KeyD']);
        const inputDir = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
        const actualDx = me.x - iceState.lastX;

        if (onIce) {
            const targetVx = inputDir * 8.8;
            const blockedByEngine = inputDir !== 0 &&
                (Math.sign(actualDx) !== inputDir || Math.abs(actualDx) < 3.5);

            if (blockedByEngine && iceState.vx * inputDir >= 0) {
                iceState.vx = 0;
            } else {
                if (inputDir !== 0) {
                    if (iceState.vx * inputDir < 0) {
                        iceState.vx += inputDir * 0.09;
                    } else {
                        iceState.vx += (targetVx - iceState.vx) * 0.04;
                    }
                } else {
                    iceState.vx *= 0.975;
                    if (Math.abs(iceState.vx) < 0.05) iceState.vx = 0;
                }

                const adjustX = iceState.vx - actualDx;
                if (Math.abs(adjustX) > 0.01) {
                    let nextX = me.x + adjustX;

                    let minBound = 30;
                    let maxBound = (levelData.width || 2650) - 30 - myW;
                    const others = Object.values(players || {}).filter(p => p.id !== myId && !p.enteredDoor);
                    if (others.length > 0 && (levelData.width || 900) > 900) {
                        let oMin = Infinity;
                        let oMax = -Infinity;
                        others.forEach(o => {
                            const os = getCatSize(o);
                            if (o.x < oMin) oMin = o.x;
                            if (o.x + os.w > oMax) oMax = o.x + os.w;
                        });
                        minBound = Math.max(minBound, Math.min(me.x, oMax - 888));
                        maxBound = Math.min(maxBound, Math.max(me.x, oMin + 888 - myW));
                    }
                    if (nextX < minBound) { nextX = minBound; iceState.vx = 0; }
                    if (nextX > maxBound) { nextX = maxBound; iceState.vx = 0; }

                    const testBox = { x: nextX, y: me.y, w: myW, h: myH };
                    for (const s of solids) {
                        if (s.isElevator) continue;
                        if (rectOverlap(testBox, s)) {
                            if (adjustX > 0) nextX = s.x - myW;
                            else nextX = s.x + s.w;
                            testBox.x = nextX;
                            iceState.vx = 0;
                        }
                    }

                    for (const o of others) {
                        const os = getCatSize(o);
                        if (me.y + myH > o.y + 8 && me.y < o.y + os.h - 8) {
                            const oBox = { x: o.x, y: o.y, w: os.w, h: os.h };
                            if (rectOverlap(testBox, oBox)) {
                                if (adjustX > 0) nextX = o.x - myW;
                                else nextX = o.x + os.w;
                                testBox.x = nextX;
                                iceState.vx = 0;
                            }
                        }
                    }

                    me.x = nextX;
                }
            }
            me.vx = iceState.vx;
        } else if (!me.onGround) {
            iceState.vx *= 0.94;
        } else {
            iceState.vx = 0;
        }

        iceState.lastX = me.x;
        return res;
    };

    base.drawWorldBeforePlayers = function (ctx, env) {
        if (origDrawBefore) origDrawBefore(ctx, env);
        const { levelData, roomState, players, getCatSize } = env;
        if (!levelData || !levelData.world14 || !levelData.world14.enabled) return;

        const green = levelData.groundColor || '#4cd100';
        const w14 = roomState && roomState.world14;

        // 1. Phủ lại Thang máy sang tông Trắng - Xanh lá chuẩn Pico Park 2
        (roomState.elevators || []).forEach(e => {
            const signW = 54;
            const signH = 34;
            const signX = e.x + (e.w - signW) / 2;
            const signY = e.y - signH - 14;

            ctx.fillStyle = green;
            ctx.fillRect(e.x + e.w / 2 - 3, signY + signH, 6, 14);

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = green;
            ctx.lineWidth = 4;
            ctx.fillRect(signX, signY, signW, signH);
            ctx.strokeRect(signX, signY, signW, signH);

            ctx.fillStyle = green;
            ctx.font = '900 22px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(String(e.remaining), signX + signW / 2, signY + 25);

            ctx.fillStyle = green;
            ctx.fillRect(e.x, e.y, e.w, e.h);
        });

        // 2. Đồ họa riêng của Màn 14-3: Cầu xanh nổi & 4 Khối bẫy chấm đỏ
        if (w14 && w14.mode === 'ropeTrapBridge') {
            if (w14.bridgeActive) {
                if (w14.bridge) {
                    ctx.fillStyle = green;
                    fillRoundedRect(ctx, w14.bridge.x, w14.bridge.y, w14.bridge.w, w14.bridge.h, 10);
                }
                (w14.trapTopBlocks || []).forEach(b => {
                    ctx.fillStyle = green;
                    fillRoundedRect(ctx, b.x, b.y, b.w, b.h, 8);
                });
            }

            (w14.trapButtons || []).forEach((tb, idx) => {
                const isTriggered = !w14.bridgeActive && w14.triggeredIdx === idx;
                ctx.fillStyle = isTriggered ? '#ff9f43' : green;
                fillRoundedRect(ctx, tb.x, tb.y, tb.w, tb.h, 8);

                ctx.beginPath();
                ctx.arc(tb.x + tb.w / 2, tb.y + tb.h / 2, Math.min(tb.w, tb.h) * 0.34, 0, Math.PI * 2);
                ctx.fillStyle = isTriggered ? '#ff0000' : '#ff2e2e';
                ctx.fill();
                ctx.strokeStyle = '#b30000';
                ctx.lineWidth = 2.5;
                ctx.stroke();
            });
        }

        // 3. Phủ lại Dây nối đội sang màu Xanh lá đậm chuẩn video (Màn 14-1, 14-3)
        if (levelData.rope && levelData.rope.enabled) {
            const order = (roomState && roomState.playerOrder)
                ? roomState.playerOrder
                : Object.keys(players || {});
            const activeIds = order.filter(id => players[id] && !players[id].enteredDoor);

            if (activeIds.length > 1) {
                ctx.strokeStyle = green;
                ctx.lineWidth = 4;
                ctx.beginPath();
                for (let i = 0; i < activeIds.length - 1; i++) {
                    const p1 = players[activeIds[i]];
                    const p2 = players[activeIds[i + 1]];
                    const s1 = getCatSize(p1);
                    const s2 = getCatSize(p2);
                    ctx.moveTo(p1.x + s1.w / 2, p1.y + s1.h * 0.65);
                    ctx.lineTo(p2.x + s2.w / 2, p2.y + s2.h * 0.65);
                }
                ctx.stroke();
            }
        }

        // 4. Đồ họa riêng của Màn 14-2
        if (w14 && w14.mode === 'dontTouch') {
            ctx.fillStyle = green;
            ctx.font = '900 40px "Segoe UI", Consolas, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText("DON'T TOUCH ME!", 95, 255);

            (w14.icePlatforms || []).forEach(ip => {
                ctx.fillStyle = '#4be3ff';
                fillRoundedRect(ctx, ip.x, ip.y, ip.w, ip.h, 8);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.fillRect(ip.x + 10, ip.y + 4, ip.w - 20, 5);
            });

            (w14.buttons || []).forEach(btn => {
                const h = btn.pressed ? 3 : btn.h;
                const y = btn.y + (btn.h - h);
                ctx.fillStyle = '#ff2e2e';
                ctx.fillRect(btn.x + 2, y, btn.w - 4, h);
                ctx.fillStyle = green;
                ctx.fillRect(btn.x - 3, btn.y + btn.h - 4, btn.w + 6, 4);
            });
            return;
        }

        // 5. Đồ họa riêng của Màn 14-4: Chữ "DON'T TOUCH ME!", Thanh gạt, Quạt gió, Đường ray, Bục chở [ALL] & Hố sóng xanh
        if (w14 && w14.mode === 'dontTouchFinal') {
            ctx.fillStyle = green;
            ctx.font = '900 42px "Segoe UI", Consolas, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText("DON'T TOUCH ME!", 125, 235);

            // Thanh tường xanh dọc quét ngang
            if (w14.sweeper) {
                const sw = w14.sweeper;
                ctx.fillStyle = green;
                ctx.fillRect(Math.round(sw.x), sw.y, sw.w, sw.h);
            }

            // Quạt gió quay & vệt gió thổi sang phải
            if (w14.fan) {
                drawElectricFan(ctx, w14.fan, green);
            }

            // Đường ray nét đứt & Bục chở dài [ALL]
            if (w14.carrier) {
                const c = w14.carrier;
                ctx.save();
                ctx.strokeStyle = green;
                ctx.lineWidth = 4;
                ctx.setLineDash([12, 12]);
                ctx.beginPath();
                ctx.moveTo(c.startX, c.y + c.h / 2);
                ctx.lineTo(c.endX + c.w, c.y + c.h / 2);
                ctx.stroke();
                ctx.restore();

                ctx.fillStyle = green;
                fillRoundedRect(ctx, Math.round(c.x), c.y, c.w, c.h, 8);

                // Bảng đếm ngược số người cần đứng lên bục (ẩn khi đã khởi hành)
                if (!c.activated) {
                    const boxW = 54;
                    const boxH = 54;
                    const boxX = Math.round(c.x + c.w / 2 - boxW / 2);
                    const boxY = c.y - 110;
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

            // Hố sóng xanh nguy hiểm bên dưới bục chở
            if (w14.pitHazard) {
                const h = w14.pitHazard;
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
        }
    };

    // Vẽ tia va chạm khi 2 mèo chạm nhau & mắt (x x) khi cạn thanh năng lượng (Màn 14-2 & 14-4)
    base.drawWorldAfterPlayers = function (ctx, env) {
        if (origDrawAfter) origDrawAfter(ctx, env);
        const { roomState, players } = env;
        const w14 = roomState && roomState.world14;
        if (!w14 || !w14.enabled || (w14.mode !== 'dontTouch' && w14.mode !== 'dontTouchFinal')) return;

        (w14.touchPoints || []).forEach(pt => {
            drawImpactStar(ctx, pt.x, pt.y);
        });

        if (w14.depleted) {
            Object.values(players || {}).forEach(p => {
                if (p.enteredDoor) return;
                ctx.fillStyle = '#111111';
                ctx.font = '900 13px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('x  x', Math.round(p.x) + 18, Math.round(p.y) + 21);
            });
        }
    };

    // Vẽ thanh hồng viền xanh lá "DON'T TOUCH ME!" cố định ở đỉnh màn hình (Màn 14-2 & 14-4)
    base.drawHUD = function (ctx, canvas, env) {
        if (origDrawHUD) origDrawHUD(ctx, canvas, env);
        const w14 = env.roomState && env.roomState.world14;
        if (!w14 || !w14.enabled || (w14.mode !== 'dontTouch' && w14.mode !== 'dontTouchFinal')) return;

        const green = (env.levelData && env.levelData.groundColor) || '#4cd100';
        const boxW = 264;
        const boxH = 44;
        const boxX = Math.round((canvas.width - boxW) / 2);
        const boxY = 14;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        const ratio = Math.max(0, Math.min(1, (w14.gauge || 0) / (w14.maxGauge || 100)));
        const innerW = Math.round((boxW - 8) * ratio);
        if (innerW > 0) {
            ctx.fillStyle = ratio <= 0.25 ? '#ff5252' : '#ff8a96';
            ctx.fillRect(boxX + 4, boxY + 4, innerW, boxH - 8);
        }

        ctx.strokeStyle = green;
        ctx.lineWidth = 4;
        ctx.strokeRect(boxX, boxY, boxW, boxH);
    };
})();
