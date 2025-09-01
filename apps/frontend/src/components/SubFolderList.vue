<template>
  <div class="subfolder-list">
    <div class="panel-header">
      <i class="fas fa-folder"></i>
      <span>{{ panelTitle }}</span>
    </div>
    <div class="panel-content">
      <div v-if="!selectedFolder" class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>Select a folder from the left panel to view its subfolders</p>
      </div>
      <div v-else-if="loading" class="loading">Loading subfolders...</div>
      <div v-else-if="subfolders.length === 0" class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>This folder has no subfolders</p>
      </div>
      <div v-else class="subfolders-container">
        <div
          v-for="subfolder in subfolders"
          :key="subfolder.id"
          class="subfolder-item"
        >
          <div class="subfolder-info">
            <i class="fas fa-folder"></i>
            <span class="subfolder-name">{{ subfolder.name }}</span>
            <span class="subfolder-path">{{ subfolder.path }}</span>
          </div>
          <div class="subfolder-actions">
            <button 
              class="action-btn delete" 
              @click="deleteFolder(subfolder.id)"
              title="Delete folder"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { folderApi, type Folder } from '@/services/api';

interface Props {
  selectedFolder: Folder | null;
}

interface Emits {
  (e: 'folder-deleted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);
const subfolders = ref<Folder[]>([]);

const panelTitle = computed(() => {
  if (!props.selectedFolder) {
    return 'Select a folder to view contents';
  }
  return `Contents of: ${props.selectedFolder.name}`;
});

const loadSubfolders = async (folderId: number) => {
  try {
    loading.value = true;
    subfolders.value = await folderApi.getSubfolders(folderId);
  } catch (error) {
    console.error('Error loading subfolders:', error);
    subfolders.value = [];
  } finally {
    loading.value = false;
  }
};

const deleteFolder = async (folderId: number) => {
  if (!confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
    return;
  }

  try {
    await folderApi.deleteFolder(folderId);
    emit('folder-deleted');
    // Reload subfolders after deletion
    if (props.selectedFolder) {
      await loadSubfolders(props.selectedFolder.id);
    }
  } catch (error) {
    console.error('Error deleting folder:', error);
    alert('Failed to delete folder');
  }
};

watch(() => props.selectedFolder, (newFolder) => {
  if (newFolder) {
    loadSubfolders(newFolder.id);
  } else {
    subfolders.value = [];
  }
}, { immediate: true });
</script>

<style scoped>
.subfolder-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  flex: 1;
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

.subfolders-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subfolder-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.subfolder-item:hover {
  background-color: #f3f2f1;
}

.subfolder-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.subfolder-item i {
  color: #ffd700;
  width: 16px;
  text-align: center;
}

.subfolder-name {
  font-weight: 500;
}

.subfolder-path {
  font-size: 12px;
  color: #666;
}

.subfolder-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.subfolder-item:hover .subfolder-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  background-color: transparent;
  color: #666;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #d2d0ce;
  color: #333;
}

.action-btn.delete:hover {
  background-color: #d13438;
  color: white;
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
