<template>
  <div class="min-h-screen bg-[#FFFDF5] text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900">
    <!-- Component-based Navigation -->
    <Navbar 
      :current-tab="currentTab" 
      :user="user" 
      @navigate="navigate" 
      @login="login" 
      @logout="logout" 
    />

    <!-- Main Content Area with Transitions -->
    <main class="min-h-[calc(100vh-80px)]">
      <transition 
        name="fade" 
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        leave-active-class="transition duration-200 ease-in"
        enter-from-class="opacity-0 translate-y-4"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <HomeView v-if="currentTab === 'home'" @navigate="navigate" />
        <MenuView v-else-if="currentTab === 'menu'" :menus="menus" />
        <CateringView v-else-if="currentTab === 'catering'" @upgrade="upgradeSubscription" />
        <NutriGeniusView 
          v-else-if="currentTab === 'ai'" 
          :can-access="canAccessAI"
          :menus="menus"
          @navigate="navigate"
        />
      </transition>
    </main>

    <!-- Component-based Footer -->
    <Footer @navigate="navigate" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import HomeView from './components/HomeView.vue';
import MenuView from './components/MenuView.vue';
import CateringView from './components/CateringView.vue';
import NutriGeniusView from './nutrigenius/NutriGeniusView.vue';
import Footer from './components/Footer.vue';

// --- State Management ---
const currentTab = ref('home');
const user = ref(null);
const menus = ref([]);
const recommendations = ref(null);
const isLoadingRecs = ref(false);

const profile = reactive({
  height: 175,
  weight: 70,
  activity_level: 'lightly_active',
  health_goal: 'maintenance',
});

// --- Computed Logic ---
const canAccessAI = computed(() => {
  if (!user.value?.is_premium) return false;
  return ['monthly', 'yearly'].includes(user.value.subscription_tier);
});

// --- Navigation & Auth ---
const navigate = (tab) => {
  currentTab.value = tab;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const login = (type) => {
  // Simplified dummy login mechanism
  user.value = {
    id: 'dummy-u-1234',
    name: type === 'premium' ? 'Budi Premium' : 'Siti Student',
    email: 'user@itk.ac.id',
    is_premium: type === 'premium',
    subscription_tier: type === 'premium' ? 'monthly' : 'free'
  };
};

const logout = () => {
  user.value = null;
  currentTab.value = 'home';
};

const upgradeSubscription = (tier) => {
  if (!user.value) login('student');
  user.value.is_premium = true;
  user.value.subscription_tier = tier;
};

// --- Data Fetching ---
const fetchMenus = async () => {
  try {
    const res = await fetch('/api/menus');
    if (!res.ok) throw new Error('API unstable');
    menus.value = await res.json();
  } catch (e) {
    // Elegant fallback data
      menus.value = [
        { id: 1, name: 'Bowl Quinoa Salmon Panggang', category: 'Ikan', description: 'Salmon panggang dengan biji quinoa organik dan sayuran segar.', calories: 480, protein: 34, carbs: 42, fats: 16, allergens: ['fish'], image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
        { id: 2, name: 'Dada Ayam Kukus Brokoli', category: 'Ayam', description: 'Dada ayam kukus rempah dengan paket serat lengkap.', calories: 350, protein: 38, carbs: 24, fats: 9, allergens: [], image_url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55' },
        { id: 3, name: 'Nasi Merah Ikan Pepes', category: 'Ikan', description: 'Kekayaan rempah nusantara dengan ikan kembung pilihan.', calories: 420, protein: 30, carbs: 45, fats: 12, allergens: ['fish'], image_url: 'https://6a2ed140d2c53535166b76e0.imgix.net/NasiMerahIkanPepes.png' },
      ];
  }
};

const getRecommendations = async (profileData) => {
  isLoadingRecs.value = true;
  try {
    // 1. Sync profile to server
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.value.id,
        ...profileData,
        subscription_tier: user.value.subscription_tier
      })
    });

    // 2. Get AI Insights
    const res = await fetch(`/api/recommendations?userId=${user.value.id}`);
    if (!res.ok) throw new Error('AI Server Timeout');
    recommendations.value = await res.json();
  } catch (e) {
    console.error('AI Logic Error:', e);
    // Mock for demo
    setTimeout(() => {
      recommendations.value = {
        summary: "Berdasarkan biometrik Anda, kami menyarankan asupan karbohidrat kompleks lebih tinggi untuk menjaga konsentrasi belajar di kampus.",
        macroTargets: { calories: 2650, protein: 130, carbs: 320, fats: 68 },
        recommendedMenus: [
          { id: 1, menuName: "Bowl Quinoa Salmon Panggang", reason: "Kaya protein dan lemak sehat omega-3 untuk membantu pemulihan otot dan menjaga kenyang lebih lama." },
          { id: 3, menuName: "Nasi Merah Ikan Pepes", reason: "Memberikan energi stabil dari karbohidrat kompleks dengan lauk tinggi protein yang tetap ringan." }
        ]
      };
      isLoadingRecs.value = false;
    }, 1500);
  } finally {
    if (recommendations.value) isLoadingRecs.value = false;
  }
};

// --- Helpers ---
const getMenuName = (id) => menus.value.find(m => m.id === id)?.name || 'Catering Menu';
const getMenuImage = (id) => menus.value.find(m => m.id === id)?.image_url || '';
const handleAddToCart = (id) => alert(`Menambahkan ${getMenuName(id)} ke pesanan hari ini!`);

onMounted(fetchMenus);
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  scroll-behavior: smooth;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
