// Đồ họa "Ẩn Đen" độc lập cho World 10 - Màn 3 (tự gắn vào GameEngineExtra, không sửa engine_extra.js)
(function () {
    const base = window.GameEngineExtra;
    if (!base) return;

    let bannerText = '';
    let bannerUntil = 0;

    const origBindSocket = base.bindSocket;
    const origOnStart = base.onStart;
    const origDrawBefore = base.drawWorldBeforePlayers;
    const origDrawHUD = base.drawHUD;

    base.bindSocket = function (socket, engine) {
        if (origBindSocket) origBindSocket(socket, engine);

        socket.on('dark103Sync', (d) => {
            const env = engine.getContext();
            if (env.roomState) env.roomState.darkTwoPlayers = d;
        });

        socket.on('dark103PairSwitch', ({ players: synced, keyHolder, doorUnlocked, banner }) => {
            const env = engine.getContext();
            if (!env.players || !env.roomState) return;
            for (const id in synced) {
                if (env.players[id]) Object.assign(env.players[id], synced[id]);
            }
            env.roomState.keyHolder = keyHolder;
            env.roomState.doorUnlocked = doorUnlocked;
            if (banner) {
                bannerText = banner;
                bannerUntil = Date.now() + 2000;
            }
        });
    };

    base.onStart = function (env) {
        bannerText = '';
        bannerUntil = 0;
        if (origOnStart) origOnStart(env);
    };

    // Phủ lớp màn đen trước khi vẽ mèo (che toàn bộ tường cam, chỉ chừa các vật thể phát sáng như video)
    base.drawWorldBeforePlayers = function (ctx, env) {
        if (origDrawBefore) origDrawBefore(ctx, env);

        const { levelData, roomState, players, getCatSize, drawKeyIcon } = env;
        if (!levelData || !levelData.darkTwoPlayers || !levelData.darkTwoPlayers.enabled) return;

        // Khi CLEAR! -> tắt màn đen để lộ toàn bộ kiến trúc màu cam giống hệt video!
        if (roomState && roomState.cleared) return;

        // 1. Phủ kín nền đen toàn màn chơi
        ctx.fillStyle = '#141414';
        ctx.fillRect(0, 0, levelData.width, levelData.height);

        // 2. Vẽ khối vuông cam điểm tựa ở góc dưới-trái (luôn sáng trong đêm)
        const vb = levelData.darkTwoPlayers.visibleBlock;
        if (vb) {
            ctx.fillStyle = '#ff8c3a';
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(vb.x, vb.y, vb.w, vb.h, 8) : ctx.rect(vb.x, vb.y, vb.w, vb.h);
            ctx.fill();
        }

        // 3. Vẽ Chìa khóa vàng nổi bật trong bóng tối
        if (levelData.key && roomState && roomState.keyVisible !== false && !roomState.doorUnlocked && drawKeyIcon) {
            if (!roomState.keyHolder) {
                drawKeyIcon(levelData.key.x, levelData.key.y);
            } else if (players && players[roomState.keyHolder]) {
                const holder = players[roomState.keyHolder];
                const { w: hw } = getCatSize(holder);
                drawKeyIcon(holder.x + (holder.facing === 1 ? -24 : hw + 2), holder.y - 10);
            }
        }

        // 4. Vẽ Bàn bật Lò xo sáng cam (tự hiện lên sau khi có người nhặt Chìa khóa giống video)
        const showSpring = roomState && (roomState.keyHolder || roomState.doorUnlocked);
        if (showSpring && levelData.bouncePads) {
            levelData.bouncePads.forEach(pad => {
                ctx.strokeStyle = '#ff8c3a';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(pad.x + 4, pad.y + 4);
                ctx.lineTo(pad.x + pad.w - 4, pad.y + pad.h);
                ctx.moveTo(pad.x + pad.w - 4, pad.y + 4);
                ctx.lineTo(pad.x + 4, pad.y + pad.h);
                ctx.stroke();

                ctx.fillStyle = '#ff6b2b';
                ctx.fillRect(pad.x, pad.y, pad.w, 5);
                ctx.fillRect(pad.x, pad.y + pad.h - 3, pad.w, 3);
            });
        }
    };

    base.drawHUD = function (ctx, canvas, env) {
        if (origDrawHUD) origDrawHUD(ctx, canvas, env);

        const { roomState, players, myId } = env;
        const d = roomState && roomState.darkTwoPlayers;
        if (!d || !d.enabled) return;

        // Thanh nhỏ hiển thị chặng & cặp đang chơi ở chính giữa phía trên
        const namesText = (d.activeNames && d.activeNames.length) ? d.activeNames.join(' & ') : '';
        const label = `10-3 ẨN ĐEN  |  CHẶNG ${d.stage + 1}/${d.totalStages}` + (namesText ? `  |  ${namesText}` : '');
        ctx.font = '900 15px Segoe UI';
        const boxW = Math.max(240, Math.round(ctx.measureText(label).width + 32));
        const boxX = Math.round((canvas.width - boxW) / 2);

        ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
        ctx.strokeStyle = '#ff8c3a';
        ctx.lineWidth = 2.5;
        ctx.fillRect(boxX, 12, boxW, 32);
        ctx.strokeRect(boxX, 12, boxW, 32);

        ctx.fillStyle = '#ff8c3a';
        ctx.textAlign = 'center';
        ctx.fillText(label, canvas.width / 2, 33);

        // Nhắc người đang chờ lượt (phòng 4-8 người)
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
            ctx.font = '900 30px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(bannerText, canvas.width / 2, 86);
        }
    };
})();