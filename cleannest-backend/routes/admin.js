const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalBookings, totalUsers, bookingsByStatus] = await Promise.all([
      Booking.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$price' } } },
      ]),
    ]);
    const stats = { totalBookings, totalUsers, byStatus: {}, totalRevenue: 0 };
    bookingsByStatus.forEach(s => {
      stats.byStatus[s._id] = { count: s.count, revenue: s.revenue };
      if (s._id !== 'Cancelled') stats.totalRevenue += s.revenue;
    });
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch stats.' });
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { service: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ];
    }
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Booking.countDocuments(query);
    res.json({ success: true, bookings, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch bookings.' });
  }
});

// PATCH /api/admin/bookings/:id/status
// Allowed transitions:
//   Confirmed → Completed only
//   Pending   → Confirmed or Cancelled
//   Completed → no change (locked)
//   Cancelled → no change (locked)
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const current = booking.status;

    const allowed = {
      Confirmed: ['Completed'],
      Pending:   ['Confirmed', 'Cancelled'],
      Completed: [],
      Cancelled: [],
    };

    if (!allowed[current] || !allowed[current].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from "${current}" to "${status}".`,
      });
    }

    booking.status = status;
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update status.' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const [totalBookings, bookingsByStatus, totalSpent] = await Promise.all([
          Booking.countDocuments({ user: u._id }),
          Booking.aggregate([{ $match: { user: u._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
          Booking.aggregate([{ $match: { user: u._id, status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$price' } } }]),
        ]);
        const byStatus = {};
        bookingsByStatus.forEach(s => { byStatus[s._id] = s.count; });
        return {
          _id: u._id, name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt,
          totalBookings, byStatus, totalSpent: totalSpent[0]?.total || 0,
        };
      })
    );
    res.json({ success: true, users: usersWithStats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch users.' });
  }
});

// GET /api/admin/users/:id/bookings
router.get('/users/:id/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch user bookings.' });
  }
});

module.exports = router;
