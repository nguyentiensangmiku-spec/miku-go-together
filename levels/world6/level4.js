module.exports = {
    id: '6-4',
    name: 'PUSH OR JUMP 6-4',
    width: 2450,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 70, y: 390 },

    // Địa hình: Sàn phẳng đầu -> Bục cao ở giữa -> Đoạn sàn phẳng chứa dãy 5 nút cuối & Cửa đích
    platforms: [
        { x: 0, y: 0, w: 2450, h: 36 },           // Trần trên xuyên suốt
        { x: 0, y: 36, w: 30, h: 464 },           // Tường chặn trái
        { x: 2420, y: 36, w: 30, h: 464 },        // Tường chặn phải
        { x: 30, y: 440, w: 2390, h: 60 },        // Sàn trệt xuyên suốt

        { x: 720, y: 385, w: 540, h: 55 }         // Bục cao ở giữa màn (có nút cấm bấm ở 2 mép)
    ],

    // Hệ thống 8 nút đỏ DON'T PUSH! (bất kỳ ai chạm vào là reset màn ngay lập tức)
    hazards: [
        // Nút 1: Trên sàn phẳng đầu màn
        { x: 500, y: 428, w: 36, h: 12, type: 'dontPush' },

        // Nút 2 & 3: Đặt sát mép trái và mép phải của bục cao giữa màn
        { x: 745, y: 373, w: 36, h: 12, type: 'dontPush' },
        { x: 1200, y: 373, w: 36, h: 12, type: 'dontPush' },

        // Nút 4 -> 8: Dãy 5 nút san sát nhau dẫn thẳng tới Cửa đích
        { x: 1460, y: 428, w: 36, h: 12, type: 'dontPush' },
        { x: 1605, y: 428, w: 36, h: 12, type: 'dontPush' },
        { x: 1750, y: 428, w: 36, h: 12, type: 'dontPush' },
        { x: 1895, y: 428, w: 36, h: 12, type: 'dontPush' },
        { x: 2040, y: 428, w: 36, h: 12, type: 'dontPush' }
    ],

    // Chìa khóa treo cao giữa khe nút 6 và nút 7 (cần xếp chồng 2 chú mèo để nhảy với tới)
    key: { x: 1827, y: 235, w: 26, h: 36 },

    // Cửa đích ngay sau nút cấm bấm cuối cùng
    door: { x: 2230, y: 372, w: 52, h: 68 }
};