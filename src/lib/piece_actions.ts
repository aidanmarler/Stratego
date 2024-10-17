import type { Piece, Action, ActionType } from './types';
import {
	action_investigation,
	game_state,
	board_state,
	selectedSpacePos,
	pieces_left_to_place,
	ComputerPossibleActions,
	red_piece_combat,
	blue_piece_combat,
	turn_count
} from './stores';
import { shuffleArray, wait } from './utils';
import { get } from 'svelte/store';

// Local variables to hold store values
let currentSelectedSpacePos: number | null = null;
let currentPiecesLeftToPlace: Record<string, number> = {};
let CurrentComputerPossibleActions: Action[];
let CurrentBoardState: (Piece | null)[];
let CurrentGameState: number;

let current_red_piece_combat: Piece | null = null;
let current_blue_piece_combat: Piece | null = null;

// Subscribe to both stores once
function subscribeToStores() {
	selectedSpacePos.subscribe((pos) => {
		currentSelectedSpacePos = pos;
	});

	pieces_left_to_place.subscribe((pieces) => {
		currentPiecesLeftToPlace = pieces;
	});

	ComputerPossibleActions.subscribe((actions) => {
		CurrentComputerPossibleActions = actions;
	});

	board_state.subscribe((board) => {
		CurrentBoardState = board;
	});

	game_state.subscribe((state) => {
		CurrentGameState = state;
	});
}

// Call the subscription function at the top of your file
subscribeToStores();

// works, but doesn't work to make them move smoothly
export function calc_piece_pos(piece: Piece) {
	const spaceId = 'space-' + piece.pos;
	const spaceElem = document.getElementById(spaceId);
	if (spaceElem != null) {
		const rect = spaceElem.getBoundingClientRect();
		console.log(rect.top, rect.right, rect.bottom, rect.left);

		return [rect.top, rect.right, rect.bottom, rect.left];
	}
	return [0, 100, 0, 100];
}

// Function to perform attacking action.
export async function AttackPiece(attackingPiece: Piece, targetPiece: Piece) {
	game_state.set(4);

	console.log('Attack Starting', attackingPiece, 'vs', targetPiece);

	// Reset movement investigation after moving

	action_investigation.set({
		moving_piece: null,
		target_piece: null,
		spaces: [],
		attackable: []
	});

	await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 500ms
	// 1, if not neighbors, move the piece next to the target piece // Come back! Add this
	console.log('Move to position');

	// Flip over red piece to see its type
	if (attackingPiece.player) {
		// if player is attacking
		red_piece_combat.set(targetPiece);
		blue_piece_combat.set(attackingPiece);
	} else {
		// else computer is attacking
		red_piece_combat.set(attackingPiece);
		blue_piece_combat.set(targetPiece);
	}

	// Play animation to have attacker run into target other // Come back! Add this for real >:|

	await new Promise((resolve) => setTimeout(resolve, 500));

	const attacker_value = parseInt(attackingPiece.type);
	const target_value = parseInt(targetPiece.type);

	if (targetPiece.type == 'bomb') {
		if (attackingPiece.type == '3') {
			await removePiece(targetPiece);
			await new Promise((resolve) => setTimeout(resolve, 500)); // Optional delay for animation
			await movePiece(attackingPiece, targetPiece.pos);
		} else {
			await removePiece(attackingPiece);
		}
	} else if (targetPiece.type == 'flag') {
		game_state.set(attackingPiece.player ? 5 : 6);
		return;
	} else if (attacker_value == 1 && target_value == 10) {
		await removePiece(targetPiece);
		await new Promise((resolve) => setTimeout(resolve, 500)); // Optional delay
		await movePiece(attackingPiece, targetPiece.pos);
	} else {
		if (attacker_value > target_value) {
			console.log('Attacker Won!');
			// move to attacker pos
			await removePiece(targetPiece);
			await new Promise((resolve) => setTimeout(resolve, 500)); // Optional delay
			await movePiece(attackingPiece, targetPiece.pos);
		} else if (attacker_value < target_value) {
			console.log('Defender Won!');
			await removePiece(attackingPiece);
		} else {
			console.log('Tie!');
			await removePiece(attackingPiece);
			await new Promise((resolve) => setTimeout(resolve, 50)); // Optional delay
			await removePiece(targetPiece);
		}
	}

	// if target is greater, remove attacker from board, do not move target.

	await new Promise((resolve) => setTimeout(resolve, 1000)); // Optional delay before clearing combat state

	red_piece_combat.set(null);
	blue_piece_combat.set(null);

	await new Promise((resolve) => setTimeout(resolve, 100));

	if (CurrentGameState == 4) {
		if (attackingPiece.player) {
			// Come back! This does not account for if it should trigger an end to the game
			game_state.set(3); // if player attacking, set it to computer's turn
		} else if (!attackingPiece.player) {
			game_state.set(2); // if not player attacking, set it to player's turn
		}
	}
}

// Come back!!!!!! This should be changed to move the piece better - based on screen x and y found from grid pos
export function movePiece(moving_piece: Piece, targetSpacePos: number): Promise<void> {
	return new Promise((resolve) => {
		// Find the piece to move
		board_state.update((currentBoard) => {
			const updatedBoard = [...currentBoard]; // Make a copy of the board
			// Find the piece's current position
			const piece = updatedBoard[moving_piece.pos];
			if (piece) {
				// Clear the old position
				updatedBoard[moving_piece.pos] = null;
				// Place the piece in the new space
				updatedBoard[targetSpacePos] = piece;
				// Update the piece's ID to the new position
				piece.pos = targetSpacePos;
			}

			console.log('Updating Board, move piece', updatedBoard);

			// Return the updated board state
			return updatedBoard;
		});

		// Reset movement investigation after moving
		action_investigation.set({
			moving_piece: null,
			target_piece: null,
			spaces: [],
			attackable: []
		});
		resolve(); // Resolve after the board updates
	});
}

export function removePiece(removeing_piece: Piece): Promise<void> {
	return new Promise((resolve) => {
		// Find the piece to move
		board_state.update((currentBoard) => {
			const updatedBoard = [...currentBoard]; // Make a copy of the board
			// Find the piece's current position
			const piece = updatedBoard[removeing_piece.pos];
			if (piece) {
				// Clear the old position
				updatedBoard[removeing_piece.pos] = null;
			}
			// Return the updated board state
			return updatedBoard;
		});
		resolve();
	});
}

// Functions to create pieces

// Store the pieces placed on the board
export let pieces: Piece[] = [];

// Function to create a new game piece for the computer
export function createAIPiece(spacePos: number, pieceType: string) {
	const piece_id: string = 'piece-computer-' + pieceType + spacePos.toString;
	const newPiece: Piece = {
		id: piece_id,
		pos: spacePos,
		type: pieceType,
		player: false
	};

	// Update the board_state store at the selected space ID
	board_state.update((currentBoard) => {
		const updatedBoard = [...currentBoard]; // Make a copy of the board
		updatedBoard[spacePos] = newPiece; // Update the selected space
		return updatedBoard; // Return the updated board
	});

	pieces = [...pieces, newPiece];

	if (pieces.length == 80) {
		// if all 80 pieces are placed, begin the next phase: player turn
		game_state.set(2);
	}
}

// Function to autofill the computers pieces
export function placeRandomPieces_computer() {
	(async () => {
		await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 100ms
		let choices_pieces = [];
		let choices_spaces = [];
		let pieces_to_place = {
			bomb: 6,
			flag: 1,
			'10': 1,
			'9': 1,
			'8': 2,
			'7': 3,
			'6': 4,
			'5': 4,
			'4': 4,
			'3': 5,
			'2': 8,
			'1': 1
		};
		for (let i = 0; i < 40; i++) {
			//make array of 40 spaces
			choices_spaces.push(i);
		}
		// Then, get an array of pieces to place
		for (const [key, value] of Object.entries(pieces_to_place)) {
			for (let i = 0; i < value; i++) {
				choices_pieces.push(key);
			}
		}
		shuffleArray(choices_spaces); // shuffle the array of spaces
		shuffleArray(choices_pieces); // shuffle the array of pieces
		let array_of_choices_len = choices_pieces.length;
		for (let i = 0; i < array_of_choices_len; i++) {
			(async () => {
				await new Promise((resolve) => setTimeout(resolve, i * 50)); // Wait for 100ms
				let space_choice = choices_spaces.pop();
				let piece_choice = choices_pieces.pop();
				if (space_choice != undefined && piece_choice != undefined) {
					createAIPiece(space_choice, piece_choice);
				} else {
					throw new Error(
						'Computer piece autoselect failed because space or piece choice was undefined.'
					);
				}
			})();
		}
	})();
}

// Function to create a new game piece
export function createPlayerPiece(pieceType: string) {
	if (currentSelectedSpacePos != null) {
		const piece_id: string = 'piece-player-' + pieceType + currentSelectedSpacePos.toString;
		const newPiece: Piece = {
			id: piece_id,
			pos: currentSelectedSpacePos,
			type: pieceType,
			player: true
		};

		// Update the board_state store at the selected space ID
		board_state.update((currentBoard) => {
			const updatedBoard = [...currentBoard]; // Make a copy of the board
			if (currentSelectedSpacePos != null && currentSelectedSpacePos != undefined) {
				updatedBoard[currentSelectedSpacePos] = newPiece; // Update the selected space
			} else {
				throw new Error('Error creating player piece - position null or undefined');
			}
			return updatedBoard; // Return the updated board
		});

		pieces = [...pieces, newPiece];

		if (pieces.length == 40) {
			// if all 40 of player pieces are down, start computers turn to place
			placeRandomPieces_computer();
		}
	}
}

// Function to autofill the players pieces
export function placeRandomPieces_player() {
	let choices_pieces = [];
	let choices_spaces = [];
	for (let i = 60; i < 100; i++) {
		//make array of 40 spaces
		choices_spaces.push(i);
	}
	for (let i = 0; i < pieces.length; i++) {
		// remove each occupied space from array
		//console.log('remove space', pieces[i].id);
		const index = choices_spaces.indexOf(pieces[i].pos);
		if (index > -1) {
			// only splice array when item is found
			choices_spaces.splice(index, 1); // 2nd parameter means remove one item only
		}
	}
	// Then, get an array of pieces left to place
	for (const [key, value] of Object.entries(currentPiecesLeftToPlace)) {
		//console.log(key, value);
		for (let i = 0; i < value; i++) {
			choices_pieces.push(key);
		}
	}
	shuffleArray(choices_spaces); // shuffle the array of spaces
	shuffleArray(choices_pieces); // shuffle the array of pieces
	let array_of_choices_len = choices_pieces.length;
	for (let i = 0; i < array_of_choices_len; i++) {
		(async () => {
			await new Promise((resolve) => setTimeout(resolve, i * 50)); // Wait for 100ms
			let space_choice = choices_spaces.pop();
			let piece_choice = choices_pieces.pop();
			//console.log('space_choice', space_choice);
			//console.log('piece_choice', piece_choice);
			if (piece_choice != undefined && space_choice != undefined) {
				currentSelectedSpacePos = space_choice;
				createPlayerPiece(piece_choice);
			} else {
				throw new Error(
					'Player piece autoselected failed because choice was undefined rather than string.'
				);
			}
			('showPieceSelect = false;');
		})();
	}
}

// Function to have computer choose and excecute its actions this turn
async function ComputersTurn(random: boolean) {
	//  (1)  Look for all possible moves
	// Store all possible moves as array
	console.log("Computer's Turn");
	await wait(1000);
	console.log('Computer Actions: ', CurrentComputerPossibleActions);

	const ChosenAction: Action = random
		? shuffleArray(CurrentComputerPossibleActions)[0]
		: CurrentComputerPossibleActions[0]; // Or some other deterministic choice

	console.log(ChosenAction);
	//  (2)  Choose a move or an attack
	if (ChosenAction.type === 0) {
		movePiece(ChosenAction.piece, ChosenAction.aimed_pos);
		await wait(1500);
		game_state.set(2);
	} else if (ChosenAction.type === 1) {
		const targetPiece = CurrentBoardState[ChosenAction.aimed_pos];
		if (targetPiece !== null) {
			AttackPiece(ChosenAction.piece, targetPiece);
		}
	}
}

let turn_tracker = [];
// each turn {TurnNumber:, Player: {ActionType, piece, space}, Computer:{ActionType, piece, space}}

// Run
game_state.subscribe((state) => {
	if (state === 3) {
		console.log(get(turn_count));
		ComputersTurn(true);
	} else {
		ComputerPossibleActions.set([]);
	}
});
