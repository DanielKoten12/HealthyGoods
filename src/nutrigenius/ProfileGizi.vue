<template>
  <div class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
    <div class="flex items-center gap-4 mb-10">
      <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black">
        <Activity :size="24" />
      </div>
      <div>
        <h3 class="text-2xl font-black text-slate-800">Profil Gizi Pintar</h3>
        <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">Analisis Biometrik AI</p>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-12">
      <!-- Form Input -->
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tinggi (cm)</label>
            <input v-model="form.height" type="number" class="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none font-bold transition" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Berat (kg)</label>
            <input v-model="form.weight" type="number" class="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none font-bold transition" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level Aktivitas</label>
          <select v-model="form.activity_level" class="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none font-bold transition appearance-none cursor-pointer">
            <option value="sedentary">Aktifitas Ringan (Hanya Kuliah)</option>
            <option value="lightly_active">Aktifitas Sedang (Jalan kaki/olahraga 1-2x)</option>
            <option value="moderately_active">Aktifitas Tinggi (Olahraga 3-5x)</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tujuan Kesehatan</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="g in ['diet', 'maintenance', 'bulking']" :key="g"
                    @click="form.health_goal = g"
                    :class="form.health_goal === g ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-400'"
                    class="py-4 rounded-xl text-[10px] font-black uppercase transition border border-transparent">
              {{ g }}
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alergi (Opsional)</label>
          <input v-model="form.allergies" type="text" placeholder="Misal: Kacang, Seafood..." class="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none font-bold transition shadow-inner" />
        </div>

        <button @click="analyze" :disabled="loading" class="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-orange-700 transition flex items-center justify-center gap-3 disabled:opacity-50 group">
          <Sparkles v-if="!loading" :size="20" class="group-hover:animate-pulse" />
          <Loader2 v-else class="animate-spin" :size="20" />
          {{ loading ? 'AI sedang menghitung...' : 'Minta Rekomendasi AI' }}
        </button>
      </div>

      <!-- Hasil Analisis -->
      <div class="relative">
        <div v-if="results" class="space-y-8 animate-in fade-in slide-in-from-right-4">
           <div class="bg-green-50 border border-green-100 p-6 rounded-3xl relative">
              <div class="absolute -top-3 left-6 bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">Saran Ahli Gizi AI</div>
              <p class="text-sm text-green-900 leading-relaxed font-medium italic">"{{ results.summary }}"</p>
           </div>

           <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Target Kalori</p>
                <p class="text-2xl font-black text-slate-800">{{ results?.macroTargets?.calories ?? 0 }} <span class="text-xs">kCal</span></p>
              </div>
              <div class="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Protein</p>
                <p class="text-2xl font-black text-slate-800">{{ results?.macroTargets?.protein ?? 0 }} <span class="text-xs">g</span></p>
              </div>
           </div>

           <div class="space-y-4">
              <div v-for="(val, key) in macros" :key="key">
                <div class="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                  <span>{{ macroLabel(key) }}</span>
                  <span>{{ val }}{{ macroUnit(key) }}</span>
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-orange-500 transition-all duration-1000" :style="{ width: barWidth(val, key) + '%' }"></div>
                </div>
              </div>
           </div>

           <div class="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-4">
             <div class="flex items-center justify-between gap-4">
               <div>
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rekomendasi Makanan</p>
                 <h4 class="text-lg font-black text-slate-800">Pilihan menu untuk target harianmu</h4>
               </div>
               <div v-if="hasAllergyInput" class="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                 Disesuaikan dengan alergi
               </div>
             </div>

             <div v-if="recommendedMenus.length" class="space-y-3">
               <div v-for="menu in recommendedMenus" :key="menu.id" class="bg-white rounded-[1.5rem] border border-slate-100 p-4 flex gap-4 items-center shadow-sm">
                 <img :src="menu.imageUrl" :alt="menu.menuName" class="w-20 h-20 rounded-[1.25rem] object-cover bg-slate-100 shrink-0" />
                 <div class="min-w-0 flex-1">
                   <h5 class="text-base font-black text-slate-800">{{ menu.menuName }}</h5>
                   <p class="text-xs text-slate-500 leading-relaxed mt-1">{{ menu.reason }}</p>
                 </div>
               </div>
             </div>

             <div v-else class="bg-amber-50 border border-amber-100 rounded-[1.5rem] p-4 text-sm text-amber-700 font-medium">
               Belum ada menu yang aman untuk alergi yang Anda masukkan. Coba ubah preferensi alergi atau tambahkan pilihan menu lain.
             </div>
           </div>
        </div>

        <div v-else class="h-full min-h-[300px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
            <Brain :size="48" class="text-slate-200 mb-6" />
            <p class="text-slate-400 font-bold max-w-[200px]">Isi data biometrik Anda untuk melihat hasil analisis AI</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { Activity, Sparkles, Loader2, Brain } from 'lucide-vue-next';

const props = defineProps(['menus']);
const emit = defineEmits(['results']);

const loading = ref(false);
const results = ref(null);

const form = reactive({
  height: 170,
  weight: 65,
  activity_level: 'sedentary',
  health_goal: 'maintenance',
  allergies: ''
});

const macros = computed(() => results.value?.macroTargets || {});
const hasAllergyInput = computed(() => form.allergies.trim().length > 0);
const recommendedMenus = computed(() => {
  const menus = Array.isArray(results.value?.recommendedMenus) ? results.value.recommendedMenus : [];
  const sourceMenus = Array.isArray(props.menus) ? props.menus : [];

  return menus.map((menu) => {
    const matchedMenu = sourceMenus.find((item) => Number(item.id) === Number(menu.id)) || {};

    return {
      id: menu.id,
      menuName: menu.menuName || matchedMenu.name || 'Menu sehat',
      reason: menu.reason || 'Menu ini dipilih agar selaras dengan kebutuhan gizi Anda.',
      imageUrl: matchedMenu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
    };
  });
});

const macroLabel = (key) => {
  const labels = {
    calories: 'Kalori',
    protein: 'Protein',
    carbs: 'Karbohidrat',
    fats: 'Lemak'
  };
  return labels[key] || key;
};

const macroUnit = (key) => key === 'calories' ? ' kCal' : ' g';

const barWidth = (val, key) => {
  const max = key === 'calories' ? 3000 : key === 'carbs' ? 400 : 200;
  return Math.min(100, (val / max) * 100);
};

const analyze = async () => {
  if (!props.menus || !Array.isArray(props.menus) || props.menus.length === 0) {
    alert('Menu belum tersedia. Coba refresh atau cek koneksi database.');
    return;
  }
  loading.value = true;
  try {
    const res = await fetch('/api/ai/recommend-menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userProfile: form,
        menuDatabase: props.menus
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'Request failed');
    }
    const data = await res.json();
    results.value = data;
    emit('results', data);
  } catch (e) {
    console.error(e);
    alert('Terjadi kesalahan pada AI. Mohon coba lagi.');
  } finally {
    loading.value = false;
  }
};
</script>
