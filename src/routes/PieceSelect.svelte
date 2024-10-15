<script lang="ts">
	'use strict';
	
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { pieces_left_to_place } from '../lib/stores'; // Import the store from the separate file
	import { get } from 'svelte/store'; // To get the current store value

	const dispatch = createEventDispatcher();

	// Use reactive declaration to store possible pieces
	$: possible_pieces = Object.keys($pieces_left_to_place);

	// Function to handle selecting a piece
	function selectPiece(type: any) {
		// Get the current pieces value from the store
		let pieces = get(pieces_left_to_place);

		// Only update if there are pieces left to place
		if (pieces[type] > 0) {
			// Update the value in the store
			pieces_left_to_place.update((currentPieces) => {
				currentPieces[type] -= 1;
				return currentPieces;
			});

			//console.log('a ', get(pieces_left_to_place)[piece]); // Get updated value for debugging
			dispatch('pieceSelected', type); // Emit the selected piece event
		} else {
			console.log(`No more ${type} pieces left to place`);
		}
	}

	// Add event listeners for keyboard controls
	onMount(() => {
		window.addEventListener('keydown', handleKeyPress);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyPress);
	});

	// Function to handle key presses when the PieceSelect is open
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key >= '1' && event.key <= '9') {
			selectPiece(event.key);
		} else if (event.key === '0') {
			selectPiece('10');
		} else if (event.key === 'b') {
			selectPiece('bomb');
		} else if (event.key === 'f') {
			selectPiece('flag');
		}
	}
</script>

<div class="pop_up">
	<div class="grid-container">
		{#each possible_pieces as type}
			{#if $pieces_left_to_place[type] > 0}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="grid-item" on:click={() => selectPiece(type)}>
					{type} ({$pieces_left_to_place[type]})
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.pop_up {
		position: absolute;
		align-items: center;
		background-color: rgba(0, 0, 0, 0);
		transform: translate(-50%, 0%);
		padding: 0vh;
		left: 3.9vh;
		bottom: 1vh;
		width: 10vh;
		height: auto;
		border: none;
		transition: all 0.2s;
	}

	.grid-item {
		cursor: pointer;
		text-align: center;
		padding: 0.5vh;
		border: 0vh solid black;
		background-color: rgba(188, 188, 188, 1);
		margin: 0.4vh;
		font-family: monospace;
		font-size: 1.5vh;
		box-shadow: 0.3vh 0.3vh rgba(0, 0, 0, 1);
	}

	.grid-item:hover {
		background-color: rgb(255, 255, 255);
		box-shadow: 0.6vh 0.6vh rgba(0, 0, 0, 1);
		transform: translate(-0.3vh, -0.3vh);
	}
</style>
