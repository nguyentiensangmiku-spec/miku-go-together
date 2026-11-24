module.exports = {
    id: '15-1',
    name: 'FORMATION (15-1)',
    width: 3560,
    height: 500,
    bgColor: '#a8a8a8',          // Nền xám chuẩn video giúp nổi bật các chùm đèn pha trắng
    groundColor: '#4cd100',      // Địa hình xanh lá tông Pico Park 2
    spawn: { x: 75, y: 406 },

    // Địa hình chuẩn video: Sàn dài -> Đồi bậc thang -> Mái trên & Hầm CHECKPOINT kín đầu phải -> Thung lũng Chìa khóa -> Cầu thang 6 bậc lên Cửa đích
    platforms: [
        { x: 0, y: 0, w: 40, h: 500 },            // Tường chặn trái
        { x: 40, y: 445, w: 3480, h: 55 },        // Sàn xanh xuyên suốt

        // Đồi bậc thang dẫn lên Mái trên & Hầm CHECKPOINT
        { x: 1860, y: 405, w: 50, h: 40 },
        { x: 1910, y: 365, w: 50, h: 80 },
        { x: 1960, y: 325, w: 52, h: 120 },       // Đỉnh đồi (nhảy sang phải lên mái trên)
        { x: 2012, y: 385, w: 45, h: 60 },        // Bậc đi xuống hầm CHECKPOINT

        // Mái xanh trên cao & Vách tường bịt kín đầu phải của hầm CHECKPOINT
        { x: 2125, y: 300, w: 690, h: 44 },       // Mái trên (mép trái x=2125..2230 là vùng chờ xếp đội hình)
        { x: 2770, y: 344, w: 45, h: 101 },       // Tường chặn kín đầu phải hầm CHECKPOINT

        // Cầu thang xanh 6 bậc bên phải dẫn lên Cửa đích
        { x: 3180, y: 405, w: 46, h: 40 },
        { x: 3226, y: 365, w: 46, h: 80 },
        { x: 3272, y: 325, w: 46, h: 120 },
        { x: 3318, y: 285, w: 46, h: 160 },
        { x: 3364, y: 245, w: 46, h: 200 },
        { x: 3410, y: 205, w: 110, h: 240 },      // Sàn đỉnh đặt Cửa đích

        { x: 3520, y: 0, w: 40, h: 500 }          // Tường chặn phải
    ],

    // Cơ chế riêng của World 15 - Màn 1: Hệ thống Đèn Pha 3 chặng + Cờ CHECKPOINT giữ tiến độ
    world15: {
        enabled: true,
        mode: 'spotlights',

        // Hầm CHECKPOINT nằm dưới mái xanh
        tunnelRect: { x: 2125, y: 344, w: 645, h: 101 },
        checkpoint: {
            x: 2665,
            y: 382,
            triggerX: 2610,
            triggerW: 155,
            triggerY: 344,
            triggerH: 101,
            spawnX: 2210,
            spawnY: 406
        },

        // Nhóm 1 (Chặng 1): Đèn Dài (chạm sàn tạo khe chữ V) & Đèn Ngắn (chiếu lửng phía trên khe chữ V) luân phiên nhau
        zone1Timing: {
            activeMs: 2200,
            telegraphMs: 650
        },
        zone1TallCones: [
            { ax: 620, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.30, radius: 485 },
            { ax: 980, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.30, radius: 485 },
            { ax: 1340, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.30, radius: 485 },
            { ax: 1700, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.30, radius: 485 }
        ],
        zone1ShortCones: [
            { ax: 800, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.25, radius: 260 },
            { ax: 1160, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.25, radius: 260 },
            { ax: 1520, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.25, radius: 260 },
            { ax: 1880, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.25, radius: 260 }
        ],

        // Nhóm 2 (Chặng 2 & Chặng 3): 4 chùm đèn trên Mái xanh + 1 chùm Đèn Xiên Khổng Lồ ở thung lũng Chìa khóa
        zone2Timing: {
            offMs: 4400,
            telegraphMs: 1000,
            activeMs: 2000
        },
        zone2RoofCones: [
            { ax: 2310, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.24, radius: 306 },
            { ax: 2455, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.24, radius: 306 },
            { ax: 2600, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.24, radius: 306 },
            { ax: 2745, ay: 0, dirAngle: Math.PI / 2, halfAngle: 0.24, radius: 306 }
        ],
        // Đèn xiên khổng lồ chiếu từ góc trên-phải xuống, chừa góc tối hình tam giác vuông sát vách tường trái
        zone3TiltedCone: {
            ax: 3175,
            ay: 145,
            dirAngle: 2.22,
            halfAngle: 0.54,
            radius: 315
        }
    },

    // Chìa khóa vàng nằm sát mặt phải vách tường CHECKPOINT
    key: { x: 2828, y: 365, w: 26, h: 36 },

    // Cửa đích đặt trên đỉnh cầu thang bên phải
    door: { x: 3445, y: 137, w: 52, h: 68 }
};