var createWaveform, getUrlVars, isMobile, nl2br, padLeft, soundManager, soundTrack, syncWaveform, waveformStringToArray;

SC.initialize({
  client_id: 'd2f7da453051d648ae2f3e9ffbd4f69b'
});

soundManager = void 0;

soundTrack = [];

window.getVars = [];

window.autoLoop = false;

window.autoPlay = false;

window.isDesktop = true;

isMobile = function() {
  return navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/BlackBerry/);
};

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

padLeft = function(str, length) {
  if (str.toString().length >= length) {
    return str;
  } else {
    return padLeft('0' + str, length);
  }
};

nl2br = function(str, is_xhtml) {
  var breakTag;

  breakTag = is_xhtml || typeof is_xhtml === 'undefined' ? '<br ' + '/>' : '<br>';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};

waveformStringToArray = function(str) {
  return str.split(',').map(Number);
};

createWaveform = function(id, track_id, waveform, selector) {
  return SC.get('/tracks/' + track_id, function(track) {
    var ctx, gradient, sound;

    $(selector + ' .play-times').text(track.playback_count);
    soundTrack[track_id] = track;
    sound = void 0;
    waveform = new Waveform({
      container: $(selector + ' .waveform').get(0),
      innerColor: '#F0F0F0',
      data: waveform
    });
    ctx = waveform.context;
    gradient = ctx.createLinearGradient(0, 0, 0, waveform.height);
    gradient.addColorStop(0.0, '#E4E779');
    gradient.addColorStop(1.0, '#57C0C7');
    waveform.innerColor = function(x) {
      if (sound && x < sound.position / sound.durationEstimate) {
        return gradient;
      } else if (sound && x < sound.bytesLoaded / sound.bytesTotal) {
        return '#D1D1D1';
      } else {
        return '#F0F0F0';
      }
    };
    return SC.stream('/tracks/' + track_id, {
      whileloading: waveform.redraw,
      whileplaying: waveform.redraw,
      volume: 100,
      useHTML5Audio: true,
      preferFlash: false
    }, function(s) {
      var playSong;

      $(selector + ' .play-button').attr('data-sid', s.sID);
      sound = s;
      if (window.autoPlay === true && window.isDesktop === true) {
        xx('auto play');
        playSong = function(element, sid) {
          return soundManager.play(sid, {
            onplay: function() {
              element.addClass('pause-button');
              element.removeClass('loading');
              return element.removeClass('play-button');
            },
            onresume: function() {
              element.addClass('pause-button');
              element.removeClass('loading');
              return element.removeClass('play-button');
            },
            onfinish: function() {
              xx('song finish');
              if (window.autoLoop) {
                return playSong(element, sid);
              } else {
                element.addClass('play-button');
                return element.removeClass('pause-button');
              }
            }
          });
        };
        return playSong($('.play-button'), s.sID);
      }
    });
  });
};

syncWaveform = function(id, token, data) {
  return $.ajax({
    type: 'post',
    dataType: 'json',
    cache: false,
    data: {
      id: id,
      token: token,
      data: data.toString()
    },
    url: 'http://api.iing.tw/sync_waveform.json',
    success: function(response) {
      return xx(response);
    }
  });
};

$(function() {
  if (isMobile()) {
    window.isDesktop = false;
  }
  window.getVars = getUrlVars();
  if (parseInt(window.getVars['loop']) === 1) {
    window.autoLoop = true;
  }
  $('body').delegate('.play-button', 'click', function() {
    var playSong, sid, _this;

    if (soundManager !== void 0) {
      soundManager.pauseAll();
      $('.pause-button').addClass('play-button');
      $('.play-button').removeClass('pause-button');
    }
    _this = $(this);
    _this.addClass('loading');
    sid = _this.data('sid');
    playSong = function(element, sid) {
      return soundManager.play(sid, {
        onplay: function() {
          element.addClass('pause-button');
          element.removeClass('loading');
          return element.removeClass('play-button');
        },
        onresume: function() {
          element.addClass('pause-button');
          element.removeClass('loading');
          return element.removeClass('play-button');
        },
        onfinish: function() {
          xx('song finish');
          if (window.autoLoop) {
            return playSong(element, sid);
          } else {
            element.addClass('play-button');
            return element.removeClass('pause-button');
          }
        }
      });
    };
    return playSong(_this, sid);
  });
  $('body').delegate('.pause-button', 'click', function() {
    soundManager.pauseAll();
    $(this).removeClass('pause-button');
    return $(this).addClass('play-button');
  });
  $('body').delegate('.fb-share', 'click', function() {
    var href;

    href = $(this).data('href');
    return window.open(href);
  });
  return $('body').delegate('.waveform', 'click', function(e) {
    var button, currentTrack, duration, position, sid, target, trackid;

    button = $(this).parents('.song-player').find('button');
    sid = button.data('sid');
    trackid = button.data('trackid');
    currentTrack = soundTrack[trackid];
    duration = currentTrack.duration;
    position = (e.pageX - $(this).offset().left) / $(this).width();
    target = Math.floor(duration * position);
    return soundManager.setPosition(sid, target);
  });
});
