import { Router } from 'express';
import ServiceManager from '../managers/ServiceManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const serviceManager = new ServiceManager(path.join(__dirname, '../data/services.json'));

// GET /api/services (Devuelve todos o filtrados por query params: ?category=... o ?available=...)
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    let services = await serviceManager.getServices();

    if (category) {
      services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (available !== undefined) {
      const isAvailable = available === 'true';
      services = services.filter(s => s.available === isAvailable);
    }

    res.json({ status: 'success', payload: services });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/services/:sid (Devuelve un servicio por ID o 404 si no existe)
router.get('/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const service = await serviceManager.getServiceById(sid);
    
    if (service.error) {
      return res.status(404).json({ status: 'error', message: service.error });
    }
    
    res.json({ status: 'success', payload: service });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/services (Crea un servicio; ID generado automáticamente; 201 o 400 si faltan campos)
router.post('/', async (req, res) => {
  try {
    const result = await serviceManager.addService(req.body);
    if (result.error) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /api/services/:sid (Actualiza el servicio, protege el ID, 200 o 404 si no existe)
router.put('/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const result = await serviceManager.updateService(sid, req.body);
    
    if (result.error) {
      return res.status(404).json({ status: 'error', message: result.error });
    }
    
    res.json({ status: 'success', payload: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/services/:sid (Elimina el servicio, 200 o 404 si no existe)
router.delete('/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const result = await serviceManager.deleteService(sid);
    
    if (result.error) {
      return res.status(404).json({ status: 'error', message: result.error });
    }

    res.json({ status: 'success', message: 'Servicio eliminado correctamente', payload: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;