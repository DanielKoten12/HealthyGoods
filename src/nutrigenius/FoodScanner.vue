<template>
  <div class="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
    <div class="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    
    <div class="relative z-10 grid md:grid-cols-2 gap-12">
      <!-- Camera/Upload Area -->
      <div class="space-y-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Camera :size="24" class="text-orange-400" />
          </div>
          <div>
            <h3 class="text-2xl font-black">Food Scanner Pintar</h3>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest text-left">Identifikasi Gizi Via Foto</p>
          </div>
        </div>

        <div @click="triggerInput" class="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition group/cam relative overflow-hidden">
          <input type="file" ref="fileInput" @change="handleFile" hidden accept="image/*" />
          
          <template v-if="!preview">
            <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover/cam:scale-110 transition">
               <Upload :size="32" class="text-slate-500" />
            </div>
            <p class="font-bold text-slate-400">Klik untuk upload atau ambil foto</p>
            <p class="text-xs text-slate-600 mt-2">Format: JPG, PNG, WEBP</p>
          </template>
          
          <template v-else>
            <img :src="preview" class="w-full h-full object-cover" />
            <button @click.stop="preview = null" class="absolute top-6 right-6 p-3 bg-red-500/80 rounded-full hover:bg-red-500 transition">
              <X :size="20" />
            </button>
          </template>
        </div>

        <button @click="scan" :disabled="!preview || loading" class="w-full bg-orange-500 py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-orange-600 transition flex items-center justify-center gap-3 disabled:opacity-30">
          <ScanLine v-if="!loading" :size="24" />
          <Loader2 v-else class="animate-spin" :size="24" />
          {{ loading ? 'NutriGenius sedang menganalisis...' : 'Scan Makanan' }}
        </button>
      </div>

      <!-- Result Area -->
      <div class="flex flex-col justify-center">
        <div v-if="scanResult" class="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-500">
           <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                 <Utensils :size="32" />
              </div>
              <div>
                 <h4 class="text-2xl font-black">{{ scanResult.food_name }}</h4>
                 <p class="text-sm font-bold text-green-400 uppercase tracking-widest text-left">Hasil Identifikasi AI</p>
              </div>
           </div>

           <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                 <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Calories</p>
                 <p class="text-3xl font-black text-orange-400">{{ scanResult.calories }}</p>
              </div>
              <div class="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                 <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Protein</p>
                 <p class="text-3xl font-black text-blue-400">{{ scanResult.protein }}g</p>
              </div>
              <div class="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                 <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Carbs</p>
                 <p class="text-3xl font-black text-green-400">{{ scanResult.carbs }}g</p>
              </div>
              <div class="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                 <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Fats</p>
                 <p class="text-3xl font-black text-yellow-400">{{ scanResult.fats }}g</p>
              </div>
           </div>

           <div class="pt-6 border-t border-white/5 flex items-center gap-4">
              <div class="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500">
                 <Info :size="20" />
              </div>
              <p class="text-xs text-slate-400 leading-relaxed font-medium">Data di atas adalah estimasi AI berdasarkan visual. Akurasi dapat bervariasi tergantung porsi sebenarnya.</p>
           </div>
        </div>

        <div v-else class="h-full min-h-[300px] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 opacity-40">
           <ScanLine :size="64" class="mb-6" />
           <p class="font-bold text-slate-400 max-w-[200px]">Data nutrisi akan muncul di sini setelah scan</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Camera, Upload, X, Loader2, ScanLine, Utensils, Info } from 'lucide-vue-next';

const fileInput = ref(null);
const preview = ref(null);
const loading = ref(false);
const scanResult = ref(null);
const selectedFile = ref(null);

const triggerInput = () => fileInput.value.click();

const handleFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  selectedFile.value = file;
  preview.value = URL.createObjectURL(file);
  scanResult.value = null;
};

const scan = async () => {
  if (!selectedFile.value) return;
  loading.value = true;
  
  try {
    const formData = new FormData();
    formData.append('image', selectedFile.value);
    
    const res = await fetch('/api/ai/scan-food', {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    scanResult.value = data;
  } catch (e) {
    console.error(e);
    alert('AI Vision error. Silakan coba lagi.');
  } finally {
    loading.value = false;
  }
};
</script>
