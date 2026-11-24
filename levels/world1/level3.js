module.exports = {
    id: '1-3',
    name: 'HELLO PICO PARK 1-3',
    width: 1950,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',

    // Xuất phát xếp chồng lên nhau trên trụ nhỏ giống hệt video
    spawn: { x: 237, y: 350 },
    spawnStacked: true,

    // Các khối đất, trụ xuất phát, bậc bước lên tầng 2 và sàn chính
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },           // Tường chặn trái
        { x: 220, y: 390, w: 70, h: 110 },       // Trụ nhỏ xuất phát (xung quanh là hố vực)
        { x: 350, y: 255, w: 60, h: 45 },        // Bậc nhảy trung gian lên tầng trên
        { x: 440, y: 210, w: 1200, h: 45 },      // Sàn tầng trên (nơi lấy chìa khóa)
        { x: 350, y: 430, w: 1600, h: 70 },      // Sàn chính tầng dưới (nơi đặt nút đỏ & cửa)
        { x: 1920, y: 0, w: 30, h: 500 }         // Tường chặn phải
    ],

    // Khối đẩy số 1 ở tầng dưới (có thể đẩy đè lên nút đỏ)
    pushBlocks: [
        {
            id: 'box_1_3',
            x: 620,
            y: 382,
            w: 48,
            h: 48,
            minX: 360,
            maxX: 1680,
            required: 1,
            speed: 3
        }
    ],

    // 5 nút bấm màu đỏ ở tầng dưới (mỗi nút mở 1 thanh chắn tương ứng ở tầng trên)
    buttons: [
        { id: 'btn1', x: 920, y: 418, w: 40, h: 12, gateId: 'gate1' },
        { id: 'btn2', x: 1050, y: 418, w: 40, h: 12, gateId: 'gate2' },
        { id: 'btn3', x: 1180, y: 418, w: 40, h: 12, gateId: 'gate3' },
        { id: 'btn4', x: 1310, y: 418, w: 40, h: 12, gateId: 'gate4' },
        { id: 'btn5', x: 1440, y: 418, w: 40, h: 12, gateId: 'gate5' }
    ],

    // 5 thanh chắn màu cam trên tầng 2
    gates: [
        { id: 'gate1', x: 922, y: 0, startY: 0, openY: -155, w: 36, h: 210, speed: 6 },
        { id: 'gate2', x: 1052, y: 0, startY: 0, openY: -155, w: 36, h: 210, speed: 6 },
        { id: 'gate3', x: 1182, y: 0, startY: 0, openY: -155, w: 36, h: 210, speed: 6 },
        { id: 'gate4', x: 1312, y: 0, startY: 0, openY: -155, w: 36, h: 210, speed: 6 },
        { id: 'gate5', x: 1442, y: 0, startY: 0, openY: -155, w: 36, h: 210, speed: 6 }
    ],

    // Chìa khóa trên tầng 2
    key: { x: 690, y: 155, w: 26, h: 36 },

    // Cửa đích ở cuối tầng 1
    door: { x: 1750, y: 362, w: 52, h: 68 }
};