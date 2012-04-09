var bird = require('derby').createApp(module)
  , get = bird.get
  , view = bird.view
  , ready = bird.ready
  , start

get('/:roomName?', function(page, model, params) {
  var roomName = params.roomName || 'home'

  model.subscribe('rooms.' + roomName, function(err, room) {
    model.ref('_room', room)

    room.setNull('players', [
        { name: 'Conner', points: 301 }
      , { name: 'Caroline', points: 301 }
    ]);

    room.incr('visits')

    page.render({
      roomName: roomName
    })
  })
})

ready(function(model) {

  window.model = model;

  var proportions = {
      bullseye: 30
    , bull: 60
    , inner: 230
    , triplering: 270
    , outer: 410
    , doublering: 450
  };

  Object.keys(proportions).forEach(function(p) {
    proportions[p] /= 1000;
  });

  var points = {
      bullseye: 50
    , bull: 25
    , inner: [ 11, 14, 9, 12, 5,
               20, 1, 18, 4, 13,
               6, 10, 15, 2, 17,
               3, 19, 7, 16, 8, 11 ]
  };

  points.outer = points.inner;
  points.doublering = points.inner.map(function(v) { return v * 2; });
  points.triplering = points.inner.map(function(v) { return v * 3; });

  function getHit(x, y) {
    var width = board.offsetWidth
      , center = width / 2
      , dx = center - x
      , dy = center - y
      , offset = Math.sqrt((dx * dx) + (dy * dy))
      , circle;

    for (var p in proportions) {
      if (proportions.hasOwnProperty(p)) {
        var proportionalWidth = width * proportions[p];
        if (offset <= proportionalWidth) {
          circle = p;
          break;
        }

      }
    }

    if (typeof points[circle] == 'number') {
      return { circle: circle, points: points[circle] };
    }

    var angle = Math.acos(((dx * dx) + (offset * offset) - (dy * dy)) / ( 2 * dx * offset )) * (180 / Math.PI);
    if (dy < 0) {
      angle = 360 - angle;
    }

    var i = Math.round(angle / 18);

    return { circle: circle, points: points[circle][i] };
  }

  var touch = new Hammer(board);

  touch.ontap = function(e) {
    var x = e.position[0].x - window['board-container'].offsetLeft
      , y = e.position[0].y - window['board-container'].offsetTop
      , hit = getHit(x, y);

    console.log(hit.circle, hit.points);
    model.incr('_room.players.0.points', -hit.points);
  };


});
