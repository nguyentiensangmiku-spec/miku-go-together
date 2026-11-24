module.exports = {
    id: '4-1',
    name: 'SHIELD & LASER 4-1',
    width: 2250,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 80, y: 345 },

    // Bật cơ chế cấp khiên chắn tia laser cho riêng màn này
    shields: {
        enabled: true
    },

    // Địa hình: Sàn xuất phát -> Hố tia laser ngang -> Hành lang tia laser dọc -> Cửa đích
    platforms: [
        { x: 0, y: 0, w: 2250, h: 36 },           // Trần nhà gắn bệ bắn laser
        { x: 0, y: 36, w: 30, h: 464 },           // Tường chặn trái
        { x: 2220, y: 36, w: 30, h: 464 },        // Tường chặn phải

        { x: 30, y: 400, w: 500, h: 100 },        // Sàn xuất phát
        { x: 530, y: 448, w: 240, h: 52 },        // Hố thấp chứa tia laser ngang
        { x: 770, y: 400, w: 1450, h: 100 }       // Sàn chính qua hành lang laser tới cửa đích
    ],

    // Hệ thống tia laser (1 tia bắn ngang trong hố + 12 tia bắn dọc từ trần xuống)
    lasers: [
        { id: 'las_pit', x: 770, y: 422, dir: 'left', maxLen: 240 },
        ...Array.from({ length: 12 }, (_, i) => ({
            id: `las_v_${i}`,
            x: 1080 + i * 70,
            y: 36,
            dir: 'down',
            maxLen: 364
        }))
    ],

    // Chìa khóa & Cửa đích nằm sau hành lang tia laser
    key: { x: 1960, y: 345, w: 26, h: 36 },
    door: { x: 2090, y: 332, w: 52, h: 68 }
};