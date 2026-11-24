module.exports = {
    id: '1-1',
    name: 'HELLO PICO PARK 1-1',
    width: 2200,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 70, y: 360 },

    // Các khối đất & vách đá màu cam
    platforms: [
        { x: 0, y: 420, w: 520, h: 80 },      // Đoạn xuất phát
        // Hố vực 1 (từ 520 đến 610)
        { x: 610, y: 420, w: 340, h: 80 },    // Đoạn giữa
        // Hố vực 2 (từ 950 đến 1080)
        { x: 1080, y: 420, w: 680, h: 80 },   // Khu vực lấy chìa khóa & thang máy
        { x: 1740, y: 220, w: 460, h: 280 }   // Vách đá cao đặt cửa đích
    ],

    // Thang máy đếm số người (required: 'ALL' nghĩa là cần tất cả người trong phòng đứng lên)
    elevators: [
        {
            id: 'elev1',
            x: 1550,
            y: 398,
            startY: 398,
            endY: 220,
            w: 170,
            h: 18,
            required: 'ALL',
            speed: 2.2
        }
    ],

    // Chìa khóa treo trên cao (cần 2 mèo đứng lên đầu nhau để lấy)
    key: { x: 1360, y: 230, w: 26, h: 36 },

    // Cửa đích trên vách đá cao
    door: { x: 2010, y: 152, w: 52, h: 68 }
};