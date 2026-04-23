<script setup>
import { ref, computed } from "vue";
import TreeNode from "./TreeNode.vue";

const props = defineProps({
  tree: { type: Array, required: true },
  currentSlug: { type: String, default: "" },
  error: { type: String, default: null },
});

defineEmits(["toggle"]);

const query = ref("");

function hasMatch(node, q) {
  if (node.file) return node.title.toLowerCase().includes(q);
  if (node.children) return node.children.some((c) => hasMatch(c, q));
  return false;
}

const visibleRoots = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? props.tree.filter((n) => hasMatch(n, q)) : props.tree;
});
</script>

<template>
  <aside class="sidebar">
    <header class="sidebar__header">
      <h1>Cyber Resources</h1>
      <input
        v-model="query"
        type="search"
        placeholder="Filter pages…"
        autocomplete="off"
      />
    </header>
    <nav class="nav" aria-label="Pages">
      <div v-if="error" class="nav__error">
        Failed to load manifest.json<br /><small>{{ error }}</small>
      </div>
      <div v-else-if="query && visibleRoots.length === 0" class="nav__error">
        No pages match "{{ query }}"
      </div>
      <TreeNode
        v-for="(node, i) in visibleRoots"
        :key="node.slug || node.title + i"
        :node="node"
        :current-slug="currentSlug"
        :query="query"
      />
    </nav>
    <footer class="sidebar__footer">
      <button
        type="button"
        aria-label="Toggle sidebar"
        @click="$emit('toggle')"
      >
        &#9776;
      </button>
    </footer>
  </aside>
</template>
