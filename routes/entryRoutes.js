import express from 'express';
const router = express.Router();
import { protectRoute } from '../middlewares/protectRoute.js';
import { createEntry, deleteEntry, editEntry, getEntries, getEntryById } from '../controllers/entry.controller.js';
router.post('/create', protectRoute, createEntry); // Up to 5 images
router.get('/all', protectRoute, getEntries);
router.put('/edit/:id', protectRoute, editEntry);
router.get('/:id',protectRoute,getEntryById);
router.delete('/:id',protectRoute,deleteEntry)
export default router;
