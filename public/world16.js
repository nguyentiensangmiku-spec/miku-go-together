// ================================================================
// ĐỒ HỌA & VẬT LÝ CHUNG CHO CẢ 4 MÀN WORLD 16 (16-1 -> 16-4)
// Tông màu Trắng - Xanh lá chuẩn Pico Park 2 (DANGER PARK)
// ================================================================
(function () {
    const base = window.GameEngineExtra;
    if (!base) return;

    const origBindSocket = base.bindSocket;
    const origShouldLock = base.shouldLockPlayer;
    const origGetExtraSolids = base.getExtraSolids;
    const origDrawBefore = base.drawWorldBeforePlayers;
    const origDrawAfter = base.drawWorldAfterPlayers;

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

    function strokeRoundedRect(ctx, x, y, w, h, r) {
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
        ctx.stroke();
    }

    function fillBottomRoundedRect(ctx, x, y, w, h, r) {
        const rad = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h - rad);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
        ctx.lineTo(x + rad, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
        ctx.closePath();
        ctx.fill();
    }

    // Vẽ lưỡi cưa răng cưa màu xanh lá có ô vuông trắng nhỏ ở tâm chuẩn Pico Park 2
    function drawGreenSaw(ctx, saw, green) {
        if (!saw) return;
        const teeth = 28;
        const outerR = saw.r;
        const innerR = saw.r - 5;

        ctx.save();
        ctx.translate(saw.x, saw.y);
        ctx.rotate(saw.angle || 0);

        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
            const rad = i % 2 === 0 ? outerR : innerR;
            const ang = (i * Math.PI) / teeth;
            const px = Math.cos(ang) * rad;
            const py = Math.sin(ang) * rad;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = green;
        ctx.fill();

        // Ô vuông trắng nhỏ ở chính giữa lưỡi cưa giống hệt video
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();
    }

    base.bindSocket = function (socket, engine) {
        if (origBindSocket) origBindSocket(socket, engine);

        socket.on('world16Sync', (w16) => {
            const env = engine.getContext();
            if (!env.roomState) return;

            const oldW16 = env.roomState.world16;
            const me = env.players && env.players[env.myId];

            // Kéo mèo mượt theo các khối đẩy [ALL] & [1] ở Màn 16-2 khi đứng trên đầu khối
            if (oldW16 && w16 && w16.mode === 'sawBlock' && oldW16.blocks && w16.blocks && me && !me.enteredDoor) {
                const myW = Math.round(36 * (me.scale || 1));
                const myH = Math.round(39 * (me.scale || 1));

                w16.blocks.forEach((nb, idx) => {
                    const ob = oldW16.blocks[idx];
                    if (!ob) return;
                    const dx = nb.x - ob.x;
                    const dy = nb.y - ob.y;
                    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                        const onHoriz = me.x + myW > ob.x + 2 && me.x < ob.x + ob.w - 2;
                        const onVert = Math.abs((me.y + myH) - ob.y) <= 12;
                        if (onHoriz && onVert) {
                            me.x += dx;
                            me.y += dy;
                        } else {
                            // Tránh bị kẹt vào trong khối nếu khối vừa trượt ngang qua
                            const vertOverlap = me.y + myH > nb.y + 4 && me.y < nb.y + nb.h - 4;
                            const horizOverlap = me.x < nb.x + nb.w && me.x + myW > nb.x;
                            if (vertOverlap && horizOverlap && Math.abs(dx) > 0.01) {
                                if (dx > 0) me.x = nb.x + nb.w;
                                else me.x = nb.x - myW;
                            }
                        }
                    }
                });
            }

            env.roomState.world16 = w16;
        });
    };

    base.shouldLockPlayer = function (env) {
        if (origShouldLock && origShouldLock(env)) return true;
        const w16 = env.roomState && env.roomState.world16;
        if (w16 && w16.enabled && (w16.mode === 'dangerPillars' || w16.mode === 'sawBlock') && w16.caught) {
            return true;
        }
        return false;
    };

    base.getExtraSolids = function (env) {
        const solids = origGetExtraSolids ? origGetExtraSolids(env) : [];
        const w16 = env.roomState && env.roomState.world16;
        if (!w16 || !w16.enabled) return solids;

        if (w16.mode === 'dangerPillars') {
            const topY = w16.ceilingY || 28;
            (w16.pillars || []).forEach(p => {
                const h = Math.max(0, p.bottomY - topY);
                if (h > 0) solids.push({ x: p.x, y: topY, w: p.w, h });
            });
        }

        if (w16.mode === 'sawBlock') {
            if (w16.floatingPlatform) {
                solids.push({ ...w16.floatingPlatform });
            }
            (w16.blocks || []).forEach(b => {
                solids.push({ x: b.x, y: b.y, w: b.w, h: b.h, isPushBlock: true });
            });
        }

        return solids;
    };

    base.drawWorldBeforePlayers = function (ctx, env) {
        if (origDrawBefore) origDrawBefore(ctx, env);
        const { levelData, roomState } = env;
        const w16 = roomState && roomState.world16;
        if (!w16 || !w16.enabled) return;

        const green = (levelData && levelData.groundColor) || '#4cd100';

        // --- MÀN 16-1: ĐƯỜNG SÓNG XANH HẠ DẦN & 4 CỘT XANH BO ĐÁY ---
        if (w16.mode === 'dangerPillars') {
            const leftX = w16.chamberLeftX || 776;
            const rightX = w16.chamberRightX || 1412;
            const wyBase = w16.wavyY || 38;
            const phase = Date.now() * 0.01;

            ctx.strokeStyle = green;
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let x = leftX; x <= rightX; x += 10) {
                const wy = wyBase + Math.sin(x * 0.28 + phase) * 4;
                if (x === leftX) ctx.moveTo(x, wy);
                else ctx.lineTo(x, wy);
            }
            ctx.stroke();

            const topY = w16.ceilingY || 28;
            ctx.fillStyle = green;
            (w16.pillars || []).forEach(p => {
                const h = Math.max(0, Math.round(p.bottomY) - topY);
                if (h > 0) fillBottomRoundedRect(ctx, p.x, topY, p.w, h, 10);
            });
            return;
        }

        // --- MÀN 16-2: BỤC NỔI BO GÓC, 2 KHỐI ĐẨY [ALL] / [1] & LƯỠI CƯA XANH ---
        if (w16.mode === 'sawBlock') {
            // 1. Vẽ bục xanh bo góc bên phải
            if (w16.floatingPlatform) {
                const fp = w16.floatingPlatform;
                ctx.fillStyle = green;
                fillRoundedRect(ctx, fp.x, fp.y, fp.w, fp.h, 10);
            }

            // 2. Vẽ các khối đẩy trắng viền xanh lá
            (w16.blocks || []).forEach(b => {
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = green;
                ctx.lineWidth = 4;
                strokeRoundedRect(ctx, Math.round(b.x) + 2, Math.round(b.y) + 2, b.w - 4, b.h - 4, 6);

                ctx.fillStyle = green;
                ctx.font = '900 26px Consolas, "Segoe UI", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(b.remaining ?? 0), b.x + b.w / 2, b.y + b.h / 2 + 1);
                ctx.textBaseline = 'alphabetic';
            });

              // 3. Vẽ đầy đủ cả 2 lưỡi cưa răng cưa màu xanh lá
              (w16.saws || []).forEach(saw => {
                 drawGreenSaw(ctx, saw, green);
              });
        }
    };

    base.drawWorldAfterPlayers = function (ctx, env) {
        if (origDrawAfter) origDrawAfter(ctx, env);
        const { roomState, players } = env;
        const w16 = roomState && roomState.world16;
        if (!w16 || !w16.enabled) return;

        if ((w16.mode === 'dangerPillars' || w16.mode === 'sawBlock') && w16.caught && w16.caughtIds) {
            Object.values(players || {}).forEach(p => {
                if (p.enteredDoor || !w16.caughtIds.includes(p.id)) return;
                ctx.fillStyle = '#111111';
                ctx.font = '900 13px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('x  x', Math.round(p.x) + 18, Math.round(p.y) + 21);
            });
        }
    };
})();