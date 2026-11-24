module.exports = {
    id: '13-3',
    name: 'HELLO, PICO PARK 2 (13-3)',
    width: 1950,
    height: 500,
    bgColor: '#ffffff',
    groundColor: '#4cd100',
    spawn: { x: 80, y: 276 },

    // Địa hình tông Trắng - Xanh lá: Bục xuất phát cao -> 3 bậc thang xuống -> Sàn phẳng rộng chứa Cột 9 đốt, Chìa khóa & Cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 315, w: 390, h: 185 },        // Bục xuất phát bên trái

        // 3 bậc thang đi xuống sàn chính
        { x: 420, y: 348, w: 46, h: 152 },
        { x: 466, y: 381, w: 46, h: 119 },
        { x: 512, y: 414, w: 46, h: 86 },

        // Sàn xanh phẳng kéo dài sang tận Cửa đích
        { x: 558, y: 445, w: 1362, h: 55 },
        { x: 1920, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Cơ chế riêng của World 13 - Màn 3: Bệ phóng (>>) + Cột tường xanh 9 đốt tự nghiêng & đổ rạp
    world13: {
        enabled: true,
        mode: 'shootPillar',
        launcher: {
            x: 515,
            y: 268,
            w: 108,
            h: 48
        },
        pillar: {
            pivotX: 1058,
            pivotY: 445,
            segSize: 48,
            segCount: 9,
            tipAngle: 42                          // Nghiêng vượt quá 42 độ là đổ rạp hẳn sang phải
        }
    },

    // Chìa khóa vàng nằm ngay sau dãy khối khi cột 9 đốt đổ xuống (x = 1058..1490)
    key: { x: 1620, y: 368, w: 26, h: 36 },

    // Cửa đích đặt ở góc dưới bên phải
    door: { x: 1785, y: 377, w: 52, h: 68 }
};