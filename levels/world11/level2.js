module.exports = {
    id: '11-2',
    name: 'HAND GIMMICK 11-2',
    width: 2250,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 350, y: 326 },

    // Địa hình: 3 gờ tường trái -> Hố dung nham rộng -> Sàn chính -> Bậc cao -> Hầm trần thấp & Khe dung nham -> Cửa đích
    platforms: [
        { x: 0, y: 0, w: 28, h: 500 },            // Tường chặn trái

        // 3 gờ tường bên trái (nơi 1-3 chú mèo xuất phát chờ đồng đội bên phải hút qua)
        { x: 28, y: 365, w: 96, h: 135 },         // Gờ trái dưới
        { x: 28, y: 245, w: 96, h: 32 },          // Gờ trái giữa
        { x: 28, y: 125, w: 96, h: 32 },          // Gờ trái trên

        // Sàn chính bên phải hố dung nham rộng
        { x: 300, y: 365, w: 460, h: 135 },

        // Bậc tường cao (chênh 100px -> xếp chồng hoặc hút từ trên xuống để leo)
        { x: 760, y: 265, w: 690, h: 235 },

        // Khối trần thấp che phía trên khe dung nham hẹp (chừa khoảng cao 55px)
        { x: 1180, y: 0, w: 460, h: 210 },

        // Sàn đích bên phải khe dung nham hẹp (khe rộng 64px: 1450 -> 1514)
        { x: 1514, y: 265, w: 706, h: 235 },
        { x: 2220, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // 2 hố dung nham (hố rộng đầu màn & khe hẹp dưới trần thấp)
    hazards: [
        { x: 124, y: 465, w: 176, h: 35, type: 'lava' },
        { x: 1450, y: 465, w: 64, h: 35, type: 'lava' }
    ],

    // Cơ chế riêng của World 11 - Màn 2: Súng Hút Gió (Giữ phím E)
    handGimmick: {
        enabled: true,
        mode: 'suctionGun',
        hintText: 'HOLD E TO SUCK',
        hintX: 520,
        hintY: 185,
        suctionRange: 340,     // Tầm hút ngang tối đa
        suctionVertical: 105,  // Độ lệch cao tối đa vẫn hút được đồng đội
        pullSpeedX: 5.4,       // Lực kéo ngang xuyên qua vực
        pullSpeedY: 4.2,       // Lực nâng giữ đồng đội không bị rơi khi đang hút
        leftSpawns: [
            { x: 56, y: 326 }, // Gờ trái dưới
            { x: 56, y: 206 }, // Gờ trái giữa
            { x: 56, y: 86 }   // Gờ trái trên
        ],
        rightSpawnStart: { x: 340, y: 326 }
    },

    // Chìa khóa treo ngay phía trên Cửa đích (sau khi thoát khỏi hầm trần thấp)
    key: { x: 1850, y: 125, w: 26, h: 36 },

    // Cửa đích đặt trên sàn phải
    door: { x: 1837, y: 197, w: 52, h: 68 }
};