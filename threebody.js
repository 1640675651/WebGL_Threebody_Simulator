var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl");
gl.clearColor(1, 1, 1, 1);  // white
gl.clear(gl.COLOR_BUFFER_BIT);

const vs = `
// vertex shader
attribute vec3 a_position;
attribute vec3 a_normal;
uniform mat4 u_modelview;
uniform mat4 u_projection;

varying vec3 v_position;             // Fragment position (camera space)
varying vec3 v_normal;               // Fragment normal (camera space)

void main()
{
	//interpolate data for fragment shader
	vec4 camSpacePosition = u_modelview * vec4(a_position, 1.0);
	v_position = vec3(camSpacePosition);
	vec4 camSpaceNormal = u_modelview * vec4(a_normal, 0.0); //remember this is a vector so the 4th entry should be 0
	v_normal = vec3(camSpaceNormal);

	gl_Position = u_projection*camSpacePosition;
}
`;

const fs = `
// fragment shader
precision mediump float;

uniform vec3 uLightPos;             // Light position in camera space
uniform float uLightPower;          // Light power
uniform vec3 uDiffuseColor;         // Diffuse color
uniform float uAmbient;             // Ambient

varying vec3 v_position;             // Fragment position (camera space)
varying vec3 v_normal;               // Fragment normal (camera space)

void main() {
    vec3 ld = uLightPos-v_position; //lighting direction
    float ld_len = length(ld);
    gl_FragColor = vec4(uDiffuseColor * (uLightPower/(ld_len*ld_len/5.0+5.0) * max(dot(normalize(v_normal),normalize(ld)), 0.0) + uAmbient), 1.0); 
  	//gl_FragColor = vec4(uDiffuseColor * max(dot(normalize(v_normal),normalize(ld)), 0.0) + uAmbient, 1.0); 
    //gl_FragColor = 0.5+0.5*vec4(v_normal,1.0);
}
`;

var program;

var Radius = [2.5,2.5,2.5];

var modelViewMatrixLoc;
var projectionMatrixLoc;
var viewMatrix = mat4.create();
var projectionMatrix = mat4.create();
var rotator;

var positionBuffer;
var normalBuffer;

var positionAttributeLoc;
var normalAttributeLoc;

var then = 0;
var selfSpinAngle = 0;
var started = false;
var framecounter = 0;

var cameraDist = 20;
var fovy = 1;
var aspect = 1;
var near = 1;
var far = 100;

var lightPosLoc;
var lightPos;

var diffuseColor = [[1,0,0], [0,1,0], [0,0,1]];
var diffuseColorLoc;

//physical variables
var r0 = vec3.fromValues(-5, 0, 0);
var r1 = vec3.fromValues(5, 0, 0);
var r2 = vec3.fromValues(0, 8.66025, 0);
var v0 = vec3.fromValues(0.158114,-0.273861, 0);
var v1 = vec3.fromValues(0.158114, 0.273861, 0);
var v2 = vec3.fromValues(-0.316228, 0, 0);
var m0 = 1, m1 = 1, m2 = 1;
var G = 1;
//initial condition of one special solution
var dt = 0.1;


function initGL()
{
	positionBuffer = gl.createBuffer();
	normalBuffer = gl.createBuffer();

	// setup GLSL program
	program = webglUtils.createProgramFromSources(gl, [vs, fs]);

	gl.useProgram(program);

	positionAttributeLoc = gl.getAttribLocation(program, "a_position");
	normalAttributeLoc = gl.getAttribLocation(program, "a_normal");
	gl.enableVertexAttribArray(positionAttributeLoc);
	gl.enableVertexAttribArray(normalAttributeLoc);

	modelViewMatrixLoc = gl.getUniformLocation(program, "u_modelview");
	projectionMatrixLoc = gl.getUniformLocation(program, "u_projection");

	rotator = new TrackballRotator(canvas, function(){}, cameraDist);
	viewMatrix = rotator.getViewMatrix();

}

function setGeometry()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere_vertices), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere_normals), gl.STATIC_DRAW);

}

function setLight()
{
	lightPos = [0,0,cameraDist]; 
	var lightPower = cameraDist*cameraDist/6;
	var ambient = 0.2;

	lightPosLoc = gl.getUniformLocation(program, "uLightPos");
	var lightPowerLoc = gl.getUniformLocation(program, "uLightPower");
	diffuseColorLoc = gl.getUniformLocation(program, "uDiffuseColor");
	var ambientLoc = gl.getUniformLocation(program, "uAmbient");

	gl.uniform1f(lightPowerLoc, lightPower);
	gl.uniform1f(ambientLoc, ambient);

	updateCamSpaceLight();
}

function updateCamSpaceLight()
{
	var lightPos_copy = vec3.create();
	vec3.copy(lightPos_copy, lightPos); //It's weird that mat4.multiplyVec3 will change liggtPos
	var camSpaceLightPos = mat4.multiplyVec3(viewMatrix, lightPos_copy);
	gl.uniform3f(lightPosLoc, camSpaceLightPos[0], camSpaceLightPos[1], camSpaceLightPos[2]);
}

function setRenderer()
{
	//tell webgl how to interpret data in the buffer
	var size = 3;          // 3 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer


	//set attributes
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(positionAttributeLoc, size, type, normalize, stride, offset);
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.vertexAttribPointer(normalAttributeLoc, size, type, normalize, stride, offset);

	//set uniform
	mat4.perspective(projectionMatrix, fovy, aspect, near, far);
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);

	gl.enable(gl.DEPTH_TEST);
}

function drawModel(pos, angle, modelnum)
{
	
	//compute model-view matrix
	//remember glMatrix use right matrix multiply when using translate and rotate. Therefore we need to reverse the operations.
	var modelMatrix = mat4.create();
	mat4.translate(modelMatrix, modelMatrix, pos);
	mat4.rotateY(modelMatrix, modelMatrix, angle);
	mat4.scale(modelMatrix, modelMatrix, [Radius[modelnum]/2.5, Radius[modelnum]/2.5, Radius[modelnum]/2.5]); //The radius in model space is 2.5.
	mat4.translate(modelMatrix, modelMatrix, [0,-0.5,0]); //the center of the model is at [0,0.5,0] in modelspace, we want it at [0,0,0].

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);


	//set uniform
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, modelViewMatrix);
	gl.uniform3f(diffuseColorLoc, diffuseColor[modelnum][0], diffuseColor[modelnum][1], diffuseColor[modelnum][2]);

	//draw model
	const offset = 0;
	const count = 3;
	gl.drawArrays(gl.TRIANGLES, offset, sphere_vertices.length/3);


}

function acceleration(p0, p1, p2, M1, M2)
{
	var r01 = vec3.create();
	var r02 = vec3.create();
	vec3.subtract(r01, p1, p0);
	vec3.subtract(r02, p2, p0);
	var l01 = vec3.length(r01);
	var l02 = vec3.length(r02);

	var a01 = vec3.create();
	var a02 = vec3.create();
	vec3.scale(a01, r01, G*M1/(l01*l01*l01));
	vec3.scale(a02, r02, G*M2/(l02*l02*l02));

	var a0 = vec3.create();
	vec3.add(a0, a01, a02);

	return a0;
}

function updatePhysics()
{
	//calculate midpoint velocity
	var a0 = acceleration(r0, r1, r2, m1, m2);
	var a1 = acceleration(r1, r0, r2, m0, m2);
	var a2 = acceleration(r2, r0, r1, m0, m1);
	var v0mid = vec3.create();
	var v1mid = vec3.create();
	var v2mid = vec3.create();
	vec3.scaleAndAdd(v0mid, v0, a0, dt/2);
	vec3.scaleAndAdd(v1mid, v1, a1, dt/2);
	vec3.scaleAndAdd(v2mid, v2, a2, dt/2);

	//calculate midpoint acceleration
	var r0mid = vec3.create();
	var r1mid = vec3.create();
	var r2mid = vec3.create();
	vec3.scaleAndAdd(r0mid, r0, v0, dt/2);
	vec3.scaleAndAdd(r1mid, r1, v1, dt/2);
	vec3.scaleAndAdd(r2mid, r2, v2, dt/2);
	var a0mid = acceleration(r0mid, r1mid, r2mid, m1, m2);
	var a1mid = acceleration(r1mid, r0mid, r2mid, m0, m2);
	var a2mid = acceleration(r2mid, r0mid, r1mid, m0, m1);

	//update position
	vec3.scaleAndAdd(r0, r0, v0mid, dt); //do not use r0 += v0*dt, vec3 does not support operands
	vec3.scaleAndAdd(r1, r1, v1mid, dt);
	vec3.scaleAndAdd(r2, r2, v2mid, dt);

	//update velocity
	vec3.scaleAndAdd(v0, v0, a0mid, dt);
	vec3.scaleAndAdd(v1, v1, a1mid, dt);
	vec3.scaleAndAdd(v2, v2, a2mid, dt);

}

function drawFrame(now)
{
	const rotationSpeed = 0.001; //sphere self-rotation speed in radian per milisecond

	var deltaTime = now - then;
	then = now;

	viewMatrix = rotator.getViewMatrix();
	updateCamSpaceLight();

	drawModel(r0, selfSpinAngle, 0);
	drawModel(r1, selfSpinAngle, 1);
	drawModel(r2, selfSpinAngle, 2);

	if(started)
	{
		updatePhysics();
		selfSpinAngle += deltaTime*rotationSpeed;
		document.getElementById('fc').value = framecounter;
		framecounter++;
	}

	requestAnimationFrame(drawFrame);
}


initGL();
setGeometry();
setLight();
setRenderer();
