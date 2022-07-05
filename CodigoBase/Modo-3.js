// Controle de camera com GUI.

import * as THREE from 'three';
import { MTLLoader } from '../Assets/scripts/three.js/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '../Assets/scripts/three.js/examples/jsm/loaders/OBJLoader.js';
import { PointerLockControls } from '../Assets/scripts/three.js/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from '../Assets/scripts/three.js/examples/jsm/loaders/GLTFLoader.js';

var scene,
	renderer,
	camera,
	camControl,
	clock,
	mixer,
	delta,
	model,
	actionAvatarIdle,
	actionAvatarRun,
	actionAvatarPose,
	actionAvatarWalk,
	percentComplete,
	aux = false,
	cooldown,
	controle = 0,
	controleBool = true;

var animationActionAvatarIdle, 
	animationActionAvatarRun,
	animationActionAvatarPose,
	animationActionAvatarWalk;

var box = new THREE.Box3(); 

const rendSize = new THREE.Vector2();
//Painel onde se encontra o botão de começar
const menuPanel = document.getElementById('menuPanel');
//Botão de começar
const startButton = document.getElementById('startButton');


function main() {

	renderer = new THREE.WebGLRenderer();

	clock = new THREE.Clock();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

	rendSize.x = window.innerWidth * 0.95;
	rendSize.y = window.innerHeight * 0.85;

	renderer.setSize(rendSize.x, rendSize.y);

	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
	scene.add(ambientLight);

	startButton.addEventListener(
		'click',
		function () {
			aux = true;
			camControl.lock()
		},
		false
	)

	buildScene();

	render();
};

function onProgress(xhr) {

	if (xhr.lengthComputable) {
		percentComplete = xhr.loaded / xhr.total * 100;
		document.getElementById("output-text").innerHTML = "Visita Guiada - " + percentComplete + "%";
		console.log(Math.round(percentComplete, 2) + '% downloaded');
	}
};

function buildScene() {
	const loader = new GLTFLoader();
	loader.load( '../Assets/Models/glTF/Soldier/Soldier.glb', function ( gltf ) {
		model = gltf.scene;
		model.scale.set(50,50,50);

		mixer = new THREE.AnimationMixer( gltf.scene );

		const animations = gltf.animations;
		console.log(gltf.animations);

		actionAvatarIdle = animations[0]; 
		actionAvatarRun = animations[1];
		actionAvatarPose = animations[2];
		actionAvatarWalk = animations[3];

		if(mixer) {
			if(actionAvatarIdle) {
				animationActionAvatarIdle = mixer.clipAction(actionAvatarIdle)
			}
			if(actionAvatarRun){
				animationActionAvatarRun = mixer.clipAction(actionAvatarRun)
			}
			if(actionAvatarPose) {
				animationActionAvatarPose = mixer.clipAction(actionAvatarPose)
			}
			if(actionAvatarWalk) {
				animationActionAvatarWalk = mixer.clipAction(actionAvatarWalk)
			}
		}

		model.position.x = -878;
		model.position.y = 0;
		model.position.z = -161;
		model.rotation.y -= 4.7;

		scene.add( model );

		if(animationActionAvatarIdle)
			animationActionAvatarIdle.play();

	}, undefined, function ( e ) {

		console.error( e );

	} );

	var objMTL = new MTLLoader();
	objMTL.setPath('../Assets/Models/OBJ/sponza/');
	objMTL.load('sponza.mtl', loadMaterials);
};

function loadMaterials(materials) {

	materials.preload();

	var objLoader = new OBJLoader();

	objLoader.setMaterials(materials)
	objLoader.setPath('../Assets/Models/OBJ/sponza/')
	objLoader.load('sponza.obj', loadMesh, onProgress);
};

function loadMesh(object) {

	object.name = "cena";

	scene.add(object);

	ajusteCamera();
};

function ajusteCamera() {

	var obj = scene.getObjectByName("cena");

	const helper = new THREE.BoxHelper();
	helper.setFromObject(obj);

	helper.geometry.computeBoundingBox();

	box.setFromObject(obj);

	//Posicionamento em primeira pessoa
	camera.position.x = -1026;
    camera.position.y = 50;
    camera.position.z = -154;

	camera.lookAt(new THREE.Vector3( -780, 0.0, -253));

	var farPlane = Math.max((box.max.x - box.min.x),
		(box.max.y - box.min.y),
		(box.max.z - box.min.z));

	camera.far = farPlane * 10.0;
	camera.updateProjectionMatrix();

	// Camera primeira pessoa
	camControl = new PointerLockControls(camera, renderer.domElement);
	camControl.pointerSpeed = 0.0;

	//Eventos para quando clicar em começar
	camControl.addEventListener('lock', () => (menuPanel.style.display = 'none'));
	camControl.addEventListener('unlock', () => (menuPanel.style.display = 'block'));
};

function render() {
	if(percentComplete == 100 && aux){
		if(controle == 0)
			seApresenta();
		if(controle == 1)
			irAoPrimeiroPonto();
		if(controle == 2)
			parada1();
		if(controle == 3)
			irAoProximoPonto();
		if(controle == 4)
			parada2();
		if(controle == 5)
			irAoProximoPonto();
		if(controle == 6)
			parada3();
		if(controle == 7)
			irAoProximoPonto();
		if(controle == 8)
			parada4();
		if(controle == 9)
			return;

			
	}
	if(clock) {
		delta = clock.getDelta();
	}
	if(mixer) {
		mixer.update(delta);
	}
	renderer.render(scene, camera);
	requestAnimationFrame(render);
};

function virarDeCostas(){
	model.rotation.y -= Math.PI - 0.3;
}

function seApresenta(){
	if(controleBool){
		cooldown = Date.now() + 5000;
		controleBool = false;
	}
	if(Date.now() >= cooldown){
		controle++;
		controleBool = true;
	}
}

function irAoPrimeiroPonto(){
	if(controleBool){
		cooldown = Date.now() + 13000;
		controleBool = false;
		virarDeCostas();
		camera.lookAt(new THREE.Vector3( 1227, 0.0, -174));
		animationActionAvatarWalk.play();
	}
	if(Date.now() < cooldown){
		model.position.x += 0.5;
		camControl.moveForward(0.5);
	}
	else{
		controle++;
		controleBool = true;
	}
}

function irAoProximoPonto(){
	if(controleBool){
		cooldown = Date.now() + 13000;
		controleBool = false;
		model.rotation.y += Math.PI + 0.3;
		camera.lookAt(new THREE.Vector3( 1227, 0.0, -174));
		animationActionAvatarWalk.paused = false;
	}
	if(Date.now() < cooldown){
		model.position.x += 0.5;
		camControl.moveForward(0.5);
	}
	else{
		controle++;
		controleBool = true;
	}
}

function parada1(){
	if(controleBool){
		cooldown = Date.now() + 10000;
		controleBool = false;
		animationActionAvatarWalk.paused = true;
		model.rotation.y -= Math.PI + 0.3;
		camera.lookAt(new THREE.Vector3( -500, 50, -191));
	}
	if(Date.now() >= cooldown){
		controle++;
		controleBool = true;
	}
}


function parada2(){
	if(controleBool){
		cooldown = Date.now() + 10000;
		controleBool = false;
		animationActionAvatarWalk.paused = true;
		model.rotation.y -= Math.PI + 0.3;
		camera.lookAt(new THREE.Vector3( -43, 50, -245));
	}
	if(Date.now() >= cooldown){
		controle++;
		controleBool = true;
	}
}

function parada3(){
	if(controleBool){
		cooldown = Date.now() + 10000;
		controleBool = false;
		animationActionAvatarWalk.paused = true;
		model.rotation.y -= Math.PI + 0.3;
		camera.lookAt(new THREE.Vector3( 288, 50, -269));
	}
	if(Date.now() >= cooldown){
		controle++;
		controleBool = true;
	}
}

function parada4(){
	if(controleBool){
		cooldown = Date.now() + 10000;
		controleBool = false;
		animationActionAvatarWalk.paused = true;
		model.rotation.y -= Math.PI + 0.3;
		camera.lookAt(new THREE.Vector3( 645, 50, -262));
	}
	if(Date.now() >= cooldown){
		controle++;
		controleBool = true;
	}
}

main();