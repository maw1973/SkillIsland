<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
const props = defineProps({ mode: { type: String, default: 'crop' } })
const image = ref(null), url = ref(''), result = ref(''), error = ref(''), bytes = ref(0), outputBytes = ref(0), filename = ref('image'), busy = ref(false)
const x = ref(0), y = ref(0), w = ref(1), h = ref(1), ratio = ref('free'), outW = ref(1), outH = ref(1), lock = ref(true), quality = ref(80), format = ref('image/jpeg')
const iw = computed(()=>image.value?.naturalWidth || 1), ih = computed(()=>image.value?.naturalHeight || 1)
const stage = ref(null)
let seq=0, drag=null
function clearResult(){if(result.value) URL.revokeObjectURL(result.value);result.value='';outputBytes.value=0}
async function load(e){const f=e.target.files?.[0];if(!f)return;const token=++seq;error.value='';clearResult();const next=URL.createObjectURL(f);try{const img=new Image();img.src=next;await img.decode();if(token!==seq){URL.revokeObjectURL(next);return}if(url.value)URL.revokeObjectURL(url.value);url.value=next;image.value=img;bytes.value=f.size;filename.value=f.name.replace(/\.[^.]+$/,'')||'image';x.value=y.value=0;w.value=outW.value=img.naturalWidth;h.value=outH.value=img.naturalHeight;ratio.value='free'}catch{URL.revokeObjectURL(next);if(token===seq)error.value='無法讀取圖片，請選擇 JPG、PNG 或 WebP。'}}
const clamp=(v,a,b)=>Math.min(b,Math.max(a,Math.round(Number(v)||0)))
function fix(axis='w'){x.value=clamp(x.value,0,iw.value-1);y.value=clamp(y.value,0,ih.value-1);w.value=clamp(w.value,1,iw.value-x.value);h.value=clamp(h.value,1,ih.value-y.value);if(ratio.value!=='free'){const r=Number(ratio.value);if(axis==='h')w.value=Math.max(1,Math.round(h.value*r));else h.value=Math.max(1,Math.round(w.value/r));const s=Math.min(1,(iw.value-x.value)/w.value,(ih.value-y.value)/h.value);w.value=Math.max(1,Math.floor(w.value*s));h.value=Math.max(1,Math.floor(h.value*s))}clearResult()}
function point(e){const r=stage.value.getBoundingClientRect();return [clamp((e.clientX-r.left)/r.width*iw.value,0,iw.value),clamp((e.clientY-r.top)/r.height*ih.value,0,ih.value)]}
function start(e){if(!image.value||props.mode!=='crop'||e.button!==0)return;stage.value.setPointerCapture(e.pointerId);drag=point(e)}
function move(e){if(!drag)return;const [a,b]=point(e);x.value=Math.min(drag[0],a);y.value=Math.min(drag[1],b);w.value=Math.abs(a-drag[0]);h.value=Math.abs(b-drag[1]);fix()}
function end(e){if(drag)move(e);drag=null}
function resize(axis){outW.value=clamp(outW.value,1,8192);outH.value=clamp(outH.value,1,8192);if(lock.value){if(axis==='w')outH.value=clamp(outW.value*ih.value/iw.value,1,8192);else outW.value=clamp(outH.value*iw.value/ih.value,1,8192)}clearResult()}
function reset(){x.value=y.value=0;w.value=iw.value;h.value=ih.value;ratio.value='free';outW.value=iw.value;outH.value=ih.value;clearResult()}
async function generate(){if(!image.value||busy.value)return;error.value='';clearResult();busy.value=true;const token=seq;try{const crop=props.mode==='crop';if(crop)fix();else resize('w');const c=document.createElement('canvas');c.width=crop?w.value:outW.value;c.height=crop?h.value:outH.value;if(c.width*c.height>40000000)throw new Error('輸出圖片過大，請縮小尺寸至 4,000 萬像素以下。');const ctx=c.getContext('2d');if(format.value==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height)}ctx.drawImage(image.value,crop?x.value:0,crop?y.value:0,crop?w.value:iw.value,crop?h.value:ih.value,0,0,c.width,c.height);const blob=await new Promise(resolve=>c.toBlob(resolve,format.value,quality.value/100));if(!blob)throw new Error('無法輸出圖片');if(token!==seq)return;if(blob.type!==format.value)throw new Error('瀏覽器不支援指定的輸出格式');result.value=URL.createObjectURL(blob);outputBytes.value=blob.size}catch(e){error.value=e.message}finally{busy.value=false}}
function save(){if(!result.value)return;const a=document.createElement('a');a.href=result.value;a.download=`${filename.value}-${props.mode}.${format.value==='image/jpeg'?'jpg':format.value.split('/')[1]}`;a.click()}
const kb=n=>(n/1024).toFixed(1)+' KB'
onBeforeUnmount(()=>{seq++;if(url.value)URL.revokeObjectURL(url.value);clearResult()})
</script>
<template>
<section class="icc">
<p>圖片在本機瀏覽器處理，不會上傳伺服器。</p>
<label>選擇圖片 <input type="file" accept="image/*" @change="load" :disabled="busy"></label>
<p v-if="error" role="alert" class="icc-error">{{error}}</p>
<template v-if="image">
<p>原始尺寸 {{iw}} × {{ih}} px · {{kb(bytes)}}</p>
<div class="icc-layout"><div><div ref="stage" class="icc-stage" :class="{cropping:mode==='crop'}" @pointerdown="start" @pointermove="move" @pointerup="end" @pointercancel="drag=null"><img :src="url" alt="原始圖片" draggable="false"><div v-if="mode==='crop'" class="icc-selection" :style="{left:x/iw*100+'%',top:y/ih*100+'%',width:w/iw*100+'%',height:h/ih*100+'%'}"></div></div><small v-if="mode==='crop'">在圖片上拖曳選取裁切範圍。</small></div>
<div class="icc-settings">
<template v-if="mode==='crop'"><label>裁切比例 <select v-model="ratio" @change="fix()"><option value="free">自由</option><option value="1">1:1</option><option :value="16/9">16:9</option><option :value="4/3">4:3</option><option :value="3/4">3:4</option></select></label><div class="icc-fields"><label>X <input type="number" v-model.number="x" @change="fix()"></label><label>Y <input type="number" v-model.number="y" @change="fix()"></label><label>寬度 <input type="number" v-model.number="w" @change="fix('w')"></label><label>高度 <input type="number" v-model.number="h" @change="fix('h')"></label></div></template>
<template v-else><label><input type="checkbox" v-model="lock" @change="resize('w')"> 維持長寬比例</label><div class="icc-fields"><label>寬度 px <input type="number" min="1" max="8192" v-model.number="outW" @change="resize('w')"></label><label>高度 px <input type="number" min="1" max="8192" v-model.number="outH" @change="resize('h')"></label></div></template>
<label>輸出格式 <select v-model="format" @change="clearResult"><option value="image/jpeg">JPEG</option><option value="image/png">PNG（保留透明）</option><option value="image/webp">WebP</option></select></label>
<label v-if="format!=='image/png'">品質 {{quality}}% <input type="range" min="10" max="100" v-model.number="quality" @input="clearResult"></label>
<button @click="reset" :disabled="busy">重設尺寸</button><button class="icc-primary" @click="generate" :disabled="busy">{{busy?'處理中':mode==='crop'?'執行裁切':'執行壓縮'}}</button>
</div></div>
<div v-if="result" class="icc-result"><h3>輸出預覽</h3><p>{{kb(bytes)}} → {{kb(outputBytes)}} · {{outputBytes<=bytes?'減少':'增加'}} {{(Math.abs(1-outputBytes/bytes)*100).toFixed(1)}}%</p><img :src="result" alt="輸出圖片"><button class="icc-primary" @click="save">下載圖片</button></div>
</template>
</section>
</template>
<style scoped>
.icc{padding:18px;background:white;border-radius:20px;margin-top:12px}.icc-layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(230px,1fr);gap:20px}.icc-stage{position:relative;width:fit-content;max-width:100%;overflow:hidden;background:#e2e8f0;line-height:0}.icc-stage img{max-width:100%;max-height:65vh;display:block;user-select:none}.icc-stage.cropping{touch-action:none;cursor:crosshair}.icc-selection{position:absolute;border:2px solid #fff;box-shadow:0 0 0 9999px #0007;pointer-events:none}.icc-settings,.icc-result{display:grid;gap:12px;align-content:start}.icc-settings label{display:grid;gap:5px}.icc-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px}.icc input:not([type=checkbox]),.icc select{max-width:100%;min-width:0;padding:8px;border:1px solid #cbd5e1;border-radius:8px}.icc-primary{background:#be185d!important;color:white!important}.icc-result{margin-top:20px}.icc-result img{max-width:100%;max-height:55vh;object-fit:contain;justify-self:start}.icc-error{color:#b91c1c}@media(max-width:700px){.icc-layout{grid-template-columns:1fr}}
</style>
