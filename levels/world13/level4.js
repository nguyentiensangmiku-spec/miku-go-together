module.exports = {
    id: '13-4',
    name: 'HELLO, PICO PARK 2 (13-4)',
    width: 2250,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 80, y: 406 },
    keyRequiresPuzzle: true, // Chìa khóa chỉ xuất hiện trên nóc tháp xanh khi đạp đủ nút đỏ cùng lúc
    dynamicCamera: true, // Chỉ bật tự động thu phóng khung hình cho màn này

    // Địa hình chuẩn video: Sàn xuất phát -> 2 bục nổi & khối 2 gai đỏ -> Thềm giữa -> Tháp xanh có 2 tầng hầm -> Bậc thang bay lên Cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 2190, h: 55 },        // Sàn đáy xuyên suốt

        // Bục nổi thấp bên trái (Nút 1) & Khối treo gắn 2 gai đỏ bên dưới
        { x: 250, y: 320, w: 220, h: 26 },
        { x: 545, y: 320, w: 84, h: 26 },

        // Khối lò xo nhỏ & Bục nổi trên cao bên trái (Nút 2)
        { x: 670, y: 235, w: 38, h: 26 },
        { x: 735, y: 235, w: 105, h: 26 },

        // Bậc thềm giữa (Nút 3 + dải lò xo dài)
        { x: 870, y: 345, w: 340, h: 155 },

        // Tháp xanh lớn (tầng nóc + đường hầm giữa mở trái + lối hầm đáy mở phải)
        { x: 1210, y: 195, w: 410, h: 90 },       // Khối trên cùng (nóc tháp tại y = 195)
        { x: 1580, y: 285, w: 40, h: 60 },        // Vách kín bên phải của đường hầm giữa
        { x: 1265, y: 345, w: 355, h: 40 },       // Sàn đường hầm giữa / trần lối hầm đáy

        // 3 khối vuông bậc thang đi lên bục Cửa đích
        { x: 1685, y: 175, w: 46, h: 36 },
        { x: 1775, y: 152, w: 46, h: 36 },
        { x: 1865, y: 129, w: 46, h: 36 },

        // Bục Cửa đích góc trên-phải & Bục tường phải đặt Nút 6 phía dưới
        { x: 1965, y: 108, w: 255, h: 28 },
        { x: 2045, y: 270, w: 175, h: 28 },

        { x: 2220, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // 4 cụm sàn nhún lò xo xanh-trắng giúp di chuyển linh hoạt khắp mọi tầng
    bouncePads: [
        { x: 645, y: 431, w: 225, h: 14, force: -15.5 },  // Lò xo sàn đáy nhảy lên thềm giữa & khối 2 gai
        { x: 670, y: 221, w: 38, h: 14, force: -14.5 },   // Lò xo mini sát bục Nút 2
        { x: 965, y: 331, w: 195, h: 14, force: -16.2 },  // Lò xo trên thềm giữa bật lên nóc tháp xanh
        { x: 1700, y: 431, w: 220, h: 14, force: -17.5 }  // Lò xo hố đáy phải bật lên Nút 6 & bậc thang
    ],

    // Cơ chế riêng của World 13 - Màn 4: 7 Nút Đỏ đạp đồng thời & 2 gai đỏ dưới khối treo
    world13: {
        enabled: true,
        mode: 'multiButtons',
        buttons: [
            { id: 'b1', x: 295, y: 308, w: 36, h: 12 },   // Nút 1: Bục nổi thấp bên trái
            { id: 'b2', x: 770, y: 223, w: 36, h: 12 },   // Nút 2: Bục nổi trên cao bên trái
            { id: 'b3', x: 895, y: 333, w: 36, h: 12 },   // Nút 3: Mép trái thềm giữa
            { id: 'b4', x: 1515, y: 333, w: 36, h: 12 },  // Nút 4: Trong đường hầm giữa tháp xanh
            { id: 'b5', x: 1465, y: 433, w: 36, h: 12 },  // Nút 5: Trong lối hầm đáy dưới tháp xanh
            { id: 'b6', x: 2110, y: 258, w: 36, h: 12 },  // Nút 6: Bục tường phải dưới Cửa đích
            { id: 'b7', x: 2055, y: 433, w: 36, h: 12 }   // Nút 7: Góc sàn dưới cùng bên phải
        ],
        spikes: [
            { x: 553, y: 346, w: 32, h: 18 },
            { x: 589, y: 346, w: 32, h: 18 }
        ]
    },

    // Chìa khóa vàng xuất hiện ngay trên nóc tháp xanh lớn khi bảng đếm chạm (!)
    key: { x: 1455, y: 138, w: 26, h: 36 },

    // Cửa đích đặt trên bục cao góc phải
    door: { x: 2135, y: 40, w: 52, h: 68 }
};