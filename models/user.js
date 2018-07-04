const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
mongoose.promise = Promise;

const tempPw = bcrypt.hashSync("BootsNPants", bcrypt.genSaltSync(10), null);

const userSchema = new Schema({
	username: { type: String, required: true },
	password: { type: String, required: true, default: tempPw },
	firstName: String,
	lastName: String,
	email: String,
	street: String,
	city: String,
	state: String,
	zipcode: Number,
	phone: String,
	waivers: [{
		filepath: String,
		signed: Boolean
	}],
	reservations: [{
		itemId: String,
		date: {
			from: Number,
			to: Number
		}
	}],

	//	Remove if testing doesn't work out
	testReservations: [{
		type: Schema.Types.ObjectId,
		ref: "Reservation"
	}],
//	END remove if...

	pastRentals: [{
		itemId: String,
		date: {
			from: Number,
			to: Number
		}
	}],
	purchases: [{
		itemId: String,
		date: Number,
		price: Schema.Types.Decimal128
	}],
	standing: {
    type: String,
    enum: ['Good', 'Uncertain', 'Banned'],
    default: 'Good'
  },
	admin: { type: Boolean, default: false }
});

// Define schema methods
userSchema.methods = {
	checkPassword: function (inputPassword) {
		return bcrypt.compareSync(inputPassword, this.password);
	},
	hashPassword: plainTextPassword => {
		return bcrypt.hashSync(plainTextPassword, 10);
	}
}

// Define hooks for pre-saving
userSchema.pre('save', function (next) {
	if (!this.password) {
		console.log('models/user.js =======NO PASSWORD PROVIDED=======');
		next();
	} else {
		console.log('models/user.js hashPassword in pre save');

		this.password = this.hashPassword(this.password);
		next();
	}
});

const User = mongoose.model('User', userSchema);

module.exports = User;


//  Docu-sign docs and iamges may be easier to store in a server file system and just referenced in the DB