<script setup>
import { ref, computed, nextTick } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
const sample = '# SkillIsland 智慧技能島\n\n> Vue 3 × Three.js × 實用工具\n\n## 專題介紹\n建立一座可以探索的 3D 技能群島。\n\n## 開發進度\n- [x] 影像工具\n- [x] 文件工具\n- [ ] Agent 任務工具\n\n## 技術架構\n| 前端 | 圖表 |\n| --- | --- |\n| Vue 3 | Chart.js |\n\n## 啟動方式\n```powershell\nnpm run dev\n```\n'
const source = ref(sample), filename = ref('README'), editor = ref(null), preview = ref(null), message = ref('')
const rendered = computed(() => {
  try {
    const clean = DOMPurify.sanitize(marked.parse(source.value, {gfm:true, async:false}), {FORBID_TAGS:['img','style','iframe','form','video','audio','object','embed','link','meta'], FORBID_ATTR:['style','srcset','id','name']})
    const doc = new DOMParser().parseFromString(clean,'text/html')
    const headings = [...doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((el,i)=>({id:`si-md-heading-${i}`,text:el.textContent,level:Number(el.tagName[1])}))
    doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((el,i)=>el.id=headings[i].id)
    doc.body.querySelectorAll('a').forEach(a=>{a.setAttribute('target','_blank');a.setAttribute('rel','noopener noreferrer')})
    return {html:doc.body.innerHTML,headings,error:''}
  } catch(e) {return {html:'',headings:[],error:e.message}}
})
const stats = computed(()=>({chars:[...source.value].length,lines:source.value?source.value.split('\n').length:0,bytes:new TextEncoder().encode(source.value).length}))
async function insert(before,after='',fallback='文字') {
  const el=editor.value; if(!el)return
  const start=el.selectionStart,end=el.selectionEnd,selected=source.value.slice(start,end)||fallback
  source.value=source.value.slice(0,start)+before+selected+after+source.value.slice(end)
  await nextTick();el.focus();el.setSelectionRange(start+before.length,start+before.length+selected.length)
}
async function load(e){const f=e.target.files?.[0];if(!f)return;try{if(f.size>2*1024*1024)throw new Error('檔案不可超過 2 MB');source.value=await f.text();filename.value=f.name.replace(/\.[^.]+$/,'');message.value='已載入檔案'}catch(err){message.value=err.message}finally{e.target.value=''}}
function jump(id){preview.value?.querySelector('#'+id)?.scrollIntoView({block:'nearest',behavior:'smooth'})}
async function copy(){try{await navigator.clipboard.writeText(source.value);message.value='已複製 Markdown'}catch{message.value='無法使用剪貼簿，請手動複製'}}
function download(ext){const html=ext==='html';if(html&&rendered.value.error)return;const content=html?'<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Markdown 文件</title><style>body{max-width:900px;margin:40px auto;padding:20px;font:17px/1.7 system-ui}table{border-collapse:collapse}td,th{border:1px solid #bbb;padding:8px}pre{background:#eee;padding:16px;overflow:auto}blockquote{border-left:4px solid #0d9488;padding-left:16px}</style></head><body>'+rendered.value.html+'</body></html>':source.value;const url=URL.createObjectURL(new Blob([content],{type:html?'text/html;charset=utf-8':'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=(filename.value.trim().replace(/[\\/:*?"<>|]/g,'_')||'document')+'.'+ext;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
</script>
<template>
<section class="md-studio">
<header class="hero"><small>AGENT LAB / V7.1</small><h2>Markdown 智慧文件工作室</h2><p>撰寫 README、專題文件與 AI 技能指令，即時預覽及匯出。</p></header>
<div class="actions"><label class="upload">匯入 MD / TXT<input type="file" accept=".md,.markdown,.txt" @change="load"></label><button @click="source=sample;filename='README';message=''">載入範例</button><button @click="source='';message=''">清空</button><button @click="copy">複製 MD</button><input v-model="filename" aria-label="檔案名稱" placeholder="檔案名稱"><button class="primary" @click="download('md')">下載 MD</button><button class="primary" :disabled="!!rendered.error" @click="download('html')">下載 HTML</button></div>
<div class="toolbar"><button @click="insert('# ','','標題')">H1</button><button @click="insert('## ','','標題')">H2</button><button @click="insert('**','**')">粗體</button><button @click="insert('*','*')">斜體</button><button @click="insert('- ','','項目')">清單</button><button @click="insert('- [ ] ','','待辦事項')">待辦</button><button @click="insert('> ','','引用')">引用</button><button @click="insert('\n```\n','\n```\n','程式碼')">程式碼</button><button @click="insert('[','](https://example.com)','連結')">連結</button><button @click="insert('\n','','| 欄位 A | 欄位 B |\n| --- | --- |\n| 資料 | 資料 |\n')">表格</button></div>
<div class="panes"><div class="pane"><h3>Markdown 原始碼</h3><textarea ref="editor" v-model="source" spellcheck="false" aria-label="Markdown 原始碼"></textarea></div><div class="pane"><h3>即時預覽</h3><nav v-if="rendered.headings.length" class="toc" aria-label="標題目錄"><strong>文件目錄</strong><button v-for="h in rendered.headings" :key="h.id" :style="{paddingLeft:(h.level-1)*10+'px'}" @click="jump(h.id)">{{h.text}}</button></nav><p v-if="rendered.error" role="alert">{{rendered.error}}</p><article ref="preview" class="preview" v-html="rendered.html"></article></div></div>
<footer>{{stats.lines}} 行 · {{stats.chars}} 字元 · {{stats.bytes}} Bytes <span role="status">{{message}}</span></footer><small>安全預覽會移除圖片、嵌入內容及自訂樣式；原始 Markdown 不受影響。</small>
</section>
</template>
<style scoped>
.md-studio{color:#173b3b;display:grid;gap:14px}.hero{background:linear-gradient(120deg,#ccfbf1,#e0f2fe);border-radius:20px;padding:22px}.hero small{font-weight:800;letter-spacing:2px;color:#0f766e}.hero h2{margin:8px 0;font-size:25px}.hero p{margin:0}.actions,.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.md-studio button,.upload{border:1px solid #b8dcd8;border-radius:10px;padding:8px 12px;background:white;color:#115e59;font-weight:600;cursor:pointer}.md-studio button:hover,.upload:hover{background:#ccfbf1}.md-studio button.primary{background:#0f766e;color:white}.md-studio button:disabled{opacity:.5}.upload input{display:none}.actions>input{max-width:150px;border:1px solid #b8dcd8;border-radius:10px;padding:8px}.panes{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}.pane{border:1px solid #cbdedc;background:#fff;border-radius:14px;padding:12px;min-width:0}.pane h3{font-size:16px;margin:0 0 12px}.pane textarea{width:100%;box-sizing:border-box;min-height:480px;border:1px solid #d1e3e1;border-radius:8px;padding:12px;background:#f8fafc;color:#172033;font:14px/1.65 monospace;resize:vertical}.preview{max-height:480px;overflow:auto;overflow-wrap:anywhere;line-height:1.7}.preview :deep(pre){background:#172033;color:#e2e8f0;padding:12px;border-radius:8px;overflow:auto}.preview :deep(table){border-collapse:collapse;width:100%}.preview :deep(td),.preview :deep(th){border:1px solid #cbd5e1;padding:7px}.preview :deep(blockquote){border-left:4px solid #0d9488;margin-left:0;padding-left:12px}.toc{display:grid;gap:3px;background:#f0fdfa;padding:10px;border-radius:8px;margin-bottom:10px;max-height:140px;overflow:auto}.toc button{text-align:left;border:0;background:none;padding:4px}.md-studio footer{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:#52716f}@media(max-width:850px){.panes{grid-template-columns:1fr}.pane textarea{min-height:300px}}
</style>
