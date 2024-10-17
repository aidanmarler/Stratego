<script lang="ts">
	'use strict';

	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { tick } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { shuffleArray } from '$lib/utils';
	import type { Piece } from '$lib/types';
	import {
		board_state,
		game_state,
		pieces_left_to_place,
		action_investigation,
		selectedSpacePos
	} from '../lib/stores';
	import PieceSelect from './PieceSelect.svelte';
	import GamePiece from './GamePiece.svelte';
	import { movePiece } from '$lib/piece_actions';
	import { placeRandomPieces_player, createPlayerPiece } from '$lib/piece_actions';

	// Game State logic
	let game_begin: boolean = false;

	type Space = {
		pos: number;
		type: string;
	};

	// Array to hold all items in the grid
	let spaces: Space[] = [];

	// Function to add grid squares to the array
	async function addGridSquare(i: number) {
		await tick(); // Wait for DOM to be ready for transitions
		spaces = [
			...spaces,
			{
				pos: i,
				type:
					i == 42 || i == 43 || i == 46 || i == 47 || i == 52 || i == 53 || i == 56 || i == 57
						? 'water'
						: 'land'
			}
		];
	}

	// On mount, create the board as 100 spaces
	onMount(async () => {
		await new Promise((resolve) => setTimeout(resolve, 50));
		game_begin = true;
		await new Promise((resolve) => setTimeout(resolve, 1000));
		for (let i = 0; i < 100; i++) {
			await new Promise((resolve) => setTimeout(resolve, 20));
			addGridSquare(i);
		}
	});

	let showPieceSelect: boolean = false; // bool to show popup or not
	let popupX = 0; // Popup pos x
	let popupY = 0; // Popup pos y

	let rand_started: boolean = false; // store if player random placement has been started

	// Add event listeners for keyboard controls
	onMount(() => {
		window.addEventListener('keydown', handleKeyPress);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyPress);
	});

	// SETUP -- STATE 1
	// Function to handle selecting a piece and showing the PieceSelect popup
	function SelectPiece(spacePos: number) {
		if (spacePos > 59 && $game_state == 1 && $board_state[spacePos] == null) {
			if ($selectedSpacePos == spacePos) {
				// Unselect
				showPieceSelect = false;
				$selectedSpacePos = null;
			} else {
				// Store the clicked space ID
				$selectedSpacePos = spacePos;
				// Get the DOM element of the space by using `querySelector` or `getBoundingClientRect`
				const element = document.querySelector(`#space-${spacePos}`);
				if (element) {
					const rect = element.getBoundingClientRect();
					popupX = rect.left + window.scrollX;
					popupY = rect.top + window.scrollY; // Position popup above the selected space
					// Show the PieceSelect component, unless placing them randomly
					if (!rand_started) {
						showPieceSelect = true;
					}
				}
			}
		}
	}

	// Function to handle when a piece is selected in PieceSelect and close the popup
	function handlePieceSelected(piece: any) {
		// Close the PieceSelect popup after a selection
		// come back!!! - understand where it comes from and what it is:
		//console.log('handlePieceSelected', piece);
		createPlayerPiece(piece.detail);
		//showPieceSelect = false;
		//electedSpaceId = null; // Reset the selected space after piece selection
		// once piece placed, find next recommended space // come back! change this to be more intuitive than just showing next space to right. Sometimes you want up, down, left, or right.
		findNextAvailableSpace();
	}

	// Function to find the next available space for placing a piece
	function findNextAvailableSpace() {
		let index = 59;
		if ($selectedSpacePos != null) {
			index = $selectedSpacePos;
		}
		//console.log('index', index);
		// Search from the current selectedSpacePos upwards to 99
		for (let i = index + 1; i < 100; i++) {
			if ($board_state[i] == null) {
				//console.log('found', i);
				SelectPiece(i);
				return;
			}
		}

		// If no space found, search from 60 to selectedSpaceId
		for (let i = 60; i < index; i++) {
			if ($board_state[i] == null) {
				//console.log('found', i);
				SelectPiece(i);
				return;
			}
		}

		// If no empty space found, hide the piece selection popup
		showPieceSelect = false;
		selectedSpacePos.set(null);
	}

	// Function to handle key presses when the PieceSelect is open
	function handleKeyPress(event: KeyboardEvent) {
		if ($game_state == 1) {
			/*if (event.key === 'Tab') {
				event.preventDefault();
                console.log("handle key press", selectedSpaceId)
				findNextAvailableSpace();
			}*/
			if (event.key === 'Tab') {
				event.preventDefault();
			}
			if (event.key === 'r') {
				if (!rand_started) {
					showPieceSelect = false;
					selectedSpacePos.set(null);
					placeRandomPieces_player();
				}
			}
		}
		if (!showPieceSelect) {
			if (event.key === 'Tab') {
				findNextAvailableSpace();
			}
		} else {
			if ($selectedSpacePos != null && $selectedSpacePos != undefined) {
				if (event.key === 'Tab') {
					SelectPiece($selectedSpacePos);
				}
				if (event.key === 'ArrowUp') {
					if ($selectedSpacePos - 10 < 100 && $selectedSpacePos - 10 > 59) {
						//selectedSpaceId = selectedSpaceId - 10;
						SelectPiece($selectedSpacePos - 10);
					}
				} else if (event.key === 'ArrowDown') {
					//console.log('down');
					if ($selectedSpacePos + 10 < 100 && $selectedSpacePos + 10 > 59) {
						//selectedSpaceId = selectedSpaceId + 10;
						SelectPiece($selectedSpacePos + 10);
					}
				} else if (event.key === 'ArrowLeft') {
					if ($selectedSpacePos - 1 < 100 && $selectedSpacePos - 1 > 59) {
						//selectedSpaceId = selectedSpaceId - 1;
						SelectPiece($selectedSpacePos - 1);
					}
				} else if (event.key === 'ArrowRight') {
					if ($selectedSpacePos + 1 < 100 && $selectedSpacePos + 1 > 59) {
						//selectedSpaceId = selectedSpaceId + 1;
						SelectPiece($selectedSpacePos + 1);
					}
				}
			} else {
				throw new Error();
			}
		}
	}

	function boardLeave(event: any) {
		return
		//console.log(event);
		showPieceSelect = false;
		selectedSpacePos.set(null);
		action_investigation.set({
			moving_piece: null,
			target_piece: null,
			spaces: [],
			attackable: []
		});
	}

	async function spaceClicked(space: any) {
		if ($game_state == 1) {
			SelectPiece(space.pos);
		} else if ($game_state == 2) {
			// Check if the clicked space is in the movement investigation's valid spaces
			if ($action_investigation.spaces.includes(space.pos)) {
				// Move the piece to the selected space
				if ($action_investigation.moving_piece != null) {
					movePiece($action_investigation.moving_piece, space.pos);
					await new Promise((resolve) => setTimeout(resolve, 50));
					game_state.set(3);
				} else {
					throw new Error();
				}
			}
		}
	}
</script>

{#if game_begin}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		id="game_board"
		class="grid"
		on:mouseleave={(event) => boardLeave(event)}
		in:fly={{ x: 1000, duration: 300, opacity: 0, easing: cubicOut }}
		out:fly={{ x: -1000, duration: 500, opacity: 0, easing: cubicOut }}
	>
		{#each spaces as space (space.pos)}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				id="space-{space.pos}"
				class="{space.type === 'land' ? 'grid-land' : 'grid-water'} 
                    {space.pos === $selectedSpacePos ? 'selected' : ''} 
                    {space.pos > 59 && $game_state == 1 && $board_state[space.pos] == null
					? 'selectable'
					: ''}
					{$action_investigation.spaces.includes(space.pos) ? 'movement_investigation' : ''}
					{$action_investigation.attackable.includes(space.pos) ? 'attack_investigation' : ''}"
				on:click={() => spaceClicked(space)}
				transition:fly={{ y: -50, duration: 100, opacity: 0, easing: cubicIn }}
			></div>
		{/each}

		<!-- Render the pieces -->
		{#each $board_state as piece}
			<!-- Come Back!!! Style with left and top getting x and y - make a funciton to calculate and get it from pos -->
			<!-- I tried and failed with: style="top: {calc_piece_x_pos(piece)}px; left: {calc_piece_x_pos(piece)}px;"-->
			{#if piece != null}
				<div
					class="game_piece"
					style="grid-column: {(piece.pos % 10) + 1}; grid-row: {Math.floor(piece.pos / 10) + 1};"
					in:fly={{ y: -800, duration: 400, opacity: 100, easing: cubicIn }}
					out:fly={{ y: 100, duration: 200, opacity: 0, easing: cubicIn }}
				>
					<GamePiece {piece} />
				</div>
			{/if}
		{/each}
	</div>
{/if}

{#if showPieceSelect}
	<div
		class="popup"
		style="top: {popupY}px; left: {popupX}px;"
		transition:fly={{ y: 300, duration: 200, opacity: 0, easing: cubicIn }}
	>
		<PieceSelect on:pieceSelected={handlePieceSelected} />
	</div>
{/if}

<style>
	.grid {
		display: grid;
		position: absolute;
		gap: 0.2vh;
		z-index: 0;
		background-color: hsl(0, 0%, 70%);
		border-style: solid;
		border-width: 0.5vh;
		border-color: hsl(0, 0%, 70%);
		padding: 1vh;
		width: 80vh;
		height: 80vh;
		grid-template-columns: repeat(10, 1fr); /* 10 equal-width columns */
		grid-template-rows: repeat(10, 1fr);
		border-radius: 0vh;
		transform: translate(0%, -50%);
		left: 14vh;
		top: 50%;
		box-shadow: 0.8vh 0.8vh 0vh 0vh rgb(0, 0, 0);
		transition: all 0.3s ease; /* Smooth transition for the entire board */
	}

	:global(.grid-land) {
		background-color: hsl(135, 18%, 22%);
		border-radius: 0vh;
		padding: 0.6vh;
		box-shadow: 0vh 0vh rgba(0, 0, 0, 1);
		transition: all 0.1s;
		z-index: 0.5;
	}

	:global(.grid-water) {
		background-color: hsl(221, 54%, 28%);
		box-shadow: -0.2vh -0.2vh 0vh 0.2vh hsl(221, 54%, 0%); /* Shadow moves downward */
		transform: translate(0.2vh, 0.2vh) scale(0.93);
		z-index: 0.5;
	}

	/* Hover effect for water tiles (Sink-in) */
	.selectable {
		cursor: pointer;
	}

	/* Hover State */
	.selected,
	.selected:hover,
	.selectable:hover {
		background-color: hsl(135, 38%, 50%);
		box-shadow:
			0.2vh 0.2vh 0vh 0.1vh rgba(0, 0, 0, 1),
			0vh 0vh 0vh 0vh rgba(0, 0, 0, 1); /* Same as hover */
		transform: translate(-0.3vh, -0.3vh); /* Maintain popped position */
	}

	/* Selected State */
	.selected,
	.selected:hover {
		outline-style: dashed;
		outline-offset: 0.2vh;
		outline-width: 0.4vh;
		outline-color: rgb(255, 255, 255);
	}

	.popup {
		position: absolute;
		z-index: 1000;
		height: max-content;
		width: auto;
		transition: all 0.3s ease; /* Smooth transition for the popup */
	}

	.game_piece {
		z-index: 1000;
		position: absolute;
	}

	.movement_investigation,
	.attack_investigation {
		background-color: hsl(135, 38%, 50%);
		box-shadow:
			0.2vh 0.2vh 0vh 0.1vh rgba(0, 0, 0, 1),
			0vh 0vh 0vh 0vh rgba(0, 0, 0, 1); /* Same as hover */
		transform: translate(-0.3vh, -0.3vh); /* Maintain popped position */
	}

	.movement_investigation:hover {
		background-color: hsl(135, 38%, 60%);
		box-shadow:
			0.2vh 0.2vh 0vh 0.1vh rgba(0, 0, 0, 1),
			0.6vh 0.6vh 0vh 0vh rgba(0, 0, 0, 1); /*0.5vh 0.4vh 0vh .4vh rgba(0, 0, 0, .5);  Same as hover */
		transform: translate(-0.6vh, -0.6vh); /* Maintain popped position */
		cursor: pointer;
	}
</style>
