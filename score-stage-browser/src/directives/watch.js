import Vue from 'vue';

Vue.directive('watch', {
	bind(el, binding) {
		let checkWidth = binding.modifiers.width;
		let checkHeight = binding.modifiers.height;
		if (!checkWidth && !checkHeight) {
			checkWidth = checkHeight = true;
		}
		let width = el.offsetWidth;
		let height = el.offsetHeight;

		function watch() {
            if (el.dataset.watchCancel) {
                return;
            }
            
            const newWidth = el.offsetWidth;
            const newHeight = el.offsetHeight;
            if ((checkWidth && newWidth !== width) || (checkHeight && newHeight !== height)) {
                binding.value({ oldWidth : width, newWidth, oldHeight : height, newHeight });
                width = newWidth;
                height = newHeight;
            }
            requestAnimationFrame(watch);
        }
        requestAnimationFrame(watch);
	},
	unbind(el) {
		el.dataset.watchCancel = true;
	}
});