module.exports = {
    id: '14-3',
    name: 'DISTANCE (14-3)',
    width: 3390,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 65, y: 406 },

    // Nối liền cả phòng bằng dây xanh lá (đủ dài để thả đồng đội từ cầu nổi xuống lấy Chìa khóa)
    rope: {
        enabled: true,
        maxDist: 175
    },

    // Địa hình chuẩn video: Sàn đầu -> Cầu thang 4 bậc -> Cao nguyên 1 -> Vực rộng -> Cao nguyên 2 -> (Cầu nổi bẫy) -> Bục cao & Cầu thang 3 bậc -> Bục Cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 520, h: 55 },         // Sàn xuất phát

        // Cầu thang 4 bậc đi lên Cao nguyên 1
        { x: 550, y: 405, w: 54, h: 95 },
        { x: 604, y: 365, w: 54, h: 135 },
        { x: 658, y: 325, w: 54, h: 175 },
        { x: 712, y: 285, w: 54, h: 215 },

        // Cao nguyên 1 -> Hố vực rộng (1206 -> 1370) -> Cao nguyên 2
        { x: 766, y: 250, w: 440, h: 250 },
        { x: 1370, y: 250, w: 460, h: 250 },

        // Bậc nhảy nhỏ & Bục xanh nổi trên cao ở phía cuối cầu (cho đội giữ dây đi sang)
        { x: 2635, y: 182, w: 46, h: 44 },
        { x: 2705, y: 136, w: 265, h: 44 },

        // Cầu thang 3 bậc phía dưới (cho người đu dây lấy Chìa khóa đáp xuống leo lên)
        { x: 2595, y: 445, w: 95, h: 55 },
        { x: 2690, y: 395, w: 95, h: 105 },
        { x: 2785, y: 345, w: 95, h: 155 },

        // Bục Cửa đích bên phải
        { x: 2945, y: 265, w: 415, h: 235 },
        { x: 3360, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Cơ chế riêng của World 14 - Màn 3: Cầu xanh nổi biến mất ngay khi chạm 1 trong 4 khối chấm đỏ
    world14: {
        enabled: true,
        mode: 'ropeTrapBridge',
        bridge: { x: 1935, y: 225, w: 680, h: 44 },
        trapTopBlocks: [
            { x: 2140, y: 322, w: 46, h: 46 },    // Khối xanh trên đỉnh cột trái
            { x: 2382, y: 322, w: 46, h: 46 }     // Khối xanh trên đỉnh cột phải
        ],
        trapButtons: [
            { x: 2143, y: 382, w: 40, h: 40 },    // Khối chấm đỏ trái-trên
            { x: 2143, y: 434, w: 40, h: 40 },    // Khối chấm đỏ trái-dưới
            { x: 2385, y: 382, w: 40, h: 40 },    // Khối chấm đỏ phải-trên
            { x: 2385, y: 434, w: 40, h: 40 }     // Khối chấm đỏ phải-dưới
        ]
    },

    // Chìa khóa vàng nằm chính giữa khe 2 cột khối chấm đỏ dưới gầm cầu
    key: { x: 2272, y: 378, w: 26, h: 36 },

    // Cửa đích đặt trên bục cao bên phải
    door: { x: 3195, y: 197, w: 52, h: 68 }
};