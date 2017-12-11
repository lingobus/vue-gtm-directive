/* globals Vue */
Vue.directive('gtag', {
  bind: function (el, binding, vnode) {
    init()

    // collect arguments
    const vattrs = vnode.data.attrs || {}
    const data = binding.value
    // event
    if (act === 'event') {
      data = {"event": vnode.data.attrs['event-name'], ...value}
    }

    const triggerEvent = vattrs['trigger-event'] || 'click'
    const beforeSend = vattrs['before-send'] || noop
    const afterSend = vattrs['after-send'] || noop

    // add event listener
    el.addEventListener(triggerEvent, e => {
      const ret = beforeSend(e, el, binding, vnode)
      if (ret === false) {
        // cancel calling gtag if beforeSend return false
        return
      } else if (ret && typeof ret.then === 'function') {
        // beforeSend returns a promise
        ret.then(_ => {
          gtag(data, _)
          afterSend(e, el, binding, vnode)
        }).catch(_ => _)
      } else {
        // otherwise, call gtag right away
        gtag(data, binding.value)
        afterSend(e, el, binding, vnode)
      }
    })
  }
})

function noop() { }

/**
 * create stub if gtm.js is not loaded
 */
function init() {
  const w = window
  if (w.gtag) return
  w.dataLayer = w.dataLayer || []
  w.gtag = function () {
    w.dataLayer.push(arguments)
  }
}