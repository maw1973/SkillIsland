<script setup>
import { ref, shallowRef, computed, watch } from 'vue'
import ExcelJS from 'exceljs'
const book=shallowRef(null), sheetId=ref(''), valueCol=ref(0), groupCol=ref(0), busy=ref(false), error=ref(''), filename=ref(''), result=shallowRef(null)
const sheet=computed(()=>book.value?.getWorksheet(Number(sheetId.value)))
const headers=computed(()=>Array.from({length:Math.min(sheet.value?.columnCount||0,256)},(_,i)=>({id:i+1,name:sheet.value.getRow(1).getCell(i+1).text||`欄 ${i+1}`})))
watch(sheetId,()=>{valueCol.value=0;groupCol.value=0;result.value=null})
watch([valueCol,groupCol],()=>{result.value=null})
async function upload(e){
 const f=e.target.files?.[0];e.target.value='';if(!f)return
 busy.value=true;error.value='';book.value=null;result.value=null;valueCol.value=0;groupCol.value=0
 try{if(!/\.xlsx$/i.test(f.name)||f.size>20*1024*1024)throw Error('請選擇 20 MB 以內的 XLSX 檔案');const b=new ExcelJS.Workbook();await b.xlsx.load(await f.arrayBuffer());if(!b.worksheets.length)throw Error('沒有工作表');book.value=b;filename.value=f.name;sheetId.value=String(b.worksheets[0].id)}catch(err){error.value=err.message+(String(err.message).includes('sheets')?'；請先用 Excel 另存為標準 XLSX 再試。':'')}finally{busy.value=false}
}
function numeric(cell){let v=cell.value;if(v&&typeof v==='object'&&!(v instanceof Date))v=v.result;if(typeof v==='number')return Number.isFinite(v)?v:null;if(typeof v==='string'&&v.trim()&&/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(v.trim())){const n=Number(v);return Number.isFinite(n)?n:null}return null}
function stats(values){const a=[...values].sort((x,y)=>x-y), n=a.length;if(!n)return {n:0,sum:0,mean:null,min:null,max:null,median:null,sd:null};const sum=a.reduce((s,v)=>s+v,0),mean=sum/n;return {n,sum,mean,min:a[0],max:a[n-1],median:n%2?a[(n-1)/2]:a[n/2-1]/2+a[n/2]/2,sd:Math.sqrt(a.reduce((s,v)=>s+(v-mean)**2,0)/n)}}
const metrics=[['n','有效筆數'],['sum','加總'],['mean','平均值'],['min','最小值'],['max','最大值'],['median','中位數'],['sd','母體標準差']]
function analyze(){error.value='';result.value=null;try{const s=sheet.value;if(!s||!valueCol.value)throw Error('請選擇數值欄位');if(s.rowCount>100001||s.columnCount>256)throw Error('最多支援十萬筆資料、256 欄');let total=0;const values=[],groups=new Map();s.eachRow((row,r)=>{if(r===1)return;total++;const n=numeric(row.getCell(valueCol.value));if(n===null)return;values.push(n);if(groupCol.value){const key=row.getCell(groupCol.value).text.trim()||'（空白）';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(n)}});const overall=stats(values), grouped=[...groups].map(([name,v])=>({name,...stats(v)}));if([overall,...grouped].some(o=>Object.values(o).some(v=>typeof v==='number'&&!Number.isFinite(v))))throw Error('數值過大，超出統計計算範圍');result.value={overall,grouped,total,excluded:total-values.length,column:headers.value.find(h=>h.id===valueCol.value)?.name,group:headers.value.find(h=>h.id===groupCol.value)?.name||''}}catch(err){error.value=err.message}}
function fmt(v){return v==null?'—':v.toLocaleString('zh-TW',{maximumFractionDigits:4})}
async function download(){if(!result.value)return;busy.value=true;error.value='';try{const r=result.value,b=new ExcelJS.Workbook(),s=b.addWorksheet('整體統計');s.addRows([['數值欄位',r.column],['原始筆數',r.total],['排除筆數',r.excluded],['統計項目','結果'],...metrics.map(([k,n])=>[n,r.overall[k]])]);s.columns=[{width:24},{width:24}];s.getRow(4).font={bold:true};if(r.group){const g=b.addWorksheet('分類統計');g.addRow([r.group,...metrics.map(m=>m[1])]);r.grouped.forEach(x=>g.addRow([x.name,...metrics.map(m=>x[m[0]])]));g.columns=Array.from({length:8},()=>({width:20}));g.getRow(1).font={bold:true}}const buf=await b.xlsx.writeBuffer(),url=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})),a=document.createElement('a');a.href=url;a.download=filename.value.replace(/\.xlsx$/i,'')+'_statistics.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}catch(err){error.value=err.message}finally{busy.value=false}}
</script>
<template>
<section class="statistics-tool">
<h2>Excel 資料統計工作室</h2><p>選擇數值欄位，快速產生描述性統計與分類報表。</p>
<label>上傳 Excel <input type="file" accept=".xlsx" :disabled="busy" @change="upload"></label>
<fieldset :disabled="busy||!book">
<label>工作表 <select v-model="sheetId"><option v-for="s in book?.worksheets||[]" :key="s.id" :value="String(s.id)">{{s.name}}</option></select></label>
<label>數值欄位 <select v-model="valueCol"><option :value="0">請選擇</option><option v-for="h in headers" :key="h.id" :value="h.id">{{h.name}}（第 {{h.id}} 欄）</option></select></label>
<label>分類欄位 <select v-model="groupCol"><option :value="0">不分類</option><option v-for="h in headers" :key="h.id" :value="h.id">{{h.name}}（第 {{h.id}} 欄）</option></select></label>
<button :disabled="!valueCol" @click="analyze">執行統計</button>
</fieldset><p v-if="error" role="alert" class="error">{{error}}</p><p v-if="busy">處理中…</p>
<template v-if="result"><p>原始資料 {{result.total}} 筆；排除非數值或空白 {{result.excluded}} 筆。</p><div class="stats"><div v-for="[k,n] in metrics" :key="k"><span>{{n}}</span><strong>{{fmt(result.overall[k])}}</strong></div></div>
<template v-if="result.group"><h3>依 {{result.group}} 分類統計</h3><div class="scroll"><table><thead><tr><th>{{result.group}}</th><th v-for="[k,n] in metrics" :key="k">{{n}}</th></tr></thead><tbody><tr v-for="g in result.grouped.slice(0,200)" :key="g.name"><td>{{g.name}}</td><td v-for="[k,n] in metrics" :key="k">{{fmt(g[k])}}</td></tr></tbody></table></div><p>最多預覽 200 組，匯出包含所有分類。</p></template><button :disabled="busy" @click="download">下載統計 Excel</button></template>
<p class="note">第一列為欄名；空白、日期、布林及非數值文字不計入。公式僅使用既有快取值，不重新計算。標準差為母體標準差。輸出為新統計活頁簿，不修改原始檔案。</p>
</section>
</template>
<style scoped>
.statistics-tool{background:white;color:#18374a;padding:22px;border-radius:20px}.statistics-tool label{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:12px 0}.statistics-tool fieldset{border:0;padding:0;min-width:0}.statistics-tool select{max-width:100%;padding:8px;border:1px solid #a7c6b0;border-radius:8px}.statistics-tool button{background:#166534;color:white;border:0;border-radius:10px;padding:11px 18px}.statistics-tool button:disabled{opacity:.5}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin:18px 0}.stats div,.note{background:#dcfce7;border-radius:12px;padding:14px}.stats strong{display:block;font-size:25px;overflow-wrap:anywhere}.scroll{overflow:auto;max-height:420px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:10px;white-space:nowrap}th{background:#166534;color:white}td:not(:first-child){text-align:right}.error{color:#b91c1c}
</style>
