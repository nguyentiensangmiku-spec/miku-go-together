module.exports = {
    id: '6-3',
    name: 'PUSH OR JUMP 6-3',
    width: 2500,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 70, y: 305 },

    // Địa hình: Sàn xuất phát (thấp hơn) -> 2 bục giữa cao -> Khối trần treo hố 3 -> Bục cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 350, w: 500, h: 150 },        // Sàn xuất phát bên trái

        { x: 860, y: 295, w: 260, h: 205 },       // Bục giữa 1 (cao hơn sàn xuất phát)
        { x: 1470, y: 295, w: 260, h: 205 },      // Bục giữa 2 (nơi đặt Chìa khóa)

        { x: 1935, y: 0, w: 565, h: 105 },        // Khối trần treo phía trên hố 3 & khu đích (giống video)
        { x: 2115, y: 295, w: 385, h: 205 },      // Bục đích bên phải
        { x: 2470, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // 3 thang máy đếm đủ sĩ số cả phòng (tụt xuống ngay khi có người nhảy ra)
    elevators: [
        {
            id: 'elev_6_3_1',
            x: 590,
            y: 455,
            startY: 455,
            endY: 295,
            w: 200,
            h: 18,
            required: 'ALL',
            speed: 1.3
        },
        {
            id: 'elev_6_3_2',
            x: 1185,
            y: 455,
            startY: 455,
            endY: 295,
            w: 200,
            h: 18,
            required: 'ALL',
            speed: 1.3
        },
        {
            id: 'elev_6_3_3',
            x: 1805,
            y: 455,
            startY: 455,
            endY: 295,
            w: 200,
            h: 18,
            required: 'ALL',
            speed: 1.1   // Tụt chậm hơn nhẹ để cả nhóm kịp nhảy nối đuôi qua khe rộng
        }
    ],

    // Chìa khóa treo ở mép phải bục giữa 2
    key: { x: 1680, y: 220, w: 26, h: 36 },

    // Cửa đích trên bục cuối bên phải
    door: { x: 2310, y: 227, w: 52, h: 68 }
};