Primary focus is in ``vite/main.js```

Steps:
Setup noir
```
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
```
In a fresh terminal, update noir. (We need this to generate the verifier smart contract)
```
noirup
```

Copy paste ```circuit/target/circuit.json``` into your target folder, this is the circuit json representation

Install noir dependancies
```
npm i @noir-lang/backend_barretenberg@0.27.0 @noir-lang/noir_js@0.27.0
```

For frontend, use the imports in main.js
```
import circuit from '../circuit/target/circuit.json';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
```

Call the script below whenever a user creates a game.
Inside your target UI element code, (this example used vite, adjust accordingly)
```
const backend = new BarretenbergBackend(circuit);
const noir = new Noir(circuit, backend);

// Game Creator Secret Input
const answer = parseInt(document.getElementById('guessInput').value); // ADJUST

const input = { answer: answer, guess: answer };

await setup(); // let's squeeze our wasm inits here

display('logs', 'Generating proof... ⌛');
const proof = await noir.generateProof(input);

display('logs', 'Verifying proof... ✅');
display('results', proof.proof);

//display('results', proof.publicInputs); //this will be empty because we have all private inputs

display('logs', 'Verifying proof... ⌛');
const verification = await noir.verifyProof(proof);
if (verification) display('logs', 'Verifying proof... ✅'); // ADJUST slightly, just need to ensure verification passes
```

From here, you need to call a nargo cli command to generate the verifier smart contract. This may or may not required a nargo checked circuit.
If you need it, you will need to follow the noir setup with the circuit [here](https://github.com/PizzaHi5/Zk-Hangman/tree/master). The guides [here](https://noir-lang.org/docs/getting_started/hello_noir/)
```
nargo codegen-verifier
```
- I did not see a way to generate the solidity verifier from JS

ALTERNATELY, you can take the users input and verify the proof in JS. This requires storing the correct answer however.
As an example, every guess made by the user, call:
```
try {
    const input = { answer: GameID.getSecretAnswer(StoredSecretAnswer), guess: userGuess };
    const proof = await noir.generateProof(input);
    const verification = await noir.verifyProof(proof);
    if(verification) {
        console.log("PASS");
    }
} catch {
    console.log("Wrong Guess");
}
```
If the user submits an incorrect guess, noir will fail to generate a proof for their input.

Due to our tight time contraints, this might be the best option for today. 

The compiled solidity verifier contract is located: ```circuit/contract/circuit/plonk_vk.sol```
You will need to deploy the newly generated smart contract every new game.