import * as THREE from 'three'

// SkillIsland V9.0.3
// 實際地形接地診斷

export function checkIslandGround(
    islands,
    { autoFix = true } = {}
) {

    const raycaster = new THREE.Raycaster()

    const down = new THREE.Vector3(0, -1, 0)

    const report = []

    const overlapReport = []

    const terrainReport = []

    let fixedCount = 0

    const originalKey = 'GroundCheckOriginalPosition'

    // ==================================
    // 01 辨識地形網格
    // ==================================

    function getTerrainMeshes(island) {

        const meshes = []

        const knownObjects = [

            island.terrain,
            island.terrainMesh,
            island.ground,
            island.groundMesh,
            island.surface,
            island.land

        ]

        function addObject(object) {

            if (!object?.isObject3D) return

            if (object === island.group) return

            object.traverse(child => {

                if (
                    child.isMesh &&
                    !meshes.includes(child)
                ) {

                    meshes.push(child)

                }

            })

        }

        knownObjects.forEach(addObject)

        // 若沒有明確地形參照，
        // 嘗試辨識島嶼底層地形名稱

        if (meshes.length === 0) {

            island.group.children.forEach(child => {

                const name = child.name || ''

                const isTerrain =
                    /^(terrain|ground|islandterrain|islandground|landsurface|grasstop|islandsurface)/i
                    .test(name)

                const excluded =
                    /network|building|path|plaza|platform|worker/i
                    .test(name)

                if (isTerrain && !excluded) {

                    addObject(child)

                }

            })

        }

        return meshes

    }

    // ==================================
    // 02 取得實際地面高度
    // ==================================

    function getGroundHeight(
        meshes,
        x,
        z,
        top
    ) {

        raycaster.set(

            new THREE.Vector3(
                x, top, z
            ),

            down

        )

        const intersections =
            raycaster.intersectObjects(
                meshes,
                false
            )

        const hit = intersections.find(item =>
            Number.isFinite(item.point.y)
        )

        return hit ? hit.point.y : null

    }

    // ==================================
    // 03 辨識需要接地的人物
    // ==================================

    function getGroundedCharacters(island) {

        const objects = []

        island.group.traverse(object => {

            if (!object.isGroup) return

            if (

                /^AnalyticsPerson_\d+$/.test(
                    object.name
                ) ||

                /^AgentPatrolRobot_\d+$/.test(
                    object.name
                ) ||

                /^AgentCargoRobot_\d+$/.test(
                    object.name
                ) ||

                object.name === 'AgentServiceRobot'

            ) {

                objects.push(object)

            }

        })

        return objects

    }

    // ==================================
    // 04 人物及機器人接地檢查
    // ==================================

    function inspectCharacter(
        island,
        object,
        meshes,
        rayTop
    ) {

        object.updateWorldMatrix(true, true)

        const bounds =
            new THREE.Box3().setFromObject(
                object,
                true
            )

        if (bounds.isEmpty()) return

        const position =
            object.getWorldPosition(
                new THREE.Vector3()
            )

        // 檢查中心點與腳底周圍

        const offsets = [

            [0, 0],
            [-0.18, -0.18],
            [-0.18, 0.18],
            [0.18, -0.18],
            [0.18, 0.18]

        ]

        const heights = offsets.map(([dx, dz]) =>

            getGroundHeight(

                meshes,

                position.x + dx,

                position.z + dz,

                rayTop

            )

        )

        if (heights.some(value => value === null)) {

            report.push({

                island: island.config?.id,

                object: object.name,

                status: '部分位置無地形',

                correction: 0

            })

            return

        }

        const groundHeight = Math.max(...heights)

        const groundDifference =
            bounds.min.y - groundHeight

        const surfaceVariation =
            Math.max(...heights) -
            Math.min(...heights)

        // 地形高低差太大時，
        // 避免直接把人物移到斜坡上

        if (surfaceVariation > 0.35) {

            report.push({

                island: island.config?.id,

                object: object.name,

                status: '地形坡度較大，需人工檢查',

                difference:
                    Number(groundDifference.toFixed(3)),

                correction: 0

            })

            return

        }

        if (Math.abs(groundDifference) <= 0.1) {

            report.push({

                island: island.config?.id,

                object: object.name,

                status: '正常接地',

                difference:
                    Number(groundDifference.toFixed(3)),

                correction: 0

            })

            return

        }

        // 移動式人物及機器人可能由動畫控制高度
        // 因此僅診斷，不直接修改

        const moving =

            /^AgentPatrolRobot_/.test(object.name) ||

            /^AgentCargoRobot_/.test(object.name) ||

            /^AnalyticsPerson_(9|10)$/.test(object.name)

        const correction = -groundDifference

        let status = groundDifference > 0
            ? '疑似懸空'
            : '疑似陷入地面'

        // 只修正少量、可確認的靜態高度偏差

        if (

            autoFix &&

            !moving &&

            Math.abs(correction) <= 0.65 &&

            object.parent

        ) {

            if (!object.userData[originalKey]) {

                object.userData[originalKey] =
                    object.position.toArray()

            }

            const target = position.clone()

            target.y += correction

            object.position.copy(

                object.parent.worldToLocal(target)

            )

            object.updateWorldMatrix(true, true)

            status = '已修正高度'

            fixedCount++

        }

        report.push({

            island: island.config?.id,

            object: object.name,

            status,

            difference:
                Number(groundDifference.toFixed(3)),

            correction:
                status === '已修正高度'
                    ? Number(correction.toFixed(3))
                    : 0

        })

    }

    // ==================================
    // 05 指定大型設備重疊檢查
    // ==================================

    const facilityNames = {

        analytics: [

            'Building_analytics',
            'OutdoorBusinessIntelligence_V862',
            'HolographicEarth_V870',
            'GiantDataChart_V871',
            'CurvedDataWall_V873'

        ],

        agent: [

            'Building_agent',
            'AgentTaskControlPlatform',
            'AgentWorkflow_V883',
            'AgentComputingCore_V884',
            'AgentExhibit_Search',
            'AgentExhibit_Document',
            'AgentExhibit_Coding',
            'AgentExhibit_Analytics',
            'AgentExhibit_Workflow'

        ]

    }

    function inspectOverlaps(island) {

        const id = island.config?.id

        const names = facilityNames[id] || []

        const facilities = []

        names.forEach(name => {

            const object =
                island.group.getObjectByName(name)

            if (!object) return

            const bounds =
                new THREE.Box3().setFromObject(
                    object
                )

            if (bounds.isEmpty()) return

            facilities.push({

                name,
                bounds

            })

        })

        for (let i = 0; i < facilities.length; i++) {

            for (
                let j = i + 1;
                j < facilities.length;
                j++
            ) {

                const a = facilities[i]

                const b = facilities[j]

                if (
                    !a.bounds.intersectsBox(b.bounds)
                ) continue

                const intersection =
                    a.bounds.clone().intersect(
                        b.bounds
                    )

                const size =
                    intersection.getSize(
                        new THREE.Vector3()
                    )

                if (
                    size.x < 0.15 ||
                    size.y < 0.15 ||
                    size.z < 0.15
                ) continue

                overlapReport.push({

                    island: id,

                    objectA: a.name,

                    objectB: b.name,

                    overlapX:
                        Number(size.x.toFixed(2)),

                    overlapY:
                        Number(size.y.toFixed(2)),

                    overlapZ:
                        Number(size.z.toFixed(2)),

                    status: '包圍盒可能重疊'

                })

            }

        }

    }

    // ==================================
    // 06 七座技能島統一診斷
    // ==================================

    islands.forEach(island => {

        if (!island?.group) return

        island.group.updateWorldMatrix(true, true)

        const meshes =
            getTerrainMeshes(island)

        const characters =
            getGroundedCharacters(island)

        terrainReport.push({

            island: island.config?.id,

            terrainMeshes: meshes.length,

            characters: characters.length,

            status: meshes.length > 0
                ? '已辨識地形'
                : '尚未辨識地形'

        })

        inspectOverlaps(island)

        if (meshes.length === 0) {

            // 無法辨識地形就不修改座標

            return

        }

        const terrainBounds = new THREE.Box3()

        meshes.forEach(mesh => {

            terrainBounds.union(

                new THREE.Box3().setFromObject(mesh)

            )

        })

        if (terrainBounds.isEmpty()) return

        const rayTop = terrainBounds.max.y + 30

        characters.forEach(object => {

            inspectCharacter(

                island,
                object,
                meshes,
                rayTop

            )

        })

    })

    // ==================================
    // 07 輸出診斷報告
    // ==================================

    const result = {

        version: 'V9.0.3',

        terrain: terrainReport,

        characters: report,

        overlaps: overlapReport,

        fixedCount

    }

    console.group(
        'SkillIsland V9.0.3 地形接地診斷'
    )

    console.log('01 地形辨識')

    console.table(terrainReport)

    console.log('02 人物與機器人接地狀態')

    console.table(report)

    console.log('03 設備包圍盒重疊初篩')

    console.table(overlapReport)

    console.log('04 診斷摘要', {

        recognizedIslands:

            terrainReport.filter(
                row => row.terrainMeshes > 0
            ).length,

        checkedCharacters: report.length,

        fixedCharacters: fixedCount,

        possibleOverlaps: overlapReport.length

    })

    console.groupEnd()

    return result

}

// ==================================
// 08 還原自動修正的人物位置
// ==================================

export function restoreGroundPositions(islands) {

    let count = 0

    islands.forEach(island => {

        island.group?.traverse(object => {

            const original =
                object.userData.GroundCheckOriginalPosition

            if (!Array.isArray(original)) return

            object.position.fromArray(original)

            delete object.userData
                .GroundCheckOriginalPosition

            object.updateWorldMatrix(true, true)

            count++

        })

    })

    return count

}
