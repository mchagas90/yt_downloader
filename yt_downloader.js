function renderMessage(message) {
  var message_label = document.getElementById('message');
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

    // console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

var HttpClient = function() {
  this.get = function(url, callback) {
    var httpRequest = new XMLHttpRequest();

    httpRequest.open('GET', url, false);
    httpRequest.onreadystatechange = function () {
      if(httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
        var response = JSON.parse(httpRequest.responseText);
        callback(response, url);
      }
    };
    httpRequest.send();
  }
}

function handleResponse(response, url){
  // var code = "console.log(" + JSON.stringify(response) + ")"
  // chrome.tabs.executeScript({
  //   code: code
  // });
  var response_status = response.status
  var response_url = response.url;
  var response_ready = response.ready;

  if(response_url != 'undefined' && response_ready === true) {
    renderMessage("BAIXANDO!")
    startDownload(response_url);
  } else if (response_status === 'error') {
    renderMessage("Esse vídeo não pode ser convertido.");
  }
  else {
    renderMessage("Convertendo... pera aeee!");
    var client = new HttpClient();
    setTimeout(function() { client.get(url, handleResponse); }, 5000);
  }
}

function startDownload(response_url){
  var code = "window.location.assign(\"http:" + response_url + "\");"
  chrome.tabs.executeScript({
    code: code
  });
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    var youtube_id = url.match(/\=.*&*/)[0].replace(/[=&]+/g, '');
    var api_url = "http://www.yt-mp3.com/fetch?v="+youtube_id+"&apikey=1234567";

    client = new HttpClient();
    client.get(api_url, handleResponse);

  });
});
