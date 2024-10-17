<script>
	import Board from './Board.svelte';
	import GameManager from './GameManager.svelte';
	import MenuScreen from './MenuScreen.svelte';
	import Instructions from './Instructions.svelte';
	import { game_state } from '../lib/stores'; // Import the store from the separate file
	import { get } from 'svelte/store'; // To get the current store value
	import EndScreen from './EndScreen.svelte';
</script>

<div class="background {$game_state == 2 || $game_state == 5 ? 'blue' : 'red'}" />
<h1>Stratego</h1>

{#if $game_state == 0}
	<MenuScreen />
{:else}
	<GameManager />
	<Instructions />
	<EndScreen />
{/if}

<style>
	.background {
		position: absolute;
		height: 100%;
		width: 100%;
		left: 0%;
		top: 0;
		transition: all .1s ease-out;
	}

	.blue {
		background-color: hsl(207, 7%, 33%);
	}

	.red {
		background-color: hsl(0, 5%, 33%);
	}
</style>
