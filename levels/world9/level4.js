module.exports = {
    id: '9-4',
    name: 'BALL PARK 9-4',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 220, y: 419 },

    // Chìa khóa nằm trong hũ bên trái, chỉ nhặt được sau khi tâng bóng đập vỡ hũ
    keyRequiresPuzzle: true,

    // Cơ chế riêng của World 9 - Màn 4: Tâng bóng chuyền tay đập vỡ hũ chìa khóa
    ballVolley: {
        enabled: true,
        floorY: 458,
        ceilingY: 28,
        leftWallX: 26,
        rightWallX: 874,
        ballRadius: 10,
        gravity: 0.22,                                // Trọng lực nhẹ giúp bóng bay vòng cung dễ tâng
        fireVx: -4.2,                                 // Lực bắn sang trái của đại bác
        fireVy: -0.8,
        reloadMs: 1200,                               // Thời gian đại bác nạp bóng mới khi bóng rơi sàn
        warningMs: 400,                               // Thời gian đại bác nháy báo hiệu trước khi bắn
        target: { x: 28, y: 400, w: 48, h: 58 },      // Hũ nhốt chìa khóa ở góc dưới bên trái
        cannon: { x: 794, y: 300, w: 56, h: 44 },     // Đại bác đặt trên gờ cao bên phải
        ledge:  { x: 786, y: 344, w: 88, h: 22 }      // Gờ tường đỡ đại bác (phía trên cửa đích)
    },

    // Khung phòng kín & gờ đỡ đại bác phía trên cửa đích
    platforms: [
        { x: 0, y: 0, w: 900, h: 28 },                // Trần trên
        { x: 0, y: 28, w: 26, h: 472 },               // Tường chặn trái
        { x: 874, y: 28, w: 26, h: 472 },             // Tường chặn phải
        { x: 26, y: 458, w: 848, h: 42 },             // Sàn đáy phẳng xuyên suốt
        { x: 786, y: 344, w: 88, h: 22 }              // Gờ tường bên phải đặt khẩu đại bác
    ],

    // Chìa khóa nằm bên trong hũ góc dưới bên trái
    key: { x: 39, y: 414, w: 26, h: 36 },

    // Cửa đích đặt ngay dưới gờ đại bác ở góc dưới bên phải
    door: { x: 794, y: 390, w: 52, h: 68 }
};