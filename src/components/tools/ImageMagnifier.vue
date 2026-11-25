<script setup>
import {ref,computed,onBeforeUnmount} from 'vue'
const url=ref(''), zoom=ref(3), size=ref(180), shape=ref('circle'), point=ref(null), error=ref(''), loaded=ref(false)
const image=ref(null), picker=ref(null)
function reset(){if(url.value)URL.revokeObjectURL(url.value);url.value='';point.value=null;loaded.value=false;error.value='';if(picker.value)picker.value.value=''}
function upload(e){const f=e.target.files?.[0];if(!f)return;reset();if(!f.type.startsWith('image/')){error.value='請選擇圖片檔案';return}url.value=URL.createObjectURL(f)}
function move(e){if(!loaded.value||!image.value)return;const r=image.value.getBoundingClientRect();if(!r.width||!r.height)return;const x=e.clientX-r.left,y=e.clientY-r.top;if(x<0||y<0||x>r.width||y>r.height){point.value=null;return}point.value={x,y,w:r.width,h:r.height}}
const lens=computed(()=>{if(!point.value)return {};const {x,y,w,h}=point.value;const d=Number(size.value),z=Number(zoom.value);return {width:d+'px',height:d+'px',left:x+'px',top:y+'px',borderRadius:shape.value==='circle'?'50%':'12px',backgroundImage:`url("${url.value}")`,backgroundSize:`${w*z}px ${h*z}px`,backgroundPosition:`${d/2-x*z}px ${d/2-y*z}px`}})
onBeforeUnmount(reset)
</script>
<template>
<section class="mag-tool"><div class="mag-bar"><label class="mag-upload">上傳圖片<input ref="picker" type="file" accept="image/*" @change="upload"></label><button @click="reset">清除圖片</button><label>倍率 {{zoom}}× <input v-model.number="zoom" type="range" min="1.5" max="10" step="0.5"></label><label>直徑 {{size}} px <input v-model.number="size" type="range" min="80" max="320" step="10"></label><label>形狀 <select v-model="shape"><option value="circle">圓形</option><option value="square">方形</option></select></label></div><p>將滑鼠移到圖片上即可局部放大；觸控裝置可在圖片上滑動。圖片僅在本機瀏覽器處理。</p><p v-if="error" role="alert">{{error}}</p><div class="mag-stage"><div v-if="url" class="mag-picture" @pointermove="move" @pointerdown="move" @pointerleave="point=null" @pointercancel="point=null"><img ref="image" :src="url" alt="待放大圖片" @load="loaded=true" @error="loaded=false;error='無法讀取此圖片格式'" draggable="false"><div v-if="point&&loaded" class="mag-lens" :style="lens"></div></div><p v-else>請先上傳 JPG、PNG、WebP 等圖片</p></div></section>
</template>
<style scoped>
.mag-tool{padding:18px;background:white;border-radius:22px;margin-top:16px}.mag-bar{display:flex;flex-wrap:wrap;align-items:center;gap:14px}.mag-bar label{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.mag-upload{background:#be185d;color:white;padding:12px;border-radius:12px}.mag-upload input{max-width:220px}.mag-stage{min-height:260px;display:grid;place-items:center;background:#e9eef4;border-radius:16px;padding:18px;overflow:hidden}.mag-picture{position:relative;display:inline-block;max-width:100%;touch-action:none;cursor:crosshair}.mag-picture img{display:block;max-width:100%;max-height:55vh;width:auto;height:auto;user-select:none}.mag-lens{position:absolute;transform:translate(-50%,-50%);pointer-events:none;box-shadow:0 0 0 4px #fff,0 0 0 7px #243747,0 8px 24px #0005;background-repeat:no-repeat;background-color:#e9eef4;box-sizing:border-box}.mag-tool p{margin:12px 0;color:#475569}
</style>
