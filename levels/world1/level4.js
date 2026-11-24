module.exports = {
    id: '1-4',
    name: 'HELLO PICO PARK 1-4',
    width: 2400,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 80, y: 370 },

    // Các khối đất & tường đứng yên
    platforms: [
        { x: 0, y: 0, w: 2400, h: 40 },          // Trần nhà xuyên suốt
        { x: 0, y: 40, w: 30, h: 460 },          // Tường chặn trái
        { x: 0, y: 430, w: 2400, h: 70 },        // Sàn trệt xuyên suốt toàn màn

        { x: 340, y: 275, w: 380, h: 40 },       // Sàn tầng trên bên trái
        { x: 920, y: 40, w: 35, h: 185 },        // Tường treo tạo khe 1 người chui qua
        { x: 920, y: 275, w: 700, h: 40 },       // Sàn tầng trên bên phải (đặt chìa khóa)

        // Cầu thang đi xuống khu vực thang máy cuối
        { x: 1620, y: 325, w: 65, h: 105 },
        { x: 1685, y: 378, w: 65, h: 52 },

        // Bục cao đặt cửa đích & tường chặn phải
        { x: 2060, y: 255, w: 340, h: 175 },
        { x: 2370, y: 40, w: 30, h: 460 }
    ],

    // 2 thanh di động tự động liên tục (giống hệt video)
    movingPlatforms: [
        {
            id: 'lift_left',
            x: 160,
            y: 390,
            w: 130,
            h: 18,
            minX: 160,
            maxX: 160,
            minY: 275,       // Lên ngang mặt tầng 2
            maxY: 405,       // Xuống sát mặt đất
            speedX: 0,
            speedY: -1.6     // Di chuyển lên - xuống liên tục
        },
        {
            id: 'sweeper_top',
            x: 520,
            y: 40,
            w: 32,
            h: 235,
            minX: 350,       // Quét sang trái tới mép tầng 2
            maxX: 880,       // Quét sang phải qua khu vực thang máy
            minY: 40,
            maxY: 40,
            speedX: 1.8,     // Di chuyển trái - phải liên tục
            speedY: 0
        }
    ],

    // 2 thang máy đếm số người
    elevators: [
        {
            id: 'elev_1_4_down',
            x: 720,
            y: 275,
            startY: 275,
            endY: 410,
            w: 200,
            h: 18,
            required: 'MOST',
            speed: 2.4
        },
        {
            id: 'elev_1_4_up',
            x: 1860,
            y: 408,
            startY: 408,
            endY: 255,
            w: 180,
            h: 18,
            required: 'QUARTER',
            speed: 2.4
        }
    ],

    key: { x: 1060, y: 225, w: 26, h: 36 },
    door: { x: 2260, y: 187, w: 52, h: 68 }
};