module.exports = {
    id: '7-4',
    name: 'MOVE AND STOP 7-4',
    width: 3200,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 175, y: 390 },

    // Cơ chế riêng của Màn 7-4: Thanh năng lượng chung (di chuyển sẽ tụt, cả phòng đứng im sẽ hồi đầy)
    moveGauge: {
        enabled: true,
        drainRate: 14,   // Tốc độ tụt (% mỗi giây khi có người di chuyển)
        regenRate: 45    // Tốc độ hồi (% mỗi giây khi cả phòng đứng im hoàn toàn)
    },

    // Địa hình: Sàn xuất phát -> 2 trụ cam & Bục nổi -> Lò xo lên vách cao -> Hố chứa Chìa khóa -> Cầu thang đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 140, y: 440, w: 1800, h: 60 },       // Sàn trệt xuyên suốt tới chân vách cao

        // 2 trụ cam và bục nổi trên cao ở khu vực sâu xanh giữa màn
        { x: 920, y: 388, w: 46, h: 52 },         // Trụ cam trái
        { x: 1030, y: 280, w: 410, h: 34 },       // Bục nổi giữa màn (né sâu xanh)
        { x: 1510, y: 388, w: 46, h: 52 },        // Trụ cam phải

        // Vách tường cao bên phải & Hố chứa Chìa khóa
        { x: 1940, y: 255, w: 560, h: 245 },      // Mặt vách cao trái (nơi đặt khối đẩy ALL)
        { x: 2500, y: 410, w: 110, h: 90 },       // Đáy hố chứa Chìa khóa (đón khối trắng rơi xuống)
        { x: 2610, y: 255, w: 190, h: 245 },      // Mặt vách cao phải sau hố

        // Cầu thang 3 bậc đi xuống Cửa đích
        { x: 2800, y: 300, w: 50, h: 200 },
        { x: 2850, y: 345, w: 50, h: 155 },
        { x: 2900, y: 390, w: 50, h: 110 },
        { x: 2950, y: 440, w: 220, h: 60 },       // Sàn đặt Cửa đích
        { x: 3170, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Sóng dung nham nhỏ ở góc trái ngoài cùng
    hazards: [
        { x: 30, y: 465, w: 110, h: 35, type: 'lava' }
    ],

    // 3 con sâu xanh (1 con bò ở sàn đầu + 2 con tuần tra giữa 2 trụ cam dưới bục nổi)
    enemies: [
        {
            id: 'worm_7_4_1',
            x: 860,
            y: 416,
            w: 38,
            h: 24,
            minX: 145,
            maxX: 875,
            speed: -2.2,
            mode: 'loop'
        },
        {
            id: 'worm_7_4_2',
            x: 1120,
            y: 416,
            w: 38,
            h: 24,
            minX: 970,
            maxX: 1468,
            speed: -1.9,
            mode: 'bounce'
        },
        {
            id: 'worm_7_4_3',
            x: 1380,
            y: 416,
            w: 38,
            h: 24,
            minX: 970,
            maxX: 1468,
            speed: -1.9,
            mode: 'bounce'
        }
    ],

    // Lò xo nhỏ đặt trước chân vách cao (bật nhảy lên vách tường cao)
    bouncePads: [
        { x: 1815, y: 424, w: 40, h: 16, force: -16.2 }
    ],

    // Khối đẩy ALL trên vách cao -> đẩy rơi lọt xuống hố tạo cầu đứng nhặt Chìa khóa
    pushBlocks: [
        {
            id: 'pb_7_4',
            x: 2350,
            y: 155,
            w: 96,
            h: 100,
            minX: 2200,
            maxX: 2508,
            required: 'ALL',
            speed: 3.4,
            pushMargin: 165,
            pitX: 2504,
            pitStopY: 310
        }
    ],

    // Chìa khóa lơ lửng trong hố (nhảy lên khối trắng sau khi rơi xuống để lấy)
    key: { x: 2542, y: 270, w: 26, h: 36 },

    // Cửa đích ở góc dưới bên phải sau cầu thang
    door: { x: 3075, y: 372, w: 52, h: 68 }
};