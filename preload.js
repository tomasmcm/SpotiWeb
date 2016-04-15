const ipcRenderer = require('electron').ipcRenderer;

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
