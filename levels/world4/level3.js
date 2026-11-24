module.exports = {
    id: '4-3',
    name: 'GIMMICK GIMMICK 4-3',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',

    // Tọa độ dự phòng (vị trí xuất phát thực tế sẽ tự ghép cạnh từng nút bấm bên dưới)
    spawn: { x: 140, y: 220 },

    // Chìa khóa chỉ hiện ra sau khi cả phòng dừng đồng hồ đạt điều kiện
    keyRequiresPuzzle: true,

    // Cơ chế riêng của màn 4-3: Đồng hồ đếm ngược dừng theo từng nút bấm đỏ
    countdownPuzzle: {
        enabled: true,
        startSeconds: 10.0,       // Mỗi đồng hồ đếm ngược từ 10.00 giây
        targetPerPlayer: 0.5,     // Mốc tổng = 0.50 giây x số người (8 người = 04.00, 4 người = 02.00, 2 người = 01.00)
        slots: [
            // 4 vị trí tầng trên
            { id: 'tm_0', btnX: 215, btnY: 258, boxX: 140, boxY: 120, spawnX: 165, spawnY: 230 },
            { id: 'tm_1', btnX: 365, btnY: 258, boxX: 290, boxY: 120, spawnX: 315, spawnY: 230 },
            { id: 'tm_2', btnX: 515, btnY: 258, boxX: 440, boxY: 120, spawnX: 465, spawnY: 230 },
            { id: 'tm_3', btnX: 665, btnY: 258, boxX: 590, boxY: 120, spawnX: 615, spawnY: 230 },
            // 4 vị trí tầng dưới
            { id: 'tm_4', btnX: 215, btnY: 456, boxX: 140, boxY: 325, spawnX: 165, spawnY: 428 },
            { id: 'tm_5', btnX: 365, btnY: 456, boxX: 290, boxY: 325, spawnX: 315, spawnY: 428 },
            { id: 'tm_6', btnX: 515, btnY: 456, boxX: 440, boxY: 325, spawnX: 465, spawnY: 428 },
            { id: 'tm_7', btnX: 665, btnY: 456, boxX: 590, boxY: 325, spawnX: 615, spawnY: 428 }
        ]
    },

    // Khung tường bao quanh & thanh sàn ngang ở giữa giống hệt video
    platforms: [
        { x: 0, y: 0, w: 24, h: 500 },            // Tường trái
        { x: 876, y: 0, w: 24, h: 500 },          // Tường phải
        { x: 24, y: 468, w: 852, h: 32 },         // Sàn đáy
        { x: 86, y: 270, w: 690, h: 22 }          // Sàn lơ lửng tầng trên
    ],

    // Lò xo nhỏ góc dưới bên trái giống video (giúp tầng dưới nhảy lên tầng trên nếu cần)
    bouncePads: [
        { x: 34, y: 454, w: 32, h: 14, force: -14.2 }
    ],

    // Chìa khóa tự hiện ở khoảng trống bên phải khi dừng đồng hồ thành công
    key: { x: 805, y: 275, w: 26, h: 36 },

    // Cửa đích ở góc dưới bên phải
    door: { x: 810, y: 400, w: 52, h: 68 }
};