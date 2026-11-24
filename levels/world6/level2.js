module.exports = {
    id: '6-2',
    name: 'PUSH OR JUMP 6-2',
    width: 2800,
    height: 500,
    bgColor: '#fff8e7',
    groundColor: '#ff8c3a',
    spawn: { x: 60, y: 400 },

    // Địa hình: Sàn xuất phát -> Vách 1 -> Bục nổi trên dung nham -> Vách 2 -> Thung lũng cầu thang -> Vách đích
    platforms: [
        { x: 0, y: 0, w: 30, h: 500 },            // Tường chặn trái
        { x: 30, y: 450, w: 590, h: 50 },         // Sàn xuất phát

        { x: 620, y: 245, w: 300, h: 255 },       // Vách cao 1 (sau thang máy)
        { x: 1030, y: 245, w: 120, h: 42 },       // Bục nổi giữa hố dung nham
        { x: 1260, y: 245, w: 270, h: 255 },      // Vách cao 2 (trước thung lũng)

        { x: 1530, y: 450, w: 790, h: 50 },       // Sàn thung lũng để đẩy cầu thang màu

        { x: 2320, y: 170, w: 480, h: 330 },      // Vách cao cuối màn đặt Cửa đích
        { x: 2770, y: 0, w: 30, h: 500 }          // Tường chặn phải
    ],

    // Thang máy đầu màn (cần đủ cả phòng đứng lên để nâng lên Vách 1)
    elevators: [
        {
            id: 'elev_6_2',
            x: 415,
            y: 432,
            startY: 432,
            endY: 245,
            w: 200,
            h: 18,
            required: 'ALL',
            speed: 2.2
        }
    ],

    // Sóng dung nham màu cam dưới bục nổi
    hazards: [
        { x: 920, y: 465, w: 340, h: 35, type: 'lava' }
    ],

    // Cầu thang 8 khối màu xếp sẵn (màu tự chia khớp sĩ số phòng; đẩy khối dưới sẽ kéo cả cầu thang đi theo)
    colorBlocks: [
        { id: 'cb62_1', ownerIdx: 1, x: 1630, y: 410, w: 120, h: 40, speed: 3.6 }, // Bậc 1 (đáy)
        { id: 'cb62_2', ownerIdx: 2, x: 1658, y: 370, w: 120, h: 40, speed: 3.6 }, // Bậc 2
        { id: 'cb62_3', ownerIdx: 0, x: 1686, y: 330, w: 120, h: 40, speed: 3.6 }, // Bậc 3
        { id: 'cb62_4', ownerIdx: 3, x: 1714, y: 290, w: 120, h: 40, speed: 3.6 }, // Bậc 4
        { id: 'cb62_5', ownerIdx: 5, x: 1742, y: 250, w: 120, h: 40, speed: 3.6 }, // Bậc 5
        { id: 'cb62_6', ownerIdx: 4, x: 1770, y: 210, w: 120, h: 40, speed: 3.6 }, // Bậc 6
        { id: 'cb62_7', ownerIdx: 6, x: 1798, y: 170, w: 120, h: 40, speed: 3.6 }, // Bậc 7 (ngang mặt vách đích)
        { id: 'cb62_8', ownerIdx: 7, x: 1826, y: 130, w: 120, h: 40, speed: 3.6 }  // Bậc 8 (đỉnh)
    ],

    // Chìa khóa treo trên cao dọc đường đẩy cầu thang sang vách đích
    key: { x: 2130, y: 122, w: 26, h: 36 },

    // Cửa đích trên đỉnh vách cao cuối màn
    door: { x: 2640, y: 102, w: 52, h: 68 }
};