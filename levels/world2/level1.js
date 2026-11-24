module.exports = {
    id: '2-1',
    name: 'GO TOGETHER 2-1',
    width: 3150,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 60, y: 370 },

    // Bật cơ chế dây nối đồng đội cho riêng màn này
    rope: {
        enabled: true,
        maxDist: 145
    },

    // Địa hình: Sàn xuất phát -> Cầu thang -> Hố vực -> Cầu nổi -> Bục cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },           // Tường chặn trái
        { x: 30, y: 430, w: 610, h: 70 },        // Sàn xuất phát

        // Cầu thang 4 bậc đi lên
        { x: 640, y: 385, w: 55, h: 115 },
        { x: 695, y: 340, w: 55, h: 160 },
        { x: 750, y: 295, w: 55, h: 205 },
        { x: 805, y: 250, w: 555, h: 250 },      // Mặt bằng cao 1

        // Hố vực 1 (từ x: 1360 đến 1500)
        { x: 1500, y: 250, w: 480, h: 250 },     // Mặt bằng cao 2

        // Cây cầu nổi lơ lửng phía trên hố vực chìa khóa
        { x: 2050, y: 195, w: 490, h: 32 },

        // Mặt bằng cuối đặt cửa đích & tường chặn phải
        { x: 2560, y: 250, w: 590, h: 250 },
        { x: 3120, y: 0, w: 30, h: 500 }
    ],

    // Chìa khóa nằm dưới gầm cầu nổi (cần thả đồng đội đu dây xuống lấy)
    key: { x: 2330, y: 315, w: 26, h: 36 },

    // Cửa đích ở cuối màn
    door: { x: 2860, y: 182, w: 52, h: 68 }
};
