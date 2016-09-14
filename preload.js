var ipcRenderer = require('electron').ipcRenderer;
var remote = require('electron').remote;
var currentImage = null;
var notification, notificationTimeout=null;

window.setCurrentImage = function(val){
  currentImage = val;
};

window.notify = function() {
  var imageURL;
  if(currentImage == null) {
    imageURL = document.getElementById('app-player').contentDocument.getElementById('cover-art').querySelector(".sp-image-img").style.backgroundImage.slice(5, -2);
  } else {
    imageURL = currentImage;
    currentImage = null;
  }

  var title = document.getElementById('app-player').contentDocument.getElementById('track-name').querySelector("a").text;
  var author = document.getElementById('app-player').contentDocument.getElementById('track-artist').querySelector("a").text;

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
  document.getElementById('app-player').contentDocument.getElementById(command).click();
}

window.lyricsLoaded = function(){
  document.getElementById('app-player').contentDocument.querySelector("#lyrics_loading__js").style.display = "none";
}

window.showLyrics = function(){
  remote.getGlobal('currentSong').title = document.getElementById('app-player').contentDocument.getElementById('track-name').querySelector("a").text;
  remote.getGlobal('currentSong').author = document.getElementById('app-player').contentDocument.getElementById('track-artist').querySelector("a").text;
  document.getElementById('app-player').contentDocument.querySelector("#lyrics_loading__js").style.display = "inline-block";
  ipcRenderer.send('showLyrics');
}

window.updateLyricsButton = function(){
  var title = document.getElementById('app-player').contentDocument.getElementById('track-name').querySelector("a").text;
  var lyricsButton = document.getElementById('app-player').contentDocument.querySelector("#lyrics__js");
  if(title == " "){
    if(!lyricsButton.classList.contains("disabled")){
      lyricsButton.classList.add("disabled");
    }
  } else {
    if(lyricsButton.classList.contains("disabled")){
      lyricsButton.classList.remove("disabled");
    }
  }
}

window.appendLyricsButton = function(){
  var lyricsButton = document.createElement('div');
  lyricsButton.innerHTML = '<div class="btn btn-small disabled" style="margin-top:10px;cursor:pointer;" id="lyrics__js"><span class="spoticon-messages-16"></span> Lyrics <div id="lyrics_loading__js" style="background: url(' + remote.getGlobal('loadingGif') + ');width:14px;height:14px;background-size:contain;display:none;vertical-align:text-bottom;"></div></div>';

  try {
    document.getElementById('app-player').contentDocument.querySelector(".extra").appendChild(lyricsButton.childNodes[0]);
    setTimeout(function(){
      document.getElementById('app-player').contentDocument.querySelector("#lyrics__js").addEventListener("click", function(){
        window.showLyrics();
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
  if (process.platform === 'darwin'){
    var draggableArea = document.createElement('div');
    draggableArea.style.cssText = 'position:absolute;width:100%;height:22px;left:0px;top:0px;-webkit-app-region:drag;';
    document.body.appendChild(draggableArea);
  }

  window.appendLyricsButton();

  //document.getElementsByTagName("html")[0].style.cssText += "overflow: hidden;height: 100%;";
  document.getElementById('now-playing-widgets').style.cssText += "display: none;";


  if (process.platform === 'darwin') document.querySelector('.main-menu.narrow-menu').style.paddingTop = "15px";

  setInterval(function(){
    if(document.getElementById('modal-notification-area').style.display === 'block'){
      remote.getCurrentWindow().reload();
    }
  }, 2000);

}
