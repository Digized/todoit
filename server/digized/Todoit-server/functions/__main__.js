const Clarifai = require('clarifai');
const Jimp = require("jimp");
const fs = require("fs");
const request = require("request");



const app = new Clarifai.App({
  apiKey: 'eaede3cf123e49c990f497457f88d4d2'
});

/**
* A basic Hello World function
* @param {buffer} image image to determine
* @returns {object}
*/


module.exports = (image, context, callback) => {
  const promises = [];
  Jimp.read(image)
    .then((Image) => {
      promises.push(analyze(Image));
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          promises.push(analyzePart(Image, i, j))
        }
      }
    }).then(_ => {
      Promise.all(promises).then(function () {
        const outputs = {};
        const datas = arguments[0];
        datas.forEach(data => {
          data.outputs[0].data.concepts.forEach(concept => {
            if (concept.value > 0.7) {
              if (outputs[concept.id] == undefined)
                outputs[concept.id] = concept
              else {
                if (concept.value > outputs[concept.id].value)
                  outputs[concept.id] = concept
              }
            }
          });
        });
        if (Object.keys(outputs).length > 0) {
          Object.keys(outputs).forEach((out) => {
            sendToTODO(outputs[out].id, function (err, res) {
              return callback(null, { status: "SUCCESS", outputs });
            });
          });
        } else {
          return callback(null, { status: "SUCCESS CLEAN", outputs });
        }
      }).catch(e => callback(e)); 
    }).catch(e=>callback(e));
};


function analyzePart(Image, i, j) {
  return new Promise(function (resolve, reject) {
    Image.clone().crop(i * Image.bitmap.width / 3, j * Image.bitmap.height / 3, Image.bitmap.width / 3, Image.bitmap.height / 3).getBuffer("image/png", (err, buffer) => {
      err && reject(err);
      app.models.predict('dirty', buffer.toString("base64"))
        .then(response => {
          resolve(response);
        },
        function (err) {
          reject(err);
        });
    });
  });
}

function analyze(Image) {
  return new Promise(function (resolve, reject) {
    Image.clone().getBuffer("image/png", (err, buffer) => {
      err && reject(err);
      app.models.predict('dirty', buffer.toString("base64"))
        .then(response => {
          resolve(response);
        },
        function (err) {
          reject(err);
        });
    });
  });
}


function idResolver(id) {
  let val;
  switch (id) {
    case 'messy-clothes':
      val = "Clean Up Clothes";
      break;
  }
  return val;
}


function sendToTODO(id, cb) {
  request.post("http://066892d0.ngrok.io/checklist",
    { json: { "checklist": [{ "checked": false, "text": idResolver(id) }] } },
    cb)
}