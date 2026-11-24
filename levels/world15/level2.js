module.exports = {
    id: '15-2',
    name: 'FORMATION (15-2)',
    width: 3080,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 75, y: 406 },

    // Địa hình chuẩn video: Sàn xuất phát bên trái -> Hố sóng xanh dài -> Sàn Cửa đích bên phải
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 445, w: 460, h: 55 },         // Sàn xuất phát bên trái

        // Sàn xanh bên phải đặt Cửa đích (khớp sát mép phải bục chở khi lên tới đỉnh)
        { x: 2635, y: 245, w: 415, h: 255 },
        { x: 3050, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Cơ chế riêng của World 15 - Màn 2: Bục chở tốc độ cao + Khối L đỏ có gai nhọn + Cặp trụ đỏ khổng lồ kẹp đôi
    world15: {
        enabled: true,
        mode: 'trackCarrier',
        carrier: {
            w: 320,
            h: 18,
            speed: 4.5                            // Tăng tốc mạnh so với bản cũ (2.3 -> 3.6). Muốn khó hơn nữa tăng lên 4.0 - 4.5
        },
        // Đường ray nét đứt chuẩn video (tọa độ góc trên-trái của bục chở)
        waypoints: [
            { x: 510, y: 428 },                   // 1. Điểm xuất phát
            { x: 1120, y: 428 },                  // 2. Chui qua gầm chân chữ L đỏ khổng lồ
            { x: 1120, y: 158 },                  // 3. Kéo thẳng lên sát mái & gai nhọn chữ L đỏ
            { x: 1470, y: 428 },                  // 4. Trượt chéo nhanh xuống đáy
            { x: 1680, y: 428 },                  // 5. Tiến tới chân trụ đỏ dưới khổng lồ
            { x: 1680, y: 136 },                  // 6. Kéo thẳng lên vượt đỉnh trụ đỏ dưới
            { x: 1965, y: 136 },                  // 7. Trượt ngang lọt vào giữa khe 2 trụ đỏ
            { x: 1965, y: 428 },                  // 8. Hạ thẳng xuyên giữa 2 trụ đỏ lấy Chìa khóa
            { x: 2315, y: 428 },                  // 9. Chui qua dưới trụ đỏ trên tới sát vách đích
            { x: 2315, y: 228 }                   // 10. Kéo thẳng lên sát mép sàn Cửa đích
        ],
        // Các khối tường đỏ to chuẩn video (chạm vào là chơi lại màn)
        redWalls: [
            { x: 1000, y: 0, w: 72, h: 368 },     // Chân dọc chữ L đỏ dày 72px (chừa khe cao 60px trên bục)
            { x: 1000, y: 0, w: 280, h: 72 },     // Mái ngang chữ L đỏ dày 72px
            { x: 2015, y: 162, w: 68, h: 338 },   // Trụ đỏ dưới khổng lồ dày 68px
            { x: 2225, y: 0, w: 68, h: 216 }      // Trụ đỏ trên khổng lồ dày 68px (tạo khe dọc rộng 142px giữa 2 trụ)
        ],
        // Mũi gai đỏ nhọn chĩa xuống ở mép phải mái chữ L đỏ giống video
        redSpikes: [
            { x: 1205, y: 72, w: 62, h: 60 }
        ],
        // Hố sóng xanh nguy hiểm chạy dọc toàn bộ đáy vực
        pitHazard: {
            x: 490,
            y: 474,
            w: 2145,
            h: 26
        }
    },

    // Chìa khóa vàng treo ngay trong khe hẹp giữa 2 trụ đỏ
    key: { x: 2172, y: 260, w: 26, h: 36 },

    // Cửa đích đặt trên sàn xanh bên phải
    door: { x: 2915, y: 177, w: 52, h: 68 }
};