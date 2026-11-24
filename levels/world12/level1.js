module.exports = {
    id: '12-1',
    name: 'LAST PARK 12-1',
    width: 1360,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 245, y: 390 },

    // Địa hình: Sàn thấp bên trái (có Nút Đỏ) -> Tầng cao bên phải (đặt khối [1], bục nâng & Cửa đích)
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường trái (nguồn bắn 2 tia Laser ngang)
        { x: 30, y: 430, w: 730, h: 70 },         // Sàn thấp bên trái
        { x: 760, y: 355, w: 570, h: 145 },       // Tầng cao bên phải
        { x: 1330, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Cơ chế riêng của World 12 - Màn 1: 2 Laser ngang + Khiên dọc trái + Khối [1] + Nút Đỏ nâng bục
    lastPark: {
        enabled: true,
        mode: 'laserShield',
        shieldPlayerIndex: 0,                     // Người chơi đầu tiên cầm khiên dọc bên trái
        lasers: [
            { x: 30, y: 338, maxLen: 1300 },      // Tia Laser dưới (chắn ngang tầng cao bên phải)
            { x: 30, y: 222, maxLen: 1300 }       // Tia Laser trên (chắn ngay dưới Chìa khóa)
        ],
        button: { x: 125, y: 418, w: 36, h: 12 }, // Nút Đỏ góc dưới trái
        risingStep: {                             // Bục cam nhỏ nâng lên dưới Chìa khóa khi bấm Nút Đỏ
            x: 925,
            y: 355,
            startY: 355,
            upY: 315,
            w: 54,
            h: 40,
            speed: 3.5
        },
        block: {                                  // Khối trắng [1] đẩy rơi được từ tầng trên xuống sàn dưới
            x: 772,
            y: 307,
            w: 48,
            h: 48,
            speed: 3.2
        }
    },

    // Chìa khóa treo trên cao phía trên tia Laser trên
    key: { x: 939, y: 142, w: 26, h: 36 },

    // Cửa đích đặt ở cuối tầng cao bên phải
    door: { x: 1235, y: 287, w: 52, h: 68 }
};