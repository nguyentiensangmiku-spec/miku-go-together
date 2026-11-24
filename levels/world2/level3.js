module.exports = {
    id: '2-3',
    name: 'GO TOGETHER 2-3',
    width: 1650,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',

    // Xuất phát xếp hàng ngang trên tầng trên sát mép vực trái (giống video)
    spawn: { x: 245, y: 95 },

    // Bật cơ chế dây nối đồng đội
    rope: {
        enabled: true,
        maxDist: 145
    },

    // Địa hình khối hang xoắn ốc + khe vực trái + đường hầm dưới
    platforms: [
        { x: 0, y: 0, w: 60, h: 500 },            // Tường ngoài bên trái (tạo khe vực lấy chìa khóa)

        { x: 220, y: 140, w: 1060, h: 65 },       // Mặt sàn tầng trên (nơi xuất phát)
        { x: 220, y: 140, w: 90, h: 360 },        // Tường trái của hang
        { x: 1190, y: 140, w: 90, h: 210 },       // Tường phải của hang (chừa cửa hang ở dưới)

        { x: 580, y: 315, w: 700, h: 35 },        // Sàn tầng giữa (nơi đặt cửa đích)
        { x: 580, y: 350, w: 32, h: 28 },         // Gờ treo nhỏ đầu sàn giữa (giống video)

        { x: 310, y: 405, w: 145, h: 35 },        // Bậc bước phụ bên trái giúp leo lên sàn cửa dễ hơn
        { x: 220, y: 440, w: 1155, h: 60 },       // Sàn đường hầm tầng dưới & bệ đáp bên phải

        { x: 1620, y: 0, w: 30, h: 500 }          // Tường chặn ngoài cùng bên phải
    ],

    // Sóng dung nham màu cam ở góc dưới bên phải (chạm vào là chơi lại màn)
    hazards: [
        { x: 1375, y: 465, w: 245, h: 35, type: 'lava' }
    ],

    // Chìa khóa treo trong khe vực bên trái (đã nâng cao hơn bản gốc để dễ lấy)
    key: { x: 132, y: 235, w: 26, h: 36 },

    // Cửa đích nằm trong hang tầng giữa
    door: { x: 1030, y: 247, w: 52, h: 68 }
};