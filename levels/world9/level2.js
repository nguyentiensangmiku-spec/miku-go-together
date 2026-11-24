module.exports = {
    id: '9-2',
    name: 'BALL PARK 9-2',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 320, y: 425 },

    // Chìa khóa chỉ hiện ra sau khi bóng lăn đè trúng nút đỏ trong khung cam
    keyRequiresPuzzle: true,

    // Cơ chế riêng của World 9 - Màn 2: Cân bập bênh điều khiển độ nghiêng 3 thanh lăn bóng
    tiltMaze: {
        enabled: true,
        box: { leftX: 154, rightX: 746, topY: 0, bottomY: 310 },
        spawner: { x: 280, y: 36 },
        ballRadius: 10,
        maxAngle: 0.14, // Độ nghiêng tối đa (~8 độ) để bóng lăn vừa tay, không quá nhanh
        button: { x: 605, y: 298, w: 42, h: 12 },

        // 2 đĩa cân Trái & Phải phía dưới (mèo nhảy đứng lên để nghiêng 3 thanh)
        leftScale: { x: 56, y: 412, baseY: 412, w: 132, h: 14 },
        rightScale: { x: 712, y: 412, baseY: 412, w: 132, h: 14 },

        // 3 thanh ngang xếp zíc-zắc bên trong khung cam
        planks: [
            { cx: 430, cy: 104, w: 420, h: 14 }, // Thanh 1 (trên cùng - hở phải)
            { cx: 512, cy: 176, w: 365, h: 14 }, // Thanh 2 (ở giữa - hở trái)
            { cx: 392, cy: 248, w: 345, h: 14 }  // Thanh 3 (dưới cùng - hở phải đổ vào nút đỏ)
        ]
    },

    // Khung tường ngoài, khung hộp chứa bóng & 2 bậc thang nhỏ cạnh bàn cân
    platforms: [
        { x: 0, y: 0, w: 24, h: 500 },            // Tường chặn trái
        { x: 876, y: 0, w: 24, h: 500 },          // Tường chặn phải
        { x: 24, y: 468, w: 852, h: 32 },         // Sàn đáy

        // Khung cam lớn ở giữa phía trên (nhốt quả bóng & 3 thanh nghiêng)
        { x: 130, y: 0, w: 24, h: 334 },          // Thành trái khung bóng
        { x: 746, y: 0, w: 24, h: 334 },          // Thành phải khung bóng
        { x: 130, y: 310, w: 640, h: 24 },        // Đáy khung bóng

        // Bậc thang nhỏ 2 cấp bên trái (giúp nhảy lên bàn cân trái)
        { x: 196, y: 434, w: 30, h: 34 },
        { x: 226, y: 451, w: 22, h: 17 },

        // Bậc thang nhỏ 2 cấp bên phải (giúp nhảy lên bàn cân phải)
        { x: 674, y: 434, w: 30, h: 34 },
        { x: 652, y: 451, w: 22, h: 17 }
    ],

    // Chìa khóa tự hiện ngay phía trên cửa đích khi bóng đè nút đỏ
    key: { x: 437, y: 356, w: 26, h: 36 },

    // Cửa đích đặt chính giữa đáy màn hình
    door: { x: 424, y: 400, w: 52, h: 68 }
};