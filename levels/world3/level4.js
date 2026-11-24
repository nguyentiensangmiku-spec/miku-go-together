module.exports = {
    id: '3-4',
    name: 'TIME LIMIT 3-4',
    width: 2100,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',

    // Xuất phát ở tầng trệt bên trái
    spawn: { x: 70, y: 395 },

    // Thời gian khởi đầu 12 giây (chạy dẫm nút đỏ trên các tầng để cộng thêm giờ)
    timeLimit: 12,

    // Địa hình đường đua 4 tầng bậc thang & trục rơi về cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 2070, y: 0, w: 30, h: 500 },         // Tường chặn phải
        { x: 30, y: 445, w: 2040, h: 55 },        // Tầng 1 (sàn trệt dẫn thẳng tới cửa đích)

        { x: 430, y: 345, w: 1240, h: 22 },       // Tầng 2
        { x: 640, y: 245, w: 1030, h: 22 },       // Tầng 3
        { x: 850, y: 145, w: 820, h: 22 },        // Tầng 4 (tầng trên cùng chứa chìa khóa)

        { x: 1800, y: 245, w: 270, h: 35 }        // Mái che phía trên cửa đích
    ],

    // 3 khối đẩy chặn cuối tầng 2, 3, 4 (đẩy rơi khỏi mép sàn sẽ tụt gọn mở đường xuống cửa)
    pushBlocks: [
        {
            id: 'pb_3_4_f2',
            x: 1590, y: 275, w: 54, h: 70,
            minX: 1400, maxX: 1680,
            required: 'QUARTER',
            speed: 2.8,
            pitX: 1672,
            pitStopY: 445
        },
        {
            id: 'pb_3_4_f3',
            x: 1590, y: 175, w: 54, h: 70,
            minX: 1400, maxX: 1680,
            required: 'QUARTER',
            speed: 2.8,
            pitX: 1672,
            pitStopY: 445
        },
        {
            id: 'pb_3_4_f4',
            x: 1590, y: 75, w: 54, h: 70,
            minX: 1400, maxX: 1680,
            required: 'QUARTER',
            speed: 2.8,
            pitX: 1672,
            pitStopY: 445
        }
    ],

    // Hệ thống nút đỏ cộng giờ (+2 giây mỗi nút, dùng 1 lần) rải đều cả 4 tầng
    buttons: [
        // Tầng 1
        { id: 'b34_1', x: 260, y: 433, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_2', x: 310, y: 433, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_3', x: 360, y: 433, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_4', x: 680, y: 433, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_5', x: 1020, y: 433, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_6', x: 1360, y: 433, w: 30, h: 12, addTime: 2, oneTime: true },

        // Tầng 2
        { id: 'b34_7', x: 520, y: 333, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_8', x: 820, y: 333, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_9', x: 1120, y: 333, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_10', x: 1420, y: 333, w: 30, h: 12, addTime: 2, oneTime: true },

        // Tầng 3
        { id: 'b34_11', x: 740, y: 233, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_12', x: 1040, y: 233, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_13', x: 1340, y: 233, w: 30, h: 12, addTime: 2, oneTime: true },

        // Tầng 4
        { id: 'b34_14', x: 960, y: 133, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_15', x: 1200, y: 133, w: 30, h: 12, addTime: 2, oneTime: true },
        { id: 'b34_16', x: 1440, y: 133, w: 30, h: 12, addTime: 2, oneTime: true }
    ],

    // Chìa khóa trên tầng 4
    key: { x: 1080, y: 85, w: 26, h: 36 },

    // Cửa đích ở góc dưới cùng bên phải
    door: { x: 1890, y: 377, w: 52, h: 68 }
};