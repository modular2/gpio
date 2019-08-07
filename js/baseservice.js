var flg=1;
var outgoing_id=0;
var led1_state=false;
var led2_state=false;
var led1_flipflop_state=false;
var led2_flipflop_state=false;
var interruptin_state=false;
var board;
var path;
var flipflop_interval1,flipflop_interval2;
 $( document ).ready(function() {
        $("[name='checkbox1']").bootstrapSwitch({
          onSwitchChange: function(e, state) {
          
      }
        });
        $("[name='checkbox2']").bootstrapSwitch({
          onSwitchChange: function(e, state) {
              var val=0;
              if (state) val=1;
            board=parseInt($('#board').val());
            path="000/00"+board+"/001";
            digitalWrite(path,val);
      }
        });
        $("[name='checkbox3']").bootstrapSwitch({
          onSwitchChange: function(e, state) {
              if (state)
              { 
            board=parseInt($('#board').val());
            path="000/00"+board+"/001";
            flipflop_interval1 =  setInterval(function(){
                digitalFlipFlop(path);
             },500); 
            } else
            clearInterval(flipflop_interval1);      
      }
        });
        $("[name='checkbox4']").bootstrapSwitch({
          onSwitchChange: function(e, state) {
            var val=0;
            if (state) val=1;
          board=parseInt($('#board').val());
          path="000/00"+board+"/001";
          digitalWrite(path,val);
      }
        });
        $("[name='checkbox5']").bootstrapSwitch({
          onSwitchChange: function(e, state) {
            if (state)
            { 
          board=parseInt($('#board').val());
          path="000/00"+board+"/001";
          flipflop_interval2 =  setInterval(function(){
              digitalFlipFlop(path);
           },500); 
          } else
          clearInterval(flipflop_interval2);    
      }
        });
        $("[name='checkbox6']").bootstrapSwitch({
            onSwitchChange: function(e, state) {
         console.log(state);
        }
          });
        window.restbed = { ws: null };
        openIOsocket();  
    })
    function openIOsocket()
    {
        if ( "WebSocket" in window )
        {
           var ws = new WebSocket( "ws://192.168.31.98:2019/iosocket/0234" );
           ws.binaryType = "arraybuffer";
           ws.onopen = function( )
           {
             // add_message( "Established connection." );
            setInterval(function(){
              if (window.restbed.ws.readyState  == window.restbed.ws.OPEN)
             {
               var jsonrpc={
                 "method":"ping",
                 "id": 0
               }
                 window.restbed.ws.send(JSON.stringify(jsonrpc));
            }
            },1500);
             // toggle_control_access( );
           };

           ws.onmessage = function( evt )
           {
             //add_message( evt.data );
          var eventMessage  = new Uint8Array(evt.data);
           var s = new TextDecoder("utf-8").decode(eventMessage);
         
          var messageBody=JSON.parse(s);
       // console.log(messageBody);
          if ("method" in messageBody)
           {
                  
                     if (messageBody.method=="interruptin")
                       {
                       if (flg==1)
                           { $("#led").css("background-color","blue");flg=0;}
                             else 
                           {  $("#led").css("background-color","red");flg=1;};
                       } else
                       if (messageBody.method=="welcome")  
                       { 
                       console.log("ws connected");
                       }

           };            
          if ("result" in messageBody)
          {        
                   var  result=messageBody.result;
                //  console.log(messageBody);
                   if (result.status=="err")
                   {
                     
                     console.log("error with Code: "+result.value[0]);
                   }
                    else
             if (result.status=="interruptin.start")
             {
               if (flg==1)
                  { $("#led").css("background-color","blue");flg=0;}
                   else 
                 {  $("#led").css("background-color","red");flg=1;};
             }
             else
              if (result.status=="OK")
             {
                measurment();
               if ("value" in result)
              $("#result").html("600+2="+result.value[0]);
             }
          } 
           }
           ws.onclose = function( evt )
           {
          console.log("connection closed with Code:"+evt.code);
           };

           ws.onerror = function( evt )
           {
             // add_message( "Error: socket connection interrupted." );
           };

           window.restbed.ws = ws;
        }
        else
        {
           alert( "WebSockets NOT supported by your Browser!" );
        }
     }
     function get_outgoing_id()
     {
       outgoing_id++;
       if (outgoing_id>5000) outgoing_id=0;
       return outgoing_id;
     }
     function led_control(index)
     {
         var path=""
     }
     function digitalWrite(path,val)
     { 
       
       var jsonrpc={
                 "method":"digitalOut.write",
                 "mode":1,
                 "path":path,
                 "params":{"value":[val]},
                 "id": get_outgoing_id()
               }
             console.log(jsonrpc);
        window.restbed.ws.send(JSON.stringify(jsonrpc));
      
     }
     function digitalFlipFlop(path)
     { 
     
       var jsonrpc={
     "method":"digitalOut.flipflop",
     "mode":1,
     "path":path,
     "params":{"value":[0]},
     "id": get_outgoing_id()
    }
        // console.log(jsonrpc);
         window.restbed.ws.send(JSON.stringify(jsonrpc));
        
     }
     function startInterruptin_ws(mode,path)
     { 
       console.log("send to socket message");
       var jsonrpc={
                 "method":"interruptin.start",
                 "mode":mode,
                 "path":path,
                 "params":{"value":[1]},
                 "id": get_outgoing_id()
               }
           //    console.log(jsonrpc);
        window.restbed.ws.send(JSON.stringify(jsonrpc));
     }
     function closeIOsocket()
      {
         window.restbed.ws.close( );
      }