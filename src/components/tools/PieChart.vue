<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, shallowRef } from 'vue'
import Chart from 'chart.js/auto'
import ExcelJS from 'exceljs'
const title=ref('各項成本占比'), color=ref('#ea8c28'), mode=ref('doughnut'), legend=ref(true), cutout=ref(55)
const example='分類,金額\n人事成本,45\n設備成本,25\n行政費用,20\n其他,10'
const input=ref(example)
const canvas=ref(null), error=ref(''), book=shallowRef(null), sheets=ref([]), selected=ref(''), busy=ref(false), status=ref('')
let chart=null
function parse(text){
 const rows=[];let row=[],field='',quoted=false
 text=text.replace(/^\uFEFF/,'')
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++}else if(c==='"')quoted=false;else field+=c}else if(c==='"'&&!field)quoted=true;else if(c===','){row.push(field);field=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);rows.push(row);row=[];field=''}else field+=c}
 if(quoted)throw Error('CSV 引號尚未關閉');row.push(field);rows.push(row);return rows.filter(r=>r.some(v=>v.trim()!==''))
}
const parsed=computed(()=>{try{const rows=parse(input.value);if(rows.length<2||rows[0].length!==2)throw Error('請提供兩欄：分類、數值。');if(rows.length>101)throw Error('最多 100 筆分類。');const map=new Map();for(const [i,r] of rows.slice(1).entries()){if(r.length!==2||!r[0].trim()||!r[1].trim())throw Error(`第 ${i+2} 列資料不完整`);const n=Number(r[1]);if(!Number.isFinite(n)||n<0)throw Error(`第 ${i+2} 列需為非負數值`);const k=r[0].trim();map.set(k,(map.get(k)||0)+n)}const labels=[...map.keys()],values=[...map.values()],total=values.reduce((a,b)=>a+b,0);if(!Number.isFinite(total)||total<=0)throw Error('總和必須為有限正數');return {labels,values,total,error:''}}catch(e){return {labels:[],values:[],total:0,error:e.message}}})
const palette=['#2499c2','#8b5cf6','#10b981','#e85d75','#64748b','#eab308']
function sliceColor(i){return i===0?color.value:i<=palette.length?palette[i-1]:`hsl(${(i*137.508)%360},65%,48%)`}
function render(){
 if(chart){chart.destroy();chart=null}
 if(!canvas.value||parsed.value.error)return
 const {labels,values,total}=parsed.value
 chart=new Chart(canvas.value,{type:mode.value,data:{labels,datasets:[{data:values,backgroundColor:values.map((_,i)=>sliceColor(i)),borderColor:'#fff',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,animation:false,cutout:mode.value==='doughnut'?`${cutout.value}%`:0,plugins:{title:{display:!!title.value,text:title.value,font:{size:18}},legend:{display:legend.value,position:'bottom'},tooltip:{callbacks:{label:c=>`${c.label}: ${c.raw} (${(c.raw/total*100).toFixed(2)}%)`}}}}})
}
watch([parsed,title,color,mode,legend,cutout],()=>nextTick(render),{flush:'post'})
onMounted(render);onBeforeUnmount(()=>chart?.destroy())
function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function cellValue(cell){const v=cell.value;if(v==null)return '';if(typeof v==='object'&&'formula' in v||typeof v==='object'&&'sharedFormula' in v)return v.result??'';if(v instanceof Date)return cell.text;return typeof v==='number'?v:cell.text}
function importSheet(){try{error.value='';const ws=book.value?.getWorksheet(Number(selected.value));if(!ws)return;if(ws.rowCount>101||ws.columnCount!==2)throw Error('工作表需為兩欄、最多 101 列，請先裁減資料。');const rows=[];for(let i=1;i<=ws.rowCount;i++){const r=[];for(let j=1;j<=ws.columnCount;j++)r.push(csvCell(cellValue(ws.getRow(i).getCell(j))));rows.push(r.join(','))}input.value=rows.join('\n');status.value='已匯入 '+ws.name}catch(e){error.value=e.message}}
async function upload(e){const f=e.target.files?.[0];if(!f)return;busy.value=true;error.value='';status.value='';try{if(f.size>10*1024*1024)throw Error('檔案上限 10 MB');if(/\.xlsx$/i.test(f.name)){const wb=new ExcelJS.Workbook();await wb.xlsx.load(await f.arrayBuffer());book.value=wb;sheets.value=wb.worksheets.map(w=>({id:w.id,name:w.name}));selected.value=sheets.value[0]?.id??'';importSheet()}else if(/\.(csv|txt)$/i.test(f.name)){book.value=null;sheets.value=[];input.value=await f.text();status.value='已匯入 '+f.name}else throw Error('請選擇 XLSX、CSV 或 TXT')}catch(e){error.value=e.message+(/sheets/.test(e.message)?'；請以 Excel 另存標準 XLSX，或改用 UTF-8 CSV。':'')}finally{busy.value=false;e.target.value=''}}
function download(){if(!chart)return;const c=document.createElement('canvas');c.width=chart.canvas.width;c.height=chart.canvas.height;const ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(chart.canvas,0,0);const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='SkillIsland-pie.png';a.click()}
function sample(){input.value=example;error.value='';status.value=''}
</script>
<template>
<section class="pie-lab">
<header><small>DATA LAB / V6.2</small><h3>🥧 圓餅圖與環形圖工作室</h3><p>分類占比、即時預覽與圖片下載。</p></header>
<div class="lab-grid"><article><h4>① 資料來源</h4><div class="actions"><button @click="sample">載入範例</button><label class="upload">上傳 Excel / CSV<input type="file" accept=".xlsx,.csv,.txt" @change="upload" :disabled="busy"></label></div><label v-if="sheets.length">工作表<select v-model="selected" @change="importSheet"><option v-for="s in sheets" :key="s.id" :value="s.id">{{s.name}}</option></select></label><p v-if="status">{{status}}</p><label>CSV 資料（首列欄名，兩欄：分類、數值）<textarea v-model="input" rows="10" spellcheck="false"/></label><p v-if="busy">讀取中…</p><p v-if="error || parsed.error" class="err" role="alert">{{error || parsed.error}}</p></article>
<article><h4>② 圖表設定</h4><label>圖表標題<input v-model="title"></label><label>圖表種類<select v-model="mode"><option value="pie">圓餅圖</option><option value="doughnut">環形圖</option></select></label><label v-if="mode==='doughnut'">環形中空比例 {{cutout}}%<input type="range" min="20" max="85" v-model.number="cutout"></label><label>第一分類顏色<input type="color" v-model="color"></label><div class="checks"><label><input type="checkbox" v-model="legend"> 顯示圖例</label></div></article></div>
<article><div class="actions between"><h4>③ 即時圖表預覽</h4><button @click="download" :disabled="!!parsed.error">下載 PNG</button></div><p>{{parsed.labels.length}} 個分類 · 總計 {{parsed.total.toLocaleString()}}</p><div class="chart-area"><canvas ref="canvas" aria-label="分類占比圖"></canvas></div></article>
<article v-if="!parsed.error"><h4>分類占比統計（同名分類自動加總）</h4><div class="table-wrap"><table><thead><tr><th>分類</th><th>數值</th><th>占比</th></tr></thead><tbody><tr v-for="(l,i) in parsed.labels" :key="i"><td><span :style="{display:'inline-block',width:'12px',height:'12px',background:sliceColor(i),marginRight:'8px'}"></span>{{l}}</td><td>{{parsed.values[i].toLocaleString()}}</td><td>{{(parsed.values[i]/parsed.total*100).toFixed(2)}}%</td></tr></tbody></table></div></article>
</section>
</template>
<style scoped>
.pie-lab{display:grid;gap:16px;color:#28364a}.pie-lab header{background:linear-gradient(115deg,#ffedd5,#fef3c7);padding:24px;border-radius:22px;color:#92400e}.pie-lab header small{letter-spacing:2px;font-weight:800}.pie-lab h3{font-size:28px;margin:8px 0}.pie-lab p{margin:8px 0}.lab-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:16px}.pie-lab article{background:white;border:1px solid #e2e8f0;border-radius:20px;padding:18px;min-width:0}.pie-lab h4{font-weight:800;color:#9a3412;margin:0 0 12px}.pie-lab label{display:grid;gap:6px;margin:9px 0;font-weight:600}.pie-lab input:not([type=checkbox]),.pie-lab select,.pie-lab textarea{width:100%;border:1px solid #cbd5e1;border-radius:9px;padding:9px;background:white;color:#243447}.pie-lab textarea{font-family:monospace;resize:vertical}.pie-lab input[type=color]{height:42px}.actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.actions.between{justify-content:space-between}.pie-lab .upload{display:inline-block;padding:10px 14px;background:#ffedd5;border-radius:12px;cursor:pointer}.upload input{display:none}.checks{display:grid;grid-template-columns:1fr 1fr}.checks label{display:flex;align-items:center}.chart-area{height:390px;position:relative}.err{color:#b91c1c}.table-wrap{overflow:auto}.pie-lab table{width:100%;border-collapse:collapse}.pie-lab td,.pie-lab th{padding:9px;text-align:left;border-bottom:1px solid #e2e8f0}.pie-lab th{background:#fff7ed}.pie-lab button:disabled{opacity:.5}@media(max-width:800px){.lab-grid{grid-template-columns:1fr}.chart-area{height:300px}}
</style>
