import Post from './post.js';

function createCardHtml(postData, index) {
  // function to create the HTML for a card with the given post data
  var colors = ['bg-danger text-white', 'bg-warning text-dark', 'bg-info text-white'];
  var color = colors[index % colors.length];
  var left = index * 50;

  if (postData) {
    var post = new Post(postData.id, postData.title, postData.by, postData.time, postData.text);

    return '<div class="card ' + color + '" data-post-id="' + post.id + '" style="left:' + left + 'vw; position: absolute;">' +
      '<div class="card-body">' +
      '<h5 class="card-title"><a href="https://news.ycombinator.com/item?id=' + post.id + '">' +
      post.author + ' - ' + post.time + '</a></h5>' +
      '<p class="card-text">' + post.text + '</p>' +
      '</div></div>';
  } else {
    return '<div class="card ' + color + '" style="left:' + left + 'vw; position: absolute;"><div class="card-body"><h5 class="card-title">No data</h5><p class="card-text">No data</p></div></div>';
  }
}

export { createCardHtml };
