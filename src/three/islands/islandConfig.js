// SkillIsland V1.4
// 七大島嶼配置中心

export const centralIsland = {
    id: 'central',
    name: '技能管理中心',
    englishName: 'Skill Center',
    icon: '🏛️',
    x: 0,
    z: 0,
    radius: 23,
    grassColor: 0x75c94f,
    sandColor: 0xf4d394,
    buildingColor: 0xffe3ad,
    roofColor: 0xe96b4c,
    seed: 2026
}

export const skillIslandConfigs = [

    {
        id: 'image',
        number: '01',
        name: '影像技能島',
        englishName: 'Image Studio',
        icon: '🎨',
        description: '放大鏡、塗鴉筆、消除筆、圖片處理',
        x: 0,
        z: -60,
        radius: 19,
        grassColor: 0x9edb79,
        sandColor: 0xffdfad,
        buildingColor: 0xf8a5c2,
        roofColor: 0xe75480,
        seed: 2027
    },

    {
        id: 'document',
        number: '02',
        name: '文件技能島',
        englishName: 'Document Center',
        icon: '📄',
        description: 'PDF 合併、分割、文件轉換',
        x: 52,
        z: -30,
        radius: 19,
        grassColor: 0x83c99b,
        sandColor: 0xf4dda8,
        buildingColor: 0x91bafa,
        roofColor: 0x407bdb,
        seed: 2028
    },

    {
        id: 'excel',
        number: '03',
        name: 'Excel 技能島',
        englishName: 'Excel Studio',
        icon: '📗',
        description: '資料清理、格式轉換、統計分析',
        x: 52,
        z: 30,
        radius: 19,
        grassColor: 0x8acf68,
        sandColor: 0xffdfa1,
        buildingColor: 0xa2e1ad,
        roofColor: 0x218b4a,
        seed: 2029
    },

    {
        id: 'code',
        number: '04',
        name: '程式技能島',
        englishName: 'Code Lab',
        icon: '💻',
        description: 'JSON 格式化、SQL、程式工具',
        x: 0,
        z: 60,
        radius: 19,
        grassColor: 0x91c99e,
        sandColor: 0xeed8b2,
        buildingColor: 0xc4b5fd,
        roofColor: 0x7952cc,
        seed: 2030
    },

    {
        id: 'analytics',
        number: '05',
        name: '數據分析島',
        englishName: 'Analytics Lab',
        icon: '📊',
        description: '圖表生成、數據分析、資料視覺化',
        x: -52,
        z: 30,
        radius: 19,
        grassColor: 0xb5d778,
        sandColor: 0xffdea0,
        buildingColor: 0xffcc80,
        roofColor: 0xef951f,
        seed: 2031
    },

    {
        id: 'agent',
        number: '06',
        name: 'AI 智慧技能島',
        englishName: 'Agent Skill Lab',
        icon: '🤖',
        description: 'AI Skills、Markdown 文件、智慧摘要',
        x: -52,
        z: -30,
        radius: 19,
        grassColor: 0x85d1b0,
        sandColor: 0xf5dfb2,
        buildingColor: 0x80deea,
        roofColor: 0x0097a7,
        seed: 2032
    }
]

export const allIslandConfigs = [
    centralIsland,
    ...skillIslandConfigs
]

