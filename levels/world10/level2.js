module.exports = {
    id: '10-2',
    name: 'TWO PLAYERS 10-2',
    width: 3000,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 110, y: 385 },

    // Địa hình tĩnh xuyên suốt 4 chặng của Màn 10-2
    platforms: [
        // --- CHẶNG 1: Sàn xuất phát & Vách tường cam cao ---
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 430, w: 390, h: 70 },         // Sàn đầu Chặng 1
        { x: 420, y: 285, w: 460, h: 215 },       // Vách tường cao (chênh 145px -> cần chồng đầu nhảy lên)

        // --- CHẶNG 2: Vực rộng (880 -> 1155) & Trần treo lớn trên sàn phải ---
        { x: 1170, y: 0, w: 270, h: 245 },        // Khối trần cam lớn treo lơ lửng giống video

        // --- CHẶNG 2 -> 3 -> 4: Sàn trệt dài xuyên suốt tới Cửa đích ---
        { x: 1155, y: 430, w: 1815, h: 70 },      // Sàn phẳng từ điểm đáp Chặng 2 qua Chặng 3 & Chặng 4
        { x: 1620, y: 275, w: 56, h: 52 },        // Khối vuông cam lơ lửng ở Chặng 3 (dùng lò xo bật lên)
        { x: 2970, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Bàn bật lò xo ở Chặng 3 (đặt giữa khối vuông lơ lửng và cột cổng cao)
    bouncePads: [
        { x: 1735, y: 416, w: 46, h: 14, force: -15.2 }
    ],

    // Cơ chế riêng của World 10 - Màn 2 (Độc lập hoàn toàn với 10-1)
    twoPlayers2: {
        enabled: true,
        spawn: { x: 110, y: 385 },

        // 3 nút đỏ chuyển chặng (mỗi lần bấm sẽ mở công trình hỗ trợ đồng đội & đổi cặp chơi)
        buttons: [
            { id: 'btn1', stage: 0, x: 585,  y: 273, w: 36, h: 12, respawnX: 540,  respawnY: 240 }, // Đỉnh vách Chặng 1 -> nhô bậc thềm
            { id: 'btn2', stage: 1, x: 1255, y: 418, w: 36, h: 12, respawnX: 1210, respawnY: 385 }, // Dưới trần Chặng 2 -> nối cầu qua vực
            { id: 'btn3', stage: 2, x: 1965, y: 418, w: 36, h: 12, respawnX: 2050, respawnY: 385 }  // Sau cổng Chặng 3 -> kéo mở cổng cao
        ],

        // Chặng 1: Bậc thềm nhỏ nhô ra bên thành trái vách cao khi bấm btn1
        ledge1: { x: 350, y: 355, w: 70, h: 24 },

        // Chặng 2: Cầu sàn phẳng nối kín vực rộng khi bấm btn2
        bridge2: { x: 880, y: 430, w: 275, h: 70 },

        // Chặng 3: Cột cổng dọc màu cam chặn đường -> kéo nâng lên khi bấm btn3
        gate3: { x: 1835, y: 185, closedY: 185, openY: 85, w: 46, h: 245, speed: 6 },

        // Chặng 4: Hai thang máy ký hiệu (↑ lên bậc, △ an toàn, × tụt xuống đáy, - chờ đồng đội)
        elevators: [
            { id: 'el_left',  x: 2290, w: 120, h: 18, tiersY: [382, 318, 254, 190] },
            { id: 'el_right', x: 2560, w: 120, h: 18, tiersY: [382, 318, 254, 190] }
        ]
    },

    // Chìa khóa treo cao chính giữa hai thang máy ở Chặng 4
    key: { x: 2472, y: 98, w: 26, h: 36 },

    // Cửa đích đặt trên sàn góc dưới bên phải
    door: { x: 2815, y: 362, w: 52, h: 68 }
};