const mongoose = require('mongoose'),
  bcrypt = require('bcryptjs'),
  SALT_WORK_FACTOR = 10,
  Post = require('./comment'),
  Comment = require('./comment');

const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: { unique: true },
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    token: { type: String },
  },
  { timestamps: true },
);
// Person.pre('deleteMany', function(next) {
//   var person = this;
//   person.model('Assignment').deleteOne({ person: person._id }, next);
//   });
userSchema.pre('remove', function (next) {
  Post.remove({ author: this._id }).exec();
  Comment.deleteOne({ made_by: this._id }, next);
  next();
});

// hash the password before using this model
userSchema.pre('save', function (next) {
  const user = this;
  // do nothing if password is not modified
  if (!user.isModified('password')) return next();
  // gen salt then hash if password is modified or if it is new
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

//comapre user password with password  stored in the database
userSchema.methods.comparePassword = function (userpassword, cb) {
  bcrypt.compare(userpassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

const User = mongoose.model('Users', userSchema);
module.exports = User;
