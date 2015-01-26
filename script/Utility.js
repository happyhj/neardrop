// Utility Functions
var getPosition = function(element) {
    var xPosition = 0;
    var yPosition = 0;
  
    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
};

var getSizeExpression = function(size) { // byte
    var result = size;
    if(result < 1024) {
        return result + "Byte";
    }
    result = result / 1024.0;
    if(result < 1024) {
        return result.toFixed(1) + "KB";
    }
    result = result / 1024.0;
    if(result < 1024) {
        return result.toFixed(1) + "MB";
    }
    result = result / 1024.0;
    if(result < 1024) {
        return result.toFixed(1) + "GB";
    }
    // 이후엔 단위가 없으므로 10,000 TB 라고라도 적어주어야 함
    result = result / 1024.0;
    return result.toFixed(1) + "TB";
};

var secondsToString = function(seconds) {
    var expression = "";
    if(seconds < 60) {
        expression = seconds + "s";
    } else if (seconds < 3600) {
        if(seconds%60 > 0)
            expression = Math.floor(seconds/60) + "m " + seconds%60 + "s";
        else 
            expression = Math.floor(seconds/60) + "m";
    } else if (seconds < (3600*24)) {
        if(seconds%3600 > 0)
            expression = Math.floor(seconds/3600) + "h "+ Math.floor((seconds%3600)/60) + "m";
        else
            expression = Math.floor(seconds/3600) + "h";
    } else if (seconds < (3600*24)*7) {
        expression = Math.floor(seconds/(3600*24)) + "d";
    } else {
        expression = "∞";
    }
    return expression;
}
