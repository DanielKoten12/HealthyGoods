<template>
  <div class="brand-logo" :class="logoClass" role="img" aria-label="Healthy Goods">
    <img :src="brandLogo" alt="" class="brand-logo__image" aria-hidden="true" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import brandLogo from '../../logo/2.png';

const props = defineProps({
  variant: {
    type: String,
    default: 'nav',
  },
});

const logoClass = computed(() => props.variant === 'footer' ? 'brand-logo--footer' : 'brand-logo--nav');
</script>

<style scoped>
.brand-logo {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.brand-logo__image {
  position: absolute;
  max-width: none;
  width: var(--logo-source-size);
  height: var(--logo-source-size);
  left: var(--logo-source-left);
  top: var(--logo-source-top);
}

.brand-logo--nav {
  width: 7rem;
  height: 3.6rem;
  --logo-source-size: 10rem;
  --logo-source-left: -1.6rem;
  --logo-source-top: -3.28rem;
}

.brand-logo--footer {
  width: 8.25rem;
  height: 4.2rem;
  --logo-source-size: 11.8rem;
  --logo-source-left: -1.9rem;
  --logo-source-top: -3.88rem;
}
</style>
