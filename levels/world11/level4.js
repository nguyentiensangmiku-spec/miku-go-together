module.exports = {
    id: '11-4',
    name: 'HAND GIMMICK 11-4',
    width: 2400,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 115, y: 306 },

    // Địa hình: Khu xuất phát 2 tầng + Hầm Chìa khóa bậc thang -> Biển dung nham & Cột Nút Đỏ 2 -> Bờ phải Cửa đích
    platforms: [
        { x: 0, y: 0, w: 26, h: 500 },            // Tường chặn trái

        // Bậc bước bên trái giúp leo giữa tầng dưới & tầng trên
        { x: 26, y: 272, w: 72, h: 228 },

        // Tầng trên nơi đặt khối trắng [1]
        { x: 205, y: 188, w: 385, h: 34 },

        // Tầng dưới & Hầm Chìa khóa bậc thang (ban đầu bị nắp cam đậy kín)
        { x: 98,  y: 345, w: 62, h: 155 },        // Sàn trái hầm
        { x: 160, y: 385, w: 45, h: 115 },        // Bậc hầm trái 1
        { x: 205, y: 425, w: 35, h: 75 },         // Bậc hầm trái 2
        { x: 240, y: 460, w: 60, h: 40 },         // Đáy hầm đặt Chìa khóa
        { x: 300, y: 425, w: 35, h: 75 },         // Bậc hầm phải 2
        { x: 335, y: 385, w: 45, h: 115 },        // Bậc hầm phải 1
        { x: 380, y: 345, w: 230, h: 155 },       // Sàn phải hầm (đặt Nút Đỏ 1)

        // Cột cam nhỏ giữa biển dung nham (đặt Nút Đỏ 2 trên đỉnh)
        { x: 1255, y: 420, w: 50, h: 80 },

        // Bờ phải đặt Cửa đích
        { x: 1960, y: 430, w: 410, h: 70 },
        { x: 2370, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Biển dung nham lớn ngăn cách bờ trái và bờ phải
    hazards: [
        { x: 610, y: 465, w: 1350, h: 35, type: 'lava' }
    ],

    // Cơ chế riêng của World 11 - Màn 4: Súng Hút Gió + Khối [1] + Bục bay qua dung nham
    handGimmick: {
        enabled: true,
        mode: 'suctionFerry',
        suctionRange: 330,
        suctionVertical: 115,
        pullSpeedX: 5.4,
        pullSpeedY: 4.4,

        // Nắp cam đậy kín hầm Chìa khóa (tự biến mất khi khối [1] rơi trúng Nút Đỏ 2)
        pitLid: { x: 160, y: 345, w: 220, h: 24 },

        // Nút Đỏ 1 (kích hoạt đếm ngược 9s & bục bay) và Nút Đỏ 2 (giữa biển dung nham)
        btn1: { x: 548, y: 333, w: 36, h: 12 },
        btn2: { x: 1262, y: 408, w: 36, h: 12 },
        countdownSec: 9,
        countdownPos: { x: 562, y: 258 },

        // Khối trắng [1] (đẩy hoặc hút bằng phím E, rơi xuống dung nham sẽ tự hồi lại)
        block: { x: 518, y: 140, w: 46, h: 46, respawnX: 518, respawnY: 140 },

        // Bục bay màu cam: lần 1 đi tới giữa (qua Nút Đỏ 2) rồi quay về; sau khi mở nắp hầm sẽ đi thẳng sang bờ phải
        ferry: { x: 625, y: 188, w: 140, h: 22, startX: 625, midX: 1320, endX: 1840, speed: 3.6 }
    },

    // Chìa khóa nằm bên trong hầm bậc thang (chỉ lấy được sau khi mở nắp hầm)
    key: { x: 257, y: 408, w: 26, h: 36 },

    // Cửa đích ở bờ phải sau biển dung nham
    door: { x: 2220, y: 362, w: 52, h: 68 }
};