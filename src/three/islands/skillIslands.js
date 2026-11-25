import { checkIslandGround } from './islandGroundCheck.js'
import { optimizeIslandOrientation } from './islandOrientation.js'
import { installIslandDiagnostics } from './islandDiagnostics.js'
import { createAgentLandscape } from './agentLandscape.js'
import { createAgentRobotWorkEffects } from './agentRobotWorkEffects.js'
import { createAgentRobotWorkers } from './agentRobotWorkers.js'
import { createAgentComputingCore } from './agentComputingCore.js'
import { createAgentWorkflow } from './agentWorkflow.js'
import { createAgentCollaborationCenter } from './agentCollaborationCenter.js'
import { createAgentRobotExhibition } from './agentRobotExhibition.js'
import { createAgentHeadquarters } from './agentHeadquarters.js'

import { createAnalyticsLandscape } from './analyticsLandscape.js'
import { createAnalyticsPeople } from './analyticsPeople.js'
import { createGroundDataNetwork } from './groundDataNetwork.js'
import { createCurvedDataWall } from './curvedDataWall.js'
import { createRotatingDataRings } from './rotatingDataRings.js'
import { createGiantDataChart } from './giantDataChart.js'
import { createOutdoorBusinessIntelligence } from './outdoorBusinessIntelligence.js'

import { createCodeLabDetails } from './codeLabDetails.js'

import { createExcelStudioAnimation } from './excelStudioAnimation.js'
import { createExcelStudioDetails } from './excelStudioDetails.js'

import { createDocumentCenterAnimation } from './documentCenterAnimation.js'
import { createDocumentCenterDetails } from './documentCenterDetails.js'

import { createImageStudioAnimation } from './imageStudioAnimation.js'
import { createImageStudioDetails } from './imageStudioDetails.js'

import { allIslandConfigs } from './islandConfig.js'

import { createIslandTerrain } from './islandTerrain.js'
import { createIslandNature } from './islandNature.js'
import { createIslandPaths } from './islandPaths.js'

import { createSkillBuilding } from './skillBuildings.js'
import { createCentralPlaza } from './centralPlaza.js'
import { createFountainAnimation } from './fountainAnimation.js'
import { createCentralPeople } from './centralPeople.js'
import { createCentralLighting } from './centralLighting.js'

// SkillIsland V9.0.3
// 七座技能島完整整合

export function createSkillIslands(scene) {

    const islands = []

    allIslandConfigs.forEach(config => {

        const island =
            createIslandTerrain(scene, config)

        island.config = config

        island.group.name = config.id

        island.group.userData.islandId =
            config.id

        island.group.userData.islandConfig =
            config

        // ===================================
        // 基礎自然景觀及建築
        // ===================================

        createIslandNature(island)

        createIslandPaths(island)

        island.building =
            createSkillBuilding(island, config)

        // V9.0.2 主建築朝向最佳化
        // 在戶外設施建立前完成方向設定

        if (config.id !== 'central') {

            const centralIsland = islands.find(
                item => item.config?.id === 'central'
            )

            if (centralIsland) {

                optimizeIslandOrientation([
                    centralIsland,
                    island
                ])

            } else {

                console.warn(
                    '[V9.0.2] 中央島尚未建立，保留原方向',
                    config.id
                )

            }

        }



        // ===================================
        // 影像技能島
        // ===================================

        if (config.id === 'image') {

            island.studioDetails =
                createImageStudioDetails(island)

            island.studioAnimation =
                createImageStudioAnimation(island)

            console.log(
                'V8.2.2 戶外攝影區建立完成'
            )

        }

        // ===================================
        // 文件技能島
        // ===================================

        if (config.id === 'document') {

            island.documentDetails =
                createDocumentCenterDetails(island)

            island.documentAnimation =
                createDocumentCenterAnimation(island)

            console.log(
                'V8.3.2 戶外閱讀區建立完成'
            )

        }

        // ===================================
        // Excel 技能島
        // ===================================

        if (config.id === 'excel') {

            island.excelDetails =
                createExcelStudioDetails(island)

            island.excelAnimation =
                createExcelStudioAnimation(island)

            console.log(
                'V8.4.2 Excel 戶外工作區建立完成'
            )

        }

        // ===================================
        // 程式開發島
        // ===================================

        if (config.id === 'code') {

            island.codeDetails =
                createCodeLabDetails(island)

            console.log(
                'V8.5.2 軟體開發工作區建立完成'
            )

        }

        // ===================================
        // 數據分析島
        // ===================================

        if (config.id === 'analytics') {

            // V8.7.1 巨型立體數據圖

            island.giantDataChart =
                createGiantDataChart(island)

            console.log(
                '[V8.7.0.3] 開始建立數據分析島戶外設施'
            )

            island.analyticsDetails =
                createOutdoorBusinessIntelligence(island)

            // V8.7.2 多層旋轉數據光環

            island.rotatingDataRings =
                createRotatingDataRings(island)

            // V8.7.3 巨型弧形數據展示牆

            island.curvedDataWall =
                createCurvedDataWall(island)

            // V8.7.4 地面數據傳輸網路

            island.groundDataNetwork =
                createGroundDataNetwork(island)

            // V8.7.5 科技廣場分析人員

            island.analyticsPeople =
                createAnalyticsPeople(island)

            // V8.7.6 數據分析島景觀

            island.analyticsLandscape =
                createAnalyticsLandscape(island)

            if (!island.analyticsDetails) {

                console.error(
                    '[V8.7.0.3] 戶外分析模組未回傳群組'
                )

            } else {

                console.log(
                    '[V8.7.0.3] 戶外分析區建立完成',
                    island.analyticsDetails.name
                )

            }

            const earth =
                island.group.getObjectByName(
                    'HolographicEarth_V870'
                )

            if (earth) {

                console.log(
                    '[V8.7.0.3] 巨型全息地球確認存在',
                    earth.position
                )

            } else {

                console.error(
                    '[V8.7.0.3] 找不到巨型全息地球'
                )

            }

        }

        // ===================================
        // 中央智慧技能島
        // ===================================

        if (config.id === 'central') {

            island.plaza =
                createCentralPlaza(island)

            island.fountainAnimation =
                createFountainAnimation(island)

            island.people =
                createCentralPeople(island)

            island.lighting =
                createCentralLighting(island)

            console.log(
                'V8.1.6 中央景觀照明完成'
            )

        }

        // ===================================
        // 智慧代理島
        // ===================================

        if (config.id === 'agent') {

            console.log(
                '[V8.8.6] 開始建立智慧代理島'
            )

            // V8.8.0 智慧代理總部

            island.agentHeadquarters =
                createAgentHeadquarters(island)

            // V8.8.1 戶外智慧機器人

            island.agentRobotExhibition =
                createAgentRobotExhibition(island)

            // V8.8.2 多代理協作控制中心

            island.agentCollaborationCenter =
                createAgentCollaborationCenter(island)

            // V8.8.3 自動化任務工作流程

            island.agentWorkflow =
                createAgentWorkflow(island)

            // V8.8.4 巨型智慧運算核心

            island.agentComputingCore =
                createAgentComputingCore(island)

            // V8.8.5 機器人動態工作情境

            island.agentRobotWorkers =
                createAgentRobotWorkers(island)

            // V8.8.5.1 機器人工作效果強化

            island.agentRobotWorkEffects =
                createAgentRobotWorkEffects(island)

            // V8.8.6 智慧代理島整體景觀

            island.agentLandscape =
                createAgentLandscape(island)



            // ===================================
            // 智慧代理島八大模組掛載驗證
            // ===================================

            const modules = [

                {
                    version: 'V8.8.0',
                    name: '智慧代理總部',
                    object: island.agentHeadquarters
                },

                {
                    version: 'V8.8.1',
                    name: '機器人展示區',
                    object: island.agentRobotExhibition
                },

                {
                    version: 'V8.8.2',
                    name: '多代理協作控制中心',
                    object: island.agentCollaborationCenter
                },

                {
                    version: 'V8.8.3',
                    name: '自動化任務產線',
                    object: island.agentWorkflow
                },

                {
                    version: 'V8.8.4',
                    name: '巨型智慧運算核心',
                    object: island.agentComputingCore
                },

                {
                    version: 'V8.8.5',
                    name: '機器人動態工作情境',
                    object: island.agentRobotWorkers
                },

                {
                    version: 'V8.8.5.1',
                    name: '機器人工作效果強化',
                    object: island.agentRobotWorkEffects
                },

                {
                    version: 'V8.8.6',
                    name: '智慧代理島整體景觀',
                    object: island.agentLandscape
                }

            ]

            console.table(

                modules.map(item => ({

                    version: item.version,

                    module: item.name,

                    status: item.object
                        ? item.object.children.length > 0
                            ? '已回傳群組'
                            : '空群組'
                        : '未建立',

                    children:
                        item.object?.children.length || 0

                }))

            )

            const successCount =
                modules.filter(item =>
                    item.object?.children.length > 0
                ).length

            console.log(

                `[V8.8.6] 智慧代理島非空模組：${successCount}/8`

            )

        }

        // ===================================
        // 互動識別資料
        // ===================================

        island.group.traverse(object => {

            object.userData.islandId =
                config.id

            object.userData.islandConfig =
                config

        })

        islands.push(island)

    })

    console.log(

        'SkillIsland V9.0.3 特色技能島：',

        islands.length

    )


    // V9.0.0 七大技能島場景診斷

    if (import.meta.env.DEV) {

        installIslandDiagnostics(islands)

    }


    // V9.0.3 實際地形接地診斷

    if (import.meta.env.DEV) {

        checkIslandGround(islands, {
            autoFix: false
        })

    }

    return islands

}




