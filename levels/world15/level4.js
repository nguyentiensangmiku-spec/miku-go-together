module.exports = {
    id: '15-4',
    name: 'REMEMBER! (15-4)',
    width: 900,               // Camera cố định bao quát trọn 2 màn hình so sánh
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 486, y: 434 },
    keyRequiresPuzzle: true,  // Chìa khóa chỉ hiện khi tất cả người chơi & hộp màu đứng đúng 100%

    // Địa hình đối xứng 2 nửa: Trái (18..436) | Vách giữa (436..464) | Phải (464..882)
    // Độ lệch ngang chính xác giữa 2 nửa là HALF_DX = 446px
    platforms: [
        { x: 0, y: 0, w: 900, h: 16 },            // Trần xanh
        { x: 0, y: 0, w: 18, h: 500 },            // Tường trái
        { x: 436, y: 0, w: 28, h: 500 },          // Vách xanh ngăn đôi 2 màn hình
        { x: 882, y: 0, w: 18, h: 500 },          // Tường phải
        { x: 18, y: 462, w: 864, h: 38 },         // Sàn đáy cho cả 2 nửa

        // --- NỬA TRÁI (Bảng mẫu REMEMBER!, x0 = 18) ---
        { x: 18, y: 248, w: 48, h: 16 },          // Mỏm tường trái
        { x: 100, y: 244, w: 80, h: 20 },         // Bục trên-trái
        { x: 272, y: 242, w: 112, h: 20 },        // Bục trên-phải
        { x: 86, y: 352, w: 122, h: 20 },         // Bục dưới-trái
        { x: 246, y: 352, w: 122, h: 20 },        // Bục dưới-phải

        // --- NỬA PHẢI (Khu chơi chính, x0 = 464) ---
        { x: 464, y: 248, w: 48, h: 16 },         // Mỏm tường trái
        { x: 546, y: 244, w: 80, h: 20 },         // Bục trên-trái
        { x: 718, y: 242, w: 112, h: 20 },        // Bục trên-phải (chừa khe 52px bên phải để rơi hộp không kẹt tường)
        { x: 532, y: 352, w: 122, h: 20 },        // Bục dưới-trái
        { x: 692, y: 352, w: 122, h: 20 }         // Bục dưới-phải
    ],

    // Lò xo mini nằm giữa 2 bục dưới (giúp mèo bật cao & làm cầu cho hộp trượt qua 2 bục dưới)
    bouncePads: [
        { x: 660, y: 356, w: 26, h: 14, force: -14.2 }
    ],

    // Cơ chế riêng của World 15 - Màn 4: Ghi nhớ vị trí cả người chơi lẫn hộp màu
    world15: {
        enabled: true,
        mode: 'rememberMatch',
        halfDx: 446,
        playerScale: 0.72,    // Mèo kích thước 26x28px gọn đẹp chuẩn video
        boxSize: 26,          // Hộp màu vuông 26x26px
        boxSpeed: 3.2,        // Tốc độ đẩy hộp màu mượt theo nhân vật
        memorizeSec: 15,      // 15s ghi nhớ
        playSec: 30,          // 30s xếp đội hình & đẩy hộp (bấm F để chấm điểm ngay)
        toleranceX: 34,
        toleranceY: 18,

        // 3 vị trí xuất phát chuẩn của 3 hộp màu bên khung phải giống video
        boxStartSlots: [
            { x: 573, floorY: 244, zone: 'upperLeft' },   // Hộp 1: trên bục trên-trái
            { x: 580, floorY: 352, zone: 'lowerLeft' },   // Hộp 2: trên bục dưới-trái
            { x: 762, floorY: 242, zone: 'upperRight' }   // Hộp 3: trên bục trên-phải
        ],

        // 17 mốc vị trí không trùng lặp bên khung phải (đủ rộng cho tối đa 8 mèo + 3 hộp màu)
        candidateSpots: [
            { x: 476, floorY: 248, zone: 'ledge', catOnly: true },
            { x: 552, floorY: 244, zone: 'upperLeft' },
            { x: 592, floorY: 244, zone: 'upperLeft' },
            { x: 724, floorY: 242, zone: 'upperRight' },
            { x: 762, floorY: 242, zone: 'upperRight' },
            { x: 798, floorY: 242, zone: 'upperRight' },
            { x: 538, floorY: 352, zone: 'lowerLeft' },
            { x: 578, floorY: 352, zone: 'lowerLeft' },
            { x: 618, floorY: 352, zone: 'lowerLeft' },
            { x: 698, floorY: 352, zone: 'lowerRight' },
            { x: 738, floorY: 352, zone: 'lowerRight' },
            { x: 778, floorY: 352, zone: 'lowerRight' },
            { x: 482, floorY: 462, zone: 'floor' },
            { x: 548, floorY: 462, zone: 'floor' },
            { x: 618, floorY: 462, zone: 'floor' },
            { x: 692, floorY: 462, zone: 'floor' },
            { x: 766, floorY: 462, zone: 'floor' }
        ]
    },

    // Chìa khóa vàng xuất hiện chính giữa khu phải khi cả đội & hộp màu đúng 100%
    key: { x: 660, y: 274, w: 26, h: 36 },

    // Cửa đích đặt ở góc dưới-phải
    door: { x: 822, y: 394, w: 52, h: 68 }
};