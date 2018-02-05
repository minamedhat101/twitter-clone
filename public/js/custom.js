$(function() {

  var socket = io();

  $('#sendTweet').submit(function() {
    var content = $('#tweet').val();
    socket.emit('tweet', { content: content });
    $('#tweet').val('');
    return false;
  });


  socket.on('incomingTweets', function(data) {
    console.log(data);
    let html = '';

    //html += '<div id="tweets" class="row tweet">';
    html += '<div class="col-sm-2">';
    html += '<a href="/user/' + data.user._id + '"><img class="ratio img-responsive img-circle" src="' + data.user.photo + '" alt=""></a>';
    html += '</div>';
    html += '<div class="col-sm-10">';
    html += '<a href="/user/' + data.user._id + '">' + data.user.name + '</a>';
    html += '<p class="tweet-content">' + data.data.content + '</p>';
    html += '</div></div>';

    $('#tweets').prepend(html);
  });
});
