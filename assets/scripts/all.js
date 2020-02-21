var nosInfoBilheteira = {
  debug: false,
  log: function(what)   { if(FORM.debug) { console.log(what); } },
  exists: function(el)  { if($(el).length > 0) { return true; } },
  ValidReCaptcha: false,
infoBilheteira: {
  init: function () {
    $('.description-name').each(function (i, el) {
      $clamp(el, {
        clamp: 2
      });
    })
  }
},
sessions: {
  init: function () {

    var refreshSessionsRate = 1000 * 60; // 1 minute
    var refreshPageRate = 1000 * 60 * 60; // 1 hour
    var previousSessions;
    var sessionsHTML = '';
    var hourChar = ':';
    var inicio = '';

    $.fn.chunk = function (size) {
      var arr = [];
      for (var i = 0; i < this.length; i += size) {
        arr.push(this.slice(i, i + size));
      }
      return this.pushStack(arr, "chunk", size);
    }

    var getSessions = function () {
      $.ajax({
        type: 'GET',
        url: '../data/bload2.xml',
        cache: false,
        dataType: 'xml',
        success: checkSessions,
        contentType: 'Content-type: text/plain; charset=iso-8859-1',
        beforeSend: function(jqXHR) {
          jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
        }
      });
    }

    var checkSessions = function (sessions) {
      var newSessions = sessions;
      // console.log(sessions);

      if ($(newSessions).text() !== $(previousSessions).text()) {
        addSessions(newSessions);
        previousSessions = newSessions;
      }
    }

    var addSession = function (elem) {
      var $this = elem;
      var sala = $this.find('sala').text();
      var horainicio = $this.find('horainicio').text();
      var vendidos = $this.find('vendidos').text();
      var disponiveis = $this.find('disponiveis').text();
      var classeetaria = $this.find('classeetaria').text();
      var genero = $this.find('genero').text();
      var formato = $this.find('formato').text();
      var titulo = $this.find('titulo').text();
      var filmeHora = horainicio.slice(0, 2);
      var filmeMinuto = horainicio.slice(2);

      if (filmeHora == '24') {
        filmeHora = '00';
      }
      inicio = [filmeHora, hourChar, filmeMinuto].join('');

      var occupation = Math.round(vendidos * 100 / disponiveis);
      var occupationTitle = occupation > 0 ? occupation === 100 ? 'Completa' : occupation + '%' : 'Livre';

      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
      }

      return '<div class="session"><div class="session__info"><div class="info-time">' + inicio + '</div><div class="info-room">sala ' + sala + '</div></div><div class="session__description"><div class="description-name">' + titulo + '</div><div class="description-classification"><div class="description-classification__type">' + capitalizeFirstLetter(genero) + '</div><div class="description-classification__target">' + classeetaria + '</div><div class="description-classification__room-type -' + formato + '"></div></div></div><div class="session__occupation"><div class="occupation-title">' + occupationTitle + '</div><div class="occupation-bar"><span style="width: ' + occupation + '%"></span></div></div></div>';
    }

    var addSessions = function (sessions) {
      var sessions = $(sessions).find('sessao');
      var sessionIndexStart = $('body').data('session-start') - 1;
      var sessionIndexEnd = $('body').data('session-end');
      // console.log(sessions);

      sessions.slice(sessionIndexStart, sessionIndexEnd).each(function() {
        sessionsHTML += addSession($(this));
      });

      if ($('.sessions__body')) {
        $('.sessions__body').empty().html(sessionsHTML);
        $('.sessions__body .session').chunk(4).wrap('<div class="sessions__col"></div>');
        sessionsHTML = '';
      }

    }

    getSessions();

    setInterval(function() {
      getSessions();
    }, refreshSessionsRate);

    setTimeout(function() {
      location.reload();
    }, refreshPageRate);

  }
},
posters: {
  init: function () {

    var refreshSessionsRate = 1000 * 60; // 1 minute
    var refreshPageRate = 1000 * 60 * 60; // 1 hour
    var previousSessions;
    var sessionsHTML = '';
    var hourChar = ':';
    var tolerance = '900'; // 15 minutes

    function getTimeWithChar (time, char) {
      var hour = time.slice(0, 2);
      var min = time.slice(2);
      return [hour, char, min].join('');
    }

    $.fn.chunk = function (size) {
      var arr = [];
      for (var i = 0; i < this.length; i += size) {
        arr.push(this.slice(i, i + size));
      }
      return this.pushStack(arr, "chunk", size);
    }

    $.urlParam = function(name){
      var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
      if (results==null){
         return null;
      }
      else{
         return results[1] || 0;
      }
  }

    var getSessions = function () {
      $.ajax({
        type: 'GET',
        url: '../data/bload2.xml',
        cache: false,
        dataType: 'xml',
        success: checkSessions,
        contentType: 'Content-type: text/plain; charset=iso-8859-1',
        beforeSend: function(jqXHR) {
          jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
        }
      });
    }

    var checkSessions = function (sessions) {
      var newSessions = sessions;
      //console.log(sessions);

      if ($(newSessions).text() !== $(previousSessions).text()) {
        addSessions(newSessions);
        previousSessions = newSessions;
      }
    }

    var addSession = function (session) {
      var nrOfSessions = Object.keys(session.sessions).length;
      var sessionsHTML = '';

      $.each(session.sessions, function(key, value) {
        var schedulesHTML = '';
        var lockNext = false;

        $.each(value, function(k, v) {
          var currentDate = new Date;

          var startTime = new Date(moment(v.startTime, "HH:mm").format());
          var endTime = new Date(moment(startTime).add(tolerance, 'seconds'));

          var isActive = '';

          if (lockNext) {
            isActive = '';
          } else {
            if (currentDate > startTime && currentDate < endTime) {
              isActive = ' -active';
              lockNext = true;
            } else if (currentDate < startTime) {
              isActive = ' -active';
              lockNext = true;
            } else {
              isActive = '';
            }
          }

          schedulesHTML += '<li class="slots-session' + isActive +'"> <div class="slots-session__start">' + v.startTime + '</div><div class="slots-session__end">' + v.endTime + '</div></li>';
        });

        sessionsHTML += '<div class="session-row"> <div class="session-room">' + value[0].format + '<span>Sala ' + key + '</span></div><ul class="session-slots">' + schedulesHTML + '</ul> <div class="session-detail"> <div class="session-detail__type">' + session.type + '</div><div class="session-detail__target">' + session.target + '</div></div></div>';


      });

      return '<section class="poster container container--fixed" data-sessions="' + nrOfSessions + '"><div class="poster__image" style="background-image: url(http://10.133.37.3/backoffice/rest/img?movieId=' + session.id + ');"></div><div class="poster__sessions"> <div class="sessions-wrapper double-sessions"> ' + sessionsHTML + '</div></div></section>';
    }

    var addSessions = function (sessions) {
      var sessionsArray = $(sessions).find('sessao');
      var postersArray = [];

      sessionsArray.each(function(i, session) {
        var $this = $(session);

        var id = $this.find('idfilme').text();
        var screen = $this.find('sala').text();
        var format = ($this.find('formato').text()) ? $this.find('formato').text() : '2d';
        var type = $this.find('genero').text();
        var target = $this.find('classeetaria').text();


        var title = $this.find('titulo').text().split('(')[0].trim();

        var titleFormat = $this.find('titulo').text().split('(')[1];
        var lang = '';

        if (titleFormat) {
          titleFormat = titleFormat.toLowerCase();
          if (titleFormat.indexOf('dob') >= 0) {
            lang = 'dob';
          } else if (titleFormat.indexOf('leg') >= 0) {
            lang = 'leg';
          }
        }

        var startTime = getTimeWithChar($this.find('horainicio').text(), hourChar);
        var endTime = getTimeWithChar($this.find('horafim').text(), hourChar);

        var foundSession = postersArray.find(function (e) {
          return e.title == title && e.lang == lang;
        });

        if (foundSession) {
          var indexOfSession = postersArray.indexOf(foundSession);
          if (postersArray[indexOfSession]['sessions'][screen]) {
            postersArray[indexOfSession]['sessions'][screen].push(
              {
                format: format,
                startTime: startTime,
                endTime: endTime
              }
            );
          } else {
            postersArray[indexOfSession]['sessions'][screen] = [
              {
                format: format,
                startTime: startTime,
                endTime: endTime
              }
            ];
          }

        } else {

          var obj = {};

          obj['id'] = id;
          obj['title'] = title;
          obj['lang'] = lang;
          // obj['format'] = format;
          // obj['screen'] = screen;
          obj['type'] = type;
          obj['target'] = target;
          obj['sessions'] = {};
          obj['sessions'][screen] = [
            {
              format: format,
              startTime: startTime,
              endTime: endTime
            }
          ];

          postersArray.push(obj);

        }

      });

      $.each(postersArray, function(i, e) {
        sessionsHTML += addSession(e);
      });

      if ($('.posters')) {
        $('.posters').empty().html(sessionsHTML).cycle({
          slides: '> section',
          startingSlide: $.urlParam('slide') ? $.urlParam('slide') : 0
        });
        sessionsHTML = '';


      }
    }

    getSessions();

    setInterval(function() {
      getSessions();
    }, refreshSessionsRate);

    setTimeout(function() {
      location.reload();
    }, refreshPageRate);

  }
},
txt: {
  init: function () {
    $.ajax({
      type: 'GET',
      url: '../data/textos.txt',
      cache: false,
      success: function (data) {

        //Frase das sessões
        var start_pos = data.indexOf('<tituloSessoes>') + 15,
          end_pos = data.indexOf('</tituloSessoes>', start_pos),
          tituloSessoes = data.substring(start_pos, end_pos);

        $('.header-title').text(tituloSessoes);

        //Frases
        var start_pos = data.indexOf('<frasesTotal>') + 13,
          end_pos = data.indexOf('</frasesTotal>', start_pos),
          frasesTotal = data.substring(start_pos, end_pos);

        var footerTotalText = parseInt(frasesTotal);

        var footer = [];

        for (var i = 1; i <= parseInt(frasesTotal); i++) {

          var start_pos = data.indexOf('<frase0' + i + '>') + 9,
            end_pos = data.indexOf('</frase0' + i + '>', start_pos),
            frase = data.substring(start_pos, end_pos);

            if (frase) {
              footer.push(frase);
            }
        }

        var i = 0;

        (function populateFooter() {

          $('.sessions__footer').fadeOut('slow', function() {
            $(this).text(footer[i]).fadeIn('slow');
          });

          if (footer.length === i + 1) {
            i = 0;
          } else {
            i++;
          }

          setTimeout(populateFooter, 10000);
        })();



      }
    });
  }
},
time: {
  init: function () {
    function checkTime(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }

    function startTime() {
      var today = new Date();
      var h = today.getHours();
      var m = today.getMinutes();
      // add a zero in front of numbers<10
      m = checkTime(m);
      if ($('.header-time')) {
        $('.header-time').text(h + ":" + m);
      }
      t = setTimeout(function() {
        startTime()
      }, 1000);
    }
    startTime();
  }
},


init: function() {
  this.infoBilheteira.init();
  this.sessions.init();
  if ($('.posters')) {
    this.posters.init();
  }
  this.txt.init();
  this.time.init();
}

} || {};

;(function ($, window, undefined) {
  'use strict';

  $(document).ready(function() {
    nosInfoBilheteira.init();

    function expiredCaptcha() {
    youngAdults.ValidReCaptcha = false;
    $("#txtCaptcha").val('');

    youngAdults.validateCaptcha();
  };

   function correctCaptcha(response) {
    if (response.length == 0) {
      youngAdults.ValidReCaptcha = false;

      $("#txtCaptcha").val('');
      youngAdults.validateCaptcha();
    }
    else {
      youngAdults.ValidReCaptcha = true;
      $("#txtCaptcha").val("True");
      youngAdults.validateCaptcha();
    }
  };

  });

})(jQuery, this);
