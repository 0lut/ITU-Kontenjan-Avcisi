const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
  {
    facebookId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    crns: [
      {
        code: { type: String, ref: 'CourseProgram' },
        isNotified: { type: Boolean, default: false },
      },
    ],
    state: {
      type: Number,
      Default: 0,
    },
    inputs: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);
UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

UserSchema.statics.STATES = {
  Default: 0,
  CRN_ADD: 1,
  CRN_DELETE: 2,
  CRN_UNFOLLOW: 3,
};

UserSchema.virtual('populatedCrns', {
  ref: 'CourseProgram', // The model to use
  localField: 'crns.code', // Find people where `localField`
  foreignField: 'crn', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
});

module.exports = mongoose.model('User', UserSchema);
