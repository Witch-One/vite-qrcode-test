<script lang="ts">
  import svelteLogo from "./assets/svelte.svg";
  import viteLogo from "/vite.svg";
  import wasmLogo from "/wasm_logo.png";
  import jsQR from "jsqr";
  let file: File;
  import init, { greet } from "wasm-qrcode";

  function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) file = input.files?.[0];
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  let imgSrc: string;
  $: (async () => {
    if (!file) return;
    imgSrc = await fileToBase64(file);
  })();
  let codeStr: string;

  function decodeQRCode(imgSrc: string): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        console.time("jsQR decode");
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        console.timeEnd("jsQR decode");
        if (code) {
          codeStr = code.data;
          resolve(codeStr);
        } else {
          reject("no qr code found");
        }
        img.onerror = reject;
      };
    });
    return promise;
  }

  const initWasm = async () => {
    await init();
  };
  initWasm();
  const handleRustDecode = () => {
    console.time("rust decode");
    const _src = imgSrc.split(",")[1];
    const res = greet(_src);
    console.log(res);
    console.timeEnd("rust decode");
  };

  const handleJsDecode = () => {
    console.time("js decode");
    decodeQRCode(imgSrc)
      .then((res) => {
        console.log(res);
      })
      .finally(() => {
        console.timeEnd("js decode");
      });
  };
</script>

<main>
  <div>
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
    <a href="https://webassembly.org/" target="_blank" rel="noreferrer">
      <img src={wasmLogo} class="logo wasm" alt="Wasm Logo" />
    </a>
  </div>
  <h1>Vite + Svelte + Wasm</h1>
  <input type="file" accept="image/*" on:change={handleFile} />
  {#if imgSrc}
    <img
      src={imgSrc}
      alt=""
      style="width:600px;height:400px;object-fit:contain;"
    />
  {/if}

  <button on:click={handleRustDecode}>run decode wasm</button>
  <button on:click={handleJsDecode}>run js decode</button>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .logo.wasm:hover {
    filter: drop-shadow(0 0 2em #9a00aeaa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
