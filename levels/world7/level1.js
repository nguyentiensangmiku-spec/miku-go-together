module.exports = {
    id: '7-1',
    name: 'MOVE AND STOP 7-1',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 65, y: 405 },

    // Khung phòng kín giống video (toàn bộ thử thách nằm ở con ma)
    platforms: [
        { x: 0, y: 0, w: 900, h: 36 },            // Trần trên
        { x: 0, y: 36, w: 32, h: 464 },           // Tường trái
        { x: 868, y: 36, w: 32, h: 464 },         // Tường phải
        { x: 32, y: 446, w: 836, h: 54 }          // Sàn phẳng xuyên suốt
    ],

    // Cơ chế riêng của World 7 - Màn 1: Con ma ngủ / tỉnh (Move and Stop)
    ghost: {
        enabled: true,
        x: 715,
        y: 235,
        patrolX: 400,         // Sau khi có người lấy chìa khóa, con ma trôi dần về giữa phòng
        sleepMin: 2200,       // Thời gian ngủ tối thiểu (ms)
        sleepMax: 3600,       // Thời gian ngủ tối đa (ms)
        warningTime: 750,     // Thời gian cảnh báo (!) trước khi mở mắt để kịp dừng tay (ms)
        awakeMin: 1800,       // Thời gian mở mắt canh chừng tối thiểu (ms)
        awakeMax: 2800        // Thời gian mở mắt canh chừng tối đa (ms)
    },

    // Chìa khóa nằm ngay dưới chỗ con ma ngủ bên phải
    key: { x: 735, y: 388, w: 26, h: 36 },

    // Cửa đích ở góc dưới bên phải
    door: { x: 794, y: 378, w: 52, h: 68 }
};