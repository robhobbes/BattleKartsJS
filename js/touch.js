/*
  touch notes:
  on touch start, the entering touch is the one in touch changed not already
  in our own touch list
  on touch end, the exiting touch is the one in touch changed not in the 
  touch target list
*/

function TouchList () {
	this.touchIds = [];
}

TouchList.prototype.getEnteringTouch = function (changedTouches) {
	var touch,
			i;

	for (i = 0; i < changedTouches.length; i++) {
		touch = changedTouches[i];
		if (this.touchIds.indexOf(touch.identifier) === -1) {
			this.touchIds.push(touch.identifier);
			return touch;
		}
	}

	return null;
};

TouchList.prototype.getExitingTouch = function (changedTouches, targetTouches) {
	var changedTouch,
			isInList,
			pos,
			i,
			j;

	for (i = 0; i < changedTouches.length; i++) {
		changedTouch = changedTouches[i];
		isInList = false;
		for (j = 0; j < targetTouches.length; j++) {
			if (changedTouch.identifier === targetTouches[j].identifier) {
				isInList = true;
			}
		}
		if (!isInList) {
			pos = this.touchIds.indexOf(changedTouch.identifier);
			this.touchIds.splice(pos,1);
			return changedTouch;
		}
	}
	return null;
};