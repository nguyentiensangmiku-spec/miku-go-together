// Logic máy chủ độc lập riêng cho World 10 - Màn 4 (Ẩn Đen 4 chặng + Tiếp sức 2 người)
function buildPairs(playerIds) {
    if (playerIds.length <= 1) return [playerIds.slice()];
    const pairs = [];
    for (let i = 0; i < playerIds.length; i += 2) {
        if (i + 1 < playerIds.length) pairs.push([playerIds[i], playerIds[i + 1]]);
        else pairs.push([playerIds[i], playerIds[0]]);
    }
    return pairs;
}

function makePlayersMap(room) {
    const map = {};
    for (const id in room.players) {
        const p = room.players[id];
        map[id] = {
            x: p.x, y: p.y, vx: p.vx, vy: p.vy,
            facing: p.facing, scale: p.scale || 1,
            enteredDoor: Boolean(p.enteredDoor)
        };
    }
    return map;
}

function serializeDark104(d, room) {
    const activeIds = d.pairs[d.activePairIdx] || [];
    const activeNames = activeIds
        .map(id => room.players[id] && room.players[id].name)
        .filter(Boolean);

    return {
        enabled: true,
        stage: d.stage,
        totalStages: 4,
        activeIds,
        activeNames,
        pushBlock: {
            x: Math.round(d.pushBlock.x * 10) / 10,
            y: d.pushBlock.y,
            w: d.pushBlock.w,
            h: d.pushBlock.h,
            remaining: d.pushBlock.remaining
        },
        leftBlock: {
            x: d.leftBlock.x,
            y: Math.round(d.leftBlock.y * 10) / 10,
            w: d.leftBlock.w,
            h: d.leftBlock.h
        }
    };
}

function switchPair(d, room, pass, io, banner) {
    if (d.pairs.length <= 1) return;

    const oldIds = d.pairs[d.activePairIdx] || [];
    const oldPositions = oldIds.map(id => {
        const p = room.players[id];
        return p ? { x: p.x, y: p.y, facing: p.facing } : { x: 525, y: 416, facing: 1 };
    });

    const nextIdx = (d.activePairIdx + 1) % d.pairs.length;
    const newIds = d.pairs[nextIdx] || [];

    if (room.state.keyHolder) {
        const holderIdx = oldIds.indexOf(room.state.keyHolder);
        if (holderIdx >= 0 && newIds[holderIdx]) {
            room.state.keyHolder = newIds[holderIdx];
            io.to(pass).emit('keyUpdated', {
                keyHolder: room.state.keyHolder,
                doorUnlocked: room.state.doorUnlocked
            });
        }
    }

    for (const pid in room.players) {
        const p = room.players[pid];
        const nIdx = newIds.indexOf(pid);
        if (nIdx >= 0) {
            const pos = oldPositions[nIdx] || oldPositions[0];
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

    d.activePairIdx = nextIdx;
    io.to(pass).emit('dark104PairSwitch', {
        players: makePlayersMap(room),
        keyHolder: room.state.keyHolder,
        doorUnlocked: room.state.doorUnlocked,
        banner
    });
}

function initLevelState(room, levelData, playerIds) {
    if (!levelData.dark104 || !levelData.dark104.enabled) return;

    const cfg = levelData.dark104;
    const pairs = buildPairs(playerIds);
    const activeIds = pairs[0] || [];
    const spawn = cfg.spawn || levelData.spawn || { x: 525, y: 416 };
    const reqPush = Math.min(2, Math.max(1, activeIds.length));

    playerIds.forEach(id => {
        const p = room.players[id];
        if (!p) return;
        const idx = activeIds.indexOf(id);
        if (idx >= 0) {
            p.enteredDoor = false;
            p.x = spawn.x + idx * 46;
            p.y = spawn.y;
        } else {
            p.enteredDoor = true;
            p.x = spawn.x;
            p.y = spawn.y;
        }
        p.vx = 0;
        p.vy = 0;
        p.scale = 1;
    });

    const d = {
        enabled: true,
        pairs,
        activePairIdx: 0,
        stage: 0,
        requiredPush: reqPush,
        pushBlock: {
            ...cfg.pushBlock,
            remaining: reqPush
        },
        leftBlock: {
            ...cfg.leftBlock,
            rising: false
        }
    };

    room.state._dark104 = d;
    room.state.dark104 = serializeDark104(d, room);
}

function updateRoom(room, pass, players, totalPlayers, now, helpers) {
    const d = room.state && room.state._dark104;
    if (!d || !d.enabled) return;

    const { io, getCatBox } = helpers;
    let changed = false;

    // 1. Chặng 1: Cập nhật khối đẩy số 2 (cả 2 người cùng đẩy sang trái)
    const pb = d.pushBlock;
    const req = Math.min(d.requiredPush, Math.max(1, players.length));
    let pushLeft = 0;
    let pushRight = 0;

    players.forEach(p => {
        const box = getCatBox(p);
        const vertOverlap = box.y + box.h > pb.y + 4 && box.y < pb.y + pb.h - 4;
        if (!vertOverlap) return;

        if (box.x <= pb.x + pb.w + 54 && box.x >= pb.x + pb.w - 16 && p.vx < 0) pushLeft++;
        if (box.x + box.w >= pb.x - 54 && box.x + box.w <= pb.x + 16 && p.vx > 0) pushRight++;
    });

    const activePush = Math.max(pushLeft, pushRight);
    const newRem = Math.max(0, req - activePush);
    if (pb.remaining !== newRem) {
        pb.remaining = newRem;
        changed = true;
    }

    if (d.stage === 0) {
        if (pushLeft >= req && pb.x > pb.minX) {
            pb.x = Math.max(pb.minX, pb.x - (pb.speed || 3.0));
            changed = true;
        } else if (pushRight >= req && pb.x < pb.maxX) {
            pb.x = Math.min(pb.maxX, pb.x + (pb.speed || 3.0));
            changed = true;
        }

        // Đẩy khối số 2 về sát vách trái -> Mở Chặng 2 (hiện Lò xo + Chìa khóa + đổi cặp)
        if (pb.x <= pb.minX + 18) {
            d.stage = 1;
            room.state.keyVisible = true;
            switchPair(d, room, pass, io, 'CHẶNG 2: BẬT LÒ XO LẤY CHÌA!');
            changed = true;
        }
    }

    // 2. Chặng 2 -> Chặng 3: Vừa nhặt Chìa khóa -> Nâng khối sàn trái & sáng 2 khối cam trên cao
    if (d.stage === 1 && (room.state.keyHolder || room.state.doorUnlocked)) {
        d.stage = 2;
        d.leftBlock.rising = true;
        switchPair(d, room, pass, io, 'CHẶNG 3: LÊN TẦNG TRÊN!');
        changed = true;
    }

    // Nâng mượt khối sàn trái lên y = 215
    if (d.leftBlock.rising && d.leftBlock.y > d.leftBlock.upY) {
        d.leftBlock.y = Math.max(d.leftBlock.upY, d.leftBlock.y - (d.leftBlock.speed || 4.2));
        changed = true;
    }

    // 3. Chặng 3 -> Chặng 4: Khi có người nhảy lên được 2 khối cam trên cao -> Đổi cặp cuối
    if (d.stage === 2 && players.some(p => p.x >= 250 && p.y <= 105)) {
        d.stage = 3;
        switchPair(d, room, pass, io, 'CHẶNG 4: VƯỢT BÓNG TỐI VÀO CỬA!');
        changed = true;
    }

    if (changed) {
        const serialized = serializeDark104(d, room);
        room.state.dark104 = serialized;
        io.to(pass).emit('dark104Sync', serialized);
    }
}

module.exports = { initLevelState, updateRoom };