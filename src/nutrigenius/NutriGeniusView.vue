<template>
  <div class="max-w-7xl mx-auto px-6 py-12">
    <!-- LOCKED STATE (Paywall) -->
    <div v-if="!canAccess" class="bg-orange-500 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
      <div class="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div class="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        <div class="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl">
          <Lock :size="48" class="text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
        </div>
        <h3 class="text-4xl md:text-6xl font-black mb-8 leading-tight">Buka Kekuatan <br/> NutriGenius <span class="text-yellow-300">AI</span></h3>
        <p class="text-orange-50 mb-12 text-lg md:text-xl leading-relaxed">
          Fitur eksklusif untuk pelanggan <span class="font-black text-white">Paket Bulanan</span>. 
          Gunakan AI tercanggih untuk memandu perjalanan sehatmu di ITK.
        </p>
        
        <div class="grid md:grid-cols-2 gap-6 w-full mb-12">
          <div v-for="benefit in benefits" :key="benefit.title" class="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-left hover:bg-white/20 transition">
             <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <component :is="benefit.icon" :size="24" class="text-yellow-300" />
             </div>
             <h4 class="font-black text-xl mb-3">{{ benefit.title }}</h4>
             <p class="text-sm text-orange-100 leading-relaxed">{{ benefit.desc }}</p>
          </div>
        </div>
        
        <button @click="$emit('navigate', 'catering')" class="bg-white text-orange-600 px-12 py-6 rounded-2xl font-black text-2xl shadow-2xl hover:scale-105 transition transform active:scale-95">
          Upgrade ke Paket Bulanan
        </button>
      </div>
    </div>

    <!-- ACTIVE STATE (AI Features) -->
    <div v-else class="space-y-12">
      <!-- Feature Selection Toggle (Optional, but good for UI) -->
      <div class="flex justify-center">
        <div class="bg-white p-2 rounded-2xl shadow-xl flex gap-2 border border-slate-100">
           <button v-for="t in ['Profile Gizi', 'Food Scanner']" :key="t"
                   @click="activeTool = t"
                   :class="activeTool === t ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-orange-500'"
                   class="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition">
             {{ t }}
           </button>
        </div>
      </div>

      <!-- Logic based on activeTool -->
      <div v-if="activeTool === 'Profile Gizi'">
        <ProfileGizi 
          :menus="menus" 
        />
      </div>

      <div v-else>
        <FoodScanner />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Lock, BarChart3, ChefHat } from 'lucide-vue-next';
import ProfileGizi from './ProfileGizi.vue';
import FoodScanner from './FoodScanner.vue';

defineProps(['canAccess', 'menus']);
defineEmits(['navigate']);

const activeTool = ref('Profile Gizi');

const benefits = [
  { icon: BarChart3, title: 'Presisi Makro', desc: 'Hitungan gram protein, karbo, dan lemak yang akurat untuk tubuhmu.' },
  { icon: ChefHat, title: 'Menu Dinamis', desc: 'AI akan menyaring menu harian yang paling pas dengan targetmu.' },
];
</script>
