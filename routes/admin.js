const router = require('express').Router();
const adminCoursesController = require('../controllers/adminCoursesController');
const adminRentalsController = require('../controllers/adminRentalsController');
const adminSalesController = require('../controllers/adminSalesController');
const adminUsersController = require('../controllers/adminUsersController');

// COURSES //
// Matches with '/admin/courses'
router.route('/courses')
  .get(isAdmin, adminCoursesController.findAll)
  .post(isAdmin, adminCoursesController.create);

// Matches with '/admin/courses/:id'
router
  .route('/courses/:id')
  .put(isAdmin, adminCoursesController.update)
  .delete(isAdmin, adminCoursesController.remove);

// Matches with '/admin/courses/registrations/:id'
router
  .route('/courses/registrations/:id')
  .put(isAdmin, adminCoursesController.updateRegistration);


// RENTALS//
// Matches with '/admin/rentals'
router.route('/rentals')
  .get(isAdmin, adminRentalsController.findAll)
  .post(isAdmin, adminRentalsController.create);

// Matches with '/admin/rentals/:id'
router
  .route('/rentals/:id')
  .put(isAdmin, adminRentalsController.updateRental)
  .delete(isAdmin, adminRentalsController.remove);

// Matches with '/admin/rentals/reservations/:id'
router
  .route('/rentals/reservations/:id')
  .put(isAdmin, adminRentalsController.updateReservation)
  .post(isAdmin, adminRentalsController.finishReservation);

router
  .route('/rentals/past/:id')
  .put(isAdmin, adminRentalsController.updatePastRental);


  // SALES //
// Matches with '/admin/sales'
router.route('/sales')
  .get(isAdmin, adminSalesController.findAll)
  .post(isAdmin, adminSalesController.create);

// Matches with '/admin/sales/:id'
router
  .route('/sales/:id')
  .put(isAdmin, adminSalesController.update)
  .delete(isAdmin, adminSalesController.remove);


// USERS //
// Matches with '/admin/users'
router.route('/users')
  .get(isAdmin, adminUsersController.findAll);

// Matches with '/admin/users/:id'
router
  .route('/users/:id')
  .put(isAdmin, adminUsersController.update)
  .delete(isAdmin, adminUsersController.remove);

  module.exports = router;


// Make sure user is signed in as admin before calling the controller function
function isAdmin(req, res, next) {
  if (req.user.admin)
    return next();
  res.json({ isAuthenticated: false });
}