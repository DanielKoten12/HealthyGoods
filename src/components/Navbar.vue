<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm px-6 py-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <!-- Logo -->
      <div class="flex items-center gap-2 cursor-pointer" @click="$emit('navigate', 'home')">
        <BrandLogo />
      </div>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-wider">
        <button v-for="item in navItems" :key="item.id" 
                @click="$emit('navigate', item.id)"
                :class="currentTab === item.id ? 'text-orange-600 border-b-2 border-orange-500 pb-1' : 'hover:text-orange-400 transition'">
          {{ item.label }}
        </button>
      </div>

      <!-- Auth/Profile -->
      <div class="hidden md:flex items-center gap-4">
        <div v-if="!user" class="flex gap-2">
           <button @click="$emit('login', 'student')" class="px-4 py-2 text-orange-600 font-bold hover:bg-orange-50 rounded-xl transition">Login</button>
           <button @click="$emit('navigate', 'catering')" class="px-6 py-2 bg-orange-500 text-white rounded-full font-bold shadow-lg hover:bg-orange-600 transition">Get Started</button>
        </div>
        <div v-else class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ user.is_premium ? user.subscription_tier : 'Free' }} Plan</p>
            <p class="text-sm font-bold text-slate-800">{{ user.name }}</p>
          </div>
          <button @click="$emit('logout')" class="p-2 hover:bg-orange-50 text-orange-500 rounded-full transition">
            <LogOut :size="20" />
          </button>
        </div>
      </div>

      <!-- Mobile Toggle -->
      <button @click="mobileOpen = !mobileOpen" class="md:hidden p-2 text-slate-600">
        <Menu v-if="!mobileOpen" :size="24" />
        <X v-else :size="24" />
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileOpen" class="md:hidden absolute top-full left-0 w-full bg-white border-b border-orange-100 p-6 flex flex-col gap-4 shadow-xl">
      <button v-for="item in navItems" :key="item.id" 
              @click="$emit('navigate', item.id); mobileOpen = false"
              class="text-left font-bold text-slate-600 uppercase tracking-widest p-2 hover:bg-orange-50 rounded-lg">
        {{ item.label }}
      </button>
      <hr class="border-orange-50" />
      <div v-if="!user" class="flex flex-col gap-2">
         <button @click="$emit('login', 'student')" class="py-3 text-orange-600 font-bold">Login</button>
         <button @click="$emit('navigate', 'catering'); mobileOpen = false" class="py-3 bg-orange-500 text-white rounded-xl font-bold">Get Started</button>
      </div>
      <div v-else class="flex items-center justify-between p-2">
        <span class="font-bold">{{ user.name }}</span>
        <button @click="$emit('logout')" class="text-orange-500 font-bold">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { LogOut, Menu, X } from 'lucide-vue-next';
import BrandLogo from './BrandLogo.vue';

defineProps(['currentTab', 'user']);
defineEmits(['navigate', 'login', 'logout']);

const mobileOpen = ref(false);

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'menu', label: 'Menu' },
  { id: 'catering', label: 'Catering' },
  { id: 'ai', label: 'NutriGenius AI' },
];
</script>
