module.exports = {
    id: '8-2',
    name: 'RETRO GAME 8-2',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 220, y: 433 },

    // Chìa khóa chỉ hiện ra sau khi phá sạch toàn bộ 3 hàng gạch
    keyRequiresPuzzle: true,

    // Cơ chế riêng của World 8 - Màn 2: Bắn bóng phá gạch (Breakout)
    breakout: {
        enabled: true,
        area: { x: 170, y: 24, w: 560, h: 448 }, // Sân vuông màu kem ở chính giữa
        cols: 16,                                // 16 cột gạch ngang (3 hàng = 48 viên)
        brickH: 22,
        brickStartY: 80,
        ballRadius: 9,
        ballSpeed: 6.0,
        rowColors: [
            { fill: '#74b9ff', border: '#0984e3' }, // Hàng trên: Xanh dương
            { fill: '#ff7675', border: '#d63031' }, // Hàng giữa: Đỏ hồng
            { fill: '#7bed9f', border: '#2ed573' }  // Hàng dưới: Xanh lá
        ]
    },

    // Khung tường cam dày 2 bên & viền trên/dưới bao quanh sân chơi
    platforms: [
        { x: 0, y: 0, w: 170, h: 500 },           // Tường cam trái
        { x: 730, y: 0, w: 170, h: 500 },         // Tường cam phải
        { x: 170, y: 0, w: 560, h: 24 },          // Trần cam trên
        { x: 170, y: 472, w: 560, h: 28 }         // Sàn cam đáy
    ],

    // Chìa khóa tự hiện ngay phía trên cửa đích khi phá hết gạch
    key: { x: 437, y: 356, w: 26, h: 36 },

    // Cửa đích đặt chính giữa đáy sân
    door: { x: 424, y: 404, w: 52, h: 68 }
};