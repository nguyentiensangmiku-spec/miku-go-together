module.exports = {
    id: '4-4',
    name: 'GIMMICK GIMMICK 4-4',
    width: 2050,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 140, y: 390 },

    // Địa hình: Tường treo khe hẹp 1 -> Khu nút biến hình 2 -> Phòng 2 tầng bên phải
    platforms: [
        { x: 0, y: 0, w: 2050, h: 32 },           // Trần trên
        { x: 0, y: 32, w: 30, h: 468 },           // Tường chặn trái
        { x: 2015, y: 32, w: 35, h: 468 },        // Tường chặn phải
        { x: 30, y: 440, w: 1900, h: 60 },        // Sàn trệt (chừa hố cuối phải cho khối trắng rơi)

        // Tường treo đầu tiên (chừa khe 28px ở dưới -> phải thu nhỏ mới chui lọt)
        { x: 760, y: 32, w: 46, h: 380 },

        // Khu vực tầng 2 bên phải (chừa khe 32px -> cần mèo khổng lồ đỡ mèo tí hon nhảy lên)
        { x: 1360, y: 32, w: 40, h: 178 },        // Tường treo trên khe vào tầng 2
        { x: 1360, y: 242, w: 560, h: 32 }        // Sàn tầng 2
    ],

    // 2 cặp nút đỏ Thu Nhỏ (-) và Phóng To (+) (nhảy dẫm nhiều lần để đổi nhiều mức kích thước)
    sizeButtons: [
        { id: 'sb_1_shrink', x: 420, y: 428, w: 36, h: 12, type: 'shrink' },
        { id: 'sb_1_grow', x: 560, y: 428, w: 36, h: 12, type: 'grow' },
        { id: 'sb_2_shrink', x: 960, y: 428, w: 36, h: 12, type: 'shrink' },
        { id: 'sb_2_grow', x: 1120, y: 428, w: 36, h: 12, type: 'grow' }
    ],

    // Bức tường chắn phòng cửa đích ở tầng 1 -> tự tụt xuống mở cửa khi có người lấy Chìa khóa
    gates: [
        {
            id: 'gate_4_4',
            x: 1360,
            y: 274,
            startY: 274,
            openY: 440,
            w: 40,
            h: 166,
            speed: 8,
            openOnKey: true
        }
    ],

    // Khối trắng chặn cuối tầng 2 (cần toàn bộ người chơi trừ 1 người khổng lồ cùng đẩy xuống hố)
    pushBlocks: [
        {
            id: 'pb_4_4',
            x: 1840,
            y: 32,
            w: 72,
            h: 210,
            minX: 1840,
            maxX: 1938,
            required: 'ALL_MINUS_ONE',
            speed: 3.0,
            pitX: 1934,
            pitStopY: 440
        }
    ],

    // Chìa khóa trên tầng 2
    key: { x: 1640, y: 186, w: 26, h: 36 },

    // Cửa đích trong phòng tầng 1 (chỉ vào được khi mèo không quá to)
    door: { x: 1540, y: 372, w: 52, h: 68 }
};