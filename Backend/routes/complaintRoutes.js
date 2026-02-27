const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, complaintController.createComplaint);
router.get('/my', authMiddleware, complaintController.getMyComplaints);
router.get('/', authMiddleware, complaintController.getComplaints);
router.put('/:id', authMiddleware, complaintController.updateComplaintStatus);

module.exports = router;