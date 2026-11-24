module.exports = {
    id: '16-2',
    name: 'DANGER PARK (16-2)',
    width: 1960,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 75, y: 406 },

    // Địa hình chuẩn video: Trần xanh -> Tường 2 bên -> Sàn phẳng xuyên suốt
    platforms: [
        { x: 0, y: 0, w: 1960, h: 28 },           // Trần xanh
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 1900, h: 55 },        // Sàn đáy xuyên suốt
        { x: 1930, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Cơ chế World 16 - Màn 2: 2 Lưỡi cưa xanh 2 bên + 2 Khối đẩy [ALL] và [1] đều chặn được lưỡi cưa
    world16: {
        enabled: true,
        mode: 'sawBlock',
        floorY: 445,
        leftWallX: 30,
        rightWallX: 1930,

        // Bục xanh nổi bên phải (đặt khối [1] bên trên để đẩy xuống chắn bánh răng phải)
        floatingPlatform: { x: 1245, y: 305, w: 295, h: 34 },

        // Đủ cả 2 bánh răng xanh: 1 cái trên Cửa đích bên trái & 1 cái bên phải bục nổi
        saws: [
            {
                id: 'saw_left',
                x: 681,
                y: 225,
                r: 46,
                rollSpeed: 470,
                startDir: -1
            },
            {
                id: 'saw_right',
                x: 1765,
                y: 225,
                r: 46,
                rollSpeed: 470,
                startDir: -1
            }
        ],

        // 2 khối đẩy: khối [ALL] chặn bánh răng trái, khối [1] đẩy từ bục xuống chặn bánh răng phải
        blocks: [
            {
                id: 'heavy',
                x: 1080,
                y: 397,
                w: 48,
                h: 48,
                required: 'ALL',
                speed: 3.3
            },
            {
                id: 'light',
                x: 1368,
                y: 257,
                w: 48,
                h: 48,
                required: 1,
                speed: 3.6
            }
        ]
    },

    // Chìa khóa vàng treo đủ cao để đi bộ bên dưới an toàn, nhảy lên mới nhặt
    key: { x: 835, y: 325, w: 26, h: 36 },

    // Cửa đích đặt ngay dưới bánh răng bên trái
    door: { x: 655, y: 377, w: 52, h: 68 }
};