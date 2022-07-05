// Controle de camera com GUI.

import * as THREE from 'three';
import { MTLLoader } from '../Assets/scripts/three.js/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '../Assets/scripts/three.js/examples/jsm/loaders/OBJLoader.js';
import { FlyControls } from '../Assets/scripts/three.js/examples/jsm/controls/FlyControls.js';


var scene,
	renderer,
	camera,
	camControl,
	clock,
	box;

const rendSize = new THREE.Vector2();

function main() {

	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	clock = new THREE.Clock();

	rendSize.x = window.innerWidth * 0.8;
	rendSize.y = window.innerHeight * 0.8;

	renderer.setSize(rendSize.x, rendSize.y);

	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	camControl = new FlyControls(camera, renderer.domElement);

	const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
	scene.add(ambientLight);

	buildScene();

	render();
};

function onProgress(xhr) {

	if (xhr.lengthComputable) {
		const percentComplete = xhr.loaded / xhr.total * 100;
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

	box = new THREE.Box3().setFromObject(obj);
	
	camera.position.x = (box.max.x + box.min.x) / 2.0;
	camera.position.y = box.max.y / 1.0;
	camera.position.z = 0.0;

	var farPlane = Math.max((box.max.x - box.min.x),
		(box.max.y - box.min.y),
		(box.max.z - box.min.z));

	camera.far = farPlane * 10.0;
	camera.updateProjectionMatrix();

	camControl.movementSpeed = 150;
	camControl.lookSpeed = 0.1;
	camControl.rollSpeed = 0.5;
};

function render() {
	var delta = clock.getDelta();
	
	if(box) {
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
		if(camera.position.y < box.min.y+200){
            camera.position.y = box.min.y+200;
        }

        if(camera.position.y > box.max.y+200){
            camera.position.y = box.max.y+200;
        }
	}

	if (camControl) {
		camControl.update(delta);
	}
	renderer.clear();
	
	requestAnimationFrame(render);
	renderer.render(scene, camera);
};

main();
