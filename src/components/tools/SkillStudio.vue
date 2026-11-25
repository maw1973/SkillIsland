<script setup>
import { ref, computed, onMounted } from 'vue'
const key = 'skillisland.skills.v1'
const name = ref(''), description = ref(''), body = ref(''), saved = ref([]), selected = ref(''), message = ref('')
const errors = computed(() => {
  const e = []
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name.value) || name.value.length > 64) e.push('名稱須為 1–64 字元的小寫英數與單一連字號。')
  if (!description.value.trim() || description.value.length > 1024) e.push('描述須為 1–1024 字元。')
  if (!body.value.trim()) e.push('請填寫技能指令。')
  return e
})
const markdown = computed(() => `---\nname: ${JSON.stringify(name.value)}\ndescription: ${JSON.stringify(description.value)}\n---\n\n${body.value.trim()}\n`)
onMounted(() => { try { const data = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(data)) saved.value = data.filter(x => x && typeof x.name === 'string' && typeof x.description === 'string' && typeof x.body === 'string') } catch { message.value = '無法讀取本機技能庫。' } })
function sample() { name.value = 'excel-data-cleaning'; description.value = '清理 Excel 表格中的空白、重複資料及日期格式。當使用者要求整理試算表時使用。'; body.value = '# Excel 資料清理\n\n## 工作流程\n1. 確認工作表與欄位。\n2. 保留原始檔，另存清理結果。\n3. 依指定規則處理空白、重複值與日期。\n4. 比對修改前後筆數並回報例外。\n\n## 驗收標準\n- 不虛構資料。\n- 列出修改及刪除筆數。\n- 無法辨識的日期保留原值。'; message.value = '' }
function clear() { name.value = ''; description.value = ''; body.value = ''; selected.value = ''; message.value = '' }
function persist(next) { try { localStorage.setItem(key, JSON.stringify(next)); saved.value = next; return true } catch { message.value = '儲存失敗：瀏覽器可能限制本機儲存。'; return false } }
function save() { if (errors.value.length) return; const n = name.value; if (saved.value.some(s => s.name === n) && !window.confirm('覆蓋同名技能？')) return; if (persist([...saved.value.filter(s => s.name !== n), {name:n, description:description.value, body:body.value}])) { selected.value = n; message.value = '已儲存至此瀏覽器。' } }
function load() { const s = saved.value.find(x => x.name === selected.value); if (s) { name.value = s.name; description.value = s.description; body.value = s.body; message.value = '已載入技能。' } }
function remove() { if (selected.value && window.confirm('刪除選取的本機技能？') && persist(saved.value.filter(s => s.name !== selected.value))) { selected.value = ''; message.value = '已刪除本機紀錄。' } }
async function copy() { try { await navigator.clipboard.writeText(markdown.value); message.value = '已複製。' } catch { message.value = '無法存取剪貼簿，請手動複製預覽內容。' } }
function download() { if (errors.value.length) return; const url = URL.createObjectURL(new Blob([markdown.value], {type:'text/markdown;charset=utf-8'})); const a = document.createElement('a'); a.href = url; a.download = 'SKILL.md'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); message.value = '已發出下載要求。' }
</script>
<template>
  <section class="studio">
    <header class="hero"><small>AGENT LAB / V7.0</small><h2>AI Skills 工作室</h2><p>建立可重複使用的技能指令文件，不必連線 AI 模型。</p></header>
    <div class="toolbar"><button @click="sample">載入範例</button><button @click="clear">新增空白技能</button><select v-model="selected" aria-label="本機技能庫"><option value="">選擇已儲存技能</option><option v-for="s in saved" :key="s.name" :value="s.name">{{s.name}}</option></select><button :disabled="!selected" @click="load">載入</button><button :disabled="!selected" @click="remove">刪除</button></div>
    <div class="layout"><article><h3>技能設定</h3><label>技能名稱<input v-model="name" maxlength="64" placeholder="excel-data-cleaning"></label><label>技能描述<textarea v-model="description" rows="4" maxlength="1024" placeholder="描述用途及使用時機"></textarea></label><label>Markdown 技能指令<textarea v-model="body" rows="16" placeholder="工作流程、限制及驗收標準"></textarea></label></article>
    <article><h3>SKILL.md 原始碼預覽</h3><textarea class="preview" :value="markdown" readonly rows="23" aria-label="SKILL.md 預覽"></textarea><h3>基本格式檢查</h3><ul v-if="errors.length" class="errors"><li v-for="e in errors" :key="e">{{e}}</li></ul><p v-else class="ok">基本格式檢查通過</p><div class="toolbar"><button :disabled="!!errors.length" @click="save">儲存技能</button><button :disabled="!!errors.length" @click="copy">複製</button><button class="primary" :disabled="!!errors.length" @click="download">下載 SKILL.md</button></div></article></div>
    <p role="status">{{message}}</p><p class="note">技能庫僅儲存在目前瀏覽器。下載後請將 SKILL.md 放入與技能名稱相同的資料夾。基本檢查不等於平台相容性驗證，本工具不執行技能指令。</p>
  </section>
</template>
<style scoped>
.studio{display:grid;gap:16px;margin:16px 0}.hero{background:linear-gradient(120deg,#ccfbf1,#dbeafe);border-radius:22px;padding:24px;color:#115e59}.hero small{font-weight:800;letter-spacing:2px}.hero h2{margin:8px 0;font-size:30px}.hero p{margin:0}.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.layout{display:grid;grid-template-columns:1fr 1fr;gap:16px}.layout article{min-width:0;background:white;border:1px solid #d6e6ea;border-radius:18px;padding:20px}.layout h3{font-size:18px;margin:0 0 12px}.layout label{display:grid;gap:6px;font-weight:700;margin-bottom:12px}.studio input,.studio textarea,.studio select{font:inherit;border:1px solid #94a3b8;border-radius:10px;padding:10px;color:#18374a;background:white;min-width:0}.studio textarea{width:100%;resize:vertical}.studio .preview{background:#172033;color:#ccfbf1;font-family:Consolas,monospace;margin-bottom:16px}.studio .primary{background:#0f766e;color:white}.studio button:disabled{opacity:.45;cursor:not-allowed}.errors{color:#991b1b}.ok{color:#047857}.note{font-size:13px;color:#526d7d}@media(max-width:850px){.layout{grid-template-columns:1fr}}
</style>
