module.exports = {
    id: '16-1',
    name: 'DANGER PARK (16-1)',
    width: 1880,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 75, y: 406 },

    // Địa hình chuẩn video: Trần xanh -> Sàn đáy xuyên suốt -> Bậc bước nhỏ -> Phòng bẫy trên cao (chừa hầm dưới) -> Phòng Cửa đích phải
    platforms: [
        { x: 0, y: 0, w: 1880, h: 28 },           // Trần xanh chạy suốt đỉnh màn hình
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 1820, h: 55 },        // Sàn đáy xuyên suốt sang tận Cửa đích

        // Bậc xanh nhỏ trước cửa hầm (dùng để nhảy lên phòng bẫy trên cao, vẫn chừa khe 72px rơi xuống hầm)
        { x: 660, y: 398, w: 44, h: 47 },

        // Sàn phòng bẫy trên cao (y = 350..386 -> chừa đường hầm cao 59px bên dưới từ y = 386..445)
        { x: 776, y: 350, w: 682, h: 36 },

        // Vách tường xanh bịt kín bên phải phòng bẫy (chỉ mở lối đi qua đường hầm ở bên dưới)
        { x: 1412, y: 28, w: 46, h: 358 },

        { x: 1850, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Cơ chế riêng của World 16 - Màn 1: 4 Cột xanh sập xuống đỡ bằng đầu + Đường sóng xanh hạ dần khi lấy Chìa khóa
    world16: {
        enabled: true,
        mode: 'dangerPillars',
        ceilingY: 28,
        chamberFloorY: 350,
        chamberLeftX: 776,
        chamberRightX: 1412,
        pillarStartBottomY: 256,                  // Vị trí đáy cột ban đầu (chừa khe rộng 94px để đi qua dễ dàng)
        pillarDropSpeed: 10.8,                     // Tốc độ sập xuống ngay khi nhặt Chìa khóa
        pillarPositions: [
            { x: 796, w: 44 },                    // Cột 1
            { x: 906, w: 44 },                    // Cột 2
            { x: 1016, w: 44 },                   // Cột 3
            { x: 1126, w: 44 }                    // Cột 4
        ],
        wavyStartY: 38,                           // Đường sóng xanh chờ sát trần
        wavyMaxY: 326,                            // Hạ xuống sát sàn phòng trên (không đâm xuống hầm dưới)
        wavySpeed: 0.76                           // Tốc độ hạ dần giống nhịp video
    },

    // Chìa khóa vàng treo ở góc phải phòng trên (server tự canh độ cao theo sĩ số phòng)
    key: { x: 1345, y: 150, w: 26, h: 36 },

    // Cửa đích đặt trong phòng cuối bên phải
    door: { x: 1715, y: 377, w: 52, h: 68 }
};
