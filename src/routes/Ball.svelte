<script lang="ts">
	import { writable } from 'svelte/store';

	// Define some variables
	let coords = writable({ x: 50, y: 50 });
	let velocity = writable({ x: 0, y: 0.1 });
	let radius = 30;

	$: outerWidth = 0;
	$: innerWidth = 0;
	$: outerHeight = 0;
	$: innerHeight = 0;

	// Function to update the position of the ball
	function updatePhysics() {
		velocity.update((currentVelocity) => {
			// Subscribe to the coords store to get the current value
			let currentCoords;
			coords.subscribe((value) => {
				currentCoords = value;
			})();

			console.log("up down",
				currentCoords.y + radius >= innerHeight || currentCoords.y + radius <= outerHeight
			);
			console.log("left right", currentCoords.x + radius >= innerWidth || currentCoords.x + radius <= outerWidth);
			return {
				x: currentVelocity.x + 0,
				y: currentVelocity.y + 0.1
			};

			// Calculate current velocity
		});
		coords.update((currentCoords) => {
			// Subscribe to the velocity store to get the current value
			let currentVelocity;
			velocity.subscribe((value) => {
				currentVelocity = value;
			})();

			// Calculate a new position, based on velocity
			return {
				x: currentCoords.x + currentVelocity.x,
				y: currentCoords.y + currentVelocity.y
			};
		});
	}

	setInterval(updatePhysics, 1);
</script>

<svelte:window bind:innerWidth bind:outerWidth bind:innerHeight bind:outerHeight />

<svg>
	<circle cx={$coords.x} cy={$coords.y} r={radius} />
</svg>

<style>
	svg {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
	}

	circle {
		fill: black;
	}
</style>