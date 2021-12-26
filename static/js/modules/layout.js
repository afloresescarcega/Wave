export var layoutSingleton = (function() {
  var indexX = 0;
  var indexY = 0;
  var indexXStack = [];

  return {
    indexXStackPop: function() {
      indexX = indexXStack.pop();
      console.log('indexXStackPop: ' + indexX);
    },
    indexXStackPush: function() {
      console.log('indexXStackPush: ' + indexX);
      indexXStack.push(indexX);
    },
    indexXInc: function() {
      indexX++;
      console.log('Incrementing indexX to: ' + indexX);
    },
    indexYInc: function() {
      indexY++;
      console.log('Incrementing indexY to: ' + indexY);
    },
    indexXDec: function() {
      indexX--;
      console.log('Decrementing indexX to: ' + indexX);
    },
    indexYDec: function() {
      indexY--;
      console.log('Decrementing indexY to: ' + indexY);
    },
    indexXReset: function() {
      console.log('Resetting indexX to: ' + indexX);
      indexX = 0;
    },
    getIndexX: function() {
      console.log("Retrieving indexX: " + indexX);
      return indexX;
    },
    getIndexY: function() {
      console.log("Retrieving indexY: " + indexY);
      return indexY;
    }
  };
})();
