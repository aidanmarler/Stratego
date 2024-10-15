'use strict';

export interface Piece {
	id: string;
    pos: number;
	type: string;
	player: boolean;
}

export const enum ActionType {
	Move, // 0
	Attack, // 1
}

export interface Action {
    piece: Piece;
	type: ActionType;
    aimed_pos: number;
}