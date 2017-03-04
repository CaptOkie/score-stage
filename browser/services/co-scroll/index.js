import './index.css';

const cl = 'co-disable-scroll';

export default {
    disable() {
        const html = document.documentElement;
        if (html.offsetHeight > window.innerHeight) {
            const body = document.body;
            let top = -(html.scrollTop || body.scrollTop);
            html.style.top = top + 'px';
            html.classList.add(cl);
        }
    },
    enable() {
        const html = document.documentElement;
        if (html.classList.contains(cl)) {
            const body = document.body;
            let top = -parseInt(html.style.top);
            html.classList.remove(cl);
            html.scrollTop = body.scrollTop = top;
        }
    }
}