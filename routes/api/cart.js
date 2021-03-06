const router = require('express').Router();
const cartController = require('../../controllers/cartController');


// Matches with '/api/cart/:id'
// the id is the user's id - this gets a user's cart
router
  .route('/:id')
  .get(isLoggedIn, cartController.findUserCart);

router
  .route('/courses/:id')
  .post(isLoggedIn, cartController.addRegistrationToCart)
  .delete(isLoggedIn, cartController.removeRegistrationFromCart);

router
  .route('/rentals/date/:from/:to')
  .put(isLoggedIn, cartController.changeReservationInCart)
  .post(isLoggedIn, cartController.addReservationToCart);

router
  .route('/rentals/:id')
  .delete(isLoggedIn, cartController.removeReservationFromCart);

router
  .route('/checkout')
  .post(isLoggedIn, cartController.checkout);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.json({ isAuthenticated: false });
}

module.exports = router;
