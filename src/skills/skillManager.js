// SkillIsland V1.9
// Skill Manager 技能管理核心

export const runtimeLabels = {
    browser: '瀏覽器執行',
    server: '後端執行',
    agent: 'AI 智慧執行'
}

export const statusLabels = {
    ready: '可使用',
    development: '開發中',
    planned: '待開發'
}

// 六大技能分類

const categories = [

    {
        id: 'image',
        name: '影像技能',
        icon: '📷',
        color: '#be185d',
        bg: '#fce7f3'
    },

    {
        id: 'document',
        name: '文件技能',
        icon: '📄',
        color: '#1d4ed8',
        bg: '#dbeafe'
    },

    {
        id: 'excel',
        name: 'Excel 技能',
        icon: '📗',
        color: '#166534',
        bg: '#dcfce7'
    },

    {
        id: 'code',
        name: '程式技能',
        icon: '💻',
        color: '#6d28d9',
        bg: '#ede9fe'
    },

    {
        id: 'analytics',
        name: '數據分析',
        icon: '📊',
        color: '#9a3412',
        bg: '#ffedd5'
    },

    {
        id: 'agent',
        name: 'AI 智慧技能',
        icon: '🤖',
        color: '#0e7490',
        bg: '#cffafe'
    }
]

// 技能登錄中心

const registry = new Map()

function registerSkill(skill) {

    if (!skill.id || !skill.name) {

        throw new Error('技能缺少必要資料')
    }

    if (registry.has(skill.id)) {

        throw new Error(
            `技能編號重複：${skill.id}`
        )
    }

    if (!categories.some(
        category => category.id === skill.category
    )) {

        throw new Error('無效的技能分類')
    }

    if (!Object.hasOwn(runtimeLabels, skill.runtime)) {
        throw new Error('無效的執行模式')
    }

    registry.set(skill.id, {

        status: 'planned',

        ...skill
    })
}

// ============================
// 01 影像技能
// ============================

const imageSkills = [

    ['image-magnifier', '圖片放大鏡', 'browser'],
    ['image-drawing', '自由塗鴉筆', 'browser'],
    ['image-eraser', '筆跡消除筆', 'browser'],
    ['image-crop', '圖片裁切', 'browser'],
    ['image-compress', '圖片壓縮', 'browser'],
    ['image-adjust', '亮度與色彩調整', 'browser']
]

// ============================
// 02 文件技能
// ============================

const documentSkills = [

    ['pdf-merge', 'PDF 合併', 'browser'],
    ['pdf-split', 'PDF 分割', 'browser'],
    ['document-text', '文字擷取', 'browser'],
    ['document-convert', '文件格式轉換', 'server']
]

// ============================
// 03 Excel 技能
// ============================

const excelSkills = [

    ['excel-clean', '資料清理', 'browser'],
    ['excel-date', '日期格式統一', 'browser'],
    ['excel-duplicate', '重複資料移除', 'browser'],
    ['excel-statistics', '資料統計', 'browser']
]

// ============================
// 04 程式技能
// ============================

const codeSkills = [

    ['code-json', 'JSON 格式化', 'browser'],
    ['code-sql', 'SQL 工具', 'browser'],
    ['code-format', '程式碼格式化', 'browser'],
    ['code-encoding', '文字編碼轉換', 'browser']
]

// ============================
// 05 數據分析
// ============================

const analyticsSkills = [

    ['chart-bar', '長條圖生成', 'browser'],
    ['chart-line', '折線圖生成', 'browser'],
    ['chart-pie', '圓餅圖生成', 'browser'],
    ['analytics-csv', 'CSV 資料分析', 'browser']
]

// ============================
// 06 AI 智慧技能
// ============================

const agentSkills = [

    ['agent-skills', 'Agent Skills', 'agent'],
    ['agent-markdown', 'SKILL.md 管理', 'server'],
    ['agent-summary', '智慧文章摘要', 'agent'],
    ['agent-task', '自動化任務', 'agent']
]

// 統一註冊技能

function registerGroup(category, skills) {

    skills.forEach(([id, name, runtime]) => {

        registerSkill({

            id,

            name,

            category,

            runtime,

            status: 'planned'
        })
    })
}

registerGroup('image', imageSkills)
registerGroup('document', documentSkills)
registerGroup('excel', excelSkills)
registerGroup('code', codeSkills)
registerGroup('analytics', analyticsSkills)
registerGroup('agent', agentSkills)

// 取得全部技能

export function getAllSkills() {

    return Array.from(registry.values())
        .map(skill => ({ ...skill }))
}

// 取得指定技能

export function getSkill(id) {

    const skill = registry.get(id)

    return skill ? { ...skill } : null
}

// 取得技能分類

export function getCategories() {

    return categories.map(
        category => ({ ...category })
    )
}

// 取得指定分類技能

export function getSkillsByCategory(categoryId) {

    return getAllSkills().filter(
        skill => skill.category === categoryId
    )
}

// 取得六大技能群組

export function getSkillGroups() {

    return categories.map(category => ({

        ...category,

        tools: getSkillsByCategory(category.id)
    }))
}

// 搜尋技能

export function searchSkillGroups(
    keyword = '',
    categoryId = 'all'
) {

    const query = String(keyword)
        .trim()
        .toLowerCase()

    return getSkillGroups()

        .filter(group =>
            categoryId === 'all' ||
            group.id === categoryId
        )

        .map(group => ({

            ...group,

            tools: group.tools.filter(skill => {

                const text = [
                    skill.id,
                    skill.name,
                    group.name
                ].join(' ').toLowerCase()

                return text.includes(query)
            })
        }))

        .filter(group =>
            group.tools.length > 0
        )
}

// 技能數量

export function getSkillCount() {

    return registry.size
}

// 技能統計

export function getSkillStatistics() {

    const skills = getAllSkills()

    return {

        total: skills.length,

        categories: categories.length,

        ready: skills.filter(
            skill => skill.status === 'ready'
        ).length,

        development: skills.filter(
            skill => skill.status === 'development'
        ).length,

        planned: skills.filter(
            skill => skill.status === 'planned'
        ).length,

        browser: skills.filter(
            skill => skill.runtime === 'browser'
        ).length,

        server: skills.filter(
            skill => skill.runtime === 'server'
        ).length,

        agent: skills.filter(
            skill => skill.runtime === 'agent'
        ).length
    }
}

// 檢查技能是否已開放

export function isSkillAvailable(id) {

    return registry.get(id)?.status === 'ready'
}

// 更新技能狀態

export function setSkillStatus(id, status) {

    const skill = registry.get(id)

    if (!skill) return false

    if (!Object.hasOwn(statusLabels, status)) {

        return false
    }

    skill.status = status

    return true
}

console.log(
    'SkillIsland V1.9 技能管理中心',
    getSkillStatistics()
)
