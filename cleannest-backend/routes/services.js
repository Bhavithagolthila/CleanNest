const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/auth');

// ─────────────────────────────────────────────────
// PUBLIC: GET /api/services
// Returns all active services (used by frontend)
// ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ active: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch services.' });
  }
});

// ─────────────────────────────────────────────────
// ADMIN: GET /api/services/all (includes inactive)
// ─────────────────────────────────────────────────
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch services.' });
  }
});

// ─────────────────────────────────────────────────
// ADMIN: POST /api/services
// Create a new service
// ─────────────────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, price, icon, desc, duration, popular, active, order } = req.body;
    if (!name || !price || !desc || !duration) {
      return res.status(400).json({ success: false, message: 'Name, price, description and duration are required.' });
    }
    const service = await Service.create({ name, price, icon: icon || '🏠', desc, duration, popular: !!popular, active: active !== false, order: order || 0 });
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not create service.' });
  }
});

// ─────────────────────────────────────────────────
// ADMIN: PATCH /api/services/:id
// Update a service
// ─────────────────────────────────────────────────
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update service.' });
  }
});

// ─────────────────────────────────────────────────
// ADMIN: DELETE /api/services/:id
// Delete a service
// ─────────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not delete service.' });
  }
});

module.exports = router;
