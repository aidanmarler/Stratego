<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { tick } from 'svelte';
	import { cubicIn } from 'svelte/easing';

	/**
	 * @type {any[]}
	 */
	let items = []; // This will hold the grid items
	//let clickableItems = Array.from({ length: 3 }, (_, i) => ({ id: i, x: i, y: i })); // Initialize 30 clickable items

	let clickableRedItems = Array.from({ length: 30 }, (_, i) => ({ id: i, x: (i % 10) + 1, y: Math.floor(i / 10) + 1 })); // Initialize 30 clickable items for first 3 rows
	let clickableBlueItems = Array.from({ length: 30 }, (_, i) => ({ id: i, x: (i % 10) + 61, y: Math.floor(i / 10) + 61 })); // Initialize 30 clickable items for first 3 rows
    
	// Function to add grid squares to the array
	/**
	 * @param {number} i
	 */
	async function addGridSquare(i) {
		await tick(); // Wait for DOM to be ready for transitions
		items = [
			...items,
			{
				id: i,
				type:
					i == 42 || i == 43 || i == 47 || i == 48 || i == 52 || i == 53 || i == 57 || i == 58
						? 'water'
						: 'land'
			}
		];
	}

	onMount(async () => {
		for (let i = 0; i < 100; i++) {
			await new Promise((resolve) => setTimeout(resolve, 50)); // Wait 0.2 seconds before showing the next square
			addGridSquare(i); // Add the next grid item
		}
	});

	// Function to move the clicked item down one grid square
	/**
	 * @param {number} id
	 */
	function moveItemDown(id) {
		clickableRedItems = clickableRedItems.map((item) => {
			if (item.id === id) {
				return { ...item, y: item.y + 1 }; // Move the item down
			}
			return item;
		});
		clickableBlueItems = clickableBlueItems.map((item) => {
			if (item.id === id) {
				return { ...item, y: item.y - 1 }; // Move the item down
			}
			return item;
		});
	}
</script>

<div class="grid">
	{#each items as item (item.id)}
		<div
			class={item.type === 'land' ? 'grid-land' : 'grid-water'}
			transition:fly={{ y: -50, duration: 100, opacity: 100, easing: cubicIn }}
		></div>
	{/each}
	{#each clickableRedItems as clickableRedItems}
		<div
			class="clickable-item red"
			on:click={() => moveItemDown(clickableRedItems.id)}
			style="grid-column: {clickableRedItems.x}; grid-row: {clickableRedItems.y};"
		>
		</div>
	{/each}
	{#each clickableBlueItems as clickableBlueItems}
		<div
			class="clickable-item blue"
			on:click={() => moveItemDown(clickableBlueItems.id)}
			style="grid-column: {clickableBlueItems.x}; grid-row: {clickableBlueItems.y};"
		>
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		position: absolute;
		gap: 0.2vh;
		background-color: rgb(184, 176, 152);
		padding: .6vh;
		width: 80vh;
		height: 80vh;
		grid-template-columns: repeat(10, 1fr); /* 10 equal-width columns */
		grid-template-rows: repeat(10, 1fr);
		border-radius: 0vh;
		transform: translate(-50%, -50%);
		left: 50%;
		top: 50%;
	}

	:global(.grid-land) {
		background-color: rgb(17, 68, 29);
		border-radius: 0vh;
	}

	:global(.grid-water) {
		background-color: rgb(21, 38, 74);
		border-radius: 0vh;
	}

	.clickable-item {
		position: absolute; /* Ensure they are positioned correctly */
		z-index: 1; /* Ensure they appear above the grid items */
		/*background-color: rgba(255, 0, 0, 0.7); /* A distinct background color */
		border-radius: 90px;
		text-align: center;
		cursor: pointer;
		width: 6vh;
		height: 6vh;
        left: 4vh;
        right: 4vh;
		transform: translate(-50%, 50%);
	}

	.red {
		background-color: rgba(255, 0, 0, 0.7); /* A distinct background color */
	}

	.blue {
		background-color: rgba(0, 34, 255, 0.7); /* A distinct background color */
	}
</style>
