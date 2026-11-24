module.exports = {
    id: '2-4',
    name: 'GO TOGETHER 2-4',
    width: 1960,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 70, y: 315 },

    // Địa hình: Sàn xuất phát có gờ nhảy -> Trụ treo trên cầu -> Hầm kín cuối màn
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 365, w: 610, h: 135 },        // Sàn xuất phát bên trái
        { x: 350, y: 335, w: 65, h: 30 },         // Gờ nhỏ trên sàn xuất phát (giống video)

        { x: 960, y: 0, w: 42, h: 175 },          // Trụ treo trên cao (buộc xếp tháp thấp qua cầu)

        { x: 1300, y: 355, w: 40, h: 145 },       // Tường trái của hầm
        { x: 1340, y: 355, w: 180, h: 25 },       // Nóc hầm bên trái
        { x: 1690, y: 355, w: 240, h: 25 },       // Nóc hầm bên phải
        { x: 1300, y: 445, w: 660, h: 55 },       // Sàn bên trong hầm
        { x: 1930, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // 12 ô gạch trắng tự vỡ bắc qua hố dung nham
    crumblingBlocks: Array.from({ length: 12 }, (_, i) => ({
        id: `cb_2_4_${i}`,
        x: 642 + i * 54,
        y: 365,
        w: 50,
        h: 50,
        delay: 450
    })),

    // Sóng dung nham màu cam dưới cầu gạch vỡ
    hazards: [
        { x: 640, y: 460, w: 660, h: 40, type: 'lava' }
    ],

    // Thang máy đếm đủ cả phòng để hạ xuống hầm kín
    elevators: [
        {
            id: 'elev_2_4',
            x: 1520,
            y: 355,
            startY: 355,
            endY: 445,
            w: 170,
            h: 18,
            required: 'ALL',
            speed: 2.2
        }
    ],

    // Chìa khóa nằm bên trái trong hầm
    key: { x: 1410, y: 398, w: 26, h: 36 },

    // Cửa đích nằm bên phải trong hầm
    door: { x: 1810, y: 377, w: 52, h: 68 }
};