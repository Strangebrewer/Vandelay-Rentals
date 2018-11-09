const router = require('express').Router();
const salesController = require('../../controllers/salesController');

// Matches with '/api/sales'
router.route('/')
  .get(salesController.findAll);

module.exports = router;
