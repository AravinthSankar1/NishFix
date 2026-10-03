import { Router } from 'express';
import { SoftwareController } from '../controllers/softwareController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const publicRouter = Router();
const adminRouter = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
publicRouter.get('/', SoftwareController.listPublicSoftware);
publicRouter.get('/brands', SoftwareController.getBrands);
publicRouter.get('/:id', SoftwareController.getPublicSoftwareById);
publicRouter.post('/:id/download', SoftwareController.downloadSoftware);

// ==========================================
// PROTECTED ADMIN ROUTES
// ==========================================
adminRouter.use(authenticateAdmin);

adminRouter.get('/dashboard', SoftwareController.getDashboardStats);
adminRouter.get('/software', SoftwareController.listAdminSoftware);
adminRouter.get('/software/:id', SoftwareController.getAdminSoftwareById);
adminRouter.post('/software', SoftwareController.createSoftware);
adminRouter.put('/software/:id', SoftwareController.updateSoftware);
adminRouter.delete('/software/:id', SoftwareController.deleteSoftware);

adminRouter.post('/software/:id/publish', SoftwareController.publishSoftware);
adminRouter.post('/software/:id/unpublish', SoftwareController.unpublishSoftware);
adminRouter.post('/software/:id/archive', SoftwareController.archiveSoftware);

export { publicRouter as publicSoftwareRouter, adminRouter as adminSoftwareRouter };
