var ipcRenderer = require('electron').ipcRenderer;
var remote = require('remote');

window.notify = function(music, author) {
  var imageURL = document.getElementById('app-player').contentDocument.getElementById('cover-art').querySelector(".sp-image-img").style.backgroundImage.slice(5, -2);

  var notification = new Notification(music, { title: music, body: author, icon: imageURL, silent: true });

  notification.onclick = function(event) {
    ipcRenderer.send('show');
  }
}

window.playerKey = function(command){
  document.getElementById('app-player').contentDocument.getElementById(command).click();
}


window.onload = function(){
  var draggableArea = document.createElement('div');
  draggableArea.style.cssText = 'position:absolute;width:100%;height:80px;left:0px;top:0px;-webkit-app-region:drag;';
  document.body.appendChild(draggableArea);
  document.getElementsByTagName("html")[0].style.cssText += "overflow: hidden;height: 100%;";
  document.getElementById('now-playing-widgets').style.cssText += "display: none;";

  setInterval(function(){
    var appIframes = document.querySelectorAll("[id^=collection-app-spotify]");
    Array.prototype.filter.call(appIframes, function(element){
      var elementAd = element.contentDocument.querySelector(".ads-leaderboard-container");
      if(elementAd) return element.contentDocument.querySelector(".ads-leaderboard-container").style.display="none";
      else return false;
    });
  }, 3000);


  if (process.platform === 'darwin') document.querySelector('.main-menu.narrow-menu').style.paddingTop = "15px";

  setInterval(function(){
    if(document.getElementById('modal-notification-area').style.display === 'block'){
      remote.getCurrentWindow().reload();
    }
    if( (document.getElementById('app-player').contentDocument.getElementById('track-name').getElementsByTagName("a")[0].href).indexOf("adclick") > -1 ){
      remote.getCurrentWebContents().setAudioMuted(true);
    } else{
      if( remote.getCurrentWebContents().isAudioMuted() ){
        remote.getCurrentWebContents().setAudioMuted(false);
      }
    }
  }, 1000);

}
