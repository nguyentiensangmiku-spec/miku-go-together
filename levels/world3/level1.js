module.exports = {
    id: '3-1',
    name: 'TIME LIMIT 3-1',
    width: 1960,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',

    // Xuất phát ngay khu vực giữa màn
    spawn: { x: 890, y: 230 },

    // Cơ chế mới World 3: Đồng hồ đếm ngược (45 giây) & Ăn hết xu mới hiện chìa khóa
    timeLimit: 45,
    keyRequiresAllCoins: true,

    // Địa hình 2 tầng đối xứng với kim tự tháp bậc thang ở giữa
    platforms: [
        { x: 0, y: 0, w: 1960, h: 30 },           // Trần trên
        { x: 0, y: 30, w: 30, h: 470 },           // Tường trái
        { x: 1930, y: 30, w: 30, h: 470 },        // Tường phải
        { x: 30, y: 440, w: 1900, h: 60 },        // Sàn trệt xuyên suốt

        // Sàn tầng 2 bên trái & bên phải
        { x: 30, y: 270, w: 690, h: 36 },
        { x: 1240, y: 270, w: 690, h: 36 },

        // Kim tự tháp bậc thang ở chính giữa
        { x: 780, y: 390, w: 400, h: 50 },
        { x: 840, y: 340, w: 280, h: 50 },
        { x: 900, y: 290, w: 160, h: 50 }
    ],

    // Hệ thống xu vàng rải rác ở cả 2 cánh trái/phải và 2 tầng
    coins: [
        // Tầng trên - Cánh trái (2 hàng)
        { x: 95, y: 115 }, { x: 215, y: 115 }, { x: 335, y: 115 }, { x: 455, y: 115 }, { x: 575, y: 115 },
        { x: 155, y: 195 }, { x: 275, y: 195 }, { x: 395, y: 195 }, { x: 515, y: 195 },

        // Tầng dưới - Cánh trái
        { x: 110, y: 385 }, { x: 220, y: 385 }, { x: 330, y: 385 }, { x: 440, y: 385 }, { x: 550, y: 385 },
        { x: 165, y: 330 }, { x: 385, y: 330 },

        // Khu vực giữa phía trên kim tự tháp
        { x: 860, y: 175 }, { x: 970, y: 135 }, { x: 1080, y: 175 },

        // Tầng trên - Cánh phải (2 hàng)
        { x: 1365, y: 115 }, { x: 1485, y: 115 }, { x: 1605, y: 115 }, { x: 1725, y: 115 }, { x: 1845, y: 115 },
        { x: 1425, y: 195 }, { x: 1545, y: 195 }, { x: 1665, y: 195 }, { x: 1785, y: 195 },

        // Tầng dưới - Cánh phải
        { x: 1350, y: 385 }, { x: 1460, y: 385 }, { x: 1570, y: 385 },
        { x: 1405, y: 330 }, { x: 1515, y: 330 }
    ],

    // Chìa khóa sẽ tự xuất hiện trên đỉnh kim tự tháp sau khi ăn hết xu
    key: { x: 967, y: 215, w: 26, h: 36 },

    // Cửa đích ở góc dưới cùng bên phải
    door: { x: 1815, y: 372, w: 52, h: 68 }
};