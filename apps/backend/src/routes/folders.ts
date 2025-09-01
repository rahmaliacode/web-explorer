import { Elysia, t } from 'elysia';
import { FolderService } from '../services/folderService';

export const createFolderRoutes = (folderService: FolderService) => {
  return new Elysia({ prefix: '/api/folders' })
    .get('/', async () => {
      try {
        const folders = await folderService.getAllFolders();
        return folders;
      } catch (error) {
        throw new Error('Failed to fetch folders');
      }
    })
    .get('/:id', async ({ params }) => {
      try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
          throw new Error('Invalid folder ID');
        }
        
        const folder = await folderService.getFolderById(id);
        if (!folder) {
          throw new Error('Folder not found');
        }
        
        return folder;
      } catch (error) {
        throw new Error('Failed to fetch folder');
      }
    })
    .get('/:id/subfolders', async ({ params }) => {
      try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
          throw new Error('Invalid folder ID');
        }
        
        const subfolders = await folderService.getSubfolders(id);
        return subfolders;
      } catch (error) {
        throw new Error('Failed to fetch subfolders');
      }
    })
    .post('/', async ({ body }) => {
      try {
        const folder = await folderService.createFolder(body);
        return folder;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to create folder');
      }
    }, {
      body: t.Object({
        name: t.String(),
        parent_id: t.Optional(t.Union([t.Number(), t.Null()]))
      })
    })
    .delete('/:id', async ({ params }) => {
      try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
          throw new Error('Invalid folder ID');
        }
        
        const success = await folderService.deleteFolder(id);
        if (!success) {
          throw new Error('Failed to delete folder');
        }
        
        return { message: 'Folder deleted successfully' };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to delete folder');
      }
    });
};
