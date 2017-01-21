export default {
    bind(el, binding) {
        const list = el.firstChild.classList;
        for (const key in binding.modifiers) {
            list.add(key);
        }
    }
}
