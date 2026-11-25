<script setup>
import { ref, nextTick } from 'vue'
const props = defineProps({ initialMode: { type: String, default: 'draw' } })
const mode = ref(props.initialMode)
const eraserWidth = ref(35)
let ink = null
const canvas = ref(null), color = ref('#ef4444'), width = ref(12), opacity = ref(100), loaded = ref(false), error = ref(''), revision = ref(0)
let base = null, strokes = [], cursor = 0, current = null, loadId = 0
function redraw(){
  const c=canvas.value;if(!c||!base)return
  if(!ink || ink.width!==c.width || ink.height!==c.height){ink=document.createElement('canvas');ink.width=c.width;ink.height=c.height}
  const ctx=ink.getContext('2d');ctx.clearRect(0,0,c.width,c.height)
  for(const s of [...strokes.slice(0,cursor),...(current?[current]:[])]){
    ctx.save();ctx.globalCompositeOperation=s.mode==='erase'?'destination-out':'source-over';ctx.globalAlpha=s.alpha;ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y)
    if(s.points.length===1){ctx.arc(s.points[0].x,s.points[0].y,s.width/2,0,Math.PI*2);ctx.fill()}else{for(const p of s.points.slice(1))ctx.lineTo(p.x,p.y);ctx.stroke()}ctx.restore()
  }
  const output=c.getContext('2d');output.clearRect(0,0,c.width,c.height);output.drawImage(base,0,0,c.width,c.height);output.drawImage(ink,0,0);
  revision.value++
}
async function upload(e){
 const file=e.target.files?.[0];e.target.value='';if(!file)return;const id=++loadId;error.value='';const url=URL.createObjectURL(file);const img=new Image()
 try{img.src=url;await img.decode();if(id!==loadId)return;base=img;strokes=[];cursor=0;current=null;loaded.value=true;await nextTick();const c=canvas.value;if(!c)return;const scale=Math.min(1,4096/Math.max(img.naturalWidth,img.naturalHeight));c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));redraw()}catch{if(id===loadId)error.value='無法讀取圖片，請選擇有效的圖片檔案。'}finally{URL.revokeObjectURL(url)}
}
function point(e){const c=canvas.value,r=c.getBoundingClientRect();return {x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}}
function start(e){if(!loaded.value||current||e.button!==0)return;e.preventDefault();canvas.value.setPointerCapture(e.pointerId);current={id:e.pointerId,color:color.value,mode:mode.value,width:Number(mode.value==='erase'?eraserWidth.value:width.value),alpha:mode.value==='erase'?1:Number(opacity.value)/100,points:[point(e)]};redraw()}
function move(e){if(current?.id!==e.pointerId)return;current.points.push(point(e));redraw()}
function finish(e){if(current?.id!==e.pointerId)return;strokes=strokes.slice(0,cursor);strokes.push(current);cursor=strokes.length;current=null;redraw()}
function cancel(e){if(current?.id!==e.pointerId)return;current=null;redraw()}
function undo(){if(!current&&cursor>0){cursor--;redraw()}}
function redo(){if(!current&&cursor<strokes.length){cursor++;redraw()}}
function clear(){if(current||!cursor)return;strokes=strokes.slice(0,cursor);strokes.push({mode:'erase',color:'#000',alpha:1,width:Math.hypot(canvas.value.width,canvas.value.height)*2,points:[{x:canvas.value.width/2,y:canvas.value.height/2}]});cursor=strokes.length;redraw()}
function save(){canvas.value?.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='SkillIsland-drawing.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)},'image/png')}
function canUndo(){revision.value;return cursor>0&&!current}
function canRedo(){revision.value;return cursor<strokes.length&&!current}
</script>
<template>
<section class="draw-tool">
 <p>上傳圖片後，可自由繪畫或切換橡皮擦。橡皮擦僅移除筆跡，保留原始圖片。</p>
 <div class="draw-toolbar"><label>上傳圖片 <input type="file" accept="image/*" @change="upload"></label><button :class="{chosen:mode==='draw'}" @click="mode='draw'">✎ 畫筆</button><button :class="{chosen:mode==='erase'}" @click="mode='erase'">橡皮擦</button><label v-if="mode==='erase'">橡皮擦 {{eraserWidth}} px <input type="range" min="5" max="150" v-model.number="eraserWidth"></label><label v-if="mode==='draw'">畫筆顏色 <input type="color" v-model="color"></label><label v-if="mode==='draw'">粗細 {{width}} px <input type="range" min="1" max="80" v-model.number="width"></label><label v-if="mode==='draw'">透明度 {{opacity}}% <input type="range" min="10" max="100" v-model.number="opacity"></label></div>
 <p v-if="error" role="alert">{{error}}</p>
 <div class="draw-actions"><button :disabled="!canUndo()" @click="undo">↶ 復原</button><button :disabled="!canRedo()" @click="redo">↷ 重做</button><button :disabled="!canUndo()" @click="clear">清除筆跡</button><button :disabled="!loaded" @click="save">下載 PNG</button></div>
 <div class="draw-stage"><canvas v-if="loaded" ref="canvas" @pointerdown="start" @pointermove="move" @pointerup="finish" @pointercancel="cancel" @lostpointercapture="cancel" :class="{erasing:mode==='erase'}" aria-label="圖片塗鴉畫布"></canvas><p v-else>請先選擇一張圖片</p></div>
 <small>大於 4096 px 的圖片會等比例縮小；下載結果包含原圖與筆跡。</small>
</section>
</template>
<style scoped>
.draw-tool{background:white;border-radius:24px;padding:20px;margin-top:12px}.draw-toolbar,.draw-actions{display:flex;flex-wrap:wrap;gap:12px;margin:12px 0;align-items:center}.draw-toolbar label{display:grid;gap:6px;background:#fce7f3;padding:12px;border-radius:14px;color:#831843;font-weight:600}.draw-toolbar input[type=file]{max-width:240px}.draw-actions button:disabled{opacity:.4;cursor:not-allowed}.draw-stage{display:flex;justify-content:center;align-items:center;min-height:220px;background:#e2e8f0;border-radius:16px;padding:12px;overflow:hidden}.draw-stage canvas{display:block;max-width:100%;max-height:65vh;width:auto;height:auto;touch-action:none;cursor:crosshair}.draw-tool small{display:block;margin-top:12px;color:#475569}
.draw-toolbar button.chosen{background:#be185d;color:white}.draw-stage canvas.erasing{cursor:cell}
</style>
