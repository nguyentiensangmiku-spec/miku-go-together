module.exports = {
    id: '6-1',
    name: 'PUSH OR JUMP 6-1',
    width: 2750,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 60, y: 400 },

    // Địa hình: Sàn xuất phát -> Bục bậc thang -> 3 Bục nổi cao dần -> Vách tường cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 450, w: 2720, h: 50 },        // Sàn trệt xuyên suốt

        // Bục cao đầu màn & 2 bậc thang bước xuống
        { x: 580, y: 305, w: 260, h: 145 },
        { x: 840, y: 355, w: 55, h: 95 },
        { x: 895, y: 405, w: 55, h: 45 },

        // 3 bục nổi cao dần (nơi đặt các khối để đẩy chồng xuống tạo tháp)
        { x: 990, y: 328, w: 350, h: 26 },        // Bục nổi 1
        { x: 1480, y: 236, w: 320, h: 26 },       // Bục nổi 2
        { x: 1940, y: 144, w: 230, h: 26 },       // Bục nổi 3

        // Vách tường cao đặt cửa đích & tường chặn phải
        { x: 2460, y: 98, w: 290, h: 352 },
        { x: 2720, y: 0, w: 30, h: 500 }
    ],

    // 8 khối màu (chỉ chú mèo cùng màu mới đẩy được; 6 khối sau nhỏ dần để xếp thành cầu thang)
    colorBlocks: [
        { id: 'cb61_1', ownerIdx: 1, x: 440,  y: 406, w: 44,  h: 44 }, // Khối mở đường đầu màn
        { id: 'cb61_2', ownerIdx: 2, x: 750,  y: 261, w: 42,  h: 44 }, // Khối trên bục cao đầu màn
        { id: 'cb61_3', ownerIdx: 0, x: 1180, y: 404, w: 108, h: 46 }, // Tầng 1 tháp (đế to nhất)
        { id: 'cb61_4', ownerIdx: 5, x: 1225, y: 282, w: 94,  h: 46 }, // Tầng 2 tháp (trên bục 1)
        { id: 'cb61_5', ownerIdx: 3, x: 1065, y: 282, w: 80,  h: 46 }, // Tầng 3 tháp (trên bục 1)
        { id: 'cb61_6', ownerIdx: 6, x: 1690, y: 190, w: 66,  h: 46 }, // Tầng 4 tháp (trên bục 2)
        { id: 'cb61_7', ownerIdx: 4, x: 1545, y: 190, w: 52,  h: 46 }, // Tầng 5 tháp (trên bục 2)
        { id: 'cb61_8', ownerIdx: 7, x: 2045, y: 98,  w: 38,  h: 46 }  // Tầng 6 tháp (đỉnh nhỏ nhất)
    ],

    // Chìa khóa lơ lửng phía trên bục nổi cao nhất
    key: { x: 1975, y: 78, w: 26, h: 36 },

    // Cửa đích trên đỉnh vách tường cao bên phải
    door: { x: 2610, y: 30, w: 52, h: 68 }
};