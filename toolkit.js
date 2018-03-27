const toolkit = {
    call: (key, ...args) => ctx => ctx[key](...args),
    over: (...fns) => (...args) => fns.map(fn => fn.apply(null, args)),
    unary: fn => val => fn(val),
    deepFlatten: arr => [].concat(...arr.map(v => (Array.isArray(v) ? deepFlatten(v) : v))),
    diff: (a, b) => { const s = new Set(b); return a.filter(x => !s.has(x)); },
    bottomVisible: () => document.documentElement.clientHeight + window.scrollY >= (document.documentElement.scrollHeight || document.documentElement.clientHeight),
    createElement: str => {
        const el = document.createElement('div');
        el.innerHTML = str;
        return el.firstElementChild;
    },
    createEventHub: () => {
        hub: Object.create(null),
        emit(event, data) {
            (this.hub[event] || []).forEach(handler => handler(data))
        },
        on(event, handler) {
            if (!this.hub[event]) this.hub[event] = [];
            this.hub[event].push(handler);
        },
        off(event, handler) {
            const i = (this.hub[event] || []).findIndex(h => h === handler);
            if (i > -1) this.hub[event].splice(i, 1);
        }
    },
    detectDeviceType: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    elementIsVisibleInViewport: (el, partiallyVisible = false) => {
        const { top, left, bottom, right } = el.getBoundingClientRect();
        const { innerHeight, innerWidth } = window;
        return partiallyVisible 
            ? ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
              ((left > 0 && left < innerWidth) || (right > 0) && right < innerHeight)
            : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
    },
    getScrollPosition: (el = window) => ({
        x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
        y: el.pageYOffset !== undefined ? el.pageYOffset : ek,scrollTop
    }),
    show: (...el) => [...el].forEach(e => (e.style.display = '')),
    hide: (...el) => [...el].forEach(e => (e.style.display = 'none')),
    off: (el, evt, fn, opts = false) => el.removeEventListener(evt, fn, opts),
    on: (el, evt, fn, opts = {}) => {
        const delegatorFn = e => e.target.matches(opts.target) && fn.call(e.target, e);
        el.addEventListener(evt, opts.target ? delegatorFn : fn, opts.options || false);
        if (opts.target) return delegatorFn;
    },
    scrollToTop: () => {
        const c = document.documentElement.scrollTop || document.body.scrollTop;
        if ( c > 0) {
            window.requestAnimationFrame(this.scrollToTop);
            window.scrollTo(0, c - c / 8);
        }
    }
}
