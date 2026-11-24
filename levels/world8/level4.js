module.exports = {
    id: '8-4',
    name: 'RETRO GAME 8-4',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 220, y: 433 },

    // Chìa khóa chỉ hiện ra sau khi phá sạch toàn bộ 4 hàng gạch
    keyRequiresPuzzle: true,

    // Cơ chế riêng của World 8 - Màn 8-4: Breakout 4 hàng gạch + 2 ô [!] nhân bóng + 4 khối vuông cam cản bóng
    breakout: {
        enabled: true,
        area: { x: 170, y: 24, w: 560, h: 448 }, // Sân vuông màu kem ở chính giữa
        cols: 18,                                // 18 cột gạch ngang (4 hàng = 72 viên)
        brickH: 20,
        brickStartY: 72,
        ballRadius: 9,
        ballSpeed: 6.2,
        rowColors: [
            { fill: '#74b9ff', border: '#0984e3' }, // Hàng 1: Xanh dương
            { fill: '#ff7675', border: '#d63031' }, // Hàng 2: Đỏ hồng
            { fill: '#fff176', border: '#e1b12c' }, // Hàng 3: Vàng
            { fill: '#7bed9f', border: '#2ed573' }  // Hàng 4: Xanh lá
        ],
        // 2 ô [!] đặc biệt nằm ở hàng Vàng (hàng 3) -> phá trúng sẽ sinh thêm 2 bóng cam mới
        specialBricks: [
            { row: 2, col: 3, type: 'multiBall', extraBalls: 2 },
            { row: 2, col: 15, type: 'multiBall', extraBalls: 2 }
        ],
        // 4 khối vuông cam cố định chắn giữa sân làm bóng nảy đổi hướng bất ngờ giống video
        bumpers: [
            { x: 232, y: 235, w: 26, h: 26 },
            { x: 368, y: 235, w: 26, h: 26 },
            { x: 506, y: 235, w: 26, h: 26 },
            { x: 642, y: 235, w: 26, h: 26 }
        ]
    },

    // Khung tường cam bao quanh sân chơi
    platforms: [
        { x: 0, y: 0, w: 170, h: 500 },           // Tường cam trái
        { x: 730, y: 0, w: 170, h: 500 },         // Tường cam phải
        { x: 170, y: 0, w: 560, h: 24 },          // Trần cam trên
        { x: 170, y: 472, w: 560, h: 28 }         // Sàn cam đáy
    ],

    // Chìa khóa tự hiện ngay phía trên cửa đích khi phá sạch gạch
    key: { x: 437, y: 356, w: 26, h: 36 },

    // Cửa đích đặt chính giữa đáy sân
    door: { x: 424, y: 404, w: 52, h: 68 }
};