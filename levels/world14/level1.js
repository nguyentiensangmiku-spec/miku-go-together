module.exports = {
    id: '14-1',
    name: 'DISTANCE (14-1)',
    width: 3420,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 75, y: 406 },

    // Nối liền cả phòng bằng dây (đồ họa dây xanh lá được phủ trong public\world14.js)
    rope: {
        enabled: true,
        maxDist: 155
    },

    // Địa hình chuẩn video: Sàn đầu -> Bậc cao 1 -> Khe vực -> Cao nguyên dài -> Hố Chìa khóa & Đường hầm thấp -> Hố thang máy -> Vách Cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 870, h: 55 },         // Sàn xuất phát (có sâu xanh bò ngang)

        // Cao nguyên 1 (sau bậc nhảy lên)
        { x: 900, y: 340, w: 420, h: 160 },

        // Khe vực 1 (x = 1320 -> 1470) rồi tới Cao nguyên 2
        { x: 1470, y: 340, w: 650, h: 160 },

        // Khối tường xanh treo trên trần & Sàn thấp bên dưới tạo thành đường hầm (sau hố treo Chìa khóa)
        { x: 2255, y: 0, w: 465, h: 245 },        // Trần tường xanh lớn
        { x: 2255, y: 395, w: 465, h: 105 },      // Sàn đường hầm thấp

        // Vách cao bên phải đặt Cửa đích (sau hố Thang máy)
        { x: 2990, y: 235, w: 400, h: 265 },
        { x: 3390, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Con sâu xanh bò liên tục từ chân bậc thềm sang trái (chạm vào là chơi lại màn)
    enemies: [
        {
            id: 'worm_14_1',
            x: 840,
            y: 421,
            w: 38,
            h: 24,
            minX: 35,
            maxX: 855,
            speed: -2.0,
            mode: 'loop'
        }
    ],

    // Thang máy xanh cuối đường hầm (đủ cả phòng đứng lên sẽ nâng lên sát vách Cửa đích)
    elevators: [
        {
            id: 'elev_14_1',
            x: 2755,
            startY: 455,
            endY: 325,
            w: 200,
            h: 22,
            required: 'ALL',
            speed: 2.2
        }
    ],

    // Cờ kích hoạt cấu trúc & đồ họa tông Xanh lá riêng của World 14
    world14: {
        enabled: true,
        mode: 'distanceRope'
    },

    // Chìa khóa vàng treo sâu bên dưới mép phải Cao nguyên 2 (dùng dây thả đồng đội xuống lấy)
    key: { x: 2174, y: 415, w: 26, h: 36 },

    // Cửa đích đặt trên vách cao bên phải
    door: { x: 3185, y: 167, w: 52, h: 68 }
};