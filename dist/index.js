/* globals Vue */
Vue.directive('gtag', {
  bind: function bind(el, binding, vnode) {
    init();

    // collect arguments
    var vattrs = vnode.data.attrs || {};
    var data = binding.value;
    var triggerEvent = vattrs['trigger-event'] || 'click';
    var beforeSend = vattrs['before-send'] || noop;
    var afterSend = vattrs['after-send'] || noop;

    // add event listener
    el.addEventListener(triggerEvent, function (e) {
      var ret = beforeSend(e, el, binding, vnode);
      if (ret === false) {
        // cancel calling gtag if beforeSend return false
        return;
      } else if (ret && typeof ret.then === 'function') {
        // beforeSend returns a promise
        ret.then(function (_) {
          gtag(data, _);
          afterSend(e, el, binding, vnode);
        }).catch(function (_) {
          return _;
        });
      } else {
        // otherwise, call gtag right away
        gtag(data, binding.value);
        afterSend(e, el, binding, vnode);
      }
    });
  }
});

function noop() {}

/**
 * create stub if gtm.js is not loaded
 */
function init() {
  var w = window;
  if (w.gtag) return;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    w.dataLayer.push(data);
  };
}