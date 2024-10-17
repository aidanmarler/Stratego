<script lang="ts">
	'use strict';
	import { onMount } from 'svelte';
	import {
		board_state,
		game_state,
		action_investigation,
		ComputerPossibleActions,
		red_piece_combat,
		turn_count
	} from '../lib/stores';
	import { AttackPiece } from '$lib/piece_actions';
	import type { Piece, Action } from '../lib/types';
	import { wait } from '$lib/utils';

	export let piece: Piece;
	$: piece_contents = ['', ' ', ' '];

	function updateContents(hidden: boolean) {
		if (!hidden) {
			piece_contents = ['', ' ', ' '];
			if (piece.type == 'bomb') {
				piece_contents[0] = '☠';
			} else if (piece.type == 'flag') {
				piece_contents[0] = '⚑';
			} else if (piece.type == '1') {
				piece_contents[0] = '👁';
				piece_contents[1] = '1';
			} else if (piece.type == '2') {
				piece_contents[0] = '🡅';
				piece_contents[1] = '2';
			} else if (piece.type == '3') {
				piece_contents[0] = '⛏';
				piece_contents[1] = '3';
			} else {
				piece_contents[0] = piece.type;
			}
		} else {
			piece_contents = [' ', ' ', '⚔'];
		}
	}

	let possible_movements: number[] = []; // this holds spaces/positions
	let possible_attacks: number[] = []; // this holds spaces/positons
	const water_tiles: number[] = [42, 43, 46, 47, 52, 53, 56, 57];

	// function to search for possible places to move from current space // COME BACK - this is bad for scout and deserves an update upon 10/11 fixes
	function SearchForPossibleMoves(spaceId: number, type: string) {
		const directions = {
			forwards: -10,
			backwards: 10,
			left: -1,
			right: 1
		};

		// Recursive function to check for open spaces
		function check_space(space: number, direction: number) {
			// Stop if the space is invalid (out of bounds, non-empty, or a water tile)
			if ($board_state[space] !== null) {
				if ($board_state[space].player == !piece.player) {
					possible_attacks.push(space);
					if (!piece.player) {
						//console.log('pushing attack:', $board_state[space]);
						ComputerPossibleActions.update((currentActions) => {
							const updatedActions = [...currentActions]; // Make a copy of the array
							const newAction: Action = { piece: piece, type: 1, aimed_pos: space }; // error defining action type
							updatedActions.push(newAction);
							return updatedActions; // Return the updated board
						});
					}
				}
				return;
			}
			if (
				space < 0 ||
				space >= 100 ||
				$board_state[space] !== null ||
				water_tiles.indexOf(space) !== -1
			) {
				return;
			}

			possible_movements.push(space);
			// Add the valid space to possible movements
			if (!piece.player) {
				//console.log('pushing movement:', $board_state[space]);
				ComputerPossibleActions.update((currentActions) => {
					const updatedActions = [...currentActions]; // Make a copy of the array
					const newAction: Action = { piece: piece, type: 0, aimed_pos: space }; // error defining action type
					updatedActions.push(newAction);
					return updatedActions; // Return the updated board
				});
			}

			// If the type is '2', recursively check in the same direction
			if (type === '2') {
				if (direction == directions.forwards) {
					if (space > 10) {
						check_space(space + direction, direction);
					}
				} else if (direction == directions.backwards) {
					if (space < 90) {
						check_space(space + direction, direction);
					}
				} else if (direction == directions.left) {
					if (space % 10 > 0) {
						check_space(space + direction, direction);
					}
				} else if (direction == directions.right) {
					if (space % 10 < 9) {
						check_space(space + direction, direction);
					}
				}
			}
		}

		// Check each direction: forwards, backwards, left, right
		if (spaceId > 10) {
			check_space(spaceId + directions.forwards, directions.forwards);
		}
		if (spaceId < 90) {
			check_space(spaceId + directions.backwards, directions.backwards);
		}
		if (spaceId % 10 > 0) {
			check_space(spaceId + directions.left, directions.left);
		}
		if (spaceId % 10 < 9) {
			check_space(spaceId + directions.right, directions.right);
		}
	}

	// Calculate if interactable and spaces that can be moved to
	function NewTurn(state: number) {
		console.log('new turn', state, $turn_count);

		possible_movements = [];
		possible_attacks = [];
		if (piece.type == 'bomb' || piece.type == 'flag') {
			return;
		}
		// look forwards, backwards, left, then right
		if (state === 2) {
			if (!piece.player) {
				return;
			}
			SearchForPossibleMoves(piece.pos, piece.type);
		} else if (state === 3) {
			if (piece.player) {
				return;
			}
			SearchForPossibleMoves(piece.pos, piece.type);
		}
	}

	// Reactive statement to watch when game_state changes to 2
	$: if ($game_state == 2) {
		NewTurn(2);
	} else if ($game_state == 3) {
		NewTurn(3);
	}

	$: if ($red_piece_combat == piece) {
		updateContents(false);
	} else {
		updateContents(!piece.player);
	}

	// UpdateInteractive
	function UpdateInvestigate(piece: Piece) {
		if ($game_state === 2 && piece.player && possible_movements.length > 0) {
			//if possible to perform action
			if ($action_investigation.moving_piece != piece) {
				// and if not current investingating piece
				//console.log('investigating');
				action_investigation.set({
					// then investigate possible actions
					moving_piece: piece,
					target_piece: null,
					spaces: possible_movements,
					attackable: possible_attacks
				});
			}
		}
		return;
	}

	function PieceClicked(piece: any) {
		if ($game_state == 2) {
			// If player's turn
			// Check if the clicked piece is in the action investigation's attackable spaces
			if ($action_investigation.attackable.includes(piece.pos)) {
				// if can attack
				action_investigation.update((current_investigation) => {
					const updated_investigation = { ...current_investigation };
					updated_investigation.target_piece = piece;
					return updated_investigation;
				});

				// Perform attack piece action from moving_piece to target piece (player to computer)
				if (
					$action_investigation.target_piece != null &&
					$action_investigation.moving_piece != null
				) {
					AttackPiece($action_investigation.moving_piece, $action_investigation.target_piece);
				} else {
					throw new Error('Attacking or Target piece found null');
				}
			}
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
	id={piece.id}
	class="game-piece
		{piece.player ? 'blue' : 'red'}
		{piece.type == 'bomb' || 'flag' ? 'stationary' : ''} 
		{piece.type != 'bomb' && piece.type != 'flag' ? 'mobile' : ''}
		{piece.type == 'bomb' && piece == $red_piece_combat ? 'show_piece_bomb' : ''}
		{piece.type == 'flag' && piece == $red_piece_combat ? 'show_piece_flag' : ''}
		{piece.type != 'bomb' && piece.type != 'flag' && piece == $red_piece_combat
		? 'show_piece_mobile'
		: ''}
		{piece == $red_piece_combat ? 'show_piece' : ''}
		{possible_movements.length > 0 && $game_state === 2 && piece.player ? 'interactable' : ''}
		{$action_investigation.moving_piece == piece && $game_state === 2 ? 'investigating' : ''}
		{$action_investigation.attackable.includes(piece.pos) && $game_state === 2 ? 'attackable' : ''}"
	on:mouseover={() => UpdateInvestigate(piece)}
	on:click={() => PieceClicked(piece)}
>
	<div class="main_contents">
		{piece_contents[0]}
	</div>
	<div class="small_contents">
		{piece_contents[1]}
	</div>
	<div class="computer_swords">
		{piece_contents[2]}
	</div>
	<div class="left-tower" />
	<div class="right-tower" />
	<div class="left-brick" />
	<div class="right-brick" />
	<div class="left-roof" />
	<div class="right-roof" />
</div>

<style>
	.game-piece {
		transform-origin: center center;
		position: absolute; /* Ensure they are positioned correctly */
		z-index: 100; /* Ensure they appear above the grid items */
		/*background-color: rgba(255, 0, 0, 0.7); /* A distinct background color */
		border-radius: 0vh;
		text-align: center;
		cursor: default;
		width: 4vh;
		height: 5.5vh;
		left: 4vh;
		top: 4vh;
		transform: translate(-50%, -50%);
		box-shadow: 0vh 0.5vh 0 0.2vh rgb(0, 0, 0);
		border-style: none;
		border-width: 0vh;
		font-family: 'Courier New', Courier, monospace;
		align-content: center;
		font-weight: 1000;
		font-size: 3vh;
		transition: all 0.1s;
		z-index: 10;
	}

	.left-tower {
		position: absolute;
		left: 0;
		width: 0.9vh;
		height: 0.9vh;
		top: -0.9vh;
		background-color: inherit;
		box-shadow: 0vh 0.2vh 0 0.15vh rgb(0, 0, 0);
		z-index: 9;
	}

	.right-tower {
		position: absolute;
		right: 0;
		width: 0.9vh;
		height: 0.9vh;
		top: -0.9vh;
		box-shadow: 0vh 0.2vh 0 0.15vh rgb(0, 0, 0);
		background-color: inherit;
	}

	.left-brick {
		position: absolute;
		right: calc(50% - 1vh);
		width: 3vh;
		height: 0.3vh;
		top: -0.3vh;
		background-color: inherit;
		box-shadow: 0vh 0.15vh 0 0.1vh rgb(0, 0, 0);
		z-index: 8;
	}

	.right-brick {
		position: absolute;
		right: calc(50% - 0.5vh);
		width: 1vh;
		height: 0.3vh;
		top: -0.6vh;
		background-color: inherit;
		box-shadow: 0vh 0.15vh 0 0.1vh rgb(0, 0, 0);
		z-index: 0;
	}

	.left-roof {
		width: 0;
		height: 0;
	}

	.small_contents {
		font-size: 1.3vh;
	}

	.blue.interactable:hover {
		cursor: pointer;
	}

	.blue.investigating {
		transform: translate(-50%, calc(-50% - 0.8vh));
		box-shadow:
			0 0.5vh 0 0.2vh rgb(0, 0, 0),
			0 1.1vh 0 0.7vh rgba(0, 0, 0, 0.2);
		background-color: hsl(232, 100%, 95%) !important;
	}

	.attackable {
		transform: translate(calc(-50% - 0.05vh), calc(-50% - 0.3vh));
		cursor: pointer;
	}

	.attackable:hover {
		transform: translate(calc(-50% - 0.3vh), calc(-50% - 0.8vh));
		box-shadow:
			0vh 0.5vh 0 0.2vh rgb(0, 0, 0),
			0vh 1vh 0 0.5vh rgba(0, 0, 0, 0.2);
	}

	.blue.stationary {
		background-color: hsl(232, 50%, 50%);
		color: hsl(0, 0%, 100%);
	}

	.blue.mobile {
		background-color: hsl(232, 100%, 80%);
		color: hsl(0, 0%, 0%);
	}

	.red {
		background-color: hsl(0, 50%, 50%);
		color: hsla(0, 0%, 0%, 0);
	}

	.red.attackable:hover {
		background-color: hsl(0, 50%, 70%) !important;
		color: hsla(0, 0%, 0%, 1);
	}

	.show_piece {
		/* Show the red piece for a combat animation */
		transition: all 0.3s ease-in;
		rotate: y 360deg;
		transform: translate(-50%, calc(-50% - 0.8vh));
		box-shadow:
			0.1vh 0.5vh 0 0.2vh rgb(0, 0, 0) /*basic shadow*/,
			0.2vh 1.1vh 0 0.7vh rgba(0, 0, 0, 0.2); /* Larger Shadow becasue in air */
	}

	.show_piece_bomb {
		/* What does a flag look like in a combat animation */
		color: rgb(255, 255, 255);
		background-color: hsl(0, 100%, 20%) !important;
	}
	.show_piece_flag {
		/* when found, the flag should rise up, glow, and have rays come from it */
		color: rgb(255, 255, 255);
		background-color: hsl(0, 100%, 20%) !important;
	}
	.show_piece_mobile {
		/* What does a mobile troop look like in a combat animation */
		color: hsla(0, 0%, 0%, 1);
		background-color: hsl(0, 80%, 50%) !important;
	}
</style>
