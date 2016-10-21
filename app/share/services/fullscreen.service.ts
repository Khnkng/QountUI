/**
 * Created by seshu on 05-03-2016.
 */

import {Injectable} from '@angular/core';

@Injectable()
export class FullScreenService {

  // Find the right method, call on correct element
  launchFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

  
  exitFullscreen() {
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}
  constructor() {
    console.info('QountApp Header Component Mounted Successfully7');
    // Events
    document.addEventListener("fullscreenchange", function(e) {
      console.log("fullscreenchange event! ", e);
    });
    document.addEventListener("mozfullscreenchange", function(e) {
      console.log("mozfullscreenchange event! ", e);
    });
    document.addEventListener("webkitfullscreenchange", function(e) {
      console.log("webkitfullscreenchange event! ", e);
    });
    document.addEventListener("msfullscreenchange", function(e) {
      console.log("msfullscreenchange event! ", e);
    });

  }

}

