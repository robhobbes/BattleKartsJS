function SteeringWheel () {
	var _this,
			i;

	if (this !== window) {
		if (!window.DeviceOrientationEvent) {
			throw "DeviceOrientationEvent not supported";
		} else {
			_this = this;
			this.turnAmount = 0;
			for (i=0; i<this.sampleSize; i++) {
				this.samples.push(0);
			}
			window.addEventListener('deviceorientation', function () {
				_this.filter(_this.makeTurnAmount(event.beta, event.gamma));
			}, true);
			return this;
		}
	} else {
		throw 'SteeringWheel invoked without "new" keyword.';
	}	
}

// The slope intercept equation for "max" beta:
// (found this by sampling gamma and beta with the phone tilted at about 30 degrees)
// beta = 0.517 * gamma + 4.15
SteeringWheel.prototype.makeTurnAmount = function (beta, gamma) {
	var expectedBeta = 0.517 * gamma + 4.15,
			result;
	
	if (beta > expectedBeta) {
		beta = expectedBeta;
	} else if (beta < -expectedBeta) {
		beta = -expectedBeta;
	}

	result = beta / expectedBeta;

	return result.toFixed(4);
};

SteeringWheel.prototype.filter = function(turnAmount) {
	if(turnAmount != 0 || Math.abs(turnAmount - this.turnAmount) < 0.15) {
		this.turnAmount = turnAmount;
	}
}

SteeringWheel.prototype.getTurnAmount = function () {
	return this.turnAmount;
};