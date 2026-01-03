const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const enrollmentCtrl = require('../controllers/enrollmentController');

router.post('/', authMiddleware, enrollmentCtrl.enroll);
router.get('/me', authMiddleware, enrollmentCtrl.listMy);
router.get('/check', authMiddleware, enrollmentCtrl.checkEnrollment); // API mới - check enrollment cho 1 course

module.exports = router;
