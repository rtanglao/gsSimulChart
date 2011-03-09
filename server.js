// Drives the # of Thunderbird Get Satisfaction support request graph at http://awesometown.no.de.
// Hacked from:
// https://gist.github.com/556411
var sys = require('sys'),
    http = require('http'),
    gs = http.createClient(80, 'api.getsatisfaction.com'),
    gsPath = "/products/mozilla_thunderbird/topics.json?sort=recently_created&page=1&limit=30",
    chartId = "322dd869-0493-4485-b0b1-f64829508b1b",
    interval = 15000,
    topicIds={};

function postValue(id, value) {
  var req, http = require('http'),
      simulchart = http.createClient(80, 'awesometown.no.de'),
      simulchartPath = "/graphs/" + id + "/appendValue",
      body = "value=" + value,
      headers = { "Host": simulchart.host,
                  "Content-Length": body.length,
                  "Content-Type": "application/x-www-form-urlencoded"};

  req = simulchart.request('POST', simulchartPath, headers);
  req.write(body);
  req.end(); 
}

function update() {
  var count, results, req, reqPath, body = "";

  req = gs.request('GET', gsPath, {"Host": gs.host});
  req.end();
  req.on('response', function (res) {
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      topics = JSON.parse(body);
      var numNewTopics = 0;
      // iterate over topics.data and if id seen then increment numNewTopics
      if (topics) {
        topics.data.forEach(
          function(topic) { 
              var topic_id = topic.id;
              var index = 'id'+topic_id;
              if (topicIds[index] == null) {
                  numNewTopics++;
                  topicIds[index] = true;
                  console.log("New topic id " + topic_id); 
              }
              else {
                console.log("Old topic id " + topic_id);
              }
        });
        postValue(chartId, numNewTopics);
      }
      setTimeout(update, interval);
    });
  });
}

update();