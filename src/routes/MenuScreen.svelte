<script lang="ts">
	import { onMount } from 'svelte';
	import { game_state } from '../lib/stores';
	import { cubicIn, cubicInOut, cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	let title = 'Stratego';
	let title_contents = '';
	let button = 'Play';
	let button_contents = '';
	let show_title = false;
	let show_button = false;

	onMount(async () => {
		await new Promise((resolve) => setTimeout(resolve, 50));
		show_title = true;
		await new Promise((resolve) => setTimeout(resolve, 200));
		for (let i = 0; i < title.length; i++) {
			await new Promise((resolve) => setTimeout(resolve, 80));
			title_contents += title[i];
		}
		await new Promise((resolve) => setTimeout(resolve, 300));
		show_button = true;
		await new Promise((resolve) => setTimeout(resolve, 800));
		for (let i = 0; i < button.length; i++) {
			await new Promise((resolve) => setTimeout(resolve, 40));
			button_contents += button[i];
		}
	});

	function BeginGame() {
		show_button = false;
		show_title = false;
		(async () => {
			await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 100ms
			game_state.set(1); // Set game state after delay
		})();
	}
</script>

{#if show_title}
	<h1
		class="Title"
		in:fly={{ y: 1000, delay: 200, duration: 200, opacity: 100, easing: cubicOut }}
		out:fly={{ y: -1000, duration: 200, opacity: 100, easing: cubicIn }}
	>
		{title_contents}
	</h1>
{/if}
{#if show_button}
	<button
		class="play_button"
		in:fly={{ y: 1000, duration: 500, opacity: 100, easing: cubicOut }}
		out:fly={{ y: -1000, duration: 200, opacity: 100, easing: cubicIn }}
		on:click={() => {
			BeginGame();
		}}>{button_contents}</button
	>
{/if}

<style>
	.Title {
		position: absolute;
		font-family: 'Courier New', Courier, monospace;
		font-size: 10vh;
		text-align: center;
		align-items: center;
		align-content: center;
		transform: translate(-50%, 0%);
		left: 50%;
		top: 20%;
		height: 40vh;
		width: 80vh;
		background-color: hsl(0, 0%, 80%);
		box-shadow: 1vh 1vh hsl(0, 0%, 0%);
		border-style: none;
		color: hsl(0, 0%, 0%);
	}

	.play_button {
		position: absolute;
		font-family: 'Courier New', Courier, monospace;
		font-size: 7vh;
		font-weight: 500;
		left: 50%;
		top: calc(50% + 20vh);
		width: 30vh;
		height: 10vh;
		background-color: hsl(0, 0%, 70%);
		box-shadow: 0.8vh 0.8vh rgb(0, 0, 0);
		border-style: solid;
		border-width: 0.5vh;
		border-color: hsl(0, 0%, 70%);
		cursor: pointer;
		color: hsl(0, 0%, 0%);
		transform: translate(-50%, 0%);
	}

	.play_button:hover,
	.play_button:focus {
		background-color: hsl(0, 0%, 100%);
		border-color: hsl(0, 0%, 100%);
		box-shadow: 1.3vh 1.3vh rgb(0, 0, 0);
		transition: all 0.1s;
		transform: translate(calc(-50% - 0.5vh), -0.5vh);
	}

	.play_button:focus {
		outline-style: dashed;
		outline-offset: 0.3vh;
		outline-width: 0.3vh;
		outline-color: rgb(255, 255, 255);
	}

	@keyframes MoveUpDown {
		0%,
		100% {
			top: calc(50% + 40vw);
		}
		50% {
			top: calc(50% + 42vw);
		}
	}

	/* Small screens or mobile (portrait mode) */
	@media (orientation: portrait) {
		.Title {
			top: 10vh;
			font-size: 15vw;
			height: 70vw;
			width: 90vw;
			box-shadow: 3vw 3vw hsl(0, 0%, 0%);
			left: calc(50% - 1vw);
		}

		.play_button {
			top: calc(50% + 20vw);
			animation: MoveUpDown 2s linear infinite;
			position: absolute;
			font-size: 18vw;
			font-weight: bold;
			height: 30vw;
			width: 70vw;
			box-shadow: 3vw 3vw hsl(0, 0%, 0%);
		}
	}
</style>
