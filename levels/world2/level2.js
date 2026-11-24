module.exports = {
    id: '2-2',
    name: 'GO TOGETHER 2-2',
    width: 2250,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 80, y: 370 },

    // Sàn xuất phát, bục bậc thang, khối cam nổi trên cao và khu vực cửa đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 430, w: 420, h: 70 },         // Sàn xuất phát
        { x: 450, y: 365, w: 180, h: 135 },       // Bục cao đầu cầu gạch vỡ

        { x: 1435, y: 145, w: 56, h: 56 },        // Khối cam nổi cạnh chìa khóa (giống video)

        { x: 1620, y: 365, w: 150, h: 135 },      // Bục đáp cuối cầu
        { x: 1770, y: 430, w: 480, h: 70 },       // Sàn đặt cửa đích
        { x: 2220, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // 18 ô gạch trắng tự vỡ sau khi dẫm lên (cơ chế mới của màn 2-2)
    crumblingBlocks: Array.from({ length: 18 }, (_, i) => ({
        id: `cb_${i}`,
        x: 635 + i * 54,
        y: 365,
        w: 50,
        h: 50,
        delay: 420 // Vỡ sau 0.42 giây kể từ lúc dẫm lên
    })),

    // Sóng dung nham màu cam dưới hố (chạm vào là reset màn)
    hazards: [
        { x: 630, y: 455, w: 990, h: 45, type: 'lava' }
    ],

    // Chìa khóa treo cao trên cầu gạch vỡ (cần xếp chồng để với tới)
    key: { x: 1385, y: 155, w: 26, h: 36 },

    // Cửa đích ở cuối màn
    door: { x: 2040, y: 362, w: 52, h: 68 }
};