module.exports = {
    id: '4-2',
    name: 'FLY & SCROLL 4-2',
    width: 3600,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',

    // Xuất phát ở đầu màn
    spawn: { x: 100, y: 215 },

    // Bật chế độ bay 4 hướng & khung hình tự động kéo cho riêng màn này
    flyMode: true,
    autoScroll: {
        enabled: true,
        speed: 5.0,      // Tốc độ khung hình tự động kéo sang phải
        delay: 1200      // Chờ 1.2 giây lúc mới vào rồi mới bắt đầu kéo
    },

    // Dải sàn cam ở góc dưới lúc xuất phát (an toàn, giống video)
    platforms: [
        { x: 0, y: 465, w: 520, h: 35 }
    ],

    // Các khối tường đỏ (chạm vào là chơi lại màn)
    hazards: [
        // Đường hầm đỏ 1
        { x: 960, y: 0, w: 500, h: 175, type: 'redWall' },
        { x: 960, y: 325, w: 500, h: 175, type: 'redWall' },

        // Đường hầm đỏ 2 (cuối hầm có khối đẩy)
        { x: 1680, y: 0, w: 500, h: 175, type: 'redWall' },
        { x: 1680, y: 325, w: 500, h: 175, type: 'redWall' },

        // Đoạn cầu thang đỏ đi LÊN (3 bậc)
        { x: 2450, y: 0, w: 100, h: 145, type: 'redWall' },
        { x: 2450, y: 295, w: 100, h: 205, type: 'redWall' },
        { x: 2550, y: 0, w: 100, h: 100, type: 'redWall' },
        { x: 2550, y: 250, w: 100, h: 250, type: 'redWall' },
        { x: 2650, y: 0, w: 100, h: 55, type: 'redWall' },
        { x: 2650, y: 205, w: 100, h: 295, type: 'redWall' },

        // Đoạn cầu thang đỏ đi XUỐNG (3 bậc)
        { x: 2930, y: 0, w: 100, h: 155, type: 'redWall' },
        { x: 2930, y: 305, w: 100, h: 195, type: 'redWall' },
        { x: 3030, y: 0, w: 100, h: 200, type: 'redWall' },
        { x: 3030, y: 350, w: 100, h: 150, type: 'redWall' },
        { x: 3130, y: 0, w: 100, h: 245, type: 'redWall' },
        { x: 3130, y: 395, w: 100, h: 105, type: 'redWall' }
    ],

    // Khối trắng chặn ở cuối đường hầm đỏ 2 (cả phòng cùng đẩy cho rơi xuống mở đường)
    pushBlocks: [
        {
            id: 'pb_4_2',
            x: 2100,
            y: 177,
            w: 66,
            h: 146,
            minX: 2100,
            maxX: 2230,
            required: 'ALL',
            speed: 5.5,
            pitX: 2195,
            pitStopY: 560
        }
    ],

    // Chìa khóa lơ lửng ngay sau khối đẩy
    key: { x: 2310, y: 285, w: 26, h: 36 },

    // Cửa đích lơ lửng ở cuối màn
    door: { x: 3440, y: 210, w: 52, h: 68 }
};