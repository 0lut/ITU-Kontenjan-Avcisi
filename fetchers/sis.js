const axios = require('axios');
const CourseProgram = require('../models/CourseProgram');

async function fetchCourseCodes() {
  const url = 'http://www.sis.itu.edu.tr/tr/ders_programlari/LSprogramlar/prg.php';
  const response = await axios.get(url);

  const pattern = new RegExp('<option {2}value="(.*?)">.*<\\/option>', 'g');
  const courseCodes = [];
  let match;

  do {
    match = pattern.exec(response.data);
    if (match) {
      courseCodes.push(match[1]);
    }
  } while (match);
  return courseCodes;
}

function parseCourseProgram(sourceData) {
  let match;

  const pattern = new RegExp('<td>(\\d+)<\\/td>', 'g');
  const parsedDigitData = [];

  do {
    match = pattern.exec(sourceData);
    if (match) {
      parsedDigitData.push(match[1]);
    }
  } while (match);
  return parsedDigitData;
}

function fetchAndSave(options, cb) {
  fetchCourseCodes()
    .then((courseCodes) => {
      // Clean collection
      CourseProgram.remove({}, console.log);
      const promises = [];

      courseCodes.forEach((singleCourseCode) => {
        const url = `http://www.sis.itu.edu.tr/tr/ders_programlari/LSprogramlar/prg.php?fb=${singleCourseCode}`;
        promises.push(axios.get(url));
      });

      axios
        .all(promises)
        .then((results) => {
          results.forEach((response) => {
            const parsedCourseData = parseCourseProgram(response.data);
            const parsedCourseLength = parsedCourseData.length;
            for (let i = 0; i < parsedCourseLength; i += 3) {
              const courseObject = new CourseProgram({
                crn: parsedCourseData[i],
                capacity: parsedCourseData[i + 1],
                enrolled: parsedCourseData[i + 2],
              });
              courseObject.save();
            }
          });

          cb(null, courseCodes);
        })
        .catch(err => console.error(err));
    })
    .catch((err) => {
      cb(err, null);
    });
}

function Sis() {}

Sis.prototype.fetchAndSave = fetchAndSave;

module.exports = Sis;
