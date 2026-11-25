import * as THREE from 'three'

// SkillIsland V9.0.2
// 全群島建築朝向最佳化

const islandNames = {
    central: '中央智慧廣場',
    image: '影像技能島',
    document: '文件技能島',
    excel: 'Excel技能島',
    code: '程式開發島',
    analytics: '數據分析島',
    agent: '智慧代理島'
}

const orientationKey =
    'SkillIslandOriginalOrientation'

export function optimizeIslandOrientation(islands) {

    if (!Array.isArray(islands)) return []

    const central = islands.find(
        island => island.config?.id === 'central'
    )

    if (!central?.group) {

        console.warn(
            '[V9.0.2] 找不到中央島嶼，略過方向調整'
        )

        return []

    }

    const centerWorld = new THREE.Vector3()

    central.group.getWorldPosition(centerWorld)

    const report = []

    islands.forEach(island => {

        const id = island.config?.id

        if (!id || id === 'central') return

        const building =
            island.building ||
            island.group?.getObjectByName(
                `Building_${id}`
            )

        if (!building?.parent) {

            report.push({
                id,
                island: islandNames[id] || id,
                status: '找不到主建築'
            })

            return

        }

        // 保存原始方向，避免重複旋轉

        if (!building.userData[orientationKey]) {

            building.userData[orientationKey] =
                building.quaternion.toArray()

        }

        const islandWorld = new THREE.Vector3()

        island.group.getWorldPosition(islandWorld)

        // 轉換成建築父群組的相對座標

        const parent = building.parent

        const localCenter = parent.worldToLocal(
            centerWorld.clone()
        )

        const localIsland = parent.worldToLocal(
            islandWorld.clone()
        )

        const dx =
            localIsland.x - localCenter.x

        const dz =
            localIsland.z - localCenter.z

        if (Math.hypot(dx, dz) < 0.001) {

            report.push({
                id,
                island: islandNames[id] || id,
                status: '無有效方向'
            })

            return

        }

        const before =
            THREE.MathUtils.radToDeg(
                building.rotation.y
            )

        // 主建築正面以 local +Z 為基準

        const targetAngle = Math.atan2(
            dx,
            dz
        )

        building.rotation.y = targetAngle

        building.updateMatrixWorld(true)

        report.push({

            id,

            island: islandNames[id] || id,

            before: Number(
                before.toFixed(1)
            ),

            after: Number(
                THREE.MathUtils
                    .radToDeg(targetAngle)
                    .toFixed(1)
            ),

            status: '朝向外側'

        })

    })

    console.log(
        '[V9.0.2] 全群島建築朝向最佳化完成'
    )

    console.table(report)

    return report

}

// ==================================
// 還原單座島嶼原始建築方向
// ==================================

export function restoreIslandOrientation(islands, id) {

    const island = islands.find(
        item => item.config?.id === id
    )

    const building = island?.building

    const original =
        building?.userData[orientationKey]

    if (!building || !original) return false

    building.quaternion.fromArray(original)

    building.updateMatrixWorld(true)

    console.log(
        '[V9.0.2] 已還原原始方向',
        id
    )

    return true

}
