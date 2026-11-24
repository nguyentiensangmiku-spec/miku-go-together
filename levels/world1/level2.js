module.exports = {
    id: '1-2',
    name: 'HELLO PICO PARK 1-2',
    width: 2100,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 430, y: 370 },

    // Sàn đất, trần nhà và các bậc thang màu cam
    platforms: [
        { x: 0, y: 0, w: 2100, h: 45 },          // Trần nhà phía trên
        { x: 0, y: 45, w: 30, h: 455 },          // Tường chặn trái
        { x: 30, y: 420, w: 1020, h: 80 },       // Sàn chính khu vực xuất phát
        // Hố ở giữa (từ x: 1050 đến 1120) để tường đẩy bên phải rơi xuống lấp hố
        { x: 1120, y: 310, w: 55, h: 190 },      // Bậc thang cao bên phải hố
        { x: 1175, y: 365, w: 55, h: 135 },      // Bậc thang thấp hơn
        { x: 1230, y: 420, w: 690, h: 80 },      // Sàn phẳng khu vực khối vuông
        { x: 1920, y: 380, w: 180, h: 120 }      // Bục đặt cửa đích
    ],

    // Các khối đẩy đếm số người (tự chia số theo sĩ số phòng 2/4/8 người)
    pushBlocks: [
        {
            id: 'wall_left',
            x: 260,
            y: 45,
            w: 58,
            h: 375,
            minX: 35,
            maxX: 300,
            required: 'THIRD', // ~1/3 phòng (2 người cần 1, 4 người cần 2, 8 người cần 3)
            speed: 2.5
        },
        {
            id: 'wall_right',
            x: 840,
            y: 45,
            w: 62,
            h: 375,
            minX: 780,
            maxX: 1054,
            required: 'ALL',   // Cần cả phòng cùng đẩy
            speed: 2.2,
            pitX: 1050,        // Tới vị trí x >= 1050 sẽ tụt xuống hố thành cầu
            pitStopY: 365
        },
        {
            id: 'box_end',
            x: 1520,
            y: 310,
            w: 110,
            h: 110,
            minX: 1240,
            maxX: 1800,
            required: 'HALF',  // Cần một nửa phòng cùng đẩy
            speed: 2.8
        }
    ],

    // Chìa khóa giấu sau bức tường bên trái
    key: { x: 120, y: 270, w: 26, h: 36 },

    // Cửa đích ở bục cuối bên phải
    door: { x: 1975, y: 312, w: 52, h: 68 }
};