// Seeded PCG RNG
// Anything that calls RNG should have its own instance of this class, for determinism purposes (javascript is synchronous)

// Values and code references from the wikipedia page on PCG
// https://en.wikipedia.org/w/index.php?title=Permuted_congruential_generator&oldid=1204900506
// PCG originally created by Melissa E. O'Neill and described in PCG: A Family of Simple Fast Space-Efficient Statistically Good Algorithms for Random Number Generation
// This implementation in javascript written by me

// Write a function that takes a probability distribution and returns a number (or anything) based on it
class RNG {
	constructor(seed = 0n, state = 0x4d595df4d0f33173n, multiplier = 6364136223846793005n, increment = 1442695040888963407n) {
		this.state = BigInt(state);
		this.multiplier = BigInt(multiplier);
		this.increment = BigInt(increment);
		this.seed = BigInt(seed);
		this.init();
	}

	// Use this to pad/truncate x
	// Necessary to emulate the behavior of fixed-bitlength numbers
	#pad_or_truncate(x, bits = 64) {
		let binary = (x).toString(2)
		if (binary.length <= bits) {
			return ('0b' + '0'.repeat(bits - binary.length) + binary);
		} else {
			return ('0b' + binary.slice(-bits));
		}
	}

	#rotr32(x, r) {
		return (x >> r | x << (-r & 31n)) & 4294967295n;
	}

	call() {
		let x = this.state;
		this.state = BigInt(this.#pad_or_truncate((this.state * this.multiplier + this.increment)));
		let count = x >> 59n;
		x = ((x ^ (x >> 18n)) >> 27n) & 4294967295n;
		return Number(this.#rotr32(x, count));
	}

	init() {
		this.state = this.seed + this.increment;
		this.call();
	}

	// Uniformly distributed random integers
	// Rolls values from min to max-1 (zero indexing compatibility)
	randint(min, max) {
		if (max) {
			return this.call()%(max - min) + min;
		} else if (min) {
			return min > 0 ? this.call()%min : this.call()%(-min) + min;
		} else {
			return this.call();
		}
	}

	// Uniformly distributed random 32 bit float
	// Although javascript uses 64 bit numbers, the PCG above only outputs 32 bits
	// Good enough for a video game though
	rand(min, max) {
		if (max) {
			return this.call()*(2**-32)*(max - min) + min;
		} else if (min) {
			return this.call()*(2**-32)*min;
		} else {
			return this.call()*(2**-32);
		}
	}

	// Random permutation of an array
	// Returns a random permutation of integers up to the input when given a number
	// Returns a random permutation of the elements of the array when given an array
	// Does not affect the input array
	randperm(array) {
		let arrayCopy;
		if (!(array instanceof Array) && typeof array == "number") {
			arrayCopy = Array.from(Array(array), (_, i) => i);
		} else {
			arrayCopy = [...array];
		}
		return this.permute(arrayCopy)
	}

	// Permutes the input array in place
	permute(array) {
		if (array.length > 1) {
			let temp;
			for (let i = 1; i < array.length; i++) {
				let j = this.randint(array.length);
				temp = array[j];
				array[j] = array[i];
				array[i] = temp;
			}
		}
		return array;
	}
	
	// Get random array index with the distribution of the input array (not necessarily normalized)
	chooseIndex(probabilities) {
		let normalizer = probabilities.reduce((x, e) => x + e);
		// find a random number between 0 and the sum of the probability array
		let number = this.rand(normalizer);
		// Map the probability masses to the cumulative probabilities and then find the first index such that our random number is less than the cumulative at that index
		return probabilities.map((e, i) => probabilities.slice(0, i + 1).reduce((x, e) => x + e)).findIndex((e) => {return number < e});
	}
	
	// Get random array element with input distribution on the indices
	choose(items, probabilities) {
		if (probabilities == undefined) {
			// Assuming a general array is input without probabilities, constant random choice (fair dice roll)
			return items[this.randint(items.length)];
		} else if (probabilities.length > items.length) {
			throw RangeError(`Item array must be shorter or equal in length to probability array`);
		}
		return items[chooseIndex(probabilities)];
	}
	

}
