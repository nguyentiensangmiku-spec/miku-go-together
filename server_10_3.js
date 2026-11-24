// Logic máy chủ độc lập riêng cho World 10 - Màn 3 (Ẩn Đen + Tiếp sức 2 người)
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

function serializeDark(d, room) {
    const activeIds = d.pairs[d.activePairIdx] || [];
    const activeNames = activeIds
        .map(id => room.players[id] && room.players[id].name)
        .filter(Boolean);
    return {
        enabled: true,
        stage: d.stage,
        totalStages: 4,
        activeIds,
        activeNames
    };
}

function initLevelState(room, levelData, playerIds) {
    if (!levelData.darkTwoPlayers || !levelData.darkTwoPlayers.enabled) return;

    const cfg = levelData.darkTwoPlayers;
    const pairs = buildPairs(playerIds);
    const activeIds = pairs[0] || [];
    const spawn = cfg.spawn || levelData.spawn || { x: 105, y: 416 };

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

    const d = { enabled: true, pairs, activePairIdx: 0, stage: 0 };
    room.state._dark103 = d;
    room.state.darkTwoPlayers = serializeDark(d, room);
}

function updateRoom(room, pass, players, totalPlayers, now, helpers) {
    const d = room.state && room.state._dark103;
    if (!d || !d.enabled) return;

    const { io } = helpers;
    const activeIds = (d.pairs[d.activePairIdx] || []).filter(id => room.players[id] && !room.players[id].enteredDoor);
    if (activeIds.length === 0) return;

    // 3 mốc chuyển chặng (tự đổi cặp chơi nếu phòng có 4-8 người)
    let advance = false;
    if (d.stage === 0) {
        advance = activeIds.some(id => room.players[id].x >= 265 && room.players[id].y <= 330);
    } else if (d.stage === 1) {
        advance = activeIds.some(id => room.players[id].x >= 500 && room.players[id].y <= 275);
    } else if (d.stage === 2) {
        advance = Boolean(room.state.keyHolder || room.state.doorUnlocked);
    }

    if (!advance) return;

    d.stage += 1;

    if (d.pairs.length > 1) {
        const oldIds = d.pairs[d.activePairIdx] || [];
        const oldPositions = oldIds.map(id => {
            const p = room.players[id];
            return p ? { x: p.x, y: p.y, facing: p.facing } : { x: 105, y: 416, facing: 1 };
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
        io.to(pass).emit('dark103PairSwitch', {
            players: makePlayersMap(room),
            keyHolder: room.state.keyHolder,
            doorUnlocked: room.state.doorUnlocked,
            banner: `CHẶNG ${d.stage + 1}: ĐỔI CẶP CHƠI!`
        });
    }

    const serialized = serializeDark(d, room);
    room.state.darkTwoPlayers = serialized;
    io.to(pass).emit('dark103Sync', serialized);
}

module.exports = { initLevelState, updateRoom };