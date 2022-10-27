let txt = `Colaborar con conocimientos positivos en nuestra juventud , es el principal  propósito ; Babby , sabe que  aprender  deportes acuáticos y fortalecer cuerpo  y mente  con entrenamiento, produce salud y la máxima motivación en los menores de edad  . EL TUAR PR WORLD CLASS SURFING CREW`
txt = txt
	.replace(/\s{1,}[,;.!?]/g, t => t[t.length - 1])
	.replace(/\s{2,}/g, " ")

if (txt.toLowerCase().includes("crew")) {
	let i = txt.toLowerCase().indexOf("crew")
	while (txt.toLowerCase()[i] != 'e' || txt.toLowerCase()[i + 1] != 'l') i--
	txt = txt.slice(0, i)
}

txt += "El Tuar PR, World Class Surfing Crew.\n#eltuarpr\n"

console.log(txt)
