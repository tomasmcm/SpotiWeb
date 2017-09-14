var ipcRenderer = require('electron').ipcRenderer;
var remote = require('electron').remote;
var notification, notificationTimeout=null, lyricsTimeout=null;

window.notify = function() {
  if(document.querySelectorAll(".spoticon-play-16").length > 0) return;
  var imageURL = document.querySelector(".now-playing-bar .cover-art-image").style.backgroundImage.slice(5, -2);

  var title = document.querySelector(".now-playing-bar .track-info__name").querySelector("a").text;
  var author = document.querySelector(".now-playing-bar .track-info__artists").querySelector("a").text;

  if(process.platform === 'linux') {
    try { notification.close(); } catch (e) { }

    if(notificationTimeout != null){
      clearTimeout(notificationTimeout);
    }
  }

  notification = new Notification(title, { title: title, body: author, icon: imageURL, silent: true });

  notification.onclick = function(event) {
    ipcRenderer.send('show');
  }

  if(process.platform === 'linux') {
    notification.onshow = function(event) {
      notificationTimeout = setTimeout(function(){
        notification.close();
      },5000);
    }
  }
}

window.playerKey = function(command){
  try {
    document.querySelector(".player-controls .control-button[Title="+command+"]").click();
  } catch (e) {
    if (e instanceof TypeError){
    } else {
      remote.getCurrentWindow().reload();
    }
  }
  if(command == "Pause") {
    setTimeout(function(){
      notify();
    },500);
  }
}

window.lyricsLoaded = function(){
  if(lyricsTimeout != null){
    clearTimeout(lyricsTimeout);
  }
  document.querySelector("#lyrics__js").classList.remove("spoticon-loading-16");
}

window.showLyrics = function(){
  document.querySelector("#lyrics__js").classList.add("spoticon-loading-16");
  remote.getGlobal('sharedObj').title = document.querySelector(".now-playing-bar .track-info__name").querySelector("a").text;
  remote.getGlobal('sharedObj').author = document.querySelector(".now-playing-bar .track-info__artists").querySelector("a").text;
  ipcRenderer.send('showLyrics');
}

window.updateLyricsButton = function(){
  try {
    var title = document.querySelector(".now-playing-bar .track-info__name").querySelector("a").text;
    var lyricsButton = document.querySelector("#lyrics__js");
    if(title == " "){
      if(!lyricsButton.classList.contains("disabled")){
        lyricsButton.classList.add("disabled");
        lyricsButton.classList.add("btn");
      }
    } else {
      if(lyricsButton.classList.contains("disabled")){
        lyricsButton.classList.remove("disabled");
        lyricsButton.classList.remove("btn");
      }
    }
  } catch (e) {
    setTimeout(function(){
      window.updateLyricsButton();
    }, 500);
  }
}

window.appendLyricsButton = function(){
  var lyricsButton = document.createElement('div');
  lyricsButton.innerHTML = '<button class="control-button spoticon-mic-16" title="Lyrics" style="cursor:pointer;" id="lyrics__js"><div id="lyrics_loading__js" style="background: url(' + remote.getGlobal('loadingGif') + ');width:14px;height:14px;background-size:contain;display:none;vertical-align:text-bottom;"></div></button>';

  var style = document.createElement("style");
  document.head.appendChild(style);
  var sheet = style.sheet;
  sheet.addRule('.spoticon-mic-16::before','content: "\\F32A"');
  sheet.addRule('.spoticon-mic-16::before','font-size: 16px');

  sheet.addRule('.spoticon-loading-16::before','content: "\\F3B6"');

  try {
    document.querySelector(".extra-controls").insertBefore(lyricsButton.childNodes[0], document.querySelector(".connect-device-picker"));

    setTimeout(function(){

      document.querySelector("#lyrics__js").addEventListener("click", function(){
        window.showLyrics();
        lyricsTimeout = setTimeout(function(){
          alert("No Lyrics Found...");
          lyricsLoaded();
        },10000);
      });
      window.updateLyricsButton();
    }, 0);
  } catch (e) {
    setTimeout(function(){
      window.appendLyricsButton();
    }, 500);
  }
}


window.onload = function(){
  try { document.getElementById("has-account").click(); } catch (e) { }

  if (process.platform === 'darwin'){
    var draggableArea = document.createElement('div');
    draggableArea.style.cssText = 'position:absolute;width:100%;height:22px;left:0px;top:0px;-webkit-app-region:drag;';
    document.body.appendChild(draggableArea);
  }

  setTimeout(function(){
    appendLyricsButton();

    clearAdDivs();
    if (process.platform === 'darwin') document.querySelector('.navBar').style.paddingTop = "39px";
  }, 500);

  setTimeout(function(){
    attachNotificationEvent();
  }, 500);


  document.querySelector(".player-controls .control-button[Title=Play]").addEventListener('click', function () {
    setTimeout(function(){
      if(document.querySelectorAll(".spoticon-play-16").length > 0){
        setTimeout(function(){
          notify();
        },500);
      }
    },0);
  });

  if(remote.getGlobal('sharedObj').reloadPlay) {
    checkPlay();
    remote.getGlobal('sharedObj').reloadPlay = false;
  }
}

window.clearAdDivs = function(){
  document.querySelector(".ads-container").style.display="none";
  document.querySelector(".download-item").style.display="none";
}


window.attachNotificationEvent = function(){
  if(document.querySelector(".track-info__name") == null) {
    setTimeout(function(){
      attachNotificationEvent();
    }, 500);
    return;
  }
  document.querySelector(".track-info__name").addEventListener('DOMSubtreeModified', function () {
    setTimeout(function(){
      notify();
    },500);
  });
}

var playTries = 0;
window.checkPlay = function(){
  if(document.querySelectorAll(".player-controls .control-button[Title=Play]").length > 0){
    setTimeout(function(){
      playerKey("Play");
      playTries++;
    },0);
    //console.log("tried to press play");
    if(playTries > 5) {
      remote.getGlobal('sharedObj').reloadPlay = true;
      ipcRenderer.send('reload');
    }
    setTimeout(function(){
      checkPlay();
    },500);
  }
}

window.getPlayStatus = function(){
  remote.getGlobal('sharedObj').playProgress = parseFloat(document.querySelector(".progress-bar__slider").style.left);
}
