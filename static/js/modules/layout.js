import { mod } from './mod.js';

export var layoutSingleton = (function() {
  var indexX = 0;
  var indexY = 0;
  var indexXStack = [];
  var kids = [];

  function getIndexX() {
    console.log("Retrieving indexX: " + indexX);
    return indexX;
  }
  function getIndexY() {
    console.log("Retrieving indexY: " + indexY);
    return indexY;
  }

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
    getTopLeftElement: function() {
      return $("#block" + mod(getIndexY() + 1, 4) + "col" + mod(getIndexX() + 1, 4));
    },
    getTopRightElement: function() {
      return $("#block" + mod(getIndexY() + 1, 4) + "col" + mod(getIndexX() + 2, 4))
    },
    getBottomLeftElement: function() {
      const actualBottomLeftId = document.elementFromPoint(0, window.innerHeight / 2 + 1).id.split("col")[1];

      if (mod(getIndexX() + 0, 4) != actualBottomLeftId)
      {
        console.error("Bottom left element is not the expected one. Actual: " + actualBottomLeftId + " Expected: " + mod(getIndexX() + 0, 4));
        return $("#block" + mod(getIndexY() + 2, 4) + "col" + actualBottomLeftId);
      }
      return $("#block" + mod(getIndexY() + 2, 4) + "col" + mod(getIndexX() + 0, 4));
    },
    getBottomRightElement: function() {
      return $("#block" + mod(getIndexY() + 2, 4) + "col" + mod(getIndexX() + 1, 4));
    },
    isPostInTopRow: function() {
      return getIndexY() === 0;
    },
    isPostHidden: function() {
      return getIndexY() >= 1;
    },
    isThereNoPostInBottomRight: function() {
      return getIndexX() == kids.length - 1;
    },
    getPostKids: function() {
      if (kids.length === 0) {
        throw new Error("kids is empty");
      }
      return kids;
    },
    setPostKids: function(newKids) {
      kids = newKids;
    },
    getLowerLeftPostId: function() {
      return kids[mod(getIndexX() , kids.length)];
    },
    getLowerRightPostId: function() {
      return kids[mod(getIndexX() + 1, kids.length)];
    }
  };
})();
