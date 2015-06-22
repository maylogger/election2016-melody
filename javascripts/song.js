var getUrlVars;

getUrlVars = function() {
  var hash, hashes, i, vars;

  vars = [];
  hash = void 0;
  hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  i = 0;
  while (i < hashes.length) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
    i++;
  }
  return vars;
};

$(function() {
  var id, vars;

  vars = getUrlVars();
  if (typeof vars.no !== 'undefined' && parseInt(vars.no) > 0) {
    id = parseInt(vars.no);
    return $.getJSON('http://api.staging.iing.tw/soundclouds/' + id + '.json?token=8888', function(item) {
      var songWaveform, waveform;

      xx(item);
      $('.song-title').text(item.title);
      $('.song-artist').text(item.author_name);
      $('.song-number').text(padLeft(item.id, 3));
      $('.vote-count span').text(item.vote_count);
      $('.song-lyric p').html(nl2br(item.lyrics));
      $('.song-intro p').html(nl2br(item.desc));
      $('.song-waveform-value').val(item.waveform);
      $('.vote-button').attr('data-id', item.id);
      $('.play-button').attr('data-trackid', item.track_id);
      if (item.waveform === null) {
        return SC.get('/tracks/' + item.track_id, function(track) {
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
        return waveform = new Waveform({
          container: $('.waveform-preview').last().get(0),
          innerColor: '#F0F0F0',
          data: songWaveform
        });
      }
    });
  } else {
    return window.location = '/list';
  }
});