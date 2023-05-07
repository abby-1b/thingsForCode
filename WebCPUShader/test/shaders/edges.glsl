#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

varying vec4 vertTexCoord;
uniform sampler2D texture;

uniform float frame;

void make_kernel(inout vec4 n[9], sampler2D tex, vec2 coord) {
	float w = (mod(frame, 100.0) > 90 ? 3.0 : 2.0) / 1080.0;
	float h = (mod(frame, 100.0) > 90 ? 1.0 : 2.0) / 1920.0;

	n[0] = texture2D(tex, coord + vec2( -w, -h));
	n[1] = texture2D(tex, coord + vec2(0.0, -h));
	n[2] = texture2D(tex, coord + vec2(  w, -h));
	n[3] = texture2D(tex, coord + vec2( -w, 0.0));
	n[4] = texture2D(tex, coord);
	n[5] = texture2D(tex, coord + vec2(  w, 0.0));
	n[6] = texture2D(tex, coord + vec2( -w, h));
	n[7] = texture2D(tex, coord + vec2(0.0, h));
	n[8] = texture2D(tex, coord + vec2(  w, h));
}

void main(void) {
	vec4 n[9];
	vec2 pos = vertTexCoord.st; // + vec2(floor(sin(vertTexCoord.st.y * 30 + frame * 0.05) + 0.2), 0.0) * 0.005;
	make_kernel(n, texture, pos);

	vec4 sobel_edge_h = n[2] + (2.0 * n[5]) + n[8] - (n[0] + (2.0 * n[3]) + n[6]);
  	vec4 sobel_edge_v = n[0] + (2.0 * n[1]) + n[2] - (n[6] + (2.0 * n[7]) + n[8]);
	vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));

	// vec2 rCoord = floor(vertTexCoord.st * vec2(108.0, 192.0) + vec2(sin(vertTexCoord.st.y * 100 + frame * 0.1), 0.0)) * 10.0;

	float cns = mod(frame, 100.0) > 96 ? -0.015 : 0.007;
	vec3 col = vec3(0);
	col.r = texture2D(texture, pos + vec2(cns, 0.0)).r;
	col.g = texture2D(texture, pos                 ).g;
	col.b = texture2D(texture, pos - vec2(cns, 0.0)).b;
	gl_FragColor = vec4((1.0 - sobel.rgb) * col * (0.99 + sin(pos.y * 300 + frame * 0.03) * 0.01), 1.0);
}