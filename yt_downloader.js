function renderStatus(url) {
  var download = document.getElementById('download');
  download.textContent = url;
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
        callback(response);
      }
    };
    httpRequest.send();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {

    var youtube_id = url.match(/\=.*&*/)[0].replace(/[=&]+/g, '');
    var api_url = "http://www.yt-mp3.com/fetch?v="+youtube_id+"&apikey=1234567";

    client = new HttpClient();
    client.get(api_url, function(response) {
      response_url = response.url
      var code = "window.location.assign(\"http:" + response_url + "\");"

      chrome.tabs.executeScript({
        code: "console.log(" + JSON.stringify(response) + ")"
      });

      response_ready = response.ready;

      if(response_url != 'undefined' && response_ready === true) {
        renderStatus("BAIXANDO!")
        chrome.tabs.executeScript({
          code: code
        });
      } else {
        renderStatus("Coeh, deu ruim, tenta de novo daqui a pouco!")
      }

    });
  });
});
