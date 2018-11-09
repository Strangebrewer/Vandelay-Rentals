const db = require('../models');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const hellosign = require('hellosign-sdk')({key: "885fe716760ad052c0df78878bd1aeb6f09292b59d82fe035888a457cc4c133a"}); // hellosign SDK in order to run hellosign api calls

let gfs;

const dbConnection = require('../connection/connection');

dbConnection.once('open', () => {
  gfs = Grid(dbConnection.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Defining methods for the imageController
module.exports = {

  findAllRentalImages: function (req, res) {
    db.Rental.findOne({ _id: req.params.id })
      .then(rental => {
        gfs.files.find({
          _id: { $in: rental.images }
        }).toArray((err, files) => {
          res.send(files);
        })
      })
  },

  findImageById: function (req, res) {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists"'
        });
      }

      // Check if image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  },

  createRentalImage: function (req, res) {
    db.Rental.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { images: req.file.id } },
      { new: true }
    ).then(file => {
      res.json(file);
    })
  },

  removeRentalImage: function (req, res) {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
      if (err) return res.status(404).json({ err: err });
      db.Rental.findOneAndUpdate(
        { _id: req.params.rental },
        { $pull: { images: req.params.id } },
        { new: true }
      ).then(rental => {
        res.json(rental);
      })
    });
  },

  findAllPastRentalImages: function (req, res) {
    db.PastRental.findOne({ _id: req.params.id })
      .then(pr => {
        gfs.files.find({
          _id: { $in: pr.images }
        }).toArray((err, files) => {
          res.send(files);
        })
      })
  },

  createPastRentalImage: function (req, res) {
    db.PastRental.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { images: req.file.id } },
      { new: true }
    ).then(file => {
      res.json(file);
    })
  },

  removePastRentalImage: function (req, res) {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
      if (err) return res.status(404).json({ err: err });
      db.PastRental.findOneAndUpdate(
        { _id: req.params.rental },
        { $pull: { images: req.params.id } },
        { new: true }
      ).then(rental => {
        res.json(rental);
      })
    });
  },

  // hellosign-embeded
  createSignatureRequest: function (req, res) {

    //captures the client's email and their name from the request.body
    const { clientEmail , clientName } = req.body;

    // hellosign client id and key that are specified for our app (Vandelay Rental) on their site
    const options = {
      clientId: "aaad4deadb45633d2cc5ebe07ed2eff2", // our app client id
      test_mode: 1, // test mode active, required for non-paid account and is not legally binding
      subject: 'Waiver form to sign for Vandelay Rentals',
      template_id:"490bc3ea7078ff84da3e7fe13f919de766d1a743" ,
      message: 'Please sign and read this waiver in order to continue with the rental process.',
      signers: [
        {
          email_address: clientEmail, // passed from the deconstructed req.bode
          name: clientName, // passed from the deconstructed req.bode
          role: "client",
          order: 0
        }
      ],
    };

    hellosign.signatureRequest.createEmbeddedWithTemplate(options)

    .then((data) => {

      const firstSignature = data.signature_request.signatures[0];
      const signatureId = firstSignature.signature_id;

      return hellosign.embedded.getSignUrl(signatureId);
      })
      .then((response) => {
        res.json({
          success: true,
          data: {
            signUrl: response.embedded.sign_url
          }
        });
      })
    .catch((err) => {
      res.json({
        success: false
      });
    });
  }

};
