const router = require('express').Router();
const chargeController = require('../../controllers/chargeController');

// Matches with 'api/charge'
router
  .route('/')
  .post(isLoggedIn, chargeController.charge);

router
  .route('/reservation/paid')
  .put(isLoggedIn, chargeController.respaid);

router
  .route('/registration/paid')
  .put(isLoggedIn, chargeController.regpaid);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.json({ isAuthenticated: false });
}

module.exports = router;