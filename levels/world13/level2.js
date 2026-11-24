module.exports = {
    id: '13-2',
    name: 'HELLO, PICO PARK 2 (13-2)',
    width: 2000,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 120, y: 406 },

    // Địa hình tông Trắng - Xanh lá: Sàn phẳng -> Bục nổi bên trái (chừa khe bên trái để bật lò xo) -> Tường xanh treo -> Khu xếp chồng đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 1940, h: 55 },        // Sàn xanh phẳng xuyên suốt

        // Bục xanh lơ lửng bên trái (chừa khoảng x = 30..110 để nhảy từ nút lò xo lên)
        { x: 110, y: 245, w: 390, h: 36 },

        // Khối tường xanh treo khổng lồ ở giữa (dưới đáy gắn từng gai đỏ tự dập xuống)
        { x: 610, y: 0, w: 720, h: 315 },

        { x: 1970, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Nút lò xo ở sát góc dưới-trái để bật vọt lên bục xanh phía trên
    bouncePads: [
        { x: 36, y: 431, w: 54, h: 14, force: -16.8 }
    ],

    // Cơ chế riêng của World 13 - Màn 2: Đẩy khối [N-1] đội lên đầu đỡ từng gai đỏ tự dập xuống
    world13: {
        enabled: true,
        mode: 'carryBlock',
        autoKeyHeight: true,
        block: {
            x: 405,
            y: 197,
            w: 48,
            h: 48,
            required: 'ALL_MINUS_ONE',            // Phòng 8 người hiện số 7, phòng 2 người hiện số 1
            speed: 3.2
        },
        ceilingSpikes: {
            x: 610,
            y: 315,
            w: 720,
            h: 16,
            spikeWidth: 30,                       // Chia thành 24 gai đỏ riêng lẻ
            fallSpeed: 24                         // Tốc độ dập thẳng xuống cực nhanh
        }
    },

    // Chìa khóa vàng treo cao ở khu vực bên phải (tự chỉnh độ cao theo sĩ số phòng)
    key: { x: 1620, y: 55, w: 26, h: 36 },

    // Cửa đích đặt ở góc dưới bên phải
    door: { x: 1845, y: 377, w: 52, h: 68 }
};