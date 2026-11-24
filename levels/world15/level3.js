module.exports = {
    id: '15-3',
    name: 'FORMATION (15-3)',
    width: 3150,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 260, y: 406 },

    // Địa hình chuẩn video: Bục trái nhỏ -> Khe sóng -> Sàn xuất phát (có Nút Đỏ) -> Khối xanh lớn giữa map -> Sàn Cửa đích phải
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 120, h: 55 },         // Bục nhỏ góc trái
        { x: 230, y: 445, w: 540, h: 55 },        // Sàn xuất phát chính

        // Khối tường xanh khổng lồ ở giữa bản đồ (cả đội ghép ngang lướt qua phía trên nóc)
        { x: 1510, y: 175, w: 460, h: 270 },

        // Sàn đích bên phải đặt Cửa đích
        { x: 2620, y: 445, w: 500, h: 55 },
        { x: 3120, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Cơ chế riêng của World 15 - Màn 3: Kỹ năng Ghép Đội Hình (E / Shift) + Nút Đỏ kích hoạt bục nhỏ chạy đường ray
    world15: {
        enabled: true,
        mode: 'skillFormation',
        startButton: { x: 715, y: 433, w: 36, h: 12 },
        carrier: {
            w: 112,
            h: 16,
            speed: 6.5
        },
        // Đường ray nét đứt chuẩn video (tọa độ góc trên-trái của bục xanh nhỏ)
        waypoints: [
            { x: 800, y: 428 },                   // 1. Điểm chờ ngay mép phải sàn xuất phát
            { x: 1320, y: 428 },                  // 2. Luồn sát dưới đáy khối tường đỏ khổng lồ
            { x: 1320, y: 175 },                  // 3. Kéo thẳng lên ngang nóc khối xanh giữa map
            { x: 2050, y: 175 },                  // 4. Lướt ngang qua khối xanh lớn
            { x: 2050, y: 428 },                  // 5. Hạ thẳng xuống đáy trước trụ đỏ đứng
            { x: 2505, y: 428 }                   // 6. Luồn qua dưới trụ đỏ đứng cập bến sàn Cửa đích
        ],
        // 2 chướng ngại vật tường đỏ khổng lồ chuẩn video
        redWalls: [
            { x: 1020, y: 0, w: 230, h: 356 },    // Khối tường đỏ khổng lồ chặng 1 (chừa khe cao 72px trên bục)
            { x: 2285, y: 0, w: 56, h: 356 }      // Trụ đỏ đứng chặng 3 (chừa khe cao 72px trên bục)
        ],
        // Hố sóng xanh nguy hiểm chạy dọc các khoảng trống đáy vực
        pitHazards: [
            { x: 150, y: 474, w: 80, h: 26 },
            { x: 770, y: 474, w: 1850, h: 26 }
        ]
    },

    // Chìa khóa vàng treo ngay sau gầm khối tường đỏ chặng 1
    key: { x: 1365, y: 345, w: 26, h: 36 },

    // Cửa đích đặt ở góc cuối sàn bên phải
    door: { x: 2980, y: 377, w: 52, h: 68 }
};