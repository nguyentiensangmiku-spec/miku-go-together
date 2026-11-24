// ================================================================
// ĐỒ HỌA & PHÍM BẤM CHUNG CHO CẢ 4 MÀN WORLD 11 (11-1 -> 11-4)
// ================================================================
(function () {
    const base = window.GameEngineExtra;
    if (!base) return;

    let isHoldingSuction = false;
    let activeSocketRef = null;

    const origBindSocket = base.bindSocket;
    const origOnStart = base.onStart;
    const origOnKeyDown = base.onKeyDown;
    const origOnKeyUp = base.onKeyUp;
    const origShouldLock = base.shouldLockPlayer;
    const origGetExtraSolids = base.getExtraSolids;
    const origUpdatePhysics = base.updatePhysics;
    const origDrawBefore = base.drawWorldBeforePlayers;
    const origDrawAfter = base.drawWorldAfterPlayers;
    const origDrawHUD = base.drawHUD;

    function isSuctionMode(mode) {
        return mode === 'suctionGun' || mode === 'suctionFerry';
    }

    function getRootCarrierId(w11, id) {
        let cur = id;
        const seen = new Set();
        while (w11.captured && w11.captured[cur] && !seen.has(cur)) {
            seen.add(cur);
            cur = w11.captured[cur];
        }
        return cur;
    }

    window.addEventListener('blur', () => {
        if (isHoldingSuction && activeSocketRef) {
            isHoldingSuction = false;
            activeSocketRef.emit('world11Suction', { active: false });
        }
    });

    base.bindSocket = function (socket, engine) {
        activeSocketRef = socket;
        if (origBindSocket) origBindSocket(socket, engine);

        socket.on('world11Sync', (w11) => {
            const env = engine.getContext();
            if (!env.roomState) return;

            // Kéo chú mèo đi theo mượt mà khi đang đứng trên bục bay của Màn 11-4
            const oldW11 = env.roomState.world11;
            const me = env.players && env.players[env.myId];
            if (oldW11 && oldW11.ferry && w11 && w11.ferry && me && !me.enteredDoor) {
                const dx = w11.ferry.x - oldW11.ferry.x;
                const dy = w11.ferry.y - oldW11.ferry.y;
                if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
                    const myW = Math.round(36 * (me.scale || 1));
                    const myH = Math.round(39 * (me.scale || 1));
                    const of = oldW11.ferry;
                    const onHoriz = me.x + myW > of.x + 2 && me.x < of.x + of.w - 2;
                    const onVert = Math.abs((me.y + myH) - of.y) <= 12;
                    if (onHoriz && onVert) {
                        me.x += dx;
                        me.y += dy;
                    }
                }
            }

            env.roomState.world11 = w11;

            if (w11 && w11.captured && env.players) {
                for (const victimId in w11.captured) {
                    const victim = env.players[victimId];
                    if (!victim) continue;
                    const rootId = getRootCarrierId(w11, victimId);
                    const root = env.players[rootId];
                    const carrierBullet = (w11.bullets || []).find(b => b.carryingId === rootId);
                    if (carrierBullet) victim.x = carrierBullet.x - 18;
                    else if (root) victim.x = root.x;
                    victim.y = -999;
                    victim.vx = 0;
                    victim.vy = 0;
                }
            }
        });

        socket.on('world11Release', ({ id, x, y, vx, vy, facing }) => {
            const env = engine.getContext();
            if (!env.players || !env.players[id]) return;
            const p = env.players[id];
            p.x = x;
            p.y = y;
            p.vx = vx || 0;
            p.vy = vy || 0;
            p.facing = facing || 1;
        });
    };

    base.onStart = function (env) {
        isHoldingSuction = false;
        if (origOnStart) origOnStart(env);
    };

    base.onKeyDown = function (e, env) {
        if (origOnKeyDown) origOnKeyDown(e, env);
        const { levelData, roomState, myId, socket } = env;
        if (!levelData || !levelData.handGimmick || !levelData.handGimmick.enabled) return;
        if (roomState && (roomState.cleared || roomState.timeUp)) return;
        if (e.code !== 'KeyE' || !socket) return;

        const w11 = roomState && roomState.world11;
        const mode = (w11 && w11.mode) || levelData.handGimmick.mode || 'captureGun';

        if (mode === 'captureGun' && !e.repeat) {
            if (w11 && w11.captured && w11.captured[myId]) return;
            socket.emit('world11Shoot');
        } else if (isSuctionMode(mode) && !isHoldingSuction) {
            isHoldingSuction = true;
            socket.emit('world11Suction', { active: true });
        }
    };

    base.onKeyUp = function (e, env) {
        if (origOnKeyUp) origOnKeyUp(e, env);
        const { levelData, socket } = env;
        if (e.code === 'KeyE' && isHoldingSuction) {
            isHoldingSuction = false;
            if (socket && levelData && levelData.handGimmick && isSuctionMode(levelData.handGimmick.mode)) {
                socket.emit('world11Suction', { active: false });
            }
        }
    };

    base.shouldLockPlayer = function (env) {
        if (origShouldLock && origShouldLock(env)) return true;
        const w11 = env.roomState && env.roomState.world11;
        if (w11 && w11.enabled && w11.captured && w11.captured[env.myId]) {
            return true;
        }
        return false;
    };

    // Thêm vật cứng riêng của Màn 11-4: Bục bay, Nắp hầm Chìa khóa & Khối trắng [1]
    base.getExtraSolids = function (env) {
        const solids = origGetExtraSolids ? origGetExtraSolids(env) : [];
        const w11 = env.roomState && env.roomState.world11;
        if (w11 && w11.enabled && w11.mode === 'suctionFerry') {
            if (w11.pitLid && !w11.pitOpen) {
                solids.push({ x: w11.pitLid.x, y: w11.pitLid.y, w: w11.pitLid.w, h: w11.pitLid.h });
            }
            if (w11.ferry) {
                solids.push({ x: w11.ferry.x, y: w11.ferry.y, w: w11.ferry.w, h: w11.ferry.h, isElevator: true });
            }
            if (w11.block && w11.block.alive) {
                solids.push({ x: w11.block.x, y: w11.block.y, w: w11.block.w, h: w11.block.h, isPushBlock: true });
            }
        }
        return solids;
    };

    base.updatePhysics = function (env) {
        const res = origUpdatePhysics ? origUpdatePhysics(env) : null;
        const { roomState, players, myId, me, solids, rectOverlap, getCatSize } = env;
        const w11 = roomState && roomState.world11;
        if (!w11 || !w11.enabled || !isSuctionMode(w11.mode) || !me || me.enteredDoor) return res;

        const suckingMap = w11.sucking || {};
        const { w: myW, h: myH } = getCatSize(me);
        const myCx = me.x + myW / 2;
        const myCy = me.y + myH / 2;
        const range = w11.suctionRange || 340;
        const vRange = w11.suctionVertical || 105;

        let pullX = 0;
        let pullY = 0;
        let beingSucked = false;

        for (const sid in suckingMap) {
            if (!suckingMap[sid] || sid === myId) continue;
            const s = players[sid];
            if (!s || s.enteredDoor) continue;

            const sSize = getCatSize(s);
            const dir = s.facing === -1 ? -1 : 1;
            const nozzleX = dir === 1 ? (s.x + sSize.w) : s.x;
            const sCy = s.y + sSize.h / 2;

            const dxFromNozzle = (myCx - nozzleX) * dir;
            const dy = sCy - myCy;

            if (dxFromNozzle >= -10 && dxFromNozzle <= range && Math.abs(dy) <= vRange) {
                beingSucked = true;

                const targetX = dir === 1 ? (s.x + sSize.w + 4) : (s.x - myW - 4);
                const diffX = targetX - me.x;
                const maxStepX = w11.pullSpeedX || 5.4;
                if (Math.abs(diffX) > 2) {
                    pullX += Math.sign(diffX) * Math.min(Math.abs(diffX), maxStepX);
                }

                const diffY = s.y - me.y;
                const maxStepY = w11.pullSpeedY || 4.2;
                if (Math.abs(diffY) > 2) {
                    pullY += Math.sign(diffY) * Math.min(Math.abs(diffY), maxStepY);
                }
            }
        }

        if (beingSucked) {
            if (me.vy > 0) me.vy = 0;

            if (Math.abs(pullX) > 0.05) {
                const nextX = me.x + Math.max(-7.5, Math.min(7.5, pullX));
                const testBoxX = { x: nextX, y: me.y, w: myW, h: myH };
                if (!solids.some(s => rectOverlap(testBoxX, s))) {
                    me.x = nextX;
                }
            }

            if (Math.abs(pullY) > 0.05) {
                const nextY = me.y + Math.max(-5.5, Math.min(5.5, pullY));
                const testBoxY = { x: me.x, y: nextY, w: myW, h: myH };
                if (!solids.some(s => rectOverlap(testBoxY, s))) {
                    me.y = nextY;
                }
            }
        }

        return res;
    };

    base.drawWorldBeforePlayers = function (ctx, env) {
        if (origDrawBefore) origDrawBefore(ctx, env);
        const w11 = env.roomState && env.roomState.world11;
        if (!w11 || !w11.enabled) return;

        if (w11.hintText) {
            ctx.fillStyle = '#ff8c3a';
            ctx.font = '900 28px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(w11.hintText, w11.hintX || 340, w11.hintY || 225);
        }

        // Vẽ các cơ chế riêng của Màn 11-4
        if (w11.mode === 'suctionFerry') {
            const orange = (env.levelData && env.levelData.groundColor) || '#ff8c3a';

            // 1. Nắp cam đậy kín hầm Chìa khóa
            if (w11.pitLid && !w11.pitOpen) {
                ctx.fillStyle = orange;
                ctx.fillRect(w11.pitLid.x, w11.pitLid.y, w11.pitLid.w, w11.pitLid.h);
            }

            // 2. Bục bay màu cam
            if (w11.ferry) {
                ctx.fillStyle = orange;
                ctx.fillRect(Math.round(w11.ferry.x), Math.round(w11.ferry.y), w11.ferry.w, w11.ferry.h);
            }

            // 3. Nút Đỏ 1 & Nút Đỏ 2
            const drawBtn = (btn, pressed) => {
                if (!btn) return;
                const h = pressed ? 5 : btn.h;
                const y = btn.y + (btn.h - h);
                ctx.fillStyle = '#ff2e2e';
                ctx.fillRect(btn.x, y, btn.w, h);
                ctx.fillStyle = '#b30000';
                ctx.fillRect(btn.x - 3, btn.y + btn.h - 3, btn.w + 6, 3);
            };
            drawBtn(w11.btn1, w11.btn1Pressed);
            drawBtn(w11.btn2, w11.btn2Pressed);

            // 4. Số đếm ngược 9 -> 1 ngay dưới mép tầng trên giống video
            if (w11.countdown > 0 && w11.countdownPos) {
                ctx.fillStyle = orange;
                ctx.font = '900 32px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText(String(w11.countdown), w11.countdownPos.x, w11.countdownPos.y);
            }

            // 5. Khối trắng [1] (đổi sang 0 khi đang có người đẩy/hút giống video)
            if (w11.block && w11.block.alive) {
                const b = w11.block;
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
        }
    };

    base.drawWorldAfterPlayers = function (ctx, env) {
        if (origDrawAfter) origDrawAfter(ctx, env);
        const { roomState, players, getCatSize } = env;
        const w11 = roomState && roomState.world11;
        if (!w11 || !w11.enabled) return;

        const now = Date.now();

        Object.values(players || {}).forEach(p => {
            if (p.enteredDoor) return;
            if (w11.captured && w11.captured[p.id]) return;

            const { w: pw, h: ph } = getCatSize(p);
            const dir = p.facing === -1 ? -1 : 1;

            if (isSuctionMode(w11.mode)) {
                const isSucking = Boolean(w11.sucking && w11.sucking[p.id]);
                const gx = dir === 1 ? Math.round(p.x + pw - 2) : Math.round(p.x - 14);
                const gy = Math.round(p.y + ph * 0.46);

                ctx.fillStyle = p.color.fill;
                ctx.strokeStyle = p.color.border;
                ctx.lineWidth = 2;

                ctx.fillRect(gx, gy + 2, 12, 6);
                ctx.strokeRect(gx, gy + 2, 12, 6);

                const funnelX = dir === 1 ? (gx + 10) : (gx - 3);
                ctx.fillRect(funnelX, gy - 2, 5, 14);
                ctx.strokeRect(funnelX, gy - 2, 5, 14);

                if (isSucking) {
                    const nozzleX = dir === 1 ? (funnelX + 6) : (funnelX - 1);
                    const nozzleY = gy + 5;
                    const beamLen = Math.min(260, w11.suctionRange || 260);

                    for (let i = 0; i < 9; i++) {
                        const t = ((now * 0.0024 + i / 9) % 1);
                        const dist = (1 - t) * beamLen;
                        const spread = (1 - t) * 28;
                        const offsetY = Math.sin(i * 2.3 + now * 0.008) * spread;
                        const px = Math.round(nozzleX + dir * dist);
                        const py = Math.round(nozzleY + offsetY);

                        ctx.fillStyle = p.color.fill;
                        ctx.strokeStyle = p.color.border;
                        ctx.lineWidth = 1.2;
                        ctx.fillRect(px - 2, py - 2, 4, 4);
                        ctx.strokeRect(px - 2, py - 2, 4, 4);
                    }
                }
                return;
            }

            // Vẽ Súng Màn 11-1 & 11-3
            const held = w11.holding && w11.holding[p.id];
            const gunColor = held ? held.color : p.color;

            const gx = dir === 1 ? Math.round(p.x + pw - 2) : Math.round(p.x - 12);
            const gy = Math.round(p.y + ph * 0.50);

            ctx.fillStyle = gunColor.fill;
            ctx.strokeStyle = gunColor.border;
            ctx.lineWidth = 2;
            ctx.fillRect(gx, gy, 14, 7);
            ctx.strokeRect(gx, gy, 14, 7);

            const gripX = dir === 1 ? gx + 2 : gx + 8;
            ctx.fillRect(gripX, gy + 6, 4, 6);
            ctx.strokeRect(gripX, gy + 6, 4, 6);

            if (held) {
                const tipX = dir === 1 ? gx + 15 : gx - 1;
                ctx.beginPath();
                ctx.arc(tipX, gy + 3.5, 4, 0, Math.PI * 2);
                ctx.fillStyle = held.color.fill;
                ctx.fill();
                ctx.strokeStyle = held.color.border;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        });

        (w11.bullets || []).forEach(b => {
            ctx.beginPath();
            ctx.arc(Math.round(b.x), Math.round(b.y), b.r, 0, Math.PI * 2);
            ctx.fillStyle = b.color.fill;
            ctx.fill();
            ctx.strokeStyle = b.color.border;
            ctx.lineWidth = 2.5;
            ctx.stroke();
        });
    };

    base.drawHUD = function (ctx, canvas, env) {
        if (origDrawHUD) origDrawHUD(ctx, canvas, env);
        const w11 = env.roomState && env.roomState.world11;
        if (!w11 || !w11.enabled) return;

        if (w11.captured && w11.captured[env.myId]) {
            const rootId = getRootCarrierId(w11, env.myId);
            const carrier = env.players && env.players[rootId];
            const name = carrier ? carrier.name : 'đồng đội';
            const label = `Bạn đang ở trong súng của ${name} — chờ bắn ra!`;
            ctx.font = 'bold 15px Segoe UI';
            const w = Math.max(300, Math.round(ctx.measureText(label).width + 32));
            const x = Math.round((canvas.width - w) / 2);
            const y = canvas.height - 46;

            ctx.fillStyle = 'rgba(255, 248, 231, 0.94)';
            ctx.strokeStyle = '#ff8c3a';
            ctx.lineWidth = 2.5;
            ctx.fillRect(x, y, w, 34);
            ctx.strokeRect(x, y, w, 34);

            ctx.fillStyle = '#ff6b2b';
            ctx.textAlign = 'center';
            ctx.fillText(label, canvas.width / 2, y + 22);
        }
    };
})();