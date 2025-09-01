<template>
  <div class="explorer-container">
    <!-- Header -->
    <div class="explorer-header">
      <div class="header-left">
        <i class="fas fa-folder-open"></i>
        <span>Windows Explorer</span>
      </div>
      <div class="header-right">
        <button @click="showNewFolderModal = true" class="btn btn-primary">
          <i class="fas fa-folder-plus"></i>
          New Folder
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="explorer-content">
      <!-- Left Panel - Folder Tree -->
      <div class="left-panel">
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
              :key="`${folder.id}-${folders.length}`"
              class="folder-item"
              :class="{ selected: selectedFolder?.id === folder.id }"
              @click="selectFolder(folder)"
              @dblclick="openFolder(folder)"
            >
              <i class="fas fa-folder"></i>
              <span class="folder-name">{{ folder.name }}</span>
              <span class="folder-path">{{ folder.path }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Subfolders -->
      <div class="right-panel">
        <div class="panel-header">
          <i class="fas fa-folder"></i>
          <span>{{ panelTitle }}</span>
        </div>
        <div class="panel-content">
          <div v-if="!selectedFolder" class="empty-state">
            <i class="fas fa-folder-open"></i>
            <p>Select a folder from the left panel to view its subfolders</p>
          </div>
          <div v-else-if="subfoldersLoading" class="loading">Loading subfolders...</div>
          <div v-else-if="subfolders.length === 0" class="empty-state">
            <i class="fas fa-folder-open"></i>
            <p>This folder has no subfolders</p>
          </div>
          <div v-else class="subfolders-container">
            <div
              v-for="subfolder in subfolders"
              :key="`${subfolder.id}-${subfolders.length}`"
              class="subfolder-item"
              @click="selectFolder(subfolder)"
              @dblclick="openFolder(subfolder)"
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
    </div>

    <!-- New Folder Modal -->
    <div v-if="showNewFolderModal" class="modal show" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Folder</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createFolder">
            <div class="form-group">
              <label for="folderName">Folder Name:</label>
              <input 
                type="text" 
                id="folderName" 
                v-model="newFolderName" 
                required
                placeholder="Enter folder name"
              >
            </div>
            <div class="form-group">
              <label for="parentFolder">Parent Folder:</label>
              <select id="parentFolder" v-model="selectedParentId">
                <option value="">Root (No Parent)</option>
                <option 
                  v-for="folder in allFolders" 
                  :key="folder.id" 
                  :value="folder.id"
                >
                  {{ folder.path }}
                </option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="!newFolderName.trim()">
                Create Folder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { folderApi, type Folder } from '@/services/api';

const selectedFolder = ref<Folder | null>(null);
const allFolders = ref<Folder[]>([]);
const folders = ref<Folder[]>([]);
const subfolders = ref<Folder[]>([]);
const showNewFolderModal = ref(false);
const newFolderName = ref('');
const selectedParentId = ref<number | ''>('');
const loading = ref(true);
const subfoldersLoading = ref(false);

const rootFolders = computed(() => 
  folders.value.filter(folder => folder.parent_id === null).sort((a, b) => a.name.localeCompare(b.name))
);

const panelTitle = computed(() => {
  if (!selectedFolder.value) {
    return 'Select a folder to view contents';
  }
  return `Contents of: ${selectedFolder.value.name}`;
});

const selectFolder = (folder: Folder) => {
  selectedFolder.value = folder;
};

const openFolder = (folder: Folder) => {
  // When double-clicking, we want to navigate into the folder
  // This means selecting it and showing its contents
  selectedFolder.value = folder;
  // The watch will automatically load subfolders
};

const loadFolders = async () => {
  try {
    loading.value = true;
    folders.value = await folderApi.getAllFolders();
    allFolders.value = folders.value;
  } catch (error) {
    console.error('Error loading folders:', error);
  } finally {
    loading.value = false;
  }
};

const loadSubfolders = async (folderId: number) => {
  try {
    subfoldersLoading.value = true;
    subfolders.value = await folderApi.getSubfolders(folderId);
  } catch (error) {
    console.error('Error loading subfolders:', error);
    subfolders.value = [];
  } finally {
    subfoldersLoading.value = false;
  }
};

const deleteFolder = async (folderId: number) => {
  if (!confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
    return;
  }

  try {
    await folderApi.deleteFolder(folderId);
    
    // Clear the selected folder if it was the one being deleted
    if (selectedFolder.value?.id === folderId) {
      selectedFolder.value = null;
    }
    
    // Reload all folders to update the tree
    await loadFolders();
    
    // If we still have a selected folder, reload its subfolders
    if (selectedFolder.value) {
      await loadSubfolders(selectedFolder.value.id);
    }
  } catch (error) {
    console.error('Error deleting folder:', error);
    alert('Failed to delete folder');
  }
};

const createFolder = async () => {
  if (!newFolderName.value.trim()) return;

  try {
    const parentId = selectedParentId.value || null;
    await folderApi.createFolder({
      name: newFolderName.value.trim(),
      parent_id: parentId
    });

    await loadFolders();
    closeModal();
    
    if (selectedFolder.value && selectedFolder.value.id === parentId) {
      const currentFolder = selectedFolder.value;
      selectedFolder.value = null;
      setTimeout(() => {
        selectedFolder.value = currentFolder;
      }, 100);
    }
  } catch (error) {
    console.error('Error creating folder:', error);
    alert('Failed to create folder');
  }
};

const closeModal = () => {
  showNewFolderModal.value = false;
  newFolderName.value = '';
  selectedParentId.value = '';
};

watch(() => selectedFolder.value, (newFolder) => {
  if (newFolder) {
    loadSubfolders(newFolder.id);
  } else {
    subfolders.value = [];
  }
}, { immediate: true });

onMounted(() => {
  loadFolders();
});
</script>

<style scoped>
.explorer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
}

/* Header */
.explorer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, #0078d4, #106ebe);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 10px;
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #0078d4;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #106ebe;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f2f1;
  color: #323130;
  border: 1px solid #d2d0ce;
}

.btn-secondary:hover {
  background-color: #edebe9;
}

/* Main Content */
.explorer-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Panels */
.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-right: 1px solid #d2d0ce;
}

.left-panel {
  width: 300px;
  min-width: 250px;
}

.right-panel {
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

/* Folder Tree */
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

/* Subfolders List */
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

/* Loading and Empty States */
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

/* Modal */
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #d2d0ce;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #323130;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: #f3f2f1;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #323130;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d2d0ce;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .explorer-content {
    flex-direction: column;
  }
  
  .left-panel {
    width: 100%;
    height: 40%;
    min-height: 200px;
  }
  
  .right-panel {
    height: 60%;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>
