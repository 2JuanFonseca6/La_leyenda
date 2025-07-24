// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@nuxt/ui", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],

  // Components
  components: [{ path: "~/components", pathPrefix: false }],

  app: {
    head: {
      title: "La Leyenda De San Rafael",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        // Google Font
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "", // Boolean attribute 'crossorigin'
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap",
        },
      ],
    },
  },

  // Color Mode Nuxt UI
  colorMode: { preference: "dark" },

  // UI Nuxt Module
  ui: {
    colorMode: true,
    fonts: true,
    theme: {
      transitions: true,
    },
  },

  // Supabase Nuxt Module
  supabase: {
    url: process.env.NUXT_SUPABASE_URL,
    key: process.env.NUXT_SUPABASE_KEY,
    serviceKey: process.env.NUXT_SUPABASE_SERVICE_KEY,
    redirect: true,
    redirectOptions: {
      login: "/login",
      callback: "/callback",
      exclude: ["/about"],
    },
    // 
    clientOptions: {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
      },
    }
  },

  // Nuxt Build
  build: {
    transpile: ["@vue-flow/core", "@vue-flow/additional-components", "vue-chartjs"],
  },

  // Nitro configuration
  nitro: {
    experimental: {
      wasm: true
    }
  },
});
