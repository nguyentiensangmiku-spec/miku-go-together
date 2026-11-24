module.exports = {
    id: '8-1',
    name: 'RETRO GAME 8-1',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 260, y: 435 },

    // Cơ chế riêng của World 8 - Màn 1: Xếp gạch Tetris đồng đội
    tetris: {
        enabled: true,
        targetLines: 10,     // Số hàng cần phá để hiện OK và mở cửa đích (giống video)
        rows: 15,            // Chiều cao bàn cờ (2 hàng trên cùng là khe thả gạch)
        dropIntervalMs: 650  // Tốc độ gạch tự rơi (ms)
    },

    // Hành lang dưới nơi các chú mèo đứng chờ & đi vào cửa khi hoàn thành Tetris
    platforms: [
        { x: 0, y: 373, w: 900, h: 25 },          // Dải phân cách giữa bàn Tetris và hành lang
        { x: 0, y: 474, w: 900, h: 26 },          // Sàn hành lang dưới
        { x: 0, y: 398, w: 28, h: 76 },           // Tường chặn trái hành lang
        { x: 872, y: 398, w: 28, h: 76 }          // Tường chặn phải hành lang
    ],

    // Cửa đích đặt chính giữa hành lang dưới (tự mở khi phá đủ 10 hàng)
    door: { x: 424, y: 406, w: 52, h: 68 }
};