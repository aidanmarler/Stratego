<script lang="ts">
	'use strict';
	import { onMount } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { game_state } from '../lib/stores';

	let title = '';
	let title_contents = '';
	let main = '';
	let main_contents = '';
	let show_title = false;
	let show_main = false;
	let currentController: AbortController | null = null; // Track the current controller

	function sleep(ms: number, signal?: AbortSignal): Promise<void> {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(resolve, ms);
			signal?.addEventListener('abort', () => {
				clearTimeout(timeout);
				reject();
			});
		});
	}

	async function WriteInstructions(state: number) {
		// Cancel the previous call if it exists
		if (currentController) {
			currentController.abort();
		}

		// Create a new controller for this instance
		currentController = new AbortController();
		const { signal } = currentController;

		try {
			// Reset contents for the new instructions
			title_contents = '';
			main_contents = '';
			show_title = false;
			show_main = false;

			if (state === 1) {
				title = 'Step 1';
				main = 'Arrange your army by selecting on squares and assigning a troop choice.';
			} else if (state === 2) {
				title = 'Your Turn';
				main = 'Make a move - move one troop to an open space or attack an enemy troop.';
			} else if (state === 3) {
				title = "Opponent's turn";
				main = 'Wait for opponent to make a move.';
			}

			// Run the instructions asynchronously with cancellation support
			await sleep(50, signal);
			show_title = true;
			await sleep(200, signal);
			for (let i = 0; i < title.length; i++) {
				await sleep(80, signal);
				title_contents += title[i];
			}
			await sleep(300, signal);
			show_main = true;
			await sleep(800, signal);
			for (let i = 0; i < main.length; i++) {
				await sleep(40, signal);
				main_contents += main[i];
			}
		} catch (error) {}
	}

	onMount(() => {
		//WriteInstructions();
	});

	// Reactive statement to watch when game_state changes to 2
	$: if ($game_state === 1) {
		WriteInstructions(1);
	} else if ($game_state === 2) {
		WriteInstructions(2);
	} else if ($game_state === 3) {
		WriteInstructions(3);
	}
</script>

<div class="container">
	<div
		class="box"
		in:fly={{ delay: 500, x: 1000, duration: 500, opacity: 0, easing: cubicOut }}
		out:fly={{ x: -1000, duration: 500, opacity: 0, easing: cubicOut }}
	>
		<div class="title">
			{title_contents}
		</div>
		<div class="contents">
			{main_contents}
		</div>
	</div>
</div>

<style>
	.container {
		position: absolute;
		border-width: 0.5vh;
		border-color: hsl(0, 0%, 70%);
		height: 83vh;
		transform: translate(0%, -50%);
		right: 10vh;
		left: calc(14vh + 80vh + 12vh);
		top: 50%;
		background-color: rgba(0, 255, 255, 0);
	}

	.box {
		height: 30vh;
		position: absolute;
		font-family: 'Courier New', Courier, monospace;
		text-align: left;
		right: 0;
		left: 0;
		top: 3vh;
		padding: 5vh;
		background-color: hsl(0, 0%, 80%);
		box-shadow: 0.8vh 0.8vh hsl(0, 0%, 0%);
		border-style: solid;
		border-width: 0.5vh;
		border-color: hsl(0, 0%, 80%);
		color: hsl(0, 0%, 0%);
	}

	.title {
		font-size: 6vh;
		padding-bottom: 2vh;
	}

	.container {
		font-size: 2.5vh;
	}
</style>
