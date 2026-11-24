module.exports = {
    id: '10-1',
    name: 'TWO PLAYERS 10-1',
    width: 4100,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 100, y: 375 },

    // Địa hình tĩnh xuyên suốt 4 chặng của Màn 10-1
    platforms: [
        // --- CHẶNG 1: Sàn đầu + 2 trụ cố định + Sàn phải + Cầu thang 4 bậc ---
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 420, w: 390, h: 80 },         // Sàn xuất phát
        { x: 490, y: 420, w: 50, h: 80 },         // Trụ 1 (cố định)
        { x: 770, y: 420, w: 50, h: 80 },         // Trụ 3 (cố định) - Trụ 2 ở giữa do nút đỏ điều khiển
        { x: 890, y: 420, w: 180, h: 80 },        // Sàn bờ phải Chặng 1

        // Cầu thang 4 bậc leo lên Chặng 2
        { x: 1070, y: 380, w: 48, h: 120 },
        { x: 1118, y: 340, w: 48, h: 160 },
        { x: 1166, y: 300, w: 48, h: 200 },

        // --- CHẶNG 2: Vách trái (3 nút) -> Vực sâu -> Vách phải (nút nối cầu) ---
        { x: 1214, y: 260, w: 296, h: 240 },      // Vách trái Chặng 2
        { x: 2070, y: 260, w: 170, h: 240 },      // Vách phải Chặng 2

        // --- CHẶNG 3: Bậc xuống -> Sàn lấy chìa khóa -> Hố dung nham -> Bờ phải ---
        { x: 2240, y: 310, w: 50, h: 190 },       // Bậc bước xuống Chặng 3
        { x: 2290, y: 355, w: 230, h: 145 },      // Sàn trái Chặng 3 (đặt Chìa khóa)
        { x: 2780, y: 355, w: 130, h: 145 },      // Sàn phải sau hố dung nham
        { x: 2910, y: 395, w: 50, h: 105 },       // Bậc bước xuống Chặng 4

        // --- CHẶNG 4: Sàn phóng to/thu nhỏ -> Phòng Cửa đích có trần thấp ---
        { x: 2960, y: 440, w: 660, h: 60 },       // Sàn phẳng Chặng 4
        { x: 3620, y: 410, w: 46, h: 90 },        // Bậc nhỏ bước vào phòng đích
        { x: 3666, y: 380, w: 404, h: 120 },      // Sàn phòng Cửa đích
        { x: 3666, y: 0, w: 434, h: 292 },        // Trần thấp phòng đích (mèo khổng lồ phải thu nhỏ mới chui vừa)
        { x: 4070, y: 292, w: 30, h: 208 }        // Tường chặn phải
    ],

    // Nút Thu Nhỏ (-) và Phóng To (+) ở Chặng 4 (kèm thêm 1 nút - bên phải cửa đích giống video)
    sizeButtons: [
        { x: 3110, y: 428, w: 36, h: 12, type: 'shrink' },
        { x: 3205, y: 428, w: 36, h: 12, type: 'grow' },
        { x: 4005, y: 368, w: 36, h: 12, type: 'shrink' }
    ],

    // Cơ chế riêng của World 10 - Màn 1: Tiếp sức 2 người qua 4 chặng
    twoPlayers: {
        enabled: true,
        spawn: { x: 100, y: 375 },

        // 3 mốc chuyển chặng & đổi cặp người chơi (khi đủ cặp đang chơi cùng tới mốc)
        checkpoints: [
            { stage: 1, triggerX: 1220, maxY: 265, respawnX: 1245, respawnY: 215 }, // Vào Chặng 2
            { stage: 2, triggerX: 2295, minY: 290, respawnX: 2320, respawnY: 310 }, // Vào Chặng 3
            { stage: 3, triggerX: 2965, minY: 350, respawnX: 3000, respawnY: 395 }  // Vào Chặng 4
        ],

        // Toàn bộ nút bấm đỏ của 4 chặng
        buttons: [
            { id: 'btn1a', x: 350,  y: 408, w: 36, h: 12 }, // Chặng 1: Nâng trụ giữa (bờ trái)
            { id: 'btn1b', x: 925,  y: 408, w: 36, h: 12 }, // Chặng 1: Nâng trụ giữa (bờ phải)

            { id: 'btn2a', x: 1320, y: 248, w: 34, h: 12 }, // Chặng 2: Bật bục 1 (trái cao)
            { id: 'btn2b', x: 1372, y: 248, w: 34, h: 12 }, // Chặng 2: Bật bục 2 (giữa thấp)
            { id: 'btn2c', x: 1424, y: 248, w: 34, h: 12 }, // Chặng 2: Bật bục 3 (ô vuông phải)
            { id: 'btn2d', x: 2125, y: 248, w: 36, h: 12, oneTime: true }, // Chặng 2: Nối cầu dài cố định

            { id: 'btn4a', x: 3360, y: 428, w: 36, h: 12 }, // Chặng 4: Nút đôi bên trái (cần mèo khổng lồ đè cả 2)
            { id: 'btn4b', x: 3456, y: 428, w: 36, h: 12 }, // Chặng 4: Nút đôi bên phải
            { id: 'btn4c', x: 3810, y: 368, w: 36, h: 12 }  // Chặng 4: Nút mở cổng bên trong phòng đích
        ],

        // Chặng 1: Trụ cam thứ 2 (ẩn dưới vực, nổi lên khi có người giữ btn1a hoặc btn1b)
        pillar2: { x: 630, y: 505, upY: 420, downY: 505, w: 50, h: 80, speed: 9 },

        // Chặng 2: 3 bục ẩn hiện theo 3 nút đỏ & Cầu dài cố định khi bấm btn2d
        stage2Platforms: [
            { id: 'p2a', btnId: 'btn2a', x: 1585, y: 245, w: 125, h: 28 },
            { id: 'p2b', btnId: 'btn2b', x: 1755, y: 310, w: 125, h: 28 },
            { id: 'p2c', btnId: 'btn2c', x: 1945, y: 310, w: 54,  h: 36 }
        ],
        bridge: { x: 1510, y: 260, w: 560, h: 34 },

        // Chặng 3: Hố dung nham & 3 khối gạch trắng tự vỡ xếp hình tam giác
        lava: { x: 2520, y: 455, w: 260, h: 45 },
        crumblingBlocks: [
            { id: 'tp_cb1', x: 2562, y: 382, w: 46, h: 46, delay: 480 },
            { id: 'tp_cb2', x: 2627, y: 326, w: 46, h: 46, delay: 480 },
            { id: 'tp_cb3', x: 2692, y: 382, w: 46, h: 46, delay: 480 }
        ],

        // Chặng 4: Cổng dọc mở khi đè đủ (btn4a + btn4b) hoặc bấm btn4c bên trong
        gate: { x: 3695, y: 292, closedY: 292, openY: 204, w: 28, h: 88, speed: 7 }
    },

    // Chìa khóa đặt ngay đầu Chặng 3
    key: { x: 2350, y: 300, w: 26, h: 36 },

    // Cửa đích đặt bên trong phòng trần thấp ở Chặng 4
    door: { x: 3915, y: 312, w: 52, h: 68 }
};