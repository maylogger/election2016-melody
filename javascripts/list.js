var $songItem, appendList, songFilter;

window.list = [];

window.pageNumber = 0;

window.perPage = 10;

appendList = function(page) {
  var array, end, item, songWaveform, start, waveform, _i, _len;

  start = page * window.perPage;
  end = (page + 1) * window.perPage;
  if (end > window.list.length) {
    $('.list-more-song').remove();
  }
  array = window.list.slice(start, end);
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    item = array[_i];
    $('.song-list').append($songItem(item));
    xx(item);
    if (item.waveform === null) {
      SC.get('/tracks/' + item.track_id, function(track) {
        xx(track);
        xx(track.waveform_url);
        return $.getJSON('http://waveformjs.org/w?callback=?', {
          url: track.waveform_url
        }, function(d) {
          var songWaveform, waveform;

          xx(d);
          syncWaveform(item.id, item.token, d);
          songWaveform = d;
          return waveform = new Waveform({
            container: $('.waveform-preview').last().get(0),
            innerColor: '#F0F0F0',
            data: songWaveform
          });
        });
      });
    } else {
      songWaveform = waveformStringToArray(item.waveform);
      waveform = new Waveform({
        container: $('.waveform-preview').last().get(0),
        innerColor: '#F0F0F0',
        data: songWaveform
      });
    }
  }
  return window.pageNumber++;
};

songFilter = function(filter) {
  $('.song-list').find(".song-string:not(:Contains(" + filter + "))").parents('li').hide();
  return $('.song-list').find(".song-string:contains(" + filter + ")").parents('li').show();
};

$songItem = function(item) {
  return '<li class="song-item">\
    <div class="song-string">' + item.id + item.title + item.desc + item.author_name + '\
    </div>\
    <div class="song-content">\
      <a class="song-number" href="/song/?no=' + item.id + '">' + padLeft(item.id, 3) + '</a>\
      <a class="song-info" href="/song/?no=' + item.id + '">\
        <div class="song-title">' + item.title + '</div>\
        <div class="song-artist">' + item.author_name + '</div>\
      </a>\
      <div class="vote-count">票數：' + item.vote_count + '</div>\
    </div>\
    <div class="song-player">\
      <button class="play-button" data-trackid="' + item.track_id + '"></button>\
      <div class="song-wave">\
        <div class="waveform-preview"></div>\
        <div class="waveform"></div>\
        <input type="hidden" class="song-waveform-value" value="' + item.waveform + '">\
      </div>\
    </div>\
    <div class="song-tool-buttons">\
      <button class="vote-button" type="button" data-id="' + item.id + '">投他一票</button>\
      <button class="fb-share">分享</button>\
    </div>\
  </li>';
};

$(function() {
  $.getJSON('http://api.staging.iing.tw/soundclouds.json?token=8888', function(r) {
    window.list = r;
    return appendList(0);
  });
  $('body').delegate('.list-more-song', 'click', function() {
    return appendList(window.pageNumber);
  });
  return $('body').delegate('.search-string', 'keyup', function() {
    var filter;

    filter = $(this).val();
    if (filter) {
      return songFilter(filter);
    } else {
      return $('.song-list li').show();
    }
  });
});