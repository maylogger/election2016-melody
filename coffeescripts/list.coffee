#################################
# Settings
#################################
window.list = []
window.pageNumber = 0
window.perPage = 10


#################################
# Function
#################################
appendList = (page) ->
  start = page*window.perPage
  end = (page + 1)*window.perPage

  if end > window.list.length
    $('.list-more-song').remove()

  array = window.list.slice(start,end)
  for item in array
    $('.song-list').append $songItem(item)
    xx item
    if item.waveform is null
      SC.get '/tracks/'+item.track_id, (track) ->
        xx track
        xx track.waveform_url
        $.getJSON 'http://waveformjs.org/w?callback=?', { url: track.waveform_url }, (d) ->
          xx d
          syncWaveform(item.id,item.token,d)
          songWaveform = d
          waveform = new Waveform(
            container: $('.waveform-preview').last().get(0)
            innerColor: '#F0F0F0'
            data: songWaveform
          )
    else
      songWaveform = waveformStringToArray item.waveform
      waveform = new Waveform(
        container: $('.waveform-preview').last().get(0)
        innerColor: '#F0F0F0'
        data: songWaveform
      )

  window.pageNumber++

songFilter = (filter) ->
  $('.song-list').find(".song-string:not(:Contains(" + filter + "))").parents('li').hide()
  $('.song-list').find(".song-string:contains(" + filter + ")").parents('li').show()


#################################
# Html pattern
#################################
$songItem = (item) ->
  '<li class="song-item">
    <div class="song-string">' +
      item.id +
      item.title +
      item.desc +
      item.author_name + '
    </div>
    <div class="song-content">
      <a class="song-number" href="/song/?no='+item.id+'">'+padLeft(item.id,3)+'</a>
      <a class="song-info" href="/song/?no='+item.id+'">
        <div class="song-title">'+item.title+'</div>
        <div class="song-artist">'+item.author_name+'</div>
      </a>
      <div class="vote-count">票數：'+item.vote_count+'</div>
    </div>
    <div class="song-player">
      <button class="play-button" data-trackid="'+item.track_id+'"></button>
      <div class="song-wave">
        <div class="waveform-preview"></div>
        <div class="waveform"></div>
        <input type="hidden" class="song-waveform-value" value="'+item.waveform+'">
      </div>
    </div>
    <div class="song-tool-buttons">
      <button class="vote-button" type="button" data-id="'+item.id+'">投他一票</button>
      <button class="fb-share">分享</button>
    </div>
  </li>'


#################################
# Document events
#################################
$ ->
  $.getJSON 'http://api.staging.iing.tw/soundclouds.json?token=8888', (r) ->
    window.list = r
    appendList 0

  $('body').delegate '.list-more-song', 'click', ->
    appendList window.pageNumber

  # $('body').delegate '.header-search .submit', 'click', ->
  #   filter = $('.search-string').val()
  #   if filter
  #     songFilter filter
  #   else
  #     $('.song-list li').show()

  $('body').delegate '.search-string', 'keyup', ->
    filter = $(this).val()
    if filter
      songFilter filter
    else
      $('.song-list li').show()