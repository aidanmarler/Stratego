<script>
	import { fly } from 'svelte/transition';
	import { game_state } from '../lib/stores'; // Import the store from the separate file
	import { cubicIn, cubicOut, elasticIn } from 'svelte/easing';

	console.log('State ', $game_state);
</script>

<!-- End Screen-->
{#if $game_state >= 5}
	<div class="end_background">
		<div
			class="end_banner"
			in:fly={{ y: 500, duration: 300, opacity: 100, easing: cubicIn }}
			out:fly={{ x: -1000, duration: 500, opacity: 0, easing: cubicOut }}
		>
			{#if $game_state == 5}
				<div class="end_title win">Victory!</div>
				<div class="end_symbol win">⚑</div>
				<div class="end_contents">
					<ul>
						<li>5 turns</li>
						<li>3 bombs detonated</li>
						<li>25 pieces remaining</li>
					</ul>
				</div>
			{:else if $game_state == 6}
				<div class="end_title lose">Defeat!</div>
				<div class="end_symbol lose">☠</div>
				<div class="end_contents">
					<ul>
						<li>5 turns</li>
						<li>3 bombs detonated</li>
						<li>25 pieces remaining</li>
					</ul>
				</div>
			{/if}
		</div>
		<button on:click={()=>{location.reload()}}> ⌂ </button>
	</div>
{/if}

<style>
	.end_background {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		backdrop-filter: grayscale(80%) brightness(60%);
		width: auto;
	}

	.end_banner {
		position: absolute;
		background-color: hsl(0, 0%, 80%);
		box-shadow: 0.8vh 0.8vh hsl(0, 0%, 0%);
		color: hsl(0, 0%, 0%);
		left: 50%;
		top: 49%;
		width: 80vh;
		height: 50vh;
		transform: translate(-50%, -50%);
		font-family: 'Courier New', Courier, monospace;
		text-align: center;
		align-content: center;
	}

	.end_title {
		position: relative;
		font-size: 10vh;
		font-weight: bolder;
		left: 50%;
		top: 10vh;
		transform: translate(-50%, -50%);
		text-shadow: 0.3vh 0.4vh hsl(0, 0%, 0%);
	}

	.end_symbol {
		position: relative;
		font-size: 15vh;
		font-weight: 100;
		left: 50%;
		top: 10vh;
		transform: translate(-50%, -50%);
		text-shadow: 0vh 0vh hsl(0, 0%, 0%);
	}

	.end_contents {
		position: relative;
		font-size: 3vh;
		font-weight: bolder;
		left: 10%;
		top: -2vh;
		text-align: left;
	}

	.end_title.win {
		color: hsl(110, 100%, 27%);
	}

	.end_symbol.win {
		color: hsl(110, 100%, 27%);
	}

	.end_title.lose {
		color: hsl(0, 100%, 25%);
	}

	.end_symbol.lose {
		color: hsl(0, 100%, 25%);
	}

	button {
		width: 20vh;
		height: 7vh;
		position: absolute;
		background-color: hsl(0, 0%, 80%);
		box-shadow: 0.8vh 0.8vh hsl(0, 0%, 0%);
		color: hsl(0, 0%, 0%);
		left: 50%;
		top: calc(49% + 20vh + 15vh);
        font-size: 3vh;
        font-weight: 600;
		transform: translate(-50%, -50%);
		font-family: 'Courier New', Courier, monospace;
		text-align: center;
		align-content: center;
        cursor: pointer;
	}

	button:hover,
	button:focus {
		background-color: hsl(0, 0%, 100%);
		border-color: hsl(0, 0%, 100%);
		box-shadow: 1.3vh 1.3vh rgb(0, 0, 0);
		transition: all 0.1s;
		transform: translate(calc(-50% - 0.5vh), calc(-50% - 0.5vh));
	}
</style>
