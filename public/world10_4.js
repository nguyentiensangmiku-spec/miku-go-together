// Đồ họa "Ẩn Đen" & Lò xo theo chặng độc lập cho World 10 - Màn 4
(function () {
    const base = window.GameEngineExtra;
    if (!base) return;

    let bannerText = '';
    let bannerUntil = 0;
    let ripples = [];
    let wasOnGround = true;

    const origBindSocket = base.bindSocket;
    const origOnStart = base.onStart;
    const origGetExtraSolids = base.getExtraSolids;
    const origUpdatePhysics = base.updatePhysics;
    const origDrawBefore = base.drawWorldBeforePlayers;
    const origDrawHUD = base.drawHUD;

    function addRipple(x, y) {
        ripples.push({ x: Math.round(x), y: Math.round(y), born: Date.now() });
        if (ripples.length > 10) ripples.shift();
    }

    base.bindSocket = function (socket, engine) {
        if (origBindSocket) origBindSocket(socket, engine);

        socket.on('dark104Sync', (d) => {
            const env = engine.getContext();
            if (!env.roomState) return;

            // Kéo chú mèo đi lên mượt mà khi khối sàn bên trái nâng lên ở Chặng 3
            const oldD = env.roomState.dark104;
            const me = env.players && env.players[env.myId];
            if (oldD && oldD.leftBlock && d && d.leftBlock && me && !me.enteredDoor) {
                const dy = d.leftBlock.y - oldD.leftBlock.y;
                if (dy < -0.01) {
                    const myW = Math.round(36 * (me.scale || 1));
                    const myH = Math.round(39 * (me.scale || 1));
                    const lb = oldD.leftBlock;
                    const inHoriz = me.x + myW > lb.x + 2 && me.x < lb.x + lb.w - 2;
                    if (inHoriz && me.y + myH >= d.leftBlock.y - 8) {
                        me.y = d.leftBlock.y - myH;
                        me.vy = 0;
                    }
                }
            }

            env.roomState.dark104 = d;
            if (d && d.stage >= 1) {
                env.roomState.keyVisible = true;
            }
        });

        socket.on('dark104PairSwitch', ({ players: synced, keyHolder, doorUnlocked, banner }) => {
            const env = engine.getContext();
            if (!env.players || !env.roomState) return;
            for (const id in synced) {
                if (env.players[id]) Object.assign(env.players[id], synced[id]);
            }
            env.roomState.keyHolder = keyHolder;
            env.roomState.doorUnlocked = doorUnlocked;
            if (banner) {
                bannerText = banner;
                bannerUntil = Date.now() + 2200;
            }
        });
    };

    base.onStart = function (env) {
        bannerText = '';
        bannerUntil = 0;
        ripples = [];
        wasOnGround = true;
        if (origOnStart) origOnStart(env);
    };

    // Thêm khối đẩy số 2 và khối sàn nâng bên trái vào danh sách vật cứng
    base.getExtraSolids = function (env) {
        const solids = origGetExtraSolids ? origGetExtraSolids(env) : [];
        const d = env.roomState && env.roomState.dark104;
        if (d && d.enabled) {
            if (d.pushBlock) {
                solids.push({
                    x: d.pushBlock.x,
                    y: d.pushBlock.y,
                    w: d.pushBlock.w,
                    h: d.pushBlock.h,
                    isPushBlock: true
                });
            }
            if (d.leftBlock && d.leftBlock.y < 454) {
                solids.push({
                    x: d.leftBlock.x,
                    y: d.leftBlock.y,
                    w: d.leftBlock.w,
                    h: d.leftBlock.h,
                    isElevator: true
                });
            }
        }
        return solids;
    };

    // Kích hoạt Bàn bật Lò xo từ Chặng 2 & tạo vòng tròn sáng dò đường khi tiếp đất trong bóng tối
    base.updatePhysics = function (env) {
        const res = origUpdatePhysics ? origUpdatePhysics(env) : null;
        const { levelData, roomState, me, rectOverlap, getCatSize } = env;
        const d = roomState && roomState.dark104;
        if (!d || !d.enabled || !me || !levelData.dark104) return res;

        const { w: myW, h: myH } = getCatSize(me);

        // Vòng tròn sáng nhẹ ngay dưới chân khi vừa tiếp đất trong bóng tối (giống video)
        if (me.onGround && !wasOnGround) {
            addRipple(me.x + myW / 2, me.y + myH);
        }
        wasOnGround = Boolean(me.onGround);

        // Bật lò xo ở góc dưới-phải (chỉ hoạt động từ Chặng 2 trở đi)
        if (d.stage >= 1 && levelData.dark104.springPad) {
            const pad = levelData.dark104.springPad;
            const footBox = { x: me.x + 2, y: me.y + myH - 6, w: myW - 4, h: 8 };
            if (me.vy >= 0 && rectOverlap(footBox, pad)) {
                me.y = pad.y - myH;
                me.vy = pad.force || -14.8;
                me.onGround = false;
                addRipple(pad.x + pad.w / 2, pad.y);
            }
        }
        return res;
    };

    // Vẽ màn Ẩn Đen + các vật thể mở sáng theo từng chặng (và lộ toàn bộ bản đồ khi CLEAR!)
    base.drawWorldBeforePlayers = function (ctx, env) {
        if (origDrawBefore) origDrawBefore(ctx, env);

        const { levelData, roomState, players, getCatSize, drawKeyIcon } = env;
        const d = roomState && roomState.dark104;
        if (!levelData || !levelData.dark104 || !d || !d.enabled) return;

        const cfg = levelData.dark104;
        const isCleared = Boolean(roomState && roomState.cleared);

        // Khi CLEAR! -> Vẽ khối sàn trái, khối đẩy số 2 và lò xo trên nền sáng giống giây 03:42 video
        if (isCleared) {
            if (d.leftBlock && d.leftBlock.y < 454) {
                ctx.fillStyle = levelData.groundColor || '#ff8c3a';
                ctx.fillRect(d.leftBlock.x, Math.round(d.leftBlock.y), d.leftBlock.w, d.leftBlock.h);
            }
            if (d.pushBlock) {
                const pb = d.pushBlock;
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#ff8c3a';
                ctx.lineWidth = 4;
                ctx.fillRect(pb.x + 2, pb.y + 2, pb.w - 4, pb.h - 4);
                ctx.strokeRect(pb.x + 2, pb.y + 2, pb.w - 4, pb.h - 4);
                ctx.fillStyle = '#ff8c3a';
                ctx.font = '900 32px Segoe UI';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('2', pb.x + pb.w / 2, pb.y + pb.h / 2);
                ctx.textBaseline = 'alphabetic';
            }
            drawSpringPad(ctx, cfg.springPad);
            return;
        }

        // 1. Phủ kín nền đen toàn màn chơi
        ctx.fillStyle = '#141414';
        ctx.fillRect(0, 0, levelData.width, levelData.height);

        // 2. Từ Chặng 2: Sáng bục cam dưới-phải + Lò xo + Chìa khóa vàng
        if (d.stage >= 1) {
            const sp = cfg.springPlatform;
            if (sp) {
                ctx.fillStyle = '#ff8c3a';
                ctx.beginPath();
                ctx.roundRect ? ctx.roundRect(sp.x, sp.y, sp.w, sp.h, 8) : ctx.rect(sp.x, sp.y, sp.w, sp.h);
                ctx.fill();
            }
            drawSpringPad(ctx, cfg.springPad);

            if (levelData.key && roomState.keyVisible !== false && !roomState.doorUnlocked && drawKeyIcon) {
                if (!roomState.keyHolder) {
                    drawKeyIcon(levelData.key.x, levelData.key.y);
                } else if (players && players[roomState.keyHolder]) {
                    const holder = players[roomState.keyHolder];
                    const { w: hw } = getCatSize(holder);
                    drawKeyIcon(holder.x + (holder.facing === 1 ? -24 : hw + 2), holder.y - 10);
                }
            }
        }

        // 3. Từ Chặng 3: Sáng 2 khối vuông cam đầu hàng trên cùng
        if (d.stage >= 2 && cfg.litTopBlocks) {
            ctx.fillStyle = '#ff8c3a';
            cfg.litTopBlocks.forEach(b => {
                ctx.beginPath();
                ctx.roundRect ? ctx.roundRect(b.x, b.y, b.w, b.h, 8) : ctx.rect(b.x, b.y, b.w, b.h);
                ctx.fill();
            });
        }

        // 4. Vẽ vòng tròn sáng tím-trắng nhấp nháy khi tiếp đất dò đường trong bóng tối
        const now = Date.now();
        ripples = ripples.filter(r => now - r.born < 900);
        ripples.forEach(r => {
            const t = (now - r.born) / 900;
            const alpha = Math.max(0, 1 - t);
            ctx.strokeStyle = `rgba(180, 140, 220, ${alpha.toFixed(2)})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(r.x, r.y, 6 + t * 12, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = `rgba(255, 255, 255, ${(alpha * 0.8).toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    function drawSpringPad(ctx, pad) {
        if (!pad) return;
        ctx.strokeStyle = '#ff8c3a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pad.x + 5, pad.y + 4);
        ctx.lineTo(pad.x + pad.w - 5, pad.y + pad.h);
        ctx.moveTo(pad.x + pad.w - 5, pad.y + 4);
        ctx.lineTo(pad.x + 5, pad.y + pad.h);
        ctx.stroke();

        ctx.fillStyle = '#ff6b2b';
        ctx.fillRect(pad.x, pad.y, pad.w, 5);
        ctx.fillRect(pad.x, pad.y + pad.h - 3, pad.w, 3);
    }

    base.drawHUD = function (ctx, canvas, env) {
        if (origDrawHUD) origDrawHUD(ctx, canvas, env);

        const { roomState, players, myId } = env;
        const d = roomState && roomState.dark104;
        if (!d || !d.enabled) return;

        const namesText = (d.activeNames && d.activeNames.length) ? d.activeNames.join(' & ') : '';
        const label = `10-4 ẨN ĐEN  |  CHẶNG ${d.stage + 1}/${d.totalStages}` + (namesText ? `  |  ${namesText}` : '');
        ctx.font = '900 15px Segoe UI';
        const boxW = Math.max(250, Math.round(ctx.measureText(label).width + 32));
        const boxX = Math.round((canvas.width - boxW) / 2);

        ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
        ctx.strokeStyle = '#ff8c3a';
        ctx.lineWidth = 2.5;
        ctx.fillRect(boxX, 12, boxW, 32);
        ctx.strokeRect(boxX, 12, boxW, 32);

        ctx.fillStyle = '#ff8c3a';
        ctx.textAlign = 'center';
        ctx.fillText(label, canvas.width / 2, 33);

        const me = players && players[myId];
        const isWaiting = me && me.enteredDoor && !(d.activeIds || []).includes(myId) && !roomState.cleared;
        if (isWaiting) {
            ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
            ctx.strokeStyle = '#ff8c3a';
            ctx.lineWidth = 2;
            ctx.fillRect(canvas.width / 2 - 175, canvas.height - 44, 350, 32);
            ctx.strokeRect(canvas.width / 2 - 175, canvas.height - 44, 350, 32);
            ctx.fillStyle = '#ff8c3a';
            ctx.font = 'bold 14px Segoe UI';
            ctx.fillText('Đang xem đồng đội mò đường — sắp tới lượt bạn!', canvas.width / 2, canvas.height - 23);
        }

        if (bannerText && Date.now() < bannerUntil) {
            ctx.fillStyle = '#ff8c3a';
            ctx.font = '900 28px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(bannerText, canvas.width / 2, 82);
        }
    };
})();