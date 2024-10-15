// utils.ts

'use strict';

// Function to shuffle an array
export function shuffleArray(array: Array<any>) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
        const timeout = setTimeout(resolve, ms);
    });
}