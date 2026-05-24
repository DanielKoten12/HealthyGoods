<template>
  <footer class="bg-white border-t border-orange-100 py-16 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="grid md:grid-cols-4 gap-12 mb-16">
        <!-- Logo & Tagline -->
        <div class="md:col-span-1">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">H</div>
            <h1 class="text-2xl font-black tracking-tight text-orange-600">Healthy<span class="text-green-600">Goods</span></h1>
          </div>
          <p class="text-sm text-slate-500 leading-relaxed font-medium">Pelayanan katering mahasiswa berbasis gizi dengan dukungan teknologi AI untuk masa depan yang lebih sehat.</p>
        </div>

        <!-- Links -->
        <div v-for="(group, name) in links" :key="name">
          <h5 class="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6">{{ name }}</h5>
          <ul class="space-y-4">
            <li v-for="link in group" :key="link">
              <a href="#" class="text-sm font-bold text-slate-600 hover:text-orange-500 transition">{{ link }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="pt-12 border-t border-orange-50 flex flex-col md:flex-row justify-between items-center gap-8">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 Healthy Goods Catering ITK. Terdaftar di Kampus Balikpapan.</p>
        <div class="flex gap-4">
          <a v-for="icon in [Instagram, Twitter, Github]" :key="icon" href="#" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 transition">
            <component :is="icon" :size="18" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Instagram, Twitter, Github } from 'lucide-vue-next';

const links = {
  Layanan: ['Home', 'Menu Harian', 'Paket Catering', 'NutriGenius AI'],
  Perusahaan: ['Tentang Kami', 'Media Kit', 'Karir', 'Hubungi Kami'],
  Legal: ['Syarat & Ketentuan', 'Kebijakan Privasi', 'Lisensi']
};
</script>
