var ipcRenderer = require('electron').ipcRenderer;
var remote = require('electron').remote;
var currentImage = null;
var notification;

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
  }

  notification = new Notification(title, { title: title, body: author, icon: imageURL, silent: true });

  notification.onclick = function(event) {
    ipcRenderer.send('show');
  }

  if(process.platform === 'linux') {
    notification.onshow = function(event) {
      setTimeout(function(){
        notification.close();
      },5000);
    }
  }
}

window.playerKey = function(command){
  document.getElementById('app-player').contentDocument.getElementById(command).click();
}


window.onload = function(){
  var draggableArea = document.createElement('div');
  draggableArea.style.cssText = 'position:absolute;width:100%;height:80px;left:0px;top:0px;-webkit-app-region:drag;';
  document.body.appendChild(draggableArea);
  //document.getElementsByTagName("html")[0].style.cssText += "overflow: hidden;height: 100%;";
  document.getElementById('now-playing-widgets').style.cssText += "display: none;";


  if (process.platform === 'darwin') document.querySelector('.main-menu.narrow-menu').style.paddingTop = "15px";

  setInterval(function(){
    if(document.getElementById('modal-notification-area').style.display === 'block'){
      remote.getCurrentWindow().reload();
    }
  }, 1000);

}
