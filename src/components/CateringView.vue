<template>
  <div class="max-w-7xl mx-auto px-6 py-12 space-y-24 pb-24">
    <!-- Header -->
    <header class="text-center max-w-2xl mx-auto">
      <h2 class="text-4xl font-black text-slate-800 mb-6 tracking-tight">Investasi Kesehatan di Masa Kuliah</h2>
      <p class="text-slate-500 leading-relaxed">Pilih paket langganan yang fleksibel sesuai budget dan kebutuhan belajarmu.</p>
    </header>

    <!-- Pricing Plans -->
    <div class="grid lg:grid-cols-3 gap-8 items-stretch">
      <div v-for="plan in plans" :key="plan.id" 
           :class="plan.highlight ? 'bg-orange-500 text-white shadow-2xl scale-105 border-0 grow' : 'bg-white text-slate-800 shadow-sm border border-orange-50'"
           class="rounded-[3rem] p-10 flex flex-col transition relative">
        
        <div v-if="plan.highlight" class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#22C55E] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
          Sangat Direkomendasikan
        </div>

        <div class="mb-10 text-center">
          <h3 class="text-xl font-black uppercase tracking-[0.2em] mb-4" :class="plan.highlight ? 'text-orange-100' : 'text-slate-400'">{{ plan.name }}</h3>
          <div class="flex items-center justify-center gap-1">
            <span class="text-2xl font-bold opacity-60">Rp</span>
            <span class="text-5xl font-black tracking-tighter">{{ plan.price }}</span>
            <span class="text-sm font-bold opacity-60">/{{ plan.period }}</span>
          </div>
        </div>

        <ul class="space-y-4 mb-12 flex-1">
          <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-3">
            <CheckCircle :size="18" class="shrink-0 mt-0.5" :class="plan.highlight ? 'text-green-300' : 'text-green-500'" />
            <span class="text-sm font-medium leading-tight" :class="plan.highlight ? 'text-orange-50' : 'text-slate-500'">{{ feat }}</span>
          </li>
        </ul>

        <button @click="showCheckout(plan)" 
                :class="plan.highlight ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'"
                class="w-full py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition transform">
          Pilih Paket
        </button>
      </div>
    </div>

    <!-- FAQ Section -->
    <section class="max-w-3xl mx-auto space-y-12">
      <h3 class="text-3xl font-black text-center text-slate-800">Sering Ditanyakan</h3>
      <div class="space-y-4">
        <div v-for="(f, i) in faqs" :key="i" class="bg-white border border-slate-100 rounded-3xl overflow-hidden cursor-pointer" @click="activeFaq = activeFaq === i ? null : i">
          <div class="p-6 flex justify-between items-center bg-slate-50/50">
            <h4 class="font-bold text-slate-800">{{ f.q }}</h4>
            <ChevronDown :size="20" class="transition-transform duration-300" :class="{ 'rotate-180': activeFaq === i }" />
          </div>
          <div v-show="activeFaq === i" class="p-6 text-sm text-slate-500 leading-relaxed border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
            {{ f.a }}
          </div>
        </div>
      </div>
    </section>

    <!-- Checkout Modal Simulation -->
    <div v-if="checkoutPlan" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="checkoutPlan = null"></div>
      <div class="bg-white w-full max-w-md rounded-[3rem] p-10 flex flex-col gap-8 shadow-2xl relative z-10 animate-in zoom-in duration-300">
         <div class="text-center">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBasket :size="32" />
            </div>
            <h4 class="text-2xl font-black text-slate-800 mb-2">Simulasi Checkout</h4>
            <p class="text-sm text-slate-400">Ringkasan paket langganan Anda</p>
         </div>

         <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
            <div class="flex justify-between items-center">
               <span class="text-sm text-slate-500 font-bold">Paket</span>
               <span class="font-black text-slate-800 uppercase text-xs tracking-widest">{{ checkoutPlan.name }}</span>
            </div>
            <div class="flex justify-between items-center text-xl">
               <span class="font-bold text-slate-500">Total</span>
               <span class="font-black text-orange-600">Rp{{ checkoutPlan.price }}</span>
            </div>
         </div>

         <div class="space-y-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2">Pilih Pembayaran</p>
            <button v-for="m in ['QRIS (GoPay/OVO/Dana)', 'Bank Transfer (BCA/Mandiri)']" :key="m" class="w-full p-4 rounded-2xl border-2 border-slate-100 text-left text-sm font-bold flex justify-between items-center hover:border-orange-500 transition">
               {{ m }}
               <ChevronRight :size="16" />
            </button>
         </div>

         <button @click="confirmPayment" class="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition shadow-xl mt-4">
           Konfirmasi & Bayar
         </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { CheckCircle, ChevronDown, ChevronRight, ShoppingBasket } from 'lucide-vue-next';

const emit = defineEmits(['upgrade']);

const activeFaq = ref(null);
const checkoutPlan = ref(null);

const plans = [
  { id: 'weekly', name: 'Mingguan', price: '175.000', period: 'minggu', features: ['6 Menu Makan Siang', 'Pengiriman Gratis ke Kampus', 'Konsultasi Nutrisi Dasar'], highlight: false },
  { id: 'monthly', name: 'Bulanan', price: '650.000', period: 'bulan', features: ['24 Menu Makan Siang', 'Akses UNLIMITED NutriGenius AI', 'Personalized Macro Tracking', 'Pengiriman Prioritas'], highlight: true },
  { id: 'yearly', name: 'Semesteran', price: '2.400.000', period: 'semester', features: ['Menu Full 1 Semester', 'Akses Full NutriGenius AI+', 'Membership Exclusive HealthyHub', 'Bonus Snack Sehat Setiap Jumat'], highlight: false },
];

const faqs = [
  { q: 'Apakah menu diganti setiap hari?', a: 'Ya, kami memiliki variasi 20+ menu berbeda setiap bulannya agar Anda tidak bosan.' },
  { q: 'Bisa request tanpa bahan tertentu (Alergi)?', a: 'Tentu! Anda bisa mengaturnya di profil kesehatan atau memanfaatkan NutriGenius AI untuk otomatis memfilter menu.' },
  { q: 'Kapan batas waktu pemesanan?', a: 'Untuk paket langganan, jadwal antar akan disepakati di awal. Untuk satuan, pesan max H-1 jam 19.00.' },
];

const showCheckout = (plan) => {
  checkoutPlan.value = plan;
};

const confirmPayment = () => {
  emit('upgrade', checkoutPlan.value.id);
  checkoutPlan.value = null;
  alert('Pembayaran Berhasil! Paket langganan Anda telah aktif.');
};
</script>
