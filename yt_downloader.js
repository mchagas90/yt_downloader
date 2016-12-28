function renderMessage(message) {
  var message_label = document.getElementById('message');
  message_label.className = 'status';
  message_label.textContent = message;
}

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;

    callback(url);
  });
}

var HttpClient = function() {
  this.get = function(url, callback) {
    var httpRequest = new XMLHttpRequest();

    httpRequest.open('GET', url, true);
    httpRequest.onreadystatechange = function () {
      if(httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
        // var response = JSON.parse(httpRequest.responseText);
        var response = httpRequest.responseText;
        callback(response, url);
      }
    };
    httpRequest.send();
  }
}

function handleResponse(response, url){
  var code = "console.log(" + JSON.stringify(response) + ")"
  chrome.tabs.executeScript({
    code: code
  });

  var parsed_response = response.split("|");
  if(parsed_response[0] != "OK" ){
    var client = new HttpClient();
    return setTimeout(function() { client.get(url, handleResponse); }, 5e3);
  } else {
    renderMessage("BAIXANDO!");
    var download_link = "http://dl" + parsed_response[1] + ".downloader.space/dl.php?id=" + parsed_response[2];
    startDownload(download_link);
  }
}

function startDownload(response_url){
  // var code = "window.location.assign(\"http:" + response_url + "\");"
  var code = "window.location.assign(\"" + response_url + "\");"
  chrome.tabs.executeScript({
    code: code
  });
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    // var youtube_id = url.match(/\=.*&*/)[0].replace(/[=&]+/g, '');
    var youtube_id = url.match(/watch\?v=(.*?)(?:(&|$))/)[1];

    var api_url = 
      "http://api.convert2mp3.cc/check.php?api=true&v="
      + youtube_id
      + "&h="
      + Math.floor(35e5 * Math.random());


    client = new HttpClient();
    client.get(api_url, handleResponse);
  });
});
