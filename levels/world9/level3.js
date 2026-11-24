module.exports = {
    id: '9-3',
    name: 'BALL PARK 9-3',
    width: 1750,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 90, y: 361 },

    // Cơ chế riêng của World 9 - Màn 3: Đập tường gạch ngang (Side-Scrolling Breakout)
    brickWall: {
        enabled: true,
        floorY: 446,
        ceilingY: 32,
        leftWallX: 30,
        rightWallX: 1720,
        brickSize: 46,
        ballRadius: 9,
        ballSpeed: 6.4,
        // Mái cam nhô xuống che phía trên hầm cửa đích (bóng nảy vào được)
        overhang: { x: 1502, y: 32, w: 218, h: 276 },

        // Bảng màu gạch chuẩn video
        colors: {
            blue:   { fill: '#74b9ff', border: '#0984e3' },
            red:    { fill: '#ff7675', border: '#d63031' },
            yellow: { fill: '#fff176', border: '#e1b12c' },
            green:  { fill: '#7bed9f', border: '#2ed573' }
        },

        // Các cột tường chắn bắt buộc phải đục thông (dùng để kiểm tra khi hết bóng)
        wallCols: [674, 720, 766, 812, 1410, 1456, 1502],

        // Bố cục toàn bộ gạch (x theo bội số 46 tính từ 30, y = 32 + row * 46, row từ 0 đến 8)
        layout: [
            // 1. Hàng gạch Xanh dương lót sàn khu xuất phát (row 8)
            ...Array.from({ length: 14 }, (_, i) => ({ x: 30 + i * 46, row: 8, color: 'blue' })),

            // 2. Bức tường 1: 4 cột Xanh dương -> Đỏ -> Vàng -> Xanh lá (cao kín từ trần tới sàn)
            ...Array.from({ length: 9 }, (_, r) => ({ x: 674, row: r, color: 'blue' })),
            ...Array.from({ length: 9 }, (_, r) => ({ x: 720, row: r, color: 'red' })),
            ...Array.from({ length: 9 }, (_, r) => ({ x: 766, row: r, color: 'yellow' })),
            ...Array.from({ length: 9 }, (_, r) => ({ x: 812, row: r, color: 'green' })),

            // 3. Khu vực giữa: Hàng gạch Xanh lá dưới sàn + 1 viên Đỏ chồng trên (giống video)
            { x: 950, row: 8, color: 'green' },
            { x: 996, row: 8, color: 'green' },
            { x: 1042, row: 8, color: 'green' },
            { x: 1088, row: 8, color: 'green' },
            { x: 1134, row: 8, color: 'green' },
            { x: 1180, row: 8, color: 'green' },
            { x: 1134, row: 7, color: 'red' },

            // 4. Bức tường 2 chặn cửa đích: Cột Vàng -> Cột Đỏ -> 3 viên Xanh dương ngay miệng hầm
            ...Array.from({ length: 9 }, (_, r) => ({ x: 1410, row: r, color: 'yellow' })),
            ...Array.from({ length: 9 }, (_, r) => ({ x: 1456, row: r, color: 'red' })),
            { x: 1502, row: 6, color: 'blue' },
            { x: 1502, row: 7, color: 'blue' },
            { x: 1502, row: 8, color: 'blue' }
        ]
    },

    // Khung tường cam ngoài cùng & Mái hầm phía trên Cửa đích
    platforms: [
        { x: 0, y: 0, w: 1750, h: 32 },           // Trần trên
        { x: 0, y: 32, w: 30, h: 468 },           // Tường chặn trái
        { x: 1720, y: 32, w: 30, h: 468 },        // Tường chặn phải
        { x: 30, y: 446, w: 1690, h: 54 },        // Sàn đáy (chạm sàn lộ thiên là mất bóng)
        { x: 1502, y: 32, w: 218, h: 276 }        // Khối mái cam che trên lối vào cửa đích
    ],

    // Chìa khóa đặt ở khoảng trống khu vực giữa (sau Bức tường 1)
    key: { x: 1245, y: 345, w: 26, h: 36 },

    // Cửa đích nằm trong hầm góc dưới cùng bên phải (sau Bức tường 2)
    door: { x: 1615, y: 378, w: 52, h: 68 }
};