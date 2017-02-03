(function() {
       this.Invoke = function(){
        
        var p = io;
        var w = window;
        var l = w.location;
        var defaults =  {
         u : '',
         id : '',
         url : 'http://localhost:3000',
         v : '',
         s: '',
         t: l.href,
         p: false
        };
        if (arguments[0] && typeof arguments[0] === "object") {
           this.options = extendDefaults(defaults, arguments[0]);
         }
        var _that = this;
        t = 
        this.options.s = p.connect(this.options.url);
        this.g();
        this.options.s.on('connect', function(){
         that.options.s.emit('adduser', that.options.u,_that.options.v);
        });
        this.track();
       }
       
       function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
          if (properties.hasOwnProperty(property)) {
         source[property] = properties[property];
          }
        }
        return source;
         }
       
       Invoke.prototype.start= function(){
        this.options.p = true;
       }
       Invoke.prototype.halt= function(){
        this.options.p = false;
       }
       Invoke.prototype.g = function(){
        var text = "";
        var text2 = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 6; i++ )
         text += possible.charAt(Math.floor(Math.random() * possible.length));
  
        for( var i=0; i < 6; i++ )
         text2 += possible.charAt(Math.floor(Math.random() * possible.length));
        
        this.options.u = this.options.u + "-" + text+"-"+this.options.id+"-"+text2;
        
       }
       Invoke.prototype.track = function(){
        var _that = this;
        setInterval(function(){
        var data = {client_id :_that.options.id,vendor_id:_that.options.v,video_url:_that.options.t,start_time:Date.now(),view_time:1};
        if(_that.options.p==true)
        {
         _that.options.s.emit('__track', data);
        }},1000); 
       }
      }());
	 