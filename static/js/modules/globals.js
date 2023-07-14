// Global variable to store row history
let rowHistory = [];
let currentRow = 0;
let topLeft = null;
let topRight = null;
let bottomLeft = null;
let bottomRight = null;

function updateCurrentRow(value) {
  currentRow = value;
}

function updateRowHistory(newRowHistory) {
  rowHistory = newRowHistory;
}

function updateTopLeft(value) {
  topLeft = value;
}

function updateTopRight(value) {
  topRight = value;
}

function updateBottomLeft(value) {
  bottomLeft = value;
}

function updateBottomRight(value) {
  bottomRight = value;
}

export { rowHistory, currentRow, topLeft, topRight, bottomLeft, bottomRight, updateCurrentRow, updateRowHistory, updateTopLeft, updateTopRight, updateBottomLeft, updateBottomRight };
