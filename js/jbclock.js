function JBCountDown(settings) {
    var glob = settings;
   
    function deg(deg) {
        return (Math.PI/180)*deg - (Math.PI/180)*90
    }
    
    glob.total   = Math.floor((glob.endDate - glob.startDate)/86400);
    glob.days    = Math.floor((glob.endDate - glob.now ) / 86400);
    glob.hours   = 24 - Math.floor(((glob.endDate - glob.now) % 86400) / 3600);
    glob.minutes = 25 - Math.floor((((glob.endDate - glob.now) % 86400) % 3600) / 60) ;
    glob.seconds = 60 - Math.floor((glob.endDate - glob.now) % 86400 % 3600 % 60);

    var clock = {
        set: {
                       
            minutes : function(){
                var cMin = $("#canvas_minutes").get(0);
                var ctx = cMin.getContext("2d");
                ctx.clearRect(0, 0, cMin.width, cMin.height);
                ctx.beginPath();
                ctx.strokeStyle = glob.minutesColor;
                
                ctx.shadowBlur    = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowColor = glob.minutesGlow;
                
                ctx.arc(94,94,85, deg(0), deg((360/glob.time)*glob.minutes));
                ctx.lineWidth = 17;
                ctx.stroke();
                $(".clock_minutes .val").text(glob.time - glob.minutes);

            },
            seconds: function(){
                var cSec = $("#canvas_seconds").get(0);
                var ctx = cSec.getContext("2d");
                ctx.clearRect(0, 0, cSec.width, cSec.height);
                ctx.beginPath();
                ctx.strokeStyle = glob.secondsColor;
                
                ctx.shadowBlur    = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowColor = glob.secondsGlow;
                
                ctx.arc(94,94,85, deg(0), deg(6*glob.seconds));
                ctx.lineWidth = 17;
                ctx.stroke();
                     
                $(".clock_seconds .val").text(60 - glob.seconds);
            }
        },
       
        start: function(){
            /* Seconds */
            if( typeof(cdown) !== 'undefined' ){
                clearInterval(cdown);
                cdown = null;
            }
            cdown = setInterval(function(){
                if ( glob.seconds > 59 ) {
                    if (glob.time - glob.minutes == 0) {
                        clearInterval(cdown);
                        
                        /* Countdown is complete */
                        angular.element($('#Live')).scope().Changelevel('next');
                        return;
                    }
                    glob.seconds = 1;
                    if (glob.minutes > 59) {
                        glob.minutes = 1;
                        clock.set.minutes();
                        if (glob.hours > 23) {
                            glob.hours = 1;
                            if (glob.days > 0) {
                                glob.days--;
                                clock.set.days();
                            }
                        } else {
                            glob.hours++;
                        }
                        clock.set.hours();
                    } else {
                        glob.minutes++;
                    }
                    clock.set.minutes();
                } else {
                    glob.seconds++;
                }
                clock.set.seconds();
            },1000);
        },
         stop: function(){
            glob.minutes = 0;
            glob.seconds =0;
            clock.set.seconds();
            clock.set.minutes();
            $(".clock_minutes .val").text(0);
            $(".clock_seconds .val").text(0);
            if( typeof(cdown) !== 'undefined' ){
                clearInterval(cdown);
                cdown = null;
            }
        },
        pause: function(){
            clock.set.seconds();
            clock.set.minutes();
            if( typeof(cdown) !== 'undefined' ){
                clearInterval(cdown);
                cdown = null;
            }
        }
    }
       
    if (glob.startDate > 0) {
        if (glob.pause) {
            clock.pause();
        } else {
            clock.set.seconds();
            clock.set.minutes();
            clock.start();
        }
    } else {
        clock.stop();
    }
}