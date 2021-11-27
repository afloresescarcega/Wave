function htmlDecode(input){
  var e = document.createElement('textarea');
  e.innerHTML = input;
  // handle case of empty input
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}
class TreeNode {
  constructor(id, parentId, text, children) {
    this.id = id;
    this.children = [];
    this.parent = parentId;
    this.text = text;
  }
}

root = new TreeNode(0, -1, "root");

// treenode insert
function insert(postID, parentID, text){
  var node = new TreeNode(postID, parentID, text);
  var parent = getNode(parentID);
  if(parent){
    parent.children.push(node);
  }
  else{
    root.children.push(node);
  }
}

function getNode(postID){
  var node = root;
  while(node){
    for(var i=0;i<node.children.length;i++){
      if(node.children[i].id == postID){
        return node.children[i];
      }
    }
    node = node.children[0];
  }
  return null;
}

function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TIMEOUT'))
    }, ms)

    promise
      .then(value => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch(reason => {
        clearTimeout(timer)
        reject(reason)
      })
  })
}



// print bfs
function printBFS(postID) {
  var queue = [root];
  var nextQueue = [];
  var result = [];
  while(queue.length > 0){
    var node = getNode(queue[0]);
    if (node && node.children) {
      result.push(node);
      for(var i=0;i<node.children.length;i++){
        nextQueue.push(node.children[i].id);
      }
      queue = nextQueue;
      nextQueue = [];
    }
  }
  return result;
}





// make a sorted map
var map = {};

var nodesToVisit = []; // 1 is the root
var recurse = 0;




function visitNextBatch() {
  console.log('visiting batch: ' + JSON.stringify(nodesToVisit, null, 2));
    var copyOfNodes = nodesToVisit;
    nodesToVisit = [];
    // pretty print copyOfNodes
    console.log('visiting batch: ' + JSON.stringify(nodesToVisit, null, 2));

    promisesToKeep = [];
    for (var i = 0; i < copyOfNodes.length; i++) {
      console.log('visiting this parent: ' + JSON.stringify(copyOfNodes[i], null, 2));
      if (copyOfNodes[i].children){
        insert(copyOfNodes[i].id, copyOfNodes[i].parent, copyOfNodes[i].text, copyOfNodes[i].children);
        console.log('visiting this parent: ' + JSON.stringify(copyOfNodes[i], null, 2));
        console.log('visiting these children: ' + JSON.stringify(copyOfNodes[i].children, null, 2));
        var nodes = copyOfNodes[i].children;
        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          console.log('node: ' + node);
          promisesToKeep.push(timeout(2000, fetch("https://hacker-news.firebaseio.com/v0/item/" + node + ".json?print=pretty")));
        }
      } else {
        // is a leaf
        insert(copyOfNodes[i].id, copyOfNodes[i].parent, copyOfNodes[i].text, null);
      }
    }
    console.log('promisesToKeep: ' + promisesToKeep);


    Promise.race(promisesToKeep)
    .then(results => Promise.all(results.map(r => r.json()))) // I don't know if this is right because I already have Promise.race
    .then(val => {
        console.debug(JSON.stringify(val, null, 2));
        if(val) {
            val.forEach(comment => {
              nodesToVisit.push({id:comment.id, children:comment.kids});
           });
        }
    }).then(function() {
        recurse++;
        if (recurse < 1) {
          console.log(recurse);
          // visitNextBatch();
        }
    })
}

// $(function() {
//   postID = 27866038;

  
  
//   const fetchPromise = timeout(1000, fetch("https://hacker-news.firebaseio.com/v0/item/" + postID + ".json?print=pretty"));
//   fetchPromise
//     .then(response => {return response.json();})
//     .then(dataa => {
//       console.log("data postindex: " + dataa.kids);
//       nodesToVisit.push({id:dataa.id, children:dataa.kids});
//       // add to map
//       // for (var i = 0; i < dataa.kids.length; i++) {
//       //   console.debug(dataa.kids[i] + " " + dataa.kids[i].toString());
//       //   if (!nodesToVisit[postID]) {
//       //     map[postID] = [];
//       //     map[postID].push(dataa.kids[i]);
//       //     // print map
//       //     console.debug(map);
//       //   }
//       //   else {
//       //     map[postID].push(dataa.kids[i]);
//       //   }
//       // }
//     })
//     .then(() => {
//       // print map
//       console.log(JSON.stringify(nodesToVisit, null, 2));
//       // visitNextBatch();
//       console.log(JSON.stringify(nodesToVisit, null, 2));
//       console.log("BFS result: " + printBFS(root));
//       console.log("That's all folks");
//     });
// });


var colors = ["red", "blueviolet", "purple", "blue", "darkcyan", "green", "greenyellow", "yellow", "orange", "orangered"];
document.addEventListener('keydown', logKey);
var indexX = 0;
var indexY = 0;

parent = ""
kids = []

var hw = window.innerWidth / 2;
var hh = window.innerHeight / 2;
deltaPosX = 0
deltaPosY = 0

var postIndex = 0

var mod = function(n, m) {
  var remain = n % m;
  return Math.floor(remain >= 0 ? remain : remain + m);
};

function logPos() {
  console.log(parent);
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
    .then(response => {return response.json();})
    .then(dataa => {
      console.log("data postindex: " + dataa[postIndex])
            parent = dataa[postIndex];
            setPostTitle(parent);
            setPostText(parent);
    });
});

function setPostTitle(postID) {
  console.log("setPostTitle https://hacker-news.firebaseio.com/v0/item/" + postID + ".json?print=pretty");
  console.log("postID: " + postID);
  if (indexY == 0) {
    const fetchPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + postID + ".json?print=pretty");
    fetchPromise
      .then(response => {return response.json();})
      .then(data => {
        console.log("This is supposed to be tht title: " + data["title"]);
        $('#block0col0').children('.card-body').children('.card-title').text(htmlDecode(data["title"]));
        $('#block0col0').children('.card-body').children('.card-text').text(htmlDecode(data["url"]));
      })
  }
}


function setPostText(postID) {
  console.log("setPostText https://hacker-news.firebaseio.com/v0/item/" + postID + ".json?print=pretty");
  console.log("postID: " + postID);

  const fetchPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + postID + ".json?print=pretty");
  fetchPromise
    .then(response => {return response.json();})
    .then(data => {
      if (indexY != 0) {
        // Not title and is top row, left col
        console.log("// Not title and is top row, left col: https://hacker-news.firebaseio.com/v0/item/" + data["kids"][mod(indexX + 0, data["kids"].length)] + ".json?print=pretty")
        const fetchTopRowLeftKidPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + data["kids"][mod(indexX + 0, data["kids"].length)] + ".json?print=pretty");
        fetchTopRowLeftKidPromise
          .then(response => {return response.json();})
          .then(kidData => {
            console.log("This is supposed to be the top left kid text: " + kidData);
            $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 0, 3)).children('.card-body').children('.card-text').text(htmlDecode(kidData["text"]));
            // $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 0, 3)).append('<p>' + kidData["text"] + '</p>');
          });

        // Not title and is top row, right col
        const fetchTopRowRightKidPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + data["kids"][mod(indexX + 1, data["kids"].length)] + ".json?print=pretty");
        fetchTopRowRightKidPromise
          .then(response => {return response.json();})
          .then(kidData => {
            console.log("This is supposed to be the top right kid text: " + kidData["text"]);
            $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 1, 3)).children('.card-body').children('.card-text').text(htmlDecode(kidData["text"]));
            // $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 1, 3)).append('<p>' + kidData["text"] + '</p>');
          });
      }
      // // bottom row, left col
      // $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 0, 3)).empty();
      // $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 0, 3)).append('<p>' + getPostText(kids[mod(indexX + 0, kids.length)]) + '</p>');
      console.log("// bottom row, left col: https://hacker-news.firebaseio.com/v0/item/" + data["kids"][mod(indexX + 0, data["kids"].length)] + ".json?print=pretty")
      const fetchTopRowLeftKidPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + data["kids"][mod(indexX + 0, data["kids"].length)] + ".json?print=pretty");
      fetchTopRowLeftKidPromise
        .then(response => {return response.json();})
        .then(kidData => {
          if (kidData["kids"] && kidData["kids"].length > 0) {
            console.log("This is supposed to be the bottom left kid text: " + kidData["kids"]);
            console.log("// Not title and is top row, left col: https://hacker-news.firebaseio.com/v0/item/" + kidData["kids"][mod(indexX + 0, kidData["kids"].length)] + ".json?print=pretty")
            const fetchBottomRowLeftKidPromise = fetch("https://hacker-news.firebaseio.com/v0/item/" + kidData["kids"][mod(indexX + 0, kidData["kids"].length)] + ".json?print=pretty");
            fetchBottomRowLeftKidPromise
              .then(response => {return response.json();})
              .then(grandkidData => {
                console.log("This is supposed to be the bototm left kid text: " + grandkidData["text"]);
                $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 0, 3)).children('.card-body').children('.card-text').text(htmlDecode(kidData["text"]));
                // $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 0, 3)).append('<p>' + grandkidData["text"] + '</p>');
              });
          }
        });

      // // bottom row, right col
      // $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 1, 3)).empty();
      // $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 1, 3)).append('<p>' + getPostText(kids[mod(indexX + 1, kids.length)]) + '</p>');
    })
}

function getResult (result) {
  return result
}

function update() {
  setPostTitle(parent);
  setPostText(parent);
  // if (indexY > 0){ // top is comments
    // Top Left
    // $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 0, 3)).empty();
    // $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 0, 3)).append('<p>' + getPostText(kids[mod(indexX, kids.length)]) + '</p>');
    // if indexY == 0: view post title
    if (indexY == 0) {
      /// <div class="block0" id="block0col0" style="background-color: red; height: 50vh; min-width:50vw; max-width: 50vw;  display:flex;justify-content:center;align-items:center;">Hello</div>
      
    }
    // else display valid child 

    // Top Right
    // $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 1, 3)).empty();
    // $("#block" + mod(indexY + 0, 3) + "col" + mod(indexX + 1, 3)).append('<p>' + getPostText(kids[mod(indexX + 1, kids.length)]) + '</p>');
  // }
}

function setKids() {
  firstKid = kids[mod(indexX, 3)];
  secondKid = kids[mod(indexX + 1, 3)];
  $.getJSON(
    "https://hacker-news.firebaseio.com/v0/item/"+ firstKid +".json?print=pretty",
    function(data){
      $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX, 3)).empty();
      $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX, 3)).append('<p>' + data['text'] + '</p>');
    });
    $.getJSON(
      "https://hacker-news.firebaseio.com/v0/item/"+ secondKid +".json?print=pretty",
      function(data){
        $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 1, 3)).empty();
        $("#block" + mod(indexY + 1, 3) + "col" + mod(indexX + 1, 3)).append('<p>' + data['text'] + '</p>');
    });
  
}


function logEverything()
{
  console.log("The top    row: " + getTopRowId()  + ", top-y: " + $("#" + getTopRowId()).position().top);
  console.log("The bottom row: " + getBottomRowId() + ", bot-y: " + $("#" + getBottomRowId()).position().top);
  console.log("The hidden row: " + getHiddenRowId() + ", hid-y: " + $("#" + getHiddenRowId()).position().top);
  console.log("Ending deltaPosY: " + deltaPosY);
}

function getTopRowId()
{
  return "row" + mod(indexY + 0, 3);
}

function getBottomRowId()
{
  return "row" + mod(indexY + 1, 3);
}

function getHiddenRowId()
{
  return "row" + mod(indexY + 2, 3);
}

function getLeftColId()
{
  return "col" + mod(indexX + 0, 3);
}

function getRightColId()
{
  return "col" + mod(indexX + 1, 3);
}

function getHiddendColId()
{
  return "col" + mod(indexX + 2, 3);
}

function logKey(e) {
  if (e.keyCode == '38') {
    // up arrow
    // if (indexY > 0) {
    //   console.log("Up");
    //   deltaPosY += hh;
    //   // position the hidden row so that it appears from the bottom
    //   document.getElementById(getHiddenRowId()).style.position = "absolute";
    //   document.getElementById(getHiddenRowId()).style.top = -deltaPosY + "px";
    //   let animations = anime({
    //     targets: ".block",
    //     translateY: deltaPosY,
    //     easing: 'spring(1, 80, 10, 0)'
    //   });
    //   logPos();
    //   indexY -= 1;
    //   // $("#row" + mod(indexY + 2, 3)).children(":first").html("" + indexY);
    //   console.log("X: " + indexX + " Y: " + indexY);
    // }

    if (indexY > 0) {
      console.log("Up");
      const oldDeltaPosY = deltaPosY;
      deltaPosY += hh;
      // position the hidden row so that it appears from the bottom
      // document.getElementById(getHiddenRowId()).style.position = "absolute";
      // document.getElementById(getHiddenRowId()).style.top = -hh + "px";
      // d3.selectAll("#" + getTopRowId()).transition().styleTween("transform", function() {return d3.interpolateString("translate(0px, " + 0 + "px)", "translate(0px, " + hh + "px)");}).duration(400);
      // d3.selectAll("#" + getBottomRowId()).transition().styleTween("transform", function() {return d3.interpolateString("translate(0px, " + hh + "px)", "translate(0px, " + 2*hh + "px)");}).duration(400);
      // d3.selectAll("#" + getHiddenRowId()).transition().styleTween("transform", function() {return d3.interpolateString("translate(0px, " + -hh + "px)", "translate(0px, " + 0 + "px)");}).duration(400);
      document.getElementById(getTopRowId()).style.position = "absolute";
    document.getElementById(getBottomRowId()).style.position = "absolute";
    document.getElementById(getHiddenRowId()).style.position = "absolute";
    d3.select("#" + getTopRowId()).transition().duration(400).style("top", () => hh + "px")
    d3.select("#" + getBottomRowId()).transition().duration(400).style("top", () => 2*hh + "px")
    d3.select("#" + getHiddenRowId()).transition().duration(0).style("top", () => -hh + "px")
    d3.select("#" + getHiddenRowId()).transition().duration(400).style("top", () =>  00 + "px")
      indexY -= 1;
    }
  } else if (e.keyCode == '40') {
    // down arrow
    console.log("Down");
    deltaPosY -= hh;
    // position the hidden row so that it appears from the top
    // document.getElementById(getHiddenRowId()).style.position = "absolute";
    // console.log("before adding " + deltaPosY);
    // logEverything();
    // document.getElementById(getHiddenRowId()).style.top = -deltaPosY + hh + "px";
    // console.log("after adding " + deltaPosY);
    // logEverything();
    // let animation = anime({
    //   targets: '.block',
    //   translateY: deltaPosY,
    //   easing: 'spring(1, 80, 10, 0)'
    // });
    // logPos();
    // indexY += 1;
    // // $("#row" + mod(indexY + 2, 3)).children(":first").html("" + indexY);
    // console.log("X: " + indexX + " Y: " + indexY);
    // document.getElementById(getHiddenRowId()).style.position = "absolute";
    // document.getElementById(getHiddenRowId()).style.top = 2*hh + "px";
    // d3.selectAll("#" + getTopRowId()).transition().styleTween("transform", function() {return d3.interpolateString("translate(0px, " + 0 + "px)", "translate(0px, " + -hh + "px)");}).duration(400);
    // d3.selectAll("#" + getBottomRowId()).transition().styleTween("transform", function() {return d3.interpolateString("translate(0px, " + 0 + "px)", "translate(0px, " + -hh + "px)");}).duration(400);
    // d3.selectAll("#" + getHiddenRowId()).transition().styleTween("transform", function() {return d3.interpolateString("translate(0px, " + 0 + "px)", "translate(0px, " + (-hh - hh) + "px)");}).duration(400);
    document.getElementById(getTopRowId()).style.position = "absolute";
    document.getElementById(getBottomRowId()).style.position = "absolute";
    document.getElementById(getHiddenRowId()).style.position = "absolute";
    d3.select("#" + getTopRowId()).transition().duration(400).style("top", () => -hh + "px")
    d3.select("#" + getBottomRowId()).transition().duration(400).style("top", () => 00 + "px")
    d3.select("#" + getHiddenRowId()).transition().duration(0).style("top", () => 2*hh + "px")
    d3.select("#" + getHiddenRowId()).transition().duration(400).style("top", () =>  hh + "px")

      indexY += 1;
  } else if (e.keyCode == '37') {
    if (indexX > 0) {// left arrow
    console.log("Left");
    // deltaPosX = deltaPosX + hw;
    // document.getElementById("block" + mod(indexY + 1, 3) + getHiddendColId()).style.position = "absolute";
    // document.getElementById("block" + mod(indexY + 1, 3) + getHiddendColId()).style.left = -deltaPosX + "px";
    // logPosCol(mod(indexY + 1, 3))
    // target = '.block' + mod(indexY + 1, 3);
    // let animation = anime({
    //   targets: target,
    //   translateX: deltaPosX,
    //   easing: 'spring(1, 80, 10, 0)'
    // });
    document.getElementById("block" + mod(indexY + 1, 3) + getLeftColId()).style.position = "absolute";
    document.getElementById("block" + mod(indexY + 1, 3) + getRightColId()).style.position = "absolute";
    document.getElementById("block" + mod(indexY + 1, 3) + getHiddendColId()).style.position = "absolute";
    d3.select("#block" + getBottomRowId().slice(-1) + getLeftColId()).transition().duration(400).style("left", () => hw + "px")
    d3.select("#block" + getBottomRowId().slice(-1) + getRightColId()).transition().duration(400).style("left", () => 2*hw + "px")
    d3.select("#block" + getBottomRowId().slice(-1) + getHiddendColId()).transition().duration(0).style("left", () =>  -hw+ "px")
    d3.select("#block" + getBottomRowId().slice(-1) + getHiddendColId()).transition().duration(400).style("left", () =>  00 + "px")

    indexX -= 1;
    console.log("X: " + indexX + " Y: " + indexY);}
  } else if (e.keyCode == '39') {
    // right arrow
    console.log("Right");
    // deltaPosX = deltaPosX - hw;
    // document.getElementById("block" + mod(indexY + 1, 3) + getHiddendColId()).style.position = "absolute";
    // document.getElementById("block" + mod(indexY + 1, 3) + getHiddendColId()).style.left = -deltaPosX + hw + "px";
    // target = '.block' + mod(indexY + 1, 3);
    // let animation = anime({
    //   targets: target,
    //   translateX: deltaPosX,
    //   easing: 'spring(1, 80, 10, 0)'
    // });
    // logPosCol(mod(indexY + 1, 3))
    document.getElementById("block" + mod(indexY + 1, 3) + getLeftColId()).style.position = "absolute";
    document.getElementById("block" + mod(indexY + 1, 3) + getRightColId()).style.position = "absolute";
    document.getElementById("block" + mod(indexY + 1, 3) + getHiddendColId()).style.position = "absolute";
    d3.select("#block" + getBottomRowId().slice(-1) + getLeftColId()).transition().duration(400).style("left", () => -hw + "px")
    d3.select("#block" + getBottomRowId().slice(-1) + getRightColId()).transition().duration(400).style("left", () => 00 + "px")
    d3.select("#block" + getBottomRowId().slice(-1) + getHiddendColId()).transition().duration(0).style("left", () =>  2*hw + "px")
    d3.select("#block" + getBottomRowId().slice(-1) + getHiddendColId()).transition().duration(400).style("left", () =>  hw + "px")
    indexX += 1;
    // $("#row" + mod(indexX + 2, 3)).children(":first").html("" + indexX);
    console.log("X: " + indexX + " Y: " + indexY);
  }
  // document.getElementById('top-half').style.backgroundColor = colors[mod(indexY, colors.length)]
  // document.getElementById('bottom-left1').style.backgroundColor = colors[mod((indexY + 1), colors.length)]
  // document.getElementById('bottom-right1').style.backgroundColor = colors[mod((indexY + 2), colors.length)]
  // document.getElementById('bottom-left2').style.backgroundColor = colors[mod((indexY + 3), colors.length)]
  // document.getElementById('bottom-right3').style.backgroundColor = colors[mod((indexY + 4), colors.length)]
  console.log(`${e.code}`);
  update(); // uncomment me to see the text poplulated from HN
  logEverything();
}

