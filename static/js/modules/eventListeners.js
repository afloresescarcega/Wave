import { rowHistory, currentRow, updateCurrentRow } from './globals.js';
import { renderRow, updateTopRow } from './row.js';

function handleDOMContentLoaded() {
  // code to run on page load
}

document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
document.addEventListener('keyup', function (event) {
  console.log(`Key event: ${event.code}`);
  // Removed state logging
function handleArrowUpKeyPress() {
    if (rowHistory.length > currentRow) {
      console.log(`Top row: ${JSON.stringify(rowHistory[currentRow])}`);
      if (rowHistory.length > currentRow + 1) {
        console.log(`Bottom row: ${JSON.stringify(rowHistory[currentRow + 1])}`);
      }
    }
function handleArrowUpKeyPress() {
    // Check if the next row is in the history
    if (currentRow < rowHistory.length - 1) {
      // Use the next row from the history
      updateTopRow(rowHistory[currentRow]);
      updateCurrentRow(currentRow + 1);
      renderRow(rowHistory[currentRow]);
    }
    // get the id of the post in the bottom left card
    var postId = document.getElementById('block1col0').getAttribute('data-post-id');
    console.log(`postId: ${postId}`);

    // call the new endpoint to get the children of the post
    fetch(hostAddr + '/wave/api/v1.0/children?post=' + postId)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Data from fetch:', data);
        // Add the data to the history
        rowHistory.push(data.children);
        updateTopRow(rowHistory[currentRow]);
        updateCurrentRow(currentRow + 1);

        // Update the state variables
        updateTopLeft(rowHistory[currentRow][0]);
        updateTopRight(rowHistory[currentRow][1]);
        updateBottomLeft(data.children[0]);
        updateBottomRight(data.children[1]);

        // Render the row
        renderRow(data.children);
      })
      .catch(error => {
        console.error('Error during fetch:', error);
      });
}

if (event.code === 'ArrowUp') {
    handleArrowUpKeyPress();
}
function handleArrowDownKeyPress() {
    // Check if the previous row is in the history
    if (currentRow > 0) {
      console.log(`Top row: ${JSON.stringify(rowHistory[currentRow - 1])}`);
      console.log(`Bottom row: ${JSON.stringify(rowHistory[currentRow])}`);
      // Use the previous row from the history
      updateCurrentRow(currentRow - 1);
      renderRow(rowHistory[currentRow]);
      if (currentRow > 1) {
        updateTopRow(rowHistory[currentRow - 1]);
      }
    }

    // Update the state variables
    updateTopLeft(rowHistory[currentRow - 1][0]);
    updateTopRight(rowHistory[currentRow - 1][1]);
    updateBottomLeft(rowHistory[currentRow][0]);
    updateBottomRight(rowHistory[currentRow][1]);
}

if (event.code === 'ArrowDown') {
    handleArrowDownKeyPress();
}
});
