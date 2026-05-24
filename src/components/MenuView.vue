<template>
  <div class="max-w-7xl mx-auto px-6 py-12">
    <header class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
      <div>
        <h2 class="text-4xl font-black text-slate-800 mb-2">Katalog Menu Hari Ini</h2>
        <p class="text-slate-500 font-medium">Nutrisi optimal untuk mendampingi aktivitas belajarmu.</p>
      </div>
      <div class="flex bg-white shadow-sm border border-slate-100 p-2 rounded-2xl gap-2">
        <button v-for="cat in ['Semua', 'Ayam', 'Ikan', 'Veggie']" :key="cat"
                class="px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition"
                :class="activeCat === cat ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-orange-500'">
          {{ cat }}
        </button>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="item in menus" :key="item.id" 
           @click="selectedItem = item"
           class="bg-white rounded-[2.5rem] p-5 shadow-sm border border-orange-50 flex flex-col cursor-pointer transition hover:shadow-2xl hover:-translate-y-2 group">
        <div class="h-64 bg-slate-100 rounded-[2rem] mb-6 overflow-hidden relative">
          <img :src="item.image_url" :alt="item.name" class="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
          <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter text-slate-800 shadow-sm">
            {{ item.calories }} kCal
          </div>
        </div>
        <h3 class="font-black text-2xl text-slate-800 mb-3 group-hover:text-orange-600 transition">{{ item.name }}</h3>
        <p class="text-sm text-slate-500 mb-8 line-clamp-2 leading-relaxed">{{ item.description }}</p>
        
        <div class="mt-auto flex items-center justify-between border-t border-slate-50 pt-5">
          <span class="text-orange-600 font-black text-2xl tracking-tight">Rp26.000</span>
          <button @click.stop class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-orange-500 transition transform hover:scale-110">
            <Plus :size="20" strokeWidth="3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Menu Detail Modal -->
    <div v-if="selectedItem" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="selectedItem = null"></div>
      <div class="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
        <button @click="selectedItem = null" class="absolute top-6 right-6 p-3 bg-white/80 rounded-full hover:bg-white transition z-10 shadow-md">
          <X :size="24" class="text-slate-800" />
        </button>
        
        <div class="flex flex-col md:flex-row">
          <div class="md:w-1/2">
            <img :src="selectedItem.image_url" class="h-64 md:h-full w-full object-cover" />
          </div>
          <div class="md:w-1/2 p-8 md:p-10 flex flex-col gap-6">
            <div>
              <h4 class="text-2xl font-black text-slate-800 mb-2">{{ selectedItem.name }}</h4>
              <p class="text-sm text-slate-500 leading-relaxed">{{ selectedItem.description }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div v-for="(val, key) in macros(selectedItem)" :key="key" class="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                <span class="text-[9px] font-black uppercase text-slate-400 tracking-widest">{{ key }}</span>
                <span class="text-lg font-black text-slate-800">{{ val }}g</span>
              </div>
            </div>

            <div>
              <p class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Highlights</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in ['GIZI SEIMBANG', 'LOW CAL', 'HIGH PROTEIN']" :key="tag" class="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-lg">#{{ tag }}</span>
              </div>
            </div>

            <button class="w-full mt-auto bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-orange-700 transition">
              Tambah Ke Keranjang • Rp26k
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Plus, X } from 'lucide-vue-next';

defineProps(['menus']);

const activeCat = ref('Semua');
const selectedItem = ref(null);

const macros = (item) => ({
  protein: item.protein || 30,
  carbs: item.carbs || 55,
  fats: item.fats || 12,
  calories: item.calories || 450
});
</script>
