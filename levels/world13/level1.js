module.exports = {
    id: '13-1',
    name: 'HELLO, PICO PARK 2 (13-1)',
    width: 2700,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 80, y: 400 },

    // Địa hình tông Trắng - Xanh lá: Sàn đầu -> Khe nhỏ -> Sàn nhún & Vách cao -> Thung lũng Chìa khóa -> Cầu thang phải -> Bục nổi Cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 410, h: 55 },         // Sàn xuất phát

        // Khe hố nhỏ (440 -> 495) rồi tới sàn dẫn vào dải nhún lò xo
        { x: 495, y: 445, w: 625, h: 55 },

        // Vách tường xanh cao khổng lồ
        { x: 1120, y: 215, w: 680, h: 285 },

        // 3 bậc thang đi xuống thung lũng Chìa khóa
        { x: 1800, y: 270, w: 46, h: 230 },
        { x: 1846, y: 325, w: 46, h: 175 },
        { x: 1892, y: 380, w: 48, h: 120 },

        // Sàn đáy thung lũng (đặt dải sàn nhún lò xo)
        { x: 1940, y: 445, w: 260, h: 55 },

        // Cầu thang bậc lớn đi lên phía bên phải
        { x: 2200, y: 390, w: 55, h: 110 },
        { x: 2255, y: 335, w: 55, h: 165 },
        { x: 2310, y: 280, w: 55, h: 220 },
        { x: 2365, y: 225, w: 55, h: 275 },
        { x: 2420, y: 170, w: 55, h: 330 },
        { x: 2475, y: 115, w: 195, h: 385 },      // Đỉnh cầu thang phải

        // Bục xanh nổi trên cao đặt Cửa đích (nằm ngay phía trên vách tường xanh)
        { x: 1220, y: 108, w: 330, h: 26 },

        { x: 2670, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // 2 dải sàn nhún lò xo dài (trước vách cao & dưới đáy thung lũng Chìa khóa)
    bouncePads: [
        { x: 780, y: 431, w: 340, h: 14, force: -16.8 },
        { x: 1940, y: 431, w: 260, h: 14, force: -15.5 }
    ],

    // Cơ chế riêng của World 13 - Màn 1: Nút Đỏ nâng bục xanh lên Cửa đích
    world13: {
        enabled: true,
        mode: 'helloPark',
        button: { x: 1365, y: 203, w: 36, h: 12 },
        lift: { x: 1570, y: 215, startY: 215, upY: 108, w: 100, h: 22, speed: 3.2 }
    },

    // Chìa khóa vàng treo phía trên sàn nhún trong thung lũng
    key: { x: 2055, y: 275, w: 26, h: 36 },

    // Cửa đích đặt trên bục xanh nổi phía trên vách tường
    door: { x: 1265, y: 40, w: 52, h: 68 }
};