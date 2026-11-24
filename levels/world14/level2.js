module.exports = {
    id: '14-2',
    name: "DON'T TOUCH ME! (14-2)",
    width: 2650,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 75, y: 406 },
    keyRequiresPuzzle: true, // Chìa khóa chỉ hiện khi tất cả cùng đạp đủ N nút đỏ trên sàn băng

    // Địa hình chuẩn video: Sàn xuất phát -> Trụ xanh cao -> (2 sàn băng trơn màu xanh dương) -> Cầu thang 5 bậc lên Cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 880, h: 55 },         // Sàn xuất phát bên trái

        // Trụ tường xanh cao đỡ phần đầu của cầu băng
        { x: 910, y: 220, w: 210, h: 280 },

        // Cầu thang xanh 5 bậc bên phải dẫn lên Cửa đích
        { x: 2015, y: 350, w: 68, h: 150 },
        { x: 2083, y: 300, w: 68, h: 200 },
        { x: 2151, y: 250, w: 68, h: 250 },
        { x: 2219, y: 200, w: 68, h: 300 },
        { x: 2287, y: 150, w: 68, h: 350 },
        { x: 2355, y: 100, w: 265, h: 400 },      // Sàn đỉnh đặt Cửa đích

        { x: 2620, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Thang máy xanh rộng rãi (2 người đứng sát 2 mép đi lên mà không chạm nhau)
    elevators: [
        {
            id: 'elev_14_2',
            x: 750,
            startY: 429,
            endY: 186,
            w: 146,
            h: 16,
            required: 2,
            speed: 2.3
        }
    ],

    // Cơ chế riêng của World 14 - Màn 2: Cấm chạm nhau + Sàn băng trơn + N Nút Đỏ trên cầu băng
    world14: {
        enabled: true,
        mode: 'dontTouch',
        drainRate: 34,                            // Tốc độ tụt thanh hồng khi 2 mèo chạm nhau (%/giây)
        icePlatforms: [
            { x: 910, y: 186, w: 890, h: 34 },    // Cầu băng dài phía trên (chứa hàng nút đỏ)
            { x: 1640, y: 345, w: 320, h: 34 }    // Đảo băng thấp bên phải (chứa Chìa khóa)
        ],
        buttonRightX: 1710,                       // Vị trí nút đỏ ngoài cùng bên phải
        buttonSpacing: 74,                        // Khoảng cách giữa các nút đỏ (đủ rộng không chạm nhau)
        buttonY: 174
    },

    // Chìa khóa vàng xuất hiện phía trên đảo băng thấp khi đạp đủ nút đỏ
    key: { x: 1755, y: 265, w: 26, h: 36 },

    // Cửa đích đặt trên đỉnh cầu thang phải
    door: { x: 2475, y: 32, w: 52, h: 68 }
};