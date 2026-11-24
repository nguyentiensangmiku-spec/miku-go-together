module.exports = {
    id: '14-4',
    name: "DON'T TOUCH ME! (14-4)",
    width: 4150,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 185, y: 406 },

    // Địa hình chuẩn video: Sàn đầu -> Bậc cao (cần khối màu) -> Cao nguyên -> Đường hầm & Bục chữ L -> Cầu thang 5 bậc & Bệ quạt -> Hố sóng xanh -> Sàn đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 960, h: 55 },         // Sàn xuất phát

        // Bậc tường cao 130px (bắt buộc đẩy khối màu lại làm bậc đệm) & Cao nguyên
        { x: 990, y: 315, w: 120, h: 185 },
        { x: 1110, y: 255, w: 460, h: 245 },

        // 2 bậc bước xuống đường hầm thấp
        { x: 1570, y: 318, w: 66, h: 182 },
        { x: 1636, y: 382, w: 66, h: 118 },
        { x: 1702, y: 445, w: 620, h: 55 },       // Sàn đường hầm

        // Khối bục chữ L treo trên cao (đặt Chìa khóa & tạo trần đường hầm)
        { x: 1715, y: 255, w: 335, h: 48 },
        { x: 2010, y: 0, w: 40, h: 303 },

        // Cầu thang xanh 5 bậc leo lên đỉnh
        { x: 2322, y: 397, w: 64, h: 103 },
        { x: 2386, y: 349, w: 64, h: 151 },
        { x: 2450, y: 301, w: 64, h: 199 },
        { x: 2514, y: 253, w: 64, h: 247 },
        { x: 2578, y: 205, w: 64, h: 295 },
        { x: 2642, y: 158, w: 120, h: 342 },      // Đỉnh cầu thang

        // Bệ đặt chiếc quạt thổi gió sang phải
        { x: 2762, y: 295, w: 58, h: 205 },

        // Sàn đích bên phải (sau hố sóng xanh x = 2820..3560)
        { x: 3560, y: 445, w: 560, h: 55 },
        { x: 4120, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // 1 khối màu 48x48 (server_world14.js tự đổi ngẫu nhiên theo màu 1 người chơi trong phòng mỗi lượt)
    colorBlocks: [
        { id: 'w14_4_blk', x: 95, y: 397, w: 48, h: 48, speed: 4.5, ownerIdx: 0 }
    ],

    // Cơ chế riêng của World 14 - Màn 4: DON'T TOUCH ME! + Thanh gạt ngang + Quạt gió + Bục chở dài [ALL]
    world14: {
        enabled: true,
        mode: 'dontTouchFinal',
        drainRate: 32,
        sweeper: {
            x: 1520,
            y: 0,
            w: 18,
            h: 255,
            minX: 1165,
            maxX: 1895,
            speed: 2.3
        },
        fan: {
            x: 2768,
            y: 235,
            w: 48,
            h: 60,
            windX: 2816,
            windY: 200,
            windW: 290,
            windH: 105,
            forceX: 1.7
        },
        carrier: {
            x: 2835,
            y: 305,
            w: 540,
            h: 20,
            startX: 2835,
            endX: 3490,
            speed: 2.2
        },
        pitHazard: {
            x: 2820,
            y: 472,
            w: 740,
            h: 28
        }
    },

    // Chìa khóa vàng nằm trên bục chữ L
    key: { x: 1945, y: 205, w: 26, h: 36 },

    // Cửa đích đặt trên sàn cuối bên phải
    door: { x: 3995, y: 377, w: 52, h: 68 }
};