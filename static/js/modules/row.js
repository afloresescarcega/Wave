import {createCardHtml} from "./card.js";

function renderRow(rowData) {
  // remove all the cards in the bottom row
  var row1 = document.getElementById('row1');
  while (row1.firstChild) {
    row1.firstChild.remove();
  }

  // add new cards for each child of the post
  for (var i = 0; i < rowData.length; i++) {
    var newCard = document.createElement('div');
    newCard.innerHTML = createCardHtml(rowData[i], i);
    row1.appendChild(newCard);
  }
}

function updateTopRow(rowData) {
  // remove all the cards in the top row
  var row0 = document.getElementById('row0');
  while (row0.firstChild) {
    row0.firstChild.remove();
  }

  // add new cards for each child of the post
  for (var i = 0; i < rowData.length; i++) {
    var newCard = document.createElement('div');
    newCard.innerHTML = createCardHtml(rowData[i], i);
    row0.appendChild(newCard);
  }
}

export { renderRow, updateTopRow };
