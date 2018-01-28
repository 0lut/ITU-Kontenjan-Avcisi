const mongoose = require('mongoose');

const CourseProgram = mongoose.Schema(
  {
    crn: String,
    capacity: String,
    enrolled: String,
    courseCode: String,
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model('CourseProgram', CourseProgram);
