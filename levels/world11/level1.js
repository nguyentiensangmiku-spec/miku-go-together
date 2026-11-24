module.exports = {
    id: '11-1',
    name: 'HAND GIMMICK 11-1',
    width: 2420,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 110, y: 390 },

    // Địa hình: Sàn xuất phát -> Tường cao có khe hẹp bắn đạn -> Khối cam lấy Chìa khóa -> Hố rộng -> Cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 435, w: 1490, h: 65 },        // Sàn phẳng từ đầu màn đến mép trái hố rộng

        // Bức tường cam lớn chừa khe hẹp ngang (y = 352 -> 384) chỉ vừa cho đạn bay qua
        { x: 820, y: 0, w: 56, h: 352 },          // Thân tường trên
        { x: 820, y: 384, w: 56, h: 51 },         // Chân tường dưới

        // Khối vuông cam lơ lửng bên phải tường (vừa chặn đạn vừa làm bậc nhảy lấy Chìa khóa)
        { x: 1110, y: 332, w: 52, h: 52 },

        // Bờ phải sau hố rộng (hố từ x = 1520 đến x = 1820)
        { x: 1820, y: 435, w: 570, h: 65 },       // Sàn đặt Cửa đích
        { x: 2390, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Cơ chế riêng của World 11 - Màn 1: Súng hút & bắn đồng đội (Phím E)
    handGimmick: {
        enabled: true,
        mode: 'captureGun',
        hintText: 'PRESS E KEY TO SHOOT',
        hintX: 340,
        hintY: 225,
        bulletSpeed: 10.5,
        maxRange: 440
    },

    // Chìa khóa treo ngay phía trên khối vuông cam
    key: { x: 1123, y: 248, w: 26, h: 36 },

    // Cửa đích đặt ở bờ phải sau hố rộng
    door: { x: 2210, y: 367, w: 52, h: 68 }
};