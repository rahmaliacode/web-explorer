<template>
  <div class="folder-tree">
    <div class="panel-header">
      <i class="fas fa-sitemap"></i>
      <span>Folder Structure</span>
    </div>
    <div class="panel-content">
      <div v-if="loading" class="loading">Loading folders...</div>
      <div v-else-if="folders.length === 0" class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>No folders found</p>
      </div>
      <div v-else class="tree-container">
        <div
          v-for="folder in rootFolders"
          :key="folder.id"
          class="folder-item"
          :class="{ selected: selectedFolder?.id === folder.id }"
          @click="selectFolder(folder)"
        >
          <i class="fas fa-folder"></i>
          <span class="folder-name">{{ folder.name }}</span>
          <span class="folder-path">{{ folder.path }}</span>
        </div>
        <div v-for="folder in childFolders" :key="folder.id">
          <div
            class="folder-item child"
            :class="{ selected: selectedFolder?.id === folder.id }"
            :style="{ paddingLeft: `${getFolderLevel(folder) * 20 + 8}px` }"
            @click="selectFolder(folder)"
          >
            <i class="fas fa-folder"></i>
            <span class="folder-name">{{ folder.name }}</span>
            <span class="folder-path">{{ folder.path }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { folderApi, type Folder } from '@/services/api';

interface Props {
  selectedFolder: Folder | null;
}

interface Emits {
  (e: 'folder-selected', folder: Folder): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(true);
const folders = ref<Folder[]>([]);

const rootFolders = computed(() => 
  folders.value.filter(folder => folder.parent_id === null)
);

const childFolders = computed(() => 
  folders.value.filter(folder => folder.parent_id !== null)
);

const getFolderLevel = (folder: Folder): number => {
  let level = 0;
  let currentFolder = folder;
  
  while (currentFolder.parent_id) {
    level++;
    currentFolder = folders.value.find(f => f.id === currentFolder.parent_id)!;
    if (!currentFolder) break;
  }
  
  return level;
};

const selectFolder = (folder: Folder) => {
  emit('folder-selected', folder);
};

const loadFolders = async () => {
  try {
    loading.value = true;
    folders.value = await folderApi.getAllFolders();
  } catch (error) {
    console.error('Error loading folders:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadFolders();
});
</script>

<style scoped>
.folder-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #d2d0ce;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #f3f2f1;
  border-bottom: 1px solid #d2d0ce;
  font-weight: 600;
  color: #323130;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.tree-container {
  font-size: 14px;
}

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

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #666;
  font-style: italic;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d2d0ce;
}

.empty-state p {
  font-size: 14px;
  line-height: 1.5;
}
</style>
