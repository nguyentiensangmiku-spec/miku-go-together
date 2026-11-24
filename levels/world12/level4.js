module.exports = {
    id: '12-4',
    name: 'LAST PARK 12-4',
    width: 4800,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 80, y: 400 },

    // Khung hình tự động kéo liên tục sang phải, không đợi người chơi
    autoScroll: {
        enabled: true,
        speed: 6.2,
        delay: 1100
    },

    // Địa hình tĩnh chuẩn video: Sàn đầu -> Cầu thang 3 bậc -> Sàn thấp -> Đường chạy THANK YOU -> 2 khối rời -> Sàn đích
    platforms: [
        { x: 0, y: 0, w: 28, h: 500 },            // Tường chặn trái
        { x: 28, y: 440, w: 612, h: 60 },         // Sàn xuất phát

        // Sau hố dung nham 1 (640 -> 760): Sàn ngắn + Cầu thang 3 bậc lên vách cao
        { x: 760, y: 440, w: 220, h: 60 },
        { x: 980, y: 385, w: 200, h: 115 },       // Bậc 1
        { x: 1180, y: 330, w: 200, h: 170 },      // Bậc 2
        { x: 1380, y: 265, w: 240, h: 235 },      // Bậc 3 (Vách cao)

        // Sau hố dung nham 2 (1620 -> 1790): Sàn thấp đặt Nút Đỏ nối cầu & Lò xo
        { x: 1790, y: 440, w: 530, h: 60 },

        // Đường chạy trên cao (đặt Chìa khóa, chữ THANK YOU & 2 sâu xanh)
        { x: 2430, y: 335, w: 1200, h: 42 },

        // 2 khối vuông cam rời lơ lửng trên biển dung nham
        { x: 3725, y: 335, w: 62, h: 42 },
        { x: 3875, y: 335, w: 62, h: 42 },

        // Sàn đích cuối cùng (đặt bẫy DON'T PUSH! & Cửa đích)
        { x: 4025, y: 335, w: 745, h: 42 },
        { x: 4770, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Bàn bật Lò xo ở mép phải sàn thấp để nhảy lên đường chạy trên cao
    bouncePads: [
        { x: 2245, y: 424, w: 46, h: 16, force: -15.8 }
    ],

    // 2 con sâu xanh bò ngược chiều trên đường chạy THANK YOU
    enemies: [
        { id: 'worm12_1', x: 3060, y: 311, w: 38, h: 24, minX: 2435, maxX: 3590, speed: -3.2, mode: 'loop' },
        { id: 'worm12_2', x: 3420, y: 311, w: 38, h: 24, minX: 2435, maxX: 3590, speed: -3.2, mode: 'loop' }
    ],

    // Các bẫy cố định: Hố dung nham 1, Biển dung nham dài dưới đường chạy cao & Nút bẫy DON'T PUSH!
    hazards: [
        { x: 640, y: 468, w: 120, h: 32, type: 'lava' },
        { x: 2320, y: 472, w: 2450, h: 28, type: 'lava' },
        { x: 4285, y: 323, w: 36, h: 12, type: 'dontPush' }
    ],

    // Cơ chế riêng của World 12 - Màn 4: Nút đỏ trượt cầu che hố dung nham 2 & Chữ nền THANK YOU
    lastPark: {
        enabled: true,
        mode: 'finalRun',
        bridgeButton: { x: 2175, y: 428, w: 36, h: 12 },
        bridge: { x: 1620, y: 440, w: 170, h: 60, speed: 14 },
        gap2Lava: { x: 1620, y: 468, w: 170, h: 32 },
        thankYouText: { text: 'THANK YOU', x: 3110, y: 175 }
    },

    // Chìa khóa đặt đầu đường chạy trên cao
    key: { x: 2650, y: 242, w: 26, h: 36 },

    // Cửa đích đặt cuối sàn phải (sau nút DON'T PUSH!)
    door: { x: 4585, y: 267, w: 52, h: 68 }
};