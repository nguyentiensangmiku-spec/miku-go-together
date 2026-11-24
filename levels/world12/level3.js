module.exports = {
    id: '12-3',
    name: 'LAST PARK 12-3',
    width: 6800,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 85, y: 120 },

    // Chế độ bay 4 hướng trên ván trượt (Hoverboard) + Khung hình tự động kéo liên tục
    flyMode: true,
    autoScroll: {
        enabled: true,
        speed: 6.0,   // Tốc độ kéo khung hình tự động sang phải (tăng/giảm số này nếu muốn nhanh/chậm hơn)
        delay: 900    // Đợi 0.9 giây lúc mới vào màn rồi bắt đầu kéo
    },

    // Dải sàn cam ở khu vực xuất phát giống đầu video
    platforms: [
        { x: 0, y: 455, w: 680, h: 45 }
    ],

    // 7 cụm chướng ngại vật tường đỏ (chạm vào là chơi lại màn) bố trí đúng thứ tự video
    hazards: [
        // 1. Khối đỏ lớn trên trần -> ép cả phòng bay sát đáy
        { x: 920, y: 0, w: 540, h: 345, type: 'redWall' },

        // 2. Khối đỏ lớn dưới sàn -> ép cả phòng bay sát trần
        { x: 1740, y: 250, w: 540, h: 250, type: 'redWall' },

        // 3. Hành lang giữa 1 (trên + dưới)
        { x: 2560, y: 0, w: 520, h: 205, type: 'redWall' },
        { x: 2560, y: 375, w: 520, h: 125, type: 'redWall' },

        // 4. Bậc thang đỏ đi lên (5 bậc từ dưới lên, ngay sau vị trí Chìa khóa)
        { x: 3380, y: 295, w: 105, h: 205, type: 'redWall' },
        { x: 3485, y: 260, w: 105, h: 240, type: 'redWall' },
        { x: 3590, y: 225, w: 105, h: 275, type: 'redWall' },
        { x: 3695, y: 190, w: 105, h: 310, type: 'redWall' },
        { x: 3800, y: 155, w: 105, h: 345, type: 'redWall' },

        // 5. Hầm bậc thang đỏ đi xuống (5 bậc trên trần + khối đỏ chắn đáy)
        { x: 4160, y: 0, w: 105, h: 115, type: 'redWall' },
        { x: 4265, y: 0, w: 105, h: 155, type: 'redWall' },
        { x: 4370, y: 0, w: 105, h: 195, type: 'redWall' },
        { x: 4475, y: 0, w: 105, h: 235, type: 'redWall' },
        { x: 4580, y: 0, w: 105, h: 275, type: 'redWall' },
        { x: 4240, y: 405, w: 445, h: 95, type: 'redWall' },

        // 6. Khối đỏ lớn dưới sàn thứ 2 -> ép cả phòng bay vọt lên sát trần
        { x: 4950, y: 175, w: 520, h: 325, type: 'redWall' },

        // 7. Hành lang giữa 2 ngay trước Cửa đích
        { x: 5730, y: 0, w: 500, h: 220, type: 'redWall' },
        { x: 5730, y: 380, w: 500, h: 120, type: 'redWall' }
    ],

    // Cờ báo cho server_world12.js xếp các chú mèo thành 2 hàng dọc bên trái giống video
    lastPark: {
        enabled: true,
        mode: 'flyScroll'
    },

    // Chìa khóa treo cao ở khoảng trống giữa Hành lang 1 và Bậc thang đi lên
    key: { x: 3270, y: 105, w: 26, h: 36 },

    // Cửa đích lơ lửng ngay sau Hành lang giữa 2
    door: { x: 6470, y: 195, w: 52, h: 68 }
};