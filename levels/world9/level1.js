module.exports = {
    id: '9-1',
    name: 'BALL PARK 9-1',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 150, y: 415 },

    // Chìa khóa nằm trong hũ bên trái, chỉ nhặt được sau khi bóng đập vỡ hũ 3 lần
    keyRequiresPuzzle: true,

    // Cơ chế riêng của World 9 - Màn 1: Đại bác bắn bóng cam & Hũ nhốt chìa khóa
    ballPark: {
        enabled: true,
        floorY: 454,
        ballRadius: 11,
        maxHits: 3,                   // Cần 3 quả bóng chạm hũ để vỡ (giống video)
        speeds: [6.8, 9.6, 12.6],     // Tốc độ tăng dần sau mỗi lần bóng đập trúng hũ
        reloadMs: 1500,               // Thời gian đại bác nạp lại bóng (ms)
        warningMs: 450,               // Thời gian đại bác nháy báo hiệu trước khi bắn (ms)
        target: { x: 16, y: 396, w: 56, h: 58 }, // Hũ nhốt chìa khóa ở hốc trái
        cannon: { x: 828, y: 396, w: 56, h: 58 } // Đại bác ở hốc phải
    },

    // Khung phòng kín giống hệt video (chừa 2 hốc nhỏ ở góc dưới trái & phải)
    platforms: [
        { x: 0, y: 0, w: 900, h: 28 },            // Trần trên
        { x: 0, y: 454, w: 900, h: 46 },          // Sàn đáy phẳng xuyên suốt

        { x: 0, y: 28, w: 72, h: 368 },           // Tường trái phía trên hốc chìa khóa
        { x: 0, y: 396, w: 16, h: 58 },           // Viền tường ngoài cùng bên trái

        { x: 828, y: 28, w: 72, h: 368 },         // Tường phải phía trên hốc đại bác
        { x: 884, y: 396, w: 16, h: 58 }          // Viền tường ngoài cùng bên phải
    ],

    // Chìa khóa nằm bên trong hốc trái (vỡ hũ sẽ đi vào lấy được)
    key: { x: 34, y: 412, w: 26, h: 36 },

    // Cửa đích đặt gần góc dưới bên phải (trước hốc đại bác)
    door: { x: 718, y: 386, w: 52, h: 68 }
};