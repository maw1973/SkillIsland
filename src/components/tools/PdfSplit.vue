<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { PDFDocument } from 'pdf-lib'
const source = ref(null), name = ref(''), pages = ref(0), range = ref(''), mode = ref('range'), busy = ref(false), error = ref(''), results = ref([])
let bytes = null
function clearResults(){results.value.forEach(r=>URL.revokeObjectURL(r.url));results.value=[]}
onBeforeUnmount(clearResults)
async function load(e){
 const f=e.target.files?.[0]; if(!f)return
 busy.value=true;error.value='';clearResults();source.value=null;bytes=null;pages.value=0;name.value='';range.value=''
 try{const data=await f.arrayBuffer();const doc=await PDFDocument.load(data);bytes=data;source.value=f;name.value=f.name;pages.value=doc.getPageCount();range.value=`1-${pages.value}`}
 catch(err){error.value='無法讀取 PDF：'+err.message}finally{busy.value=false;e.target.value=''}
}
const selected=computed(()=>{
 if(!pages.value)return {indices:[],error:''}
 if(mode.value==='all')return {indices:Array.from({length:pages.value},(_,i)=>i),error:''}
 const indices=[];const seen=new Set()
 for(const token of range.value.replace(/，/g,',').split(',')){
 const m=token.trim().match(/^(\d+)\s*(?:-\s*(\d+))?$/)
 if(!m)return {indices:[],error:'請輸入有效頁碼，例如 1,3-5'}
 const a=Number(m[1]),b=Number(m[2]||m[1]);if(a<1||b<a||b>pages.value)return {indices:[],error:`頁碼必須介於 1～${pages.value}，且範圍由小到大。`}
 for(let i=a;i<=b;i++){if(!seen.has(i)){seen.add(i);indices.push(i-1)}}
 }return {indices,error:''}
})
async function split(){
 if(!bytes||selected.value.error||!selected.value.indices.length||busy.value)return
 busy.value=true;error.value='';clearResults()
 const made=[]
 try{const doc=await PDFDocument.load(bytes);const indices=[...selected.value.indices];const base=name.value.replace(/\.pdf$/i,'');const batches=mode.value==='range'?[indices]:indices.map(i=>[i]);
 for(const batch of batches){const out=await PDFDocument.create();const copied=await out.copyPages(doc,batch);copied.forEach(p=>out.addPage(p));const data=await out.save();const blob=new Blob([data],{type:'application/pdf'});made.push({name:base+(mode.value==='range'?'_擷取':`_第${batch[0]+1}頁`)+'.pdf',url:URL.createObjectURL(blob),pages:batch.length,size:blob.size})}
 results.value=made
 }catch(err){made.forEach(r=>URL.revokeObjectURL(r.url));error.value='分割失敗：'+err.message}finally{busy.value=false}
}
function formatSize(n){return n>=1048576?(n/1048576).toFixed(2)+' MB':(n/1024).toFixed(1)+' KB'}
</script>
<template>
<section class="split-tool">
 <header><span>DOCUMENT CENTER / PDF</span><h2>PDF 分割工作室</h2><p>擷取指定頁面或將文件分割成獨立 PDF，所有處理均在瀏覽器內完成。</p></header>
 <label class="upload">選擇 PDF 文件<input type="file" accept="application/pdf,.pdf" :disabled="busy" @change="load"/></label>
 <p v-if="error" class="error" role="alert">{{error}}</p>
 <template v-if="source">
 <div class="stats"><div><small>原始文件</small><strong>{{name}}</strong></div><div><small>總頁數</small><strong>{{pages}}</strong></div><div><small>檔案容量</small><strong>{{formatSize(source.size)}}</strong></div></div>
 <fieldset :disabled="busy"><legend>分割方式</legend><label><input v-model="mode" type="radio" value="range"/> 指定頁碼合併為一份 PDF</label><label><input v-model="mode" type="radio" value="single"/> 指定頁碼各自輸出</label><label><input v-model="mode" type="radio" value="all"/> 全部頁面逐頁分割</label></fieldset>
 <label v-if="mode!=='all'" class="range">頁碼或範圍<input v-model="range" :disabled="busy" placeholder="1,3-5,8"/><small>依輸入順序輸出，重複頁碼自動排除。</small></label>
 <p v-if="selected.error" class="error">{{selected.error}}</p><p v-else>已選取 {{selected.indices.length}} 頁，預計產生 {{mode==='range'?1:selected.indices.length}} 份 PDF。</p>
 <button class="primary" :disabled="busy||!!selected.error||!selected.indices.length" @click="split">{{busy?'處理中…':'開始分割'}}</button>
 </template>
 <p v-if="busy&&!source" role="status">讀取文件中…</p>
 <div v-if="results.length" class="results"><h3>分割結果（{{results.length}} 份）</h3><div v-for="r in results" :key="r.url" class="result"><div><strong>{{r.name}}</strong><small>{{r.pages}} 頁 · {{formatSize(r.size)}}</small></div><a :href="r.url" :download="r.name">下載 PDF</a></div></div>
</section>
</template>
<style scoped>
.split-tool{display:grid;gap:16px;padding:18px;background:white;border-radius:22px;margin-top:16px;color:#18374a}.split-tool header{background:#dbeafe;border-radius:18px;padding:22px}.split-tool header span{color:#1d4ed8;font-size:12px;font-weight:800;letter-spacing:2px}.split-tool h2{margin:8px 0;font-weight:800}.split-tool p{margin:0}.upload,.range{display:grid;gap:8px;font-weight:700}.upload{border:2px dashed #93c5fd;padding:20px;border-radius:14px}.range input{padding:12px;border:1px solid #94a3b8;border-radius:10px;width:100%}.stats{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px}.stats>div{background:#eff6ff;padding:14px;border-radius:12px;overflow-wrap:anywhere}.stats small,.result small,.range small{display:block;color:#64748b;font-weight:400}.stats strong{display:block;margin-top:6px}fieldset{display:grid;gap:10px;border:1px solid #cbd5e1;border-radius:14px;padding:14px}legend{float:none;width:auto;font-size:16px;font-weight:700;padding:0 8px}fieldset label{display:flex;gap:8px;align-items:center}.split-tool .primary{background:#2563eb;color:white}.primary:disabled{opacity:.5;cursor:not-allowed}.error{color:#b91c1c}.results{display:grid;gap:8px}.result{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px;background:#f1f5f9;border-radius:12px;overflow-wrap:anywhere}.result a{flex-shrink:0;color:#1d4ed8;font-weight:700}@media(max-width:600px){.stats{grid-template-columns:1fr}.result{flex-wrap:wrap}}
</style>
