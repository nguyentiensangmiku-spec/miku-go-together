module.exports = {
    id: '7-3',
    name: 'MOVE AND STOP 7-3',
    width: 3150,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 240, y: 390 },

    // Địa hình: Sàn xuất phát -> Sàn cao & 2 gờ nhỏ -> Hố ống cống xanh -> Vòm kín chứa Chìa khóa -> 2 bục + Đường hầm + Cầu thang đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 440, w: 940, h: 60 },         // Sàn xuất phát bên trái

        // Khu vực sàn cao sau thang máy
        { x: 970, y: 215, w: 36, h: 40 },         // Gờ chặn nhỏ đầu sàn cao
        { x: 970, y: 255, w: 628, h: 245 },       // Mặt sàn cao trước ống cống
        { x: 1270, y: 215, w: 36, h: 40 },        // Gờ nhỏ giữa sàn cao

        // Hố đặt ống cống xanh (chừa vừa khít ống để mèo không kẹt khe)
        { x: 1598, y: 330, w: 80, h: 170 },

        // Sàn cao sau ống cống dẫn tới vòm kín chứa Chìa khóa
        { x: 1678, y: 255, w: 242, h: 245 },

        // Vòm cam kín nhốt Chìa khóa (mèo leo bên trên, chỉ Con Ma bay xuyên vào lấy được)
        { x: 1920, y: 215, w: 50, h: 285 },       // Bậc 1 bên trái vòm
        { x: 1970, y: 175, w: 50, h: 325 },       // Tường trái của phòng kín
        { x: 2020, y: 175, w: 180, h: 45 },       // Mái vòm phòng kín
        { x: 2020, y: 335, w: 180, h: 165 },      // Đáy phòng kín
        { x: 2200, y: 175, w: 50, h: 325 },       // Tường phải của phòng kín
        { x: 2250, y: 215, w: 45, h: 40 },        // Bậc bước xuống bên phải vòm

        // Khu vực cuối: Bục trên, Bục giữa (mỏng để chìa khóa thòng xuống hầm) & Sàn đường hầm dưới
        { x: 2380, y: 165, w: 440, h: 24 },       // Bục nổi tầng trên
        { x: 2250, y: 295, w: 470, h: 24 },       // Bục nổi tầng giữa
        { x: 2250, y: 405, w: 530, h: 95 },       // Sàn đường hầm tầng dưới

        // Cầu thang 6 bậc leo lên Cửa đích
        { x: 2780, y: 365, w: 42, h: 135 },
        { x: 2822, y: 325, w: 42, h: 175 },
        { x: 2864, y: 285, w: 42, h: 215 },
        { x: 2906, y: 245, w: 42, h: 255 },
        { x: 2948, y: 205, w: 42, h: 295 },
        { x: 2990, y: 165, w: 160, h: 335 },      // Bục đặt Cửa đích
        { x: 3120, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Thang máy đầu màn (cả phòng đứng đủ để lên sàn cao)
    elevators: [
        {
            id: 'elev_7_3',
            x: 760,
            y: 422,
            startY: 422,
            endY: 255,
            w: 200,
            h: 18,
            required: 'ALL',
            speed: 2.2
        }
    ],

    // Ống cống xanh có quái gai tím trồi lên - tụt xuống theo chu kỳ
    pipeEnemies: [
        {
            id: 'pipe_7_3',
            x: 1602,
            y: 238,
            w: 72,
            h: 92,
            monsterW: 46,
            monsterH: 30,
            cycleMs: 4000,
            upDuration: 1800
        }
    ],

    // Con Ma Thẹn Thùng: Nhìn về phía nó thì đứng yên, quay lưng đi thì bay xuyên tường đuổi theo
    shyGhost: {
        enabled: true,
        x: 90,
        y: 150,
        w: 54,
        h: 54,
        speed: 3.1
    },

    // Chìa khóa bị nhốt trong phòng kín (nhử Con Ma bay xuyên tường vào cắp ra ngoài)
    key: { x: 2097, y: 270, w: 26, h: 36 },

    // Cửa đích ở đỉnh cầu thang góc trên bên phải
    door: { x: 3035, y: 97, w: 52, h: 68 }
};