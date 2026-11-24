module.exports = {
    id: '12-2',
    name: 'LAST PARK 12-2',
    width: 1960,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 230, y: 396 },

    // Địa hình: Cửa đích góc trái -> Sàn dài đặt Quạt 1 & Lò xo -> Trụ cam hẹp giữa vực -> Bục nổi đặt Quạt 2
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 435, w: 1370, h: 65 },        // Sàn chính dài từ Cửa đích tới mép vực
        { x: 1520, y: 435, w: 62, h: 65 },        // Trụ cam hẹp đứng giữa vực sâu
        { x: 1755, y: 378, w: 130, h: 18 },       // Bục nổi bên phải đặt Quạt Gió 2
        { x: 1930, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Bàn bật lò xo ở sát mép vực bên phải sàn chính (bật sang trụ hẹp)
    bouncePads: [
        { x: 1354, y: 421, w: 46, h: 14, force: -14.5 }
    ],

    // Cơ chế riêng của World 12 - Màn 2: 2 Quạt Gió thổi ngược & Chìa khóa tự canh độ cao theo sĩ số
    lastPark: {
        enabled: true,
        mode: 'windFans',
        autoKeyHeight: true,
        fans: [
            // Quạt 1 đặt trên sàn chính, thổi gió sang trái
            {
                id: 'fan1',
                x: 760,
                y: 377,
                w: 42,
                h: 58,
                dir: -1,
                range: 360,
                topY: 315,
                bottomY: 435,
                force: 1.9
            },
            // Quạt 2 đặt trên bục nổi bên phải, thổi gió sang trái ngang khu vực xếp chồng trên trụ hẹp
            {
                id: 'fan2',
                x: 1795,
                y: 320,
                w: 42,
                h: 58,
                dir: -1,
                range: 430,
                topY: 110,
                bottomY: 435,
                force: 1.55
            }
        ]
    },

    // Chìa khóa treo cao ngay phía trên trụ cam hẹp (tự chỉnh y theo số người chơi trong phòng)
    key: { x: 1538, y: 55, w: 26, h: 36 },

    // Cửa đích đặt ngay góc dưới bên trái
    door: { x: 78, y: 367, w: 52, h: 68 }
};