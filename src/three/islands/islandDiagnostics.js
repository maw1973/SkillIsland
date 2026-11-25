import * as THREE from 'three'

// SkillIsland V9.0.0
// 七大技能島整體場景診斷

const islandNames = {
    central: '中央智慧廣場',
    image: '影像技能島',
    document: '文件技能島',
    excel: 'Excel 技能島',
    code: '程式開發島',
    analytics: '數據分析島',
    agent: '智慧代理島'
}

const expectedIslandIds = Object.keys(islandNames)

const agentModules = [
    ['V8.8.0', '智慧代理總部', 'AgentHeadquarters_V880'],
    ['V8.8.1', '機器人展示區', 'AgentRobotExhibition_V881'],
    ['V8.8.2', '多代理協作中心', 'AgentCollaborationCenter_V882'],
    ['V8.8.3', '自動化任務產線', 'AgentWorkflow_V883'],
    ['V8.8.4', '巨型智慧運算核心', 'AgentComputingCore_V884'],
    ['V8.8.5', '機器人動態工作', 'AgentRobotWorkers_V885'],
    ['V8.8.5.1', '機器人工作強化', 'AgentRobotWorkEffects_V8851'],
    ['V8.8.6', '智慧代理島景觀', 'AgentLandscape_V886']
]

const analyticsModules = [
    ['V8.6.2', '戶外商業智慧', 'OutdoorBusinessIntelligence_V862'],
    ['V8.7.0', '全息地球', 'HolographicEarth_V870'],
    ['V8.7.1', '巨型數據圖', 'GiantDataChart_V871'],
    ['V8.7.2', '旋轉數據光環', 'RotatingDataRings_V872'],
    ['V8.7.3', '弧形展示牆', 'CurvedDataWall_V873'],
    ['V8.7.4', '地面數據網路', 'GroundDataNetwork_V874'],
    ['V8.7.5', '分析工作人員', 'AnalyticsPeople_V875'],
    ['V8.7.6', '數據分析島景觀', 'AnalyticsLandscape_V876']
]

// ==================================
// 01 共用資源統計
// ==================================

function createStats() {

    return {
        objects: 0,
        meshes: 0,
        groups: 0,
        sprites: 0,
        lines: 0,
        lights: 0,
        instancedMeshes: 0,
        instances: 0,
        triangles: 0,
        callbacks: 0,
        hiddenObjects: 0,
        invalidTransforms: 0,
        geometries: new Set(),
        materials: new Set(),
        textures: new Set()
    }

}

function isFiniteVector(vector) {

    return (
        Number.isFinite(vector.x) &&
        Number.isFinite(vector.y) &&
        Number.isFinite(vector.z)
    )

}

function collectMaterial(material, stats) {

    if (!material) return

    if (stats.materials.has(material)) return

    stats.materials.add(material)

    Object.values(material).forEach(value => {

        if (value?.isTexture) {
            stats.textures.add(value)
        }

    })

    if (material.uniforms) {

        Object.values(material.uniforms).forEach(uniform => {

            if (uniform?.value?.isTexture) {
                stats.textures.add(uniform.value)
            }

        })

    }

}

// ==================================
// 02 單一物件資源統計
// ==================================

function collectObject(object, stats) {

    stats.objects++

    if (object.isGroup) stats.groups++

    if (object.isSprite) stats.sprites++

    if (object.isLine) stats.lines++

    if (object.isLight) stats.lights++

    if (!object.visible) stats.hiddenObjects++

    if (
        !isFiniteVector(object.position) ||
        !isFiniteVector(object.scale) ||
        !isFiniteVector(object.rotation) ||
        !Number.isFinite(object.quaternion.w)
    ) {
        stats.invalidTransforms++
    }

    if (
        object.onBeforeRender !==
        THREE.Object3D.prototype.onBeforeRender
    ) {
        stats.callbacks++
    }

    if (object.isMesh) {

        stats.meshes++

        const geometry = object.geometry

        const multiplier =
            object.isInstancedMesh
                ? object.count
                : 1

        if (object.isInstancedMesh) {

            stats.instancedMeshes++

            stats.instances += object.count

        }

        if (geometry) {

            const vertexCount =
                geometry.index?.count ??
                geometry.attributes.position?.count ??
                0

            const start = geometry.drawRange?.start || 0

            const requested =
                geometry.drawRange?.count ?? Infinity

            const drawable = Math.max(
                0,
                Math.min(vertexCount - start, requested)
            )

            stats.triangles +=
                Math.floor(drawable / 3) * multiplier

        }

    }

    if (object.geometry) {

        stats.geometries.add(object.geometry)

    }

    if (object.material) {

        const materials =
            Array.isArray(object.material)
                ? object.material
                : [object.material]

        materials.forEach(material => {

            collectMaterial(material, stats)

        })

    }

}

// ==================================
// 03 統計單一群組
// ==================================

function scanGroup(group) {

    const stats = createStats()

    group.traverse(object => {

        collectObject(object, stats)

    })

    return stats

}

function summarize(stats) {

    return {

        objects: stats.objects,
        meshes: stats.meshes,
        groups: stats.groups,
        geometries: stats.geometries.size,
        materials: stats.materials.size,
        textures: stats.textures.size,
        triangles: stats.triangles,
        instancedMeshes: stats.instancedMeshes,
        instances: stats.instances,
        callbacks: stats.callbacks,
        hiddenObjects: stats.hiddenObjects,
        invalidTransforms: stats.invalidTransforms

    }

}

// ==================================
// 04 模組存在及內容檢查
// ==================================

function inspectModules(island, modules) {

    if (!island?.group) return []

    return modules.map(([version, title, name]) => {

        const object =
            island.group.getObjectByName(name)

        let meshes = 0

        if (object) {

            object.traverse(child => {

                if (child.isMesh) meshes++

            })

        }

        return {

            version,
            module: title,
            objectName: name,

            status: !object
                ? '未建立'
                : meshes === 0
                    ? '無Mesh'
                    : '已建立',

            meshes,

            children:
                object?.children.length || 0

        }

    })

}

// ==================================
// 05 地形範圍初步診斷
// ==================================

function inspectBoundaries(island) {

    const warnings = []

    const radius = Number(island.config?.radius)

    if (!Number.isFinite(radius) || radius <= 0) {

        return {
            status: '無有效radius設定',
            warnings
        }

    }

    const group = island.group

    group.updateWorldMatrix(true, true)

    const inverse =
        group.matrixWorld.clone().invert()

    const box = new THREE.Box3()

    const center = new THREE.Vector3()

    const targetNames = new Set([
        ...agentModules.map(item => item[2]),
        ...analyticsModules.map(item => item[2])
    ])

    group.traverse(object => {

        if (!object.isGroup) return

        if (
            !targetNames.has(object.name) &&
            !object.name.startsWith('AgentExhibit_') &&
            !object.name.startsWith('AnalyticsPerson_') &&
            !object.name.startsWith('AgentPatrolRobot_') &&
            !object.name.startsWith('AgentCargoRobot_')
        ) return

        box.setFromObject(object)

        if (box.isEmpty()) return

        box.applyMatrix4(inverse)

        box.getCenter(center)

        const centerDistance =
            Math.hypot(center.x, center.z)

        const corners = [

            Math.hypot(box.min.x, box.min.z),
            Math.hypot(box.min.x, box.max.z),
            Math.hypot(box.max.x, box.min.z),
            Math.hypot(box.max.x, box.max.z)

        ]

        const maximumDistance =
            Math.max(...corners)

        if (
            centerDistance > radius ||
            maximumDistance > radius + 0.5
        ) {

            warnings.push({

                island: island.config.id,

                object: object.name,

                centerDistance:
                    Number(centerDistance.toFixed(2)),

                maximumDistance:
                    Number(maximumDistance.toFixed(2)),

                islandRadius: radius,

                type: centerDistance > radius
                    ? '中心超出半徑'
                    : '包圍盒可能超界'

            })

        }

    })

    return {

        status: '已執行半徑初篩',

        warnings

    }

}

// ==================================
// 06 主要診斷入口
// ==================================

export function runIslandDiagnostics(islands) {

    if (!Array.isArray(islands)) {

        console.warn('[V9.0.0] 無有效島嶼資料')

        return null

    }

    const started = performance.now()

    const rows = []

    const boundaryWarnings = []

    const totalStats = createStats()

    const ids = islands.map(
        island => island.config?.id
    )

    const missingIds = expectedIslandIds.filter(
        id => !ids.includes(id)
    )

    const duplicateIds = ids.filter(
        (id, index) => ids.indexOf(id) !== index
    )

    console.group(
        'SkillIsland V9.0.0 全群島場景診斷'
    )

    // 七座島嶼逐一統計

    islands.forEach(island => {

        if (!island?.group) return

        const id = island.config?.id || island.group.name

        const stats = scanGroup(island.group)

        rows.push({

            id,

            island: islandNames[id] || id,

            ...summarize(stats)

        })

        // 全群島統計會去除重複資源

        island.group.traverse(object => {

            collectObject(object, totalStats)

        })

        const boundary =
            inspectBoundaries(island)

        boundaryWarnings.push(
            ...boundary.warnings
        )

    })

    console.log('01 島嶼完整性')

    console.table(
        expectedIslandIds.map(id => ({

            id,

            island: islandNames[id],

            status: ids.includes(id)
                ? '存在'
                : '缺少'

        }))
    )

    console.log('02 各島嶼資源統計')

    console.table(rows)

    const total = summarize(totalStats)

    console.log('03 全群島資源總計')

    console.table([total])

    // Mesh 數量排行

    console.log('04 模型資源使用排行')

    console.table(

        [...rows]

            .sort((a, b) => b.triangles - a.triangles)

            .map((row, index) => ({

                rank: index + 1,

                island: row.island,

                meshes: row.meshes,

                triangles: row.triangles,

                materials: row.materials,

                textures: row.textures

            }))

    )

    // 數據分析島診斷

    const analyticsIsland = islands.find(
        island => island.config?.id === 'analytics'
    )

    const analyticsReport = inspectModules(
        analyticsIsland,
        analyticsModules
    )

    console.log('05 數據分析島模組')

    console.table(analyticsReport)

    // 智慧代理島診斷

    const agentIsland = islands.find(
        island => island.config?.id === 'agent'
    )

    const agentReport = inspectModules(
        agentIsland,
        agentModules
    )

    console.log('06 智慧代理島模組')

    console.table(agentReport)

    // 地形超界初篩

    console.log('07 地形範圍初步檢查')

    if (boundaryWarnings.length > 0) {

        console.table(boundaryWarnings)

    } else {

        console.log(
            '未發現可判定的半徑超界項目'
        )

    }

    // 無效座標及比例

    console.log('08 無效座標檢查')

    if (total.invalidTransforms > 0) {

        islands.forEach(island => {

            island.group?.traverse(object => {

                if (
                    !isFiniteVector(object.position) ||
                    !isFiniteVector(object.scale) ||
                    !isFiniteVector(object.rotation) ||
                    !Number.isFinite(object.quaternion.w)
                ) {

                    console.warn(
                        '無效變換',
                        island.config?.id,
                        object.name,
                        object.position
                    )

                }

            })

        })

    } else {

        console.log('無效變換數量：0')

    }

    const report = {

        version: 'V9.0.0',

        islandCount: islands.length,

        missingIds,

        duplicateIds,

        islands: rows,

        total,

        analyticsModules: analyticsReport,

        agentModules: agentReport,

        boundaryWarnings,

        elapsedMs: Number(

            (performance.now() - started).toFixed(2)

        )

    }

    console.log('09 診斷摘要', {

        islandCount: report.islandCount,

        missingIslands: missingIds.length,

        duplicateIslands: duplicateIds.length,

        analyticsModules:

            analyticsReport.filter(
                row => row.status === '已建立'
            ).length + '/8',

        agentModules:

            agentReport.filter(
                row => row.status === '已建立'
            ).length + '/8',

        invalidTransforms:
            total.invalidTransforms,

        boundaryWarnings:
            boundaryWarnings.length,

        elapsedMs:
            report.elapsedMs

    })

    console.groupEnd()

    return report

}

// ==================================
// 07 瀏覽器手動診斷工具
// ==================================

export function installIslandDiagnostics(islands) {

    if (typeof window === 'undefined') return

    window.SkillIslandDiagnostics = {

        version: 'V9.0.0',

        report: null,

        run() {

            this.report =
                runIslandDiagnostics(islands)

            return this.report

        },

        summary() {

            return this.report?.total || null

        },

        inspect(id) {

            const island = islands.find(
                item => item.config?.id === id
            )

            if (!island?.group) return null

            const result = summarize(
                scanGroup(island.group)
            )

            console.table([result])

            return result

        }

    }

    window.SkillIslandDiagnostics.run()

    console.log(
        '[V9.0.0] 全群島診斷工具安裝完成'
    )

    return window.SkillIslandDiagnostics

}
