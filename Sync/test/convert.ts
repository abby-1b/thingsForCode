Deno.writeTextFileSync("code.html", decodeURI(Deno.readTextFileSync("codeuri.txt")))