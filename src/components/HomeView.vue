<template>
  <div class="space-y-24 pb-24">
    <!-- Hero -->
    <section class="max-w-7xl mx-auto px-6 pt-12">
      <div class="relative bg-orange-500 rounded-[3rem] p-10 md:p-20 text-white overflow-hidden shadow-2xl">
        <div class="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span class="inline-block px-4 py-1 bg-white/20 backdrop-blur border border-white/20 text-white rounded-full text-xs font-black uppercase tracking-widest mb-6">Pesan Antar Mahasiswa ITK</span>
            <h2 class="text-4xl md:text-7xl font-black leading-tight mb-8">
              Makan Enak, <br/>
              <span class="text-orange-100">Tetap Sehat.</span>
            </h2>
            <p class="text-lg md:text-xl text-orange-50 mb-10 max-w-md leading-relaxed">
              Catering khusus mahasiswa dengan menu gizi seimbang. Cuma Rp26.000 per porsi untuk masa depan lebih bugar.
            </p>
            <div class="flex flex-wrap gap-4">
              <button @click="$emit('navigate', 'menu')" class="bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition transform">Lihat Menu</button>
              <button @click="$emit('navigate', 'catering')" class="bg-orange-600/50 backdrop-blur border border-white/20 text-white px-10 py-5 rounded-2xl font-bold hover:bg-orange-600 transition">Paket Langganan</button>
            </div>
          </div>
          <div class="hidden lg:block relative">
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c" alt="Healthy Meal" class="rounded-[2.5rem] shadow-2xl w-full transform -rotate-3 hover:rotate-0 transition duration-700" />
            <div class="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl text-slate-800 flex items-center gap-4">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Users :size="24" />
              </div>
              <div>
                <p class="text-2xl font-black">500+</p>
                <p class="text-xs font-bold text-slate-400 uppercase">Pelanggan Aktif</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Decorations -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-orange-400 rounded-full blur-[100px] opacity-40"></div>
        <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-600 rounded-full blur-[80px] opacity-60"></div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="max-w-7xl mx-auto px-6 text-center">
      <h3 class="text-3xl md:text-4xl font-black mb-16 text-slate-800">Cara Kerja Kami</h3>
      <div class="grid md:grid-cols-3 gap-12">
        <div v-for="(step, i) in steps" :key="i" class="flex flex-col items-center">
          <div class="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center text-orange-500 mb-6 border border-orange-50 relative">
            <component :is="step.icon" :size="32" />
            <div class="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-sm">{{ i+1 }}</div>
          </div>
          <h4 class="text-xl font-black mb-3">{{ step.title }}</h4>
          <p class="text-slate-500 max-w-xs">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="bg-slate-50 py-24 px-6 overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h3 class="text-3xl md:text-4xl font-black mb-4">Kata Mereka</h3>
          <p class="text-slate-500">Mahasiswa ITK yang sudah beralih ke pola makan sehat.</p>
        </div>
        <div class="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
          <div v-for="testi in testimonials" :key="testi.name" class="min-w-[320px] md:min-w-[400px] bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-6">
            <div class="flex items-center gap-4">
              <img :src="testi.image" class="w-14 h-14 rounded-full border-2 border-orange-100" />
              <div>
                <h5 class="font-black text-slate-800">{{ testi.name }}</h5>
                <div class="flex text-yellow-400">
                  <Star v-for="s in 5" :key="s" :size="14" fill="currentColor" />
                </div>
              </div>
            </div>
            <p class="text-slate-600 leading-relaxed italic">"{{ testi.quote }}"</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { Users, Utensils, CreditCard, Rocket, Star } from 'lucide-vue-next';

defineEmits(['navigate']);

const steps = [
  { icon: Utensils, title: 'Pilih Menu', desc: 'Pilih menu sehat favorit Anda di katalog harian kami.' },
  { icon: CreditCard, title: 'Bayar Mudah', desc: 'Lakukan pembayaran aman via QRIS atau Transfer Bank.' },
  { icon: Rocket, title: 'Antar Cepat', desc: 'Makanan diantar tepat waktu ke kos atau kampus Anda.' },
];

const testimonials = [
  { name: 'Rizwan Firmansyah', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rizwan', quote: 'NutriGenius AI beneran ngebantu buat tracking kalori pas lagi sibuk skripsian!' },
  { name: 'Siti Aminah', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti', quote: 'Menu Ayam Bakar Nasi Merahnya juara banget, gak nyangka makanan sehat bisa seenak ini.' },
  { name: 'Kevin Pratama', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin', quote: 'Harga mahasiswa banget tapi kualitasnya gak murahan. Recommended pol!' }
];
</script>
