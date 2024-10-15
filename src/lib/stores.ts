// stores.ts

'use strict';

import { writable } from 'svelte/store';
import type { Piece, Action } from './types';

// Define the type for the pieces_left_to_place store
type PiecesLeftToPlace = Record<string, number>;

// Create the writable store with the correct type
export const pieces_left_to_place = writable<PiecesLeftToPlace>({
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
});

const enum State {
	MainMenu, // 0
	Setup, // 1
	PlayerTurn, // 2
	ComputerTurn, // 3
	Combat, // 4
	PlayerWon, // 5
	PlayerLost // 6
}

export const game_state = writable(State.MainMenu);

// Create an array of length 100, initially filled with null or empty objects
const initialBoard: (Piece | null)[] = Array(100).fill(null);

// Define a writable store to hold the array of pieces
export const board_state = writable<(Piece | null)[]>(initialBoard);

// Define a writable store to hold the piece and the spaces that are under investigation to be moved
export const action_investigation = writable({
	moving_piece: {} as Piece | null,
	target_piece: null as Piece | null,
	spaces: [] as number[],
	attackable: [] as number[] // Specify that spaces is an array of numbers
});

// Variables to control PieceSelect popup
export const selectedSpacePos = writable<number | null>(null);

// Store all possible computer actions
export const ComputerPossibleActions = writable<Action[]>([]);

// Store piece in combat in a reactive store
export const red_piece_combat = writable<Piece | null>(null);
export const blue_piece_combat = writable<Piece | null>(null);
