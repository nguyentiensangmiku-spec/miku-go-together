const fs = require('fs');
const path = require('path');

function loadAllWorlds() {
    const levelsDir = __dirname;
    const worlds = {};

    // Quét tất cả các thư mục bắt đầu bằng chữ "world"
    const folders = fs.readdirSync(levelsDir)
        .filter(name => name.startsWith('world') && fs.statSync(path.join(levelsDir, name)).isDirectory())
        .sort((a, b) => parseInt(a.replace('world', '')) - parseInt(b.replace('world', '')));

    for (const folder of folders) {
        const worldNum = folder.replace('world', '');
        const worldPath = path.join(levelsDir, folder);
        worlds[worldNum] = {};

        // Đọc file thông tin đặc biệt của World (nếu có, ví dụ World 5 ONLY OFFLINE)
        const infoPath = path.join(worldPath, 'info.js');
        if (fs.existsSync(infoPath)) {
            try {
                delete require.cache[require.resolve(infoPath)];
                worlds[worldNum]._meta = require(infoPath);
            } catch (err) {
                console.error(`[LOI] Khong the doc file ${folder}/info.js:`, err.message);
            }
        }

        // Quét 4 file level1.js -> level4.js trong mỗi world
        for (let i = 1; i <= 4; i++) {
            const filePath = path.join(worldPath, `level${i}.js`);
            if (fs.existsSync(filePath)) {
                try {
                    delete require.cache[require.resolve(filePath)];
                    worlds[worldNum][i] = require(filePath);
                } catch (err) {
                    console.error(`[LOI] Khong the doc file ${folder}/level${i}.js:`, err.message);
                }
            }
        }
    }
    return worlds;
}

module.exports = { loadAllWorlds };