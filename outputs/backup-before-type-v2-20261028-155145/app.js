/* CARDS v19 — independent card springs with continuous drag and release. */
(async () => {
  'use strict';
  const artworks=window.CARD_WORKS;
  const colors=artworks.map(work=>({name:work.title,value:parseInt(work.color.slice(1),16)}));
  const config = {
    width:3.45, height:2.24, thickness:.18, spacing:1.90, pool:13, lift:.70,
    // 摄像机：降低 cameraHeight 会减小俯视角，让队列在画面里更平、更紧凑。
    cameraHeight:6.8,       // 原值 10.8；可从 5.5～8.0 之间微调
    cameraTargetY:1.7,      // 镜头看向的高度；增大会让画面中的物体整体向下移动
    cameraZoom:1.20,        // 放大倍率；越大卡片越大，与容器高度分开控制
    cameraMinZoom:.65, cameraMaxZoom:2.40, dragSensitivity:.005,
    // 光学卡片：透明基片 + 平面印刷封面。边距为四边相同的场景单位。
    coverTextureWidth:1280, // GPU 上传尺寸；原始 1280px 封面文件保持不变
    coverInset:.16, glassTransmission:.72, glassRoughness:.035, glassIridescence:0,
    // 一体成型透明边：外凸缘 → 浅槽 → 内唇边；这些是实际曲面，不是描边贴图。
    edgeBevel:.055, rimRise:.070, grooveDepth:.045, grooveOcclusion:.16, edgeBevelSegments:8,
    // 512 × 256 反射图；所有材质共用一次 PMREM 烘焙，地面环境强度仍为 0。
    reflectionWidth:512,
    reflectionYaw:75,          // 环境水平旋转角度（度）
    reflectionPeak:6,         // 白色灯条的相对反射亮度；不会提高暗区亮度
    // 首屏：缩短停留/推进，起降集中在中央附近，邻卡落地后保持静止。
    holdSeconds:.75, travelSeconds:1.4, liftInner:.04, liftOuter:.86,
    // 第二屏主卡：拖动姿态（度）、跟手速度、松手后的回摆速度与阻尼。
    tiltPitch:3, tiltYaw:28, tiltRoll:12,
    tiltFollowResponse:26, tiltRecoilResponse:12, tiltRecoilDamping:.48
  };
  const works=artworks;
  const $ = id => document.getElementById(id);
  const stage = $('stage'), status = $('scene-status');
  const feedback=$('save-feedback');
  const gallery=$('gallery'),story=$('story'),featuredUI=$('featured-ui'),mainLink=$('main-card-link');
  const previousButton=$('previous-work'),nextButton=$('next-work'),dotButtons=[];
  let scrollProgress=0,sceneBlend=0,selectedLogical=0,carouselPosition=0,selectionTween=null;
  let browseGesture=null,suppressClickUntil=0,scrollRaf=0;
  let anchorTarget=0,screenTransition=null,expectedScrollY=0,verticalTouch=null;
  let wheelTime=0,wheelDirection=0,wheelDistance=0,wheelLatched=false;
  const viewport={width:0,height:0,pageHeight:0,resizes:0};
  const RETURN_STORAGE_KEY='portfolio.branch2.return.v1';
  let cameraControlsEnabled=false,viewSaved=false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let motionPreference=reducedMotion.matches;
  const createTilt=()=>({rotation:{x:0,y:0,z:0},velocity:{x:0,y:0,z:0},target:{x:0,y:0,z:0},
    mode:'idle',moving:false,direction:0,interactions:0});
  const cardTilts=new Map();
  let materialTilt=createTilt(),tiltMoving=false;
  const tiltFor=logical=>{if(!cardTilts.has(logical))cardTilts.set(logical,{...createTilt(),logical});return cardTilts.get(logical);};
  let playing = !reducedMotion.matches, phase=0, active=-1, dragging=false;
  let lastTime=0, raf=0, resumeAt=0, suspended=false, contextLost=false;
  let autoLeg=null, frameSpeed=0, motionStage='hold';
  let needsRender=true,lastRenderedPhase=NaN,bootEpoch=0;
  const startup={ready:false,startedAt:performance.now(),readyAt:0,environmentBakes:0,compileMs:0,firstRenderMs:0};
  const yieldTask=()=>window.scheduler?.yield?window.scheduler.yield():new Promise(resolve=>setTimeout(resolve,0));
  const nextPaint=()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
  let reflectionTarget=null,studioTarget=null,reflectionStatus='loading';
  const mod=(v,n)=>((v%n)+n)%n;
  const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const CAMERA_STORAGE_KEY='portfolio.branch2.camera.v1';
  const cameraDefaults={
    azimuth:Math.atan2(-8.8,13.5),
    elevation:Math.atan2(config.cameraHeight-config.cameraTargetY,Math.hypot(-8.8,13.5)),
    zoom:config.cameraZoom
  };
  const cameraView={...cameraDefaults};
  const orbitRadius=Math.hypot(-8.8,config.cameraHeight-config.cameraTargetY,13.5);
  const pointers=new Map();let gesture=null,feedbackTimer=0;
  let renderer,scene,camera,ground,key,cards=[],shadowTexture,coverTextures=[],coverLoaded=0,materialSets=[],descriptions=[],coverReady;
  const lerp=(a,b,t)=>a+(b-a)*t;
  const isBrowsing=()=>anchorTarget===1&&!screenTransition&&scrollProgress===1;
  const heroSpacing=()=>Math.max(3.25,(camera.right-camera.left)/camera.zoom/2+.55);
  const workUrl=index=>works[index].placeholder?null:works[index].url||`detail.html?work=${encodeURIComponent(works[index].slug)}`;
  let raycaster,rayPointer;
  // Let the document paint before creating a GPU context.
  await nextPaint();
  try {
    if(!window.THREE) throw new Error('3D library is missing');
    raycaster=new THREE.Raycaster();rayPointer=new THREE.Vector2();
    renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,alpha:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setClearColor(0xf4f3ef,1);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.07;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
    scene=new THREE.Scene();
    scene.fog=new THREE.Fog(0xf4f3ef,25,62);
    // The procedural studio is created only if the small reflection asset fails.
    scene.environment=null;
    camera=new THREE.OrthographicCamera(-4,4,5,-5,.1,80);
    restoreCameraView();applyCameraView(false,false);
    const sky=new THREE.HemisphereLight(0xffffff,0xdfded7,2.3);scene.add(sky);
    key=new THREE.DirectionalLight(0xfff9f0,2.6);key.position.set(3.8,11,5.5);key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-11;key.shadow.camera.right=11;
    key.shadow.camera.top=14;key.shadow.camera.bottom=-14;key.shadow.camera.near=.5;key.shadow.camera.far=42;
    key.shadow.bias=-.00008;key.shadow.normalBias=.018;key.shadow.radius=3.5;scene.add(key);
    const fill=new THREE.DirectionalLight(0xedf1ff,.85);fill.position.set(-5,6,-8);scene.add(fill);
    const edge=new THREE.DirectionalLight(0xffffff,.35);edge.position.set(-5,2,-7);scene.add(edge);
    // A physical XZ floor at y=0. Only this surface receives cast shadows.
    // No vertical backdrop, transparent shadow catcher, or card-to-card shadows.
    ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0xf0efea,roughness:1,metalness:0,envMapIntensity:0}));
    ground.name='horizontal-ground';ground.rotation.x=-Math.PI/2;ground.position.y=0;
    ground.receiveShadow=true;ground.castShadow=false;scene.add(ground);
    shadowTexture=createShadowTexture();
    const geometry=cardGeometry(config.width,config.height,.12);
    const coverGeometry=new THREE.ShapeGeometry(roundedShape(config.width-config.coverInset*2,config.height-config.coverInset*2,.035));
    // ShapeGeometry starts with world-space UVs; map the whole flat print to [0,1].
    const uv=coverGeometry.attributes.uv,positions=coverGeometry.attributes.position;
    for(let i=0;i<uv.count;i++)uv.setXY(i,positions.getX(i)/(config.width-2*config.coverInset)+.5,positions.getY(i)/(config.height-2*config.coverInset)+.5);
    coverTextures=loadCoverTextures();
    descriptions=works.map(createDescriptionTexture);
    materialSets=colors.map(tint=>{
      const face=new THREE.MeshPhysicalMaterial({
        name:'translucent-'+tint.name,color:tint.value,metalness:0,roughness:config.glassRoughness,
        transmission:config.glassTransmission,clearcoat:.65,clearcoatRoughness:.02,
        envMapIntensity:1.05,thickness:config.thickness,ior:1.49,
        attenuationColor:tint.value,attenuationDistance:.8,iridescence:0
      });
      const rim=face.clone();rim.name=face.name+'-rim';rim.vertexColors=true;rim.roughness=.022;
      return [face,rim];
    });
    const backing=new THREE.MeshStandardMaterial({color:0xe8e5e0,metalness:0,roughness:.4,envMapIntensity:.15});
    for(let i=0;i<config.pool;i++){
      const group=new THREE.Group();
      const material=materialSets[0][0];
      const card=new THREE.Mesh(geometry,materialSets[0]);card.name='molded-card-substrate';
      // The inset print casts the main shadow; the translucent border stays light.
      card.castShadow=false;card.receiveShadow=false;group.add(card);
      const printMaterial=new THREE.MeshPhysicalMaterial({
        map:coverTextures[0]||null,color:0xffffff,roughness:.23,metalness:0,
        clearcoat:.65,clearcoatRoughness:.025,envMapIntensity:.35,shadowSide:THREE.DoubleSide
      });
      const cover=new THREE.Mesh(coverGeometry,printMaterial);cover.name='flat-inset-cover';
      cover.position.z=config.thickness/2+.007;cover.castShadow=true;cover.receiveShadow=false;cover.visible=true;group.add(cover);
      const back=new THREE.Mesh(coverGeometry,backing);back.name='print-backing';
      back.rotation.y=Math.PI;back.position.z=config.thickness/2+.004;back.visible=true;group.add(back);
      scene.add(group);
      const shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,opacity:.19,depthWrite:false,color:0x626957});
      const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.35),shadowMaterial);
      shadow.rotation.x=-Math.PI/2;shadow.position.y=.002;scene.add(shadow);
      // Text is a normal mesh in the same local XY plane as the card, never a sprite.
      const descriptionMaterial=new THREE.MeshBasicMaterial({map:descriptions[0],transparent:true,opacity:0,depthWrite:false,depthTest:true,toneMapped:false});
      const description=new THREE.Mesh(new THREE.PlaneGeometry(3.65,1.12),descriptionMaterial);
      description.name='card-description';description.position.set(0,config.height/2+.74,config.thickness/2+.016);
      group.add(description);
      cards.push({group,card,material,cover,shadow,description,descriptions,logical:NaN,workIndex:-1,colorIndex:0,lift:0});
    }
    status.hidden=true;
  } catch(error) {
    status.textContent='暂时无法开启 3D 场景。请使用支持 WebGL 的浏览器，并开启硬件加速。';
    status.hidden=false;console.error(error);return;
  }

  function roundedShape(w,h,r){
    const shape=new THREE.Shape(),x=-w/2,y=-h/2;
    shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);
    shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
    shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
    return shape;
  }
  function cardGeometry(w,h,r){
    // Sweep a smooth cross-section around a rounded rectangle. Front, rim, groove,
    // side and back form one shared mesh: no intersecting tubes or coplanar decals.
    const front=config.thickness/2,inset=config.coverInset-.005,b=config.edgeBevel;
    const rise=config.rimRise,groove=front+rise-config.grooveDepth,rimScale=inset/.155;
    const profile=[];
    const curve=(a,c1,c2,d,steps=6)=>{
      const bezier=new THREE.CubicBezierCurve(...[a,c1,c2,d].map(v=>new THREE.Vector2(v[0]*(v[0]>=0?rimScale:b/.055),v[1])));
      const points=bezier.getPoints(steps);if(profile.length)points.shift();profile.push(...points);
    };
    // Coordinates are [inset from nominal perimeter, depth]. Two rounded crests
    // flank a genuinely recessed groove, with continuous tangents at each join.
    curve([.155,front],[.143,front],[.132,front+.035],[.113,front+.035]);
    curve([.113,front+.035],[.095,front+.035],[.091,groove],[.073,groove]);
    curve([.073,groove],[.052,groove],[.041,front+rise],[.016,front+rise],8);
    curve([.016,front+rise],[-.025,front+rise],[-.055,front+.025],[-.055,front-.02],8);
    curve([-.055,front-.02],[-.055,front-.04],[-.055,-front+.05],[-.055,-front+.035],2);
    curve([-.055,-front+.035],[-.055,-front+.012],[-.025,-front],[0,-front],8);
    const positions=[],normals=[],uvs=[],colors=[];
    const appendCap=(points,z,back=false)=>{
      const cap=new THREE.ShapeGeometry(new THREE.Shape(points.map(p=>new THREE.Vector2(p.x,p.y)))).toNonIndexed();
      const p=cap.attributes.position;
      for(let i=0;i<p.count;i+=3)for(const offset of back?[2,1,0]:[0,1,2]){
        const j=i+offset,x=p.getX(j),y=p.getY(j);positions.push(x,y,z);normals.push(0,0,back?-1:1);uvs.push(x/w+.5,y/h+.5);colors.push(1,1,1);
      }
      cap.dispose();
    };
    const ring=p=>{
      const a=w/2-p.x,c=h/2-p.x,corner=Math.max(.035,r-p.x),points=[];
      for(let quadrant=0;quadrant<4;quadrant++){
        const cx=(quadrant===0||quadrant===3?1:-1)*(a-corner),cy=(quadrant<2?1:-1)*(c-corner);
        for(let k=0;k<=config.edgeBevelSegments;k++){
          const theta=(quadrant+k/config.edgeBevelSegments)*Math.PI/2,nx=Math.cos(theta),ny=Math.sin(theta);
          points.push({x:cx+corner*nx,y:cy+corner*ny,z:p.y,nx,ny});
        }
      }
      return points;
    };
    const rings=profile.map(ring),count=rings[0].length;
    appendCap(rings[0],front);appendCap(rings[rings.length-1],-front,true);
    const capCount=positions.length/3;
    const normalAt=(i,j)=>{
      const prev=rings[Math.max(0,i-1)][j],next=rings[Math.min(rings.length-1,i+1)][j],p=rings[i][j];
      const dz=next.z-prev.z,dr=(next.x-prev.x)*p.nx+(next.y-prev.y)*p.ny;
      // Both cap junctions have exact planar normals.
      if(i===0)return new THREE.Vector3(0,0,1);
      if(i===rings.length-1)return new THREE.Vector3(0,0,-1);
      return new THREE.Vector3(-dz*p.nx,-dz*p.ny,dr).normalize();
    };
    const ringNormals=rings.map((row,i)=>row.map((_,j)=>normalAt(i,j)));
    const indices=Array.from({length:capCount},(_,i)=>i);
    const vertex=(i,j)=>{
      const p=rings[i][j],n=ringNormals[i][j];positions.push(p.x,p.y,p.z);normals.push(n.x,n.y,n.z);uvs.push(j/count,i/(rings.length-1));
      // Very light cavity shading only at the modeled groove floor. Highlights and
      // Fresnel reflection remain view dependent; no black outline or extra texture.
      const cavity=profile[i].y>front?Math.exp(-Math.pow((profile[i].x/rimScale-.073)/.014,2)):0;
      const shade=1-config.grooveOcclusion*cavity;colors.push(shade,shade,shade);
    };
    for(let i=0;i<rings.length;i++)for(let j=0;j<count;j++)vertex(i,j);
    for(let i=0;i<rings.length-1;i++)for(let j=0;j<count;j++){
      const next=(j+1)%count,a=capCount+i*count+j,b=a+count,c=capCount+(i+1)*count+next,d=capCount+i*count+next;
      indices.push(a,b,c,a,c,d);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    geometry.setIndex(indices);geometry.addGroup(0,capCount,0);geometry.addGroup(capCount,indices.length-capCount,1);
    geometry.computeBoundingSphere();
    return geometry;
  }
  function createShadowTexture(){
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.translate(128,64);ctx.scale(1,.5);
    const gradient=ctx.createRadialGradient(0,0,5,0,0,125);gradient.addColorStop(0,'rgba(255,255,255,.6)');gradient.addColorStop(.3,'rgba(255,255,255,.35)');gradient.addColorStop(.65,'rgba(255,255,255,.09)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(-128,-128,256,256);
    return new THREE.CanvasTexture(canvas);
  }
  function createDescriptionTexture(work,index){
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=390;
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1280,390);
    ctx.fillStyle='#3c4237';let size=132;
    do{ctx.font=`600 ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`;size-=4;}while(ctx.measureText(work.title).width>1230&&size>60);
    ctx.fillText(work.title,12,132);
    ctx.fillStyle='#848a7b';ctx.font='76px "PingFang SC", "Microsoft YaHei", sans-serif';
    let line='',lines=[];
    for(const char of work.summary||work.description){if(ctx.measureText(line+char).width>1210){lines.push(line);line=char;}else{line+=char;}}
    if(line)lines.push(line);
    lines.slice(0,3).forEach((line,i)=>ctx.fillText(line,15,225+i*80));
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return texture;
  }
  function createStudioEnvironment(){
    // Static studio reflection rig, baked once. It lights the clear edge without extra per-frame lights.
    const studio=new THREE.Scene();studio.background=new THREE.Color(0xd5d6d6);
    const room=new THREE.Mesh(new THREE.BoxGeometry(28,22,28),new THREE.MeshBasicMaterial({color:0xbec1c2,side:THREE.BackSide}));studio.add(room);
    const panel=(w,h,x,y,z,color,intensity=1)=>{
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide}));
      mesh.position.set(x,y,z);mesh.lookAt(0,0,0);studio.add(mesh);
    };
    // Narrow softboxes and black flags produce crisp alternating reflections on the curved edge.
    panel(3.0,16,8,5,7,0xfffcf7,2.6);
    panel(.65,16,-8,3,4,0xffffff,3.0);
    panel(11,1.2,0,10,-2,0xffffff,2.8);
    panel(3.5,18,5,0,-9,0x080b10,.5);
    panel(2.6,16,-7,0,-8,0x0a0d12,.45);
    panel(.6,16,3.1,0,-9,0xffffff,2.8);
    const pmrem=new THREE.PMREMGenerator(renderer);
    studioTarget=pmrem.fromScene(studio,0,.1,50);
    studio.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});pmrem.dispose();
    return studioTarget.texture;
  }
  async function decodedImage(url){
    const image=new Image();image.decoding='async';image.src=url;
    await image.decode();return image;
  }
  async function loadReflectionEnvironment(epoch){
    // One small panorama, one bake. No temporary environment or shader-variant swap.
    reflectionStatus='loading';startup.stages=[];
    let input=null,pmrem=null;
    try{
      if(!window.CARD_REFLECTION_ENV)throw new Error('Missing assets/reflections.js');
      const source=await decodedImage(window.CARD_REFLECTION_ENV);
      if(contextLost||epoch!==bootEpoch)return false;
      pmrem=new THREE.PMREMGenerator(renderer);pmrem.compileEquirectangularShader();
      await yieldTask();
      const width=config.reflectionWidth,height=width/2,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0,width,height);
      const pixels=ctx.getImageData(0,0,width,height).data,data=new Uint16Array(width*height*4);
      const shift=Math.round(config.reflectionYaw/360*width),linear=new Float32Array(256);
      for(let i=0;i<256;i++){const v=i/255;linear[i]=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}
      const half=THREE.DataUtils.toHalfFloat,one=half(1);let deadline=performance.now()+6;
      for(let y=0;y<height;y++){
        for(let x=0;x<width;x++){
          const src=((height-1-y)*width+mod(x+shift,width))*4,dst=(y*width+x)*4;
          const r=linear[pixels[src]],g=linear[pixels[src+1]],b=linear[pixels[src+2]];
          const gain=1+(config.reflectionPeak-1)*smooth(.5,.95,.2126*r+.7152*g+.0722*b);
          data[dst]=half(r*gain);data[dst+1]=half(g*gain);data[dst+2]=half(b*gain);data[dst+3]=one;
        }
        if(performance.now()>deadline){await yieldTask();deadline=performance.now()+6;}
        if(contextLost||epoch!==bootEpoch)return false;
      }
      canvas.width=canvas.height=1;
      input=new THREE.DataTexture(data,width,height,THREE.RGBAFormat,THREE.HalfFloatType);
      input.minFilter=THREE.LinearFilter;input.magFilter=THREE.LinearFilter;input.colorSpace=THREE.LinearSRGBColorSpace;
      input.mapping=THREE.EquirectangularReflectionMapping;input.needsUpdate=true;
      await nextPaint();if(contextLost||epoch!==bootEpoch)return false;
      const bakeStart=performance.now();const target=pmrem.fromEquirectangular(input);startup.stages.push({stage:'environment',start:bakeStart,ms:performance.now()-bakeStart});startup.environmentBakes++;
      if(reflectionTarget)reflectionTarget.dispose();
      if(studioTarget){studioTarget.dispose();studioTarget=null;}
      reflectionTarget=target;scene.environment=target.texture;
      reflectionStatus='ready';return true;
    }catch(error){
      if(contextLost||epoch!==bootEpoch)return false;
      console.warn('Reflection panorama unavailable; using procedural studio.',error);
      scene.environment=createStudioEnvironment();startup.environmentBakes++;
      reflectionStatus='fallback';return true;
    }finally{if(input)input.dispose();if(pmrem)pmrem.dispose();}
  }
  function loadCoverTextures(){
    if(!window.CARD_COVERS||window.CARD_COVERS.length!==works.length)throw new Error('Cover artwork is missing');
    const jobs=[],textures=window.CARD_COVERS.map(url=>{
      const texture=new THREE.Texture();
      texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
      jobs.push(decodedImage(url).then(async image=>{
        const width=Math.min(config.coverTextureWidth,image.width),height=Math.round(width*image.height/image.width);
        // Keep the originals on disk; resize only the GPU copy for a mobile-sized card.
        try{
          texture.image=await createImageBitmap(image,{resizeWidth:width,resizeHeight:height,resizeQuality:'high',
            imageOrientation:'flipY',premultiplyAlpha:'none',colorSpaceConversion:'none'});
          texture.flipY=false;
        }catch(error){
          const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
          canvas.getContext('2d').drawImage(image,0,0,width,height);texture.image=canvas;
        }
        const targetAspect=(config.width-2*config.coverInset)/(config.height-2*config.coverInset),imageAspect=image.width/image.height;
        if(imageAspect<targetAspect){texture.repeat.y=imageAspect/targetAspect;texture.offset.y=(1-texture.repeat.y)/2;}
        else{texture.repeat.x=targetAspect/imageAspect;texture.offset.x=(1-texture.repeat.x)/2;}
        texture.needsUpdate=true;coverLoaded++;
      }));
      return texture;
    });
    // Observe failures immediately; surface them when the startup stage joins these jobs.
    coverReady=Promise.allSettled(jobs);return textures;
  }
  async function prepareScene(){
    const epoch=++bootEpoch,isCurrent=()=>!contextLost&&epoch===bootEpoch;
    startup.ready=false;startup.readyAt=0;startup.environmentBakes=0;startup.startedAt=performance.now();
    try{
      const [environmentReady,images]=await Promise.all([loadReflectionEnvironment(epoch),coverReady]);
      if(!environmentReady||!isCurrent())return;
      if(images.some(result=>result.status==='rejected'))throw new Error('Cover artwork could not be decoded');
      // Stage GPU uploads instead of forcing every image through the first visible frame.
      for(const texture of [...coverTextures,...descriptions,shadowTexture]){
        const uploadStart=performance.now();renderer.initTexture(texture);startup.stages.push({stage:'upload',start:uploadStart,ms:performance.now()-uploadStart});await yieldTask();if(!isCurrent())return;
      }
      updateScene();
      const compileStart=performance.now();
      // Transmission uses a linear offscreen pass. Warm both its shader variants and
      // the display variants, without rendering the gallery with a temporary light rig.
      const warmupTarget=new THREE.WebGLRenderTarget(16,16,{type:THREE.HalfFloatType});
      const previousTarget=renderer.getRenderTarget();
      try{
        renderer.setRenderTarget(warmupTarget);const linearStart=performance.now();await renderer.compileAsync(scene,camera);startup.stages.push({stage:'linear-compile',start:linearStart,ms:performance.now()-linearStart});
        if(!isCurrent())return;
        renderer.setRenderTarget(previousTarget);const screenStart=performance.now();await renderer.compileAsync(scene,camera);startup.stages.push({stage:'display-compile',start:screenStart,ms:performance.now()-screenStart});
      }finally{renderer.setRenderTarget(previousTarget);warmupTarget.dispose();}
      startup.compileMs=performance.now()-compileStart;
      await nextPaint();if(!isCurrent())return;
      const firstRender=performance.now();renderer.render(scene,camera);updateMainLink();startup.firstRenderMs=performance.now()-firstRender;
      lastRenderedPhase=phase;needsRender=false;lastTime=0;startup.ready=true;startup.readyAt=performance.now();
      status.hidden=true;wake();
    }catch(error){
      if(!isCurrent())return;
      status.textContent='场景未能完成载入，请刷新页面并检查封面资源是否完整。';status.hidden=false;console.error(error);
    }
  }
  function resize(){
    const w=stage.clientWidth,h=stage.clientHeight;
    if(viewport.width!==w||viewport.height!==h){renderer.setSize(w,h,false);viewport.resizes++;}
    viewport.width=w;viewport.height=h;viewport.pageHeight=gallery.clientHeight;
    applyScreenProgress(scrollProgress);alignAnchorScroll(scrollProgress);wake();
  }
  function updateFrustum(){
    const w=viewport.width||stage.clientWidth,h=viewport.height||stage.clientHeight;
    const aspect=w/h,wide=matchMedia('(min-width: 960px), (max-height: 600px) and (min-aspect-ratio: 1/1)').matches;
    const overviewWidth=wide?Math.max(7.6,6.2*aspect):(w<370?7.25:7.6);
    const heroWidth=wide?Math.max(6.6,4.8*aspect):Math.max(6.6,(config.height+.8)*cameraDefaults.zoom*aspect);
    const visibleWidth=lerp(overviewWidth,heroWidth,sceneBlend),visibleHeight=visibleWidth/aspect;
    camera.left=-visibleWidth/2;camera.right=visibleWidth/2;camera.top=visibleHeight/2;camera.bottom=-visibleHeight/2;camera.updateProjectionMatrix();
  }
  function updateInfo(index){
    if(index===active)return;active=index;
    $('work-summary').textContent=`${works[index].title}：${works[index].description}`;
    $('work-category').textContent=`${String(index+1).padStart(2,'0')} / ${String(works.length).padStart(2,'0')} · ${works[index].category}`;
    $('work-title').textContent=works[index].title;$('work-description').textContent=works[index].description;
    const work=works[index],url=workUrl(index),link=$('work-link');
    link.hidden=!!work.placeholder;link.tabIndex=work.placeholder||cameraControlsEnabled||!isBrowsing()?-1:0;
    link.setAttribute('aria-disabled',String(work.placeholder||cameraControlsEnabled||!isBrowsing()));$('placeholder-note').hidden=!work.placeholder;
    if(url){link.href=url;mainLink.href=url;}else{link.removeAttribute('href');mainLink.removeAttribute('href');}
    $('work-tags').replaceChildren(...work.tags.map(tag=>{const li=document.createElement('li');li.textContent=tag;return li;}));
    $('browse-hint').textContent=work.placeholder?'预留卡片 · 左右拖动继续浏览':'左右拖动切换 · 点击卡片查看案例';
    mainLink.setAttribute('aria-label',`查看${works[index].title}详情`);
    dotButtons.forEach((button,i)=>button.setAttribute('aria-current',String(i===index)));
  }
  function updateScene(){
    const base=Math.floor(lerp(phase,carouselPosition,sceneBlend)),nearest=Math.round(phase),half=Math.floor(config.pool/2);
    cards.forEach((item,i)=>{
      const logical=base+i-half,d=logical-phase,z=d*config.spacing;
      const lift=config.lift*(1-smooth(config.liftInner,config.liftOuter,Math.abs(d)));
      const offset=logical-carouselPosition,distance=Math.abs(offset);
      const presence=1-sceneBlend*smooth(1.05,1.95,distance);
      item.group.visible=presence>.001;item.shadow.visible=item.group.visible;
      item.group.position.set(lerp(0,offset*heroSpacing(),sceneBlend),lerp(config.height/2+config.edgeBevel+.005+lift,1.72-.1*Math.min(distance,2),sceneBlend),lerp(z,-.65*distance,sceneBlend));
      // Rotation belongs to the logical card, even when the render pool recycles.
      const tilt=cardTilts.get(logical)?.rotation,tiltWeight=smooth(.45,1,sceneBlend);
      item.group.rotation.set((tilt?.x||0)*tiltWeight,
        -clamp(offset,-2,2)*.14*sceneBlend+(tilt?.y||0)*tiltWeight,
        -clamp(offset,-2,2)*.035*sceneBlend+(tilt?.z||0)*tiltWeight);
      item.group.scale.setScalar(lerp(1,1-.2*smooth(0,1,distance),sceneBlend)*presence);item.lift=lift;item.logical=logical;
      const index=mod(logical,works.length);
      if(index!==item.workIndex){
        item.workIndex=index;item.description.material.map=item.descriptions[index];
        item.colorIndex=index;item.card.material=materialSets[index];item.material=item.card.material[0];
        item.cover.material.map=coverTextures[index];
      }
      // Contact occlusion remains flush with the floor, softens as the card rises.
      item.shadow.position.set(item.group.position.x,.004,item.group.position.z);item.shadow.scale.set((1+lift*.12)*presence,(1+lift*.6)*presence,1);item.shadow.material.opacity=.12*(1-lift/config.lift*.72)*(1-sceneBlend*.4);
      item.description.material.opacity=(1-smooth(.23,.58,Math.abs(d)))*(1-smooth(.1,.65,sceneBlend));
      item.description.visible=item.description.material.opacity>.005;
    });
    updateInfo(mod(sceneBlend>.5?selectedLogical:nearest,works.length));
  }

  function updateMainLink(){
    mainLink.hidden=!!works[mod(selectedLogical,works.length)].placeholder||!isBrowsing()||cameraControlsEnabled||!!selectionTween||!!browseGesture?.locked;
    if(mainLink.hidden)return;
    const item=cards.find(card=>card.logical===selectedLogical&&card.group.visible);
    if(!item){mainLink.hidden=true;return;}
    const corners=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y])=>{
      const point=new THREE.Vector3(x*config.width/2,y*config.height/2,config.thickness/2+.014);
      item.group.localToWorld(point);point.project(camera);return `${((point.x+1)*50).toFixed(3)}% ${((1-point.y)*50).toFixed(3)}%`;
    });
    mainLink.style.clipPath=`polygon(${corners.join(',')})`;
  }
  function setBrowseAvailability(){
    const browsing=isBrowsing();featuredUI.inert=!browsing;
    stage.classList.toggle('is-browsing',browsing);
    for(const button of [previousButton,nextButton,...dotButtons])button.disabled=cameraControlsEnabled||!browsing;
    $('work-link').tabIndex=cameraControlsEnabled||!browsing||works[mod(selectedLogical,works.length)].placeholder?-1:0;
    $('work-link').setAttribute('aria-disabled',String(cameraControlsEnabled||!browsing||works[mod(selectedLogical,works.length)].placeholder));
    $('browse-hint').textContent=cameraControlsEnabled?'视角调整中 · 按 Q 返回作品浏览':works[mod(selectedLogical,works.length)].placeholder?'预留卡片 · 左右拖动继续浏览':'左右拖动切换 · 点击卡片查看案例';
    $('scroll-cue').inert=scrollProgress>.1;
    stage.setAttribute('aria-label',cameraControlsEnabled
      ?'视角控制已开启；拖动调整视角，滚轮或双指捏合缩放；方向键调整角度，加减号缩放，Home 恢复，Q 关闭，W 保存'
      :browsing?'精选作品；左右滑动或方向键切换，点击主卡查看详情；Q 开启视角控制，W 保存视角'
      :'视角控制已关闭；向下滚动切换到作品锚点；Q 开启或关闭视角控制，W 保存视角，空格暂停或继续');
    updateMainLink();
  }

  function beginMaterialTilt(mode,logical=Math.round(carouselPosition)){
    if(!isBrowsing()||cameraControlsEnabled||reducedMotion.matches)return false;
    materialTilt=tiltFor(logical);materialTilt.mode=mode;materialTilt.interactions++;
    materialTilt.moving=true;tiltMoving=true;return true;
  }
  function setMaterialTiltTarget(lean){
    lean=clamp(lean,-1,1);materialTilt.direction=Math.sign(lean);
    materialTilt.target={x:-config.tiltPitch*Math.PI/180*Math.abs(lean),
      y:lean*config.tiltYaw*Math.PI/180,z:-lean*config.tiltRoll*Math.PI/180};
  }
  function dragMaterialTilt(dx,velocity,unit){
    if(reducedMotion.matches)return;
    // Speed determines the direction; displacement leaves a smaller held lean.
    const travel=Math.tanh(dx/Math.max(1,unit*.4));
    setMaterialTiltTarget(.30*travel+.70*Math.tanh(velocity/.65));
  }
  function releaseMaterialTilt(mode='recoil',tilt=materialTilt){
    tilt.mode=mode;tilt.target={x:0,y:0,z:0};
  }
  function kickMaterialTilt(logical,direction,strength){
    if(!isBrowsing()||cameraControlsEnabled||reducedMotion.matches)return;
    const tilt=tiltFor(logical);
    // An entering card starts its own response from its own current angle.
    // Never copy the outgoing card's rotation, velocity or target.
    releaseMaterialTilt('recoil',tilt);tilt.interactions++;tilt.direction=direction;
    tilt.velocity.y=clamp(tilt.velocity.y+direction*strength,-5,5);
    tilt.velocity.z=clamp(tilt.velocity.z-direction*strength*config.tiltRoll/config.tiltYaw,-2.2,2.2);
    tilt.moving=true;tiltMoving=true;
  }
  function stepMaterialTilt(dt,now){
    const allowed=isBrowsing()&&!cameraControlsEnabled&&!reducedMotion.matches;
    if(allowed&&browseGesture?.locked&&materialTilt.mode==='drag'){
      const g=browseGesture,unit=stage.clientWidth*heroSpacing()/((camera.right-camera.left)/camera.zoom);
      dragMaterialTilt(g.x-g.startX,g.velocity*Math.exp(-Math.max(0,now-g.time)/90),unit);
    }
    tiltMoving=false;
    for(const [logical,tilt] of cardTilts){
      if(!allowed&&tilt.mode!=='idle'&&tilt.mode!=='neutral')releaseMaterialTilt('neutral',tilt);
      else if(tilt.mode==='drag'&&!browseGesture?.locked)releaseMaterialTilt('recoil',tilt);
      const driven=tilt.mode==='drag';
      let unsettled=false,changed=false;
      for(const axis of ['x','y','z']){
        const target=tilt.target[axis],value=tilt.rotation[axis],velocity=tilt.velocity[axis],offset=value-target;
        const recoil=tilt.mode==='recoil';
        // Yaw and roll share timing so the return reads as one swing.
        const omega=recoil?config.tiltRecoilResponse:driven?config.tiltFollowResponse:18;
        let next,nextVelocity;
        if(recoil){
          const damping=axis==='x'?.8:config.tiltRecoilDamping;
          const drag=damping*omega,frequency=omega*Math.sqrt(1-damping*damping),decay=Math.exp(-drag*dt);
          const cosine=Math.cos(frequency*dt),sine=Math.sin(frequency*dt);
          next=target+decay*(offset*cosine+(velocity+drag*offset)/frequency*sine);
          nextVelocity=decay*(velocity*cosine-(drag*velocity+omega*omega*offset)/frequency*sine);
        }else{
          const c=velocity+omega*offset,decay=Math.exp(-omega*dt);
          next=target+(offset+c*dt)*decay;nextVelocity=(velocity-omega*c*dt)*decay;
        }
        if(Math.abs(next-target)<.00015&&Math.abs(nextVelocity)<.0015){next=target;nextVelocity=0;}
        changed=changed||next!==value;unsettled=unsettled||next!==target||nextVelocity!==0;
        tilt.rotation[axis]=next;tilt.velocity[axis]=nextVelocity;
      }
      tilt.moving=driven||unsettled;tiltMoving=tiltMoving||tilt.moving;
      if(!tilt.moving){tilt.mode='idle';tilt.direction=0;if(Math.abs(logical-carouselPosition)>2)cardTilts.delete(logical);}
      if(changed)needsRender=true;
    }
  }
  function resetMaterialTilt(){
    cardTilts.clear();materialTilt=createTilt();tiltMoving=false;needsRender=true;
  }
  function syncMotionPreference(){
    const matches=reducedMotion.matches;
    if(matches===motionPreference)return;
    motionPreference=matches;
    $('motion-toggle').disabled=matches;
    if(!matches)setPlaying(playing);
    if(matches){
      setPlaying(false);resetMaterialTilt();
      if(selectionTween){carouselPosition=selectionTween.to;selectionTween=null;}
      if(screenTransition)settleAnchor();
    }
    needsRender=true;
  }
  function scrollRange(){return Math.max(1,story.offsetHeight-gallery.offsetHeight);}
  function alignAnchorScroll(progress){
    expectedScrollY=story.offsetTop+progress*scrollRange();
    scrollTo({top:expectedScrollY,behavior:'instant'});
  }
  function applyScreenProgress(next){
    scrollProgress=next;sceneBlend=next;
    gallery.style.setProperty('--story-progress',sceneBlend);
    gallery.style.setProperty('--ui-opacity',smooth(.66,.94,next));
    $('overview-copy').inert=next>.1;
    $('motion-toggle').hidden=next>.1;
    updateFrustum();applyCameraView(false,false);needsRender=true;
  }
  function settleAnchor(){
    screenTransition=null;gallery.classList.remove('is-transitioning');
    applyScreenProgress(anchorTarget);alignAnchorScroll(anchorTarget);setBrowseAvailability();
    try{const url=new URL(location.href);url.hash=anchorTarget?'works':'overview';history.replaceState(history.state,'',url);}catch(error){}
    wake();
  }
  function goToAnchor(target,animate=true){
    target=target?1:0;
    if(cameraControlsEnabled||screenTransition)return;
    if(target===anchorTarget&&scrollProgress===target){alignAnchorScroll(target);return;}
    cancelBrowseGesture();clearCameraGesture();
    // Preserve the current carousel pose when leaving mid-selection; the screen
    // transition takes over from this frame instead of snapping to its destination.
    if(selectionTween)selectionTween=null;
    if(target===1&&scrollProgress===0){selectedLogical=Math.round(phase);carouselPosition=selectedLogical;autoLeg=null;}
    anchorTarget=target;suppressClickUntil=performance.now()+800;
    if(!animate||reducedMotion.matches){settleAnchor();return;}
    screenTransition={from:scrollProgress,to:target,start:performance.now(),duration:680};
    gallery.classList.add('is-transitioning');setBrowseAvailability();needsRender=true;wake();
  }
  function stepAnchor(now){
    if(!screenTransition)return;
    const t=clamp((now-screenTransition.start)/screenTransition.duration,0,1);
    const ease=t*t*t*(t*(t*6-15)+10);
    const next=lerp(screenTransition.from,screenTransition.to,ease);
    applyScreenProgress(next);alignAnchorScroll(next);
    if(t>=1)settleAnchor();
  }
  function syncScroll(){
    scrollRaf=0;
    if(screenTransition)return;
    const delta=scrollY-expectedScrollY;
    if(Math.abs(delta)<2)return;
    if(cameraControlsEnabled){alignAnchorScroll(anchorTarget);return;}
    // Scrollbar, browser navigation and assistive scrolling use the same complete
    // transition as wheel/touch input. The scene never rests at a scroll fraction.
    goToAnchor(delta>0?1:0);
  }
  function requestScrollSync(){if(!scrollRaf)scrollRaf=requestAnimationFrame(syncScroll);}
  function selectWork(logical,animate=true,fromGesture=false,releaseVelocity=0){
    if(!isBrowsing()||cameraControlsEnabled)return;
    const delta=logical-carouselPosition,previous=fromGesture?(materialTilt.logical??Math.round(carouselPosition)):Math.round(carouselPosition);
    selectedLogical=logical;phase=logical;autoLeg=null;
    const duration=clamp(240+Math.abs(delta)*170,260,460);
    // Match the release velocity instead of restarting with a fixed fast ease.
    const tangent=delta?clamp(releaseVelocity*duration/1000/delta,0,2.5):0;
    selectionTween=animate&&!reducedMotion.matches&&Math.abs(delta)>.0001
      ?{from:carouselPosition,to:logical,start:performance.now(),duration,tangent}:null;
    releaseMaterialTilt();
    if(selectionTween){
      const direction=-Math.sign(delta);
      if(!fromGesture)kickMaterialTilt(previous,direction,4.5);
      if(logical!==previous)kickMaterialTilt(logical,direction,3.8*Math.min(1,Math.abs(delta)));
    }
    if(!selectionTween)carouselPosition=logical;
    updateInfo(mod(logical,works.length));needsRender=true;updateMainLink();wake();
  }
  function persistGalleryState(){
    const snapshot={version:1,selected:selectedLogical,phase,progress:anchorTarget,playing};
    try{history.replaceState({...history.state,cardsGallery:snapshot},'');}catch(error){}
    try{sessionStorage.setItem(RETURN_STORAGE_KEY,JSON.stringify(snapshot));}catch(error){}
  }
  function restoreGalleryState(){
    try{history.scrollRestoration='manual';}catch(error){}
    let saved=history.state?.cardsGallery;
    if(!saved&&location.hash==='#works')try{saved=JSON.parse(sessionStorage.getItem(RETURN_STORAGE_KEY));}catch(error){}
    if(saved?.version===1&&Number.isInteger(saved.selected)&&Number.isFinite(saved.phase)&&Number.isFinite(saved.progress)&&Math.abs(saved.selected)<100000&&Math.abs(saved.phase)<100000){
      selectedLogical=saved.selected;carouselPosition=selectedLogical;phase=saved.phase;playing=typeof saved.playing==='boolean'?saved.playing:playing;
      if(reducedMotion.matches)playing=false;
      anchorTarget=saved.progress>=.5?1:0;
    }else if(location.hash==='#works'){anchorTarget=1;}
    screenTransition=null;applyScreenProgress(anchorTarget);alignAnchorScroll(anchorTarget);setBrowseAvailability();
  }

  // Quintic easing shortens the slow tails while keeping velocity and acceleration
  // zero at each stop. One shared phase keeps every card at the same spacing.
  function queueEase(t){
    t=Math.max(0,Math.min(1,t));
    return t*t*t*(10+t*(-15+6*t));
  }
  function createAutoLeg(){
    const center=Math.round(phase),offset=Math.abs(center-phase);
    if(offset>.002){
      return {from:phase,to:center,elapsed:0,wait:0,duration:Math.max(.28,Math.min(.55,offset*1.1)),kind:'align'};
    }
    return {from:phase,to:center+1,elapsed:0,wait:config.holdSeconds,duration:config.travelSeconds,kind:'advance'};
  }
  function stepAuto(dt){
    if(!autoLeg)autoLeg=createAutoLeg();
    autoLeg.elapsed+=dt;
    const t=(autoLeg.elapsed-autoLeg.wait)/autoLeg.duration;
    phase=autoLeg.from+(autoLeg.to-autoLeg.from)*queueEase(t);
    motionStage=t<=0?'hold':autoLeg.kind==='align'?'align':'travel';
    if(t>=1){
      phase=autoLeg.to;
      const remainder=autoLeg.elapsed-autoLeg.wait-autoLeg.duration;
      autoLeg=createAutoLeg();autoLeg.elapsed=Math.max(0,remainder);motionStage='hold';
    }
  }
  function render(now){
    raf=0;if(suspended||contextLost||!startup.ready)return;
    // Apply a changed preference before any motion, even when the browser has
    // updated the query but has not yet delivered its change event.
    syncMotionPreference();
    const dt=Math.min((now-(lastTime||now))/1000,.25),before=phase;lastTime=now;
    stepAnchor(now);
    motionStage=playing?'waiting':'paused';
    // Auto-play belongs to the first screen; the collection is user-controlled.
    if(playing&&anchorTarget===0&&!screenTransition&&scrollProgress===0&&now>=resumeAt)stepAuto(dt);
    if(scrollProgress>0)motionStage=isBrowsing()?'browse':'transition';
    if(selectionTween){
      const t=clamp((now-selectionTween.start)/selectionTween.duration,0,1);
      const ease=(-2*t*t*t+3*t*t)+selectionTween.tangent*(t*t*t-2*t*t+t);
      carouselPosition=lerp(selectionTween.from,selectionTween.to,ease);needsRender=true;
      if(t>=1){carouselPosition=selectionTween.to;selectionTween=null;}
    }
    stepMaterialTilt(dt,now);
    frameSpeed=dt>0?(phase-before)/dt:0;
    // Normalize all coordinates together, preserving in-flight easing and work identity.
    if(Math.abs(phase)>6000){
      const shift=Math.floor(phase/works.length)*works.length;phase-=shift;
      selectedLogical-=shift;carouselPosition-=shift;
      const shifted=[...cardTilts].map(([logical,tilt])=>[logical-shift,tilt]);cardTilts.clear();
      for(const [logical,tilt] of shifted)cardTilts.set(logical,tilt);
      if(selectionTween){selectionTween.from-=shift;selectionTween.to-=shift;}
      if(autoLeg){autoLeg.from-=shift;autoLeg.to-=shift;}
    }
    // During the presentation hold, keep time but avoid redrawing identical shadows.
    if(needsRender||phase!==lastRenderedPhase){
      updateScene();renderer.render(scene,camera);updateMainLink();lastRenderedPhase=phase;needsRender=false;
    }
    if(!raf&&(playing&&scrollProgress===0||dragging||selectionTween||browseGesture?.locked||screenTransition||tiltMoving))raf=requestAnimationFrame(render);
  }
  function wake(){
    if(startup.ready&&!raf&&!suspended&&!contextLost){lastTime=0;raf=requestAnimationFrame(render);}
  }
  function setPlaying(value){
    playing=value&&!reducedMotion.matches;
    $('motion-toggle').disabled=reducedMotion.matches;
    $('motion-toggle').textContent=reducedMotion.matches?'已减少动态效果':playing?'暂停动画':'播放动画';$('motion-toggle').setAttribute('aria-pressed',String(!playing));
    wake();
  }

  function cameraSnapshot(){
    return {version:1,azimuth:cameraView.azimuth,elevation:cameraView.elevation,zoom:cameraView.zoom};
  }
  function restoreCameraView(){
    try{
      const saved=JSON.parse(localStorage.getItem(CAMERA_STORAGE_KEY));
      if(!saved||saved.version!==1||![saved.azimuth,saved.elevation,saved.zoom].every(Number.isFinite))return;
      if(saved.azimuth<-1.31||saved.azimuth>1.31||saved.elevation<.105||saved.elevation>1.05||saved.zoom<config.cameraMinZoom||saved.zoom>config.cameraMaxZoom)return;
      cameraView.azimuth=saved.azimuth;cameraView.elevation=saved.elevation;cameraView.zoom=saved.zoom;
      viewSaved=true;
    }catch(error){ /* Missing or unavailable storage falls back to the configured initial camera. */ }
  }
  function applyCameraView(markDirty=true,requestFrame=true){
    cameraView.azimuth=clamp(cameraView.azimuth,-1.31,1.31);
    cameraView.elevation=clamp(cameraView.elevation,.105,1.05);
    cameraView.zoom=clamp(cameraView.zoom,config.cameraMinZoom,config.cameraMaxZoom);
    const azimuth=cameraView.azimuth-sceneBlend*cameraDefaults.azimuth;
    const elevation=clamp(cameraView.elevation+sceneBlend*(.08-cameraDefaults.elevation),.02,1.05);
    const horizontal=orbitRadius*Math.cos(elevation),targetY=lerp(config.cameraTargetY,1.72,sceneBlend);
    camera.position.set(horizontal*Math.sin(azimuth),targetY+orbitRadius*Math.sin(elevation),horizontal*Math.cos(azimuth));
    camera.lookAt(0,targetY,0);camera.zoom=cameraView.zoom;
    camera.updateProjectionMatrix();camera.updateMatrixWorld();needsRender=true;
    if(markDirty)viewSaved=false;
    if(requestFrame)wake();
  }
  function showFeedback(message,error=false){
    clearTimeout(feedbackTimer);feedback.textContent=message;feedback.classList.toggle('error',error);feedback.hidden=false;
    feedbackTimer=setTimeout(()=>{feedback.hidden=true;},3200);
  }
  function saveCameraView(){
    try{
      localStorage.setItem(CAMERA_STORAGE_KEY,JSON.stringify(cameraSnapshot()));
      viewSaved=true;
      showFeedback('视角已保存，刷新后自动恢复');
    }catch(error){showFeedback('未能保存：当前浏览器未允许本地存储。',true);}
  }
  function setCameraControlsEnabled(value){
    if(screenTransition)settleAnchor();
    cancelBrowseGesture();
    cameraControlsEnabled=value;
    if(!value)clearCameraGesture();
    stage.classList.toggle('camera-controls-enabled',value);
    setBrowseAvailability();needsRender=true;wake();
    showFeedback(value?'视角控制已开启：拖动调整，滚轮或双指缩放':'视角控制已关闭');
  }
  function ignoresShortcut(event){
    return event.defaultPrevented||event.isComposing||event.ctrlKey||event.metaKey||event.altKey
      ||event.target instanceof Element&&!!event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]');
  }
  document.addEventListener('keydown',event=>{
    if(ignoresShortcut(event)||event.repeat)return;
    const key=event.key.toLowerCase();
    if(key==='q'||event.code==='KeyQ'){
      event.preventDefault();setCameraControlsEnabled(!cameraControlsEnabled);
    }else if(key==='w'||event.code==='KeyW'){
      event.preventDefault();saveCameraView();
    }else if(!cameraControlsEnabled&&['ArrowDown','PageDown','End','ArrowUp','PageUp','Home'].includes(event.key)){
      event.preventDefault();goToAnchor(['ArrowDown','PageDown','End'].includes(event.key)?1:0);
    }
  });
  function resetGesture(){
    const points=[...pointers.values()];
    if(points.length>=2){gesture={kind:'pinch',distance:Math.max(1,Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y)),zoom:cameraView.zoom};}
    else if(points.length===1){gesture={kind:'orbit',x:points[0].x,y:points[0].y};}
    else{gesture=null;}
  }
  works.forEach((work,index)=>{
    const button=document.createElement('button');button.type='button';button.className='work-dot';
    button.setAttribute('aria-label',`选择第 ${index+1} 张：${work.title}`);button.setAttribute('aria-current',String(index===0));
    button.addEventListener('click',()=>{
      let delta=mod(index-mod(selectedLogical,works.length),works.length);if(delta>works.length/2)delta-=works.length;
      selectWork(selectedLogical+delta);
    });$('work-dots').append(button);dotButtons.push(button);
  });
  previousButton.addEventListener('click',()=>selectWork(selectedLogical-1));
  nextButton.addEventListener('click',()=>selectWork(selectedLogical+1));
  $('scroll-cue').addEventListener('click',event=>{event.preventDefault();goToAnchor(1);});
  $('header-works').addEventListener('click',event=>{event.preventDefault();goToAnchor(1);});
  $('home-link').addEventListener('click',event=>{event.preventDefault();goToAnchor(0);});
  $('motion-toggle').addEventListener('click',()=>setPlaying(!playing));
  document.querySelectorAll('.work-directory a').forEach(link=>link.addEventListener('click',persistGalleryState));
  $('back-to-overview').addEventListener('click',event=>{event.preventDefault();goToAnchor(0);});
  $('work-link').addEventListener('click',event=>{if(cameraControlsEnabled||!isBrowsing()||works[mod(selectedLogical,works.length)].placeholder){event.preventDefault();return;}persistGalleryState();});
  mainLink.addEventListener('click',()=>persistGalleryState());
  stage.addEventListener('dragstart',event=>event.preventDefault());
  function cancelBrowseGesture(){
    if(!browseGesture)return;
    const id=browseGesture.id,wasLocked=browseGesture.locked;browseGesture=null;stage.classList.remove('is-swiping');
    if(wasLocked){suppressClickUntil=performance.now()+500;selectWork(selectedLogical,true,true);}
    if(stage.hasPointerCapture(id))stage.releasePointerCapture(id);
  }
  stage.addEventListener('pointerdown',event=>{
    if(!isBrowsing()||cameraControlsEnabled||screenTransition||event.button!==0)return;
    if(!event.isPrimary||browseGesture){cancelBrowseGesture();return;}
    selectionTween=null;
    browseGesture={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,time:performance.now(),velocity:0,from:carouselPosition,logical:Math.round(carouselPosition),locked:false};
  });
  stage.addEventListener('pointermove',event=>{
    const g=browseGesture;if(!g||g.id!==event.pointerId||cameraControlsEnabled)return;
    const dx=event.clientX-g.startX,dy=event.clientY-g.startY;
    if(!g.locked){
      if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)*1.15){suppressClickUntil=performance.now()+500;browseGesture=null;return;}
      if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy)*1.15)return;
      g.locked=true;stage.setPointerCapture(event.pointerId);stage.classList.add('is-swiping');
      beginMaterialTilt('drag');
    }
    event.preventDefault();
    const now=performance.now(),elapsed=Math.max(1,now-g.time),sample=(event.clientX-g.x)/elapsed;
    g.velocity=lerp(g.velocity,sample,1-Math.exp(-elapsed/35));g.x=event.clientX;g.time=now;
    const unit=stage.clientWidth*heroSpacing()/((camera.right-camera.left)/camera.zoom);
    dragMaterialTilt(dx,g.velocity,unit);
    carouselPosition=g.from-clamp(dx/unit,-1.12,1.12);needsRender=true;updateMainLink();wake();
  });
  function finishBrowseGesture(event){
    const g=browseGesture;if(!g||g.id!==event.pointerId)return;
    browseGesture=null;stage.classList.remove('is-swiping');
    if(g.locked){
      suppressClickUntil=performance.now()+500;
      const dx=event.clientX-g.startX,velocity=g.velocity*Math.exp(-Math.max(0,performance.now()-g.time)/90);
      const unit=stage.clientWidth*heroSpacing()/((camera.right-camera.left)/camera.zoom);
      const advance=Math.abs(dx)>Math.min(110,unit*.2)||Math.abs(velocity)>.45&&Math.abs(dx)>16;
      const direction=Math.abs(velocity)>.45?Math.sign(velocity):Math.sign(dx);
      selectWork(g.logical+(advance?-direction:0),true,true,-velocity*1000/unit);
    }else if(Math.hypot(event.clientX-g.startX,event.clientY-g.startY)>8)suppressClickUntil=performance.now()+500;
    if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
  }
  stage.addEventListener('pointerup',finishBrowseGesture);
  stage.addEventListener('pointercancel',cancelBrowseGesture);
  stage.addEventListener('lostpointercapture',event=>{
    // Touch initially captures on the link/canvas. Its bubbled loss when capture
    // transfers to the stage is expected, and must not cancel the new gesture.
    if(event.target===stage&&browseGesture?.id===event.pointerId)cancelBrowseGesture();
  });
  stage.addEventListener('click',event=>{
    if(cameraControlsEnabled||performance.now()<suppressClickUntil||selectionTween){event.preventDefault();event.stopImmediatePropagation();return;}
    if(!isBrowsing()||event.target.closest('a'))return;
    const rect=stage.getBoundingClientRect();rayPointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(rayPointer,camera);
    const hits=raycaster.intersectObjects(cards.filter(item=>item.group.visible).map(item=>item.card),false);
    const item=hits.length?cards.find(card=>card.card===hits[0].object):null;
    if(item){if(item.logical===selectedLogical){const url=workUrl(mod(selectedLogical,works.length));if(url){persistGalleryState();location.assign(url);}}else selectWork(item.logical);}
  },true);
  stage.addEventListener('pointerdown',event=>{
    if(!cameraControlsEnabled||event.button!==0)return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});resetGesture();
    dragging=true;stage.classList.add('dragging');stage.setPointerCapture(event.pointerId);wake();
  });
  stage.addEventListener('pointermove',event=>{
    if(!cameraControlsEnabled||!pointers.has(event.pointerId)||!gesture)return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    const points=[...pointers.values()];
    if(points.length>=2&&gesture.kind==='pinch'){
      const distance=Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y);
      cameraView.zoom=gesture.zoom*distance/gesture.distance;
    }else if(points.length===1&&gesture.kind==='orbit'){
      const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
      cameraView.azimuth-=dx*config.dragSensitivity;
      cameraView.elevation-=dy*config.dragSensitivity;
      gesture.x=event.clientX;gesture.y=event.clientY;
    }
    applyCameraView();
  });
  function releaseCameraPointer(event){
    if(!pointers.has(event.pointerId))return;
    pointers.delete(event.pointerId);resetGesture();dragging=pointers.size>0;
    stage.classList.toggle('dragging',dragging);
    if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
  }
  function clearCameraGesture(){
    const ids=[...pointers.keys()];pointers.clear();gesture=null;dragging=false;stage.classList.remove('dragging');
    for(const id of ids){if(stage.hasPointerCapture(id))stage.releasePointerCapture(id);}
  }
  stage.addEventListener('pointerup',releaseCameraPointer);
  stage.addEventListener('pointercancel',releaseCameraPointer);
  stage.addEventListener('lostpointercapture',event=>{if(event.target===stage)releaseCameraPointer(event);});
  window.addEventListener('blur',()=>{clearCameraGesture();cancelBrowseGesture();});
  stage.addEventListener('wheel',event=>{
    if(!cameraControlsEnabled||event.ctrlKey||event.metaKey)return;
    event.preventDefault();
    const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?stage.clientHeight:1);
    cameraView.zoom*=Math.exp(clamp(-pixels*.0015,-.7,.7));applyCameraView();
    if(pointers.size>=2)resetGesture();
  },{passive:false});
  stage.addEventListener('keydown',event=>{
    if(ignoresShortcut(event))return;
    if(event.code==='Space'){
      event.preventDefault();if(!event.repeat)setPlaying(!playing);return;
    }
    if(!cameraControlsEnabled){
      if(isBrowsing()&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();if(!event.repeat)selectWork(selectedLogical+(event.key==='ArrowLeft'?-1:1));}
      return;
    }
    const step=Math.PI/60;
    if(event.key==='ArrowLeft'){cameraView.azimuth-=step;}
    else if(event.key==='ArrowRight'){cameraView.azimuth+=step;}
    else if(event.key==='ArrowUp'){cameraView.elevation+=step;}
    else if(event.key==='ArrowDown'){cameraView.elevation-=step;}
    else if(event.key==='+'||event.key==='='){cameraView.zoom*=1.1;}
    else if(event.key==='-'){cameraView.zoom/=1.1;}
    else if(event.key==='Home'){Object.assign(cameraView,cameraDefaults);showFeedback('已恢复初始视角，按 W 保存');}
    else{return;}
    event.preventDefault();applyCameraView();
  });
  document.addEventListener('visibilitychange',()=>{
    suspended=document.hidden;if(suspended){clearCameraGesture();cancelBrowseGesture();cancelAnimationFrame(raf);raf=0;lastTime=0;}else{lastTime=0;resumeAt=performance.now()+600;wake();}
  });
  reducedMotion.addEventListener('change',()=>{syncMotionPreference();wake();});
  $('scene').addEventListener('webglcontextlost',event=>{
    event.preventDefault();contextLost=true;bootEpoch++;startup.ready=false;
    clearCameraGesture();cancelBrowseGesture();cancelAnimationFrame(raf);raf=0;status.hidden=false;status.textContent='画面暂时休息，正在恢复…';
  });
  $('scene').addEventListener('webglcontextrestored',()=>{
    contextLost=false;status.hidden=true;lastTime=0;needsRender=true;
    if(reflectionTarget){reflectionTarget.dispose();reflectionTarget=null;}
    if(studioTarget){studioTarget.dispose();studioTarget=null;}
    scene.environment=null;prepareScene();
  });
  window.addEventListener('wheel',event=>{
    if(event.defaultPrevented||event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    if(event.target instanceof Element&&event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
    event.preventDefault();if(cameraControlsEnabled)return;
    const now=performance.now(),pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?gallery.clientHeight:1),direction=Math.sign(pixels);
    if(!direction)return;
    if(now-wheelTime>180||direction!==wheelDirection){wheelDistance=0;wheelLatched=false;}
    wheelTime=now;wheelDirection=direction;
    if(screenTransition){wheelLatched=true;return;}
    if(wheelLatched)return;
    wheelDistance+=pixels;
    if(Math.abs(wheelDistance)>=12){wheelLatched=true;goToAnchor(direction>0?1:0);}
  },{passive:false});
  document.addEventListener('touchstart',event=>{
    verticalTouch=event.touches.length===1&&!cameraControlsEnabled?{x:event.touches[0].clientX,y:event.touches[0].clientY,axis:null,fired:false}:null;
  },{passive:true});
  document.addEventListener('touchmove',event=>{
    if(!verticalTouch||event.touches.length!==1||cameraControlsEnabled)return;
    const point=event.touches[0],dx=point.clientX-verticalTouch.x,dy=point.clientY-verticalTouch.y;
    if(!verticalTouch.axis){
      if(Math.max(Math.abs(dx),Math.abs(dy))<8)return;
      if(Math.abs(dy)>Math.abs(dx)*1.15)verticalTouch.axis='y';
      else if(Math.abs(dx)>Math.abs(dy)*1.15)verticalTouch.axis='x';
      else return;
    }
    if(verticalTouch.axis!=='y')return;
    event.preventDefault();
    if(!verticalTouch.fired&&Math.abs(dy)>=22){verticalTouch.fired=true;goToAnchor(dy<0?1:0);}
  },{passive:false});
  document.addEventListener('touchend',()=>{verticalTouch=null;},{passive:true});
  document.addEventListener('touchcancel',()=>{verticalTouch=null;},{passive:true});
  window.addEventListener('scroll',requestScrollSync,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('hashchange',()=>goToAnchor(location.hash==='#works'?1:0));
  window.addEventListener('pagehide',persistGalleryState);
  window.addEventListener('pageshow',event=>{if(event.persisted){clearCameraGesture();cancelBrowseGesture();settleAnchor();}});
  new ResizeObserver(resize).observe(stage);restoreGalleryState();resize();
  // Read-only diagnostics. Nothing here is exposed as extra gallery UI.
  window.galleryState=()=>({
    version:19,startup:{...startup},
    palette:colors.map((tint,i)=>({name:tint.name,color:materialSets[i][0].color.getHexString(),
      metalness:materialSets[i][0].metalness,roughness:materialSets[i][0].roughness,transmission:materialSets[i][0].transmission})),
    cards:cards.map(item=>({logical:item.logical,workIndex:item.workIndex,colorIndex:item.colorIndex,
      materialMatches:item.card.material===materialSets[item.colorIndex],coverMatches:item.cover.material.map===coverTextures[item.workIndex],
      coverVisible:item.cover.visible,descriptionVisible:item.description.visible,visible:item.group.visible,position:item.group.position.toArray(),rotation:item.group.rotation.toArray().slice(0,3),scale:item.group.scale.x})),
    reflection:{status:reflectionStatus,source:'studio-reflections.jpg',yaw:config.reflectionYaw,peak:config.reflectionPeak,
      sharedEnvironment:!!reflectionTarget&&scene.environment===reflectionTarget.texture,
      coversUseSharedEnvironment:cards.every(item=>item.cover.material.envMap===null),
      inputSize:[config.reflectionWidth,config.reflectionWidth/2],pmremSize:reflectionTarget?[reflectionTarget.width,reflectionTarget.height]:null,backgroundIsImage:scene.background!==null},
    material:{type:cards[0].material.type,roughness:cards[0].material.roughness,edgeRoughness:cards[0].card.material[1].roughness,
      bevel:config.edgeBevel,rimRise:config.rimRise,grooveDepth:config.grooveDepth,grooveOcclusion:config.grooveOcclusion,
      modeledRim:true,fixedOutline:false,bevelSegments:config.edgeBevelSegments,transmission:cards[0].material.transmission,
      thickness:config.thickness,inset:config.coverInset,coversLoaded:coverLoaded,coverCount:coverTextures.length,coverTextureSize:coverTextures.map(texture=>texture.image?[texture.image.width,texture.image.height]:null),
      surfaceLayers:cards[0].group.children.map(child=>child.name),glassCastsShadow:cards[0].card.castShadow,printCastsShadow:cards[0].cover.castShadow,
      indexed:!!cards[0].card.geometry.index,vertices:cards[0].card.geometry.attributes.position.count},
    phase,active,playing,dragging,cardCount:cards.length,spacing:config.spacing,selected:works[active]?.title,
    width:stage.clientWidth,height:stage.clientHeight,webgl:!contextLost,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,renderFrames:renderer.info.render.frame,
    cameraControlsEnabled,cameraZoom:camera.zoom,cameraHeight:camera.position.y,cameraTargetY:config.cameraTargetY,cameraPosition:camera.position.toArray(),cameraView:cameraSnapshot(),viewSaved,
    tilt:{source:'interaction',model:'per-card-recoil',phase:materialTilt.mode,
      rotation:{...materialTilt.rotation},velocity:{...materialTilt.velocity},moving:tiltMoving,
      limits:{pitch:config.tiltPitch,yaw:config.tiltYaw,roll:config.tiltRoll},target:{...materialTilt.target},
      direction:materialTilt.direction,interactions:materialTilt.interactions,
      cards:[...cardTilts].map(([logical,t])=>({logical,mode:t.mode,rotation:{...t.rotation},velocity:{...t.velocity},target:{...t.target}}))},
    browse:{progress:scrollProgress,blend:sceneBlend,anchor:anchorTarget,transitioning:!!screenTransition,viewportResizes:viewport.resizes,selected:mod(selectedLogical,works.length),logical:selectedLogical,position:carouselPosition,settled:!selectionTween&&!screenTransition,swiping:!!browseGesture?.locked,enabled:isBrowsing(),href:$('work-link').getAttribute('href'),mainLinkVisible:!mainLink.hidden,
      targets:cards.filter(item=>item.group.visible).map(item=>{const p=item.group.position.clone().project(camera),r=stage.getBoundingClientRect();return {logical:item.logical,index:item.workIndex,x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};})},
    keyLight:key.position.toArray(),motion:{stage:motionStage,speed:frameSpeed,elapsed:autoLeg?autoLeg.elapsed:0,hold:config.holdSeconds,travel:config.travelSeconds},
    ground:{rotationX:ground.rotation.x,y:ground.position.y,receivesShadow:ground.receiveShadow},
    cardsReceiveShadow:cards.some(c=>c.card.receiveShadow),descriptionIsMesh:cards[0].description.isMesh,descriptionLocalRotation:cards[0].description.rotation.toArray().slice(0,3)
  });
  setPlaying(playing);
  await prepareScene();
})();
