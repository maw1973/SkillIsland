<script setup>
import { ref, computed } from 'vue'
import { getSkillGroups } from '../../skills/skillManager.js'
const library = getSkillGroups().flatMap(g => g.tools).filter(t => t.id !== 'agent-task')
const goal = ref(''), constraints = ref(''), steps = ref([]), message = ref('')
const draft = ref(''), selected = ref(''), storageKey = 'skillisland-agent-task-v1'
let nextId = 1
const done = computed(() => steps.value.filter(s => s.done).length)
const progress = computed(() => steps.value.length ? Math.round(done.value / steps.value.length * 100) : 0)
function step(title, skill = '') { return { id: nextId++, title, skill, done: false } }
function example() { goal.value = '整理 Excel 成績資料並製作分析報告'; constraints.value = '保留原始檔案；確認缺漏值與統計結果。'; generate() }
function generate() {
  if (!goal.value.trim()) { message.value = '請先輸入任務目標。'; return }
  if (steps.value.length && !window.confirm('重新產生將取代目前步驟，是否繼續？')) return
  const text = goal.value + ' ' + constraints.value
  const plan = [step('確認任務目標、輸入資料與驗收條件')]
  if (/excel|試算表|成績|xlsx/i.test(text)) plan.push(step('清理 Excel 資料', 'excel-clean'))
  if (/重複|duplicate/i.test(text)) plan.push(step('檢查並移除重複資料', 'excel-duplicate'))
  if (/日期|生日|date/i.test(text)) plan.push(step('統一日期格式', 'excel-date'))
  if (/csv/i.test(text)) plan.push(step('檢查 CSV 欄位及資料品質', 'analytics-csv'))
  if (/pdf/i.test(text)) plan.push(step('擷取 PDF 文字', 'document-text'))
  if (/圖片|影像|照片|image/i.test(text)) plan.push(step('整理與裁切圖片', 'image-crop'))
  if (/sql|資料庫/i.test(text)) plan.push(step('準備並人工檢查 SQL', 'code-sql'))
  if (/json/i.test(text)) plan.push(step('整理 JSON 格式', 'code-json'))
  if (/分析|統計|成績|報表/i.test(text)) plan.push(step('計算統計指標', 'excel-statistics'), step('製作比較圖表', 'chart-bar'))
  if (/摘要|文章|講義/i.test(text)) plan.push(step('擷取文章重點', 'agent-summary'))
  if (plan.length === 1) plan.push(step('蒐集資料並完成主要工作'))
  plan.push(step('整理成果與說明文件', 'agent-markdown'), step('人工驗收並備份成果'))
  steps.value = plan; message.value = '已產生規則式任務草稿，請依需求調整。'
}
function add() { if (!draft.value.trim()) return; steps.value.push(step(draft.value.trim(), selected.value)); draft.value = ''; selected.value = '' }
function move(i, delta) { const j = i + delta; if (j < 0 || j >= steps.value.length) return; const a = [...steps.value]; [a[i],a[j]] = [a[j],a[i]]; steps.value = a }
function snapshot() { return { version: 1, goal: goal.value, constraints: constraints.value, steps: steps.value.map(s => ({...s})) } }
function save() { try { localStorage.setItem(storageKey, JSON.stringify(snapshot())); message.value = '已儲存至本機瀏覽器。' } catch(e) { message.value = '儲存失敗：' + e.message } }
function load() { try { const raw = localStorage.getItem(storageKey); if (!raw) { message.value = '尚無儲存的任務。'; return } const d = JSON.parse(raw); if (d.version !== 1 || !Array.isArray(d.steps)) throw Error('格式不正確'); if (steps.value.length && !window.confirm('載入將取代目前任務，是否繼續？')) return; goal.value = String(d.goal || ''); constraints.value = String(d.constraints || ''); steps.value = d.steps.map(s => ({...step(String(s.title || ''), String(s.skill || '')), done: s.done === true})); message.value = '已載入任務。' } catch(e) { message.value = '載入失敗：' + e.message } }
function markdown() { return ['# ' + goal.value, '', '## 條件', constraints.value || '未設定', '', '## 執行清單', ...steps.value.map(s => `- [${s.done ? 'x' : ' '}] ${s.title}${s.skill ? '（' + (library.find(t => t.id === s.skill)?.name || s.skill) + '）' : ''}`), '', `完成進度：${done.value}/${steps.value.length}（${progress.value}%）`, ''].join('\n') }
function download(format) { const url = URL.createObjectURL(new Blob([format === 'json' ? JSON.stringify(snapshot(), null, 2) : markdown()], {type: format === 'json' ? 'application/json' : 'text/markdown;charset=utf-8'})); const a = document.createElement('a'); a.href = url; a.download = 'skillisland-workflow.' + format; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
</script>
<template>
  <section class="task-studio">
    <header class="hero"><small>AGENT LAB / V7.3</small><h2>智慧任務工作室</h2><p>規劃任務、配置技能、追蹤成果。此工具不會自動執行任務。</p></header>
    <div class="actions"><button @click="example">載入範例</button><button @click="load">載入本機任務</button><button @click="save">儲存任務</button></div>
    <label>任務目標<input v-model="goal" placeholder="例如：整理 Excel 成績資料" maxlength="300"></label>
    <label>限制與驗收條件<textarea v-model="constraints" rows="3" maxlength="4000" placeholder="資料來源、限制、交付成果"></textarea></label>
    <button class="primary" @click="generate">產生任務步驟</button>
    <div class="stats"><div><small>任務步驟</small><strong>{{steps.length}}</strong></div><div><small>已完成</small><strong>{{done}}</strong></div><div><small>完成率</small><strong>{{progress}}%</strong></div></div>
    <progress :value="progress" max="100" aria-label="任務完成率"></progress>
    <div v-for="(s,i) in steps" :key="s.id" class="step">
      <input type="checkbox" v-model="s.done" :aria-label="'完成步驟 '+(i+1)">
      <div class="step-body"><label>步驟 {{i+1}}<input v-model="s.title" maxlength="500" :class="{finished:s.done}"></label><select v-model="s.skill" aria-label="配置技能"><option value="">人工處理</option><option v-for="t in library" :key="t.id" :value="t.id">{{t.name}}</option></select></div>
      <div class="order"><button :disabled="i===0" @click="move(i,-1)" aria-label="上移">↑</button><button :disabled="i===steps.length-1" @click="move(i,1)" aria-label="下移">↓</button><button @click="steps.splice(i,1)" aria-label="刪除步驟">×</button></div>
    </div>
    <div class="add"><input v-model="draft" placeholder="新增自訂步驟" maxlength="500" @keydown.enter.prevent="add"><select v-model="selected" aria-label="新增步驟技能"><option value="">人工處理</option><option v-for="t in library" :key="t.id" :value="t.id">{{t.name}}</option></select><button @click="add" :disabled="!draft.trim()">新增</button></div>
    <div class="actions"><button :disabled="!goal.trim()" @click="download('md')">下載 Markdown</button><button :disabled="!goal.trim()" @click="download('json')">下載 JSON</button></div>
    <p role="status">{{message}}</p>
  </section>
</template>
<style scoped>
.task-studio{display:grid;gap:14px;color:#134e4a;font-family:inherit}.hero{background:linear-gradient(120deg,#ccfbf1,#e0f2fe);border-radius:20px;padding:24px}.hero h2{font-weight:800;margin:8px 0}.hero p{margin:0}.task-studio label{display:grid;gap:6px;font-weight:600}.task-studio input:not([type=checkbox]),.task-studio textarea,.task-studio select{width:100%;min-width:0;border:1px solid #99d5d0;border-radius:10px;padding:10px;background:white;color:#173b3a;font:inherit}.task-studio button{border:1px solid #99d5d0;background:white;color:#115e59;border-radius:10px;padding:9px 14px;font-weight:700;cursor:pointer}.task-studio button:disabled{opacity:.45;cursor:not-allowed}.task-studio .primary{background:#0f766e;color:white}.actions,.add,.order{display:flex;gap:8px;flex-wrap:wrap}.add input{flex:2}.add select{flex:1}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stats div{background:#ecfdf5;border-radius:16px;padding:16px;display:grid}.stats strong{font-size:28px}.task-studio progress{width:100%;height:14px;accent-color:#0d9488}.step{display:flex;gap:12px;align-items:center;background:#f0fdfa;border:1px solid #ccfbf1;border-radius:14px;padding:12px}.step-body{flex:1;min-width:0;display:grid;gap:8px}.finished{text-decoration:line-through}.order button{padding:7px 10px}.task-studio input[type=checkbox]{width:22px;height:22px;accent-color:#0f766e}@media(max-width:600px){.step{flex-wrap:wrap}.order{width:100%;justify-content:flex-end}.add{display:grid}.stats div{padding:10px}}
</style>
