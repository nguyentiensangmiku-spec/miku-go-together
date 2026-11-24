module.exports = {
    id: '3-2',
    name: 'TIME LIMIT 3-2',
    width: 2700,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 140, y: 385 },

    // Thời gian khởi đầu (10 giây để phòng 2 người vẫn kịp chạy; muốn khó như 8 người thì sửa thành 5)
    timeLimit: 10,

    // Địa hình: Khu nút bấm bên trái -> Các bục giữa -> Hành lang cụt chứa Chìa khóa -> Cửa đích
    platforms: [
        { x: 0, y: 0, w: 2700, h: 30 },            // Trần trên
        { x: 0, y: 30, w: 30, h: 470 },            // Tường chặn trái
        { x: 2670, y: 30, w: 30, h: 470 },         // Tường chặn phải
        { x: 30, y: 440, w: 2640, h: 60 },         // Sàn trệt xuyên suốt tới cửa đích

        // 2 bậc nhỏ sát tường trái giúp leo lên nóc chữ C lấy 6 nút đỏ
        { x: 40, y: 350, w: 65, h: 20 },
        { x: 40, y: 260, w: 65, h: 20 },

        // Khối chữ C bên trái
        { x: 135, y: 185, w: 290, h: 35 },         // Nóc chữ C (đặt 6 nút đỏ)
        { x: 135, y: 220, w: 35, h: 75 },          // Cạnh dọc chữ C
        { x: 135, y: 295, w: 210, h: 35 },         // Đáy chữ C

        // Bục chữ L ở giữa-trái
        { x: 470, y: 335, w: 40, h: 105 },
        { x: 470, y: 335, w: 190, h: 35 },

        // Bục chữ L phía trên-phải của khu vực 1
        { x: 700, y: 240, w: 210, h: 35 },
        { x: 875, y: 150, w: 35, h: 90 },

        // Bục bước vào hành lang giữa
        { x: 940, y: 345, w: 120, h: 30 },

        // Hành lang cụt ở giữa (Bịt kín đầu bên phải, bên dưới thông thoáng để chạy về đích)
        { x: 1110, y: 150, w: 1210, h: 35 },       // Trần hành lang
        { x: 1110, y: 320, w: 1210, h: 40 },       // Sàn hành lang (chứa Chìa khóa & nút cộng giờ)
        { x: 2280, y: 150, w: 40, h: 210 }         // Tường bịt kín đầu phải của hành lang
    ],

    // Hệ thống nút đỏ cộng thêm thời gian (dẫm 1 lần để cộng giây)
    buttons: [
        // 6 nút đỏ liên tiếp trên nóc chữ C bên trái (+2 giây mỗi nút)
        { id: 'tbtn_1', x: 175, y: 173, w: 28, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_2', x: 215, y: 173, w: 28, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_3', x: 255, y: 173, w: 28, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_4', x: 295, y: 173, w: 28, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_5', x: 335, y: 173, w: 28, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_6', x: 375, y: 173, w: 28, h: 12, addTime: 2, oneTime: true },

        // Các nút đỏ rải rác khu vực đầu
        { id: 'tbtn_7', x: 230, y: 428, w: 34, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_8', x: 585, y: 323, w: 34, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_9', x: 745, y: 228, w: 34, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_10', x: 980, y: 333, w: 34, h: 12, addTime: 2, oneTime: true },

        // 2 nút đỏ trên nóc hành lang
        { id: 'tbtn_11', x: 1280, y: 138, w: 34, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_12', x: 1580, y: 138, w: 34, h: 12, addTime: 2, oneTime: true },

        // 5 nút đỏ bên trong cuối hành lang cụt (gần chìa khóa)
        { id: 'tbtn_13', x: 2010, y: 308, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_14', x: 2052, y: 308, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_15', x: 2094, y: 308, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_16', x: 2136, y: 308, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'tbtn_17', x: 2178, y: 308, w: 30, h: 12, addTime: 2, oneTime: true }
    ],

    // Chìa khóa nằm bên trong hành lang giữa
    key: { x: 1850, y: 245, w: 26, h: 36 },

    // Cửa đích ở góc dưới cùng bên phải
    door: { x: 2510, y: 372, w: 52, h: 68 }
};