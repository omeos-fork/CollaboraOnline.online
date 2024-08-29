/* -*- js-indent-level: 8 -*- */

/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

declare var SlideShow: any;

class Transition2d extends SlideChangeBase {
	public canvas: HTMLCanvasElement;
	public gl: WebGL2RenderingContext;
	public program: WebGLProgram;
	public vao!: WebGLVertexArrayObject | null;
	public context: any;
	protected slideInfo: SlideInfo = null;

	// TODO - remove code duplication
	/* jscpd:ignore-start */
	constructor(transitionParameters: TransitionParameters) {
		super(transitionParameters);
		this.context = transitionParameters.context;
		this.gl = transitionParameters.context.getGl();
		this.slideInfo = transitionParameters.slideInfo;

		const vertexShaderSource = this.getVertexShader();
		const fragmentShaderSource = this.getFragmentShader();

		const vertexShader = this.context.createVertexShader(vertexShaderSource);
		const fragmentShader =
			this.context.createFragmentShader(fragmentShaderSource);

		this.program = this.context.createProgram(vertexShader, fragmentShader);

		this.prepareTransition();
	}
	/* jscpd:ignore-end */

	public getVertexShader(): string {
		return `#version 300 es
				in vec4 a_position;
				in vec2 a_texCoord;
				out vec2 v_texCoord;

				void main() {
					gl_Position = a_position;
					v_texCoord = a_texCoord;
				}
				`;
	}

	public getFragmentShader(): string {
		return `#version 300 es
				precision mediump float;

				uniform sampler2D leavingSlideTexture;
				uniform sampler2D enteringSlideTexture;
				uniform float time;

				in vec2 v_texCoord;
				out vec4 outColor;

				void main() {
					vec4 color0 = texture(leavingSlideTexture, v_texCoord);
					vec4 color1 = texture(enteringSlideTexture, v_texCoord);
					outColor = mix(color0, color1, time);
				}
				`;
	}

	public prepareTransition(): void {
		this.initBuffers();
		this.gl.useProgram(this.program);
	}

	public startTransition(): void {
		requestAnimationFrame(this.render.bind(this, 0));
	}

	public start(): void {
		this.startTransition();
	}

	// TODO - remove code duplication
	/* jscpd:ignore-start */
	public initBuffers(): void {
		const positions = new Float32Array([
			...[-1.0, -1.0, 0, 0, 1],
			...[1.0, -1.0, 0, 1, 1],
			...[-1.0, 1.0, 0, 0, 0],
			...[1.0, 1.0, 0, 1, 0],
		]);

		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

		this.vao = this.gl.createVertexArray();
		this.gl.bindVertexArray(this.vao);

		const positionLocation = this.gl.getAttribLocation(
			this.program,
			'a_position',
		);
		const texCoordLocation = this.gl.getAttribLocation(
			this.program,
			'a_texCoord',
		);

		this.gl.enableVertexAttribArray(positionLocation);
		this.gl.vertexAttribPointer(
			positionLocation,
			3,
			this.gl.FLOAT,
			false,
			5 * 4,
			0,
		);

		this.gl.enableVertexAttribArray(texCoordLocation);
		this.gl.vertexAttribPointer(
			texCoordLocation,
			2,
			this.gl.FLOAT,
			false,
			5 * 4,
			3 * 4,
		);
	}
	/* jscpd:ignore-end */

	public render(nT: number) {
		const gl = this.gl;

		gl.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(this.program);
		gl.uniform1f(gl.getUniformLocation(this.program, 'time'), nT);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.leavingSlide);
		gl.uniform1i(gl.getUniformLocation(this.program, 'leavingSlideTexture'), 0);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.enteringSlide);
		gl.uniform1i(
			gl.getUniformLocation(this.program, 'enteringSlideTexture'),
			1,
		);

		this.renderUniformValue();

		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public renderUniformValue(): void {}
}

SlideShow.Transition2d = Transition2d;
