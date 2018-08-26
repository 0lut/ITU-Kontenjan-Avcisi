const axios = require('axios');
const CourseProgram = require('../models/CourseProgram');
const XRegExp = require('./xregexp');
var Iconv  = require('iconv').Iconv;

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
function parseCourseInfo(sourceData) {
  let match;

  const pattern = new XRegExp('<td>([\\pL .I&\-\(\),:]+)<\/td><td>([\\pL \-,]+)<\/td><td><a class="link1"title="Bina kodlar', 'gu');

  const parsedInfo = [];

do {
    match = pattern.exec(sourceData);
    if (match) {
      parsedInfo.push({"name": match[1], "instructor": match[2]});
    }
  } while (match);
  return parsedInfo;

}

function fetchAndSave(options, cb) {
  fetchCourseCodes()
    .then((courseCodes) => {
      // Clean collection
      CourseProgram.remove({}, console.log);
      const promises = [];

      courseCodes.forEach((singleCourseCode) => {
        const url = `http://www.sis.itu.edu.tr/tr/ders_programlari/LSprogramlar/prg.php?fb=${singleCourseCode}`;
        promises.push(axios.request({
          url: url,
          method: 'GET',
          encoding: 'binary'
        }));
      });

      axios
        .all(promises)
        .then((results) => {
          results.forEach((responseIso) => {
            body = new Buffer(responseIso.data, 'binary');
            conv = new Iconv('windows-1254', 'utf-8');
            const response = conv.convert(body).toString();

            const parsedCourseData = parseCourseProgram(response);
            const parsedCourseLength = parsedCourseData.length;
	    const parsedCourseInfo = parseCourseInfo(response);
            for (let i = 0; i < parsedCourseLength; i += 3) {
              if(!parsedCourseInfo[i/3]) {
                parsedCourseInfo[i/3] = {name:"--", instructor:"--"};
              }
              const courseObject = new CourseProgram({
                crn: parsedCourseData[i],
                capacity: parsedCourseData[i + 1],
                enrolled: parsedCourseData[i + 2],
		name: parsedCourseInfo[i/3].name,
		instructor: parsedCourseInfo[i/3].instructor,
              });
              courseObject.save();
            }
          });

          //cb(null, courseCodes);
        })
        .catch(err => console.error(err));
    })
    .catch((err) => {
      console.error(err);
    });
}

function Sis() {}

Sis.prototype.fetchAndSave = fetchAndSave;

module.exports = Sis;
