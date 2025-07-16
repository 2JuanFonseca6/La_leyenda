<template>
  <div class="flex min-h-screen w-full bg-[var(--color-m7)] dark:bg-[var(--color-m2)] relative">
    <!-- Fondo decorativo con overlay -->
    <div class="absolute inset-0 z-0">
      <img src="/assets/img/login/orion.webp" alt="Imagen decorativa" class="w-full h-full object-cover object-center blur-sm opacity-60" />
      <div class="absolute inset-0 bg-white/60 dark:bg-black/60"></div>
    </div>
    <!-- Contenedor centrado -->
    <div class="relative z-10 flex w-full min-h-screen items-center justify-center">
      <div class="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/90 dark:bg-[var(--color-m2)]/90 backdrop-blur-lg border border-[var(--color-custom-100)] dark:border-[var(--color-custom-500)]">
        <!-- Logo grande y centrado -->
        <div class="flex flex-col items-center mb-8">
          <img v-if="isDark" src="/assets/img/logo/logo-white.webp" alt="Logo San Rafael - Tema Oscuro"
            class="mx-auto h-48 w-auto drop-shadow-lg mb-2 animate-bounce-in" />
          <img v-else src="/assets/img/logo/logo-negro.webp" alt="Logo San Rafael - Tema Claro"
            class="mx-auto h-48 w-auto drop-shadow-lg mb-2 animate-bounce-in grayscale-100" />
        </div>
        <!-- Título y subtítulo -->
        <h2 class="mb-2 text-center text-3xl font-bold text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Bienvenido de vuelta</h2>
        <p class="text-center text-gray-500 dark:text-gray-300 mb-6">Por favor ingresa tus credenciales para continuar</p>
        <!-- Formulario -->
        <UForm :state="state" class="space-y-5" @submit="login">
          <UInput v-model="state.email" type="email" placeholder="ejemplo@email.com" icon="i-heroicons-envelope"
            class="w-full rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--color-custom-400)]" autocomplete="username" />
          <div class="relative">
            <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña" icon="i-heroicons-lock-closed" class="w-full rounded-lg pr-10 shadow-sm focus:ring-2 focus:ring-[var(--color-custom-400)]" autocomplete="current-password" />
            <button type="button"
              class="absolute inset-y-0 right-2 flex cursor-pointer items-center text-gray-500 transition-colors dark:text-gray-300"
              @click="showPassword = !showPassword" aria-label="Toggle password visibility">
              <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="h-5 w-5" />
            </button>
          </div>
          <UButton block type="submit" :loading="isLoading"
            class="mt-2 py-3 text-lg font-bold tracking-widest uppercase bg-[var(--color-custom-400)] dark:bg-[var(--color-custom-100)] text-white dark:text-[var(--color-custom-400)] rounded-lg shadow-md hover:scale-105 transition-transform">
            <span v-if="!isLoading">Ingresar</span>
          </UButton>
        </UForm>
      </div>
    </div>
    <!-- Botón de theming eliminado del login -->
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useSupabaseClient, useRouter } from '#imports';

const supabase = useSupabaseClient();
const router = useRouter();
const isLoading = ref(false);
const showPassword = ref(false);
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const state = reactive({
  email: '',
  password: ''
});

const login = async () => {
  if (!state.email || !state.password) {
    useToast().add({
      title: 'Campos requeridos',
      description: 'Por favor completa todos los campos',
      icon: 'i-heroicons-exclamation-circle',
      color: 'warning',
    });
    return;
  }

  try {
    isLoading.value = true;
    const { error } = await supabase.auth.signInWithPassword({
      email: state.email,
      password: state.password
    });

    if (error) throw error;

    // Animación de salida antes de redireccionar
    // document.querySelector('.animate-fade-in-right').classList.add('animate-fade-out-left');
    // await new Promise(resolve => setTimeout(resolve, 500));

    useToast().add({
      title: '¡Bienvenido!',
      description: 'Has iniciado sesión correctamente',
      icon: 'i-heroicons-check-circle',
      color: 'success'
    });

    await router.push('/');
  } catch (err) {
    let message = 'Error al iniciar sesión';
    if (err.message.includes('Invalid login credentials')) {
      message = 'Email o contraseña incorrectos';
    }

    useToast().add({
      title: 'Error',
      description: message,
      icon: 'i-heroicons-exclamation-circle',
      color: 'error'
    });
  } finally {
    isLoading.value = false;
  }
};

// Efecto parallax
onMounted(() => {
  const parallaxBg = document.querySelector('.parallax-bg');
  if (parallaxBg) {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.pageYOffset;
      parallaxBg.style.transform = `translateY(${scrollPosition * 0.3}px)`;
    });
  }
});
</script>

<style>
/* Animaciones personalizadas */
@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutLeft {
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.animate-fade-in-right {
  animation: fadeInRight 0.6s ease-out forwards;
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-fade-out-left {
  animation: fadeOutLeft 0.5s ease-in forwards;
}

.animate-bounce-in {
  animation: bounceIn 0.8s ease-out forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-400 {
  animation-delay: 0.4s;
}

.delay-500 {
  animation-delay: 0.5s;
}

.parallax-bg {
  will-change: transform;
  transition: transform 0.1s ease-out;
}

/* Ajustes para modo oscuro */
.dark .parallax-bg img {
  filter: brightness(0.8);
}
</style>