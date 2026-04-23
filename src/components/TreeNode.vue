<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  node: { type: Object, required: true },
  currentSlug: { type: String, default: "" },
  query: { type: String, default: "" },
  depth: { type: Number, default: 0 },
});

const isFolder = computed(() => Array.isArray(props.node.children));
const expanded = ref(true);

function matches(node, q) {
  if (!q) return true;
  if (node.file) return node.title.toLowerCase().includes(q);
  if (node.children) return node.children.some((c) => matches(c, q));
  return false;
}

const visibleChildren = computed(() => {
  if (!isFolder.value) return [];
  const q = props.query.trim().toLowerCase();
  return q
    ? props.node.children.filter((c) => matches(c, q))
    : props.node.children;
});

const effectivelyExpanded = computed(() =>
  props.query ? visibleChildren.value.length > 0 : expanded.value
);

const shouldRenderFolder = computed(
  () => !props.query || visibleChildren.value.length > 0
);
</script>

<template>
  <div
    v-if="isFolder && shouldRenderFolder"
    class="tree__folder"
    :data-depth="depth"
  >
    <button
      type="button"
      class="tree__toggle"
      :style="{ paddingLeft: `${8 + depth * 12}px` }"
      @click="expanded = !expanded"
    >
      <span class="tree__caret" :class="{ open: effectivelyExpanded }">▶</span>
      <span class="tree__label">{{ node.title }}</span>
    </button>
    <div v-show="effectivelyExpanded" class="tree__children">
      <TreeNode
        v-for="(child, i) in visibleChildren"
        :key="child.slug || child.title + i"
        :node="child"
        :current-slug="currentSlug"
        :query="query"
        :depth="depth + 1"
      />
    </div>
  </div>
  <router-link
    v-else-if="!isFolder"
    class="tree__leaf"
    :class="{ active: node.slug === currentSlug }"
    :to="{ name: 'page', params: { slug: node.slug } }"
    :style="{ paddingLeft: `${22 + depth * 12}px` }"
  >
    {{ node.title }}
  </router-link>
</template>
