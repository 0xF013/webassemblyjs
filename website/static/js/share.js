function runWasm2Wast(buffer) {
  const output = document.getElementById("wasm2wast-output");
  const editor = document.getElementById("wasm2wast-editor");

  function showOutput(out) {
    const lineCount = out.split("\n").length - 1;
    const sizePerLine = 20;

    editor.style.height = lineCount * sizePerLine;

    output.innerHTML = '<code className="language-wast">' + out + "</code>";
  }

  function toWast(ast) {
    return _webassemblyjs_wastPrinter.print(ast);
  }

  function parseBinary(buff) {
    try {
      return _webassemblyjs_wasmParser.decode(buff);
    } catch (e) {
      showOutput("Error: " + e.message);
      throw e;
    }
  }

  const ast = parseBinary(buffer);
  const wastOut = toWast(ast);

  showOutput(wastOut);
}

(function() {
  const downloadBtn = document.getElementById("download");
  const input = document.getElementById("upload");

  if (
    typeof _webassemblyjs_wasmParser === "undefined" ||
    typeof _webassemblyjs_wastPrinter === "undefined"
  ) {
    throw new Error("webassemblyjs has not been loaded correctly");
  }

  function downloadURL(data, fileName) {
    const a = document.createElement("a");
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = "display: none";
    a.click();
    a.remove();
  }

  function encodeInUrl(buff) {
    window.location.hash = new Uint8Array(buff).toString();
  }

  function decodeFromUrl() {
    if (window.location.hash === "") {
      return;
    }

    const byteArray = window.location.hash.split(",");

    const buff = new Uint8Array(byteArray);

    return buff.buffer;
  }

  downloadBtn.addEventListener("click", function() {
    const savedBuffer = decodeFromUrl();

    if (typeof savedBuffer === "undefined") {
      throw new Error("No saved binary");
    }

    const blob = new Blob([new Uint8Array(savedBuffer)], {
      type: "application/wasm"
    });
    const objectUrl = URL.createObjectURL(blob);

    downloadURL(objectUrl, "module.wasm", "application/wasm");

    window.URL.revokeObjectURL(objectUrl);
  });

  input.addEventListener("change", function(event) {
    const file = event.target.files[0];

    const fileReader = new FileReader();

    fileReader.onload = function(e) {
      const arrayBuffer = e.target.result;

      encodeInUrl(arrayBuffer);

      runWasm2Wast(arrayBuffer);
    };

    fileReader.readAsArrayBuffer(file);
  });

  const savedBuffer = decodeFromUrl();

  if (typeof savedBuffer !== "undefined") {
    runWasm2Wast(savedBuffer);
  }
})();
