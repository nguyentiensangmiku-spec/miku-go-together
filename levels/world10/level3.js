module.exports = {
    id: '10-3',
    name: 'TWO PLAYERS 10-3 (DARK)',
    width: 900,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 105, y: 416 },

    // Toàn bộ địa hình bị "ẩn đen" lúc chơi và tự bật sáng rực rỡ khi CLEAR!
    platforms: [
        // Khung phòng kín 4 phía
        { x: 0, y: 0, w: 44, h: 500 },            // Tường trái
        { x: 856, y: 0, w: 44, h: 500 },          // Tường phải
        { x: 44, y: 0, w: 812, h: 28 },           // Trần trên
        { x: 44, y: 455, w: 812, h: 45 },         // Sàn đáy

        // Khu vực dưới-trái & giữa: Khối vuông cam (hiện sáng trong đêm) + Bục giữa
        { x: 195, y: 405, w: 48, h: 50 },         // Khối vuông cam điểm tựa
        { x: 270, y: 355, w: 175, h: 100 },       // Bục thấp giữa sàn

        // Tầng trên-trái (chứa Chìa khóa, đồng thời làm trần khu xuất phát)
        { x: 44, y: 205, w: 446, h: 48 },

        // Tầng giữa-phải (chứa Lò xo bật lên cửa đích, chừa khe chui bên dưới)
        { x: 490, y: 305, w: 256, h: 78 },
        { x: 806, y: 382, w: 50, h: 18 },         // Bậc phụ ở vách phải để cả 2 leo lên mượt

        // Bục góc trên-phải đặt Cửa đích (bật lò xo để nhảy lên)
        { x: 696, y: 158, w: 160, h: 28 }
    ],

    // Bàn bật lò xo trên tầng giữa-phải (tự hiện sáng trong bóng tối khi nhặt Chìa khóa)
    bouncePads: [
        { x: 556, y: 291, w: 46, h: 14, force: -14.8 }
    ],

    // Cơ chế riêng của World 10 - Màn 3: Giao diện Ẩn Đen + Tiếp sức 2 người
    darkTwoPlayers: {
        enabled: true,
        spawn: { x: 105, y: 416 },
        // Khối vuông cam duy nhất được chiếu sáng sẵn trong bóng tối (giống video)
        visibleBlock: { x: 195, y: 405, w: 48, h: 50 }
    },

    // Chìa khóa vàng phát sáng ở góc trên bên trái
    key: { x: 145, y: 150, w: 26, h: 36 },

    // Cửa đích ẩn trong bóng tối ở góc trên bên phải
    door: { x: 760, y: 90, w: 52, h: 68 }
};