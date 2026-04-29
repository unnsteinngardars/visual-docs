<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import Sidebar from "./components/Sidebar.vue";
import PageViewer from "./components/PageViewer.vue";

const componentRegistry = {
  Tools: defineAsyncComponent(() => import("./pages/Tools.vue")),
  Documents: defineAsyncComponent(() => import("./pages/Documents.vue")),
  Articles: defineAsyncComponent(() => import("./pages/Articles.vue")),
  Websites: defineAsyncComponent(() => import("./pages/Websites.vue")),
  OwaspTop10: defineAsyncComponent(() => import("./pages/OwaspTop10.vue")),
  OsiModel: defineAsyncComponent(() => import("./pages/OsiModel.vue")),
  TcpIpModel: defineAsyncComponent(() => import("./pages/TcpIpModel.vue")),
  IpAddressesAndSubnets: defineAsyncComponent(() =>
    import("./pages/IpAddressesAndSubnets.vue")
  ),
  NetworkProtocols: defineAsyncComponent(() =>
    import("./pages/NetworkProtocols.vue")
  ),
  Routing: defineAsyncComponent(() => import("./pages/Routing.vue")),
  Nat: defineAsyncComponent(() => import("./pages/Nat.vue")),
  Wireshark: defineAsyncComponent(() => import("./pages/Wireshark.vue")),
  Tcpdump: defineAsyncComponent(() => import("./pages/Tcpdump.vue")),
  Nmap: defineAsyncComponent(() => import("./pages/Nmap.vue")),
  JohnTheRipper: defineAsyncComponent(() =>
    import("./pages/JohnTheRipper.vue")
  ),
  Metasploit: defineAsyncComponent(() => import("./pages/Metasploit.vue")),
  BurpSuite: defineAsyncComponent(() => import("./pages/BurpSuite.vue")),
  Hydra: defineAsyncComponent(() => import("./pages/Hydra.vue")),
  Gobuster: defineAsyncComponent(() => import("./pages/Gobuster.vue")),
  Sqlmap: defineAsyncComponent(() => import("./pages/Sqlmap.vue")),
  Cryptography: defineAsyncComponent(() => import("./pages/Cryptography.vue")),
  Hashing: defineAsyncComponent(() => import("./pages/Hashing.vue")),
  Shells: defineAsyncComponent(() => import("./pages/Shells.vue")),
  SOC: defineAsyncComponent(() => import("./pages/SOC.vue")),
};

const route = useRoute();
const router = useRouter();
const tree = ref([]);
const pages = ref([]);
const error = ref(null);
const sidebarCollapsed = ref(false);

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/\.(html?|md|markdown)$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function filterForEnv(nodes) {
  if (!import.meta.env.PROD) return nodes;
  return nodes
    .filter((n) => !n.hideInProd)
    .map((n) =>
      Array.isArray(n.children)
        ? { ...n, children: filterForEnv(n.children) }
        : n
    );
}

function annotate(nodes, flat) {
  return nodes.map((n) => {
    const hasRoute = !!(n.component || n.file);
    const hasChildren = Array.isArray(n.children);
    const annotated = { ...n };
    if (hasRoute) {
      annotated.slug = n.slug || slugify(n.title || n.file);
    }
    if (hasChildren) {
      annotated.children = annotate(n.children, flat);
    }
    if (hasRoute) flat.push(annotated);
    return annotated;
  });
}

onMounted(async () => {
  try {
    const res = await fetch("manifest.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`manifest.json: ${res.status}`);
    const data = await res.json();
    const flat = [];
    const filtered = filterForEnv(data.tree || []);
    tree.value = annotate(filtered, flat);
    for (const h of data.hidden || []) {
      const slug = h.slug || slugify(h.title || h.file);
      flat.push({ ...h, slug });
    }
    pages.value = flat;
    if (!route.params.slug && pages.value.length) {
      router.replace({ name: "page", params: { slug: pages.value[0].slug } });
    }
  } catch (err) {
    error.value = err.message;
  }
});

const currentPage = computed(() => {
  const slug = route.params.slug;
  return pages.value.find((p) => p.slug === slug) || null;
});

const currentComponent = computed(() => {
  const name = currentPage.value?.component;
  return name ? componentRegistry[name] || null : null;
});

watch(
  currentPage,
  (p) => {
    document.title = p
      ? `${p.title} — Cyber Resources`
      : "Cyber Resources Visualized";
  },
  { immediate: true }
);
</script>

<template>
  <div :class="['layout', { 'sidebar-collapsed': sidebarCollapsed }]">
    <Sidebar
      :tree="tree"
      :current-slug="String(route.params.slug || '')"
      :error="error"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />
    <main class="content">
      <component v-if="currentComponent" :is="currentComponent" />
      <PageViewer
        v-else-if="currentPage && currentPage.file"
        :file="currentPage.file"
      />
      <div v-else class="empty-state">
        <p>Select a page from the sidebar.</p>
      </div>
    </main>
  </div>
</template>
