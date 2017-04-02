var ipcRenderer = require('electron').ipcRenderer;
var remote = require('electron').remote;
var currentImage = null;
var notification, notificationTimeout=null, lyricsTimeout=null;

window.setCurrentImage = function(val){
  currentImage = val;
};

window.notify = function() {
  clearAdDivs();
  var imageURL;
  if(currentImage == null) {
    imageURL = document.querySelector(".now-playing-bar .cover-art-image").style.backgroundImage.slice(5, -2);
  } else {
    imageURL = currentImage;
    currentImage = null;
  }

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
  document.querySelector(".player-controls .control-button[Title="+command+"]").click();
  if(command == "Play") {
    notify();
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
  remote.getGlobal('currentSong').title = document.querySelector(".now-playing-bar .track-info__name").querySelector("a").text;
  remote.getGlobal('currentSong').author = document.querySelector(".now-playing-bar .track-info__artists").querySelector("a").text;
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


  // setInterval(function(){
  //   if(document.getElementById('modal-notification-area').style.display === 'block'){
  //     remote.getCurrentWindow().reload();
  //   }
  // }, 2000);

}

window.clearAdDivs = function(){
  document.querySelector(".ads-container").style.display="none";
  document.querySelector(".navlist-item.download-item").style.display="none";
}
