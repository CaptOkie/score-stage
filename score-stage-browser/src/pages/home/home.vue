<template>
	<div id="home">
		<md-toolbar>
			<h2 class="md-title">Home</h2>
		</md-toolbar>

		<md-layout md-row>
			<md-layout md-flex="15" md-hide-small md-hide-xsmall></md-layout>
			<md-layout md-flex="70" md-flex-small="100" md-flex-xsmall="100" class="md-padding">
				<ss-music-score></ss-music-score>
			</md-layout>
			<md-layout md-flex="15" md-hide-small md-hide-xsmall></md-layout>
		</md-layout>
	</div>
</template>

<script>
import 'Proxies/mdToolbar';
import 'Proxies/mdLayout';
import ssMusicScore from 'Components/ss-music-score';

export default {
	name : 'home',
	components : {
		ssMusicScore
	}
}
</script>

<style>
body {
	overflow-y: scroll;
}
</style>