// ================================================================
// ĐỒ HỌA MÈO PIXEL CHUẨN PICO PARK (12x13 px -> 36x39 px)
// ================================================================
(function () {
    // Khung đứng yên (mắt nhìn thẳng, 2 chấm trắng nhỏ ở thân)
    const FRAME_IDLE = [
        'BBB......BBB',
        'BFBBBBBBBBFB',
        'BFFFFFFFFFFB',
        'BFFFFFFFFFFB',
        'BFFEEFFEEFFB',
        'BFFEEFFEEFFB',
        'BFFFFFFFFFFB',
        'BFFFFFFFFFFB',
        'BBBBFFFFBBBB',
        '...BFFFFB...',
        '...BWFFWB...',
        '...BFFFFB...',
        '...BBBBBB...'
    ];

    // Khung chạy bước 1 (mắt liếc theo hướng chạy, chân đá ra sau)
    const FRAME_RUN_1 = [
        'BBB......BBB',
        'BFBBBBBBBBFB',
        'BFFFFFFFFFFB',
        'BFFFFFFFFFFB',
        'BFFFEEFFEEFB',
        'BFFFEEFFEEFB',
        'BFFFFFFFFFFB',
        'BFFFFFFFFFFB',
        'BBBBFFFFBBBB',
        '...BFFFWB...',
        '..BWFFFFB...',
        '..BFFFBBB...',
        '..BBB.......'
    ];

    // Khung chạy bước 2 (chân thu gọn)
    const FRAME_RUN_2 = [
        'BBB......BBB',
        'BFBBBBBBBBFB',
        'BFFFFFFFFFFB',
        'BFFFFFFFFFFB',
        'BFFFEEFFEEFB',
        'BFFFEEFFEEFB',
        'BFFFFFFFFFFB',
        'BFFFFFFFFFFB',
        'BBBBFFFFBBBB',
        '...BFFFFB...',
        '...BWFFWB...',
        '...BFFFFB...',
        '...BBBBBB...'
    ];

    window.drawPixelCat = function (ctx, x, y, color, name, scale = 1, facing = 1, vx = 0) {
        const px = 3 * scale;
        const w = 12 * px;
        const isMoving = Math.abs(vx || 0) > 0.1;

        let grid = FRAME_IDLE;
        if (isMoving) {
            const step = Math.floor(Date.now() / 110) % 2;
            grid = step === 0 ? FRAME_RUN_1 : FRAME_RUN_2;
        }

        const fill = (color && color.fill) || '#ff8585';
        const border = (color && color.border) || '#ff4d4d';

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // Lật ngang khi mèo quay sang trái
        if (facing === -1 && isMoving) {
            ctx.translate(Math.round(x + w), Math.round(y));
            ctx.scale(-1, 1);
        } else {
            ctx.translate(Math.round(x), Math.round(y));
        }

        for (let r = 0; r < grid.length; r++) {
            const row = grid[r];
            for (let c = 0; c < row.length; c++) {
                const ch = row[c];
                if (ch === '.') continue;
                if (ch === 'B') ctx.fillStyle = border;
                else if (ch === 'F') ctx.fillStyle = fill;
                else if (ch === 'E') ctx.fillStyle = '#000000';
                else if (ch === 'W') ctx.fillStyle = '#ffffff';
                ctx.fillRect(Math.round(c * px), Math.round(r * px), Math.ceil(px), Math.ceil(px));
            }
        }
        ctx.restore();

        // Vẽ tên người chơi phía trên đầu mèo
        if (name) {
            ctx.fillStyle = '#333333';
            ctx.font = `bold ${Math.max(11, Math.round(12 * Math.min(scale, 1.3)))}px Segoe UI`;
            ctx.textAlign = 'center';
            ctx.fillText(name, Math.round(x + w / 2), Math.round(y - 8));
        }
    };
})();