// Controle de camera com GUI.

import * as THREE from 'three';
import { MTLLoader } from '../Assets/scripts/three.js/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '../Assets/scripts/three.js/examples/jsm/loaders/OBJLoader.js';
import { PointerLockControls } from '../Assets/scripts/three.js/examples/jsm/controls/PointerLockControls.js';


var scene,
	renderer,
	camera,
	camControl;
	
//Declarado como variavel para facilitar limitar o espaço
var box = new THREE.Box3(); 

const rendSize = new THREE.Vector2();
//Painel onde se encontra o botão de começar
const menuPanel = document.getElementById('menuPanel');
//Botão de começar
const startButton = document.getElementById('startButton');

function main() {

	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

	rendSize.x = window.innerWidth * 0.95;
	rendSize.y = window.innerHeight * 0.85;

	renderer.setSize(rendSize.x, rendSize.y);

	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
	scene.add(ambientLight);

	//Evento de clicar em um botão
	document.addEventListener('keydown', keyPress, false);

	//Evento para quando clicar em começar
	startButton.addEventListener(
		'click',
		function () {
			camControl.lock()
		},
		false
	)

	buildScene();

	render();
};

function onProgress(xhr) {

	if (xhr.lengthComputable) {
		const percentComplete = xhr.loaded / xhr.total * 100;
		document.getElementById("output-text").innerHTML = "Visita Andando - " + percentComplete + "%";
		console.log(Math.round(percentComplete, 2) + '% downloaded');
	}
};

function buildScene() {

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
	camera.position.x = 75;
    camera.position.y = 50;
    camera.position.z = 1;

	var farPlane = Math.max((box.max.x - box.min.x),
		(box.max.y - box.min.y),
		(box.max.z - box.min.z));

	camera.far = farPlane * 10.0;
	camera.updateProjectionMatrix();

	// Camera primeira pessoa
	camControl = new PointerLockControls(camera, renderer.domElement);

	//Eventos para quando clicar em começar
	camControl.addEventListener('lock', () => (menuPanel.style.display = 'none'));
	camControl.addEventListener('unlock', () => (menuPanel.style.display = 'block'));
};

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
};

/*
 * Função que faz a movimentação baseado na tecla.
 * Também faz o cálculo dos limites das paredes e teto.
 */
function keyPress(event) {

	if(event.code == 'KeyW' || event.code == 'ArrowUp'){
		camControl.moveForward(12.5);
	}
	if(event.code == 'KeyS' || event.code == 'ArrowDown'){
		camControl.moveForward(-12.5);
	}
	if(event.code == 'KeyA' || event.code == 'ArrowLeft'){
		camControl.moveRight(-12.5);
	}
	if(event.code == 'KeyD' || event.code == 'ArrowRight'){
		camControl.moveRight(12.5);
	}
	
	if(camera.position.x > box.max.x-500){
		camera.position.x = box.max.x-500;
	}
	
	if(camera.position.x < box.min.x+500){
		camera.position.x = box.min.x+500;	
	}
	
	if(camera.position.z > box.max.z-550){
		camera.position.z = box.max.z-550;
	}
	
	if(camera.position.z < box.min.z+550){
		camera.position.z = box.min.z+550;
	}
};

main();
