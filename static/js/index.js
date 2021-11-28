function htmlDecode(input) {
  var e = document.createElement('textarea');
  e.innerHTML = input;
  // handle case of empty input
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

host = "http://127.0.0.1:5000/wave/api/v1.0/search?post="

function timeSince(epoch) {
  var d = new Date(0);
  var seconds = Math.floor((new Date() - d.setUTCSeconds(epoch)) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " year(s) ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " month(s) ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " day(s) ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hour(s) ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minute(s) ago";
  }
  return Math.floor(seconds) + " second(s) ago";
}

function getNodeFromTree(node, name) {
  if (node.name == name) {
    console.log("got node: " + node.name);
      return node;
  } else if (node.children != null) {
      var result = null;
      for (let i = 0; result == null && i < node.children.length; i++) {
          result = getNodeFromTree(node.children[i], name);
      }
      console.log("result: " + result);
      return result;
  }
  console.log("getnode returned null");
  return null;
}

var colors = ["red", "blueviolet", "purple", "blue", "darkcyan", "green", "greenyellow", "yellow", "orange", "orangered"];
document.addEventListener('keydown', logKey);
var indexX = 0;
var indexY = 0;
var indexXStack = [];

var root_parent = "";
var parent = "";
var current_item = "";
var kids = [];
var grandkids = []; // first bottom row's kids

var hw = window.innerWidth / 2;
var hh = window.innerHeight / 2;
deltaPosX = 0
deltaPosY = 0

var postIndex = 0
var topPosts = []

var treeHistory = {};


var mod = function(n, m) {
  var remain = n % m;
  return Math.floor(remain >= 0 ? remain : remain + m);
};

function logPos() {
  console.log(root_parent);
  console.log(kids);
  console.log("row0 y: " + document.getElementById("row0").getBoundingClientRect().y);
  console.log("row1 y: " + document.getElementById("row1").getBoundingClientRect().y);
  console.log("row2 y: " + document.getElementById("row2").getBoundingClientRect().y);
}

function logPosCol(row = 0) {
  console.log(document.getElementById("block" + row + "col0").getBoundingClientRect().x);
  console.log(document.getElementById("block" + row + "col1").getBoundingClientRect().x);
  console.log(document.getElementById("block" + row + "col2").getBoundingClientRect().x);
}

$(function() {
  const fetchPromise = fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  fetchPromise
    .then(response => {
      return response.json();
    })
    .then(dataa => {
      topPosts = dataa;
      console.log("data postindex: " + dataa[postIndex])
      root_parent = dataa[postIndex];
      current_item = root_parent;
      treeHistory.name = root_parent;
      treeHistory.parent = null;
      // kids = dataa["kids"];
      setPostTitle(current_item);
      updateTexts();

      // setPostText(root_parent);
    });
    /* Add debugging visualization tree */
    console.log("Add debugging tree");
    var svg = d3.select("body").append("svg")
    .attr("width", hw)
    .attr("height", hh)
    .style("position", "absolute")
    .style("top", "0px")
    .style("left", hw + "px")
    .append("g")
    .attr("transform", "translate(" + hw + "," + hh + ")");
});

function setPostTitle(postID) {
  console.log("setPostTitle https://hacker-news.firebaseio.com/v0/item/" + postID + ".json?print=pretty");
  console.log("postID: " + postID);
  if (indexY == 0) {
    // const fetchPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + postID + ".json?print=pretty");
    console.log("Gonna query: " + host + postID)
    const fetchPromise = fetch(host + postID);
    fetchPromise
      .then(response => {
        return response.json();
      })
      .then(data => {
        kids = data["kids"];
        // for each kid, get the title
        if ('key' in data) {
          parent = data["parent"];
        } else {
          parent = root_parent;
        }
        console.log("kids: " + kids);
        console.log("This is supposed to be tht title: " + data["title"]);
        $('#block0col0').children('.card-body').children('.card-title').text(htmlDecode(data["title"]));
        $('#block0col0').children('.card-body').children('.card-text').text(htmlDecode(data["url"]));
      })
  }
}

function setText(postId) {
  // upper left
  // if indexY == 0, do nothing beccause setPostTitle got it
  // if indexY != 0, set title with poster and time and text
  console.log("indexY: " + indexY);
  console.log("indexX: " + indexX);

  console.log("setText: " + postId);
  // const fetchPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + postId + ".json?print=pretty");
  const fetchPromise = fetch(host + postId);
  fetchPromise
    .then(response => {
      return response.json();
    })
    .then(data => {
      kids = data["kids"];
      parent = data["parent"];
      var node = getNodeFromTree(treeHistory, postId);
      console.log(node);
      if (node.children == null) {
        node.children = [];
      }
      for (var i = 0; node && i < kids.length; i++) {
        node["children"].push({"name" : kids[i], "parent" : postId, "children" : []});        
      }
      if (indexY == 0) {
        console.log("kids: " + kids);
        console.log("This is supposed to be tht title: " + data["title"]);
        $('#block0col0').children('.card-body').children('.card-title').text(htmlDecode(data["title"]));
        $('#block0col0').children('.card-body').children('.card-text').text(htmlDecode(data["url"]));
      } else if (indexY >= 1) {
        $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 0, 3)).children('.card-body').children('.card-title').text(data["by"] + " " + timeSince(data["time"]));
        $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 0, 3)).children('.card-body').children('.card-text').text(htmlDecode(data["text"]));
      }
    }).then(() => {
      // if current item has a kid, save the grandkids
      if (kids.length > 0) {
        console.log("About to look for grandkids: ", host + kids[mod(indexX, kids.length)])
        const fetchPromiseLowerLeftsKids = fetch(host + kids[mod(indexX, kids.length)]);
        fetchPromiseLowerLeftsKids
        .then(response => {
          return response.json();
        })
        .then(data => {
          grandkids = data["kids"];
          console.log("bottom's left's kids: " + grandkids);
        })
      }
    }).then(() => {
      // lower left
      // set the title with the poster of the first child and time and text
      console.log("kids: " + kids);
      console.log("indexX: " + indexX);
      console.log("mod(indexX, kids.length): " + mod(indexX, kids.length));
      console.log("https://hacker-news.firebaseio.com/v0/item/" + kids[mod(indexX, kids.length)] + ".json?print=pretty");
      // const fetchPromiseLowerLeft = fetch("https://hacker-news.firebaseio.com/v0/item/" + kids[mod(indexX, kids.length)] + ".json?print=pretty");
      const fetchPromiseLowerLeft = fetch(host + kids[mod(indexX, kids.length)]);
      fetchPromiseLowerLeft
        .then(response => {
          return response.json();
        })
        .then(data => {
          // kids = data["kids"];
          console.log("x and Y", indexX, indexY);
          console.log("dumpy: " + data["id"])
          const cardTitleInfo = data["by"] + " " + timeSince(data["time"]);
          console.log("cardTitleInfo: " + cardTitleInfo)
          $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 0, 3)).children('.card-body').children('.card-title').text(cardTitleInfo);
          const httpDecodedCommentText = htmlDecode(data["text"]);
          console.log("httpDecodedCommentText: " + httpDecodedCommentText)
          $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 0, 3)).children('.card-body').children('.card-text').text(httpDecodedCommentText);
        })

      // lower right
      // set the title with the poster of the next child and time and text
      // const fetchPromiseLowerRight = fetch("https://hacker-news.firebaseio.com/v0/item/" + kids[mod(indexX + 1, kids.length)] + ".json?print=pretty");
      const fetchPromiseLowerRight = fetch(host + kids[mod(indexX + 1, kids.length)]);
      fetchPromiseLowerRight
        .then(response => {
          return response.json();
        })
        .then(data => {
          if(indexX == kids.length) {
            $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 1, 3)).children('.card-body').children('.card-title').text("");
            $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 1, 3)).children('.card-body').children('.card-text').text("");
          } else {
            $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 1, 3)).children('.card-body').children('.card-title').text(data["by"] + " " + timeSince(data["time"]));
            $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 1, 3)).children('.card-body').children('.card-text').text(htmlDecode(data["text"]));
        }
        })
    })


  // upper right
  // if indexY == 0, show next post title and url
  // if indexY != 0, set the title with the poster of the sibling comment and time and text

  // if (indexY == 0) {
  //   console.log("setText: " + postId);
  // }
  // else if (indexY >= 1) {
  //   const fetchPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + postId + ".json?print=pretty");
  //   fetchPromise
  //     .then(response => {return response.json();})
  //     .then(data => {
  //       kids = data["kids"];
  //       const fetchTopRowLeftKidPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + data["kids"][mod(indexX + 0, data["kids"].length)] + ".json?print=pretty");
  //       fetchTopRowLeftKidPromise
  //         .then(response => {return response.json();})
  //         .then(kidData => {
  //           console.log("This is supposed to be the top left kid text: " + kidData);
  //           $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 1, 3)).children('.card-body').children('.card-title').text(kidData["by"] + " " + timeSince(kidData["time"]));
  //           $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 1, 3)).children('.card-body').children('.card-text').text(htmlDecode(kidData["text"]));
  //           // $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 0, 3)).append('<p>' + kidData["text"] + '</p>');
  //         });

  //       // Not title and is top row, right col
  //       const fetchTopRowRightKidPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + data["kids"][mod(indexX + 1, data["kids"].length)] + ".json?print=pretty");
  //       fetchTopRowRightKidPromise
  //         .then(response => {return response.json();})
  //         .then(kidData => {
  //           console.log("This is supposed to be the top right kid text: " + kidData["text"]);
  //           $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 1, 3)).children('.card-body').children('.card-title').text(kidData["by"] + " " + timeSince(kidData["time"]));
  //           $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 1, 3)).children('.card-body').children('.card-text').text(htmlDecode(kidData["text"]));
  //         });
  //       }
  //       )
  // }
}

function getResult(result) {
  return result
}

function updateTexts() {
  // I can only enter here if I'm a legal move
  setPostTitle(current_item);
  setText(current_item);
}

function logEverything() {
  console.log("The top    row: " + getTopRowId() + ", top-y: " + $("#" + getTopRowId()).position().top);
  console.log("The bottom row: " + getBottomRowId() + ", bot-y: " + $("#" + getBottomRowId()).position().top);
  console.log("The hidden row: " + getHiddenRowId() + ", hid-y: " + $("#" + getHiddenRowId()).position().top);
  console.log("Ending deltaPosY: " + deltaPosY);
  console.log("current indexX, and indexY", indexX, indexY);
  console.log("current_item: " + current_item);
  console.log("current_item_kids: " + kids);
  console.log("treeHistory: " + JSON.stringify(treeHistory));
}

function getTopRowId() {
  return "row" + mod(indexY + 0, 3);
}

function getBottomRowId() {
  return "row" + mod(indexY + 1, 3);
}

function getHiddenRowId() {
  return "row" + mod(indexY + 2, 3);
}

function getLeftColId() {
  return "col" + mod(indexX + 0, 3);
}

function getRightColId() {
  return "col" + mod(indexX + 1, 3);
}

function getHiddendColId() {
  return "col" + mod(indexX + 2, 3);
}

function logKey(e) {
  if (e.keyCode == '38') {
    // up arrow

    if (indexY > 0) {
      console.log("Up");
      deltaPosY += hh;
      document.getElementById(getTopRowId()).style.position = "absolute";
      document.getElementById(getBottomRowId()).style.position = "absolute";
      document.getElementById(getHiddenRowId()).style.position = "absolute";
      d3.select("#" + getTopRowId()).transition().duration(400).style("top", () => hh + "px")
      d3.select("#" + getBottomRowId()).transition().duration(400).style("top", () => 2 * hh + "px")
      d3.select("#" + getHiddenRowId()).transition().duration(0).style("top", () => -hh + "px")
      d3.select("#" + getHiddenRowId()).transition().duration(400).style("top", () => 00 + "px")
      current_item = parent;
      indexX = indexXStack.pop();
      indexY -= 1;
    }
  } else if (e.keyCode == '40') {
    // down arrow
    // only if there are kids
    if (typeof kids !== "undefined" && kids.length > 0 && grandkids.length != 0) {
      console.log("Down");
      document.getElementById(getTopRowId()).style.position = "absolute";
      document.getElementById(getBottomRowId()).style.position = "absolute";
      document.getElementById(getHiddenRowId()).style.position = "absolute";
      d3.select("#" + getTopRowId()).transition().duration(400).style("top", () => -hh + "px")
      d3.select("#" + getBottomRowId()).transition().duration(400).style("top", () => 00 + "px")
      d3.select("#" + getHiddenRowId()).transition().duration(0).style("top", () => 2 * hh + "px")
      d3.select("#" + getHiddenRowId()).transition().duration(400).style("top", () => hh + "px")
      parent = current_item;
      current_item = kids[mod(indexX, kids.length)];
      indexXStack.push(indexX);
      indexX = 0;
      indexY += 1;
    }
  } else if (e.keyCode == '37') {
    if (indexX > 0) { // left arrow
      console.log("Left");
      // document.getElementById("block" + mod(indexY + 1, 3) + getLeftColId()).style.position = "absolute";
      // document.getElementById("block" + mod(indexY + 1, 3) + getRightColId()).style.position = "absolute";
      // document.getElementById("block" + mod(indexY + 1, 3) + getHiddendColId()).style.position = "absolute";
      
      // set the tops to be the same, if you don't move down first you can't move right *shrug*
      // document.getElementById("block" + mod(indexY + 1, 3) + getLeftColId()).style.top = hh + "px";
      // document.getElementById("block" + mod(indexY + 1, 3) + getRightColId()).style.top = hh + "px";
      // document.getElementById("block" + mod(indexY + 1, 3) + getHiddendColId()).style.top = hh + "px";

      d3.select("#block" + getBottomRowId().slice(-1) + getLeftColId()).transition().duration(400).style("left", () => hw + "px")
      d3.select("#block" + getBottomRowId().slice(-1) + getRightColId()).transition().duration(400).style("left", () => 2 * hw + "px")
      d3.select("#block" + getBottomRowId().slice(-1) + getHiddendColId()).transition().duration(0).style("left", () => -hw + "px")
      d3.select("#block" + getBottomRowId().slice(-1) + getHiddendColId()).transition().duration(400).style("left", () => 00 + "px")

      indexX -= 1;
      console.log("X: " + indexX + " Y: " + indexY);
    }
  } else if (e.keyCode == '39') {
    // right arrow
    console.log("This is indexX: " + indexX + " and kids.length: " + kids.length);
    if(indexX < kids.length) {
      console.log("Right");
      // const originalXTopLeft = d3.select("#block" + getTopRowId().slice(-1) + getLeftColId()).style("left");
      // const originalXTopRight = d3.select("#block" + getTopRowId().slice(-1) + getRightColId()).style("left");
      // const originalXTopHidden = d3.select("#block" + getTopRowId().slice(-1) + getHiddendColId()).style("left");

      // document.getElementById("block" + mod(indexY + 0, 3) + getLeftColId()).style.position = "absolute";
      // document.getElementById("block" + mod(indexY + 0, 3) + getRightColId()).style.position = "absolute";
      // document.getElementById("block" + mod(indexY + 0, 3) + getHiddendColId()).style.position = "absolute";
      // document.getElementById("block" + mod(indexY + 1, 3) + getLeftColId()).style.position = "absolute";
      // document.getElementById("block" + mod(indexY + 1, 3) + getRightColId()).style.position = "absolute";
      // document.getElementById("block" + mod(indexY + 1, 3) + getHiddendColId()).style.position = "absolute";
      // document.getElementById("block" + mod(indexY + 2, 3) + getLeftColId()).style.position = "absolute";
      // document.getElementById("block" + mod(indexY + 2, 3) + getRightColId()).style.position = "absolute";
      // document.getElementById("block" + mod(indexY + 2, 3) + getHiddendColId()).style.position = "absolute";

      // set the tops to be the same, if you don't move down first you can't move right *shrug*
      console.log("what I'm selecting when going right: ", "block" + mod(indexY + 1, 3) + getLeftColId());

      // d3.select("#block" + getTopRowId().slice(-1) + getLeftColId()).style("top", 00 + "px");
      // d3.select("#block" + getTopRowId().slice(-1) + getRightColId()).style("top", 00 + "px");
      // d3.select("#block" + getTopRowId().slice(-1) + getHiddendColId()).style("top", 00 + "px");

      // d3.select("#block" + getTopRowId().slice(-1) + getLeftColId()).style("left", 00 + "px");
      // d3.select("#block" + getTopRowId().slice(-1) + getRightColId()).style("left", hw + "px");
      // d3.select("#block" + getTopRowId().slice(-1) + getHiddendColId()).style("left", 2*hw + "px");

      // d3.select("#block" + getBottomRowId().slice(-1) + getLeftColId()).style("top", hh + "px");
      // d3.select("#block" + getBottomRowId().slice(-1) + getRightColId()).style("top", hh + "px");
      // d3.select("#block" + getBottomRowId().slice(-1) + getHiddendColId()).style("top", hh + "px");

      d3.select("#block" + getBottomRowId().slice(-1) + getLeftColId()).transition().duration(400).style("left", () => -hw + "px")
      d3.select("#block" + getBottomRowId().slice(-1) + getRightColId()).transition().duration(400).style("left", () => 00 + "px")
      d3.select("#block" + getBottomRowId().slice(-1) + getHiddendColId()).transition().duration(0).style("left", () => 2 * hw + "px")
      d3.select("#block" + getBottomRowId().slice(-1) + getHiddendColId()).transition().duration(400).style("left", () => hw + "px")
      indexX += 1;
      // current_item = kids[mod(indexX, kids.length)];
      console.log("X: " + indexX + " Y: " + indexY);
    }
  }
  console.log(`${e.code}`);
  updateTexts();
  logEverything();
}