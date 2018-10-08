const express = require('express')
const app = express();

app.set('port', (process.env.PORT || 5000));

//setup cross-origin
const cors = {
  origin: ["<<your allowed domains>>"],
  default: "<<your default allowed domain>>"
};

app.use(function (req, res, next) {
  var origins = req.headers.origin;
  res.header("Access-Control-Allow-Origin", origins);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  next();
});

app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
  startTraining(supervisedData);
});


app.get('/', function (req, res) {
  res.send('hello world')
});

/** Make api call here to fetch new result to train */

let getdata = function (key, term) {
  let newTrainDataset = require('./new_datasetlinks.json');

  return newTrainDataset;
}

/**Brainjs ML configuration  and request handler*/
const brain = require('brain.js');
const jsonfile = require('jsonfile');
// provide optional config object (or undefined). Defaults shown.
const config = {
  iterations: 100,
  log: true,      // number of iterations between logging
  activation: 'sigmoid', // activation function
  // hiddenLayers: [5],
  learningRate: 0.3 // global learning rate, useful when training using stream
};



const net = new brain.recurrent.LSTM();
//const net = new brain.NeuralNetwork();
let trainedNet;

let supervisedData = require("./supervised_dataset.json");

let startTraining = function (dataSet) {
  net.train(dataSet, config);
  // net.trainAsync(dataSet, config)
  trainedNet = net.toFunction();
}

let tempResponse = "";
let tempSearch = "";

let findDuplicates = (arr) => arr.filter((item, index) => arr && arr.indexOf(item) != index);

let getLinks = function (trainedData) {
  if (trainedData && trainedData.indexOf('murder') >= 0) {
    let sampleLinks = require("./samplelinks.json");
    console.log('murder found');
    if (trainedData.indexOf('first') >= 0) {
      console.log('murder first');
      var links = sampleLinks['first']['links'];
      console.log(links);
      trainedData = links[0] + links[1] + links[2];
      tempResponse = links[3] + links[4] + links[5];

    }

    if (trainedData.indexOf('second') >= 0) {
      console.log('murder second');
      var links = sampleLinks['second']['links'];
      console.log(links);
      trainedData = links[0] + links[1] + links[2];
      tempResponse = links[3] + links[4] + links[5];
    }

    if (trainedData.indexOf('third') >= 0) {
      console.log('murder third');
      var links = sampleLinks['third']['links'];
      console.log(links);
      trainedData = links[0] + links[1] + links[2];
      tempResponse = links[3] + links[4] + links[5];
    }
    return trainedData;
  }
}

app.get('/input/:data', function (req, res) {
  let input = req.params.data;
  console.log('Request URL:', req.originalUrl)
  console.log('Input Received:' + input);
  if (input) {
    let trainedData = "";
    let splitInput = input.split(' ');
    tempSearch = input;
    console.log("input:" + splitInput.length);
    if (splitInput.length > 1) {
      let possibilites = [];
      let fullMatch = false;
      let maxMatch = [];

      splitInput.forEach(function (element) {
        let run = net.run(element);
        let splitRun = run.split(" ");

        splitRun.forEach(function (ele) {
          console.log("Split run:" + ele + " run:" + run + " input:" + input);
          if (run.indexOf(ele) >= 0 && input.indexOf(ele)) {
            maxMatch.push(run);
          }
        });
        console.log("Input:" + input + " run:" + run +" element:"+ element);

        if (run && run.indexOf(element) >= 0) {
          possibilites.push(run);
        }

      }, this);
      console.log(possibilites);
      console.log("Max Match:" + JSON.stringify(maxMatch));
      if (possibilites.length > 0) {
        possibilites.forEach(function (e) {
          if (input.indexOf(e) > 0) {
            trainedData = e;
          }
          if (e === input) {
            fullMatch = true;
          }
        });

        let maxPossible = maxMatch && maxMatch.length > 0 ? findDuplicates(maxMatch)[0] : false;
        console.log("max Possible:" + maxPossible);
        if (maxPossible) {
          trainedData = maxPossible;
        }

        if (fullMatch && !maxPossible) {
          trainedData = input;
        }
        /* if (trainedData.indexOf('murder') >= 0) {
        let sampleLinks = require("./samplelinks.json");
        console.log('murder found');
        if (trainedData.indexOf('first') >= 0) {
          console.log('murder first');
          var links = sampleLinks['first']['links'];
          console.log(links);
          trainedData = links[0] + links[1] + links[2];
          tempResponse = links[3] + links[4] + links[5];

        }

        if (trainedData.indexOf('second') >= 0) {
          console.log('murder second');
          var links = sampleLinks['second']['links'];
          console.log(links);
          trainedData = links[0] + links[1] + links[2];
          tempResponse = links[3] + links[4] + links[5];
        }

        if (trainedData.indexOf('third') >= 0) {
          console.log('murder third');
          var links = sampleLinks['third']['links'];
          console.log(links);
          trainedData = links[0] + links[1] + links[2];
          tempResponse = links[3] + links[4] + links[5];
        }

      } */
        let links = getLinks(trainedData);

        if (trainedData && links) {
          trainedData = {
            msg: links,
            confirm: '<div><p>Does this suffice?</p><div><button data-value="yes" type="button" class="cnf btn btn-success">Yes</button><button data-value="no" type="button" class="cnf btn btn-danger">No</button><div></div>'
          }
        } else {
          trainedData = {
            msg: trainedData,
            confirm: '<div><p>Does this suffice?</p><div><button data-value="yes" type="button" class="cnf btn btn-success">Yes</button><button data-value="no" type="button" class="cnf btn btn-danger">No</button><div></div>'
          }
        }


      } else {
        trainedData = "";
      }

    } else {
      trainedData = net.run(input);
      let links = getLinks(trainedData);
      if (links) {
        trainedData = {
          msg: links,
          confirm: '<div><p>Does this suffice?</p><div><button data-value="yes" type="button" class="cnf btn btn-success">Yes</button><button data-value="no" type="button" class="cnf btn btn-danger">No</button><div></div>'
        }
      } else {
        trainedData = {
          msg: trainedData,
          confirm: false
        }
      }
    }
    //let trainedData = net.run(input);
    console.log("Data:" + JSON.stringify(trainedData));
    let getDataElem = '<div><p>I can get the information in sometime. Do you want me to get it?</p><div><button data-value="yes" data-search="' + tempSearch + '" type="button" class="getit btn btn-success">Yes</button><button data-value="no" type="button" class="getit btn btn-danger">No</button><div></div>';
    res.send(trainedData ? trainedData : { msg: "Sorry i don't have information on that.", confirm: getDataElem });
  } else {
    res.send({ msg: 'ready to get input', confirm: false });
  }

});


app.get('/confirm/:data', function (req, res) {
  let confirm = req.params.data;
  if (confirm === 'yes') {
    res.send('Thank you, I am happy to help please let me know if anything else is needed');
  } else {
    //I can help you with more cases specific to your search -
    if (tempResponse) {
      res.send('I can help you with more cases specific to your search<br/>' + tempResponse);
    }

  }

});


app.get('/getit/:data/:search', function (req, res) {
  let confirm = req.params.data;
  let term = req.params.search;
  if (confirm === 'yes') {
    if (term) {
      let splitSearch = term.split(' ');
      console.log(splitSearch);
      let newTrainingLinks = getdata(splitSearch[0], term);
      let trainedData = newTrainingLinks['links'][0] + newTrainingLinks['links'][1] + newTrainingLinks['links'][2];
      tempResponse = newTrainingLinks['links'][3] + newTrainingLinks['links'][4] + newTrainingLinks['links'][5];
      if (trainedData) {
        trainedData = {
          msg: trainedData,
          confirm: '<div><p>Does this suffice?</p><div><button data-value="yes" type="button" class="cnf btn btn-success">Yes</button><button data-value="no" type="button" class="cnf btn btn-danger">No</button><div></div>'
        }
      }
     // res.send(trainedData);

      let sampleLinksAppend = require("./samplelinks.json");
      sampleLinksAppend[splitSearch[0]] = {
        links: newTrainingLinks['links']
      };

      supervisedData.push({
        "input": splitSearch[0],
        "output": term
      });

      startTraining(supervisedData);

      const supervisedfile = './supervised_dataset.json';

      jsonfile.writeFile(supervisedfile, supervisedData)
        .then(res => {
          console.log('Write complete')
        })
        .catch(error => console.error(error));

      const sampleLinksFile = './samplelinks.json';
      
      let sendResponse = function(){
        res.send(trainedData);
      }

      jsonfile.writeFile(sampleLinksFile, sampleLinksAppend)
        .then(res => {
          console.log('Write complete');
          sendResponse();
        })
        .catch(error => console.error(error));

      //console.log(newTrainingList);*/

    }

  } else {
    res.send({ msg: 'Sorry i could not help you this time.', confirm: false });
  }

});
