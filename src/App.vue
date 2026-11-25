<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import SummaryStudio from './components/tools/SummaryStudio.vue'
import MarkdownStudio from './components/tools/MarkdownStudio.vue'
import SkillStudio from './components/tools/SkillStudio.vue'
import CsvAnalytics from './components/tools/CsvAnalytics.vue'
import PieChart from './components/tools/PieChart.vue'
import LineChart from './components/tools/LineChart.vue'
import BarChart from './components/tools/BarChart.vue'
import TextEncoding from './components/tools/TextEncoding.vue'
import CodeFormatter from './components/tools/CodeFormatter.vue'
import SqlTools from './components/tools/SqlTools.vue'
import JsonFormatter from './components/tools/JsonFormatter.vue'
import ExcelStatistics from './components/tools/ExcelStatistics.vue'
import ExcelDuplicate from './components/tools/ExcelDuplicate.vue'
import ExcelDate from './components/tools/ExcelDate.vue'
import ExcelClean from './components/tools/ExcelClean.vue'
import DocumentConvert from './components/tools/DocumentConvert.vue'
import PdfTextExtract from './components/tools/PdfTextExtract.vue'
import PdfSplit from './components/tools/PdfSplit.vue'
import PdfMerge from './components/tools/PdfMerge.vue'
import ImageAdjust from './components/tools/ImageAdjust.vue'
import ImageCropCompress from './components/tools/ImageCropCompress.vue'
import ImageDrawing from './components/tools/ImageDrawing.vue'
import ImageMagnifier from './components/tools/ImageMagnifier.vue'
import { initSkillIsland } from './three/main.js'
import { getSkillGroups, searchSkillGroups, runtimeLabels, statusLabels, setSkillStatus } from './skills/skillManager.js'
const world = ref(null), error = ref(''), open = ref(false), category = ref('all'), search = ref('')
const devMode = import.meta.env.DEV
let engine = null
const uiHidden = ref(false), settingsOpen = ref(false), showFps = ref(false), introActive = ref(false), ready = ref(false)
const appRoot = ref(null)
const isFullscreen = ref(false), fullscreenError = ref('')
const autoHide = ref(false), shortcuts = ref(true)
const fullscreenSupported = ref(false)
const PREF_KEY = 'SkillIslandDisplayPreferences'
let idleTimer = null
try {
  const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}') || {}
  autoHide.value = saved.autoHide === true
  shortcuts.value = saved.shortcuts !== false
  showFps.value = saved.showFps === true
} catch {}
function savePreferences(){
  try { localStorage.setItem(PREF_KEY, JSON.stringify({autoHide:autoHide.value, shortcuts:shortcuts.value, showFps:showFps.value})) } catch {}
}
function syncFullscreen(){ isFullscreen.value = !!document.fullscreenElement }
async function toggleFullscreen(){
  fullscreenError.value = ''
  try {
    if(document.fullscreenElement) await document.exitFullscreen()
    else if(appRoot.value?.requestFullscreen) await appRoot.value.requestFullscreen()
    else fullscreenError.value = '此瀏覽器不支援全螢幕，請使用 F11。'
  } catch { fullscreenError.value = '無法切換全螢幕，請使用瀏覽器 F11。' }
}
function clearIdle(){ if(idleTimer !== null) clearTimeout(idleTimer); idleTimer = null }
function scheduleIdle(){
  clearIdle()
  if(!autoHide.value || uiHidden.value || open.value || settingsOpen.value || !ready.value || document.hidden) return
  idleTimer = setTimeout(()=>{
    idleTimer = null
    if(!autoHide.value || uiHidden.value || open.value || settingsOpen.value || document.hidden) return
    if(document.activeElement?.closest?.('.si-header')) { scheduleIdle(); return }
    uiHidden.value = true
  },10000)
}
watch([autoHide,shortcuts,showFps],savePreferences)
watch([autoHide,uiHidden,open,settingsOpen,ready],scheduleIdle)
const appearanceMode = ref('original')
const appearanceModes = [{id:'original',name:'☀ 原始'},{id:'vivid',name:'🎨 鮮豔'},{id:'sunset',name:'🌇 黃昏'},{id:'night',name:'🌙 夜間'}]
function chooseAppearance(id){if(engine?.worldAppearance?.setMode(id)) appearanceMode.value=id}
const audioEnabled = ref(false), audioBusy = ref(false), audioError = ref(''), audioVolume = ref(35)
try { const v = localStorage.getItem('SkillIslandAudioVolume'); if(v !== null && Number.isFinite(Number(v))) audioVolume.value = Math.min(100,Math.max(0,Number(v))) } catch {}
watch(audioVolume, v => { engine?.ambientAudio?.setVolume(v/100); try { localStorage.setItem('SkillIslandAudioVolume',String(v)) } catch {} })
async function toggleAudio(){
  if(audioBusy.value || !engine?.ambientAudio) return
  audioError.value=''
  if(audioEnabled.value){ engine.ambientAudio.stop(); audioEnabled.value=false; return }
  audioBusy.value=true
  try { await engine.ambientAudio.start(audioVolume.value/100); audioEnabled.value=!!engine?.ambientAudio?.active }
  catch { audioError.value='無法啟用音效，請再次點擊。' }
  finally { audioBusy.value=false }
}
const photoLabels = ref(true), photoBusy = ref(false), photoError = ref('')
async function capturePhoto(){
  if(!ready.value || photoBusy.value || open.value || !engine?.capturePhoto) return
  photoBusy.value=true; photoError.value=''
  try { await engine.capturePhoto({labels:photoLabels.value}) }
  catch(e){ photoError.value='截圖失敗：'+(e?.message || '請重試'); console.error(e) }
  finally { photoBusy.value=false }
}
const weatherMode = ref('clear')
const weatherModes = [{id:'clear',name:'☀ 晴天'},{id:'cloudy',name:'☁ 陰天'},{id:'rain',name:'🌧 雨天'},{id:'fog',name:'🌫 霧天'}]
function chooseWeather(id){if(engine?.weather?.setMode(id)) weatherMode.value=id}

const tourActive = ref(false), tourStatus = ref('')
function syncTour(e){
  tourActive.value = !!engine?.islandTour?.active
  tourStatus.value = tourActive.value ? (e?.detail?.label || '') : ''
}
function stopTour(){ engine?.islandTour?.finish(); syncTour() }
function toggleTour(){
  if(tourActive.value){ stopTour(); return }
  stopIntro(); closeCenter(); engine?.interaction.prepareIntro(); engine?.islandTour?.start()
}
function syncIntro(){ introActive.value = !!engine?.cinematicIntro?.active }
function stopIntro(){ engine?.cinematicIntro?.finish(); syncIntro() }
function toggleIntro(){
  if (introActive.value) { stopIntro(); return }
  stopTour(); closeCenter(); engine?.interaction.prepareIntro(); engine?.cinematicIntro?.start(); syncIntro()
}
function toggleUI(){
  if (!uiHidden.value) { closeCenter(); settingsOpen.value=false }
  uiHidden.value=!uiHidden.value
}

setSkillStatus('image-magnifier', 'ready')
setSkillStatus('image-drawing', 'ready')
setSkillStatus('image-eraser', 'ready')
setSkillStatus('image-crop', 'ready')
setSkillStatus('image-compress', 'ready')
setSkillStatus('image-adjust', 'ready')
setSkillStatus('pdf-merge', 'ready')
setSkillStatus('pdf-split', 'ready')
setSkillStatus('document-text', 'ready')
setSkillStatus('document-convert', 'ready')
setSkillStatus('excel-clean', 'ready')
setSkillStatus('excel-date', 'ready')
setSkillStatus('excel-duplicate', 'ready')
setSkillStatus('excel-statistics', 'ready')
setSkillStatus('code-json', 'ready')
setSkillStatus('code-sql', 'ready')
setSkillStatus('code-format', 'ready')
setSkillStatus('code-encoding', 'ready')
setSkillStatus('chart-bar', 'ready')
setSkillStatus('chart-line', 'ready')
setSkillStatus('chart-pie', 'ready')
setSkillStatus('analytics-csv', 'ready')
setSkillStatus('agent-skills', 'ready')
setSkillStatus('agent-markdown', 'ready')
setSkillStatus('agent-summary', 'ready')
const activeTool = ref(false)
// 排除已停用的舊任務工具，保留25項獨立技能。
const visibleGroups = list => list.map(g => ({ ...g, tools: g.tools.filter(t => t.id !== 'agent-task') })).filter(g => g.tools.length > 0)
const groups = visibleGroups(getSkillGroups())
const total = groups.reduce((sum, g) => sum + g.tools.length, 0)
const filtered = computed(() => visibleGroups(searchSkillGroups(search.value, category.value)))
function showCenter(id='all'){stopTour();stopIntro();engine?.interaction.prepareIntro();activeTool.value=false;category.value=id;search.value='';open.value=true; if(engine) engine.controls.enabled=false}
function closeCenter(){const wasOpen=open.value;activeTool.value=false;open.value=false;if(engine&&wasOpen) engine.controls.enabled=true}
function resetView(){stopTour();stopIntro();closeCenter();if(engine?.resetView)engine.resetView();else engine?.controls.reset()}
function explore(id){stopTour();stopIntro();closeCenter();const island=engine?.islands.find(i=>i.config.id===id);if(island)engine.interaction.focusIsland(island)}
function keydown(e){
  if(e.key==='Escape' && open.value){ if(activeTool.value)activeTool.value=false;else closeCenter();return }
  if(!shortcuts.value || !ready.value || open.value || e.defaultPrevented || e.repeat || e.isComposing || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return
  if(e.target?.closest?.('input,textarea,select,button,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')) return
  const actions = {f:toggleFullscreen,h:toggleUI,r:resetView,c:toggleIntro,t:toggleTour,p:capturePhoto,'1':()=>chooseAppearance('original'),'2':()=>chooseAppearance('vivid'),'3':()=>chooseAppearance('sunset'),'4':()=>chooseAppearance('night')}
  const action = actions[e.key.toLowerCase()]
  if(typeof action==='function' && Object.hasOwn(actions,e.key.toLowerCase())) { e.preventDefault();action() }
}
// Bridge from the existing Three.js introduction panel to Vue.
function onWorldClick(e){const panel=e.target.closest?.('section[aria-label="技能島介紹"]');if(!panel)return;const heading=panel.querySelector('h2')?.textContent;const island=engine?.islands.find(i=>i.config.name===heading);if(e.target.closest('[data-open-skills]'))showCenter(island?.config.id==='central'?'all':island?.config.id||'all')}
let observer, headerObserver
function measureHeader(){ const root=appRoot.value; if(!root)return; const header=root.querySelector('.si-header'); root.style.setProperty('--si-center-top',`${header ? header.offsetTop+header.offsetHeight+12 : 65}px`) }
function observeHeader(){headerObserver?.disconnect();const header=appRoot.value?.querySelector('.si-header');if(header)headerObserver?.observe(header);measureHeader()}
watch(uiHidden,observeHeader,{flush:'post'})
function enhancePanel(){const panel=world.value?.querySelector('section[aria-label="技能島介紹"]');if(!panel||!panel.querySelector('h2')||panel.querySelector('[data-open-skills]'))return;const b=document.createElement('button');b.type='button';b.dataset.openSkills='true';b.textContent='開啟技能中心';b.style.cssText='width:100%;border:0;border-radius:12px;padding:12px;margin-top:8px;background:#6d28d9;color:white;font-weight:700;cursor:pointer';panel.appendChild(b)}
onMounted(()=>{try{engine=initSkillIsland(world.value);ready.value=true;appearanceMode.value=engine.worldAppearance?.mode || 'original';weatherMode.value=engine.weather?.mode || 'clear';syncIntro();world.value.addEventListener('skillisland:introchange',syncIntro);world.value.addEventListener('skillisland:tourchange',syncTour);observer=new MutationObserver(enhancePanel);observer.observe(world.value,{childList:true,subtree:true});world.value.addEventListener('click',onWorldClick)}catch(e){error.value=e.message;console.error(e)}window.addEventListener('keydown',keydown);fullscreenSupported.value=!!document.fullscreenEnabled && !!appRoot.value?.requestFullscreen;syncFullscreen();headerObserver=new ResizeObserver(measureHeader);observeHeader();document.addEventListener('fullscreenchange',syncFullscreen);document.addEventListener('visibilitychange',scheduleIdle);for(const event of ['pointermove','pointerdown','wheel','keydown','focusin','focusout']) window.addEventListener(event,scheduleIdle,{passive:true});scheduleIdle()})
onBeforeUnmount(()=>{headerObserver?.disconnect();observer?.disconnect();world.value?.removeEventListener('skillisland:introchange',syncIntro);world.value?.removeEventListener('skillisland:tourchange',syncTour);world.value?.removeEventListener('click',onWorldClick);window.removeEventListener('keydown',keydown);document.removeEventListener('fullscreenchange',syncFullscreen);document.removeEventListener('visibilitychange',scheduleIdle);for(const event of ['pointermove','pointerdown','wheel','keydown','focusin','focusout']) window.removeEventListener(event,scheduleIdle);clearIdle();if(document.fullscreenElement===appRoot.value) document.exitFullscreen().catch(()=>{});engine?.dispose();engine=null})
</script>
<template>
<main ref="appRoot" class="si-app" :class="{'si-ui-hidden':uiHidden,'si-show-fps':showFps&&!uiHidden,'si-intro-active':introActive}">
 <div ref="world" class="si-world" aria-label="3D 技能群島"></div>
 <header v-if="!uiHidden" class="si-header si-unified">
  <button class="si-brand" @click="resetView" :disabled="!ready"><span>🏝️</span><span>SkillIsland<small>智慧技能島</small></span></button>
  <nav aria-label="主要導覽">
   <button @click="resetView" :disabled="!ready">↶ 返回全景</button>
   <button :class="{active:open}" @click="showCenter()">🧰 技能中心 ({{total}})</button>
   <button @click="toggleIntro" :disabled="!ready" :class="{active:introActive}">{{introActive?'⏭ 略過導覽':'▶ 電影導覽'}}</button>
   <button @click="toggleTour" :disabled="!ready" :class="{active:tourActive}">{{tourActive?'■ 停止巡覽':'⟳ 自動巡覽'}}</button>
   <button @click="capturePhoto" :disabled="!ready || photoBusy || open" title="下載目前3D畫面 (P)">{{photoBusy?'處理中…':'📷 場景截圖'}}</button>
   <button @click="settingsOpen=!settingsOpen" :aria-expanded="settingsOpen">⚙ 設定</button>
   <button class="si-hide" @click="toggleUI">◉ 隱藏介面</button>
  </nav>
  <span v-if="photoError" role="alert">{{photoError}}</span>
  <span class="si-version">V9.1.5</span>
  <span v-if="tourActive && tourStatus" class="si-tour-status" role="status">{{tourStatus}}</span>
  <div v-if="settingsOpen" class="si-settings">
   <div class="si-appearance" role="group" aria-label="場景視覺模式"><strong>場景光影</strong><button v-for="m in appearanceModes" :key="m.id" :disabled="!ready" :class="{active:appearanceMode===m.id}" :aria-pressed="appearanceMode===m.id" @click="chooseAppearance(m.id)">{{m.name}}</button></div>
   <div class="si-appearance" role="group" aria-label="天氣模式"><strong>場景天氣</strong><button v-for="m in weatherModes" :key="m.id" :disabled="!ready" :class="{active:weatherMode===m.id}" :aria-pressed="weatherMode===m.id" @click="chooseWeather(m.id)">{{m.name}}</button></div>
   <div class="si-appearance si-audio" role="group" aria-label="環境音效">
    <strong>環境音效</strong><button @click="toggleAudio" :disabled="!ready || audioBusy" :aria-pressed="audioEnabled" :class="{active:audioEnabled}">{{audioEnabled?'🔊 關閉音效':'🔇 開啟音效'}}</button>
    <label>音量 <input type="range" min="0" max="100" step="1" v-model.number="audioVolume" aria-label="環境音量"> {{audioVolume}}%</label>
    <span v-if="audioError" role="alert">{{audioError}}</span>
   </div>
   <div class="si-appearance" role="group" aria-label="攝影設定"><strong>攝影設定</strong><label><input type="checkbox" v-model="photoLabels"> 截圖保留島嶼標籤</label></div>
   <label v-if="ready && devMode"><input type="checkbox" v-model="showFps"> 顯示 FPS 效能監測</label>
   <div class="si-display-settings" role="group" aria-label="展示設定">
    <strong>展示設定</strong>
    <button @click="toggleFullscreen" :disabled="!fullscreenSupported" :aria-pressed="isFullscreen">{{isFullscreen?'退出全螢幕':'⛶ 全螢幕'}}</button>
    <label><input type="checkbox" v-model="autoHide"> 閒置10秒自動收合</label>
    <label><input type="checkbox" v-model="shortcuts"> 啟用快捷鍵</label>
    <span v-if="fullscreenError" role="alert">{{fullscreenError}}</span>
    <span v-if="!fullscreenSupported">可使用瀏覽器 F11 全螢幕</span>
   </div>
   <p class="si-shortcut-help" v-if="shortcuts">F 全螢幕 · H 隱藏介面 · R 全景 · C 電影 · T 巡覽 · P 截圖 · 1–4 光影</p>
   <p>左鍵旋轉 · 滾輪縮放 · 點擊建築探索</p>
  </div>
 </header>
 <button v-else class="si-restore" @click="toggleUI" aria-label="恢復操作工具列">☰ 顯示工具列</button>
 <div v-if="error" class="si-error" role="alert">3D 初始化失敗：{{error}}</div>
 <Transition name="si-pop"><section v-if="open" class="si-center" aria-label="技能操作中心"><div class="si-inner">
 <div class="si-hero"><div><p class="si-eyebrow">SKILL ISLAND / TOOLBOX</p><h1>今天想學會什麼技能？</h1><p>探索六大技能分類，打造自己的智慧工具箱。</p></div><div class="si-count"><strong>{{total}}</strong><span>規劃技能</span></div><button class="si-close" @click="closeCenter" aria-label="關閉技能中心">×</button></div>
 <div v-if="activeTool"><button @click="activeTool=false">← 返回技能清單</button><h2>{{activeTool==='agent-summary'?'智慧摘要工作室':activeTool==='agent-markdown'?'Markdown 智慧文件工作室':activeTool==='agent-skills'?'AI Skills 工作室':activeTool==='analytics-csv'?'CSV 智慧數據分析':activeTool==='chart-pie'?'圓餅圖與環形圖工作室':activeTool==='chart-line'?'折線圖工作室':activeTool==='chart-bar'?'長條圖工作室':activeTool==='code-encoding'?'文字編碼轉換':activeTool==='code-format'?'程式碼格式化':activeTool==='code-sql'?'SQL 工具':activeTool==='code-json'?'JSON 格式化':activeTool==='excel-statistics'?'Excel 資料統計':activeTool==='excel-duplicate'?'重複資料移除':activeTool==='excel-date'?'日期格式統一':activeTool==='excel-clean'?'Excel 資料清理':activeTool==='document-convert'?'文件格式轉換':activeTool==='document-text'?'PDF 文字擷取':activeTool==='pdf-split'?'PDF 分割':activeTool==='pdf-merge'?'PDF 合併':activeTool==='image-adjust'?'亮度與色彩調整':activeTool==='image-crop'?'圖片裁切':activeTool==='image-compress'?'圖片壓縮':activeTool==='image-eraser'?'筆跡消除筆':activeTool==='image-drawing'?'自由塗鴉筆':'圖片放大鏡'}}</h2><ImageDrawing v-if="activeTool==='image-drawing' || activeTool==='image-eraser'" :key="activeTool" :initial-mode="activeTool==='image-eraser' ? 'erase' : 'draw'"/><ImageCropCompress v-else-if="activeTool==='image-crop' || activeTool==='image-compress'" :key="activeTool" :mode="activeTool==='image-crop' ? 'crop' : 'compress'"/><ImageAdjust v-else-if="activeTool==='image-adjust'"/><PdfMerge v-else-if="activeTool==='pdf-merge'"/><PdfSplit v-else-if="activeTool==='pdf-split'"/><PdfTextExtract v-else-if="activeTool==='document-text'"/><DocumentConvert v-else-if="activeTool==='document-convert'"/><ExcelStatistics v-else-if="activeTool==='excel-statistics'"/><ExcelDuplicate v-else-if="activeTool==='excel-duplicate'"/><ExcelDate v-else-if="activeTool==='excel-date'"/><ExcelClean v-else-if="activeTool==='excel-clean'"/><TextEncoding v-else-if="activeTool==='code-encoding'"/><CodeFormatter v-else-if="activeTool==='code-format'"/><SqlTools v-else-if="activeTool==='code-sql'"/><JsonFormatter v-else-if="activeTool==='code-json'"/><CsvAnalytics v-else-if="activeTool==='analytics-csv'"/><PieChart v-else-if="activeTool==='chart-pie'"/><LineChart v-else-if="activeTool==='chart-line'"/><BarChart v-else-if="activeTool==='chart-bar'"/><SkillStudio v-else-if="activeTool==='agent-skills'"/><MarkdownStudio v-else-if="activeTool==='agent-markdown'"/><SummaryStudio v-else-if="activeTool==='agent-summary'"/><ImageMagnifier v-else /></div><template v-else><div class="si-filters"><label class="si-search">🔎 <input v-model="search" placeholder="搜尋技能，例如 PDF、放大鏡" aria-label="搜尋技能"></label><div class="si-tabs"><button :class="{active:category==='all'}" @click="category='all'">全部</button><button v-for="g in groups" :key="g.id" :class="{active:category===g.id}" @click="category=g.id">{{g.icon}} {{g.name}}</button></div></div>
 <div class="si-grid"><article v-for="g in filtered" :key="g.id" class="si-card" :style="{'--accent':g.color,'--tint':g.bg}"><div class="si-card-head"><span class="si-icon">{{g.icon}}</span><div><h2>{{g.name}}</h2><small>{{g.tools.length}} 項技能</small></div></div><div class="si-tools"><div v-for="t in g.tools" :key="t.id"><span>{{t.name}}<small class="si-runtime">{{ ['document-convert','agent-skills','agent-markdown','agent-summary'].includes(t.id) ? '瀏覽器執行' : runtimeLabels[t.runtime] }}</small></span><button v-if="t.status==='ready'" @click="activeTool=t.id">開啟工具</button><small v-else>{{ statusLabels[t.status] }}</small></div></div><button class="si-explore" @click="explore(g.id)" :disabled="!!error">前往技能島 ↗</button></article></div>
 <p v-if="!filtered.length" class="si-empty">找不到符合的技能，請更換搜尋文字。</p>
<footer>已開放圖片放大鏡、自由塗鴉筆、筆跡消除筆、圖片裁切、圖片壓縮、亮度與色彩調整、PDF 合併、PDF 分割、PDF 文字擷取、文件格式轉換、Excel 資料清理、日期格式統一、重複資料移除、Excel 資料統計、JSON 格式化、SQL 工具、程式碼格式化、文字編碼轉換、長條圖、折線圖、圓餅圖、CSV 數據分析、AI Skills 工作室、Markdown 工作室及智慧摘要工作室。</footer></template>
 </div></section></Transition>
</main>
</template>
<style>
*{box-sizing:border-box}html,body,#app{margin:0;width:100%;height:100%;overflow:hidden}body{font-family:'Microsoft JhengHei',system-ui,sans-serif}.si-app{position:relative;width:100%;height:100%;background:#87ceeb;color:#18374a}.si-world{position:absolute;inset:0;overflow:hidden}.si-world canvas{display:block}.si-header{position:absolute;z-index:120;top:14px;left:18px;right:18px;display:flex;align-items:center;gap:16px;padding:10px 18px;background:#fffffff0;border-radius:22px;box-shadow:0 8px 30px #16445b26}.si-app button{font:inherit;cursor:pointer;border:0;border-radius:12px;padding:10px 15px;font-weight:700;background:#e8f1f5;color:#18374a;transition:transform .2s,background .2s}.si-app button:hover:not(:disabled){transform:translateY(-2px)}.si-app button:active:not(:disabled){transform:scale(.96)}.si-app button:focus-visible,.si-app input:focus-visible{outline:3px solid #ca8a04;outline-offset:3px}.si-brand{display:flex;align-items:center;gap:10px;text-align:left;background:transparent!important;padding:0!important;font-size:20px!important}.si-brand>span:first-child{font-size:32px}.si-brand small{display:block;font-size:12px;color:#526d7d}.si-header nav{display:flex;gap:8px;margin-left:auto}.si-app button.active{background:#0e7490;color:white}.si-version{color:#087e91;font-weight:800}.si-guide,.si-error{position:absolute;background:#fffffff0;border-radius:20px;padding:18px;box-shadow:0 8px 28px #16445b26}.si-guide{bottom:20px;left:20px}.si-guide p{font-size:13px;margin:8px 0}.si-guide button{margin-right:5px}.si-error{top:35%;left:10%;color:#991b1b;z-index:110}.si-center{position:absolute;inset:90px 18px 18px;z-index:115;background:#f7fafcf7;border-radius:28px;overflow:auto;box-shadow:0 20px 60px #16445b40}.si-inner{max-width:1320px;margin:auto;padding:24px}.si-hero{position:relative;display:flex;align-items:center;gap:20px;background:linear-gradient(120deg,#dbeafe,#ccfbf1);border-radius:24px;padding:24px 58px 24px 24px}.si-hero h1{font-size:clamp(22px,3vw,38px);font-weight:900;margin:6px 0}.si-hero p{margin:0;color:#36566b}.si-eyebrow{font-size:12px;letter-spacing:2px;font-weight:800}.si-count{margin-left:auto;display:grid;text-align:center;min-width:80px}.si-count strong{font-size:42px;color:#0e7490}.si-close{position:absolute;right:12px;top:12px;font-size:24px!important;padding:4px 12px!important}.si-filters{margin:18px 0;display:grid;gap:12px}.si-search{display:flex;align-items:center;gap:10px;background:white;border:1px solid #cbd5e1;border-radius:14px;padding:10px 14px}.si-search input{flex:1;min-width:0;border:0;background:transparent;font:inherit}.si-tabs{display:flex;gap:8px;flex-wrap:wrap}.si-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.si-card{background:var(--tint);border:1px solid color-mix(in srgb,var(--accent) 20%,white);border-radius:24px;padding:18px;display:flex;flex-direction:column;gap:12px;transition:transform .25s cubic-bezier(.2,1.5,.5,1)}.si-card:hover{transform:translateY(-3px)}.si-card-head{display:flex;align-items:center;gap:12px;color:var(--accent)}.si-icon{font-size:32px;background:white;border-radius:16px;padding:8px}.si-card h2{font-size:21px;font-weight:800;margin:0}.si-tools{display:grid;gap:7px;flex:1}.si-tools>div{display:flex;justify-content:space-between;align-items:center;gap:8px;background:#ffffffc9;border-radius:12px;padding:10px;font-weight:600}.si-runtime{display:block;font-weight:400;margin-top:3px}.si-tools small{color:#64748b;font-size:12px;white-space:nowrap}.si-app .si-explore{background:var(--accent);color:white}.si-explore:disabled{opacity:.5;cursor:not-allowed}.si-empty,footer{text-align:center;color:#526d7d;padding:20px}.si-pop-enter-active,.si-pop-leave-active{transition:opacity .25s,transform .25s}.si-pop-enter-from,.si-pop-leave-to{opacity:0;transform:scale(.98)}@media(max-width:900px){.si-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.si-header{left:8px;right:8px;gap:6px;padding:8px}.si-brand{font-size:14px!important}.si-brand>span:first-child{font-size:22px}.si-header nav button{padding:8px;font-size:12px}.si-version{display:none}.si-center{inset:78px 8px 8px}.si-inner{padding:12px}.si-grid{grid-template-columns:1fr}.si-hero{padding:16px 46px 16px 16px}.si-count{display:none}.si-guide{left:8px;bottom:8px;right:8px}}@media(prefers-reduced-motion:reduce){.si-app *{transition:none!important}}

.si-unified{flex-wrap:wrap;gap:10px}.si-unified nav{flex-wrap:wrap;justify-content:flex-end;gap:6px}.si-unified nav button{white-space:nowrap}.si-settings{flex-basis:100%;display:flex;align-items:center;gap:16px;border-top:1px solid #dbe7ee;padding-top:10px;font-size:13px}.si-settings p{margin:0}.si-app .si-hide,.si-app .si-restore{background:#17394c;color:white}.si-restore{position:absolute;top:14px;right:18px;z-index:130;box-shadow:0 4px 16px #17394c44}.si-world [data-si-intro-control]{display:none!important}.si-world #skillIslandPerformance{display:none}.si-show-fps .si-world #skillIslandPerformance{display:block}.si-ui-hidden .si-world section[aria-label="技能島介紹"],.si-intro-active .si-world section[aria-label="技能島介紹"]{display:none!important}.si-ui-hidden .si-world [data-si-intro-overlay]{display:none!important}.si-center{top:115px}.si-app:has(.si-settings) .si-center{top:155px}
@media(max-width:900px){.si-unified nav{margin-left:0;justify-content:flex-start}.si-unified nav button{padding:8px;font-size:12px}.si-center{top:155px}.si-app:has(.si-settings) .si-center{top:205px}}
@media(max-width:600px){.si-unified{gap:6px}.si-unified nav{width:100%}.si-settings{flex-wrap:wrap;gap:6px}.si-restore{top:8px;right:8px}.si-center{top:170px}.si-app:has(.si-settings) .si-center{top:225px}}
.si-tour-status{position:absolute;top:100%;right:0;margin-top:6px;padding:7px 12px;background:#fffffff0;border-radius:12px;font-size:13px;font-weight:700;color:#087e91;pointer-events:none}

.si-appearance{display:flex;align-items:center;flex-wrap:wrap;gap:6px}.si-appearance button{padding:7px 12px}.si-settings{flex-wrap:wrap}

.si-display-settings{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;flex-basis:100%}.si-display-settings label{display:flex;align-items:center;gap:5px}.si-settings{max-height:40vh;overflow:auto}.si-shortcut-help{flex-basis:100%;color:#526d7d}.si-app:fullscreen{width:100%;height:100%}.si-app .si-center,.si-app:has(.si-settings) .si-center{top:var(--si-center-top,115px)}
.si-audio label{display:flex;align-items:center;gap:8px}.si-audio input{width:110px;accent-color:#087e91}
</style>
