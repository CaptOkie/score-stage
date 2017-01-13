<template>
	<md-card class="md-flex" v-watch.width="onWidthChange">
		<md-card-content>
			<p>Test card component width</p>
		</md-card-content>
	</md-card>
</template>

<script>
	import '../../proxies/mdCard'
	import '../../directives/watch'

	export default {
		name : 'ss-music-score',
		methods : {
			onWidthChange(data) {
				console.log(data.newWidth, data.oldWidth);
			}
		}
	}
</script>