let r,o,t,i,n={x:0,y:0};function v(){const e=document.querySelector(".hero");r=new THREE.Scene,o=new THREE.OrthographicCamera(-1,1,1,-1,0,1),t=new THREE.WebGLRenderer({alpha:!0,antialias:!0}),t.setSize(e.clientWidth,e.clientHeight),t.setPixelRatio(window.devicePixelRatio),e.appendChild(t.domElement);const c=new THREE.PlaneGeometry(2,2);i=new THREE.ShaderMaterial({uniforms:{time:{value:0},resolution:{value:new THREE.Vector2(window.innerWidth,window.innerHeight)},mouse:{value:new THREE.Vector2},isMobile:{value:window.innerWidth<=768}},vertexShader:`
					varying vec2 vUv;
					void main() {
						vUv = uv;
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}
				`,fragmentShader:`
					uniform float time;
					uniform vec2 resolution;
					uniform vec2 mouse;
					uniform bool isMobile;
					varying vec2 vUv;
					
					#define PI 3.14159265359
					
					float scanline(vec2 uv) {
						return sin(uv.y * resolution.y * 1.0 + time * 3.0) * 0.03 + 0.97;
					}
					
					float vignette(vec2 uv) {
						uv *= 1.0 - uv.yx;
						float vig = uv.x * uv.y * 12.0;
						return pow(vig, 0.3);
					}
					
					vec3 palette(float t) {
						vec3 col = vec3(
							0.5 + 0.4 * sin(t * PI + 0.5),    // Softer cyan
							0.5 + 0.4 * sin(t * PI + 2.0),    // Softer magenta
							0.5 + 0.4 * sin(t * PI + 4.0)     // Softer yellow
						);
						return clamp(col, 0.0, 1.0) * 0.8 + 0.2; // Add white tint
					}
					
					void main() {
						vec2 uv = vUv - 0.5;
						
						// Reduced perspective distortion
						uv *= 1.0 + length(uv) * 0.3;
						
						// Slower rotating grid
						float angle = time * 0.1;
						uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
						vec2 gridUV = uv * 12.0;

						// Softer grid calculation
						float gridX = smoothstep(0.97, 0.98, fract(gridUV.x));
						float gridY = smoothstep(0.97, 0.98, fract(gridUV.y));
						float grid = (gridX + gridY) * 0.5;
						
						// Subtler hexagons
						vec2 hexUV = uv * 6.0;
						hexUV.y += time * 0.5;
						hexUV.x += sin(hexUV.y * 0.5 + time) * 0.3;
						float hex = length(abs(fract(hexUV) - 0.5));
						hex = smoothstep(0.3, 0.29, hex) * 0.4;
						
						// Reduced chromatic aberration
						vec3 color;
						for(int i = 0; i < 3; i++) {
							float t = time * 0.3 + float(i) * 0.05;
							vec2 offsetUV = uv * (1.0 + float(i) * 0.001);
							float pattern = sin(offsetUV.x * 15.0 + t) * 
									  cos(offsetUV.y * 12.0 + t) * 
									  sin(offsetUV.x * offsetUV.y * 20.0 + t);
							color[i] = pattern * 0.3 + 0.5;
						}
						
						// Color processing
						color = palette(length(uv) * 1.5 + time * 0.3);
						color *= mix(0.9, 1.1, scanline(vUv));
						color *= vignette(vUv);
						
						// Reduced grid visibility
						color = mix(color, vec3(1.0), grid * 0.05);
						
						// Subtler hexagons
						color += hex * vec3(0.05, 0.15, 0.25);
						
						// Softer mouse interaction
						if (!isMobile) {
							vec2 mouseUV = mouse * 0.5 + 0.5;
							float dist = length(vUv - mouseUV);
							color += smoothstep(0.3, 0.0, dist) * vec3(0.05, 0.1, 0.15);
							color *= 1.0 - smoothstep(0.0, 0.2, dist) * 0.1;
						} else {
							// Reduced mobile effect
							float pulse = sin(time * 1.5) * 0.5 + 0.5;
							color *= 1.0 + pulse * 0.05;
						}

						// Minimal CRT curvature
						vec2 screenUV = vUv * 2.0 - 1.0;
						float curve = dot(screenUV, screenUV) * 0.05;
						color *= 1.0 - curve * 0.3;
						
						// More transparent background
						gl_FragColor = vec4(color * 0.7, 0.8);
					}
				`});const s=new THREE.Mesh(c,i);r.add(s),window.addEventListener("resize",u,!1),window.addEventListener("mousemove",l=>{window.innerWidth>768&&(n.x=l.clientX/window.innerWidth*2-1,n.y=-(l.clientY/window.innerHeight)*2+1)})}function u(){const e=document.querySelector(".hero");t.setSize(e.clientWidth,e.clientHeight),i.uniforms.resolution.value.set(e.clientWidth,e.clientHeight),o.aspect=e.clientWidth/e.clientHeight,o.updateProjectionMatrix()}function a(){requestAnimationFrame(a),i.uniforms.time.value+=.003,window.innerWidth>768&&i.uniforms.mouse.value.set(n.x,n.y),t.render(r,o)}v();a();
