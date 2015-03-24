var global = Function("return this;")();
/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context.$

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules[identifier] || window[identifier]
    if (!module) throw new Error("Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules[name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else els = isFinite(s.length) ? s : [s]
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  aug(ender, {
      _VERSION: '0.3.6'
    , fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        return (r || document).querySelectorAll(s)
      }
  })

  aug(boosh, {
    forEach: function (fn, scope, i) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item and be able to return self
      for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
      // return self for chaining
      return this
    },
    $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);
// pakmanager:hydrate-promises/HydrateFromPromisesMixin
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
    var debug = function() {   
    };
    
    function CountDownLatch(counter, then) {
       this.signal = error => {
          if (counter > 0) {
             counter--;
          }
          if (error) {
             this.error = error;
          }
          if (counter === 0) {
             then(this.error);
          }
       }
    }
    
    var hydrateFromPromisesMixin = {
       hydrateFromPromises: function(promises, callback) {
          debug('hydrate', Object.keys(promises));
          let countDownLatch = new CountDownLatch(Object.keys(promises).length, err => {
             this.setState(this.state);
             if (callback) {
               callback(err); 
             }
          });
          Object.keys(promises).forEach(key => {
             try {
                promises[key]().then(data => {
                   debug('hydrate promise resolved', key);
                   this.state[key] = data;
                   countDownLatch.signal();
                }, error => {
                   debug('hydrate promise rejected', key, error);
                   countDownLatch.signal(error);
                });
             } catch (error) {
                debug('hydrate promise exception', key, error);
                countDownLatch.signal(error);  
             }
          });
       }
    };
    
    module.exports = HydrateFromPromisesMixin;
    
  provide("hydrate-promises/HydrateFromPromisesMixin", module.exports);
}(global));

// pakmanager:hydrate-promises
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
    
    exports.HydrateFromPromisesMixin =  require('hydrate-promises/HydrateFromPromisesMixin');
    
    
  provide("hydrate-promises", module.exports);
}(global));