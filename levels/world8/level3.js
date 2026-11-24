module.exports = {
    id: '8-3',
    name: 'RETRO GAME 8-3 (SPEED UP)',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 260, y: 435 },

    // Cơ chế riêng của World 8 - Màn 3: Tetris đồng đội tốc độ cao (SPEED UP)
    tetris: {
        enabled: true,
        targetLines: 10,     // Số hàng cần phá để hiện OK và mở cửa đích
        rows: 15,            // Chiều cao bàn cờ chuẩn
        dropIntervalMs: 360, // Tốc độ gạch tự rơi nhanh gần gấp đôi Màn 8-1 (650ms -> 360ms)
        speedUpBanner: true  // Bật dòng chữ "SPEED UP" lướt ngang khi mới vào màn
    },

    // Hành lang dưới nơi các chú mèo đứng chờ & bước vào cửa khi phá xong 10 hàng
    platforms: [
        { x: 0, y: 373, w: 900, h: 25 },          // Dải phân cách giữa bàn Tetris và hành lang
        { x: 0, y: 474, w: 900, h: 26 },          // Sàn hành lang dưới
        { x: 0, y: 398, w: 28, h: 76 },           // Tường chặn trái hành lang
        { x: 872, y: 398, w: 28, h: 76 }          // Tường chặn phải hành lang
    ],

    // Cửa đích đặt chính giữa hành lang dưới (tự mở khi phá đủ 10 hàng)
    door: { x: 424, y: 406, w: 52, h: 68 }
};