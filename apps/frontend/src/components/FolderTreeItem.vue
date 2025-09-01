<template>
  <div>
    <div
      class="folder-item"
      :class="{ selected: selectedFolder?.id === folder.id }"
      :style="{ paddingLeft: `${folder.level * 20 + 8}px` }"
      @click="$emit('select', folder)"
      @dblclick="$emit('open', folder)"
    >
      <i class="fas fa-folder"></i>
      <span class="folder-name">{{ folder.name }}</span>
      <span class="folder-path">{{ folder.path }}</span>
    </div>
    
    <!-- Recursively render children -->
    <template v-for="child in folder.children" :key="child.id">
      <FolderTreeItem
        :folder="child"
        :selected-folder="selectedFolder"
        @select="$emit('select', $event)"
        @open="$emit('open', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Folder } from '@/services/api';

interface Props {
  folder: Folder & { level: number; children: any[] };
  selectedFolder: Folder | null;
}

defineProps<Props>();
defineEmits<{
  select: [folder: Folder];
  open: [folder: Folder];
}>();
</script>

<style scoped>
.folder-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  margin: 2px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  user-select: none;
}

.folder-item:hover {
  background-color: #f3f2f1;
}

.folder-item.selected {
  background-color: #deecf9;
  color: #0078d4;
}

.folder-item i {
  color: #ffd700;
  width: 16px;
  text-align: center;
}

.folder-item .folder-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-item .folder-path {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}
</style>
