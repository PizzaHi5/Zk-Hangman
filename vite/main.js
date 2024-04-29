import circuit from '../circuit/target/circuit.json';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';

const setup = async () => {
  await Promise.all([
    import("@noir-lang/noirc_abi").then(module => 
      module.default(new URL("@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm", import.meta.url).toString())
    ),
    import("@noir-lang/acvm_js").then(module => 
      module.default(new URL("@noir-lang/acvm_js/web/acvm_js_bg.wasm", import.meta.url).toString())
    )
  ]);
}

function display(container, msg) {
  const c = document.getElementById(container);
  const p = document.createElement('p');
  p.textContent = msg;
  c.appendChild(p);
}

document.getElementById('submitGuess').addEventListener('click', async () => {
  try {

    // npm i @noir-lang/backend_barretenberg@0.27.0 @noir-lang/noir_js@0.27.0
    const backend = new BarretenbergBackend(circuit);
    const noir = new Noir(circuit, backend);

    // Game Player Input
    const guess = parseInt(document.getElementById('guessInput').value);

    // Game Creator Secret Input
    const answer = 4;
    const input = { answer: answer, guess: guess };
    
    await setup(); // let's squeeze our wasm inits here

    display('logs', 'Generating proof... ⌛');
    const proof = await noir.generateProof(input);
    display('logs', 'Verifying proof... ✅');
    display('results', proof.proof);
    //display('results', proof.publicInputs);
    
    display('logs', 'Verifying proof... ⌛');
    const verification = await noir.verifyProof(proof);
    if (verification) display('logs', 'Verifying proof... ✅');

  } catch(err) {
    display("logs", "Oh 💔 Wrong guess")
    console.log(err);
  }
});
