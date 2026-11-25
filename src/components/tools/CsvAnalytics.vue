<script setup>
import {ref, computed, watch, nextTick, onBeforeUnmount, onMounted} from 'vue'
import Chart from 'chart.js/auto'
const sample='月份,部門,收入,成本\n2026-01,業務部,120000,80000\n2026-02,業務部,135000,85000\n2026-03,資訊部,90000,60000\n2026-04,資訊部,110000,70000\n2026-05,行政部,,45000\n2026-06,行政部,75000,50000'
const source=ref(sample), headers=ref([]), rows=ref([]), error=ref(''), group=ref(''), metric=ref(''), mode=ref('bar'), canvas=ref(null)
let chart, revision=0
function parse(text){
 const input=text.replace(/^\uFEFF/,''); let out=[], row=[], cell='', quoted=false, closed=false
 for(let i=0;i<input.length;i++){
  const c=input[i]
  if(quoted){if(c==='"'){if(input[i+1]==='"'){cell+='"';i++}else{quoted=false;closed=true}}else cell+=c;continue}
  if(closed && ![',','\n','\r'].includes(c))throw Error('引號結束後出現不合法字元')
  if(c==='"'){if(cell!=='')throw Error('CSV 引號位置錯誤');quoted=true}
  else if(c===','){row.push(cell);cell='';closed=false}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&input[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()!==''))out.push(row);row=[];cell='';closed=false}
  else cell+=c
 }
 if(quoted)throw Error('CSV 引號未關閉')
 row.push(cell);if(row.some(v=>v.trim()!==''))out.push(row)
 return out
}
function number(v){return typeof v==='string'&&v.trim()!==''&&Number.isFinite(Number(v))?Number(v):null}
function analyze(){try{const data=parse(source.value);if(data.length<2)throw Error('至少需要標題及一筆資料');const h=data.shift().map(x=>x.trim());if(h.some(x=>!x)||new Set(h).size!==h.length)throw Error('欄名不得空白或重複');if(data.some(r=>r.length!==h.length))throw Error('資料列欄位數不一致');if(data.length>50000||h.length>100)throw Error('最多 50,000 筆、100 欄');headers.value=h;rows.value=data;group.value='0';metric.value=String(h.findIndex((_,i)=>data.some(r=>number(r[i])!==null)));error.value=''}catch(e){error.value=e.message;headers.value=[];rows.value=[];metric.value='';group.value=''}}
const profiles=computed(()=>headers.value.map((name,i)=>{let valid=0,missing=0;for(const r of rows.value){if(!r[i].trim())missing++;else if(number(r[i])!==null)valid++}return {name,i,missing,valid,type:valid===0?'文字':valid+missing===rows.value.length?'數值':'混合'}}))
const values=computed(()=>rows.value.map(r=>number(r[Number(metric.value)])).filter(v=>v!==null))
function stats(a){if(!a.length)return {count:0,sum:0,avg:null,min:null,max:null,median:null,sd:null};const sum=a.reduce((s,v)=>s+v,0),avg=sum/a.length,b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2);return {count:a.length,sum,avg,min:b[0],max:b.at(-1),median:b.length%2?b[m]:(b[m-1]+b[m])/2,sd:Math.sqrt(a.reduce((s,v)=>s+(v-avg)**2,0)/a.length)}}
const summary=computed(()=>stats(values.value))
const groups=computed(()=>{const map=new Map();if(!headers.value.length||Number(metric.value)<0)return [];for(const r of rows.value){const v=number(r[Number(metric.value)]);if(v===null)continue;const k=r[Number(group.value)]?.trim()||'（空白）';if(!map.has(k))map.set(k,[]);map.get(k).push(v)}return [...map].map(([name,a])=>({name,...stats(a)}))})
const fmt=v=>v===null?'—':Number.isFinite(v)?v.toLocaleString('zh-TW',{maximumFractionDigits:4}):'—'
const chartError=computed(()=>groups.value.length>100?'分類超過100組，僅提供統計表':mode.value==='pie'&&(groups.value.some(g=>g.sum<0)||!groups.value.some(g=>g.sum>0))?'圓餅圖需要非負數且總和大於零':'')
async function draw(){const token=++revision;await nextTick();if(token!==revision)return;chart?.destroy();chart=null;if(!canvas.value||!groups.value.length||chartError.value)return;chart=new Chart(canvas.value,{type:mode.value,data:{labels:groups.value.map(g=>g.name),datasets:[{label:'分類加總',data:groups.value.map(g=>g.sum),backgroundColor:groups.value.map((_,i)=>`hsl(${i*137.5%360},65%,55%)`),borderColor:'#d97706',tension:.25}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:mode.value==='pie'}}}})}
watch([groups,mode],draw,{flush:'post'});onMounted(analyze);onBeforeUnmount(()=>{revision++;chart?.destroy()})
async function upload(e){const f=e.target.files?.[0];if(!f)return;if(f.size>10*1024*1024){error.value='檔案超過10MB';return}try{source.value=await f.text();analyze()}catch(e){error.value=e.message}finally{e.target.value=''}}
function csvCell(v){let s=String(v??'');if(typeof v==='string'&&/^[\s]*[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
function save(name,blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportReport(){const cols=['分類','有效筆數','加總','平均','最小','最大','中位數','母體標準差'];const data=[cols,...[{name:'整體',...summary.value},...groups.value].map(g=>[g.name,g.count,g.sum,g.avg,g.min,g.max,g.median,g.sd])];save('SkillIsland_CSV_Analysis.csv',new Blob(['\uFEFF'+data.map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}))}
function png(){if(!chart)return;const c=document.createElement('canvas');c.width=canvas.value.width;c.height=canvas.value.height;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(canvas.value,0,0);c.toBlob(b=>{if(b)save('SkillIsland_Chart.png',b)})}
</script>
<template>
<section class="csv-lab">
 <header><small>DATA LAB / V6.3</small><h2>📊 CSV 智慧數據分析</h2><p>資料品質、描述性統計與分類視覺化</p></header>
 <div class="actions"><label class="upload">匯入 CSV <input type="file" accept=".csv,.txt" @change="upload"></label><button @click="source=sample;analyze()">載入範例</button><button class="primary" @click="analyze">開始分析</button></div>
 <textarea v-model="source" rows="6" aria-label="CSV 原始資料" spellcheck="false"/><p v-if="error" role="alert" class="err">{{error}}</p>
 <template v-if="headers.length">
 <div class="cards"><div><small>資料筆數</small><b>{{rows.length}}</b></div><div><small>欄位數</small><b>{{headers.length}}</b></div><div><small>缺漏格數</small><b>{{profiles.reduce((s,p)=>s+p.missing,0)}}</b></div><div><small>數值欄位</small><b>{{profiles.filter(p=>p.type==='數值').length}}</b></div></div>
 <h3>欄位品質分析</h3><div class="scroll"><table><thead><tr><th>欄位</th><th>類型</th><th>有效數值</th><th>缺漏值</th><th>缺漏率</th></tr></thead><tbody><tr v-for="p in profiles" :key="p.i"><td>{{p.name}}</td><td>{{p.type}}</td><td>{{p.valid}}</td><td>{{p.missing}}</td><td>{{(p.missing/rows.length*100).toFixed(1)}}%</td></tr></tbody></table></div>
 <div class="actions"><label>分類欄位 <select v-model="group"><option v-for="p in profiles" :key="p.i" :value="String(p.i)">{{p.name}}</option></select></label><label>數值欄位 <select v-model="metric"><option value="-1">請選擇</option><option v-for="p in profiles.filter(p=>p.valid>0)" :key="p.i" :value="String(p.i)">{{p.name}}</option></select></label><label>圖表 <select v-model="mode"><option value="bar">長條圖</option><option value="line">折線圖</option><option value="pie">圓餅圖</option></select></label></div>
 <div class="cards"><div v-for="[name,value] in [['有效筆數',summary.count],['加總',summary.sum],['平均',summary.avg],['最大',summary.max],['最小',summary.min],['中位數',summary.median],['母體標準差',summary.sd]]" :key="name"><small>{{name}}</small><b>{{fmt(value)}}</b></div></div>
 <p v-if="chartError" class="err">{{chartError}}</p><div v-else class="plot"><canvas ref="canvas"/></div>
 <div class="actions"><button @click="exportReport" :disabled="!summary.count">下載統計 CSV</button><button @click="png" :disabled="!!chartError||!groups.length">下載 PNG</button></div>
 <h3>分類統計</h3><div class="scroll"><table><thead><tr><th>分類</th><th>筆數</th><th>加總</th><th>平均</th><th>最小</th><th>最大</th></tr></thead><tbody><tr v-for="g in groups" :key="g.name"><td>{{g.name}}</td><td>{{g.count}}</td><td>{{fmt(g.sum)}}</td><td>{{fmt(g.avg)}}</td><td>{{fmt(g.min)}}</td><td>{{fmt(g.max)}}</td></tr></tbody></table></div>
 <h3>原始資料預覽（前20筆）</h3><div class="scroll"><table><thead><tr><th v-for="h in headers" :key="h">{{h}}</th></tr></thead><tbody><tr v-for="(r,i) in rows.slice(0,20)" :key="i"><td v-for="(v,j) in r" :key="j">{{v}}</td></tr></tbody></table></div>
 </template>
</section>
</template>
<style scoped>
.csv-lab{display:grid;gap:16px;color:#24364a}.csv-lab header{background:linear-gradient(115deg,#ffedd5,#fef3c7);padding:22px;border-radius:20px;color:#9a3412}.csv-lab h2,.csv-lab h3,.csv-lab p{margin:0}.actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.actions label{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.upload{background:#fff;border:1px solid #fed7aa;border-radius:12px;padding:8px}.csv-lab .primary{background:#c2410c;color:white}textarea,select{font:inherit;border:1px solid #cbd5e1;border-radius:10px;padding:10px;background:white;color:#24364a}textarea{width:100%;font-family:monospace}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:10px}.cards div{padding:15px;background:white;border:1px solid #fed7aa;border-radius:16px}.cards small{display:block;color:#64748b}.cards b{font-size:24px;color:#b45309;overflow-wrap:anywhere}.scroll{overflow:auto;background:white;border-radius:12px;max-height:340px}table{border-collapse:collapse;width:100%;white-space:nowrap}th,td{padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#fff7ed;position:sticky;top:0}.plot{height:360px;background:white;border-radius:16px;padding:16px}.err{color:#b91c1c}button:disabled{opacity:.45;cursor:not-allowed}
</style>
