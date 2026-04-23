<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Sidebar from "./components/Sidebar.vue";
import PageViewer from "./components/PageViewer.vue";

const route = useRoute();
const router = useRouter();
const tree = ref([]);
const pages = ref([]);
const error = ref(null);
const sidebarCollapsed = ref(false);

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/\.html?$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function annotate(nodes, flat) {
  return nodes.map((n) => {
    if (Array.isArray(n.children)) {
      return { ...n, children: annotate(n.children, flat) };
    }
    const slug = n.slug || slugify(n.title || n.file);
    const leaf = { ...n, slug };
    flat.push(leaf);
    return leaf;
  });
}

onMounted(async () => {
  try {
    const res = await fetch("manifest.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`manifest.json: ${res.status}`);
    const data = await res.json();
    const flat = [];
    tree.value = annotate(data.tree || [], flat);
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
      <PageViewer v-if="currentPage" :file="currentPage.file" />
      <div v-else class="empty-state">
        <p>Select a page from the sidebar.</p>
      </div>
    </main>
  </div>
</template>
