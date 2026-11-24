module.exports = {
    id: '11-3',
    name: 'HAND GIMMICK 11-3',
    width: 2640,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 120, y: 396 },

    // Địa hình: Sàn xuất phát -> Bục cao -> Hố dung nham & 3 gạch tự vỡ -> Trụ cao -> Vực sâu -> Hầm trần thấp -> Cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 0, w: 1200, h: 32 },          // Trần cam khu vực đầu màn

        { x: 30, y: 438, w: 430, h: 62 },         // Sàn xuất phát
        { x: 460, y: 348, w: 380, h: 152 },       // Bục cam cao đầu màn (đẩy khối hoặc chồng đầu để leo)

        // Trụ cam cao bên phải hố dung nham (sau 3 khối gạch trắng tự vỡ)
        { x: 1230, y: 215, w: 220, h: 285 },

        // Khu vực bờ phải sau vực sâu (hố từ x = 1450 đến x = 1670)
        { x: 1670, y: 446, w: 620, h: 54 },       // Sàn thấp dưới hầm
        { x: 1940, y: 0, w: 185, h: 378 },        // Khối tường treo tạo hầm trần thấp (chừa khe cao 68px)
        { x: 2125, y: 0, w: 485, h: 32 },         // Trần phòng đích

        // Bậc bước lên Cửa đích
        { x: 2290, y: 416, w: 320, h: 84 },
        { x: 2610, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Khối đẩy nhỏ đầu màn (đẩy sát mép bục cam để dễ leo lên giống video)
    pushBlocks: [
        { id: 'step_11_3', x: 54, y: 392, w: 46, h: 46, minX: 40, maxX: 414, required: 1, speed: 3.0 }
    ],

    // Hố dung nham ở giữa màn
    hazards: [
        { x: 840, y: 462, w: 390, h: 38, type: 'lava' }
    ],

    // 3 khối gạch trắng tự vỡ xếp bậc thang chéo qua hố dung nham
    crumblingBlocks: [
        { id: 'cb11_1', x: 905,  y: 315, w: 48, h: 48, delay: 480 },
        { id: 'cb11_2', x: 1015, y: 270, w: 48, h: 48, delay: 480 },
        { id: 'cb11_3', x: 1125, y: 225, w: 48, h: 48, delay: 480 }
    ],

    // Cơ chế World 11: Súng Thu Phục & Bắn Đồng Đội (hỗ trợ hút lồng nhau cả phòng)
    handGimmick: {
        enabled: true,
        mode: 'captureGun',
        hintText: '',
        bulletSpeed: 10.5,
        maxRange: 520
    },

    // Chìa khóa đặt trên bờ phải (ngay trước vách hầm trần thấp)
    key: { x: 1845, y: 388, w: 26, h: 36 },

    // Cửa đích trong phòng cuối sau hầm trần thấp
    door: { x: 2450, y: 348, w: 52, h: 68 }
};