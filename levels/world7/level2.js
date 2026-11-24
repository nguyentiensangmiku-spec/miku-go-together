module.exports = {
    id: '7-2',
    name: 'MOVE AND STOP 7-2',
    width: 3200,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 185, y: 390 },

    // Cơ chế riêng của Màn 7-2: Đèn giao thông Xanh / Nhấp nháy / Đỏ (nhịp nhanh hơn)
    trafficLight: {
        enabled: true,
        initialBlue: 3500,   // Nhịp đèn xanh đầu tiên: 3.5 giây (cũ: 6.5s)
        blueMin: 2200,       // Đèn xanh tối thiểu: 2.2 giây (cũ: 4.2s)
        blueMax: 3200,       // Đèn xanh tối đa: 3.2 giây (cũ: 5.4s)
        blinkTime: 800,      // Nhấp nháy cảnh báo: 0.8 giây (cũ: 1.1s)
        redMin: 1500,        // Đèn đỏ tối thiểu: 1.5 giây (cũ: 2.4s)
        redMax: 2200         // Đèn đỏ tối đa: 2.2 giây (cũ: 3.2s)
    },

    // Địa hình: Sàn xuất phát -> Cầu thang 4 bậc -> Hố dung nham -> Sàn chờ & Lò xo -> Bục chữ L đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 140, y: 440, w: 700, h: 60 },        // Sàn xuất phát (có sâu xanh bò ngang)

        // Cầu thang 4 bậc đi lên
        { x: 840, y: 395, w: 60, h: 105 },
        { x: 900, y: 350, w: 60, h: 150 },
        { x: 960, y: 305, w: 60, h: 195 },
        { x: 1020, y: 260, w: 190, h: 240 },

        // Sàn dài bên phải (sàn chờ + nền cầu lò xo + sàn đẩy khối lớn)
        { x: 1330, y: 440, w: 1840, h: 60 },

        // Khối bục chữ L trên cao chứa Cửa đích và khối số 1
        { x: 2680, y: 0, w: 38, h: 277 },         // Tường chắn trái của bục chữ L
        { x: 2680, y: 245, w: 280, h: 32 },       // Mặt sàn bục chữ L

        { x: 3170, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // 2 hố dung nham (góc trái cùng & ngay sau cầu thang)
    hazards: [
        { x: 30, y: 465, w: 110, h: 35, type: 'lava' },
        { x: 1210, y: 465, w: 120, h: 35, type: 'lava' }
    ],

    // Con sâu xanh bò từ chân cầu thang sang trái (chạm vào là chơi lại màn)
    enemies: [
        {
            id: 'worm_7_2',
            x: 780,
            y: 416,
            w: 38,
            h: 24,
            minX: 145,
            maxX: 795,
            speed: -2.4,
            mode: 'loop'
        }
    ],

    // Cầu sàn nhún lò xo dài (phải băng qua trong 1 nhịp đèn xanh)
    bouncePads: [
        { x: 1730, y: 426, w: 560, h: 14, force: -12.6 }
    ],

    // 2 khối đẩy: Khối lớn (cả phòng đẩy qua gầm chữ L) & Khối nhỏ số 1 (đẩy rơi xuống làm bậc thang)
    pushBlocks: [
        {
            id: 'pb_7_2_all',
            x: 2520,
            y: 335,
            w: 96,
            h: 105,
            minX: 2520,
            maxX: 3022,
            required: 'ALL',
            speed: 3.4,
            pushMargin: 165
        },
        {
            id: 'pb_7_2_step',
            x: 2885,
            y: 197,
            w: 48,
            h: 48,
            minX: 2780,
            maxX: 2968,
            required: 1,
            speed: 3.5,
            pitX: 2962,
            pitStopY: 392
        }
    ],

    // Chìa khóa treo trên cao ở đoạn cuối cầu lò xo
    key: { x: 2130, y: 275, w: 26, h: 36 },

    // Cửa đích đặt trên mặt sàn chữ L
    door: { x: 2735, y: 177, w: 52, h: 68 }
};