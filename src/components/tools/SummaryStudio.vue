<script setup>
import { ref, computed, watch } from 'vue'
const sample = 'SkillIsland 是一個互動式智慧技能平台，使用 Vue 3 與 Three.js 建立技能群島。平台整合影像處理、文件轉換、Excel 資料清理與程式開發工具。數據分析島提供長條圖、折線圖及圓餅圖，協助使用者理解資料。所有本機工具均在瀏覽器執行，減少資料上傳的需求。AI 智慧技能島提供技能文件編輯與摘要功能。未來將規劃模型整合與任務流程管理，並持續改善操作體驗。'
const source = ref(sample), limit = ref(3), result = ref(null), error = ref(''), notice = ref('')
const stop = new Set('的 了 和 與 及 在 是 有 為 將 也 或 這 那 個 中 上 下 不 以 等 之 可 能 我 你 他 她 它 其 所 對 從 到 就 而 但 都 很 更 被 把 讓 一 二 三 the a an and or of to in is are was were be for on with that this it as by from at not'.split(' '))
const size = s => Array.from(s).length
const chars = computed(()=>size(source.value))
const summary = computed(()=>result.value?.sentences.join('\n') || '')
const reduction = computed(()=>result.value ? Math.max(0,100*(1-result.value.sentences.reduce((n,s)=>n+size(s),0)/Math.max(1,result.value.length))).toFixed(1) : '0.0')
function words(s){
 const raw = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('zh-Hant',{granularity:'word'}).segment(s)].filter(x=>x.isWordLike).map(x=>x.segment) : (s.match(/[A-Za-z0-9]+|[\p{Script=Han}]/gu)||[])
 return raw.map(x=>x.toLowerCase()).filter(x=>!stop.has(x)&&!/^\d+$/.test(x))
}
function analyze(){
 error.value=''; notice.value=''; result.value=null
 const text=source.value.trim(); if(!text){error.value='請先輸入文章。';return} if(size(text)>100000){error.value='文章最多 100,000 字元。';return}
 const sentences=(text.match(/[^。！？!?；;\n]+[。！？!?；;]*|[。！？!?；;]+/gu)||[]).flatMap(s=>s.split(/(?<=\.)\s+/u)).map(s=>s.trim()).filter(s=>/[\p{L}\p{N}]/u.test(s))
 if(!sentences.length){error.value='找不到可分析的句子。';return}
 const tokens=sentences.map(words), freq=new Map()
 for(const list of tokens) for(const w of list) freq.set(w,(freq.get(w)||0)+1)
 const ranked=sentences.map((s,i)=>({i,s,score:tokens[i].length ? tokens[i].reduce((a,w)=>a+(freq.get(w)||0),0)/Math.sqrt(tokens[i].length)+ (i===0?0.5:0) : 0}))
 ranked.sort((a,b)=>b.score-a.score||a.i-b.i)
 const seen=new Set(), selected=[]
 for(const item of ranked){if(seen.has(item.s))continue;seen.add(item.s);selected.push(item);if(selected.length>=Number(limit.value))break}
 result.value={sentences:selected.sort((a,b)=>a.i-b.i).map(x=>x.s),keywords:[...freq].sort((a,b)=>b[1]-a[1]||b[0].length-a[0].length).slice(0,12),total:sentences.length,length:size(text)}
}
watch([source,limit],()=>{result.value=null;error.value='';notice.value=''})
async function upload(e){const f=e.target.files?.[0]; if(!f)return; try{if(f.size>1024*1024)throw Error('檔案上限 1 MB。');const t=await f.text();if(size(t)>100000)throw Error('文章最多 100,000 字元。');source.value=t}catch(err){error.value=err.message}finally{e.target.value=''}}
async function copy(){try{await navigator.clipboard.writeText(summary.value);notice.value='已複製摘要。'}catch{notice.value='無法存取剪貼簿，請手動選取摘要。'}}
function download(md){const text=md?'# 文章摘要\n\n'+result.value.sentences.map(s=>'- '+s).join('\n')+'\n\n## 關鍵字\n\n'+result.value.keywords.map(k=>k[0]).join('、') : summary.value;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=md?'summary.md':'summary.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
</script>
<template>
 <section class="ss"><header><span>AGENT LAB · V7.2</span><h3>智慧摘要工作室</h3><p>本機抽取式摘要 · 保留原文句子，不呼叫 AI 模型</p></header>
 <div class="tools"><button @click="source=sample">載入範例</button><label class="upload">匯入 TXT / MD<input type="file" accept=".txt,.md,.markdown" @change="upload"></label><button @click="source=''">清空</button></div>
 <div class="layout"><article><label for="ss-source">原始文章（{{chars.toLocaleString()}} 字元）</label><textarea id="ss-source" v-model="source" placeholder="貼上中文或英文文章" maxlength="100000" rows="14"></textarea><label for="ss-limit">摘要句數：{{limit}}</label><input id="ss-limit" type="range" min="1" max="15" v-model.number="limit"><button class="primary" @click="analyze">開始分析</button><p v-if="error" role="alert" class="error">{{error}}</p></article>
 <article><h4>摘要結果</h4><template v-if="result"><div class="stats"><div>原始句數<strong>{{result.total}}</strong></div><div>摘要句數<strong>{{result.sentences.length}}</strong></div><div>字元減少<strong>{{reduction}}%</strong></div></div><ol><li v-for="(s,i) in result.sentences" :key="i">{{s}}</li></ol><h4>關鍵字與出現次數</h4><div class="chips"><span v-for="k in result.keywords" :key="k[0]">{{k[0]}} · {{k[1]}}</span></div><div class="tools"><button @click="copy">複製摘要</button><button @click="download(false)">下載 TXT</button><button @click="download(true)">下載 MD</button></div><p role="status">{{notice}}</p></template><p v-else class="empty">輸入文章後，按下開始分析。</p></article></div>
 <footer>依詞頻及句子長度評分，選出重要原句並依原始順序排列。中文分詞取決於瀏覽器支援；摘要可能遺漏上下文，請核對原文。</footer></section>
</template>
<style scoped>
.ss{color:#164e63;display:grid;gap:16px}.ss header{background:linear-gradient(120deg,#ccfbf1,#e0f2fe);border-radius:22px;padding:22px}.ss header span{font-size:.8rem;letter-spacing:.15em;font-weight:800}.ss h3{font-size:1.65rem;margin:8px 0}.ss p{margin:8px 0}.layout{display:grid;grid-template-columns:1fr 1fr;gap:16px}.layout article{border:1px solid #cbd5e1;border-radius:16px;padding:16px;min-width:0;background:#fff}.ss label,.ss h4{font-weight:700;display:block;margin:0 0 10px}.ss textarea{width:100%;box-sizing:border-box;border:1px solid #b8d5d8;border-radius:12px;padding:12px;font:inherit;resize:vertical;color:#164e63}.ss input[type=range]{width:100%;accent-color:#0d9488}.tools{display:flex;flex-wrap:wrap;gap:8px}.ss button,.ss .upload{border:1px solid #99d6d3;background:#f0fdfa;color:#115e59;border-radius:10px;padding:9px 14px;font-weight:700;cursor:pointer;margin:0}.ss .upload input{display:none}.ss .primary{background:#0f766e;color:white;width:100%;margin-top:10px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.stats div{background:#ecfeff;padding:10px;border-radius:10px;font-size:.8rem}.stats strong{display:block;font-size:1.3rem}.ss li{margin-bottom:10px;line-height:1.6;overflow-wrap:anywhere}.chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 16px}.chips span{background:#ccfbf1;border-radius:20px;padding:5px 10px;overflow-wrap:anywhere;max-width:100%}.empty,.ss footer{color:#526777}.ss .error{color:#b91c1c}.ss footer{font-size:.85rem}@media(max-width:760px){.layout{grid-template-columns:1fr}}
</style>
