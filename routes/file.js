const router = require('express').Router();
const fileController = require('../controllers/fileController');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/vandelay_rental';

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

//  RENTAL IMAGE ROUTES
// Matches with '/file/image/filenames'
// Retrieves filenames for a specific rental to put into the src html attribute
router.route('/image/filenames/:id')
  .get(isAdmin, fileController.findAllRentalImages);

// This route is called in the img tag src attribute
router.route('/image/:filename')
  .get(isAdmin, fileController.findImageById);

// Matches with '/file/image/:id'
// Uploading images to the database
router
  .route('/image/:id')
  .post(isAdmin, upload.single('file'), fileController.createRentalImage);

// Matches with '/file/image/:id'
// Remove image from db
router
  .route('/image/:id/:rental')
  .delete(isAdmin, fileController.removeRentalImage);


//  PASTRENTAL IMAGE ROUTES
// Matches with '/file/image/past/filenames'
router.route('/image/past/filenames/:id')
  .get(isAdmin, fileController.findAllPastRentalImages);

// This route is called in the img tag src attribute
router.route('/image/past/:filename')
  .get(isAdmin, fileController.findImageById);

// Matches with '/file/image/past/:id'
// Uploading images to the database
router
  .route('/image/past/:id')
  .post(isAdmin, upload.single('file'), fileController.createPastRentalImage);

// Matches with '/file/image/past/:id/:rental'
router
  .route('/image/past/:id/:rental')
  .delete(isAdmin, fileController.removePastRentalImage);

  
// Matches with '/file/waiver'
router
  .route('/waiver')
  .post(fileController.createSignatureRequest);

// Checks user is logged in as admin
function isAdmin(req, res, next) {
  if (req.user.admin)
    return next();
  res.json({ isAuthenticated: false });
}

module.exports = router;
