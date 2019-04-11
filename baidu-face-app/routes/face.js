const express = require('express');
const router = express.Router();
const https = require('https');
const querystring = require('querystring');
const request = require('request');
const uuidv1 = require('uuid/v1');
const multer = require('multer');
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    let fileSuffix = file.originalname.split('.').pop();
    cb(null, uuidv1() + '-' + Date.now() + '.' + fileSuffix)
  }
})

const upload = multer({ storage: storage });

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class FacePlus {
  constructor() {
    this.url = 'https://api-cn.faceplusplus.com/facepp/v3/';
    this.token = {
      'api_key': 'dFBkLS33IlnkqMRMufVZ6pRELD7cAK0C',
      'api_secret': 'vuJ2VRYrDXUSM3gjCrqgR7fEe5smeRGH'
    }
  }
  faceDetect(imagePath) {
    let imageBase64 = fs.readFileSync(imagePath).toString("base64");
    let postOptions = {
      url: 'https://api-cn.faceplusplus.com/facepp/v3/detect',
      formData: {
        ...this.token,
        image_base64: imageBase64
      },
    };
    return new Promise((resolve, reject) => {
      request.post(
        postOptions,
        function(err, httpResponse, body) {
          if (err) {
            reject(err)
          }
          resolve(JSON.parse(body))
        }
      );
    })
  }
  faceMerage(templateBase64, templateRectangle, merageBase64, merageRate) {
    let postOptions = {
      url: 'https://api-cn.faceplusplus.com/imagepp/v1/mergeface',
      formData: {
        ...this.token,
        template_file: templateBase64,
        template_rectangle: templateRectangle,
        merge_file: merageBase64,
        merge_rate: merageRate
      },
    };
    return new Promise((resolve, reject) => {
      request.post(
        postOptions,
        function(err, httpResponse, body) {
          if (err) {
            console.log(err)
            reject(err)
          }
          resolve(JSON.parse(body))
        }
      );
    })
  }
  base64ToImage(base64Image, imagePathAndName) {
    let base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    let dataBuffer = new Buffer(base64Data, 'base64');
    return new Promise((resolve, reject) => {
      fs.writeFile(imagePathAndName, dataBuffer, (error) => {
        if (error) {
          reject(error)
        }
        resolve(imagePathAndName)
      })
    })
  }
}


/* GET face */
router.get('/token', function(req, res, next) {
  const param = querystring.stringify({
      'grant_type': 'client_credentials',
      'client_id': 'UcNf9mKb2f9DwEiROallMbTS',
      'client_secret': 'ntI3piNCIa6z59u0tTQdLPKDGTADZoGs'
  });
  let data = '';
  https.get(`https://aip.baidubce.com/oauth/2.0/token?${param}`, (result) => {
    result.on('data', (d) => {
      data += d
    })
    result.on('end', (d) => {
      res.json(JSON.parse(data));
    })
    
  })
});

router.post('/detect', upload.single('file'), async (req, res, next) => {
  try {
    let faceplus = new FacePlus()
    // user
    let input_detect_result = await faceplus.faceDetect(req.file.path);
    let template_detect_result = await faceplus.faceDetect('uploads/template/a.jpg');

    let template_rectangle = template_detect_result.faces.shift().face_rectangle;
    template_rectangle = ['top', 'left', 'width', 'height'].map(item => {
      return template_rectangle[item]
    }).join(',');

    let merage_args = [fs.createReadStream('uploads/template/a.jpg'), template_rectangle, fs.createReadStream(req.file.path)];
    let merage_rate = [30, 60, 90];
    // let merage_promises = merage_all.map((rate) => faceplus.faceMerage(...[...merage_args, rate]));
    
    // 免费接口限制改为继发
    // let merage_results = await Promise.all(merage_promises);
    let merage_result_a = await faceplus.faceMerage(...[...merage_args, 30]);
    let merage_result_b = await faceplus.faceMerage(...[...merage_args, 60]);
    // let merage_result_c = await faceplus.faceMerage(...[...merage_args, 90]);
    
    // let merage_results = [merage_result_a, merage_result_b, merage_result_c];
    
    let image_results = []; 
    // for (let result of merage_results) {
      // console.log(typeof(result.result))
      // let image = await faceplus.base64ToImage(result.result, `uploads/out.${Date.now()}.png`);
      // image_results.push(image);
    // }
    console.log(merage_result_b);
    res.send(image_results);

  } catch(error) {
    console.log(error)
    res.send(error);
  }
});

module.exports = router;
