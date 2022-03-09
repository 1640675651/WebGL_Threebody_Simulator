var animationstarted = false;

function setval()
{
	cameraDist = document.getElementById('cd').value;
	r0[0] = document.getElementById('x0').value;
	r0[1] = document.getElementById('y0').value;
	r0[2] = document.getElementById('z0').value;
	r1[0] = document.getElementById('x1').value;
	r1[1] = document.getElementById('y1').value;
	r1[2] = document.getElementById('z1').value;
	r2[0] = document.getElementById('x2').value;
	r2[1] = document.getElementById('y2').value;
	r2[2] = document.getElementById('z2').value;
	v0[0] = document.getElementById('vx0').value;
	v0[1] = document.getElementById('vy0').value;
	v0[2] = document.getElementById('vz0').value;
	v1[0] = document.getElementById('vx1').value;
	v1[1] = document.getElementById('vy1').value;
	v1[2] = document.getElementById('vz1').value;
	v2[0] = document.getElementById('vx2').value;
	v2[1] = document.getElementById('vy2').value;
	v2[2] = document.getElementById('vz2').value;
	Radius[0] = document.getElementById('R0').value;
	Radius[1] = document.getElementById('R1').value;
	Radius[2] = document.getElementById('R2').value;

	m0 = document.getElementById('m0').value;
	m1 = document.getElementById('m1').value;
	m2 = document.getElementById('m2').value;

	G = document.getElementById('G').value;
	dt = document.getElementById('dt').value;

	rotator.setView(cameraDist);
	far = cameraDist*5;
	mat4.perspective(projectionMatrix, fovy, aspect, near, far);
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
	setLight();

	document.getElementById('startbtn').disabled=false;
	document.getElementById('pausebtn').disabled=false;

	if(!animationstarted)
	{
		animationstarted = true;
		requestAnimationFrame(drawFrame);
	}
}

function setss()
{
	document.getElementById('cd').value=40;
	document.getElementById('x0').value=-5;
	document.getElementById('y0').value=0;
	document.getElementById('z0').value=0;
	document.getElementById('x1').value=5;
	document.getElementById('y1').value=0;
	document.getElementById('z1').value=0;
	document.getElementById('x2').value=0;
	document.getElementById('y2').value=8.66025;
	document.getElementById('z2').value=0;
	document.getElementById('vx0').value=0.158114;
	document.getElementById('vy0').value=-0.273861;
	document.getElementById('vz0').value=0;
	document.getElementById('vx1').value=0.158114;
	document.getElementById('vy1').value=0.273861;
	document.getElementById('vz1').value=0;
	document.getElementById('vx2').value=-0.316228;
	document.getElementById('vy2').value=0;
	document.getElementById('vz2').value=0;
	document.getElementById('m0').value=1;
	document.getElementById('m1').value=1;
	document.getElementById('m2').value=1;
	document.getElementById('G').value=1;
	document.getElementById('dt').value=0.1;
	document.getElementById('R0').value=2.5;
	document.getElementById('R1').value=2.5;
	document.getElementById('R2').value=2.5;
}

function setsje()
{
	//if r and v divided by 10, M should be divided by 1000 to maintain the same angular velocity.
	document.getElementById('cd').value=200000;
	document.getElementById('x0').value=0;
	document.getElementById('y0').value=0;
	document.getElementById('z0').value=0;
	document.getElementById('x1').value=77800;
	document.getElementById('y1').value=0;
	document.getElementById('z1').value=0;
	document.getElementById('x2').value=15000;
	document.getElementById('y2').value=0;
	document.getElementById('z2').value=0;
	document.getElementById('vx0').value=0;
	document.getElementById('vy0').value=0;
	document.getElementById('vz0').value=0;
	document.getElementById('vx1').value=0;
	document.getElementById('vy1').value=0.001306;
	document.getElementById('vz1').value=0;
	document.getElementById('vx2').value=0;
	document.getElementById('vy2').value=0.002978;
	document.getElementById('vz2').value=0;
	document.getElementById('m0').value=1989000000;
	document.getElementById('m1').value=1898000;
	document.getElementById('m2').value=5972;
	document.getElementById('G').value=0.0000000000667408; //The real G!
	document.getElementById('dt').value=10000;
	document.getElementById('R0').value=13920;//The sun is too big to be drawn in the same scale
	document.getElementById('R1').value=7000;
	document.getElementById('R2').value=637;
}

function showframecounter()
{
	var sfc = document.getElementById("sfc")
	if (sfc.checked == false)
		document.getElementById("fc").setAttribute('style','display:none');
	else
		document.getElementById("fc").setAttribute('style','display:inline-block');
}

function start()
{
	started = true;
}

function pause()
{
	started = false;
}