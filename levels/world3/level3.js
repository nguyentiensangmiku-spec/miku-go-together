module.exports = {
    id: '3-3',
    name: 'TIME LIMIT 3-3',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',

    // Xuất phát từ phía trên rơi xuống sàn lò xo
    spawn: { x: 120, y: 185 },

    // Đếm ngược thời gian (35 giây cho dễ thở với cả phòng 2 người; chơi 8 người có thể sửa thành 25)
    timeLimit: 35,
    keyRequiresAllCoins: true,

    // Khung tường, 8 ô vuông nhỏ ở giữa và 4 bục cao trên cùng (giống hệt video)
    platforms: [
        { x: 0, y: 0, w: 900, h: 24 },            // Trần trên
        { x: 0, y: 24, w: 24, h: 476 },           // Tường trái
        { x: 876, y: 24, w: 24, h: 476 },         // Tường phải
        { x: 24, y: 450, w: 852, h: 50 },         // Sàn đáy

        // 8 ô vuông nhỏ ở giữa màn hình
        { x: 105, y: 235, w: 28, h: 28 },
        { x: 195, y: 235, w: 28, h: 28 },
        { x: 285, y: 235, w: 28, h: 28 },
        { x: 375, y: 235, w: 28, h: 28 },
        { x: 497, y: 235, w: 28, h: 28 },
        { x: 587, y: 235, w: 28, h: 28 },
        { x: 677, y: 235, w: 28, h: 28 },
        { x: 767, y: 235, w: 28, h: 28 },

        // 4 bục cao ở 2 bên trên cùng
        { x: 115, y: 120, w: 88, h: 22 },
        { x: 225, y: 120, w: 88, h: 22 },
        { x: 587, y: 120, w: 88, h: 22 },
        { x: 697, y: 120, w: 88, h: 22 }
    ],

    // Sàn nhún lò xo phủ 2 bên trái & phải của cửa đích
    bouncePads: [
        { x: 24, y: 436, w: 366, h: 14, force: -15.5 },
        { x: 510, y: 436, w: 366, h: 14, force: -15.5 }
    ],

    // Hệ thống xu vàng (trên 4 bục cao + 3 hàng giữa màn hình)
    coins: [
        // Xu trên 4 bục cao
        { x: 128, y: 78 }, { x: 168, y: 78 },
        { x: 238, y: 78 }, { x: 278, y: 78 },
        { x: 600, y: 78 }, { x: 640, y: 78 },
        { x: 710, y: 78 }, { x: 750, y: 78 },

        // Hàng xu trên (ngang tầm ô vuông nhỏ)
        { x: 55, y: 265 }, { x: 152, y: 265 }, { x: 242, y: 265 }, { x: 332, y: 265 },
        { x: 439, y: 265 }, { x: 544, y: 265 }, { x: 634, y: 265 }, { x: 724, y: 265 }, { x: 822, y: 265 },

        // Hàng xu giữa
        { x: 55, y: 325 }, { x: 152, y: 325 }, { x: 242, y: 325 }, { x: 332, y: 325 },
        { x: 439, y: 325 }, { x: 544, y: 325 }, { x: 634, y: 325 }, { x: 724, y: 325 }, { x: 822, y: 325 },

        // Hàng xu thấp (trên sàn lò xo)
        { x: 55, y: 385 }, { x: 152, y: 385 }, { x: 242, y: 385 }, { x: 332, y: 385 },
        { x: 544, y: 385 }, { x: 634, y: 385 }, { x: 724, y: 385 }, { x: 822, y: 385 }
    ],

    // Chìa khóa hiện ngay giữa màn hình sau khi ăn hết xu
    key: { x: 437, y: 285, w: 26, h: 36 },

    // Cửa đích nằm chính giữa đáy màn hình
    door: { x: 424, y: 382, w: 52, h: 68 }
};