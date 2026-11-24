module.exports = {
    id: '10-4',
    name: 'TWO PLAYERS 10-4 (DARK)',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 525, y: 416 },

    // Chìa khóa chỉ hiện sáng & nhặt được sau khi đẩy xong khối số 2 ở Chặng 1
    keyRequiresPuzzle: true,

    // Địa hình tĩnh (bị che đen khi chơi và lộ toàn bộ khi CLEAR!)
    platforms: [
        // Khung phòng kín 4 phía
        { x: 0, y: 0, w: 24, h: 500 },            // Tường trái
        { x: 876, y: 0, w: 24, h: 500 },          // Tường phải
        { x: 24, y: 0, w: 852, h: 20 },           // Trần trên
        { x: 24, y: 455, w: 852, h: 45 },         // Sàn đáy

        // Bục cam lớn ở giữa sân (bật lò xo để nhảy lên)
        { x: 356, y: 275, w: 195, h: 85 },

        // Bục cam đặt Lò xo ở góc dưới-phải (hiện sáng từ Chặng 2)
        { x: 560, y: 425, w: 140, h: 30 },

        // 5 khối vuông lơ lửng hàng trên cùng (2 khối đầu sáng ở Chặng 3, 3 khối sau ẩn đen)
        { x: 256, y: 108, w: 48, h: 48 },
        { x: 356, y: 108, w: 48, h: 48 },
        { x: 456, y: 108, w: 48, h: 48 },
        { x: 556, y: 108, w: 48, h: 48 },
        { x: 656, y: 108, w: 48, h: 48 },

        // Bục cao góc trên-phải đặt Cửa đích (ẩn đen)
        { x: 750, y: 120, w: 126, h: 120 }
    ],

    // Cơ chế riêng của World 10 - Màn 4: Ẩn Đen + Mở sáng theo chặng + Tiếp sức 2 người
    dark104: {
        enabled: true,
        spawn: { x: 525, y: 416 },

        // Khối đẩy số 2 (ẩn trong bóng tối ở Chặng 1, cần đẩy sang trái về x <= 268)
        pushBlock: { x: 405, y: 315, w: 86, h: 140, minX: 250, maxX: 460, speed: 3.0 },

        // Bục cam & Bàn bật Lò xo ở góc dưới-phải (chỉ sáng & hoạt động từ Chặng 2)
        springPlatform: { x: 560, y: 425, w: 140, h: 30 },
        springPad: { x: 608, y: 411, w: 44, h: 14, force: -14.8 },

        // Khối sàn lớn bên trái (nâng lên y = 215 ngay khi nhặt Chìa khóa ở Chặng 3)
        leftBlock: { x: 24, y: 455, upY: 215, w: 226, h: 240, speed: 4.2 },

        // 2 khối cam đầu hàng trên (phát sáng từ Chặng 3)
        litTopBlocks: [
            { x: 256, y: 108, w: 48, h: 48 },
            { x: 356, y: 108, w: 48, h: 48 }
        ]
    },

    // Chìa khóa vàng phát sáng ở góc dưới-trái từ Chặng 2
    key: { x: 68, y: 396, w: 26, h: 36 },

    // Cửa đích ẩn đen ở góc trên-phải
    door: { x: 795, y: 52, w: 52, h: 68 }
};