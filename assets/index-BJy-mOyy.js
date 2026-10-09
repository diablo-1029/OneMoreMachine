(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={click:.03,place:.04,remove:.04,error:.15,coin:.09,miner:.35,furnace:.4,assembler:.3,rotate:.03,thunk:.14,research:.3,contract:.3,upgrade:.1,achievement:.5},t=[261.63,293.66,329.63,392,440,523.25,587.33,659.25],n=class{context=null;master;sfxBus;musicBus;humGain;noiseBuffer;lastPlayed=new Map;nextNoteTime=0;settings;constructor(e){this.settings={...e}}unlock(){if(this.context){this.context.state===`suspended`&&this.context.resume();return}try{this.context=new AudioContext}catch{return}let e=this.context;this.master=e.createGain(),this.master.connect(e.destination),this.sfxBus=e.createGain(),this.sfxBus.connect(this.master),this.musicBus=e.createGain(),this.musicBus.connect(this.master),this.noiseBuffer=e.createBuffer(1,e.sampleRate,e.sampleRate);let t=this.noiseBuffer.getChannelData(0);for(let e=0;e<t.length;e++)t[e]=Math.random()*2-1;let n=e.createBufferSource();n.buffer=this.noiseBuffer,n.loop=!0;let r=e.createBiquadFilter();r.type=`bandpass`,r.frequency.value=130,r.Q.value=.8,this.humGain=e.createGain(),this.humGain.gain.value=0,n.connect(r).connect(this.humGain).connect(this.sfxBus),n.start(),this.nextNoteTime=e.currentTime+1.5,this.applySettings(this.settings)}applySettings(e){if(this.settings={...e},!this.context)return;let t=this.context.currentTime;this.master.gain.setTargetAtTime(e.masterVolume,t,.05),this.sfxBus.gain.setTargetAtTime(+!!e.sfx,t,.05),this.musicBus.gain.setTargetAtTime(+!!e.music,t,.3)}update(e,t){let n=this.context;if(!n)return;let r=t?Math.min(e/40,1)*.11:0;this.humGain.gain.setTargetAtTime(r,n.currentTime,.4),this.settings.music&&n.currentTime>this.nextNoteTime-.2&&(this.playMusicNote(this.nextNoteTime),this.nextNoteTime+=[1.2,1.8,2.4,3][Math.floor(Math.random()*4)]),this.nextNoteTime<n.currentTime&&(this.nextNoteTime=n.currentTime+1)}playMusicNote(e){let n=this.context,r=t[Math.floor(Math.random()*t.length)];for(let[t,i]of[[1,.05],[.5,.035]]){let a=n.createOscillator();a.type=`sine`,a.frequency.value=r*t;let o=n.createGain();o.gain.setValueAtTime(0,e),o.gain.linearRampToValueAtTime(i,e+.35),o.gain.exponentialRampToValueAtTime(1e-4,e+4.2),a.connect(o).connect(this.musicBus),a.start(e),a.stop(e+4.3)}}play(t){let n=this.context;if(!n||!this.settings.sfx||n.state!==`running`)return;let r=n.currentTime;if(!(r-(this.lastPlayed.get(t)??-1)<e[t]))switch(this.lastPlayed.set(t,r),t){case`click`:this.tone(`sine`,720,520,.05,.12);break;case`rotate`:this.tone(`triangle`,480,620,.06,.1);break;case`place`:this.tone(`sine`,170,60,.16,.4),this.noise(.05,1800,`lowpass`,.14);break;case`remove`:this.tone(`triangle`,330,150,.14,.16),this.noise(.08,900,`lowpass`,.1);break;case`error`:this.tone(`square`,150,120,.13,.06);break;case`coin`:this.tone(`triangle`,1318.5,1318.5,.09,.1),this.tone(`triangle`,1975.5,1975.5,.22,.1,.07);break;case`miner`:this.tone(`triangle`,190,120,.07,.07),this.noise(.05,2400,`bandpass`,.05);break;case`furnace`:this.noise(.4,500,`lowpass`,.07);break;case`research`:this.tone(`triangle`,659.25,659.25,.16,.1),this.tone(`triangle`,880,880,.16,.1,.11),this.tone(`triangle`,1318.5,1318.5,.4,.1,.22);break;case`contract`:this.tone(`triangle`,1046.5,1046.5,.12,.11),this.tone(`triangle`,1568,1568,.45,.11,.1),this.noise(.05,5e3,`highpass`,.04);break;case`upgrade`:this.tone(`square`,300,900,.14,.04),this.tone(`sine`,190,70,.2,.35,.12),this.noise(.06,2200,`lowpass`,.12);break;case`achievement`:this.tone(`triangle`,523.25,523.25,.14,.1),this.tone(`triangle`,659.25,659.25,.14,.1,.1),this.tone(`triangle`,783.99,783.99,.14,.1,.2),this.tone(`triangle`,1046.5,1046.5,.5,.11,.3);break;case`thunk`:this.tone(`sine`,120,70,.06,.05);break;case`assembler`:this.noise(.03,3200,`highpass`,.07),this.tone(`square`,620,310,.04,.025)}}tone(e,t,n,r,i,a=0){let o=this.context,s=o.currentTime+a,c=o.createOscillator();c.type=e,c.frequency.setValueAtTime(t,s),c.frequency.exponentialRampToValueAtTime(Math.max(n,1),s+r);let l=o.createGain();l.gain.setValueAtTime(1e-4,s),l.gain.exponentialRampToValueAtTime(i,s+.008),l.gain.exponentialRampToValueAtTime(1e-4,s+r),c.connect(l).connect(this.sfxBus),c.start(s),c.stop(s+r+.02)}noise(e,t,n,r){let i=this.context,a=i.currentTime,o=i.createBufferSource();o.buffer=this.noiseBuffer;let s=i.createBiquadFilter();s.type=n,s.frequency.value=t;let c=i.createGain();c.gain.setValueAtTime(r,a),c.gain.exponentialRampToValueAtTime(1e-4,a+e),o.connect(s).connect(c).connect(this.sfxBus),o.start(a,Math.random()*.5,e+.02)}},r=1/20,i=.5,a={startingMoney:200,costs:{miner:40,conveyor:5,furnace:60,assembler:80,seller:50,splitter:30,merger:30,bridge:20,storage:100,wind_turbine:200,fabricator:400},power:{baseSupply:40,turbineOutput:15,use:{miner:2,furnace:3,assembler:4,fabricator:8}},refundRate:1,inputBufferBatches:2},o=[{id:`meadow`,name:`Meadow`,tagline:`Green, calm and even-handed. The place to learn the ropes.`,effects:[],speed:{},turbineOutput:1,powerDraw:1,theme:{ground:8829034,groundLight:9684084,groundDark:8039776,track:10850156,water:6271190,waterLight:8176868,shore:14272661,bounce:12044186,sun:16774368,scenery:`meadow`}},{id:`dunes`,name:`Dunes`,tagline:`Open desert with a steady wind and stubborn rock.`,effects:[`Wind Turbines supply 40% more power`,`Miners work 20% slower`],speed:{miner:.8},turbineOutput:1.4,powerDraw:1,theme:{ground:14861450,groundLight:15520413,groundDark:13939575,track:12885866,water:5224388,waterLight:8377304,shore:10469226,bounce:15784360,sun:16772296,scenery:`dunes`}},{id:`tundra`,name:`Tundra`,tagline:`Rich seams under the snow, and a heating bill to match.`,effects:[`Miners work 25% faster`,`Machines draw 25% more power`],speed:{miner:1.25},turbineOutput:1,powerDraw:1.25,theme:{ground:15134194,groundLight:16054523,groundDark:13884902,track:12173512,water:11131118,waterLight:13954810,shore:13227744,bounce:14674418,sun:15922943,scenery:`tundra`}}],s=`meadow`,c=new Map(o.map(e=>[e.id,e]));function l(e){return c.get(e)??c.get(`meadow`)}var u={slots:3,rateChance:.4,maxLevel:20,deliverBase:30,deliverPerLevel:12,deliverBonusRate:.25,deliverMinutes:5,deliverFlatBonus:40,rateBaseMachines:2,rateLevelsPerMachine:3,rateMaxMachines:7,rateGrowth:1.5,rateBonusMinutes:2,rateFlatBonus:100},d=[{id:`mine_iron_ore`,machineType:`miner`,inputs:[],outputs:[{resourceId:`iron_ore`,amount:1}],duration:2},{id:`smelt_iron_plate`,machineType:`furnace`,inputs:[{resourceId:`iron_ore`,amount:1}],outputs:[{resourceId:`iron_plate`,amount:1}],duration:2},{id:`craft_gear`,machineType:`assembler`,inputs:[{resourceId:`iron_plate`,amount:2}],outputs:[{resourceId:`gear`,amount:1}],duration:3},{id:`mine_copper_ore`,machineType:`miner`,inputs:[],outputs:[{resourceId:`copper_ore`,amount:1}],duration:2},{id:`smelt_copper_plate`,machineType:`furnace`,inputs:[{resourceId:`copper_ore`,amount:1}],outputs:[{resourceId:`copper_plate`,amount:1}],duration:2},{id:`draw_copper_wire`,machineType:`assembler`,inputs:[{resourceId:`copper_plate`,amount:1}],outputs:[{resourceId:`copper_wire`,amount:2}],duration:2},{id:`craft_motor`,machineType:`assembler`,inputs:[{resourceId:`gear`,amount:1},{resourceId:`copper_wire`,amount:2}],outputs:[{resourceId:`motor`,amount:1}],duration:4},{id:`smelt_steel`,machineType:`furnace`,inputs:[{resourceId:`iron_plate`,amount:2}],outputs:[{resourceId:`steel`,amount:1}],duration:4},{id:`craft_circuit`,machineType:`assembler`,inputs:[{resourceId:`copper_wire`,amount:3},{resourceId:`iron_plate`,amount:1}],outputs:[{resourceId:`circuit`,amount:1}],duration:3},{id:`craft_computer`,machineType:`assembler`,inputs:[{resourceId:`circuit`,amount:2},{resourceId:`steel`,amount:1}],outputs:[{resourceId:`computer`,amount:1}],duration:6},{id:`build_robot`,machineType:`fabricator`,inputs:[{resourceId:`motor`,amount:1},{resourceId:`computer`,amount:1},{resourceId:`steel`,amount:2}],outputs:[{resourceId:`robot`,amount:1}],duration:8}],f=[{id:`iron_ore`,name:`Iron Ore`,icon:`ore`,color:`#6f6a72`,baseValue:1,stackLimit:50},{id:`iron_plate`,name:`Iron Plate`,icon:`plate`,color:`#c3ccd8`,baseValue:4,stackLimit:50},{id:`gear`,name:`Gear`,icon:`gear`,color:`#e0a83c`,baseValue:12,stackLimit:50},{id:`copper_ore`,name:`Copper Ore`,icon:`copper_ore`,color:`#a8623c`,baseValue:1,stackLimit:50},{id:`copper_plate`,name:`Copper Plate`,icon:`copper_plate`,color:`#d98452`,baseValue:4,stackLimit:50},{id:`copper_wire`,name:`Copper Wire`,icon:`wire`,color:`#f0a060`,baseValue:3,stackLimit:50},{id:`motor`,name:`Motor`,icon:`motor`,color:`#4aa3b5`,baseValue:50,stackLimit:50},{id:`steel`,name:`Steel`,icon:`steel`,color:`#5d6f8c`,baseValue:22,stackLimit:50},{id:`circuit`,name:`Circuit`,icon:`circuit`,color:`#3fa66a`,baseValue:50,stackLimit:50},{id:`computer`,name:`Computer`,icon:`computer`,color:`#d9cdb4`,baseValue:250,stackLimit:50},{id:`robot`,name:`Robot`,icon:`robot`,color:`#e2733d`,baseValue:1500,stackLimit:50}],p=new Map(f.map(e=>[e.id,e]));function m(e){let t=p.get(e);if(!t)throw Error(`Unknown resource: ${e}`);return t}function h(e){return p.has(e)}function g(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var _=[`miner`,`conveyor`,`furnace`,`seller`],v=[`mine_iron_ore`,`smelt_iron_plate`],y=[{id:`gear_assembly`,name:`Gear Assembly`,description:`Press plates into gears worth three times as much.`,cost:150,requires:[],unlocks:{machines:[`assembler`],recipes:[`craft_gear`]}},{id:`logistics`,name:`Logistics`,description:`Share one belt between several machines, join several into one, or let two cross.`,cost:300,requires:[],unlocks:{machines:[`splitter`,`merger`,`bridge`],recipes:[]}},{id:`warehousing`,name:`Warehousing`,description:`Buffer up to 200 items to smooth out an uneven line.`,cost:600,requires:[`logistics`],unlocks:{machines:[`storage`],recipes:[]}},{id:`wind_power`,name:`Wind Power`,description:`Build turbines to power a factory that has outgrown its free supply.`,cost:800,requires:[],unlocks:{machines:[`wind_turbine`],recipes:[]}},{id:`machine_tuning`,name:`Machine Tuning`,description:`Upgrade Miners, Furnaces and Assemblers to Mk II: half as fast again in the same space.`,cost:2500,requires:[`gear_assembly`],unlocks:{machines:[],recipes:[],upgrades:[2]}},{id:`precision_engineering`,name:`Precision Engineering`,description:`Upgrade machines to Mk III: twice the speed of a standard machine.`,cost:25e3,requires:[`machine_tuning`],unlocks:{machines:[],recipes:[],upgrades:[3]}},{id:`copper_mining`,name:`Copper Mining`,description:`Miners can dig copper, and furnaces can smelt it.`,cost:1500,requires:[],unlocks:{machines:[],recipes:[`mine_copper_ore`,`smelt_copper_plate`]}},{id:`wire_drawing`,name:`Wire Drawing`,description:`Assemblers can draw copper plates into wire, two coils per plate.`,cost:3e3,requires:[`copper_mining`,`gear_assembly`],unlocks:{machines:[],recipes:[`draw_copper_wire`]}},{id:`electric_motors`,name:`Electric Motors`,description:`Combine gears and wire into motors, the most valuable product yet.`,cost:8e3,requires:[`wire_drawing`],unlocks:{machines:[],recipes:[`craft_motor`]}},{id:`steelmaking`,name:`Steelmaking`,description:`Furnaces can turn two iron plates into one bar of steel.`,cost:2e4,requires:[`gear_assembly`],unlocks:{machines:[],recipes:[`smelt_steel`]}},{id:`electronics`,name:`Electronics`,description:`Assemblers can build circuits from wire and iron plate.`,cost:3e4,requires:[`wire_drawing`],unlocks:{machines:[],recipes:[`craft_circuit`]}},{id:`computing`,name:`Computing`,description:`Combine circuits and steel into computers.`,cost:4e4,requires:[`electronics`,`steelmaking`],unlocks:{machines:[],recipes:[`craft_computer`]}},{id:`robotics`,name:`Robotics`,description:`The Fabricator builds robots from a motor, a computer and steel.`,cost:1e5,requires:[`computing`,`electric_motors`],unlocks:{machines:[`fabricator`],recipes:[`build_robot`]}}],b=[`gear_assembly`,`logistics`,`warehousing`],x=new Map(y.map(e=>[e.id,e]));function S(e){return x.get(e)}function C(e){return x.has(e)}function w(e,t){return t.requires.filter(t=>!e.includes(t)).map(e=>x.get(e))}function T(e,t){return e.includes(t.id)?`done`:w(e,t).length===0?`available`:`locked`}function E(e,t,n){let r=[...n];for(let n of y)e.includes(n.id)&&r.push(...n.unlocks[t]);return r}function D(e){return E(e,`machines`,_)}function O(e){return E(e,`recipes`,v)}function k(e){return y.find(t=>t.unlocks.upgrades?.includes(e))}function A(e){return e.requires.reduce((e,t)=>Math.max(e,A(x.get(t))+1),0)}function j(){return{active:[],completed:0,nextId:1,bestRate:{}}}function ee(e,t){return Math.max(t,Math.round(e/t)*t)}function M(e){let t=O(e),n=new Map;for(let e of d)if(t.includes(e.id))for(let t of e.outputs)n.set(t.resourceId,60/e.duration*t.amount);return n}function te(e,t,n=()=>0){let r=M(t),i=[...r.keys()],a=Math.min(e.completed,u.maxLevel),o=e.nextId,s={kind:`deliver`,resourceId:i[0]};for(let t=0;t<6;t++){let n=g(o*7919+t*104729),r=i.map(e=>Math.sqrt(m(e).baseValue)),a=n()*r.reduce((e,t)=>e+t,0),c=i[i.length-1];for(let e=0;e<i.length;e++)if(a-=r[e],a<=0){c=i[e];break}if(s={kind:n()<u.rateChance?`rate`:`deliver`,resourceId:c},!e.active.some(e=>e.kind===s.kind&&e.resourceId===s.resourceId))break}let c=m(s.resourceId).baseValue;if(s.kind===`rate`){let e=Math.min(u.rateBaseMachines+Math.floor(a/u.rateLevelsPerMachine),u.rateMaxMachines),t=ee(n(s.resourceId)*u.rateGrowth,5),i=Math.max(Math.round(r.get(s.resourceId)*e),t);return{id:o,kind:`rate`,resourceId:s.resourceId,target:i,progress:0,reward:ee(i*c*u.rateBonusMinutes+u.rateFlatBonus,10)}}let l=1.6/c**.42,d=ee(n(s.resourceId)*u.deliverMinutes,5),f=Math.max(ee((u.deliverBase+u.deliverPerLevel*a)*l,5),d);return{id:o,kind:`deliver`,resourceId:s.resourceId,target:f,progress:0,reward:ee(f*c*u.deliverBonusRate+u.deliverFlatBonus,10)}}function ne(e,t,n){let r=!1;for(;e.active.length<u.slots;)e.active.push(te(e,t,n)),e.nextId++,r=!0;return r}function re(e){let t=m(e.resourceId).name;return e.kind===`deliver`?`Deliver ${e.target} ${t}`:`Sell ${e.target} ${t} per minute`}var ie=class{seconds;buckets;index=0;bucketTime=0;elapsed=0;constructor(e){this.seconds=e,this.buckets=new Float64Array(e)}add(e){this.buckets[this.index]+=e}advance(e){for(this.elapsed+=e,this.bucketTime+=e;this.bucketTime>=1;)--this.bucketTime,this.index=(this.index+1)%this.seconds,this.buckets[this.index]=0}sum(){let e=0;for(let t=0;t<this.seconds;t++)e+=this.buckets[t];return e}perMinute(e=10){let t=Math.min(Math.max(this.elapsed,e),this.seconds);return this.sum()/t*60}},ae=class{money;totalEarned=0;income=new ie(30);constructor(e){this.money=e}canAfford(e){return this.money>=e}spend(e){return this.canAfford(e)?(this.money-=e,!0):!1}refund(e){this.money+=e}earn(e){this.money+=e,this.totalEarned+=e,this.income.add(e)}award(e){this.money+=e,this.totalEarned+=e}grant(e){this.money+=e}advance(e){this.income.advance(e)}incomePerMinute(){return this.income.perMinute()}},oe=[{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}],se=[`East`,`South`,`West`,`North`];function N(e,t){return((e+t)%4+4)%4}function ce(e){return N(e,2)}function le(e){return e===0||e===1||e===2||e===3}function ue(e,t){return t*4096+e}var de=class{width;height;blocked=new Set;constructor(e,t){this.width=e,this.height=t}inBounds(e,t){return e>=0&&t>=0&&e<this.width&&t<this.height}setBlocked(e,t,n){n?this.blocked.add(ue(e,t)):this.blocked.delete(ue(e,t))}isBlocked(e,t){return this.blocked.has(ue(e,t))}},fe=class{cells=new Map;get(e,t){return this.cells.get(ue(e,t))}occupy(e,t){for(let n of e)this.cells.set(ue(n.x,n.y),t)}release(e){for(let t of e)this.cells.delete(ue(t.x,t.y))}clear(){this.cells.clear()}},pe=[{type:`miner`,name:`Miner`,description:`Drills ore out of the ground.`,powerUse:a.power.use.miner,cost:a.costs.miner,width:2,height:2,behavior:`crafter`,ports:[{localX:1,localY:0,side:0,type:`output`}],outputCapacity:2},{type:`furnace`,name:`Furnace`,description:`Smelts ore into plates.`,powerUse:a.power.use.furnace,cost:a.costs.furnace,width:2,height:2,behavior:`crafter`,ports:[{localX:0,localY:0,side:2,type:`input`},{localX:1,localY:0,side:0,type:`output`}],outputCapacity:2},{type:`assembler`,name:`Assembler`,description:`Builds parts from plates, wire and other parts.`,powerUse:a.power.use.assembler,cost:a.costs.assembler,width:2,height:2,behavior:`crafter`,ports:[{localX:0,localY:0,side:2,type:`input`},{localX:0,localY:1,side:2,type:`input`},{localX:1,localY:0,side:0,type:`output`}],outputCapacity:2},{type:`fabricator`,name:`Fabricator`,description:`Builds the most complex products from three ingredients at once.`,powerUse:a.power.use.fabricator,cost:a.costs.fabricator,width:3,height:3,behavior:`crafter`,ports:[{localX:0,localY:0,side:2,type:`input`},{localX:0,localY:1,side:2,type:`input`},{localX:0,localY:2,side:2,type:`input`},{localX:2,localY:1,side:0,type:`output`}],outputCapacity:2},{type:`seller`,name:`Seller`,description:`Sells anything delivered to it.`,cost:a.costs.seller,width:2,height:2,behavior:`seller`,ports:[{localX:0,localY:0,side:2,type:`input`},{localX:0,localY:1,side:2,type:`input`}],outputCapacity:0},{type:`splitter`,name:`Splitter`,description:`Shares one belt between up to three, taking turns.`,cost:a.costs.splitter,width:1,height:1,behavior:`router`,ports:[{localX:0,localY:0,side:2,type:`input`},{localX:0,localY:0,side:0,type:`output`},{localX:0,localY:0,side:3,type:`output`},{localX:0,localY:0,side:1,type:`output`}],outputCapacity:0},{type:`merger`,name:`Merger`,description:`Joins up to three belts into one, taking turns.`,cost:a.costs.merger,width:1,height:1,behavior:`router`,ports:[{localX:0,localY:0,side:2,type:`input`},{localX:0,localY:0,side:3,type:`input`},{localX:0,localY:0,side:1,type:`input`},{localX:0,localY:0,side:0,type:`output`}],outputCapacity:0},{type:`bridge`,name:`Bridge`,description:`Lets two belts cross. Items go straight over or under and never mix.`,cost:a.costs.bridge,width:1,height:1,behavior:`bridge`,ports:[{localX:0,localY:0,side:0,type:`input`},{localX:0,localY:0,side:1,type:`input`},{localX:0,localY:0,side:2,type:`input`},{localX:0,localY:0,side:3,type:`input`},{localX:0,localY:0,side:0,type:`output`},{localX:0,localY:0,side:1,type:`output`},{localX:0,localY:0,side:2,type:`output`},{localX:0,localY:0,side:3,type:`output`}],outputCapacity:0},{type:`storage`,name:`Storage`,description:`Buffers up to 200 items and releases the oldest first.`,cost:a.costs.storage,width:2,height:3,behavior:`storage`,ports:[{localX:0,localY:0,side:2,type:`input`},{localX:1,localY:0,side:0,type:`output`}],outputCapacity:0,storageCapacity:200},{type:`wind_turbine`,name:`Wind Turbine`,toolbarName:`Turbine`,description:`Adds 15 power to the factory. Needs no fuel and no belts.`,cost:a.costs.wind_turbine,width:2,height:2,behavior:`generator`,ports:[],outputCapacity:0,powerOutput:a.power.turbineOutput}],me={name:`Conveyor`,description:`Moves items one tile per second.`,cost:a.costs.conveyor},he=[`miner`,`conveyor`,`furnace`,`assembler`,`fabricator`,`seller`,`splitter`,`merger`,`bridge`,`storage`,`wind_turbine`],ge=[{id:`machines`,name:`Machines`,tools:[`miner`,`furnace`,`assembler`,`fabricator`,`seller`,`wind_turbine`]},{id:`logistics`,name:`Logistics`,tools:[`conveyor`,`splitter`,`merger`,`bridge`,`storage`]}],_e=new Map(pe.map(e=>[e.type,e]));function P(e){let t=_e.get(e);if(!t)throw Error(`Unknown machine type: ${e}`);return t}function ve(e){return _e.has(e)}function ye(e,t){return t%2==0?{w:e.width,h:e.height}:{w:e.height,h:e.width}}function be(e,t,n,r,i){let a=e,o=t,s=n,c=r;for(let e=0;e<i;e++){let e=c-1-o,t=a;a=e,o=t,[s,c]=[c,s]}return{x:a,y:o}}function xe(e,t,n,r){let{w:i,h:a}=ye(e,r),o=[];for(let e=0;e<a;e++)for(let r=0;r<i;r++)o.push({x:t+r,y:n+e});return o}function Se(e,t,n,r){return e.ports.map(i=>{let a=be(i.localX,i.localY,e.width,e.height,r),o=N(i.side,r),s=t+a.x,c=n+a.y;return{type:i.type,x:s,y:c,side:o,outerX:s+oe[o].x,outerY:c+oe[o].y}})}var F=class{grid;occupancy=new fe;machines=new Map;conveyors=new Map;nextEntityId=1;nextItemId=1;constructor(e,t){this.grid=new de(e,t)}expand(e,t){let n=Math.floor((e-this.grid.width)/2),r=Math.floor((t-this.grid.height)/2);this.grid=new de(e,t),this.occupancy.clear();for(let e of this.machines.values()){e.gridX+=n,e.gridY+=r;for(let t of e.transit)t.tileX+=n,t.tileY+=r;this.occupancy.occupy(this.machineCells(e),{kind:`machine`,id:e.id})}for(let e of this.conveyors.values()){e.gridX+=n,e.gridY+=r;for(let t of e.items)t.tileX+=n,t.tileY+=r;this.occupancy.occupy([{x:e.gridX,y:e.gridY}],{kind:`conveyor`,id:e.id})}return{dx:n,dy:r}}newEntityId(e){return`${e}${this.nextEntityId++}`}machineCells(e){return xe(P(e.type),e.gridX,e.gridY,e.rotation)}addMachine(e){this.machines.set(e.id,e),this.occupancy.occupy(this.machineCells(e),{kind:`machine`,id:e.id})}removeMachine(e){this.occupancy.release(this.machineCells(e)),this.machines.delete(e.id)}addConveyor(e){this.conveyors.set(e.id,e),this.occupancy.occupy([{x:e.gridX,y:e.gridY}],{kind:`conveyor`,id:e.id})}removeConveyor(e){this.occupancy.release([{x:e.gridX,y:e.gridY}]),this.conveyors.delete(e.id)}machineAt(e,t){let n=this.occupancy.get(e,t);return n?.kind===`machine`?this.machines.get(n.id):void 0}conveyorAt(e,t){let n=this.occupancy.get(e,t);return n?.kind===`conveyor`?this.conveyors.get(n.id):void 0}itemCount(){let e=0;for(let t of this.conveyors.values())e+=t.items.length;for(let t of this.machines.values())e+=t.transit.length;return e}};function Ce(e=s){return{factory:new F(12,12),economy:new ae(a.startingMoney),simTime:0,stats:{produced:{},sold:{}},tutorialStep:0,seenTips:[],research:[],contracts:j(),power:{baseSupply:a.power.baseSupply},achievements:[],environment:e,prestige:{stars:0,count:0}}}var we=[{id:`concrete`,name:`Concrete`,requires:{},tiles:[12172998,11515326],foundation:9278364,trim:7304834},{id:`slate`,name:`Slate`,requires:{achievements:5},tiles:[6121077,5528682],foundation:4409943,trim:3488582},{id:`sandstone`,name:`Sandstone`,requires:{achievements:10},tiles:[14271386,13613196],foundation:11573874,trim:9337689},{id:`blueprint`,name:`Blueprint`,requires:{stars:1},tiles:[4157365,3697326],foundation:2838406,trim:2178409}],Te=[{id:`rubber`,name:`Rubber`,requires:{},surface:`#262a31`,chevron:`#59616f`},{id:`hazard`,name:`Hazard`,requires:{achievements:3},surface:`#2b2a26`,chevron:`#e2b33c`},{id:`cobalt`,name:`Cobalt`,requires:{achievements:8},surface:`#1d2f55`,chevron:`#6f9be8`},{id:`ember`,name:`Ember`,requires:{stars:2},surface:`#3a1d1a`,chevron:`#f0774a`}],I=[{id:`day`,name:`Midday`,requires:{},sunIntensity:2.3,skyIntensity:1.9,sunTint:16777215,sunPosition:[-11,20,9]},{id:`golden`,name:`Golden hour`,requires:{achievements:6},sunIntensity:2.5,skyIntensity:1.45,sunTint:16763274,sunPosition:[-17,11,8]},{id:`dusk`,name:`Dusk`,requires:{stars:1},sunIntensity:1.7,skyIntensity:1.15,sunTint:15902400,sunPosition:[-19,7,4]}],Ee={floor:`concrete`,belt:`rubber`,light:`day`};function L(e,t){return e.achievements===void 0&&e.stars===void 0?!0:t?t.achievements>=(e.achievements??0)&&t.stars>=(e.stars??0):!1}function R(e){let t=[];return e.achievements&&t.push(`${e.achievements} achievement${e.achievements===1?``:`s`}`),e.stars&&t.push(`${e.stars} star${e.stars===1?``:`s`}`),t.join(` and `)}function De(e,t,n){let r=e.find(e=>e.id===t);return r&&L(r.requires,n)?r:e[0]}function Oe(e,t){return{floor:De(we,e.floor,t),belt:De(Te,e.belt,t),light:De(I,e.light,t)}}var ke=[{level:1,name:`Mk I`,speed:1,power:1,costFactor:0,requires:null},{level:2,name:`Mk II`,speed:1.5,power:2,costFactor:10,requires:`machine_tuning`},{level:3,name:`Mk III`,speed:2,power:3,costFactor:40,requires:`precision_engineering`}],Ae=ke.length;function je(e){return ke[Math.min(Math.max(e,1),Ae)-1]}var Me=[{size:16,cost:2500},{size:20,cost:12e3},{size:24,cost:4e4},{size:32,cost:25e4}],Ne=Me[Me.length-1].size;function Pe(e){return Me.find(t=>t.size>e)??null}var Fe=(e,t)=>{let n=0;for(let r of e.state.factory.machines.values())(!t||r.type===t)&&n++;return n},Ie=(e,t)=>t?e.state.stats.sold[t]??0:Object.values(e.state.stats.sold).reduce((e,t)=>e+t,0),Le=e=>({current:+!!e,target:1}),Re=(e,t,n,r)=>({id:e,kind:`milestone`,name:t,description:`Earn $${n.toLocaleString(`en-US`)} in total.`,reward:r,progress:e=>({current:e.state.economy.totalEarned,target:n})}),ze=[Re(`earn_1k`,`Pocket Change`,1e3,100),Re(`earn_10k`,`Going Concern`,1e4,500),Re(`earn_100k`,`Captain of Industry`,1e5,2500),Re(`earn_1m`,`Tycoon`,1e6,1e4),Re(`earn_10m`,`One More Million`,1e7,5e4),{id:`first_sale`,kind:`achievement`,name:`Open for Business`,description:`Sell your first item.`,reward:25,progress:e=>({current:Math.min(Ie(e),1),target:1})},{id:`sell_1000`,kind:`achievement`,name:`Bulk Trader`,description:`Sell 1,000 items of any kind.`,reward:300,progress:e=>({current:Ie(e),target:1e3})},{id:`gears_100`,kind:`achievement`,name:`Cog in the Machine`,description:`Sell 100 Gears.`,reward:250,progress:e=>({current:Ie(e,`gear`),target:100})},{id:`motors_50`,kind:`achievement`,name:`Motor City`,description:`Sell 50 Motors.`,reward:1500,progress:e=>({current:Ie(e,`motor`),target:50})},{id:`computers_25`,kind:`achievement`,name:`Thinking Machines`,description:`Sell 25 Computers.`,reward:5e3,progress:e=>({current:Ie(e,`computer`),target:25})},{id:`robots_10`,kind:`achievement`,name:`Machines Making Machines`,description:`Sell 10 Robots.`,reward:2e4,progress:e=>({current:Ie(e,`robot`),target:10})},{id:`machines_10`,kind:`achievement`,name:`Getting Crowded`,description:`Have 10 machines on the floor at once.`,reward:150,progress:e=>({current:Fe(e),target:10})},{id:`machines_30`,kind:`achievement`,name:`Industrial Park`,description:`Have 30 machines on the floor at once.`,reward:1e3,progress:e=>({current:Fe(e),target:30})},{id:`belts_50`,kind:`achievement`,name:`Belt and Braces`,description:`Have 50 conveyors laid at once.`,reward:200,progress:e=>({current:e.state.factory.conveyors.size,target:50})},{id:`splitter`,kind:`achievement`,name:`Fork in the Road`,description:`Build a Splitter.`,reward:100,progress:e=>Le(Fe(e,`splitter`)>0)},{id:`storage_full`,kind:`achievement`,name:`Stockpile`,description:`Fill a Storage to the roof.`,reward:300,progress:e=>{let t=0;for(let n of e.state.factory.machines.values())t=Math.max(t,n.stored.length);return{current:t,target:P(`storage`).storageCapacity??200}}},{id:`wind_farm`,kind:`achievement`,name:`Wind Farm`,description:`Have three Wind Turbines turning.`,reward:500,progress:e=>({current:Fe(e,`wind_turbine`),target:3})},{id:`mk3`,kind:`achievement`,name:`Fine Tolerances`,description:`Upgrade a machine all the way to Mk III.`,reward:750,progress:e=>{let t=1;for(let n of e.state.factory.machines.values())t=Math.max(t,n.level);return{current:t-1,target:Ae-1}}},{id:`first_research`,kind:`achievement`,name:`Eureka`,description:`Complete your first research.`,reward:50,progress:e=>Le(e.state.research.length>0)},{id:`all_research`,kind:`achievement`,name:`Nothing Left to Learn`,description:`Complete every research.`,reward:5e3,progress:e=>({current:e.state.research.length,target:y.length})},{id:`expand_once`,kind:`achievement`,name:`Room to Grow`,description:`Expand the factory floor.`,reward:400,progress:e=>Le(e.state.factory.grid.width>=Me[0].size)},{id:`expand_max`,kind:`achievement`,name:`As Far as the Eye Can See`,description:`Expand the factory floor to its largest size.`,reward:1e4,progress:e=>({current:Me.filter(t=>e.state.factory.grid.width>=t.size).length,target:Me.filter(e=>e.size<=Ne).length})},{id:`prestige_1`,kind:`achievement`,name:`Serial Founder`,description:`Sell a factory and start again.`,reward:500,progress:e=>({current:Math.min(e.state.prestige.count,1),target:1})},{id:`stars_10`,kind:`achievement`,name:`Household Name`,description:`Hold 10 stars.`,reward:5e3,progress:e=>({current:e.state.prestige.stars,target:10})},{id:`contracts_1`,kind:`achievement`,name:`Signed and Delivered`,description:`Complete a contract.`,reward:100,progress:e=>({current:Math.min(e.state.contracts.completed,1),target:1})},{id:`contracts_10`,kind:`achievement`,name:`Reliable Supplier`,description:`Complete 10 contracts.`,reward:2e3,progress:e=>({current:e.state.contracts.completed,target:10})},{id:`balanced`,kind:`achievement`,name:`Perfectly Balanced`,description:`Have five or more crafting machines all working at least 95% of the time.`,reward:1500,progress:e=>{let t=0,n=0;for(let r of e.state.factory.machines.values()){if(P(r.type).behavior!==`crafter`||!r.enabled)continue;t++;let i=e.metrics.shares(r.id);i.observed>=29&&i.working>=.95&&n++}return{current:t>=5&&n===t?5:Math.min(n,4),target:5}}}],Be=new Map(ze.map(e=>[e.id,e]));function Ve(e){return Be.has(e)}function He(e){let{state:t}=e,n=[];for(let r of ze){if(t.achievements.includes(r.id))continue;let{current:i,target:a}=r.progress(e);i<a||(t.achievements.push(r.id),t.economy.grant(r.reward),n.push(r))}return n}function Ue(e,t,n,r){for(let t of n)if(!e.inBounds(t.x,t.y))return{valid:!1,reason:`out_of_bounds`};for(let t of n)if(e.isBlocked(t.x,t.y))return{valid:!1,reason:`blocked`};for(let e of n){let n=t.get(e.x,e.y);if(n&&n.id!==r)return{valid:!1,reason:`occupied`}}return{valid:!0}}var We=new Map(d.map(e=>[e.id,e]));function Ge(e){let t=We.get(e);if(!t)throw Error(`Unknown recipe: ${e}`);return t}function Ke(e){return We.has(e)}function qe(e){return d.filter(t=>t.machineType===e)}function Je(e,t){for(let n of e.factory.machines.values())if(n.type===t)return!0;return!1}var Ye=[{text:`Pick the Miner from the toolbar and place it on the factory floor.`,done:e=>Je(e,`miner`)},{text:`Pick Conveyor and drag a line away from the Miner’s orange output. R rotates.`,done:e=>e.factory.conveyors.size>0},{text:`Place a Furnace at the end of the belt. Its green hatch is the input.`,done:e=>Je(e,`furnace`)},{text:`Connect the Miner’s output to the Furnace’s input so ore can be smelted.`,done:e=>(e.stats.produced.iron_plate??0)>0},{text:`Place a Seller to turn products into money.`,done:e=>Je(e,`seller`)},{text:`Run a belt from the Furnace’s output into the Seller and watch the first sale.`,done:e=>e.economy.totalEarned>0},{text:`Gears sell for three times a plate. Open Research (T) and unlock Gear Assembly.`,done:e=>e.research.includes(`gear_assembly`)},{text:`Add an Assembler between the Furnace and the Seller to start making Gears.`,done:e=>Je(e,`assembler`)}];function Xe(e){return e.tutorialStep>=Ye.length}var Ze=[{id:`power`,text:`The factory is short of power, so every machine has slowed down. Research Wind Power and build a Turbine, or switch off machines you can spare.`,when:e=>e.powerShort},{id:`contracts`,text:`Contracts pay a bonus for things you are selling anyway. Open Contracts to see what is on offer.`,when:e=>e.itemsSold>=10},{id:`bottlenecks`,text:`Something is holding the factory back. Open Production for advice on what to add, or turn on Bottlenecks to see it on the floor.`,when:e=>e.hasBottleneck},{id:`expansion`,text:`You can afford a bigger factory floor. Open Floor to expand; everything you have built stays where it is.`,when:e=>e.canAffordExpansion},{id:`upgrades`,text:`Machines can now be upgraded. Select one to make it faster, at the cost of more power.`,when:e=>e.research.includes(`machine_tuning`)},{id:`blueprints`,text:`Copy duplicates any part of the factory: drag over it, then place the copy. Blueprints keeps layouts for later.`,when:e=>e.research.includes(`logistics`)},{id:`prestige`,text:`This factory is now worth a star. Selling up, from the star in the top bar, starts a new factory with a permanent bonus, whenever you are ready.`,when:e=>e.starsAvailable>=1}];function Qe(e){return Ze.some(t=>t.id===e)}function $e(){return Ze.map(e=>e.id)}function et(e,t){return Xe(e)?Ze.find(n=>!e.seenTips.includes(n.id)&&n.when(t))??null:null}function tt(e){let t=e.tutorialStep;for(;e.tutorialStep<Ye.length&&Ye[e.tutorialStep].done(e);)e.tutorialStep++;return e.tutorialStep!==t}function nt(e){return Ye[e.tutorialStep]?.text??null}var rt=[.9,1,1.15,1.3],it={masterVolume:.6,sfx:!0,music:!0,shadows:!0,cosmetics:{...Ee},reduceMotion:`system`,uiScale:1},at=class extends Error{},ot={1:e=>{let t=e.factory;if(t&&Array.isArray(t.machines))for(let e of t.machines)typeof e==`object`&&e&&Object.assign(e,{transit:[],routeIndex:0,lastInput:-1,stored:[]});return e},2:e=>(e.research=[...b],e),9:e=>(e.seenTips=typeof e.tutorialStep==`number`&&e.tutorialStep>=Ye.length?$e():[],e),8:e=>(e.prestige={stars:0,count:0},e),7:e=>(e.environment=`meadow`,e),6:e=>(e.achievements=[],e),5:e=>{let t=e.factory,n=0;if(t&&Array.isArray(t.machines))for(let e of t.machines){let t=pe.find(t=>t.type===e?.type),r=typeof e?.level==`number`?e.level:1;n+=(t?.powerUse??0)*je(r).power}return e.power={baseSupply:Math.max(a.power.baseSupply,Math.ceil(n))},e},4:e=>{let t=e.factory;if(t&&Array.isArray(t.machines))for(let e of t.machines)typeof e==`object`&&e&&Object.assign(e,{level:1});return e},3:e=>(e.contracts={active:[],completed:0,nextId:1,bestRate:{}},e)};function st(e){if(typeof e!=`object`||!e)throw new at(`Save is not an object`);let t=e,n=t.version;if(typeof n!=`number`||!Number.isInteger(n)||n<1)throw new at(`Save has no valid version`);if(n>10)throw new at(`Save is from a newer version of the game`);for(;n<10;){let e=ot[n];if(!e)throw new at(`No migration from save version ${n}`);t=e(t),n++,t.version=n}return t}function ct(e,t){let{factory:n,economy:r}=e,i=[];for(let e of n.conveyors.values())for(let t of e.items)i.push({...t});return{version:10,timestamp:Date.now(),economy:{money:r.money,totalEarned:r.totalEarned},factory:{width:n.grid.width,height:n.grid.height,machines:[...n.machines.values()].map(e=>({...e,inputInventory:{...e.inputInventory},outputInventory:{...e.outputInventory},transit:e.transit.map(e=>({...e})),stored:[...e.stored]})),conveyors:[...n.conveyors.values()].map(e=>({id:e.id,gridX:e.gridX,gridY:e.gridY,direction:e.direction})),items:i},stats:{produced:{...e.stats.produced},sold:{...e.stats.sold}},simTime:e.simTime,tutorialStep:e.tutorialStep,seenTips:[...e.seenTips],research:[...e.research],power:{baseSupply:e.power.baseSupply},achievements:[...e.achievements],environment:e.environment,prestige:{...e.prestige},contracts:{active:e.contracts.active.map(e=>({...e})),completed:e.contracts.completed,nextId:e.contracts.nextId,bestRate:{...e.contracts.bestRate}},settings:{...t,cosmetics:{...t.cosmetics}}}}function z(e,t){if(!e)throw new at(t)}function lt(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function ut(e,t){return z(typeof e==`number`&&Number.isFinite(e),t),e}function dt(e,t){let n=ut(e,t);return z(Number.isInteger(n),t),n}function ft(e,t){return z(typeof e==`string`&&e.length>0,t),e}function pt(e,t){z(lt(e),t);let n={};for(let[r,i]of Object.entries(e)){z(h(r),`${t}: unknown resource ${r}`);let e=ut(i,t);z(e>=0,t),n[r]=e}return n}function mt(e){z(lt(e),`Invalid item`);let t=ft(e.resourceId,`Invalid item resource`);z(h(t),`Unknown resource ${t}`),z(le(e.from),`Invalid item direction`),z(e.to===void 0||le(e.to),`Invalid item exit`);let n={id:dt(e.id,`Invalid item id`),resourceId:t,tileX:dt(e.tileX,`Invalid item position`),tileY:dt(e.tileY,`Invalid item position`),progress:Math.min(Math.max(ut(e.progress,`Invalid item progress`),0),1),from:e.from};return e.to!==void 0&&(n.to=e.to),n}function ht(e){z(lt(e),`Missing contracts`),z(Array.isArray(e.active),`Invalid contract list`);let t=[],n=0;for(let r of e.active){z(lt(r),`Invalid contract`),z(r.kind===`deliver`||r.kind===`rate`,`Invalid contract kind`);let e=ft(r.resourceId,`Invalid contract resource`);z(h(e),`Unknown resource ${e}`);let i=dt(r.target,`Invalid contract target`);z(i>0,`Invalid contract target`);let a={id:dt(r.id,`Invalid contract id`),kind:r.kind,resourceId:e,target:i,progress:Math.min(Math.max(dt(r.progress??0,`Invalid contract progress`),0),i),reward:Math.max(0,ut(r.reward,`Invalid contract reward`))};z(!t.some(e=>e.id===a.id),`Duplicate contract id`),t.push(a),n=Math.max(n,a.id)}return{active:t,completed:Math.max(0,dt(e.completed??0,`Invalid contract count`)),nextId:Math.max(dt(e.nextId??1,`Invalid contract counter`),n+1,1),bestRate:pt(e.bestRate??{},`Invalid sales record`)}}function gt(e){let t=/(\d+)$/.exec(e);return t?Number(t[1]):0}function _t(e){let t=st(e);z(lt(t.economy),`Missing economy`);let n=ut(t.economy.money,`Invalid money`);z(n>=0,`Invalid money`);let r=ut(t.economy.totalEarned??0,`Invalid earnings`);z(lt(t.factory),`Missing factory`);let i=dt(t.factory.width,`Invalid grid width`),a=dt(t.factory.height,`Invalid grid height`);z(i>=4&&i<=64&&a>=4&&a<=64,`Invalid grid size`);let o=new F(i,a),s=new Set,c=0,u=0;z(Array.isArray(t.factory.machines),`Invalid machine list`);for(let e of t.factory.machines){z(lt(e),`Invalid machine`);let t=ft(e.id,`Invalid machine id`),n=ft(e.type,`Invalid machine type`);z(ve(n),`Unknown machine type ${n}`),z(!s.has(t),`Duplicate entity id`),z(le(e.rotation),`Invalid machine rotation`);let r=e.recipeId===null?null:ft(e.recipeId,`Invalid recipe`);z(r===null||Ke(r),`Unknown recipe`);let i={id:t,type:n,gridX:dt(e.gridX,`Invalid machine position`),gridY:dt(e.gridY,`Invalid machine position`),rotation:e.rotation,enabled:e.enabled!==!1,recipeId:r,active:e.active===!0,progress:Math.min(Math.max(ut(e.progress??0,`Invalid progress`),0),1),inputInventory:pt(e.inputInventory??{},`Invalid input inventory`),outputInventory:pt(e.outputInventory??{},`Invalid output inventory`),transit:[],routeIndex:Math.max(0,dt(e.routeIndex??0,`Invalid route index`)),lastInput:dt(e.lastInput??-1,`Invalid input index`),stored:[],level:dt(e.level??1,`Invalid machine level`)},a=P(n);z(i.level>=1&&i.level<=Ae,`Invalid machine level`),z(i.level===1||a.behavior===`crafter`,`Only crafting machines can be upgraded`),z(Array.isArray(e.transit??[]),`Invalid transit list`);for(let t of e.transit??[]){z(a.behavior===`router`||a.behavior===`bridge`,`Only routers and bridges carry items`);let e=mt(t);e.tileX=i.gridX,e.tileY=i.gridY,i.transit.push(e),u=Math.max(u,e.id)}i.transit.sort((e,t)=>t.progress-e.progress),z(Array.isArray(e.stored??[]),`Invalid storage contents`);for(let t of e.stored??[]){let e=ft(t,`Invalid stored resource`);z(h(e),`Unknown resource ${e}`),i.stored.push(e)}z(i.stored.length<=(a.storageCapacity??0),`Storage holds more than it can`);let l=xe(a,i.gridX,i.gridY,i.rotation);z(Ue(o.grid,o.occupancy,l).valid,`Machine placement is invalid`),o.addMachine(i),s.add(t),c=Math.max(c,gt(t))}z(Array.isArray(t.factory.conveyors),`Invalid conveyor list`);for(let e of t.factory.conveyors){z(lt(e),`Invalid conveyor`);let t=ft(e.id,`Invalid conveyor id`);z(!s.has(t),`Duplicate entity id`),z(le(e.direction),`Invalid conveyor direction`);let n=dt(e.gridX,`Invalid conveyor position`),r=dt(e.gridY,`Invalid conveyor position`);z(Ue(o.grid,o.occupancy,[{x:n,y:r}]).valid,`Conveyor placement is invalid`),o.addConveyor({id:t,gridX:n,gridY:r,direction:e.direction,items:[]}),s.add(t),c=Math.max(c,gt(t))}z(Array.isArray(t.factory.items),`Invalid item list`);for(let e of t.factory.items){let t=mt(e),n=o.conveyorAt(t.tileX,t.tileY);z(n!==void 0,`Item is not on a conveyor`),delete t.to,n.items.push(t),u=Math.max(u,t.id)}for(let e of o.conveyors.values())e.items.sort((e,t)=>t.progress-e.progress);o.nextEntityId=c+1,o.nextItemId=u+1;let d=lt(t.stats)?t.stats:{},f=new ae(n);return f.totalEarned=r,{factory:o,economy:f,simTime:ut(t.simTime??0,`Invalid sim time`),stats:{produced:pt(d.produced??{},`Invalid stats`),sold:pt(d.sold??{},`Invalid stats`)},tutorialStep:dt(t.tutorialStep??0,`Invalid tutorial step`),seenTips:Array.isArray(t.seenTips)?[...new Set(t.seenTips.filter(e=>typeof e==`string`&&Qe(e)))]:[],research:Array.isArray(t.research)?[...new Set(t.research.filter(e=>typeof e==`string`&&C(e)))]:[],contracts:ht(t.contracts),prestige:{stars:Math.max(0,dt(lt(t.prestige)?t.prestige.stars:void 0,`Invalid star count`)),count:Math.max(0,dt(lt(t.prestige)?t.prestige.count:void 0,`Invalid prestige count`))},environment:l(typeof t.environment==`string`?t.environment:``).id,achievements:Array.isArray(t.achievements)?[...new Set(t.achievements.filter(e=>typeof e==`string`&&Ve(e)))]:[],power:{baseSupply:Math.max(0,ut(lt(t.power)?t.power.baseSupply:void 0,`Invalid power supply`))}}}function vt(e){let t={...it,cosmetics:{...it.cosmetics}};if(!lt(e))return t;if(lt(e.cosmetics)){let{floor:n,belt:r,light:i}=e.cosmetics;we.some(e=>e.id===n)&&(t.cosmetics.floor=n),Te.some(e=>e.id===r)&&(t.cosmetics.belt=r),I.some(e=>e.id===i)&&(t.cosmetics.light=i)}return typeof e.masterVolume==`number`&&Number.isFinite(e.masterVolume)&&(t.masterVolume=Math.min(Math.max(e.masterVolume,0),1)),typeof e.sfx==`boolean`&&(t.sfx=e.sfx),typeof e.music==`boolean`&&(t.music=e.music),typeof e.shadows==`boolean`&&(t.shadows=e.shadows),(e.reduceMotion===`system`||e.reduceMotion===`on`||e.reduceMotion===`off`)&&(t.reduceMotion=e.reduceMotion),rt.some(t=>t===e.uiScale)&&(t.uiScale=e.uiScale),t}var yt=`one-more-machine`,bt=`saves`,xt=`omm.settings`;function St(){return new Promise((e,t)=>{let n=indexedDB.open(yt,1);n.onupgradeneeded=()=>n.result.createObjectStore(bt),n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}function Ct(e){if(typeof e!=`object`||!e)return-1;let t=e.timestamp;return typeof t==`number`?t:-1}var wt=class{db=null;onFailure=null;saveKey;localSaveKey;constructor(e=``){let t=e?`.${e}`:``;this.saveKey=`main${t}`,this.localSaveKey=`omm.save${t}`}database(){return this.db??=St().catch(()=>null),this.db}async readIndexedDb(){let e=await this.database();if(e)return new Promise(t=>{try{let n=e.transaction(bt,`readonly`).objectStore(bt).get(this.saveKey);n.onsuccess=()=>t(n.result),n.onerror=()=>t(void 0)}catch{t(void 0)}})}async writeIndexedDb(e){let t=await this.database();return t?new Promise(n=>{try{let r=t.transaction(bt,`readwrite`);r.oncomplete=()=>n(!0),r.onerror=()=>n(!1),r.onabort=()=>n(!1);let i=r.objectStore(bt);e?i.put(e,this.saveKey):i.delete(this.saveKey)}catch{n(!1)}}):!1}readLocal(){try{let e=localStorage.getItem(this.localSaveKey);return e?JSON.parse(e):void 0}catch{return localStorage.getItem(this.localSaveKey)?null:void 0}}async readNewest(){let e=await this.readIndexedDb(),t=this.readLocal();return e===void 0?t:t===void 0?e:Ct(t)>=Ct(e)?t:e}async hasSave(){return await this.readNewest()!==void 0}async load(){let e=await this.readNewest();if(e===void 0)throw new at(`No save found`);try{return{state:_t(e),savedAt:Ct(e)}}catch(e){throw e instanceof at?e:new at(e instanceof Error?e.message:`Unknown save error`)}}save(e,t){this.write(ct(e,t))}write(e){let t=!0;try{localStorage.setItem(this.localSaveKey,JSON.stringify(e))}catch{t=!1}this.writeIndexedDb(e).then(e=>{!e&&!t&&this.onFailure?.()})}async exportText(){let e=await this.readNewest();return e==null?null:JSON.stringify(e)}importText(e,t){let n;try{n=JSON.parse(e)}catch{throw new at(`Not a save file`)}let r;try{r=_t(n)}catch(e){throw e instanceof at?e:new at(e instanceof Error?e.message:`Unknown save error`)}this.write(ct(r,t))}async clear(){try{localStorage.removeItem(this.localSaveKey)}catch{}await this.writeIndexedDb(void 0)}loadSettings(){try{let e=localStorage.getItem(xt);return vt(e?JSON.parse(e):void 0)}catch{return vt(void 0)}}saveSettings(e){try{localStorage.setItem(xt,JSON.stringify(e))}catch{}}},Tt=1e3,Et=1001,Dt=1002,Ot=1003,kt=1004,At=1005,jt=1006,Mt=1007,Nt=1008,Pt=1009,Ft=1010,It=1011,Lt=1012,Rt=1013,zt=1014,Bt=1015,Vt=1016,Ht=1017,Ut=1018,Wt=1020,Gt=35902,Kt=35899,qt=1021,Jt=1022,Yt=1023,Xt=1026,Zt=1027,Qt=1028,$t=1029,en=1030,tn=1031,nn=1033,rn=33776,an=33777,on=33778,sn=33779,cn=35840,ln=35841,un=35842,dn=35843,fn=36196,pn=37492,mn=37496,hn=37488,gn=37489,_n=37490,vn=37491,yn=37808,bn=37809,xn=37810,Sn=37811,Cn=37812,wn=37813,Tn=37814,En=37815,Dn=37816,On=37817,kn=37818,An=37819,jn=37820,Mn=37821,Nn=36492,Pn=36494,Fn=36495,In=36283,Ln=36284,Rn=36285,zn=36286,Bn=2300,Vn=2301,Hn=2302,Un=2303,Wn=2400,Gn=2401,Kn=2402,qn=3200,Jn=`srgb`,Yn=`srgb-linear`,Xn=`linear`,Zn=`srgb`,Qn=7680,$n=35044,er=2e3;function tr(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function nr(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function rr(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function ir(){let e=rr(`canvas`);return e.style.display=`block`,e}var ar={};function or(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function sr(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function B(...e){e=sr(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function V(...e){e=sr(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function cr(...e){let t=e.join(` `);t in ar||(ar[t]=!0,B(...e))}function lr(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var ur={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},dr=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},fr=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),pr=1234567,mr=Math.PI/180,hr=180/Math.PI;function gr(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(fr[e&255]+fr[e>>8&255]+fr[e>>16&255]+fr[e>>24&255]+`-`+fr[t&255]+fr[t>>8&255]+`-`+fr[t>>16&15|64]+fr[t>>24&255]+`-`+fr[n&63|128]+fr[n>>8&255]+`-`+fr[n>>16&255]+fr[n>>24&255]+fr[r&255]+fr[r>>8&255]+fr[r>>16&255]+fr[r>>24&255]).toLowerCase()}function _r(e,t,n){return Math.max(t,Math.min(n,e))}function vr(e,t){return(e%t+t)%t}function yr(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function br(e,t,n){return e===t?0:(n-e)/(t-e)}function xr(e,t,n){return(1-n)*e+n*t}function Sr(e,t,n,r){return xr(e,t,1-Math.exp(-n*r))}function Cr(e,t=1){return t-Math.abs(vr(e,t*2)-t)}function wr(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function Tr(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function Er(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Dr(e,t){return e+Math.random()*(t-e)}function Or(e){return e*(.5-Math.random())}function kr(e){e!==void 0&&(pr=e);let t=pr+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Ar(e){return e*mr}function jr(e){return e*hr}function Mr(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function Nr(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function Pr(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Fr(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:B(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Ir(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function Lr(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var Rr={DEG2RAD:mr,RAD2DEG:hr,generateUUID:gr,clamp:_r,euclideanModulo:vr,mapLinear:yr,inverseLerp:br,lerp:xr,damp:Sr,pingpong:Cr,smoothstep:wr,smootherstep:Tr,randInt:Er,randFloat:Dr,randFloatSpread:Or,seededRandom:kr,degToRad:Ar,radToDeg:jr,isPowerOfTwo:Mr,ceilPowerOfTwo:Nr,floorPowerOfTwo:Pr,setQuaternionFromProperEuler:Fr,normalize:Lr,denormalize:Ir},H=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=_r(this.x,e.x,t.x),this.y=_r(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=_r(this.x,e,t),this.y=_r(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(_r(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(_r(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},zr=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:B(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(_r(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Vr.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Vr.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=_r(this.x,e.x,t.x),this.y=_r(this.y,e.y,t.y),this.z=_r(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=_r(this.x,e,t),this.y=_r(this.y,e,t),this.z=_r(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(_r(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Br.copy(this).projectOnVector(e),this.sub(Br)}reflect(e){return this.sub(Br.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(_r(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Br=new U,Vr=new zr,W=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return cr(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Hr.makeScale(e,t)),this}rotate(e){return cr(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Hr.makeRotation(-e)),this}translate(e,t){return cr(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Hr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Hr=new W,Ur=new W().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Wr=new W().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Gr(){let e={enabled:!0,workingColorSpace:Yn,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=qr(e.r),e.g=qr(e.g),e.b=qr(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Jr(e.r),e.g=Jr(e.g),e.b=Jr(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Xn:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return cr(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return cr(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Yn]:{primaries:t,whitePoint:r,transfer:Xn,toXYZ:Ur,fromXYZ:Wr,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Jn},outputColorSpaceConfig:{drawingBufferColorSpace:Jn}},[Jn]:{primaries:t,whitePoint:r,transfer:Zn,toXYZ:Ur,fromXYZ:Wr,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Jn}}}),e}var Kr=Gr();function qr(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Jr(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Yr,Xr=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Yr===void 0&&(Yr=rr(`canvas`)),Yr.width=e.width,Yr.height=e.height;let t=Yr.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Yr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=rr(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=qr(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(qr(t[e]/255)*255):t[e]=qr(t[e]);return{data:t,width:e.width,height:e.height}}return B(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Zr=0,Qr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Zr++}),this.uuid=gr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push($r(r[t].image)):e.push($r(r[t]))}else e=$r(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function $r(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Xr.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(B(`Texture: Unable to serialize Texture.`),{})}var ei=0,ti=new U,ni=class e extends dr{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=Et,i=Et,a=jt,o=Nt,s=Yt,c=Pt,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ei++}),this.uuid=gr(),this.name=``,this.source=new Qr(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new H(0,0),this.repeat=new H(1,1),this.center=new H(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new W,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(ti).x}get height(){return this.source.getSize(ti).y}get depth(){return this.source.getSize(ti).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){B(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){B(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Tt:e.x-=Math.floor(e.x);break;case Et:e.x=e.x<0?0:1;break;case Dt:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case Tt:e.y-=Math.floor(e.y);break;case Et:e.y=e.y<0?0:1;break;case Dt:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};ni.DEFAULT_IMAGE=null,ni.DEFAULT_MAPPING=300,ni.DEFAULT_ANISOTROPY=1;var ri=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=_r(this.x,e.x,t.x),this.y=_r(this.y,e.y,t.y),this.z=_r(this.z,e.z,t.z),this.w=_r(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=_r(this.x,e,t),this.y=_r(this.y,e,t),this.z=_r(this.z,e,t),this.w=_r(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(_r(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ii=class extends dr{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:jt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ri(0,0,e,t),this.scissorTest=!1,this.viewport=new ri(0,0,e,t),this.textures=[];let r=new ni({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:jt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Qr(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},ai=class extends ii{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},oi=class extends ni{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=Et,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},si=class extends ni{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=Et,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},ci=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/li.setFromMatrixColumn(e,0).length(),i=1/li.setFromMatrixColumn(e,1).length(),a=1/li.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(di,e,fi)}lookAt(e,t,n){let r=this.elements;return hi.subVectors(e,t),hi.lengthSq()===0&&(hi.z=1),hi.normalize(),pi.crossVectors(n,hi),pi.lengthSq()===0&&(Math.abs(n.z)===1?hi.x+=1e-4:hi.z+=1e-4,hi.normalize(),pi.crossVectors(n,hi)),pi.normalize(),mi.crossVectors(hi,pi),r[0]=pi.x,r[4]=mi.x,r[8]=hi.x,r[1]=pi.y,r[5]=mi.y,r[9]=hi.y,r[2]=pi.z,r[6]=mi.z,r[10]=hi.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],ee=r[14],M=r[3],te=r[7],ne=r[11],re=r[15];return i[0]=a*x+o*T+s*k+c*M,i[4]=a*S+o*E+s*A+c*te,i[8]=a*C+o*D+s*j+c*ne,i[12]=a*w+o*O+s*ee+c*re,i[1]=l*x+u*T+d*k+f*M,i[5]=l*S+u*E+d*A+f*te,i[9]=l*C+u*D+d*j+f*ne,i[13]=l*w+u*O+d*ee+f*re,i[2]=p*x+m*T+h*k+g*M,i[6]=p*S+m*E+h*A+g*te,i[10]=p*C+m*D+h*j+g*ne,i[14]=p*w+m*O+h*ee+g*re,i[3]=_*x+v*T+y*k+b*M,i[7]=_*S+v*E+y*A+b*te,i[11]=_*C+v*D+y*j+b*ne,i[15]=_*w+v*O+y*ee+b*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=li.set(r[0],r[1],r[2]).length(),o=li.set(r[4],r[5],r[6]).length(),s=li.set(r[8],r[9],r[10]).length();i<0&&(a=-a),ui.copy(this);let c=1/a,l=1/o,u=1/s;return ui.elements[0]*=c,ui.elements[1]*=c,ui.elements[2]*=c,ui.elements[4]*=l,ui.elements[5]*=l,ui.elements[6]*=l,ui.elements[8]*=u,ui.elements[9]*=u,ui.elements[10]*=u,t.setFromRotationMatrix(ui),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=er,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=er,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},li=new U,ui=new ci,di=new U(0,0,0),fi=new U(1,1,1),pi=new U,mi=new U,hi=new U,gi=new ci,_i=new zr,vi=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(_r(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-_r(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(_r(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-_r(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(_r(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-_r(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:B(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return gi.makeRotationFromQuaternion(e),this.setFromRotationMatrix(gi,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return _i.setFromEuler(this),this.setFromQuaternion(_i,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};vi.DEFAULT_ORDER=`XYZ`;var yi=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},bi=0,xi=new U,Si=new zr,Ci=new ci,wi=new U,Ti=new U,Ei=new U,Di=new zr,Oi=new U(1,0,0),ki=new U(0,1,0),Ai=new U(0,0,1),ji={type:`added`},Mi={type:`removed`},Ni={type:`childadded`,child:null},Pi={type:`childremoved`,child:null},Fi=class e extends dr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:bi++}),this.uuid=gr(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new U,n=new vi,r=new zr,i=new U(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new ci},normalMatrix:{value:new W}}),this.matrix=new ci,this.matrixWorld=new ci,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new yi,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Si.setFromAxisAngle(e,t),this.quaternion.multiply(Si),this}rotateOnWorldAxis(e,t){return Si.setFromAxisAngle(e,t),this.quaternion.premultiply(Si),this}rotateX(e){return this.rotateOnAxis(Oi,e)}rotateY(e){return this.rotateOnAxis(ki,e)}rotateZ(e){return this.rotateOnAxis(Ai,e)}translateOnAxis(e,t){return xi.copy(e).applyQuaternion(this.quaternion),this.position.add(xi.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Oi,e)}translateY(e){return this.translateOnAxis(ki,e)}translateZ(e){return this.translateOnAxis(Ai,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ci.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?wi.copy(e):wi.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Ti.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ci.lookAt(Ti,wi,this.up):Ci.lookAt(wi,Ti,this.up),this.quaternion.setFromRotationMatrix(Ci),r&&(Ci.extractRotation(r.matrixWorld),Si.setFromRotationMatrix(Ci),this.quaternion.premultiply(Si.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(V(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ji),Ni.child=e,this.dispatchEvent(Ni),Ni.child=null):V(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Mi),Pi.child=e,this.dispatchEvent(Pi),Pi.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ci.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ci.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ci),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ji),Ni.child=e,this.dispatchEvent(Ni),Ni.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ti,e,Ei),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ti,Di,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Fi.DEFAULT_UP=new U(0,1,0),Fi.DEFAULT_MATRIX_AUTO_UPDATE=!0,Fi.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ii=class extends Fi{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Li={type:`move`},Ri=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ii,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ii,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ii,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Li)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ii;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},zi={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Bi={h:0,s:0,l:0},Vi={h:0,s:0,l:0};function Hi(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var G=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Jn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Kr.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Kr.workingColorSpace){return this.r=e,this.g=t,this.b=n,Kr.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Kr.workingColorSpace){if(e=vr(e,1),t=_r(t,0,1),n=_r(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Hi(i,r,e+1/3),this.g=Hi(i,r,e),this.b=Hi(i,r,e-1/3)}return Kr.colorSpaceToWorking(this,r),this}setStyle(e,t=Jn){function n(t){t!==void 0&&parseFloat(t)<1&&B(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:B(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);B(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Jn){let n=zi[e.toLowerCase()];return n===void 0?B(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=qr(e.r),this.g=qr(e.g),this.b=qr(e.b),this}copyLinearToSRGB(e){return this.r=Jr(e.r),this.g=Jr(e.g),this.b=Jr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Jn){return Kr.workingToColorSpace(Ui.copy(this),e),Math.round(_r(Ui.r*255,0,255))*65536+Math.round(_r(Ui.g*255,0,255))*256+Math.round(_r(Ui.b*255,0,255))}getHexString(e=Jn){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Kr.workingColorSpace){Kr.workingToColorSpace(Ui.copy(this),t);let n=Ui.r,r=Ui.g,i=Ui.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Kr.workingColorSpace){return Kr.workingToColorSpace(Ui.copy(this),t),e.r=Ui.r,e.g=Ui.g,e.b=Ui.b,e}getStyle(e=Jn){Kr.workingToColorSpace(Ui.copy(this),e);let t=Ui.r,n=Ui.g,r=Ui.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Bi),this.setHSL(Bi.h+e,Bi.s+t,Bi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Bi),e.getHSL(Vi);let n=xr(Bi.h,Vi.h,t),r=xr(Bi.s,Vi.s,t),i=xr(Bi.l,Vi.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ui=new G;G.NAMES=zi;var Wi=class extends Fi{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new vi,this.environmentIntensity=1,this.environmentRotation=new vi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Gi=new U,Ki=new U,qi=new U,Ji=new U,Yi=new U,Xi=new U,Zi=new U,Qi=new U,$i=new U,ea=new U,ta=new ri,na=new ri,ra=new ri,ia=class e{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Gi.subVectors(e,t),r.cross(Gi);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Gi.subVectors(r,t),Ki.subVectors(n,t),qi.subVectors(e,t);let a=Gi.dot(Gi),o=Gi.dot(Ki),s=Gi.dot(qi),c=Ki.dot(Ki),l=Ki.dot(qi),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Ji)!==null&&Ji.x>=0&&Ji.y>=0&&Ji.x+Ji.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Ji)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Ji.x),s.addScaledVector(a,Ji.y),s.addScaledVector(o,Ji.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return ta.setScalar(0),na.setScalar(0),ra.setScalar(0),ta.fromBufferAttribute(e,t),na.fromBufferAttribute(e,n),ra.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(ta,i.x),a.addScaledVector(na,i.y),a.addScaledVector(ra,i.z),a}static isFrontFacing(e,t,n,r){return Gi.subVectors(n,t),Ki.subVectors(e,t),Gi.cross(Ki).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Gi.subVectors(this.c,this.b),Ki.subVectors(this.a,this.b),Gi.cross(Ki).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Yi.subVectors(r,n),Xi.subVectors(i,n),Qi.subVectors(e,n);let s=Yi.dot(Qi),c=Xi.dot(Qi);if(s<=0&&c<=0)return t.copy(n);$i.subVectors(e,r);let l=Yi.dot($i),u=Xi.dot($i);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Yi,a);ea.subVectors(e,i);let f=Yi.dot(ea),p=Xi.dot(ea);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Xi,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Zi.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Zi,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Yi,a).addScaledVector(Xi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},aa=class{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(sa.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(sa.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=sa.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,sa):sa.fromBufferAttribute(r,t),sa.applyMatrix4(e.matrixWorld),this.expandByPoint(sa);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),ca.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),ca.copy(e.boundingBox)),ca.applyMatrix4(e.matrixWorld),this.union(ca)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,sa),sa.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ha),ga.subVectors(this.max,ha),la.subVectors(e.a,ha),ua.subVectors(e.b,ha),da.subVectors(e.c,ha),fa.subVectors(ua,la),pa.subVectors(da,ua),ma.subVectors(la,da);let t=[0,-fa.z,fa.y,0,-pa.z,pa.y,0,-ma.z,ma.y,fa.z,0,-fa.x,pa.z,0,-pa.x,ma.z,0,-ma.x,-fa.y,fa.x,0,-pa.y,pa.x,0,-ma.y,ma.x,0];return!ya(t,la,ua,da,ga)||(t=[1,0,0,0,1,0,0,0,1],!ya(t,la,ua,da,ga))?!1:(_a.crossVectors(fa,pa),t=[_a.x,_a.y,_a.z],ya(t,la,ua,da,ga))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,sa).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(sa).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(oa[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),oa[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),oa[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),oa[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),oa[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),oa[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),oa[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),oa[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(oa),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},oa=[new U,new U,new U,new U,new U,new U,new U,new U],sa=new U,ca=new aa,la=new U,ua=new U,da=new U,fa=new U,pa=new U,ma=new U,ha=new U,ga=new U,_a=new U,va=new U;function ya(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){va.fromArray(e,a);let o=i.x*Math.abs(va.x)+i.y*Math.abs(va.y)+i.z*Math.abs(va.z),s=t.dot(va),c=n.dot(va),l=r.dot(va);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var ba=new U,xa=new H,Sa=0,Ca=class extends dr{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Sa++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=$n,this.updateRanges=[],this.gpuType=Bt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)xa.fromBufferAttribute(this,t),xa.applyMatrix3(e),this.setXY(t,xa.x,xa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ba.fromBufferAttribute(this,t),ba.applyMatrix3(e),this.setXYZ(t,ba.x,ba.y,ba.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ba.fromBufferAttribute(this,t),ba.applyMatrix4(e),this.setXYZ(t,ba.x,ba.y,ba.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ba.fromBufferAttribute(this,t),ba.applyNormalMatrix(e),this.setXYZ(t,ba.x,ba.y,ba.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ba.fromBufferAttribute(this,t),ba.transformDirection(e),this.setXYZ(t,ba.x,ba.y,ba.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ir(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Lr(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ir(t,this.array)),t}setX(e,t){return this.normalized&&(t=Lr(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ir(t,this.array)),t}setY(e,t){return this.normalized&&(t=Lr(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ir(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Lr(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ir(t,this.array)),t}setW(e,t){return this.normalized&&(t=Lr(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Lr(t,this.array),n=Lr(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Lr(t,this.array),n=Lr(n,this.array),r=Lr(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=Lr(t,this.array),n=Lr(n,this.array),r=Lr(r,this.array),i=Lr(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},wa=class extends Ca{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Ta=class extends Ca{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Ea=class extends Ca{constructor(e,t,n){super(new Float32Array(e),t,n)}},Da=new aa,Oa=new U,ka=new U,Aa=class{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?Da.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Oa.subVectors(e,this.center);let t=Oa.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Oa,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ka.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Oa.copy(e.center).add(ka)),this.expandByPoint(Oa.copy(e.center).sub(ka))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},ja=0,Ma=new ci,Na=new Fi,Pa=new U,Fa=new aa,Ia=new aa,La=new U,Ra=class e extends dr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ja++}),this.uuid=gr(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(tr(e)?Ta:wa)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new W().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Ma.makeRotationFromQuaternion(e),this.applyMatrix4(Ma),this}rotateX(e){return Ma.makeRotationX(e),this.applyMatrix4(Ma),this}rotateY(e){return Ma.makeRotationY(e),this.applyMatrix4(Ma),this}rotateZ(e){return Ma.makeRotationZ(e),this.applyMatrix4(Ma),this}translate(e,t,n){return Ma.makeTranslation(e,t,n),this.applyMatrix4(Ma),this}scale(e,t,n){return Ma.makeScale(e,t,n),this.applyMatrix4(Ma),this}lookAt(e){return Na.lookAt(e),Na.updateMatrix(),this.applyMatrix4(Na.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Pa).negate(),this.translate(Pa.x,Pa.y,Pa.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Ea(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&B(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new aa);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){V(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Fa.setFromBufferAttribute(n),this.morphTargetsRelative?(La.addVectors(this.boundingBox.min,Fa.min),this.boundingBox.expandByPoint(La),La.addVectors(this.boundingBox.max,Fa.max),this.boundingBox.expandByPoint(La)):(this.boundingBox.expandByPoint(Fa.min),this.boundingBox.expandByPoint(Fa.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&V(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Aa);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){V(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new U,1/0);return}if(e){let n=this.boundingSphere.center;if(Fa.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Ia.setFromBufferAttribute(n),this.morphTargetsRelative?(La.addVectors(Fa.min,Ia.min),Fa.expandByPoint(La),La.addVectors(Fa.max,Ia.max),Fa.expandByPoint(La)):(Fa.expandByPoint(Ia.min),Fa.expandByPoint(Ia.max))}Fa.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)La.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(La));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)La.fromBufferAttribute(a,t),o&&(Pa.fromBufferAttribute(e,t),La.add(Pa)),r=Math.max(r,n.distanceToSquared(La))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&V(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){V(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Ca(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new U,s[e]=new U;let c=new U,l=new U,u=new U,d=new H,f=new H,p=new H,m=new U,h=new U;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new U,y=new U,b=new U,x=new U;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Ca(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new U,i=new U,a=new U,o=new U,s=new U,c=new U,l=new U,u=new U;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)La.fromBufferAttribute(e,t),La.normalize(),e.setXYZ(t,La.x,La.y,La.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Ca(a,r,i)}if(this.index===null)return B(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},za=new U,Ba=new U,Va=new W,Ha=class{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=za.subVectors(n,t).cross(Ba.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(za),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Va.getNormalMatrix(e),r=this.coplanarPoint(za).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Ua=0,Wa=class extends dr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ua++}),this.uuid=gr(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new G(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Qn,this.stencilZFail=Qn,this.stencilZPass=Qn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){B(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){B(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new G().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new Ha().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new H().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new H().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Ga=new U,Ka=new U,qa=new U,Ja=new U,Ya=class{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ga)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ga.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ga.copy(this.origin).addScaledVector(this.direction,t),Ga.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Ka.copy(e).add(t).multiplyScalar(.5),qa.copy(t).sub(e).normalize(),Ja.copy(this.origin).sub(Ka);let i=e.distanceTo(t)*.5,a=-this.direction.dot(qa),o=Ja.dot(this.direction),s=-Ja.dot(qa),c=Ja.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Ka).addScaledVector(qa,d),f}intersectSphere(e,t){if(e.radius<0)return null;Ga.subVectors(e.center,this.origin);let n=Ga.dot(this.direction),r=Ga.dot(Ga)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Ga)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,ee,M;if(y>=b&&y>=x?(w=s,D=u,A=p,M=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,ee=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,ee=_)):b>=x?(w=c,D=d,A=m,M=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,ee=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,ee=v)):(w=l,D=f,A=h,M=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,ee=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,ee=g)),w===0)return null;let te=S/w,ne=C/w,re=1/w,ie=T-te*D,ae=E-ne*D,oe=O-te*A,se=k-ne*A,N=j-te*M,ce=ee-ne*M,le=N*se-ce*oe,ue=ie*ce-ae*N,de=oe*ae-se*ie;if(r){if(le<0||ue<0||de<0)return null}else if((le<0||ue<0||de<0)&&(le>0||ue>0||de>0))return null;let fe=le+ue+de;if(fe===0)return null;let pe=re*(le*D+ue*A+de*M);return(fe>0?pe<0:pe>0)?null:this.at(pe/fe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Xa=class extends Wa{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new G(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vi,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Za=new ci,Qa=new Ya,$a=new Aa,eo=new U,to=new U,no=new U,ro=new U,io=new U,ao=new U,oo=new U,so=new U,co=class extends Fi{constructor(e=new Ra,t=new Xa){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){ao.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(io.fromBufferAttribute(s,e),a?ao.addScaledVector(io,r):ao.addScaledVector(io.sub(t),r))}t.add(ao)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),$a.copy(n.boundingSphere),$a.applyMatrix4(i),Qa.copy(e.ray).recast(e.near),!($a.containsPoint(Qa.origin)===!1&&(Qa.intersectSphere($a,eo)===null||Qa.origin.distanceToSquared(eo)>(e.far-e.near)**2))&&(Za.copy(i).invert(),Qa.copy(e.ray).applyMatrix4(Za),(n.boundingBox===null||Qa.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Qa)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=uo(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=uo(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=uo(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=uo(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function lo(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;so.copy(s),so.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(so);return l<n.near||l>n.far?null:{distance:l,point:so.clone(),object:e}}function uo(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,to),e.getVertexPosition(c,no),e.getVertexPosition(l,ro);let u=lo(e,t,n,r,to,no,ro,oo);if(u){let e=new U;ia.getBarycoord(oo,to,no,ro,e),i&&(u.uv=ia.getInterpolatedAttribute(i,s,c,l,e,new H)),a&&(u.uv1=ia.getInterpolatedAttribute(a,s,c,l,e,new H)),o&&(u.normal=ia.getInterpolatedAttribute(o,s,c,l,e,new U),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new U,materialIndex:0};ia.getNormal(to,no,ro,t.normal),u.face=t,u.barycoord=e}return u}var fo=class extends ni{constructor(e=null,t=1,n=1,r,i,a,o,s,c=Ot,l=Ot,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},po=class extends Ca{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},mo=new ci,ho=new ci,go=[],_o=new aa,vo=new ci,yo=new co,bo=new Aa,xo=class extends co{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new po(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,vo)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new aa),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,mo),_o.copy(e.boundingBox).applyMatrix4(mo),this.boundingBox.union(_o)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Aa),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,mo),bo.copy(e.boundingSphere).applyMatrix4(mo),this.boundingSphere.union(bo)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(yo.geometry=this.geometry,yo.material=this.material,yo.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),bo.copy(this.boundingSphere),bo.applyMatrix4(n),e.ray.intersectsSphere(bo)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,mo),ho.multiplyMatrices(n,mo),yo.matrixWorld=ho,yo.raycast(e,go);for(let e=0,n=go.length;e<n;e++){let n=go[e];n.instanceId=i,n.object=this,t.push(n)}go.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new po(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new fo(new Float32Array(r*this.count),r,this.count,Qt,Bt));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},So=new Aa,Co=new H(.5,.5),wo=new U,To=class{constructor(e=new Ha,t=new Ha,n=new Ha,r=new Ha,i=new Ha,a=new Ha){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=er,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),So.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),So.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(So)}intersectsSprite(e){return So.center.set(0,0,0),So.radius=.7071067811865476+Co.distanceTo(e.center),So.applyMatrix4(e.matrixWorld),this.intersectsSphere(So)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(wo.x=r.normal.x>0?e.max.x:e.min.x,wo.y=r.normal.y>0?e.max.y:e.min.y,wo.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(wo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Eo=class extends ni{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Do=class extends ni{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Oo=class extends ni{constructor(e,t,n=zt,r,i,a,o=Ot,s=Ot,c,l=Xt,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Qr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},ko=class extends Oo{constructor(e,t=zt,n=301,r,i,a=Ot,o=Ot,s,c=Xt){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ao=class extends ni{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},jo=class e extends Ra{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Ea(c,3)),this.setAttribute(`normal`,new Ea(l,3)),this.setAttribute(`uv`,new Ea(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new U;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Mo=class e extends Ra{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new U,l=new H;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new Ea(a,3)),this.setAttribute(`normal`,new Ea(o,3)),this.setAttribute(`uv`,new Ea(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},No=class e extends Ra{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Ea(u,3)),this.setAttribute(`normal`,new Ea(d,3)),this.setAttribute(`uv`,new Ea(f,2));function _(){let a=new U,_=new U,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new H,m=new U,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Po=class e extends No{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Fo=class e extends Ra{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Ea(i,3)),this.setAttribute(`normal`,new Ea(i.slice(),3)),this.setAttribute(`uv`,new Ea(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new U,r=new U,i=new U;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new U;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new U;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new U,t=new U,n=new U,r=new U,o=new H,s=new H,c=new H;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Io=class e extends Fo{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=1/n,i=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-n,0,-r,n,0,r,-n,0,r,n,-r,-n,0,-r,n,0,r,-n,0,r,n,0,-n,0,-r,n,0,-r,-n,0,r,n,0,r];super(i,[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type=`DodecahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Lo=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){B(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new H:new U);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new U,r=[],i=[],a=[],o=new U,s=new ci;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new U)}i[0]=new U,a[0]=new U;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(_r(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(_r(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Ro=class extends Lo{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new H){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},zo=class extends Ro{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function Bo(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var Vo=new U,Ho=new U,Uo=new Bo,Wo=new Bo,Go=new Bo,Ko=class extends Lo{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new U){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(Ho.subVectors(r[0],r[1]).add(r[0]),c=Ho);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(Vo.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=Vo),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),Uo.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),Wo.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),Go.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(Uo.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),Wo.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),Go.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(Uo.calc(s),Wo.calc(s),Go.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new U().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function qo(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function Jo(e,t){let n=1-e;return n*n*t}function Yo(e,t){return 2*(1-e)*e*t}function Xo(e,t){return e*e*t}function Zo(e,t,n,r){return Jo(e,t)+Yo(e,n)+Xo(e,r)}function Qo(e,t){let n=1-e;return n*n*n*t}function $o(e,t){let n=1-e;return 3*n*n*e*t}function es(e,t){return 3*(1-e)*e*e*t}function ts(e,t){return e*e*e*t}function ns(e,t,n,r,i){return Qo(e,t)+$o(e,n)+es(e,r)+ts(e,i)}var rs=class extends Lo{constructor(e=new H,t=new H,n=new H,r=new H){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new H){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(ns(e,r.x,i.x,a.x,o.x),ns(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},is=class extends Lo{constructor(e=new U,t=new U,n=new U,r=new U){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new U){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(ns(e,r.x,i.x,a.x,o.x),ns(e,r.y,i.y,a.y,o.y),ns(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},as=class extends Lo{constructor(e=new H,t=new H){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new H){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new H){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},os=class extends Lo{constructor(e=new U,t=new U){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new U){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new U){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ss=class extends Lo{constructor(e=new H,t=new H,n=new H){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new H){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(Zo(e,r.x,i.x,a.x),Zo(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},cs=class extends Lo{constructor(e=new U,t=new U,n=new U){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new U){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(Zo(e,r.x,i.x,a.x),Zo(e,r.y,i.y,a.y),Zo(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ls=class extends Lo{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new H){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(qo(o,s.x,c.x,l.x,u.x),qo(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new H().fromArray(n))}return this}},us=Object.freeze({__proto__:null,ArcCurve:zo,CatmullRomCurve3:Ko,CubicBezierCurve:rs,CubicBezierCurve3:is,EllipseCurve:Ro,LineCurve:as,LineCurve3:os,QuadraticBezierCurve:ss,QuadraticBezierCurve3:cs,SplineCurve:ls}),ds=class extends Lo{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new us[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new us[n.type]().fromJSON(n))}return this}},fs=class extends ds{constructor(e){super(),this.type=`Path`,this.currentPoint=new H,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new as(this.currentPoint.clone(),new H(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new ss(this.currentPoint.clone(),new H(e,t),new H(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new rs(this.currentPoint.clone(),new H(e,t),new H(n,r),new H(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new ls([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new Ro(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},ps=class extends fs{constructor(e){super(e),this.uuid=gr(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new fs().fromJSON(n))}return this}};function ms(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=hs(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=Ss(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return _s(a,o,n,s,c,l,0),o}function hs(e,t,n,r,i){let a;if(i===Ks(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=Us(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=Us(i/r|0,e[i],e[i+1],a);return a&&Fs(a,a.next)&&(Ws(a),a=a.next),a}function gs(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(Fs(n,n.next)||Ps(n.prev,n,n.next)===0)){if(Ws(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function _s(e,t,n,r,i,a,o){if(!e)return;!o&&a&&Ds(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?ys(e,r,i,a):vs(e)){t.push(c.i,e.i,l.i),Ws(e),e=l.next,s=l.next;continue}if(e=l,e===s){o?o===1?(e=bs(gs(e),t),_s(e,t,n,r,i,a,2)):o===2&&xs(e,t,n,r,i,a):_s(gs(e),t,n,r,i,a,1);break}}}function vs(e){let t=e.prev,n=e,r=e.next;if(Ps(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&Ms(i,s,a,c,o,l,m.x,m.y)&&Ps(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function ys(e,t,n,r){let i=e.prev,a=e,o=e.next;if(Ps(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=ks(p,m,t,n,r),v=ks(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Ms(s,u,c,d,l,f,y.x,y.y)&&Ps(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Ms(s,u,c,d,l,f,b.x,b.y)&&Ps(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Ms(s,u,c,d,l,f,y.x,y.y)&&Ps(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Ms(s,u,c,d,l,f,b.x,b.y)&&Ps(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function bs(e,t){let n=e;do{let r=n.prev,i=n.next.next;!Fs(r,i)&&Is(r,n,n.next,i)&&Bs(r,i)&&Bs(i,r)&&(t.push(r.i,n.i,i.i),Ws(n),Ws(n.next),n=e=i),n=n.next}while(n!==e);return gs(n)}function xs(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&Ns(o,e)){let s=Hs(o,e);o=gs(o,o.next),s=gs(s,s.next),_s(o,t,n,r,i,a,0),_s(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function Ss(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=hs(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(As(o))}i.sort(Cs);for(let e=0;e<i.length;e++)n=ws(i[e],n);return n}function Cs(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function ws(e,t){let n=Ts(e,t);if(!n)return t;let r=Hs(n,e);return gs(r,r.next),gs(n,n.next)}function Ts(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(Fs(e,n))return n;do{if(Fs(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&js(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);Bs(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&Es(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function Es(e,t){return Ps(e.prev,e,t.prev)<0&&Ps(t.next,e,e.next)<0}function Ds(e,t,n,r){let i=e;do i.z===0&&(i.z=ks(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,Os(i)}function Os(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function ks(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function As(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function js(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function Ms(e,t,n,r,i,a,o,s){return(e!==o||t!==s)&&js(e,t,n,r,i,a,o,s)}function Ns(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!zs(e,t)&&(Bs(e,t)&&Bs(t,e)&&Vs(e,t)&&(Ps(e.prev,e,t.prev)||Ps(e,t.prev,t))||Fs(e,t)&&Ps(e.prev,e,e.next)>0&&Ps(t.prev,t,t.next)>0)}function Ps(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function Fs(e,t){return e.x===t.x&&e.y===t.y}function Is(e,t,n,r){let i=Rs(Ps(e,t,n)),a=Rs(Ps(e,t,r)),o=Rs(Ps(n,r,e)),s=Rs(Ps(n,r,t));return!!(i!==a&&o!==s||i===0&&Ls(e,n,t)||a===0&&Ls(e,r,t)||o===0&&Ls(n,e,r)||s===0&&Ls(n,t,r))}function Ls(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function Rs(e){return e>0?1:e<0?-1:0}function zs(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&Is(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Bs(e,t){return Ps(e.prev,e,e.next)<0?Ps(e,t,e.next)>=0&&Ps(e,e.prev,t)>=0:Ps(e,t,e.prev)<0||Ps(e,e.next,t)<0}function Vs(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function Hs(e,t){let n=Gs(e.i,e.x,e.y),r=Gs(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function Us(e,t,n,r){let i=Gs(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function Ws(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function Gs(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ks(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var qs=class{static triangulate(e,t,n=2){return ms(e,t,n)}},Js=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];Ys(e),Xs(n,e);let a=e.length;t.forEach(Ys);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,Xs(n,t[e]);let o=qs.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function Ys(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function Xs(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var Zs=class e extends Ra{constructor(e=new ps([new H(.5,.5),new H(-.5,.5),new H(-.5,-.5),new H(.5,-.5)]),t={}){super(),this.type=`ExtrudeGeometry`,this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],i=[];for(let t=0,n=e.length;t<n;t++){let n=e[t];a(n)}this.setAttribute(`position`,new Ea(r,3)),this.setAttribute(`uv`,new Ea(i,2)),this.computeVertexNormals();function a(e){let a=[],o=t.curveSegments===void 0?12:t.curveSegments,s=t.steps===void 0?1:t.steps,c=t.depth===void 0?1:t.depth,l=t.bevelEnabled===void 0||t.bevelEnabled,u=t.bevelThickness===void 0?.2:t.bevelThickness,d=t.bevelSize===void 0?u-.1:t.bevelSize,f=t.bevelOffset===void 0?0:t.bevelOffset,p=t.bevelSegments===void 0?3:t.bevelSegments,m=t.extrudePath,h=t.UVGenerator===void 0?Qs:t.UVGenerator,g,_=!1,v,y,b,x;if(m){g=m.getSpacedPoints(s),_=!0,l=!1;let e=m.isCatmullRomCurve3?m.closed:!1;v=m.computeFrenetFrames(s,e),y=new U,b=new U,x=new U}l||(p=0,u=0,d=0,f=0);let S=e.extractPoints(o),C=S.shape,w=S.holes;if(!Js.isClockWise(C)){C=C.reverse();for(let e=0,t=w.length;e<t;e++){let t=w[e];Js.isClockWise(t)&&(w[e]=t.reverse())}}function T(e){let t=e[0];for(let n=1;n<=e.length;n++){let r=n%e.length,i=e[r],a=i.x-t.x,o=i.y-t.y,s=a*a+o*o,c=Math.max(Math.abs(i.x),Math.abs(i.y),Math.abs(t.x),Math.abs(t.y));if(s<=10000000000000001e-36*c*c){e.splice(r,1),n--;continue}t=i}}T(C),w.forEach(T);let E=w.length,D=C;for(let e=0;e<E;e++){let t=w[e];C=C.concat(t)}function O(e,t,n){return t||V(`ExtrudeGeometry: vec does not exist`),e.clone().addScaledVector(t,n)}let k=C.length;function A(e,t,n){let r,i,a,o=e.x-t.x,s=e.y-t.y,c=n.x-e.x,l=n.y-e.y,u=o*o+s*s,d=o*l-s*c;if(Math.abs(d)>2**-52){let d=Math.sqrt(u),f=Math.sqrt(c*c+l*l),p=t.x-s/d,m=t.y+o/d,h=n.x-l/f,g=n.y+c/f,_=((h-p)*l-(g-m)*c)/(o*l-s*c);r=p+o*_-e.x,i=m+s*_-e.y;let v=r*r+i*i;if(v<=2)return new H(r,i);a=Math.sqrt(v/2)}else{let e=!1;o>2**-52?c>2**-52&&(e=!0):o<-(2**-52)?c<-(2**-52)&&(e=!0):Math.sign(s)===Math.sign(l)&&(e=!0),e?(r=-s,i=o,a=Math.sqrt(u)):(r=o,i=s,a=Math.sqrt(u/2))}return new H(r/a,i/a)}let j=[];for(let e=0,t=D.length,n=t-1,r=e+1;e<t;e++,n++,r++)n===t&&(n=0),r===t&&(r=0),j[e]=A(D[e],D[n],D[r]);let ee=[],M,te=j.concat();for(let e=0,t=E;e<t;e++){let t=w[e];M=[];for(let e=0,n=t.length,r=n-1,i=e+1;e<n;e++,r++,i++)r===n&&(r=0),i===n&&(i=0),M[e]=A(t[e],t[r],t[i]);ee.push(M),te=te.concat(M)}let ne;if(p===0)ne=Js.triangulateShape(D,w);else{let e=[],t=[];for(let n=0;n<p;n++){let r=n/p,i=u*Math.cos(r*Math.PI/2),a=d*Math.sin(r*Math.PI/2)+f;for(let t=0,n=D.length;t<n;t++){let n=O(D[t],j[t],a);N(n.x,n.y,-i),r===0&&e.push(n)}for(let e=0,n=E;e<n;e++){let n=w[e];M=ee[e];let o=[];for(let e=0,t=n.length;e<t;e++){let t=O(n[e],M[e],a);N(t.x,t.y,-i),r===0&&o.push(t)}r===0&&t.push(o)}}ne=Js.triangulateShape(e,t)}let re=ne.length,ie=d+f;for(let e=0;e<k;e++){let t=l?O(C[e],te[e],ie):C[e];_?(b.copy(v.normals[0]).multiplyScalar(t.x),y.copy(v.binormals[0]).multiplyScalar(t.y),x.copy(g[0]).add(b).add(y),N(x.x,x.y,x.z)):N(t.x,t.y,0)}for(let e=1;e<=s;e++)for(let t=0;t<k;t++){let n=l?O(C[t],te[t],ie):C[t];_?(b.copy(v.normals[e]).multiplyScalar(n.x),y.copy(v.binormals[e]).multiplyScalar(n.y),x.copy(g[e]).add(b).add(y),N(x.x,x.y,x.z)):N(n.x,n.y,c/s*e)}for(let e=p-1;e>=0;e--){let t=e/p,n=u*Math.cos(t*Math.PI/2),r=d*Math.sin(t*Math.PI/2)+f;for(let e=0,t=D.length;e<t;e++){let t=O(D[e],j[e],r);N(t.x,t.y,c+n)}for(let e=0,t=w.length;e<t;e++){let t=w[e];M=ee[e];for(let e=0,i=t.length;e<i;e++){let i=O(t[e],M[e],r);_?N(i.x,i.y+g[s-1].y,g[s-1].x+n):N(i.x,i.y,c+n)}}}ae(),oe();function ae(){let e=r.length/3;if(l){let e=0,t=k*e;for(let e=0;e<re;e++){let n=ne[e];ce(n[2]+t,n[1]+t,n[0]+t)}e=s+p*2,t=k*e;for(let e=0;e<re;e++){let n=ne[e];ce(n[0]+t,n[1]+t,n[2]+t)}}else{for(let e=0;e<re;e++){let t=ne[e];ce(t[2],t[1],t[0])}for(let e=0;e<re;e++){let t=ne[e];ce(t[0]+k*s,t[1]+k*s,t[2]+k*s)}}n.addGroup(e,r.length/3-e,0)}function oe(){let e=r.length/3,t=0;se(D,t),t+=D.length;for(let e=0,n=w.length;e<n;e++){let n=w[e];se(n,t),t+=n.length}n.addGroup(e,r.length/3-e,1)}function se(e,t){let n=e.length;for(;--n>=0;){let r=n,i=n-1;i<0&&(i=e.length-1);for(let e=0,n=s+p*2;e<n;e++){let n=k*e,a=k*(e+1);le(t+r+n,t+i+n,t+i+a,t+r+a)}}}function N(e,t,n){a.push(e),a.push(t),a.push(n)}function ce(e,t,i){ue(e),ue(t),ue(i);let a=r.length/3,o=h.generateTopUV(n,r,a-3,a-2,a-1);de(o[0]),de(o[1]),de(o[2])}function le(e,t,i,a){ue(e),ue(t),ue(a),ue(t),ue(i),ue(a);let o=r.length/3,s=h.generateSideWallUV(n,r,o-6,o-3,o-2,o-1);de(s[0]),de(s[1]),de(s[3]),de(s[1]),de(s[2]),de(s[3])}function ue(e){r.push(a[e*3+0]),r.push(a[e*3+1]),r.push(a[e*3+2])}function de(e){i.push(e.x),i.push(e.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return $s(t,n,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new us[i.type]().fromJSON(i)),new e(r,t.options)}},Qs={generateTopUV:function(e,t,n,r,i){let a=t[n*3],o=t[n*3+1],s=t[r*3],c=t[r*3+1],l=t[i*3],u=t[i*3+1];return[new H(a,o),new H(s,c),new H(l,u)]},generateSideWallUV:function(e,t,n,r,i,a){let o=t[n*3],s=t[n*3+1],c=t[n*3+2],l=t[r*3],u=t[r*3+1],d=t[r*3+2],f=t[i*3],p=t[i*3+1],m=t[i*3+2],h=t[a*3],g=t[a*3+1],_=t[a*3+2];return Math.abs(s-u)<Math.abs(o-l)?[new H(o,1-c),new H(l,1-d),new H(f,1-m),new H(h,1-_)]:[new H(s,1-c),new H(u,1-d),new H(p,1-m),new H(g,1-_)]}};function $s(e,t,n){if(n.shapes=[],Array.isArray(e))for(let t=0,r=e.length;t<r;t++){let r=e[t];n.shapes.push(r.uuid)}else n.shapes.push(e.uuid);return n.options=Object.assign({},t),t.extrudePath!==void 0&&(n.options.extrudePath=t.extrudePath.toJSON()),n}var ec=class e extends Fo{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},tc=class e extends Ra{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Ea(p,3)),this.setAttribute(`normal`,new Ea(m,3)),this.setAttribute(`uv`,new Ea(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},nc=class e extends Ra{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new U,p=new H;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new Ea(s,3)),this.setAttribute(`normal`,new Ea(c,3)),this.setAttribute(`uv`,new Ea(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},rc=class e extends Ra{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new U,d=new U,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new Ea(p,3)),this.setAttribute(`normal`,new Ea(m,3)),this.setAttribute(`uv`,new Ea(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},ic=class e extends Ra{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new U,f=new U,p=new U;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new Ea(c,3)),this.setAttribute(`normal`,new Ea(l,3)),this.setAttribute(`uv`,new Ea(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function ac(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(sc(i))i.isRenderTargetTexture?(B(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(sc(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function oc(e){let t={};for(let n=0;n<e.length;n++){let r=ac(e[n]);for(let e in r)t[e]=r[e]}return t}function sc(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function cc(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function lc(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Kr.workingColorSpace}var uc={clone:ac,merge:oc},dc=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,fc=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,pc=class extends Wa{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=dc,this.fragmentShader=fc,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ac(e.uniforms),this.uniformsGroups=cc(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new G().setHex(r.value);break;case`v2`:this.uniforms[n].value=new H().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new U().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new ri().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new W().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new ci().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},mc=class extends pc{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},hc=class extends Wa{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type=`MeshLambertMaterial`,this.color=new G(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new G(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new H(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vi,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},gc=class extends Wa{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=qn,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},_c=class extends Wa{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function vc(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function yc(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var bc=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},xc=class extends bc{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Wn,endingEnd:Wn}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Gn:i=e,o=2*t-n;break;case Kn:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Gn:a=e,s=2*n-t;break;case Kn:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Sc=class extends bc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Cc=class extends bc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},wc=class extends bc{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Dc(n,t,g,y,r);i[p]=Tc(x,o,_,b,m)}return i}};function Tc(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Ec(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Dc(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Tc(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Ec(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Oc=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=vc(t,this.TimeBufferType),this.values=vc(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:vc(e.times,Array),values:vc(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),yc(e.settings)&&(n.settings={inTangents:vc(e.settings.inTangents,Array),outTangents:vc(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Cc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Sc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new xc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new wc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Bn:t=this.InterpolantFactoryMethodDiscrete;break;case Vn:t=this.InterpolantFactoryMethodLinear;break;case Hn:t=this.InterpolantFactoryMethodSmooth;break;case Un:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return B(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Bn;case this.InterpolantFactoryMethodLinear:return Vn;case this.InterpolantFactoryMethodSmooth:return Hn;case this.InterpolantFactoryMethodBezier:return Un}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;yc(this.settings)&&(kc(this.settings.inTangents,e),kc(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(V(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(V(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){V(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){V(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&nr(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){V(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Hn,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,yc(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function kc(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Oc.prototype.ValueTypeName=``,Oc.prototype.TimeBufferType=Float32Array,Oc.prototype.ValueBufferType=Float32Array,Oc.prototype.DefaultInterpolation=Vn;var Ac=class extends Oc{constructor(e,t,n){super(e,t,n)}};Ac.prototype.ValueTypeName=`bool`,Ac.prototype.ValueBufferType=Array,Ac.prototype.DefaultInterpolation=Bn,Ac.prototype.InterpolantFactoryMethodLinear=void 0,Ac.prototype.InterpolantFactoryMethodSmooth=void 0;var jc=class extends Oc{constructor(e,t,n,r){super(e,t,n,r)}};jc.prototype.ValueTypeName=`color`;var Mc=class extends Oc{constructor(e,t,n,r){super(e,t,n,r)}};Mc.prototype.ValueTypeName=`number`;var Nc=class extends bc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)zr.slerpFlat(i,0,a,c-o,a,c,s);return i}},Pc=class extends Oc{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Nc(this.times,this.values,this.getValueSize(),e)}};Pc.prototype.ValueTypeName=`quaternion`,Pc.prototype.InterpolantFactoryMethodSmooth=void 0;var Fc=class extends Oc{constructor(e,t,n){super(e,t,n)}};Fc.prototype.ValueTypeName=`string`,Fc.prototype.ValueBufferType=Array,Fc.prototype.DefaultInterpolation=Bn,Fc.prototype.InterpolantFactoryMethodLinear=void 0,Fc.prototype.InterpolantFactoryMethodSmooth=void 0;var Ic=class extends Oc{constructor(e,t,n,r){super(e,t,n,r)}};Ic.prototype.ValueTypeName=`vector`;var Lc=class extends Fi{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new G(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Rc=class extends Lc{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Fi.DEFAULT_UP),this.updateMatrix(),this.groundColor=new G(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},zc=new ci,Bc=new U,Vc=new U,Hc=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new H(512,512),this.mapType=Pt,this.map=null,this.mapPass=null,this.matrix=new ci,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new To,this._frameExtents=new H(1,1),this._viewportCount=1,this._viewports=[new ri(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Bc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Bc),Vc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Vc),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){zc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(zc,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(zc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Uc=new U,Wc=new zr,Gc=new U,Kc=class extends Fi{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new ci,this.projectionMatrix=new ci,this.projectionMatrixInverse=new ci,this.coordinateSystem=er,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Uc,Wc,Gc),Gc.x===1&&Gc.y===1&&Gc.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Uc,Wc,Gc.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Uc,Wc,Gc),Gc.x===1&&Gc.y===1&&Gc.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Uc,Wc,Gc.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},qc=new U,Jc=new H,Yc=new H,Xc=class extends Kc{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=hr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(mr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return hr*2*Math.atan(Math.tan(mr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){qc.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(qc.x,qc.y).multiplyScalar(-e/qc.z),qc.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(qc.x,qc.y).multiplyScalar(-e/qc.z)}getViewSize(e,t){return this.getViewBounds(e,Jc,Yc),t.subVectors(Yc,Jc)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(mr*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Zc=class extends Kc{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Qc=class extends Hc{constructor(){super(new Zc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},$c=class extends Lc{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Fi.DEFAULT_UP),this.updateMatrix(),this.target=new Fi,this.shadow=new Qc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},el=-90,tl=1,nl=class extends Fi{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Xc(el,tl,e,t);r.layers=this.layers,this.add(r);let i=new Xc(el,tl,e,t);i.layers=this.layers,this.add(i);let a=new Xc(el,tl,e,t);a.layers=this.layers,this.add(a);let o=new Xc(el,tl,e,t);o.layers=this.layers,this.add(o);let s=new Xc(el,tl,e,t);s.layers=this.layers,this.add(s);let c=new Xc(el,tl,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},rl=class extends Xc{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},il=`\\[\\]\\.:\\/`,al=RegExp(`[\\[\\]\\.:\\/]`,`g`),ol=`[^\\[\\]\\.:\\/]`,sl=`[^`+il.replace(`\\.`,``)+`]`,cl=`((?:WC+[\\/:])*)`.replace(`WC`,ol),ll=`(WCOD+)?`.replace(`WCOD`,sl),ul=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,ol),dl=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,ol),fl=RegExp(`^`+cl+ll+ul+dl+`$`),pl=[`material`,`materials`,`bones`,`map`],ml=class{constructor(e,t,n){let r=n||hl.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},hl=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(al,``)}static parseTrackName(e){let t=fl.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);pl.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){B(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){V(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){V(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){V(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){V(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){V(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){V(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){V(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;V(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){V(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){V(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};hl.Composite=ml,hl.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},hl.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},hl.prototype.GetterByBindingType=[hl.prototype._getValue_direct,hl.prototype._getValue_array,hl.prototype._getValue_arrayElement,hl.prototype._getValue_toArray],hl.prototype.SetterByBindingTypeAndVersioning=[[hl.prototype._setValue_direct,hl.prototype._setValue_direct_setNeedsUpdate,hl.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[hl.prototype._setValue_array,hl.prototype._setValue_array_setNeedsUpdate,hl.prototype._setValue_array_setMatrixWorldNeedsUpdate],[hl.prototype._setValue_arrayElement,hl.prototype._setValue_arrayElement_setNeedsUpdate,hl.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[hl.prototype._setValue_fromArray,hl.prototype._setValue_fromArray_setNeedsUpdate,hl.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var gl=new ci,_l=class{constructor(e,t,n=0,r=1/0){this.ray=new Ya(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new yi,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):V(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return gl.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(gl),this}intersectObject(e,t=!0,n=[]){return yl(e,this,n,t),n.sort(vl),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)yl(e[r],this,n,t);return n.sort(vl),n}};function vl(e,t){return e.distance-t.distance}function yl(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)yl(r[e],t,n,!0)}}(class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});function bl(e,t,n,r){let i=xl(r);switch(n){case qt:return e*t;case Qt:return e*t/i.components*i.byteLength;case $t:return e*t/i.components*i.byteLength;case en:return e*t*2/i.components*i.byteLength;case tn:return e*t*2/i.components*i.byteLength;case Jt:return e*t*3/i.components*i.byteLength;case Yt:return e*t*4/i.components*i.byteLength;case nn:return e*t*4/i.components*i.byteLength;case rn:case an:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case on:case sn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ln:case dn:return Math.max(e,16)*Math.max(t,8)/4;case cn:case un:return Math.max(e,8)*Math.max(t,8)/2;case fn:case pn:case hn:case gn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case mn:case _n:case vn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case yn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case bn:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case xn:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Sn:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Cn:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case wn:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Tn:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case En:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Dn:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case On:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case kn:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case An:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case jn:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Mn:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Nn:case Pn:case Fn:return Math.ceil(e/4)*Math.ceil(t/4)*16;case In:case Ln:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Rn:case zn:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function xl(e){switch(e){case Pt:case Ft:return{byteLength:1,components:1};case Lt:case It:case Vt:return{byteLength:2,components:1};case Ht:case Ut:return{byteLength:2,components:4};case zt:case Rt:case Bt:return{byteLength:4,components:1};case Gt:case Kt:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?B(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function Sl(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Cl(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var K={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},q={common:{diffuse:{value:new G(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new W},alphaMap:{value:null},alphaMapTransform:{value:new W},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new W}},envmap:{envMap:{value:null},envMapRotation:{value:new W},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new W}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new W}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new W},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new W},normalScale:{value:new H(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new W},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new W}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new W}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new W}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new G(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new U},probesMax:{value:new U},probesResolution:{value:new U}},points:{diffuse:{value:new G(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new W},alphaTest:{value:0},uvTransform:{value:new W}},sprite:{diffuse:{value:new G(16777215)},opacity:{value:1},center:{value:new H(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new W},alphaMap:{value:null},alphaMapTransform:{value:new W},alphaTest:{value:0}}},wl={basic:{uniforms:oc([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.fog]),vertexShader:K.meshbasic_vert,fragmentShader:K.meshbasic_frag},lambert:{uniforms:oc([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.fog,q.lights,{emissive:{value:new G(0)},envMapIntensity:{value:1}}]),vertexShader:K.meshlambert_vert,fragmentShader:K.meshlambert_frag},phong:{uniforms:oc([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.fog,q.lights,{emissive:{value:new G(0)},specular:{value:new G(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:K.meshphong_vert,fragmentShader:K.meshphong_frag},standard:{uniforms:oc([q.common,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.roughnessmap,q.metalnessmap,q.fog,q.lights,{emissive:{value:new G(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:K.meshphysical_vert,fragmentShader:K.meshphysical_frag},toon:{uniforms:oc([q.common,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.gradientmap,q.fog,q.lights,{emissive:{value:new G(0)}}]),vertexShader:K.meshtoon_vert,fragmentShader:K.meshtoon_frag},matcap:{uniforms:oc([q.common,q.bumpmap,q.normalmap,q.displacementmap,q.fog,{matcap:{value:null}}]),vertexShader:K.meshmatcap_vert,fragmentShader:K.meshmatcap_frag},points:{uniforms:oc([q.points,q.fog]),vertexShader:K.points_vert,fragmentShader:K.points_frag},dashed:{uniforms:oc([q.common,q.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:K.linedashed_vert,fragmentShader:K.linedashed_frag},depth:{uniforms:oc([q.common,q.displacementmap]),vertexShader:K.depth_vert,fragmentShader:K.depth_frag},normal:{uniforms:oc([q.common,q.bumpmap,q.normalmap,q.displacementmap,{opacity:{value:1}}]),vertexShader:K.meshnormal_vert,fragmentShader:K.meshnormal_frag},sprite:{uniforms:oc([q.sprite,q.fog]),vertexShader:K.sprite_vert,fragmentShader:K.sprite_frag},background:{uniforms:{uvTransform:{value:new W},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:K.background_vert,fragmentShader:K.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new W}},vertexShader:K.backgroundCube_vert,fragmentShader:K.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:K.cube_vert,fragmentShader:K.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:K.equirect_vert,fragmentShader:K.equirect_frag},distance:{uniforms:oc([q.common,q.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:K.distance_vert,fragmentShader:K.distance_frag},shadow:{uniforms:oc([q.lights,q.fog,{color:{value:new G(0)},opacity:{value:1}}]),vertexShader:K.shadow_vert,fragmentShader:K.shadow_frag}};wl.physical={uniforms:oc([wl.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new W},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new W},clearcoatNormalScale:{value:new H(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new W},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new W},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new W},sheen:{value:0},sheenColor:{value:new G(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new W},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new W},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new W},transmissionSamplerSize:{value:new H},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new W},attenuationDistance:{value:0},attenuationColor:{value:new G(0)},specularColor:{value:new G(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new W},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new W},anisotropyVector:{value:new H},anisotropyMap:{value:null},anisotropyMapTransform:{value:new W}}]),vertexShader:K.meshphysical_vert,fragmentShader:K.meshphysical_frag};var Tl={r:0,b:0,g:0},El=new ci,Dl=new W;Dl.set(-1,0,0,0,1,0,0,0,1);function Ol(e,t,n,r,i,a){let o=new G(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new co(new jo(1,1,1),new pc({name:`BackgroundCubeMaterial`,uniforms:ac(wl.backgroundCube.uniforms),vertexShader:wl.backgroundCube.vertexShader,fragmentShader:wl.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(El.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Dl),l.material.toneMapped=Kr.getTransfer(i.colorSpace)!==Zn,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new co(new tc(2,2),new pc({name:`BackgroundMaterial`,uniforms:ac(wl.background.uniforms),vertexShader:wl.background.vertexShader,fragmentShader:wl.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=Kr.getTransfer(i.colorSpace)!==Zn,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Tl,lc(e)),n.buffers.color.setClear(Tl.r,Tl.g,Tl.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function kl(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Al(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function jl(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(B(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&B(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Ml(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Ha,s=new W,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Nl=4,Pl=6,Fl=20,Il=256,Ll=new Zc,Rl=new G,zl=null,Bl=0,Vl=0,Hl=!1,Ul=new U,Wl=new U,Gl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Ul}=i;zl=this._renderer.getRenderTarget(),Bl=this._renderer.getActiveCubeFace(),Vl=this._renderer.getActiveMipmapLevel(),Hl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ql(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Zl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(zl,Bl,Vl),this._renderer.xr.enabled=Hl,e.scissorTest=!1,Jl(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),zl=this._renderer.getRenderTarget(),Bl=this._renderer.getActiveCubeFace(),Vl=this._renderer.getActiveMipmapLevel(),Hl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:jt,minFilter:jt,generateMipmaps:!1,type:Vt,format:Yt,colorSpace:Yn,depthBuffer:!1},r=ql(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ql(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Kl(r)),this._blurMaterial=Xl(r,e,t),this._ggxMaterial=Yl(r,e,t)}return r}_compileMaterial(e){let t=new co(new Ra,e);this._renderer.compile(t,Ll)}_sceneToCubeUV(e,t,n,r,i){let a=new Xc(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Rl),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new co(new jo,new Xa({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(Rl),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Jl(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ql()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Zl());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Jl(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Ll)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-Nl?n-d+Nl:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,Jl(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,Ll),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,Jl(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,Ll)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];Jl(t,3*l*(r>this._lodMax-Nl?r-this._lodMax+Nl:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,Ll)}};function Kl(e){let t=[],n=[],r=e,i=e-Nl+1+Pl;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?Wl.set(1,r,n):e===1?Wl.set(-n,1,-r):e===2?Wl.set(-n,r,1):e===3?Wl.set(-1,r,-n):e===4?Wl.set(-n,-1,r):Wl.set(n,r,-1),Wl.toArray(l,(e*6+t)*3)}}let u=new Ra;u.setAttribute(`position`,new Ca(c,3)),u.setAttribute(`outputDirection`,new Ca(l,3)),n.push(new co(u,null)),r>Nl&&r--}return{lodMeshes:n,sizeLods:t}}function ql(e,t,n){let r=new ai(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Jl(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Yl(e,t,n){return new pc({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:Il,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:$l(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Xl(e,t,n){return new pc({name:`SphericalGaussianBlur`,defines:{SAMPLES:Fl,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:$l(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Zl(){return new pc({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:$l(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ql(){return new pc({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:$l(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function $l(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var eu=class extends ai{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Eo(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new jo(5,5,5),i=new pc({name:`CubemapFromEquirect`,uniforms:ac(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new co(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=jt),new nl(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function tu(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new eu(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Gl(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Gl(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function nu(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&cr(`WebGLRenderer: `+e+` extension not supported.`),t}}}function ru(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?Ta:wa)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function iu(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function au(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:V(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function ou(e,t,n){let r=new WeakMap,i=new ri;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new oi(h,p,m,u);g.type=Bt,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new H(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function su(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var cu={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function lu(e,t,n,r,i,a){let o=new ai(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new Ra;l.setAttribute(`position`,new Ea([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new Ea([0,2,0,0,2,0],2));let u=new mc({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new co(l,u),f=new Zc(-1,1,1,-1,0,1),p=null,m=null,h=!1,g,_=null,v=[],y=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<v.length;n++){let r=v[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){v=e,y=v.length>0&&v[0].isRenderPass===!0;let t=o.width,n=o.height;v.length>0&&s===null&&(s=new ai(t,n,{type:Vt,depthBuffer:!1,stencilBuffer:!1}),c=new ai(t,n,{type:Vt,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<v.length;e++){let r=v[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&v.length===0)return!1;if(_=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return y===!1&&e.setRenderTarget(o),g=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return y},this.end=function(e,t){e.toneMapping=g,h=!0;let n=o,r=s;for(let i=0;i<v.length;i++){let a=v[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},Kr.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=cu[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(_),e.render(d,f),_=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var uu=new ni,du=new Oo(1,1),fu=new oi,pu=new si,mu=new Eo,hu=[],gu=[],_u=new Float32Array(16),vu=new Float32Array(9),yu=new Float32Array(4);function bu(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=hu[i];if(a===void 0&&(a=new Float32Array(i),hu[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function xu(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Su(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Cu(e,t){let n=gu[t];n===void 0&&(n=new Int32Array(t),gu[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function wu(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Tu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(xu(n,t))return;e.uniform2fv(this.addr,t),Su(n,t)}}function Eu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(xu(n,t))return;e.uniform3fv(this.addr,t),Su(n,t)}}function Du(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(xu(n,t))return;e.uniform4fv(this.addr,t),Su(n,t)}}function Ou(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(xu(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Su(n,t)}else{if(xu(n,r))return;yu.set(r),e.uniformMatrix2fv(this.addr,!1,yu),Su(n,r)}}function ku(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(xu(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Su(n,t)}else{if(xu(n,r))return;vu.set(r),e.uniformMatrix3fv(this.addr,!1,vu),Su(n,r)}}function Au(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(xu(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Su(n,t)}else{if(xu(n,r))return;_u.set(r),e.uniformMatrix4fv(this.addr,!1,_u),Su(n,r)}}function ju(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Mu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(xu(n,t))return;e.uniform2iv(this.addr,t),Su(n,t)}}function Nu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(xu(n,t))return;e.uniform3iv(this.addr,t),Su(n,t)}}function Pu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(xu(n,t))return;e.uniform4iv(this.addr,t),Su(n,t)}}function Fu(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Iu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(xu(n,t))return;e.uniform2uiv(this.addr,t),Su(n,t)}}function Lu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(xu(n,t))return;e.uniform3uiv(this.addr,t),Su(n,t)}}function Ru(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(xu(n,t))return;e.uniform4uiv(this.addr,t),Su(n,t)}}function zu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(du.compareFunction=n.isReversedDepthBuffer()?518:515,a=du):a=uu,n.setTexture2D(t||a,i)}function Bu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||pu,i)}function Vu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||mu,i)}function Hu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||fu,i)}function Uu(e){switch(e){case 5126:return wu;case 35664:return Tu;case 35665:return Eu;case 35666:return Du;case 35674:return Ou;case 35675:return ku;case 35676:return Au;case 5124:case 35670:return ju;case 35667:case 35671:return Mu;case 35668:case 35672:return Nu;case 35669:case 35673:return Pu;case 5125:return Fu;case 36294:return Iu;case 36295:return Lu;case 36296:return Ru;case 35678:case 36198:case 36298:case 36306:case 35682:return zu;case 35679:case 36299:case 36307:return Bu;case 35680:case 36300:case 36308:case 36293:return Vu;case 36289:case 36303:case 36311:case 36292:return Hu}}function Wu(e,t){e.uniform1fv(this.addr,t)}function Gu(e,t){let n=bu(t,this.size,2);e.uniform2fv(this.addr,n)}function Ku(e,t){let n=bu(t,this.size,3);e.uniform3fv(this.addr,n)}function qu(e,t){let n=bu(t,this.size,4);e.uniform4fv(this.addr,n)}function Ju(e,t){let n=bu(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Yu(e,t){let n=bu(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Xu(e,t){let n=bu(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Zu(e,t){e.uniform1iv(this.addr,t)}function Qu(e,t){e.uniform2iv(this.addr,t)}function $u(e,t){e.uniform3iv(this.addr,t)}function ed(e,t){e.uniform4iv(this.addr,t)}function td(e,t){e.uniform1uiv(this.addr,t)}function nd(e,t){e.uniform2uiv(this.addr,t)}function rd(e,t){e.uniform3uiv(this.addr,t)}function id(e,t){e.uniform4uiv(this.addr,t)}function ad(e,t,n){let r=this.cache,i=t.length,a=Cu(n,i);xu(r,a)||(e.uniform1iv(this.addr,a),Su(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?du:uu;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function od(e,t,n){let r=this.cache,i=t.length,a=Cu(n,i);xu(r,a)||(e.uniform1iv(this.addr,a),Su(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||pu,a[e])}function sd(e,t,n){let r=this.cache,i=t.length,a=Cu(n,i);xu(r,a)||(e.uniform1iv(this.addr,a),Su(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||mu,a[e])}function cd(e,t,n){let r=this.cache,i=t.length,a=Cu(n,i);xu(r,a)||(e.uniform1iv(this.addr,a),Su(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||fu,a[e])}function ld(e){switch(e){case 5126:return Wu;case 35664:return Gu;case 35665:return Ku;case 35666:return qu;case 35674:return Ju;case 35675:return Yu;case 35676:return Xu;case 5124:case 35670:return Zu;case 35667:case 35671:return Qu;case 35668:case 35672:return $u;case 35669:case 35673:return ed;case 5125:return td;case 36294:return nd;case 36295:return rd;case 36296:return id;case 35678:case 36198:case 36298:case 36306:case 35682:return ad;case 35679:case 36299:case 36307:return od;case 35680:case 36300:case 36308:case 36293:return sd;case 36289:case 36303:case 36311:case 36292:return cd}}var ud=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Uu(t.type)}},dd=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ld(t.type)}},fd=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},pd=/(\w+)(\])?(\[|\.)?/g;function md(e,t){e.seq.push(t),e.map[t.id]=t}function hd(e,t,n){let r=e.name,i=r.length;for(pd.lastIndex=0;;){let a=pd.exec(r),o=pd.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){md(n,l===void 0?new ud(s,e,t):new dd(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new fd(s),md(n,e)),n=e}}}var gd=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);hd(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function _d(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var vd=37297,yd=0;function bd(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var xd=new W;function Sd(e){Kr._getMatrix(xd,Kr.workingColorSpace,e);let t=`mat3( ${xd.elements.map(e=>e.toFixed(4))} )`;switch(Kr.getTransfer(e)){case Xn:return[t,`LinearTransferOETF`];case Zn:return[t,`sRGBTransferOETF`];default:return B(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Cd(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+bd(e.getShaderSource(t),r)}return i}function wd(e,t){let n=Sd(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Td={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Ed(e,t){let n=Td[t];return n===void 0?(B(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Dd=new U;function Od(){return Kr.getLuminanceCoefficients(Dd),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Dd.x.toFixed(4)}, ${Dd.y.toFixed(4)}, ${Dd.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function kd(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Md).join(`
`)}function Ad(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function jd(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Md(e){return e!==``}function Nd(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Pd(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Fd=/^[ \t]*#include +<([\w\d./]+)>/gm;function Id(e){return e.replace(Fd,Rd)}var Ld=new Map;function Rd(e,t){let n=K[t];if(n===void 0){let e=Ld.get(t);if(e!==void 0)n=K[e],B(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return Id(n)}var zd=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Bd(e){return e.replace(zd,Vd)}function Vd(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Hd(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Ud={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Wd(e){return Ud[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Gd={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function Kd(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:Gd[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var qd={302:`ENVMAP_MODE_REFRACTION`};function Jd(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:qd[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Yd={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function Xd(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Yd[e.combine]||`ENVMAP_BLENDING_NONE`}function Zd(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Qd(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Wd(n),l=Kd(n),u=Jd(n),d=Xd(n),f=Zd(n),p=kd(n),m=Ad(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Md).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Md).join(`
`),_.length>0&&(_+=`
`)):(g=[Hd(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Md).join(`
`),_=[Hd(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:K.tonemapping_pars_fragment,n.toneMapping===0?``:Ed(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,K.colorspace_pars_fragment,wd(`linearToOutputTexel`,n.outputColorSpace),Od(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Md).join(`
`)),o=Id(o),o=Nd(o,n),o=Pd(o,n),s=Id(s),s=Nd(s,n),s=Pd(s,n),o=Bd(o),s=Bd(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=_d(i,i.VERTEX_SHADER,y),S=_d(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Cd(i,x,`vertex`),n=Cd(i,S,`fragment`);V(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):B(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new gd(i,h),T=jd(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,vd)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=yd++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var $d=0,ef=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new tf(e),t.set(e,n)),n}},tf=class{constructor(e){this.id=$d++,this.code=e,this.usedTimes=0}};function nf(e){return e===1030||e===37490||e===36285}function rf(e,t,n,r,i,a){let o=new yi,s=new ef,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&B(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=wl[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),k=e.id,A=t.id}let j=e.getRenderTarget(),ee=e.state.buffers.depth.getReversed(),M=h.isInstancedMesh===!0,te=h.isBatchedMesh===!0,ne=!!i.map,re=!!i.matcap,ie=!!x,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,N=!!i.normalMap,ce=!!i.displacementMap,le=!!i.emissiveMap,ue=!!i.metalnessMap,de=!!i.roughnessMap,fe=i.anisotropy>0,pe=i.clearcoat>0,me=i.dispersion>0,he=i.retroreflectivity>0,ge=i.iridescence>0,_e=i.sheen>0,P=i.transmission>0,ve=fe&&!!i.anisotropyMap,ye=pe&&!!i.clearcoatMap,be=pe&&!!i.clearcoatNormalMap,xe=pe&&!!i.clearcoatRoughnessMap,Se=ge&&!!i.iridescenceMap,F=ge&&!!i.iridescenceThicknessMap,Ce=_e&&!!i.sheenColorMap,we=_e&&!!i.sheenRoughnessMap,Te=!!i.specularMap,I=!!i.specularColorMap,Ee=!!i.specularIntensityMap,L=P&&!!i.transmissionMap,R=P&&!!i.thicknessMap,De=!!i.gradientMap,Oe=!!i.alphaMap,ke=i.alphaTest>0,Ae=!!i.alphaHash,je=!!i.extensions,Me=0;i.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Me=e.toneMapping);let Ne={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:te,batchingColor:te&&h._colorsTexture!==null,instancing:M,instancingColor:M&&h.instanceColor!==null,instancingMorph:M&&h.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Kr.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:ne,matcap:re,envMap:ie,envMapMode:ie&&x.mapping,envMapCubeUVHeight:S,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:N,displacementMap:ce,emissiveMap:le,normalMapObjectSpace:N&&i.normalMapType===1,normalMapTangentSpace:N&&i.normalMapType===0,packedNormalMap:N&&i.normalMapType===0&&nf(i.normalMap.format),metalnessMap:ue,roughnessMap:de,anisotropy:fe,anisotropyMap:ve,clearcoat:pe,clearcoatMap:ye,clearcoatNormalMap:be,clearcoatRoughnessMap:xe,dispersion:me,retroreflection:he,iridescence:ge,iridescenceMap:Se,iridescenceThicknessMap:F,sheen:_e,sheenColorMap:Ce,sheenRoughnessMap:we,specularMap:Te,specularColorMap:I,specularIntensityMap:Ee,transmission:P,transmissionMap:L,thicknessMap:R,gradientMap:De,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Oe,alphaTest:ke,alphaHash:Ae,combine:i.combine,mapUv:ne&&m(i.map.channel),aoMapUv:ae&&m(i.aoMap.channel),lightMapUv:oe&&m(i.lightMap.channel),bumpMapUv:se&&m(i.bumpMap.channel),normalMapUv:N&&m(i.normalMap.channel),displacementMapUv:ce&&m(i.displacementMap.channel),emissiveMapUv:le&&m(i.emissiveMap.channel),metalnessMapUv:ue&&m(i.metalnessMap.channel),roughnessMapUv:de&&m(i.roughnessMap.channel),anisotropyMapUv:ve&&m(i.anisotropyMap.channel),clearcoatMapUv:ye&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:be&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:Se&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:F&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:we&&m(i.sheenRoughnessMap.channel),specularMapUv:Te&&m(i.specularMap.channel),specularColorMapUv:I&&m(i.specularColorMap.channel),specularIntensityMapUv:Ee&&m(i.specularIntensityMap.channel),transmissionMapUv:L&&m(i.transmissionMap.channel),thicknessMapUv:R&&m(i.thicknessMap.channel),alphaMapUv:Oe&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(N||fe),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(ne||Oe),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&N===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ee,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Me,decodeVideoTexture:ne&&i.map.isVideoTexture===!0&&Kr.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:le&&i.emissiveMap.isVideoTexture===!0&&Kr.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:je&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(je&&i.extensions.multiDraw===!0||te)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Ne.vertexUv1s=c.has(1),Ne.vertexUv2s=c.has(2),Ne.vertexUv3s=c.has(3),c.clear(),Ne}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=wl[t];n=uc.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new Qd(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function af(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function of(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function sf(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function cf(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||of),r.length>1&&r.sort(t||sf),i.length>1&&i.sort(t||sf)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function lf(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new cf,e.set(t,[i])):n>=r.length?(i=new cf,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function uf(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new U,color:new G};break;case`SpotLight`:n={position:new U,direction:new U,color:new G,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new U,color:new G,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new U,skyColor:new G,groundColor:new G};break;case`RectAreaLight`:n={color:new G,position:new U,halfWidth:new U,halfHeight:new U}}return e[t.id]=n,n}}}function df(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var ff=0;function pf(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function mf(e){let t=new uf,n=df(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new U);let i=new U,a=new ci,o=new ci;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(pf);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=q.LTC_FLOAT_1,r.rectAreaLTC2=q.LTC_FLOAT_2):(r.rectAreaLTC1=q.LTC_HALF_1,r.rectAreaLTC2=q.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=ff++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function hf(e){let t=new mf(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function gf(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new hf(e),t.set(n,[a])):r>=i.length?(a=new hf(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var _f=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,vf=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,yf=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],bf=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],xf=new ci,Sf=new U,Cf=new U;function wf(e,t,n){let r=new To,i=new H,a=new H,o=new ri,s=new gc,c=new _c,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new pc({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new H},radius:{value:4}},vertexShader:_f,fragmentShader:vf}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Ra;m.setAttribute(`position`,new Ca(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new co(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(B(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){B(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){B(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new ai(i.x,i.y,{format:en,type:Vt,minFilter:jt,magFilter:jt,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new Oo(i.x,i.y,Bt),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=Xt,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=Ot,d.map.depthTexture.magFilter=Ot}else l.isPointLight?(d.map=new eu(i.x),d.map.depthTexture=new ko(i.x,zt)):(d.map=new ai(i.x,i.y),d.map.depthTexture=new Oo(i.x,i.y,zt)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=Xt,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=jt,d.map.depthTexture.magFilter=jt):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=Ot,d.map.depthTexture.magFilter=Ot);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Sf.setFromMatrixPosition(l.matrixWorld),e.position.copy(Sf),Cf.copy(e.position),Cf.add(yf[t]),e.up.copy(bf[t]),e.lookAt(Cf),e.updateMatrixWorld(),n.makeTranslation(-Sf.x,-Sf.y,-Sf.z),xf.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(xf,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new ai(i.x,i.y,{format:en,type:Vt}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Tf(e,t){function n(){let t=!1,n=new ri,r=null,i=new ri(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ue(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=ur[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ue(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new G(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,te=0,ne=e.getParameter(e.VERSION);ne.indexOf(`WebGL`)===-1?ne.indexOf(`OpenGL ES`)!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),M=te>=2):(te=parseFloat(/^WebGL (\d)/.exec(ne)[1]),M=te>=1);let re=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new ri().fromArray(ae),N=new ri().fromArray(oe);function ce(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let le={};le[e.TEXTURE_2D]=ce(e.TEXTURE_2D,e.TEXTURE_2D,1),le[e.TEXTURE_CUBE_MAP]=ce(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[e.TEXTURE_2D_ARRAY]=ce(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),le[e.TEXTURE_3D]=ce(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ue(e.DEPTH_TEST),o.setFunc(3),ve(!1),ye(1),ue(e.CULL_FACE),_e(0);function ue(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return h!==t&&(e.useProgram(t),h=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(de(e.BLEND),g=!1);return}if(g===!1&&(ue(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:V(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:V(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:V(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:V(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(he[n],he[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function P(t,n){t.side===2?de(e.CULL_FACE):ue(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ve(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),xe(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ue(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ve(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function ye(t){t===0?de(e.CULL_FACE):(ue(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function be(t){t!==k&&(M&&e.lineWidth(t),k=t)}function xe(t,n,r){t?(ue(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):de(e.POLYGON_OFFSET_FILL)}function Se(t){t?ue(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function F(t){t===void 0&&(t=e.TEXTURE0+ee-1),re!==t&&(e.activeTexture(t),re=t)}function Ce(t,n,r){r===void 0&&(r=re===null?e.TEXTURE0+ee-1:re);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(re!==r&&(e.activeTexture(r),re=r),e.bindTexture(t,n||le[t]),i.type=t,i.texture=n)}function we(){let t=ie[re];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Te(){try{e.compressedTexImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function I(){try{e.compressedTexImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ee(){try{e.texSubImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function L(){try{e.texSubImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function R(){try{e.compressedTexSubImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function De(){try{e.compressedTexSubImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Oe(){try{e.texStorage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function ke(){try{e.texStorage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ae(){try{e.texImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function je(){try{e.texImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Me(t){return d[t]===void 0?e.getParameter(t):d[t]}function Ne(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Pe(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Fe(t){N.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),N.copy(t))}function Ie(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Le(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Re(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},re=null,ie={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new G(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,se.set(0,0,e.canvas.width,e.canvas.height),N.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ue,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:P,setFlipSided:ve,setCullFace:ye,setLineWidth:be,setPolygonOffset:xe,setScissorTest:Se,activeTexture:F,bindTexture:Ce,unbindTexture:we,compressedTexImage2D:Te,compressedTexImage3D:I,texImage2D:Ae,texImage3D:je,pixelStorei:Ne,getParameter:Me,updateUBOMapping:Ie,uniformBlockBinding:Le,texStorage2D:Oe,texStorage3D:ke,texSubImage2D:Ee,texSubImage3D:L,compressedTexSubImage2D:R,compressedTexSubImage3D:De,scissor:Pe,viewport:Fe,reset:Re}}function Ef(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new H,u=new WeakMap,d=new Set,f,p=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function h(e,t){return m?new OffscreenCanvas(e,t):rr(`canvas`)}function g(e,t,n){let r=1,i=Te(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=h(n,a));let o=t?h(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),B(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&B(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function _(e){return e.generateMipmaps}function v(t){e.generateMipmap(t)}function y(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function b(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];B(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||B(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?Xn:Kr.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function x(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,B(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function S(e,t){return _(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),T(t),t.isVideoTexture&&u.delete(t),t.isHTMLTexture&&d.delete(t)}function w(e){let t=e.target;t.removeEventListener(`dispose`,w),D(t)}function T(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&E(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function E(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function D(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let O=0;function k(){O=0}function A(){return O}function j(e){O=e}function ee(){let e=O;return e>=i.maxTextures&&B(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),O+=1,e}function M(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function te(t,i){let a=r.get(t);if(t.isVideoTexture&&Ce(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)B(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)B(`WebGLRenderer: Texture marked for update but image is incomplete`);else{de(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function ne(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){de(a,t,i);return}t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function re(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){de(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ie(t,i){let a=r.get(t);if(t.isCubeDepthTexture!==!0&&t.version>0&&a.__version!==t.version){fe(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ae={[Tt]:e.REPEAT,[Et]:e.CLAMP_TO_EDGE,[Dt]:e.MIRRORED_REPEAT},oe={[Ot]:e.NEAREST,[kt]:e.NEAREST_MIPMAP_NEAREST,[At]:e.NEAREST_MIPMAP_LINEAR,[jt]:e.LINEAR,[Mt]:e.LINEAR_MIPMAP_NEAREST,[Nt]:e.LINEAR_MIPMAP_LINEAR},se={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function N(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&B(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ae[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ae[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ae[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,oe[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,oe[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,se[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function ce(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,C));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=M(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&E(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function le(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ue(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=le(n.start,r.width,4),c=le(t.start,r.width,4);n.start<=i+1&&a===c&&le(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function de(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=ce(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=Kr.getPrimaries(Kr.workingColorSpace),r=o.colorSpace===``?null:Kr.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=g(o.image,!1,i.maxTextureSize);t=we(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=b(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);N(c,o);let h,y=o.mipmaps,C=o.isVideoTexture!==!0,w=f.__version===void 0||l===!0,T=u.dataReady,E=S(o,t);if(o.isDepthTexture)m=x(o.format===Zt,o.type),w&&(C?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(y.length>0){C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else C?(w&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&ue(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){C&&w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,y[0].width,y[0].height,t.depth);for(let i=0,a=y.length;i<a;i++)if(h=y[i],o.format!==1023){if(r!==null){if(C){if(T){if(o.layerUpdates.size>0){let t=bl(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else C?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],o.format===1023?C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):C?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(C){if(w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=bl(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)C?(w&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(w){if(C)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(y.length>0){if(C&&w){let t=Te(y[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(C){if(w){let r=Te(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);_(o)&&v(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function fe(t,o,s){if(o.image.length!==6)return;let c=ce(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=Kr.getPrimaries(Kr.workingColorSpace),r=o.colorSpace===``?null:Kr.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=g(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=we(o,m[e]);let h=m[0],y=a.convert(o.format,o.colorSpace),x=a.convert(o.type),C=b(o.internalFormat,y,x,o.normalized,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=S(o,h);N(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,h.width,h.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,y,x,i.data):y===null?B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=Te(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,y,x,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,y,x,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,y,x,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,y,x,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,y,x,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,y,x,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,y,x,i.image[t])}}}_(o)&&v(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function pe(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=b(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),F(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,Se(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function me(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=x(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;F(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Se(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Se(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=b(o.internalFormat,c,l,o.normalized,o.colorSpace);F(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Se(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Se(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function he(t,i,o){let c=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let l=r.get(i.depthTexture);if(l.__renderTarget=i,(!l.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),c){if(l.__webglInit===void 0&&(l.__webglInit=!0,i.depthTexture.addEventListener(`dispose`,C)),l.__webglTexture===void 0){l.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,l.__webglTexture),N(e.TEXTURE_CUBE_MAP,i.depthTexture);let t=a.convert(i.depthTexture.format),r=a.convert(i.depthTexture.type),o;i.depthTexture.format===1026?o=e.DEPTH_COMPONENT24:i.depthTexture.format===1027&&(o=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,o,i.width,i.height,0,t,r,null)}}else te(i.depthTexture,0);let u=l.__webglTexture,d=Se(i),f=c?e.TEXTURE_CUBE_MAP_POSITIVE_X+o:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)F(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)F(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function ge(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)he(i.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?he(i.__webglFramebuffer[0],t,0):he(i.__webglFramebuffer,t,0)}}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),me(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),me(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function _e(t,n,i){let a=r.get(t);n!==void 0&&pe(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&ge(t)}function P(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,w);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&F(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=b(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=Se(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),me(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),N(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)pe(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else pe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);_(i)&&v(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),N(c,a),pe(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),_(a)&&v(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),N(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)pe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else pe(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);_(i)&&v(r),n.unbindTexture()}t.depthBuffer&&ge(t)}function ve(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(_(a)){let t=y(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),v(t),n.unbindTexture()}}}let ye=[],be=[];function xe(t){if(t.samples>0){if(F(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(ye.length=0,be.length=0,ye.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&(ye.push(l),be.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,be)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ye))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Se(e){return Math.min(i.maxSamples,e.samples)}function F(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Ce(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function we(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Kr.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&B(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):V(`WebGLTextures: Unsupported texture color space:`,n)),t}function Te(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=ee,this.resetTextureUnits=k,this.getTextureUnits=A,this.setTextureUnits=j,this.setTexture2D=te,this.setTexture2DArray=ne,this.setTexture3D=re,this.setTextureCube=ie,this.rebindTextures=_e,this.setupRenderTarget=P,this.updateRenderTargetMipmap=ve,this.updateMultisampleRenderTarget=xe,this.setupDepthRenderbuffer=ge,this.setupFrameBufferTexture=pe,this.useMultisampledRTT=F,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function Df(e,t){function n(n,r=``){let i,a=Kr.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Of=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,kf=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Af=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ao(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new pc({vertexShader:Of,fragmentShader:kf,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new co(new tc(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},jf=class extends dr{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new Af,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new H,C=null,w=null,T=new Xc;T.viewport=new ri;let E=new Xc;E.viewport=new ri;let D=[T,E],O=new rl,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new Ri,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new Ri,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new Ri,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,M);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,N.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&B(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&B(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,M),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Zt:Xt,a=_.stencil?Wt:zt);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new ai(d.textureWidth,d.textureHeight,{format:Yt,type:Pt,depthTexture:new Oo(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new ai(f.framebufferWidth,f.framebufferHeight,{format:Yt,type:Pt,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),N.setContext(r),N.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function M(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let te=new U,ne=new U;function re(e,t,n){te.setFromMatrixPosition(t.matrixWorld),ne.setFromMatrixPosition(n.matrixWorld);let r=te.distanceTo(ne),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ie(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;ie(O,i);for(let e=0;e<a.length;e++)ie(a[e],i);a.length===2?re(O,T,E):O.projectionMatrix.copy(T.projectionMatrix),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),ae(e,O,i)};function ae(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=hr*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let oe=null;function se(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new Xc,o.layers.enable(n),o.viewport=new ri,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new Ao,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}oe&&oe(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let N=new Sl;N.setAnimationLoop(se),this.setAnimationLoop=function(e){oe=e},this.dispose=function(){}}},Mf=new ci,Nf=new W;Nf.set(-1,0,0,0,1,0,0,0,1);function Pf(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,lc(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Mf.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Nf),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Ff(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return V(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?B(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):B(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var If=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Lf=null;function Rf(){return Lf===null&&(Lf=new fo(If,16,16,en,Vt),Lf.name=`DFG_LUT`,Lf.minFilter=jt,Lf.magFilter=jt,Lf.wrapS=Et,Lf.wrapT=Et,Lf.generateMipmaps=!1,Lf.needsUpdate=!0),Lf}var zf=class{constructor(e={}){let{canvas:t=ir(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Pt}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([nn,tn,$t]),g=new Set([Pt,zt,Lt,Wt,Ht,Ut]),_=new Uint32Array(4),v=new Int32Array(4),y=new U,b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=Jn;let j=0,ee=0,M=null,te=-1,ne=null,re=new ri,ie=new ri,ae=null,oe=new G(0),se=0,N=t.width,ce=t.height,le=1,ue=null,de=null,fe=new ri(0,0,N,ce),pe=new ri(0,0,N,ce),me=!1,he=new To,ge=!1,_e=!1,P=new ci,ve=new U,ye=new ri,be={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},xe=!1;function Se(){return M===null?le:1}let F=n;function Ce(e,n){return t.getContext(e,n)}let we,Te,I,Ee,L,R,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve,He,Ue;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,Ke,!1),t.addEventListener(`webglcontextrestored`,qe,!1),t.addEventListener(`webglcontextcreationerror`,Je,!1),F===null){let t=`webgl2`;if(F=Ce(t,e),F===null)throw Ce(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}We()}catch(e){throw t.removeEventListener(`webglcontextlost`,Ke,!1),t.removeEventListener(`webglcontextrestored`,qe,!1),t.removeEventListener(`webglcontextcreationerror`,Je,!1),V(`WebGLRenderer: `+e.message),e}function We(){we=new nu(F),we.init(),Ve=new Df(F,we),Te=new jl(F,we,e,Ve),I=new Tf(F,we),Te.reversedDepthBuffer&&d&&I.buffers.depth.setReversed(!0),O=F.createFramebuffer(),k=F.createFramebuffer(),A=F.createFramebuffer(),Ee=new au(F),L=new af,R=new Ef(F,we,I,L,Te,Ve,Ee),De=new tu(T),Oe=new Cl(F),He=new kl(F,Oe),ke=new ru(F,Oe,Ee,He),Ae=new su(F,ke,Oe,He,Ee),Re=new ou(F,Te,R),Fe=new Ml(L),je=new rf(T,De,we,Te,He,Fe),Me=new Pf(T,L),Ne=new lf,Pe=new gf(we),Le=new Ol(T,De,I,Ae,p,s),Ie=new wf(T,Ae,Te),Ue=new Ff(F,Ee,Te,I),ze=new Al(F,we,Ee),Be=new iu(F,we,Ee),Ee.programs=je.programs,T.capabilities=Te,T.extensions=we,T.properties=L,T.renderLists=Ne,T.shadowMap=Ie,T.state=I,T.info=Ee}m!==1009&&(w=new lu(m,t.width,t.height,o,r,i));let Ge=new jf(T,F);this.xr=Ge,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let e=we.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=we.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return le},this.setPixelRatio=function(e){e!==void 0&&(le=e,this.setSize(N,ce,!1))},this.getSize=function(e){return e.set(N,ce)},this.setSize=function(e,n,r=!0){if(Ge.isPresenting){B(`WebGLRenderer: Can't change size while VR device is presenting.`);return}N=e,ce=n,t.width=Math.floor(e*le),t.height=Math.floor(n*le),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(N*le,ce*le).floor()},this.setDrawingBufferSize=function(e,n,r){N=e,ce=n,le=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009){V(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){B(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(re)},this.getViewport=function(e){return e.copy(fe)},this.setViewport=function(e,t,n,r){e.isVector4?fe.set(e.x,e.y,e.z,e.w):fe.set(e,t,n,r),I.viewport(re.copy(fe).multiplyScalar(le).round())},this.getScissor=function(e){return e.copy(pe)},this.setScissor=function(e,t,n,r){e.isVector4?pe.set(e.x,e.y,e.z,e.w):pe.set(e,t,n,r),I.scissor(ie.copy(pe).multiplyScalar(le).round())},this.getScissorTest=function(){return me},this.setScissorTest=function(e){I.setScissorTest(me=e)},this.setOpaqueSort=function(e){ue=e},this.setTransparentSort=function(e){de=e},this.getClearColor=function(e){return e.copy(Le.getClearColor())},this.setClearColor=function(){Le.setClearColor(...arguments)},this.getClearAlpha=function(){return Le.getClearAlpha()},this.setClearAlpha=function(){Le.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(M!==null){let t=M.texture.format;e=h.has(t)}if(e){let e=M.texture.type,t=g.has(e),n=Le.getClearColor(),r=Le.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,F.clearBufferuiv(F.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,F.clearBufferiv(F.COLOR,0,v))}else r|=F.COLOR_BUFFER_BIT}t&&(r|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&F.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Ke,!1),t.removeEventListener(`webglcontextrestored`,qe,!1),t.removeEventListener(`webglcontextcreationerror`,Je,!1),Le.dispose(),Ne.dispose(),Pe.dispose(),L.dispose(),De.dispose(),Ae.dispose(),He.dispose(),Ue.dispose(),je.dispose(),Ge.dispose(),Ge.removeEventListener(`sessionstart`,tt),Ge.removeEventListener(`sessionend`,nt),rt.stop()};function Ke(e){e.preventDefault(),or(`WebGLRenderer: Context Lost.`),E=!0}function qe(){or(`WebGLRenderer: Context Restored.`),E=!1;let e=Ee.autoReset,t=Ie.enabled,n=Ie.autoUpdate,r=Ie.needsUpdate,i=Ie.type;We(),Ee.autoReset=e,Ie.enabled=t,Ie.autoUpdate=n,Ie.needsUpdate=r,Ie.type=i}function Je(e){V(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Ye(e){let t=e.target;t.removeEventListener(`dispose`,Ye),Xe(t)}function Xe(e){Ze(e),L.remove(e)}function Ze(e){let t=L.get(e).programs;t!==void 0&&(t.forEach(function(e){je.releaseProgram(e)}),e.isShaderMaterial&&je.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=be);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=ft(e,t,n,r,i);I.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=ke.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;He.setup(i,r,s,n,c);let h,g=ze;if(c!==null&&(h=Oe.get(c),g=Be,g.setIndex(h)),i.isMesh)r.wireframe===!0?(I.setLineWidth(r.wireframeLinewidth*Se()),g.setMode(F.LINES)):g.setMode(F.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),I.setLineWidth(e*Se()),i.isLineSegments?g.setMode(F.LINES):i.isLineLoop?g.setMode(F.LINE_LOOP):g.setMode(F.LINE_STRIP)}else i.isPoints?g.setMode(F.POINTS):i.isSprite&&g.setMode(F.TRIANGLES);if(i.isBatchedMesh){if(we.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Oe.get(c).bytesPerElement:1,o=L.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(F,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Qe(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),ge===!0&&Fe.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,z(e,t,r),e.side=0,e.needsUpdate=!0,z(e,t,r),e.side=2):z(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=Pe.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),_e=this.localClippingEnabled,ge=Fe.init(this.clippingPlanes,_e),ge===!0&&Fe.setGlobalState(this.clippingPlanes,t),D!==null&&Ie.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];Qe(o,n,t,e),r.add(o)}else Qe(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){let t=L.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}we.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let $e=null;function et(e){$e&&$e(e)}function tt(){rt.stop()}function nt(){rt.start()}let rt=new Sl;rt.setAnimationLoop(et),typeof self<`u`&&rt.setContext(self),this.setAnimationLoop=function(e){$e=e,Ge.setAnimationLoop(e),e===null?rt.stop():rt.start()},Ge.addEventListener(`sessionstart`,tt),Ge.addEventListener(`sessionend`,nt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){V(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=Ge.enabled===!0&&Ge.isPresenting===!0,r=w!==null&&(M===null||n)&&w.begin(T,M);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Ge.enabled===!0&&Ge.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Ge.cameraAutoUpdate===!0&&Ge.updateCamera(t),t=Ge.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,M),x=Pe.get(e,C.length),x.init(t),x.state.textureUnits=R.getTextureUnits(),C.push(x),P.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),he.setFromProjectionMatrix(P,er,t.reversedDepth),_e=this.localClippingEnabled,ge=Fe.init(this.clippingPlanes,_e),b=Ne.get(e,S.length),b.init(),S.push(b),Ge.enabled===!0&&Ge.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&it(e,t,-1/0,T.sortObjects)}it(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(ue,de),xe=Ge.enabled===!1||Ge.isPresenting===!1||Ge.hasDepthSensing()===!1,xe&&Le.addToRenderList(b,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ge===!0&&Fe.beginShadows();let i=x.state.shadowsArray;if(Ie.render(i,e,t),ge===!0&&Fe.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];ot(n,r,e,a)}xe&&Le.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];at(b,e,n,n.viewport)}}else r.length>0&&ot(n,r,e,t),xe&&Le.render(e),at(b,e,t)}M!==null&&ee===0&&(R.updateMultisampleRenderTarget(M),R.updateRenderTargetMipmap(M)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),He.resetDefaultState(),te=-1,ne=null,C.pop(),C.length>0?(x=C[C.length-1],R.setTextureUnits(x.state.textureUnits),ge===!0&&Fe.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function it(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)x.pushLightProbeGrid(e);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(he)){r&&ye.setFromMatrixPosition(e.matrixWorld).applyMatrix4(P);let i=Ae.update(e),a=e.material;a.visible&&b.push(e,i,a,n,ye.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(he))){let i=Ae.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),ye.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ye.copy(e.boundingSphere.center)),ye.applyMatrix4(e.matrixWorld).applyMatrix4(P)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,ye.z,s,t)}}else a.visible&&b.push(e,i,a,n,ye.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)it(i[e],t,n,r)}function at(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),ge===!0&&Fe.setGlobalState(T.clippingPlanes,n),r&&I.viewport(re.copy(r)),i.length>0&&st(i,t,n),a.length>0&&st(a,t,n),o.length>0&&st(o,t,n),I.buffers.depth.setTest(!0),I.buffers.depth.setMask(!0),I.buffers.color.setMask(!0),I.setPolygonOffset(!1)}function ot(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=we.has(`EXT_color_buffer_half_float`)||we.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new ai(1,1,{generateMipmaps:!0,type:e?Vt:Pt,minFilter:Nt,samples:Math.max(4,Te.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Kr.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||re;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(oe),se=T.getClearAlpha(),se<1&&T.setClearColor(16777215,.5),T.clear(),xe&&Le.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),ge===!0&&Fe.setGlobalState(T.clippingPlanes,r),st(e,n,r),R.updateMultisampleRenderTarget(a),R.updateRenderTargetMipmap(a),we.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,ct(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(R.updateMultisampleRenderTarget(a),R.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(oe,se),d!==void 0&&(r.viewport=d),T.toneMapping=u}function st(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&ct(o,t,n,s,l,c)}}function ct(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function z(e,t,n){t.isScene!==!0&&(t=be);let r=L.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=je.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=je.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=De.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Ye),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return ut(e,s),d}else s.uniforms=je.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=je.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Fe.uniform),ut(e,s),r.needsLights=mt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=x.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function lt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=gd.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function ut(e,t){let n=L.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function dt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];y.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(y))return n}return null}function ft(e,t,n,r,i){t.isScene!==!0&&(t=be),R.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=M===null?T.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:Kr.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=De.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=L.get(r),y=x.state.lights;if(ge===!0&&(_e===!0||e!==ne)){let t=e===ne&&r.id===te;Fe.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Fe.numPlanes||v.numIntersection!==Fe.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=x.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;b===!0&&(S=z(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,S,v));let C=!1,w=!1,E=!1,O=S.getUniforms(),k=v.uniforms;if(I.useProgram(S.program)&&(C=!0,w=!0,E=!0),r.id!==te&&(te=r.id,w=!0),v.needsLights){let e=dt(x.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,w=!0)}if(C||ne!==e){I.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),O.setValue(F,`projectionMatrix`,e.projectionMatrix),O.setValue(F,`viewMatrix`,e.matrixWorldInverse);let t=O.map.cameraPosition;t!==void 0&&t.setValue(F,ve.setFromMatrixPosition(e.matrixWorld)),Te.logarithmicDepthBuffer&&O.setValue(F,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&O.setValue(F,`isOrthographic`,e.isOrthographicCamera===!0),ne!==e&&(ne=e,w=!0,E=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&O.setValue(F,`sunShadowMap`,y.state.sunShadowMap,R),y.state.directionalShadowMap.length>0&&O.setValue(F,`directionalShadowMap`,y.state.directionalShadowMap,R),y.state.spotShadowMap.length>0&&O.setValue(F,`spotShadowMap`,y.state.spotShadowMap,R),y.state.pointShadowMap.length>0&&O.setValue(F,`pointShadowMap`,y.state.pointShadowMap,R)),i.isSkinnedMesh){O.setOptional(F,i,`bindMatrix`),O.setOptional(F,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),O.setValue(F,`boneTexture`,e.boneTexture,R))}i.isBatchedMesh&&(O.setOptional(F,i,`batchingTexture`),O.setValue(F,`batchingTexture`,i._matricesTexture,R),O.setOptional(F,i,`batchingIdTexture`),O.setValue(F,`batchingIdTexture`,i._indirectTexture,R),O.setOptional(F,i,`batchingColorTexture`),i._colorsTexture!==null&&O.setValue(F,`batchingColorTexture`,i._colorsTexture,R));let A=n.morphAttributes;if((A.position!==void 0||A.normal!==void 0||A.color!==void 0)&&Re.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,O.setValue(F,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(k.envMapIntensity.value=t.environmentIntensity),k.dfgLUT!==void 0&&(k.dfgLUT.value=Rf()),w){if(O.setValue(F,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&pt(k,E),a&&r.fog===!0&&Me.refreshFogUniforms(k,a),Me.refreshMaterialUniforms(k,r,le,ce,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;k.probesSH.value=e.texture,k.probesMin.value.copy(e.boundingBox.min),k.probesMax.value.copy(e.boundingBox.max),k.probesResolution.value.copy(e.resolution)}gd.upload(F,lt(v),k,R)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(gd.upload(F,lt(v),k,R),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&O.setValue(F,`center`,i.center),O.setValue(F,`modelViewMatrix`,i.modelViewMatrix),O.setValue(F,`normalMatrix`,i.normalMatrix),O.setValue(F,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Ue.update(n,S),Ue.bind(n,S)}}return S}function pt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function mt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return ee},this.getRenderTarget=function(){return M},this.setRenderTargetTextures=function(e,t,n){let r=L.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),L.get(e.texture).__webglTexture=t,L.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=L.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){M=e,j=t,ee=n;let r=null,i=!1,a=!1;if(e){let o=L.get(e);if(o.__useDefaultFramebuffer!==void 0){I.bindFramebuffer(F.FRAMEBUFFER,o.__webglFramebuffer),re.copy(e.viewport),ie.copy(e.scissor),ae=e.scissorTest,I.viewport(re),I.scissor(ie),I.setScissorTest(ae),te=-1;return}if(o.__webglFramebuffer===void 0)R.setupRenderTarget(e);else if(o.__hasExternalTextures)R.rebindTextures(e,L.get(e.texture).__webglTexture,L.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&L.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);R.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=L.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&R.useMultisampledRTT(e)===!1?L.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,re.copy(e.viewport),ie.copy(e.scissor),ae=e.scissorTest}else re.copy(fe).multiplyScalar(le).floor(),ie.copy(pe).multiplyScalar(le).floor(),ae=me;if(n!==0&&(r=O),I.bindFramebuffer(F.FRAMEBUFFER,r)&&I.drawBuffers(e,r),I.viewport(re),I.scissor(ie),I.setScissorTest(ae),i){let r=L.get(e.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=L.get(e.textures[t]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=L.get(e.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,t.__webglTexture,n)}te=-1};function ht(e){let t=L.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Te.textureFormatReadable(e.format),t.__typeReadable=Te.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=L.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){I.bindFramebuffer(F.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+s);let u=ht(o);if(u.__formatReadable===!1){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&F.readPixels(t,n,r,i,Ve.convert(c),Ve.convert(l),a)}finally{let e=M===null?null:L.get(M).__webglFramebuffer;I.bindFramebuffer(F.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=L.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){I.bindFramebuffer(F.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+s);let d=ht(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,f),F.bufferData(F.PIXEL_PACK_BUFFER,a.byteLength,F.STREAM_READ),F.readPixels(t,n,r,i,Ve.convert(l),Ve.convert(u),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let p=M===null?null:L.get(M).__webglFramebuffer;I.bindFramebuffer(F.FRAMEBUFFER,p);let m=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await lr(F,m,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,f),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,a),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(f),F.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;R.setTexture2D(e,0),F.copyTexSubImage2D(F.TEXTURE_2D,n,0,0,o,s,i,a),I.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Ve.convert(t.format),_=Ve.convert(t.type),v;t.isData3DTexture?(R.setTexture3D(t,0),v=F.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(R.setTexture2DArray(t,0),v=F.TEXTURE_2D_ARRAY):(R.setTexture2D(t,0),v=F.TEXTURE_2D),I.activeTexture(F.TEXTURE0),I.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,t.flipY),I.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),I.pixelStorei(F.UNPACK_ALIGNMENT,t.unpackAlignment);let y=I.getParameter(F.UNPACK_ROW_LENGTH),b=I.getParameter(F.UNPACK_IMAGE_HEIGHT),x=I.getParameter(F.UNPACK_SKIP_PIXELS),S=I.getParameter(F.UNPACK_SKIP_ROWS),C=I.getParameter(F.UNPACK_SKIP_IMAGES);I.pixelStorei(F.UNPACK_ROW_LENGTH,h.width),I.pixelStorei(F.UNPACK_IMAGE_HEIGHT,h.height),I.pixelStorei(F.UNPACK_SKIP_PIXELS,l),I.pixelStorei(F.UNPACK_SKIP_ROWS,u),I.pixelStorei(F.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=L.get(e),r=L.get(t),h=L.get(n.__renderTarget),g=L.get(r.__renderTarget);I.bindFramebuffer(F.READ_FRAMEBUFFER,h.__webglFramebuffer),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,L.get(e).__webglTexture,i,d+n),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,L.get(t).__webglTexture,a,m+n)),F.blitFramebuffer(l,u,o,s,f,p,o,s,F.DEPTH_BUFFER_BIT,F.NEAREST);I.bindFramebuffer(F.READ_FRAMEBUFFER,null),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||L.has(e)){let n=L.get(e),r=L.get(t);I.bindFramebuffer(F.READ_FRAMEBUFFER,k),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,n.__webglTexture,i),T?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,r.__webglTexture,a),i===0?T?F.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):F.copyTexSubImage2D(v,a,f,p,l,u,o,s):F.blitFramebuffer(l,u,o,s,f,p,o,s,F.COLOR_BUFFER_BIT,F.NEAREST);I.bindFramebuffer(F.READ_FRAMEBUFFER,null),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?F.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?F.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):F.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):F.texSubImage2D(F.TEXTURE_2D,a,f,p,o,s,g,_,h);I.pixelStorei(F.UNPACK_ROW_LENGTH,y),I.pixelStorei(F.UNPACK_IMAGE_HEIGHT,b),I.pixelStorei(F.UNPACK_SKIP_PIXELS,x),I.pixelStorei(F.UNPACK_SKIP_ROWS,S),I.pixelStorei(F.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&F.generateMipmap(v),I.unbindTexture()},this.initRenderTarget=function(e){L.get(e).__webglFramebuffer===void 0&&R.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?R.setTextureCube(e,0):e.isData3DTexture?R.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?R.setTexture2DArray(e,0):R.setTexture2D(e,0),I.unbindTexture()},this.resetState=function(){j=0,ee=0,M=null,I.reset(),He.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return er}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Kr._getDrawingBufferColorSpace(e),t.unpackColorSpace=Kr._getUnpackColorSpace()}},Bf=Rr.degToRad(50),Vf=60,Hf=5,Uf=34,Wf=17,Gf=class{camera=new Zc(-10,10,7,-7,.1,200);target=new U;viewHeight=Wf;aspect=16/9;yawSteps=0;yaw=Math.PI/4;driftAngle=0;panLimit=12;maxViewHeight=Uf;raycaster=new _l;ground=new Ha(new U(0,1,0),0);ndc=new H;constructor(){this.apply()}setWorldSize(e){this.panLimit=e/2+5,this.maxViewHeight=Math.max(Uf,e*1.25+10)}setAspect(e){this.aspect=e,this.apply()}rotate(e){this.yawSteps+=e}center(){this.target.set(0,0,0),this.viewHeight=Wf,this.apply()}focus(e,t){this.target.x=Rr.clamp(e,-this.panLimit,this.panLimit),this.target.z=Rr.clamp(t,-this.panLimit,this.panLimit),this.apply()}drift(e){this.driftAngle+=e*.035}settle(){this.yawSteps+=Math.round(this.driftAngle/(Math.PI/2)),this.driftAngle=0}panWorld(e,t){this.target.x=Rr.clamp(this.target.x+e,-this.panLimit,this.panLimit),this.target.z=Rr.clamp(this.target.z+t,-this.panLimit,this.panLimit),this.apply()}panScreen(e,t){let n=Math.sin(this.yaw),r=-Math.cos(this.yaw),i=-Math.cos(this.yaw),a=-Math.sin(this.yaw);this.panWorld(n*e+i*t,r*e+a*t)}zoom(e,t,n){let r=this.groundPoint(t,n,new U);this.viewHeight=Rr.clamp(this.viewHeight*e,Hf,this.maxViewHeight),this.apply();let i=this.groundPoint(t,n,new U);r&&i&&this.panWorld(r.x-i.x,r.z-i.z)}get zoomScale(){return this.viewHeight/Wf}update(e){let t=Math.PI/4+this.yawSteps*(Math.PI/2)+this.driftAngle,n=t-this.yaw;if(Math.abs(n)<5e-4){n!==0&&(this.yaw=t,this.apply());return}this.yaw+=n*Math.min(1,e*12),this.apply()}groundPoint(e,t,n){return this.raycaster.setFromCamera(this.ndc.set(e,t),this.camera),this.raycaster.ray.intersectPlane(this.ground,n)}rayFrom(e,t){return this.raycaster.setFromCamera(this.ndc.set(e,t),this.camera),this.raycaster}apply(){let e=this.viewHeight/2,t=e*this.aspect;this.camera.left=-t,this.camera.right=t,this.camera.top=e,this.camera.bottom=-e,this.camera.updateProjectionMatrix();let n=Math.cos(Bf)*Vf;this.camera.position.set(this.target.x+Math.cos(this.yaw)*n,this.target.y+Math.sin(Bf)*Vf,this.target.z+Math.sin(this.yaw)*n),this.camera.lookAt(this.target),this.camera.updateMatrixWorld()}};function Kf(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Ra,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=qf(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=qf(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}}return c}function qf(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new Ca(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}function J(e,t){let n=e.index?e.toNonIndexed():e;n.getAttribute(`normal`)||n.computeVertexNormals();let r=n.getAttribute(`position`).count;n.getAttribute(`uv`)||n.setAttribute(`uv`,new Ea(new Float32Array(r*2),2));let i=new G(t),a=new Float32Array(r*3);for(let e=0;e<r;e++)a[e*3]=i.r,a[e*3+1]=i.g,a[e*3+2]=i.b;return n.setAttribute(`color`,new Ea(a,3)),n}function Y(e){let t=Kf(e,!1);if(!t)throw Error(`Failed to merge geometries`);return t}function X(e,t,n,r,i,a,o){return J(new jo(e,t,n).translate(r,i,a),o)}function Jf(e,t,n,r,i,a,o,s){return J(new No(e,t,n,r).translate(i,a,o),s)}function Yf(e,t,n){let r=e*.76,i=new ps,a=t*4;for(let t=0;t<a;t++){let n=t%4,o=n===1||n===2?e:r,s=t/a*Math.PI*2,c=Math.cos(s)*o,l=Math.sin(s)*o;t===0?i.moveTo(c,l):i.lineTo(c,l)}i.closePath();let o=new fs;o.absarc(0,0,e*.28,0,Math.PI*2,!0),i.holes.push(o);let s=new Zs(i,{depth:n,bevelEnabled:!1,curveSegments:8});return s.translate(0,0,-n/2),s}function Xf(e,t,n,r,i,a,o,s,c,l=!1){let u=[],d=[],f=(e,t,n,r,i)=>{u.push(...e,...t,...n,...e,...n,...r),d.push(...i[0],...i[1],...i[2],...i[0],...i[2],...i[3])},p=(n,r,i)=>[e+Math.cos(r)*n,i,t+Math.sin(r)*n];for(let e=0;e<c;e++){let t=e/c,u=(e+1)/c,d=i+(a-i)*t,m=i+(a-i)*u;if(f(p(n,d,s),p(r,d,s),p(r,m,s),p(n,m,s),[[t,0],[t,1],[u,1],[u,0]]),l)continue;let h=[[0,0],[0,0],[0,0],[0,0]];f(p(r,d,o),p(r,m,o),p(r,m,s),p(r,d,s),h),f(p(n,d,o),p(n,m,o),p(n,m,s),p(n,d,s),h)}let m=new Ra;return m.setAttribute(`position`,new Ea(u,3)),m.setAttribute(`uv`,new Ea(d,2)),m.computeVertexNormals(),m}var Z={slate:3883602,slateDark:3028032,slateLight:5660788,steel:10134450,steelLight:13489116,yellow:15906354,yellowDark:14260770,brick:12146748,brickDark:9389360,teal:4034460,tealDark:2910837,cream:15721156,red:14242639,redDark:12600640,brass:14723132,gold:16764736,wood:8016438,glass:8308963,inputGreen:5882730,outputOrange:16751932,ore:7301746,dirt:7033664},Zf=new hc({vertexColors:!0}),Qf=new hc({vertexColors:!0,side:2}),$f=new Xa({color:16753210}),ep=-.56,tp=class{group=new Ii;constructor(e){e.add(this.group)}build(e,t,n){for(let e of[...this.group.children])this.group.remove(e),e instanceof co&&e.geometry.dispose();let r=g(20240607),i=e/2,a=t/2,o={x:-i-5.5,z:a+1.5,radius:3.1};this.addGround(o,i,a,n);let s=(e,t,n)=>!(Math.abs(e)<i+n&&Math.abs(t)<a+n||Math.hypot(e-o.x,t-o.z)<o.radius+n||e>i&&Math.abs(t-1)<1.3+n*.5),c=(e,t,n,i)=>{let a=[],o=Ne/2+15;for(let c=0;c<e;c++){let e=(r()*2-1)*o,c=(r()*2-1)*o,l=n+r()*(i-n),u=r()*Math.PI*2;s(e,c,t)&&a.push({x:e,z:c,scale:l,rotation:u})}return a},l=ap[n.scenery](),u=n.scenery===`meadow`?1:.55,d=e=>e.filter((e,t)=>t*.618%1<u);this.addInstanced(l.tall,d(c(120,1.6,.8,1.35)),!0),this.addInstanced(l.medium,d(c(70,1.6,.8,1.3)),!0),this.addInstanced(l.low,d(c(105,1,.6,1.2)),!0),this.addInstanced(l.rock,c(80,.9,.5,1.5),!0),this.addInstanced(l.tuft,d(c(240,.7,.7,1.3)),!1)}addGround(e,t,n,r){let i=g(77),a=[],o=(e,t,n,r,i,o=28)=>{let s=new Mo(n,o).rotateX(-Math.PI/2).translate(e,ep+r,t);a.push(J(s,i))};o(0,0,90,0,r.ground,48);for(let e=0;e<26;e++){let t=i()*Math.PI*2,n=5+i()*20;o(Math.cos(t)*n,Math.sin(t)*n,1.5+i()*3,.004+e*2e-4,i()>.5?r.groundLight:r.groundDark,14)}a.push(J(new tc(t*2+2.6,n*2+2.6).rotateX(-Math.PI/2).translate(0,-.548,0),r.track)),a.push(J(new tc(22,2.2).rotateX(-Math.PI/2).translate(t+11,-.548,1),r.track)),o(e.x,e.z,e.radius+.55,.014,r.shore),o(e.x,e.z,e.radius,.02,r.water),o(e.x-.5,e.z-.4,e.radius*.55,.024,r.waterLight);let s=new co(Y(a),Zf);s.receiveShadow=!0,this.group.add(s)}addInstanced(e,t,n){let r=new xo(e,Zf,Math.max(t.length,1));r.count=t.length;let i=new Fi;t.forEach((e,t)=>{i.position.set(e.x,ep,e.z),i.rotation.set(0,e.rotation,0),i.scale.setScalar(e.scale),i.updateMatrix(),r.setMatrixAt(t,i.matrix)}),r.instanceMatrix.needsUpdate=!0,r.castShadow=n,r.receiveShadow=!0,r.frustumCulled=!1,this.group.add(r)}},np=(e,t,n,r,i,a,o,s)=>J(new ec(e,0).scale(t,n,r).translate(i,a,o),s),rp=(e,t,n,r,i,a,o)=>J(new Po(e,t,n).translate(r,i,a),o),ip=(e,t)=>Y([J(new Io(.42,0).scale(1.2,.7,1).translate(0,.2,0),e),J(new Io(.24,0).scale(1,.8,1.1).translate(.42,.12,.2),t)]),ap={meadow:()=>({tall:Y([Jf(.13,.18,.9,6,0,.45,0,8016438),np(.75,1,.9,1,0,1.35,0,5216842),np(.5,1,1,1,.3,1.85,.1,6269781)]),medium:Y([Jf(.1,.14,.6,6,0,.3,0,7031346),rp(.7,1,7,0,.95,0,4030282),rp(.52,.9,7,0,1.5,0,4689999),rp(.34,.75,7,0,2,0,5415002)]),low:Y([np(.42,1,.75,1,0,.26,0,6137170),np(.3,1,.8,1,.32,.2,.12,7124318)]),rock:ip(10132899,8882833),tuft:Y([rp(.07,.3,4,0,.15,0,6989905),rp(.06,.22,4,.11,.11,.04,7648090),rp(.06,.24,4,-.08,.12,.08,6594636)])}),dunes:()=>({tall:Y([Jf(.17,.19,1.7,8,0,.85,0,6265432),np(.17,1,1,1,0,1.7,0,6265432),X(.42,.14,.14,.26,.8,0,5672784),Jf(.1,.1,.6,6,.44,1.1,0,5672784),X(.36,.14,.14,-.24,1.05,0,5672784),Jf(.1,.1,.45,6,-.4,1.28,0,5672784)]),medium:Y([Jf(.09,.14,1.5,6,0,.75,0,9071172),...[0,1,2,3,4].map(e=>J(new jo(.9,.05,.24).translate(.42,0,0).rotateZ(-.35).rotateY(e*Math.PI*2/5).translate(0,1.5,0),e%2==0?7317069:8238168))]),low:Y([np(.36,1,.6,1,0,.2,0,11116634),np(.24,1,.65,1,.3,.15,.1,12168550)]),rock:ip(13209438,11893324),tuft:Y([rp(.05,.26,4,0,.13,0,12166236),rp(.045,.2,4,.1,.1,.04,13219178)])}),tundra:()=>({tall:Y([Jf(.1,.14,.6,6,0,.3,0,5915186),rp(.7,1,7,0,.95,0,3107669),rp(.52,.9,7,0,1.5,0,3635808),rp(.36,.6,7,0,1.98,0,15922938),rp(.56,.22,7,0,1.38,0,15922938)]),medium:Y([Jf(.08,.1,.4,6,0,.2,0,5915186),rp(.5,.8,6,0,.7,0,3635808),rp(.34,.6,6,0,1.15,0,15397366)]),low:Y([np(.5,1.3,.4,1,0,.08,0,16054523),np(.3,1.2,.4,1,.42,.05,.14,14871281)]),rock:Y([ip(7173248,6120559),J(new Io(.34,0).scale(1.15,.3,.95).translate(0,.42,0),16054523)]),tuft:Y([rp(.04,.24,4,0,.12,0,10466498),rp(.035,.18,4,.09,.09,.04,11781842)])})},op=12,sp=12;function cp(e,t){op=e,sp=t}function lp(e){return(e+.5-op/2)*1}function up(e){return(e+.5-sp/2)*1}function dp(e){return e/1+op/2}function fp(e){return e/1+sp/2}function pp(e){return-e*(Math.PI/2)}var mp=class{group=new Ii;tiles=null;tileGeometry=new jo(.95,.06,.95);tileMaterial=new hc({color:16777215});foundationMaterial=new hc({color:9278364});trimMaterial=new hc({color:7304834});style=we[0];width=0;height=0;constructor(e){e.add(this.group)}setStyle(e){e!==this.style&&(this.style=e,this.paint())}paint(){if(this.foundationMaterial.color.setHex(this.style.foundation),this.trimMaterial.color.setHex(this.style.trim),!this.tiles)return;let e=new G,t=0;for(let n=0;n<this.height;n++)for(let r=0;r<this.width;r++)this.tiles.setColorAt(t++,e.setHex(this.style.tiles[(r+n)%2]));this.tiles.instanceColor&&(this.tiles.instanceColor.needsUpdate=!0)}build(e,t){this.width=e,this.height=t;for(let e of[...this.group.children])this.group.remove(e),e instanceof co&&e.geometry!==this.tileGeometry&&e.geometry.dispose();this.tiles?.dispose();let n=new co(new jo(e+.5,.5,t+.5),this.foundationMaterial);n.position.y=-.27,n.receiveShadow=!0,n.castShadow=!0,this.group.add(n);let r=new co(new jo(e+.9,.22,t+.9),this.trimMaterial);r.position.y=-.45,r.receiveShadow=!0,this.group.add(r);let i=new xo(this.tileGeometry,this.tileMaterial,e*t),a=new ci,o=new G,s=0;for(let n=0;n<t;n++)for(let t=0;t<e;t++)a.makeTranslation(lp(t),-.03,up(n)),i.setMatrixAt(s,a),i.setColorAt(s,o.setHex(this.style.tiles[(t+n)%2])),s++;i.instanceMatrix.needsUpdate=!0,i.receiveShadow=!0,i.frustumCulled=!1,this.group.add(i),this.tiles=i,this.paint()}},hp=class extends Error{},gp=class{container;webgl;resizeListeners=[];constructor(e){this.container=e;try{this.webgl=new zf({antialias:!0})}catch{throw new hp}this.webgl.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.webgl.shadowMap.enabled=!0,this.webgl.shadowMap.type=2,e.appendChild(this.webgl.domElement),this.webgl.domElement.setAttribute(`role`,`img`),this.webgl.domElement.setAttribute(`aria-label`,`The factory floor in 3D. The toolbar and the panels in the top bar describe and control everything on it.`),new ResizeObserver(()=>this.resize()).observe(e),this.resize(),this.canvas.addEventListener(`webglcontextlost`,e=>{e.preventDefault();for(let e of this.contextListeners)e(!0)}),this.canvas.addEventListener(`webglcontextrestored`,()=>{for(let e of this.contextListeners)e(!1)})}contextListeners=[];onContextChange(e){this.contextListeners.push(e)}get canvas(){return this.webgl.domElement}get width(){return Math.max(this.container.clientWidth,1)}get height(){return Math.max(this.container.clientHeight,1)}onResize(e){this.resizeListeners.push(e),e(this.width,this.height)}resize(){this.webgl.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.webgl.setSize(this.width,this.height);for(let e of this.resizeListeners)e(this.width,this.height)}render(e,t){this.webgl.render(e,t)}},_p=class{sun;sky;themeSun=new G(16774368);style=I[0];tint=new G;constructor(e){this.sky=new Rc(16777215,12044186,1.9),e.add(this.sky),this.sun=new $c(16774368,2.3),this.sun.position.set(-11,20,9),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(2048,2048),this.sun.shadow.bias=-4e-4,this.sun.shadow.normalBias=.03,e.add(this.sun),e.add(this.sun.target),this.setCoverage(12)}setColors(e,t){this.sky.groundColor.setHex(e),this.themeSun.setHex(t),this.applyStyle()}setStyle(e){this.style=e,this.applyStyle()}applyStyle(){this.sun.color.copy(this.themeSun).multiply(this.tint.setHex(this.style.sunTint)),this.sun.intensity=this.style.sunIntensity,this.sky.intensity=this.style.skyIntensity,this.sun.position.set(...this.style.sunPosition)}setCoverage(e){let t=e/2+7,n=this.sun.shadow.camera;n.left=-t,n.right=t,n.top=t,n.bottom=-t,n.near=1,n.far=110,n.updateProjectionMatrix()}setShadows(e){this.sun.castShadow=e}},vp=class{scene=new Wi;lighting;background=new G(8829034);constructor(){this.scene.background=this.background,this.lighting=new _p(this.scene)}setTheme(e){this.background.setHex(e.ground),this.lighting.setColors(e.bounce,e.sun)}},yp=1;function bp(){return yp}function xp(e,t){yp=t,e.style.setProperty(`--ui-scale`,String(t)),e.toggleAttribute(`data-scaled`,t!==1)}function Sp(){return document.documentElement.dataset.motion===`reduced`}function Cp(e){let t=window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches??!1,n=e===`on`||e===`system`&&t;document.documentElement.dataset.motion=n?`reduced`:`full`}var wp=380,Tp=400,Ep=500,Dp=10,Op=8,kp=new WeakMap,Ap=null,jp,Mp,Np,Pp,Fp=null,Ip=0,Lp=-1/0;function Rp(e){let t=e.indexOf(` — `),n=t<0?e:e.slice(0,t),r=t<0?void 0:e.charAt(t+3).toUpperCase()+e.slice(t+4),i=/^(.*\S)\s*\(([^()]{1,12})\)$/.exec(n);return i?{title:i[1],key:i[2],body:r}:{title:n,body:r}}function zp(){let e=(e,t)=>{let n=document.createElement(e);return n.className=t,n};jp=e(`span`,`tooltip-title`),Mp=e(`span`,`tooltip-meta`),Np=e(`kbd`,`tooltip-key`),Pp=e(`p`,`tooltip-body`);let t=e(`div`,`tooltip-head`);t.append(jp,Mp,Np);let n=e(`div`,`tooltip hidden`);return n.setAttribute(`role`,`tooltip`),n.append(t,Pp),(document.getElementById(`ui`)??document.body).append(n),window.addEventListener(`pointerdown`,Vp,!0),window.addEventListener(`keydown`,Vp,!0),window.addEventListener(`wheel`,Vp,{capture:!0,passive:!0}),window.addEventListener(`pointermove`,()=>{Fp&&(!Fp.isConnected||Fp.getClientRects().length===0)&&Vp()},{passive:!0}),n}function Bp(e){let t=kp.get(e),n=e.getBoundingClientRect();if(!t||!e.isConnected||n.width===0)return;let r=typeof t==`function`?t():t;if(!r)return;let i=typeof r==`string`?Rp(r):r;Ap??=zp(),jp.textContent=i.title,Mp.textContent=i.meta??``,Mp.classList.toggle(`hidden`,!i.meta),Np.textContent=i.key??``,Np.classList.toggle(`hidden`,!i.key),Pp.textContent=i.body??``,Pp.classList.toggle(`hidden`,!i.body),Ap.classList.remove(`hidden`),Fp=e;let a=bp(),o=window.innerWidth/a,s=window.innerHeight/a,c=n.left/a,l=n.top/a,u=Ap.offsetWidth,d=Ap.offsetHeight,f=Math.min(Math.max(c+n.width/a/2-u/2,Op),o-u-Op),p=l+n.height/a/2<s/2,m=p?l+n.height/a+Dp:l-d-Dp;Ap.dataset.side=p?`below`:`above`,Ap.style.transform=`translate(${Math.round(f)}px, ${Math.round(m)}px)`}function Vp(){window.clearTimeout(Ip),Fp&&(Fp=null,Lp=performance.now(),Ap?.classList.add(`hidden`))}function Hp(e){window.clearTimeout(Ip);let t=performance.now()-Lp<Tp?0:wp;Ip=window.setTimeout(()=>Bp(e),t)}function Up(e,t){let n=kp.has(e);if(kp.set(e,t),typeof t==`string`&&!e.hasAttribute(`aria-label`)&&!e.textContent?.trim()&&e.setAttribute(`aria-label`,Rp(t).title),Fp===e&&Bp(e),n)return;e.addEventListener(`pointerenter`,t=>{t.pointerType!==`touch`&&Hp(e)});let r=!1;e.addEventListener(`pointerdown`,t=>{t.pointerType===`touch`&&(r=!1,window.clearTimeout(Ip),Ip=window.setTimeout(()=>{r=!0,Bp(e)},Ep))});let i=()=>{window.clearTimeout(Ip),r&&window.setTimeout(()=>Fp===e&&Vp(),1800)};e.addEventListener(`pointerup`,i),e.addEventListener(`pointercancel`,i),e.addEventListener(`click`,e=>{r&&(r=!1,e.stopImmediatePropagation(),e.preventDefault())},!0),e.addEventListener(`pointerleave`,()=>{(Fp===e||Ip)&&Vp(),window.clearTimeout(Ip)}),e.addEventListener(`focus`,()=>{e.matches(`:focus-visible`)&&Bp(e)}),e.addEventListener(`blur`,()=>{Fp===e&&Vp()})}function Q(e,t={},n=[]){let r=document.createElement(e);if(t.class&&(r.className=t.class),t.text!==void 0&&(r.textContent=t.text),t.html!==void 0&&(r.innerHTML=t.html),t.title&&Up(r,t.title),t.onClick&&r.addEventListener(`click`,t.onClick),t.attrs)for(let[e,n]of Object.entries(t.attrs))r.setAttribute(e,n);for(let e of n)e&&r.append(e);return r}function $(e,t){e.textContent!==t&&(e.textContent=t)}function Wp(e,t){let n=Q(`div`,{class:`overlay notice`},[Q(`div`,{class:`modal`,attrs:{role:`alertdialog`,"aria-label":t.title}},[Q(`h2`,{class:`panel-title`,text:t.title}),Q(`p`,{class:`panel-description`,text:t.body}),t.detail?Q(`p`,{class:`notice-detail`,text:t.detail}):null,Q(`div`,{class:`panel-actions`},t.actions.map(e=>Q(`button`,{class:e.primary?`button primary`:`button`,text:e.label,attrs:{type:`button`},onClick:e.onClick})))])]);return n.addEventListener(`keydown`,e=>e.stopPropagation()),e.append(n),n.querySelector(`button`)?.focus(),{close:()=>n.remove()}}function Gp(e,t){let n=URL.createObjectURL(new Blob([t],{type:`application/json`})),r=Q(`a`,{attrs:{href:n,download:e}});document.body.append(r),r.click(),r.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}function Kp(e){return new Promise(t=>{let n=Q(`input`,{attrs:{type:`file`,accept:e}});n.addEventListener(`change`,()=>{let e=n.files?.[0];if(!e)return t(null);e.text().then(t,()=>t(null))}),n.addEventListener(`cancel`,()=>t(null)),n.click()})}function qp(e=new Date){return`one-more-machine-${e.toISOString().slice(0,10)}.json`}var Jp=130,Yp=`button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])`,Xp=new WeakMap,Zp=new WeakMap,Qp=new WeakSet;function $p(e){return!e.classList.contains(`hidden`)&&!e.classList.contains(`closing`)}function em(e){if(e.key!==`Tab`)return;let t=[...this.querySelectorAll(Yp)].filter(e=>e.getClientRects().length>0);if(t.length===0)return e.preventDefault();let n=t[0],r=t[t.length-1],i=document.activeElement;e.shiftKey&&(i===n||!this.contains(i)||i===this.firstElementChild)?(e.preventDefault(),r.focus()):!e.shiftKey&&(i===r||!this.contains(i))&&(e.preventDefault(),n.focus())}function tm(e,t){window.clearTimeout(Xp.get(e)),e.classList.remove(`hidden`,`closing`,`revealing`);let n=e.classList.contains(`overlay`),r=n?e.firstElementChild:e;if(r){let e=t?.getBoundingClientRect();if(e&&e.width>0){let t=r.getBoundingClientRect(),n=bp(),i=(e.left+e.width/2-t.left)/n,a=(e.top+e.height/2-t.top)/n;r.style.transformOrigin=`${i.toFixed(0)}px ${a.toFixed(0)}px`}else r.style.transformOrigin=``}e.offsetWidth,e.classList.add(`revealing`),n&&r&&(Zp.set(e,document.activeElement instanceof HTMLElement?document.activeElement:null),r.tabIndex=-1,r.focus({preventScroll:!0}),Qp.has(e)||(Qp.add(e),e.addEventListener(`keydown`,em)))}function nm(e){if($p(e)){if(e.classList.remove(`revealing`),e.classList.contains(`overlay`)){let t=Zp.get(e);Zp.delete(e),t?.isConnected&&t!==document.body?t.focus({preventScroll:!0}):document.activeElement instanceof HTMLElement&&e.contains(document.activeElement)&&document.activeElement.blur()}if(Sp()){e.classList.add(`hidden`);return}e.classList.add(`closing`),Xp.set(e,window.setTimeout(()=>{e.classList.add(`hidden`),e.classList.remove(`closing`)},Jp))}}var rm=[`Miners dig ore. Furnaces, Assemblers and the Fabricator turn it into things worth more.`,`Conveyors carry items from a machine’s orange output to the next machine’s green input.`,`Sellers turn whatever reaches them into money.`,`Spend the money on more machines, on Research for new ones, and on a bigger floor.`,`When something backs up or sits idle, find the bottleneck — and add one more machine.`],im=[[`Production`,`What the factory makes, uses and sells each minute, with advice on what is holding it back.`],[`Bottlenecks`,`Colours every machine by how busy it is and marks belts that are backed up.`],[`Research`,`Unlocks new machines, products and upgrades. Paid for once, kept for good.`],[`Contracts`,`Bonus orders that are filled simply by selling. No deadlines.`],[`Floor`,`Buys more room. Everything already built stays where it is.`],[`Blueprints`,`Saved layouts. Copy part of the factory, save it, and place it again anywhere.`],[`Achievements`,`Milestones that pay a reward and unlock new looks for the factory.`],[`Stars`,`Sell the whole factory to start again with a permanent bonus to every sale.`]],am=[[`Left click`,`Place / select`],[`Drag`,`Lay belts · pan`],[`Right click`,`Cancel`],[`Wheel`,`Zoom`],[`W A S D`,`Pan`],[`Q / E`,`Rotate view`],[`R`,`Rotate piece`],[`1 – 9, 0`,`Build tools (each keeps its number)`],["`",`Next group of tools`],[`F`,`Pick tool under cursor`],[`X`,`Delete tool`],[`B`,`Bottleneck view`],[`T`,`Research`],[`C`,`Contracts`],[`G`,`Achievements`],[`Ctrl C / V`,`Copy area · paste`],[`P`,`Blueprints`],[`Del`,`Remove selected`],[`Ctrl Z`,`Put back what was removed`],[`Space`,`Pause`],[`Home`,`Centre view`]],om=[[`Tap`,`Place / select`],[`Drag`,`Lay belts · pan`],[`Two fingers`,`Pan and pinch to zoom`],[`Press and hold`,`What a button does`],[`Side buttons`,`Rotate · cancel · put back · turn the view`]],sm=e=>Q(`div`,{class:`controls`},e.flatMap(([e,t])=>[Q(`kbd`,{text:e}),Q(`span`,{text:t})])),cm=class{onOpenChange;overlay;constructor(e,t=()=>{}){this.onOpenChange=t;let n=Q(`div`,{class:`modal help-modal`,attrs:{role:`dialog`,"aria-label":`How to play`}},[Q(`div`,{class:`panel-header`},[Q(`h2`,{class:`panel-title`,text:`How to play`}),Q(`button`,{class:`panel-close`,text:`×`,title:`Close (Esc)`,attrs:{type:`button`,"aria-label":`Close`},onClick:()=>this.close()})]),Q(`ol`,{class:`help-steps`},rm.map(e=>Q(`li`,{text:e}))),Q(`p`,{class:`panel-description`,text:`The factory keeps working while the tab is in the background, and at half pace while the game is closed. It saves itself as you play.`}),Q(`h3`,{class:`modal-subtitle`,text:`The top bar`}),Q(`dl`,{class:`help-panels`},im.flatMap(([e,t])=>[Q(`dt`,{text:e}),Q(`dd`,{text:t})])),Q(`h3`,{class:`modal-subtitle`,text:`Mouse and keyboard`}),sm(am),Q(`h3`,{class:`modal-subtitle`,text:`Touch`}),sm(om)]);this.overlay=Q(`div`,{class:`overlay hidden`},[n]),this.overlay.addEventListener(`click`,e=>{e.target===this.overlay&&this.close()}),window.addEventListener(`keydown`,e=>{this.isOpen&&e.code===`Escape`&&(e.stopPropagation(),this.close())}),e.append(this.overlay)}get isOpen(){return $p(this.overlay)}open(e){tm(this.overlay,e),this.onOpenChange(!0)}close(){this.isOpen&&(nm(this.overlay),this.onOpenChange(!1))}},lm=class{actions;overlay;buttons;message;heading;hasSave=!1;constructor(e,t){this.actions=t,this.buttons=Q(`div`,{class:`menu-buttons`}),this.message=Q(`p`,{class:`menu-message hidden`}),this.heading=Q(`p`,{class:`menu-heading hidden`}),this.overlay=Q(`div`,{class:`menu`},[Q(`div`,{class:`menu-card`},[Q(`h1`,{class:`menu-title`},[`One More`,Q(`br`),`Machine`]),Q(`p`,{class:`menu-tagline`,text:`Build it. Optimize it. Watch it work.`}),this.message,this.heading,this.buttons,Q(`p`,{class:`menu-version`,text:`Version 1.0.0`})])]),e.append(this.overlay)}button(e,t,n){return Q(`button`,{class:t?`button menu-button primary`:`button menu-button`,text:e,attrs:{type:`button`},onClick:n})}show(e){this.hasSave=e,this.message.classList.add(`hidden`),this.heading.classList.add(`hidden`);let t=this.button(`New Factory`,!e,()=>{e?this.confirmOverwrite():this.chooseEnvironment()});this.buttons.replaceChildren(...e?[this.button(`Continue`,!0,this.actions.onContinue)]:[],t,this.button(`How to play`,!1,this.actions.onHelp),this.button(`Load save file`,!1,this.actions.onLoadFile),this.button(`Settings`,!1,this.actions.onSettings)),this.overlay.classList.remove(`hidden`)}confirmOverwrite(){this.message.textContent=`Starting a new factory replaces your saved one.`,this.message.classList.remove(`hidden`),this.buttons.replaceChildren(this.button(`Start New Factory`,!0,()=>this.chooseEnvironment()),this.button(`Back`,!1,()=>this.show(!0)))}chooseEnvironment(){this.message.classList.add(`hidden`),this.heading.textContent=`Where will you build?`,this.heading.classList.remove(`hidden`);let e=o.map(e=>{let t=Q(`button`,{class:`button menu-button environment-card`,attrs:{type:`button`},onClick:()=>this.actions.onNewFactory(e.id)},[Q(`span`,{class:`environment-name`,text:e.name}),Q(`span`,{class:`environment-tagline`,text:e.tagline}),Q(`span`,{class:`environment-effects`,text:e.effects.length>0?e.effects.join(` · `):`No special rules`})]),n=()=>this.actions.onPreviewEnvironment(e.id);return t.addEventListener(`pointerenter`,n),t.addEventListener(`focus`,n),t});this.buttons.replaceChildren(...e,this.button(`Back`,!1,()=>{this.actions.onPreviewEnvironment(o[0].id),this.show(this.hasSave)}))}showLoadError(){this.heading.classList.add(`hidden`),this.message.textContent=`Could not load save.`,this.message.classList.remove(`hidden`),this.buttons.replaceChildren(this.button(`Start New Factory`,!0,()=>this.chooseEnvironment()),this.button(`Load save file`,!1,this.actions.onLoadFile)),this.overlay.classList.remove(`hidden`)}hide(){this.overlay.classList.add(`hidden`)}},um=class{settings;actions;overlay;cosmeticButtons=[];constructor(e,t,n){this.settings=t,this.actions=n;let r=Q(`input`,{attrs:{type:`range`,min:`0`,max:`100`,value:String(Math.round(t.masterVolume*100)),"aria-label":`Volume`}});r.addEventListener(`input`,()=>{this.settings.masterVolume=Number(r.value)/100,n.onChange(this.settings)});let i=(e,r)=>{let i=Q(`input`,{attrs:{type:`checkbox`}});return i.checked=t[r],i.addEventListener(`change`,()=>{this.settings[r]=i.checked,n.onChange(this.settings)}),Q(`label`,{class:`setting`},[Q(`span`,{text:e}),i])},a=(e,t,r)=>{let i=Q(`div`,{class:`cosmetic-choices`});for(let e of r){let r=Q(`button`,{class:`recipe-choice`,text:e.name,attrs:{type:`button`},onClick:()=>{this.settings.cosmetics[t]=e.id,n.onChange(this.settings),this.refreshCosmetics()}});this.cosmeticButtons.push({button:r,key:t,id:e.id,requires:e.requires}),i.append(r)}return Q(`div`,{class:`setting cosmetic-setting`},[Q(`span`,{text:e}),i])},o=(e,t,r,i)=>{let a=Q(`div`,{class:`cosmetic-choices`,attrs:{role:`radiogroup`,"aria-label":e}}),o=()=>{t.forEach((e,t)=>{let n=e.value===r();a.children[t].classList.toggle(`active`,n),a.children[t].setAttribute(`aria-checked`,String(n))})};for(let e of t)a.append(Q(`button`,{class:`recipe-choice`,text:e.name,attrs:{type:`button`,role:`radio`},onClick:()=>{i(e.value),n.onChange(this.settings),o()}}));return o(),Q(`div`,{class:`setting cosmetic-setting`},[Q(`span`,{text:e}),a])},s=[];n.onHelp&&s.push(Q(`button`,{class:`button`,text:`How to play & controls`,attrs:{type:`button`},onClick:()=>{this.close(),n.onHelp?.()}})),n.onSaveNow&&s.push(Q(`button`,{class:`button`,text:`Save now`,attrs:{type:`button`},onClick:n.onSaveNow})),n.onDownloadSave&&s.push(Q(`button`,{class:`button`,text:`Download save`,title:`Download save — a copy of this factory as a file, to keep safe or move to another browser`,attrs:{type:`button`},onClick:n.onDownloadSave})),n.onLoadSave&&s.push(Q(`button`,{class:`button`,text:`Load save file`,attrs:{type:`button`},onClick:()=>{this.close(),n.onLoadSave?.()}})),n.onMainMenu&&s.push(Q(`button`,{class:`button`,text:`Save & quit to menu`,attrs:{type:`button`},onClick:n.onMainMenu}));let c=Q(`div`,{class:`modal`,attrs:{role:`dialog`,"aria-label":`Settings`}},[Q(`div`,{class:`panel-header`},[Q(`h2`,{class:`panel-title`,text:`Settings`}),Q(`button`,{class:`panel-close`,text:`×`,attrs:{type:`button`,"aria-label":`Close`},onClick:()=>this.close()})]),Q(`label`,{class:`setting`},[Q(`span`,{text:`Volume`}),r]),i(`Sound effects`,`sfx`),i(`Music`,`music`),i(`Shadows`,`shadows`),Q(`h3`,{class:`modal-subtitle`,text:`Interface`}),o(`Size`,rt.map(e=>({value:e,name:Math.round(e*100)+`%`})),()=>this.settings.uiScale,e=>this.settings.uiScale=e),o(`Reduce motion`,[{value:`system`,name:`Match system`},{value:`on`,name:`On`},{value:`off`,name:`Off`}],()=>this.settings.reduceMotion,e=>this.settings.reduceMotion=e),Q(`h3`,{class:`modal-subtitle`,text:`Look`}),a(`Floor`,`floor`,we),a(`Belts`,`belt`,Te),a(`Light`,`light`,I),s.length>0?Q(`div`,{class:`panel-actions`},s):null]);this.overlay=Q(`div`,{class:`overlay hidden`},[c]),this.overlay.addEventListener(`click`,e=>{e.target===this.overlay&&this.close()}),window.addEventListener(`keydown`,e=>{e.code===`Escape`&&this.isOpen&&this.close()}),e.append(this.overlay)}get isOpen(){return $p(this.overlay)}refreshCosmetics(){let e=this.actions.getProgress?.()??null;for(let{button:t,key:n,id:r,requires:i}of this.cosmeticButtons){let a=L(i,e);t.disabled=!a,t.classList.toggle(`active`,a&&this.settings.cosmetics[n]===r),Up(t,()=>a?null:{title:`Locked`,body:`Unlocks `+(e?``:`in play, `)+`at `+R(i)+`.`})}}open(e){this.refreshCosmetics(),tm(this.overlay,e),this.actions.onOpenChange?.(!0)}close(){this.isOpen&&(nm(this.overlay),this.actions.onOpenChange?.(!1))}},dm=.25,fm=500,pm=class{frame;background;onError;lastTime=0;lastWall=0;constructor(e,t,n){this.frame=e,this.background=t,this.onError=n}stopped=!1;watchdog=0;stop(){this.stopped=!0,window.clearInterval(this.watchdog)}fail(e){this.stopped||(this.stop(),this.onError(e))}start(){this.lastTime=performance.now(),this.lastWall=Date.now(),requestAnimationFrame(this.onFrame),this.watchdog=window.setInterval(()=>{let e=Date.now(),t=(e-this.lastWall)/1e3;if(!(t<fm/1e3)){this.lastWall=e,this.lastTime=performance.now();try{this.background(t)}catch(e){this.fail(e)}}},fm)}onFrame=e=>{let t=Math.max(0,(e-this.lastTime)/1e3);if(this.lastTime=e,this.lastWall=Date.now(),!this.stopped){try{this.frame(Math.min(t,dm))}catch(e){return this.fail(e)}requestAnimationFrame(this.onFrame)}}};function mm(e){return e===`conveyor`?me.cost:P(e).cost}function hm(e){return Math.floor(mm(e)*a.refundRate)}function gm(e,t){return Math.round(mm(e)*je(t).costFactor)}function _m(e,t){let n=mm(e);for(let r=2;r<=t;r++)n+=gm(e,r);return Math.floor(n*a.refundRate)}function vm(e){return m(e).baseValue}function ym(e){return e.machines.length+e.conveyors.length===0}function bm(e,t,n,r,i){let a=Math.min(t,r),o=Math.max(t,r),s=Math.min(n,i),c=Math.max(n,i),l=e=>e.x>=a&&e.x<=o&&e.y>=s&&e.y<=c,u=[...e.machines.values()].filter(t=>e.machineCells(t).every(l)),d=[...e.conveyors.values()].filter(e=>l({x:e.gridX,y:e.gridY})),f=1/0,p=1/0,m=-1/0,h=-1/0,g=e=>{f=Math.min(f,e.x),p=Math.min(p,e.y),m=Math.max(m,e.x),h=Math.max(h,e.y)};for(let t of u)e.machineCells(t).forEach(g);for(let e of d)g({x:e.gridX,y:e.gridY});return f===1/0?{width:0,height:0,machines:[],conveyors:[]}:{width:m-f+1,height:h-p+1,machines:u.map(e=>({type:e.type,x:e.gridX-f,y:e.gridY-p,rotation:e.rotation,recipeId:e.recipeId})),conveyors:d.map(e=>({x:e.gridX-f,y:e.gridY-p,direction:e.direction}))}}function xm(e){let{width:t,height:n}=e;return{width:n,height:t,machines:e.machines.map(e=>{let{h:t}=ye(P(e.type),e.rotation);return{...e,x:n-e.y-t,y:e.x,rotation:N(e.rotation,1)}}),conveyors:e.conveyors.map(e=>({x:n-1-e.y,y:e.x,direction:N(e.direction,1)}))}}function Sm(e){return e.machines.reduce((e,t)=>e+mm(t.type),0)+e.conveyors.length*mm(`conveyor`)}function Cm(e,t,n){let r=[];for(let i of e.machines)r.push(...xe(P(i.type),t+i.x,n+i.y,i.rotation));for(let i of e.conveyors)r.push({x:t+i.x,y:n+i.y});return r}function wm(e){let t=[],n=e.machines.length,r=e.conveyors.length;return n>0&&t.push(`${n} machine${n===1?``:`s`}`),r>0&&t.push(`${r} belt${r===1?``:`s`}`),t.join(`, `)||`empty`}function Tm(e){if(typeof e!=`object`||!e)return null;let t=e,n=e=>typeof e==`number`&&Number.isInteger(e);if(!n(t.width)||!n(t.height)||t.width<1||t.height<1||t.width>64||t.height>64||!Array.isArray(t.machines)||!Array.isArray(t.conveyors))return null;let r={width:t.width,height:t.height,machines:[],conveyors:[]};for(let e of t.machines){if(typeof e!=`object`||!e||typeof e.type!=`string`||!ve(e.type)||!n(e.x)||!n(e.y)||!le(e.rotation)||e.recipeId!==null&&typeof e.recipeId!=`string`)return null;r.machines.push({type:e.type,x:e.x,y:e.y,rotation:e.rotation,recipeId:e.recipeId})}for(let e of t.conveyors){if(typeof e!=`object`||!e||!n(e.x)||!n(e.y)||!le(e.direction))return null;r.conveyors.push({x:e.x,y:e.y,direction:e.direction})}let i=new Set;for(let e of Cm(r,0,0)){if(e.x<0||e.y<0||e.x>=r.width||e.y>=r.height)return null;let t=`${e.x},${e.y}`;if(i.has(t))return null;i.add(t)}return ym(r)?null:r}var Em=`omm.blueprints`,Dm=30,Om=class{storage;items=[];nextId=1;constructor(e){this.storage=e,this.load()}get all(){return this.items}get isFull(){return this.items.length>=20}add(e){if(this.isFull)return null;let t={id:this.nextId++,name:`Blueprint ${this.nextId-1}`,blueprint:e};return this.items.push(t),this.persist(),t}rename(e,t){let n=this.items.find(t=>t.id===e),r=t.trim().slice(0,Dm);n&&r.length!==0&&n.name!==r&&(n.name=r,this.persist())}remove(e){this.items=this.items.filter(t=>t.id!==e),this.persist()}load(){let e;try{let t=this.storage?.getItem(Em);e=t?JSON.parse(t):void 0}catch{return}if(Array.isArray(e))for(let t of e){if(typeof t!=`object`||!t||this.items.length>=20)continue;let e=Tm(t.blueprint);if(!e)continue;let n=typeof t.id==`number`&&Number.isInteger(t.id)&&t.id>0?t.id:this.nextId;if(this.items.some(e=>e.id===n))continue;let r=typeof t.name==`string`&&t.name.trim()?t.name.trim().slice(0,Dm):`Blueprint ${n}`;this.items.push({id:n,name:r,blueprint:e}),this.nextId=Math.max(this.nextId,n+1)}}persist(){try{this.storage?.setItem(Em,JSON.stringify(this.items))}catch{}}},km=new Intl.NumberFormat(`en-US`,{maximumFractionDigits:0});function Am(e){let t=Math.floor(e);return Math.abs(t)>=1e6?`$${(t/1e6).toFixed(2)}M`:`$${km.format(t)}`}var jm={minSeconds:60,efficiency:.5,capSeconds:28800,simulateSeconds:300,measureSeconds:120};function Mm(e,t){if(!(t>=jm.minSeconds))return null;let{state:n}=e,r=Math.min(t,jm.capSeconds),i=r*jm.efficiency,a=Math.min(i,jm.simulateSeconds),o=Math.min(a,jm.measureSeconds),s=n.economy.totalEarned,c={...n.stats.sold},l=n.contracts.completed,u=t=>{for(let n=Math.round(t*20);n>0;n--)e.tick()};u(a-o);let d={...n.stats.sold},f={...n.stats.produced};u(o);let p=i-a;if(p>0){let t=(e,t)=>Math.floor(((e??0)-(t??0))/o*p);for(let e of Object.keys(n.stats.produced)){let r=t(n.stats.produced[e],f[e]);r>0&&(n.stats.produced[e]+=r)}for(let r of Object.keys(n.stats.sold))e.creditSales(r,t(n.stats.sold[r],d[r]));n.simTime+=p}let m={};for(let[e,t]of Object.entries(n.stats.sold)){let n=t-(c[e]??0);n>0&&(m[e]=n)}return{awaySeconds:t,countedSeconds:r,capped:t>jm.capSeconds,earned:n.economy.totalEarned-s,sold:m,contractsCompleted:n.contracts.completed-l}}function Nm(e,t){if(!e)return t;let n={...e.sold};for(let[e,r]of Object.entries(t.sold))n[e]=(n[e]??0)+r;return{awaySeconds:e.awaySeconds+t.awaySeconds,countedSeconds:e.countedSeconds+t.countedSeconds,capped:e.capped||t.capped,earned:e.earned+t.earned,sold:n,contractsCompleted:e.contractsCompleted+t.contractsCompleted}}function Pm(e){if(e<60)return`${Math.round(e)} s`;let t=Math.round(e/60);if(t<60)return`${t} min`;let n=Math.floor(t/60),r=t%60;return r===0?`${n} h`:`${n} h ${r} min`}var Fm={earningsScale:5e4,saleBonusPerStar:.1,startingMoneyPerStar:100};function Im(e){return Math.max(0,Math.floor(Math.cbrt(e/Fm.earningsScale)+1e-9))}function Lm(e){return e**3*Fm.earningsScale}function Rm(e){return 1+e*Fm.saleBonusPerStar}function zm(e){return a.startingMoney+e*Fm.startingMoneyPerStar}function Bm(e,t){let n=Im(e.economy.totalEarned);if(n<1)return null;let r=e.prestige.stars+n,i=Ce(l(t).id);return i.prestige={stars:r,count:e.prestige.count+1},i.economy.money=zm(r),i.achievements=[...e.achievements],i.tutorialStep=e.tutorialStep,i.seenTips=[...e.seenTips],i}function Vm(e,t,n,r){let i=t+oe[r].x,a=n+oe[r].y,o=e.occupancy.get(i,a);if(!o)return null;if(o.kind===`conveyor`){let t=e.conveyors.get(o.id);return t.direction===ce(r)?null:{kind:`conveyor`,conveyor:t}}let s=e.machines.get(o.id),c=ce(r),l=Se(P(s.type),s.gridX,s.gridY,s.rotation).findIndex(e=>e.type===`input`&&e.x===i&&e.y===a&&e.side===c);return l>=0?{kind:`machine`,machine:s,port:l}:null}function Hm(e,t,n){return Um(e,t.gridX,t.gridY,n)}function Um(e,t,n,r){let i=t-oe[r].x,a=n-oe[r].y,o=e.occupancy.get(i,a);if(!o)return!1;if(o.kind===`conveyor`)return e.conveyors.get(o.id).direction===r;let s=e.machines.get(o.id);return Se(P(s.type),s.gridX,s.gridY,s.rotation).some(e=>e.type===`output`&&e.x===i&&e.y===a&&e.side===r)}function Wm(e,t){if(Hm(e,t,t.direction))return{kind:`straight`};let n=N(t.direction,1),r=N(t.direction,3),i=Hm(e,t,n);return i===Hm(e,t,r)?{kind:`straight`}:{kind:`corner`,from:i?n:r}}var Gm=class{dirty=!0;order=[];targets=new Map;invalidate(){this.dirty=!0}targetOf(e){return this.targets.get(e.id)??null}updateOrder(e){return this.dirty&&this.rebuild(e),this.order}rebuild(e){this.dirty=!1,this.order=[],this.targets.clear();for(let t of e.conveyors.values())this.targets.set(t.id,Vm(e,t.gridX,t.gridY,t.direction));let t=new Set,n=[];for(let r of e.conveyors.values()){let e=r;for(;e&&!t.has(e.id);){t.add(e.id),n.push(e);let r=this.targets.get(e.id)??null;e=r?.kind===`conveyor`?r.conveyor:null}for(;n.length>0;)this.order.push(n.pop())}}};function Km(e){let t=e.items[e.items.length-1];return!t||t.progress>=.499999}function qm(e,t,n,r){t.items.push({id:e.nextItemId++,resourceId:n,tileX:t.gridX,tileY:t.gridY,progress:0,from:r})}function Jm(e,t,n,r){t.tileX=e.gridX,t.tileY=e.gridY,t.progress=r,t.from=n,delete t.to,e.items.push(t)}function Ym(e,t,n,r){let a=1*n;for(let n of t.updateOrder(e)){let e=n.items;if(e.length===0)continue;let o=t.targetOf(n),s=1/0,c=0;for(;c<e.length;){let t=e[c],l=Math.min(t.progress+a,s-i);if(c===0&&o?.kind===`conveyor`){let r=o.conveyor,a=r.items[r.items.length-1];if(a&&(l=Math.min(l,1+a.progress-i)),l>=1){e.shift(),t.progress=l-1,t.tileX=r.gridX,t.tileY=r.gridY,t.from=n.direction,r.items.push(t);continue}}else{let i=c===0&&o?.kind===`machine`?o:null;if(i&&(l=Math.min(l,r.entryLimit(i.machine,n.direction))),l>=1){if(i&&r.deliver(i.machine,t.resourceId,i.port,n.direction,t)){e.shift();continue}l=1}}l>t.progress&&(t.progress=l),s=t.progress,c++}}}function Xm(e,t,n,r,i,a){return{id:e,type:t,gridX:n,gridY:r,rotation:i,enabled:!0,recipeId:a,active:!1,progress:0,inputInventory:{},outputInventory:{},transit:[],routeIndex:0,lastInput:-1,stored:[],level:1}}function Zm(e){let t=0;for(let n in e)t+=e[n];return t}var Qm={disabled:`Disabled`,working:`Working`,output_full:`Output blocked`,waiting:`Waiting for input`,ready:`Ready`};function $m(e,t){return je(e.level).speed*(t?.speed[e.type]??1)}function eh(e){return e.recipeId?Ge(e.recipeId):null}function th(e,t){return t.inputs.every(t=>(e.inputInventory[t.resourceId]??0)>=t.amount)}function nh(e,t){let n=t.outputs.reduce((e,t)=>e+t.amount,0),r=Math.max(P(e.type).outputCapacity,n*2);return Zm(e.outputInventory)+n<=r}function rh(e,t){if(!e.enabled)return!1;if(P(e.type).behavior===`seller`)return!0;let n=eh(e)?.inputs.find(e=>e.resourceId===t);return n?(e.inputInventory[t]??0)<n.amount*a.inputBufferBatches:!1}function ih(e,t,n){if(!e.enabled)return null;let r=eh(e);if(!r||!e.active&&!ah(e,r)||(e.progress+=t*$m(e,n)/r.duration,e.progress<1))return null;for(let t of r.outputs)e.outputInventory[t.resourceId]=(e.outputInventory[t.resourceId]??0)+t.amount;let i=e.progress-1;return e.active=!1,e.progress=0,ah(e,r)&&(e.progress=i),r}function ah(e,t){if(!th(e,t)||!nh(e,t))return!1;for(let n of t.inputs)e.inputInventory[n.resourceId]-=n.amount;return e.active=!0,e.progress=0,!0}function oh(e){if(!e.enabled)return`disabled`;if(P(e.type).behavior!==`crafter`)return`ready`;if(e.active)return`working`;let t=eh(e);return t?nh(e,t)?`waiting`:`output_full`:`ready`}function sh(e,t){let n=eh(e),r=n?.outputs[0];return!n||!r?null:{resourceId:r.resourceId,perMinute:60/n.duration*r.amount*$m(e,t)}}var ch=.5,lh=.1;function uh(e){return e.transit[e.transit.length-1]}function dh(e){let t=uh(e);return t?1+t.progress-i:1/0}function fh(e,t,n){let r=e.conveyorAt(n.outerX,n.outerY);if(!r||r.direction!==ce(n.side))return!1;let i=r.items[0];return i!==void 0&&i.progress>=Math.min(1,dh(t))-lh}function ph(e,t,n){if(!t.enabled)return!1;let r=uh(t);if(r&&r.progress<.499999)return!1;if(n===t.lastInput){let r=Se(P(t.type),t.gridX,t.gridY,t.rotation);for(let i=0;i<r.length;i++)if(i!==n&&r[i].type===`input`&&fh(e,t,r[i]))return!1}return!0}function mh(e,t,n,r,i,a){let o=a??{id:e.nextItemId++,resourceId:i,tileX:0,tileY:0,progress:0,from:r};o.tileX=t.gridX,o.tileY=t.gridY,o.progress=0,o.from=r,delete o.to,t.transit.push(o),t.lastInput=n}function hh(e,t,n){return e.kind===`conveyor`?Km(e.conveyor):n.canDeliver(e.machine,t,e.port)}function gh(e,t,n,r,i,a,o){let s=null;for(let a=0;a<n.length;a++){let c=(t.routeIndex+a)%n.length,l=n[c];if(l.side===o)continue;let u=Vm(e,l.x,l.y,l.side);if(u){if(hh(u,r,i))return t.routeIndex=(c+1)%n.length,l.side;s??={side:l.side,next:(c+1)%n.length}}}return a&&s?(t.routeIndex=s.next,s.side):null}function _h(e,t,n,r){let a=t.transit;if(a.length===0||!t.enabled)return;let o=Se(P(t.type),t.gridX,t.gridY,t.rotation).filter(e=>e.type===`output`),s=1*n,c=1/0,l=0;for(;l<a.length;){let n=a[l],u=Math.min(n.progress+s,c-i);if(n.to===void 0&&u>=ch){let i=gh(e,t,o,n.resourceId,r,!0);i===null?u=ch:n.to=i}if(n.to!==void 0){let s=Vm(e,t.gridX,t.gridY,n.to),c=s===null;if(s?.kind===`conveyor`){let e=s.conveyor.items[s.conveyor.items.length-1];if(e&&(u=Math.min(u,1+e.progress-i)),u>=1){a.splice(l,1),Jm(s.conveyor,n,n.to,u-1);continue}c=u<=.55&&!Km(s.conveyor)}else if(s?.kind===`machine`&&u>=1){if(r.deliver(s.machine,n.resourceId,s.port,n.to,n)){let e=a.indexOf(n);e>=0&&a.splice(e,1);continue}c=!0}if(c){let i=gh(e,t,o,n.resourceId,r,!1,n.to);i!==null&&(n.to=i,n.progress=ch,u=ch)}u=Math.min(u,1)}u>n.progress&&(n.progress=u),c=n.progress,l++}}function vh(e){return e%2}function yh(e,t){return e.transit.filter(e=>vh(e.from)===t)}function bh(e,t){if(!e.enabled)return!1;let n=yh(e,vh(t));if(n.some(e=>e.from!==t))return!1;let r=n[n.length-1];return!r||r.progress>=.499999}function xh(e,t){let n=yh(e,vh(t)),r=n[n.length-1];return r?1+r.progress-i:1/0}function Sh(e,t,n,r,i){let a=i??{id:e.nextItemId++,resourceId:r,tileX:0,tileY:0,progress:0,from:n};a.tileX=t.gridX,a.tileY=t.gridY,a.progress=0,a.from=n,a.to=n,t.transit.push(a)}function Ch(e,t,n,r){if(t.transit.length===0||!t.enabled)return;let a=1*n,o=e=>{let n=t.transit.indexOf(e);n>=0&&t.transit.splice(n,1)};for(let n of[0,1]){let s=1/0;for(let c of yh(t,n)){let n=Math.min(c.progress+a,s-i),l=Vm(e,t.gridX,t.gridY,c.from);if(l?.kind===`conveyor`){let e=l.conveyor.items[l.conveyor.items.length-1];if(e&&(n=Math.min(n,1+e.progress-i)),n>=1){o(c),Jm(l.conveyor,c,c.from,n-1);continue}}else if(n>=1){let e=c.from;if(l?.kind===`machine`&&r.deliver(l.machine,c.resourceId,l.port,e,c)){o(c);continue}n=1}n>c.progress&&(c.progress=n),s=c.progress}}}function wh(e,t){return e.enabled?(P(e.type).powerUse??0)*je(e.level).power*(t?.powerDraw??1):0}function Th(e,t){return e.enabled?(P(e.type).powerOutput??0)*(t?.turbineOutput??1):0}function Eh(e,t,n){let r=t.baseSupply,i=0;for(let t of e.machines.values())r+=Th(t,n),i+=wh(t,n);return{supply:r,demand:i,ratio:i>r?r/i:1}}var Dh=30,Oh=60,kh=class{rates={produced:new Map,consumed:new Map,sold:new Map};machines=new Map;advance(e){for(let t of Object.values(this.rates))for(let n of t.values())n.advance(e);for(let t of this.machines.values())t.working.advance(e),t.waiting.advance(e),t.blocked.advance(e),t.output.advance(e)}record(e){let t=this.machines.get(e);return t||(t={working:new ie(Dh),waiting:new ie(Dh),blocked:new ie(Dh),output:new ie(Oh),stallKind:null,stalledFor:0},this.machines.set(e,t)),t}sampleMachine(e,t,n){let r=this.record(e),i=t===`waiting`||t===`output_full`?t:null;i!==r.stallKind&&(r.stallKind=i,r.stalledFor=0),i&&(r.stalledFor+=n),t===`working`?r.working.add(n):t===`waiting`?r.waiting.add(n):t===`output_full`&&r.blocked.add(n)}count(e,t,n,r){let i=this.rates[e].get(t);i||(i=new ie(Oh),this.rates[e].set(t,i)),i.add(n),r&&e===`produced`&&this.record(r).output.add(n)}forgetMachine(e){this.machines.delete(e)}rate(e,t){return this.rates[e].get(t)?.perMinute()??0}windowTotal(e,t){return this.rates[e].get(t)?.sum()??0}machineOutputRate(e){return this.machines.get(e)?.output.perMinute()??0}shares(e){let t=this.machines.get(e);if(!t)return{working:0,waiting:0,blocked:0,observed:0};let n=t.working.sum(),r=t.waiting.sum(),i=t.blocked.sum(),a=n+r+i;return a<=0?{working:0,waiting:0,blocked:0,observed:0}:{working:n/a,waiting:r/a,blocked:i/a,observed:a}}stall(e){let t=this.machines.get(e);return t?.stallKind?{kind:t.stallKind,seconds:t.stalledFor}:null}},Ah=class{listeners={};on(e,t){return(this.listeners[e]??=[]).push(t),()=>this.off(e,t)}off(e,t){let n=this.listeners[e];if(!n)return;let r=n.indexOf(t);r>=0&&n.splice(r,1)}emit(e,t){let n=this.listeners[e];if(n)for(let e of n.slice())e(t)}},jh=e=>({ok:!1,reason:e}),Mh=class{state;events=new Ah;metrics=new kh;network=new Gm;power={supply:0,demand:0,ratio:1};environment;tutorialTimer=0;achievementTimer=0;constructor(e){this.state=e,this.environment=l(e.environment),ne(e.contracts,e.research),this.power=Eh(e.factory,e.power,this.environment)}tick(){let{factory:e,economy:t}=this.state,n=r;this.state.simTime+=n,t.advance(n),this.metrics.advance(n),Ym(e,this.network,n,this.hooks),this.power=Eh(e,this.state.power,this.environment);let i=n*this.power.ratio;for(let t of e.machines.values()){let r=P(t.type).behavior;if(r===`router`)_h(e,t,n,this.hooks);else if(r===`bridge`)Ch(e,t,n,this.hooks);else if(r===`storage`)this.pushOutputs(t);else if(r===`crafter`){let e=ih(t,i,this.environment);if(e){for(let n of e.outputs)this.state.stats.produced[n.resourceId]=(this.state.stats.produced[n.resourceId]??0)+n.amount,this.metrics.count(`produced`,n.resourceId,n.amount,t.id);for(let t of e.inputs)this.metrics.count(`consumed`,t.resourceId,t.amount);this.events.emit(`machineProduced`,{machine:t,recipeId:e.id})}this.pushOutputs(t),this.metrics.sampleMachine(t.id,oh(t),n)}}if(this.tutorialTimer+=n,this.tutorialTimer>=.5&&(this.tutorialTimer=0,this.checkTutorial(),this.checkRateContracts()),this.achievementTimer+=n,this.achievementTimer>=1){this.achievementTimer=0;let e=He(this);e.length>0&&this.events.emit(`achievementsUnlocked`,e)}}salesRate=e=>this.state.contracts.bestRate[e]??0;advanceContracts(e){for(let t of[...this.state.contracts.active])t.kind===`deliver`&&t.resourceId===e&&(t.progress++,t.progress>=t.target&&this.completeContract(t))}checkRateContracts(){let{bestRate:e}=this.state.contracts;for(let t of Object.keys(this.state.stats.sold)){let n=this.metrics.windowTotal(`sold`,t);n>(e[t]??0)&&(e[t]=n)}for(let e of[...this.state.contracts.active])e.kind===`rate`&&this.metrics.windowTotal(`sold`,e.resourceId)>=e.target&&this.completeContract(e)}completeContract(e){let{contracts:t,economy:n,research:r}=this.state;t.active=t.active.filter(t=>t.id!==e.id),t.completed++,n.award(e.reward),this.events.emit(`contractCompleted`,e),ne(t,r,this.salesRate)}creditSales(e,t){if(!(t<=0)){this.state.economy.award(this.salePrice(e)*t),this.state.stats.sold[e]=(this.state.stats.sold[e]??0)+t;for(let n of[...this.state.contracts.active])n.kind===`deliver`&&n.resourceId===e&&(n.progress=Math.min(n.progress+t,n.target),n.progress>=n.target&&this.completeContract(n))}}swapContract(e){let{contracts:t,research:n}=this.state;return t.active.some(t=>t.id===e)?(t.active=t.active.filter(t=>t.id!==e),ne(t,n,this.salesRate),!0):!1}salePrice(e){return vm(e)*Rm(this.state.prestige.stars)}canDeliver(e,t,n){let r=P(e.type);switch(r.behavior){case`router`:return ph(this.state.factory,e,n);case`bridge`:{let t=Se(r,e.gridX,e.gridY,e.rotation)[n].side;return bh(e,ce(t))}case`storage`:return e.enabled&&e.stored.length<(r.storageCapacity??0);default:return rh(e,t)}}deliver(e,t,n,r,i){if(!this.canDeliver(e,t,n))return!1;switch(P(e.type).behavior){case`router`:mh(this.state.factory,e,n,r,t,i);break;case`bridge`:Sh(this.state.factory,e,r,t,i);break;case`storage`:e.stored.push(t);break;case`seller`:{let n=this.salePrice(t);this.state.economy.earn(n),this.state.stats.sold[t]=(this.state.stats.sold[t]??0)+1,this.metrics.count(`sold`,t,1),this.events.emit(`itemSold`,{machine:e,resourceId:t,value:n}),this.advanceContracts(t);break}default:e.inputInventory[t]=(e.inputInventory[t]??0)+1,this.events.emit(`itemEntered`,{machine:e,resourceId:t})}return!0}hooks={deliver:(e,t,n,r,i)=>this.deliver(e,t,n,r,i),canDeliver:(e,t,n)=>this.canDeliver(e,t,n),entryLimit:(e,t)=>{let n=P(e.type).behavior;return n===`router`?dh(e):n===`bridge`?xh(e,t):1/0}};nextOutput(e){return P(e.type).behavior===`storage`?e.stored[0]:Object.keys(e.outputInventory).find(t=>e.outputInventory[t]>0)}pushOutputs(e){if(!e.enabled)return;let{factory:t}=this.state,n=P(e.type);for(let r of Se(n,e.gridX,e.gridY,e.rotation)){if(r.type!==`output`)continue;let i=this.nextOutput(e);if(!i)return;let a=Vm(t,r.x,r.y,r.side);if(a){if(a.kind===`conveyor`){if(!Km(a.conveyor))continue;qm(t,a.conveyor,i,r.side)}else if(!this.deliver(a.machine,i,a.port,r.side))continue;n.behavior===`storage`?e.stored.shift():e.outputInventory[i]--}}}dismissTip(e){Qe(e)&&!this.state.seenTips.includes(e)&&this.state.seenTips.push(e)}checkTutorial(){tt(this.state)&&this.events.emit(`tutorialAdvanced`,this.state.tutorialStep)}canPlaceMachine(e,t,n,r){let{factory:i,economy:a}=this.state;if(!this.isMachineUnlocked(e))return jh(`not_researched`);let o=xe(P(e),t,n,r),s=Ue(i.grid,i.occupancy,o);return s.valid?a.canAfford(mm(e))?{ok:!0,value:null}:jh(`cannot_afford`):jh(s.reason)}canPlaceBlueprint(e,t,n){let{factory:r,economy:i}=this.state;if(e.machines.length+e.conveyors.length===0)return jh(`empty`);if(e.machines.some(e=>!this.isMachineUnlocked(e.type)))return jh(`not_researched`);let a=Ue(r.grid,r.occupancy,Cm(e,t,n));return a.valid?i.canAfford(Sm(e))?{ok:!0,value:null}:jh(`cannot_afford`):jh(a.reason)}placeBlueprint(e,t,n){let r=this.canPlaceBlueprint(e,t,n);if(!r.ok)return r;for(let r of e.machines){let e=r.recipeId&&this.canUseRecipe(r.type,r.recipeId)?r.recipeId:void 0;this.placeMachine(r.type,t+r.x,n+r.y,r.rotation,e)}for(let r of e.conveyors)this.placeConveyor(t+r.x,n+r.y,r.direction);return{ok:!0,value:e.machines.length+e.conveyors.length}}upgradeOffer(e){if(P(e.type).behavior!==`crafter`||e.level>=Ae)return null;let t=je(e.level+1),n=k(t.level);return{next:t,cost:gm(e.type,t.level),needsResearch:n&&!this.state.research.includes(n.id)?n:null}}upgradeMachine(e){let t=this.state.factory.machines.get(e);if(!t)return jh(`not_found`);if(P(t.type).behavior!==`crafter`)return jh(`not_upgradable`);let n=this.upgradeOffer(t);return n?n.needsResearch?jh(`not_researched`):this.state.economy.spend(n.cost)?(t.level=n.next.level,this.metrics.forgetMachine(t.id),this.events.emit(`machineUpgraded`,t),{ok:!0,value:t}):jh(`cannot_afford`):jh(`max_level`)}nextExpansion(){let{width:e,height:t}=this.state.factory.grid;return Pe(Math.max(e,t))}expandFactory(){let e=this.nextExpansion();if(!e)return jh(`max_size`);if(!this.state.economy.spend(e.cost))return jh(`cannot_afford`);let{dx:t,dy:n}=this.state.factory.expand(e.size,e.size);return this.events.emit(`factoryExpanded`,{width:e.size,height:e.size,dx:t,dy:n}),this.topologyChanged(),{ok:!0,value:e}}isMachineUnlocked(e){return e===`conveyor`||D(this.state.research).includes(e)}isRecipeAvailable(e){return O(this.state.research).includes(e)}canUseRecipe(e,t){return Ke(t)&&Ge(t).machineType===e&&this.isRecipeAvailable(t)}startingRecipe(e){return qe(e).find(e=>this.isRecipeAvailable(e.id))?.id??null}research(e){let t=S(e);if(!t)return jh(`not_found`);let n=T(this.state.research,t);return n===`done`?jh(`already_researched`):n===`locked`?jh(`not_researched`):this.state.economy.spend(t.cost)?(this.state.research.push(t.id),this.events.emit(`researchCompleted`,t),this.checkTutorial(),{ok:!0,value:t}):jh(`cannot_afford`)}placeMachine(e,t,n,r,i){let a=this.canPlaceMachine(e,t,n,r);if(!a.ok)return a;if(i!==void 0&&!this.canUseRecipe(e,i))return jh(`invalid_recipe`);let{factory:o,economy:s}=this.state;s.spend(mm(e));let c=Xm(o.newEntityId(`m`),e,t,n,r,i??this.startingRecipe(e));return o.addMachine(c),this.topologyChanged(),this.events.emit(`machinePlaced`,c),this.checkTutorial(),{ok:!0,value:c}}canPlaceConveyor(e,t){let{factory:n,economy:r}=this.state,i=Ue(n.grid,n.occupancy,[{x:e,y:t}]);return i.valid?r.canAfford(mm(`conveyor`))?{ok:!0,value:null}:jh(`cannot_afford`):jh(i.reason)}placeConveyor(e,t,n){let r=this.canPlaceConveyor(e,t);if(!r.ok)return r;let{factory:i,economy:a}=this.state;a.spend(mm(`conveyor`));let o={id:i.newEntityId(`c`),gridX:e,gridY:t,direction:n,items:[]};return i.addConveyor(o),this.topologyChanged(),this.events.emit(`conveyorPlaced`,o),this.checkTutorial(),{ok:!0,value:o}}setConveyorDirection(e,t){let n=this.state.factory.conveyors.get(e);return!n||n.direction===t?!1:(n.direction=t,this.topologyChanged(),!0)}rotateMachine(e){let{factory:t}=this.state,n=t.machines.get(e);if(!n)return jh(`not_found`);let r=N(n.rotation,1),i=xe(P(n.type),n.gridX,n.gridY,r),a=Ue(t.grid,t.occupancy,i,n.id);return a.valid?(t.occupancy.release(t.machineCells(n)),n.rotation=r,t.occupancy.occupy(i,{kind:`machine`,id:n.id}),this.topologyChanged(),this.events.emit(`machineChanged`,n),{ok:!0,value:n}):jh(a.reason)}setRecipe(e,t){let n=this.state.factory.machines.get(e);if(!n)return jh(`not_found`);if(!this.canUseRecipe(n.type,t))return jh(`invalid_recipe`);if(n.recipeId===t)return{ok:!0,value:n};let r=Ge(t),i={};for(let e of r.inputs){let t=n.inputInventory[e.resourceId]??0;t>0&&(i[e.resourceId]=t)}return n.recipeId=t,n.inputInventory=i,n.active=!1,n.progress=0,this.metrics.forgetMachine(n.id),this.events.emit(`machineChanged`,n),{ok:!0,value:n}}setMachineEnabled(e,t){let n=this.state.factory.machines.get(e);n&&n.enabled!==t&&(n.enabled=t,this.events.emit(`machineChanged`,n))}removeAt(e,t){let{factory:n,economy:r}=this.state,i=n.occupancy.get(e,t);if(!i)return jh(`not_found`);if(i.kind===`machine`){let e=n.machines.get(i.id);n.removeMachine(e),this.metrics.forgetMachine(e.id),r.refund(_m(e.type,e.level)),this.topologyChanged(),this.events.emit(`machineRemoved`,e)}else{let e=n.conveyors.get(i.id);n.removeConveyor(e),r.refund(hm(`conveyor`)),this.topologyChanged(),this.events.emit(`conveyorRemoved`,e)}return{ok:!0,value:i.kind}}topologyChanged(){this.network.invalidate(),this.events.emit(`topologyChanged`,void 0)}},Nh=class{speed=1;accumulator=0;advance(e,t,n){if(this.speed===0)return 0;this.accumulator+=e*this.speed;let i=0;for(;this.accumulator>=.05&&i<t;)n(),this.accumulator-=r,i++;return this.accumulator>=.05&&(this.accumulator=0),i}get alpha(){return this.speed===0?1:Math.min(this.accumulator/r,1)}};function Ph(e){let t=P(e.type).behavior;return t===`router`||t===`storage`}function Fh(e,t){let n=new Set,r=new Set,i=new Set([t.id]),a=(t,s,c)=>{let l=t-oe[c].x,u=s-oe[c].y,d=e.conveyorAt(l,u);if(d){if(d.direction!==c)return;let e=`${l},${u}`;if(r.has(e))return;r.add(e);for(let e of[0,1,2,3])e!==ce(d.direction)&&a(l,u,e);return}let f=e.machineAt(l,u);if(f){if(P(f.type).behavior===`bridge`){let e=`bridge:${l},${u},${c%2}`;r.has(e)||(r.add(e),a(l,u,c));return}Se(P(f.type),f.gridX,f.gridY,f.rotation).some(e=>e.type===`output`&&e.x===l&&e.y===u&&e.side===c)&&(i.has(f.id)||(i.add(f.id),Ph(f)?o(f):n.add(f)))}},o=e=>{for(let t of Se(P(e.type),e.gridX,e.gridY,e.rotation))t.type===`input`&&a(t.x,t.y,ce(t.side))};return o(t),[...n]}function Ih(e,t){let n=new Set,r=new Set,i=new Set([t.id]),a=(t,s,c)=>{let l=Vm(e,t,s,c);if(l){if(l.kind===`conveyor`){let{conveyor:e}=l,t=`${e.gridX},${e.gridY}`;if(r.has(t))return;r.add(t),a(e.gridX,e.gridY,e.direction);return}if(P(l.machine.type).behavior===`bridge`){let e=`bridge:${l.machine.gridX},${l.machine.gridY},${c%2}`;r.has(e)||(r.add(e),a(l.machine.gridX,l.machine.gridY,c));return}i.has(l.machine.id)||(i.add(l.machine.id),Ph(l.machine)?o(l.machine):n.add(l.machine))}},o=e=>{for(let t of Se(P(e.type),e.gridX,e.gridY,e.rotation))t.type===`output`&&a(t.x,t.y,t.side)};return o(t),[...n]}var Lh=.2,Rh=8,zh=.3,Bh=.95,Vh=.3;function Hh(e){return`${Math.round(e*100)}%`}function Uh(e){let t=P(e.machineType).name;return qe(e.machineType).length<=1?t:`${t} making ${m(e.outputs[0].resourceId).name}`}function Wh(e,t){let n=Uh(t);if(e===1)return`One more ${n}`;let r=P(t.machineType).name;return`${e} more ${n.replace(r,`${r}s`)}`}function Gh(e,t){return d.filter(n=>n[t].some(t=>t.resourceId===e))}function Kh(e,t,n,r){let i=new Set(n.map(e=>e.id)),a=0,o=0;for(let n of e){if(!n.recipeId||!i.has(n.recipeId)||!n.enabled)continue;let e=t.shares(n.id);e.observed<Rh||(a+=e[r],o++)}return{average:o>0?a/o:0,count:o}}function qh(e,t){let n=Se(P(t.type),t.gridX,t.gridY,t.rotation),r=0,i=null;for(let a of n){if(a.type!==`input`)continue;let n=e.conveyorAt(a.outerX,a.outerY),o=e.machineAt(a.outerX,a.outerY),s=n&&n.direction===ce(a.side)?n.items[0]:o&&o.transit[0]?.to===ce(a.side)?o.transit[0]:void 0;if(n&&n.direction===ce(a.side)||o)r++;else continue;if(s&&s.progress>=1-1e-6&&!rh(t,s.resourceId))i??=s.resourceId;else return null}return r>0?i:null}function Jh(e,t){return Se(P(t.type),t.gridX,t.gridY,t.rotation).some(t=>t.type===`input`&&Um(e,t.x,t.y,ce(t.side)))}function Yh(e,t){let n=[],r=[...e.factory.machines.values()],i=l(e.environment),a=e=>60/e.duration*(i.speed[e.machineType]??1),o=new Map,s=n=>{let r=o.get(n.id);if(r!==void 0)return r;o.set(n.id,!1);let i=Ih(e.factory,n);if(i.length===0)return o.set(n.id,!0),!0;let a=i.some(e=>{let n=P(e.type).behavior;if(n===`seller`)return!0;if(n!==`crafter`||!e.enabled)return!1;let r=t.shares(e.id);return r.observed>=Rh&&r.working>=Bh?!1:s(e)});return o.set(n.id,a),a};for(let o of r){if(!o.enabled||!o.recipeId)continue;let r=P(o.type);if(r.behavior!==`crafter`)continue;let c=t.shares(o.id);if(c.observed<Rh)continue;let l=Ge(o.recipeId),u=60/l.duration*$m(o,i);if(c.waiting>=Lh&&l.inputs.length>0&&s(o)){let i=[...l.inputs].sort((e,t)=>(o.inputInventory[e.resourceId]??0)/e.amount-(o.inputInventory[t.resourceId]??0)/t.amount)[0],s=m(i.resourceId),d=u*i.amount,f=d*c.waiting,p=Gh(i.resourceId,`outputs`),h=p[0],g=Fh(e.factory,o),_=Kh(g,t,p,`blocked`),v=Kh(g,t,p,`waiting`),y=new Set(p.map(e=>e.id)),b=g.filter(e=>e.recipeId!==null&&y.has(e.recipeId)).length>0?qh(e.factory,o):null,x=h!==void 0&&g.length===0&&!Jh(e.factory,o),S,C=1;if(b)S=`Its hatch is blocked by ${m(b).name} it has no room for — give each ingredient its own belt.`;else if(!h)S=`Nothing makes ${s.name} yet.`;else if(x)S=`Nothing is connected to its input — run a belt carrying ${s.name} to it.`;else if(_.count>0&&_.average>=zh)S=`Your ${s.name} is backed up at its source — the belts to this machine are the limit.`;else if(v.count>0&&v.average>=zh)S=`The shortage starts further up the line.`,C=Vh;else{let e=h.outputs.find(e=>e.resourceId===i.resourceId),t=a(h)*e.amount;S=`${Wh(Math.max(1,Math.ceil(f/t-.05)),h)} would keep it fed.`}n.push({machineId:o.id,kind:`starved`,share:c.waiting,problem:`${r.name} waits for ${s.name} ${Hh(c.waiting)} of the time — it can use ${Math.round(d)}/min but gets about ${Math.round(d-f)}.`,fix:S,severity:c.waiting*C})}if(c.blocked>=Lh){let i=l.outputs[0],s=m(i.resourceId),d=Gh(i.resourceId,`inputs`),f=Kh(Ih(e.factory,o),t,d,`blocked`),p=u*i.amount*c.blocked,h,g=1;if(d.length===0)h=`Send its ${s.name}s to a Seller, or add another Seller.`;else if(f.count>0&&f.average>=zh)h=`The jam starts further down the line.`,g=Vh;else{let e=d[0],t=e.inputs.find(e=>e.resourceId===i.resourceId),n=a(e)*t.amount;h=`${Wh(Math.max(1,Math.ceil(p/n-.05)),e)} could use the spare ${s.name}.`}n.push({machineId:o.id,kind:`blocked`,share:c.blocked,problem:`${r.name} is backed up ${Hh(c.blocked)} of the time — about ${Math.round(p)} ${s.name}/min has nowhere to go.`,fix:h,severity:c.blocked*g})}}let c=Eh(e.factory,e.power,i);if(c.ratio<.995){let t=c.demand-c.supply,r=P(`wind_turbine`),a=Math.ceil(t/((r.powerOutput??1)*i.turbineOutput));n.push({machineId:null,kind:`power`,share:1-c.ratio,problem:`The factory needs ${Math.round(c.demand)} power but has ${Math.round(c.supply)} — every machine runs at ${Hh(c.ratio)} speed.`,fix:D(e.research).includes(r.type)?`${a===1?`One more Wind Turbine`:`${a} more Wind Turbines`} would cover it.`:`Research Wind Power to build turbines, or switch off machines you can spare.`,severity:1+(1-c.ratio)})}return n.sort((e,t)=>t.severity-e.severity)}var Xh=11,Zh=class{camera;placement;actions;enabled=!0;held=new Set;constructor(e,t,n){this.camera=e,this.placement=t,this.actions=n,window.addEventListener(`keydown`,this.onKeyDown),window.addEventListener(`keyup`,e=>this.held.delete(e.code)),window.addEventListener(`blur`,()=>this.held.clear())}onKeyDown=e=>{let t=e.target;if(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||!this.enabled||e.altKey)return;if(e.ctrlKey||e.metaKey){if(e.repeat)return;e.code===`KeyC`?(e.preventDefault(),this.placement.toggleCopy()):e.code===`KeyZ`?(e.preventDefault(),this.placement.undoDelete()):e.code===`KeyV`&&(e.preventDefault(),this.placement.startPaste());return}if(this.held.add(e.code),e.repeat)return;let n=/^Digit([0-9])$/.exec(e.code);if(n){this.actions.pickTool((Number(n[1])+9)%10);return}switch(e.code){case`KeyQ`:this.camera.rotate(1);break;case`KeyE`:this.camera.rotate(-1);break;case`KeyR`:this.placement.rotate();break;case`KeyX`:this.placement.toggleDelete();break;case`KeyF`:this.placement.pipette();break;case`KeyB`:this.actions.toggleBottleneckView();break;case`KeyT`:this.actions.toggleResearch();break;case`KeyC`:this.actions.toggleContracts();break;case`KeyG`:this.actions.toggleAchievements();break;case`Backquote`:this.actions.cycleToolGroup();break;case`KeyP`:this.actions.toggleBlueprints();break;case`Escape`:this.placement.cancel();break;case`Delete`:case`Backspace`:this.placement.deleteSelected();break;case`Home`:this.camera.center();break;case`Space`:e.preventDefault(),this.actions.togglePause();break;case`F3`:e.preventDefault(),this.actions.toggleDebug()}};update(e){if(!this.enabled)return;let t=0,n=0;if((this.held.has(`KeyD`)||this.held.has(`ArrowRight`))&&(t+=1),(this.held.has(`KeyA`)||this.held.has(`ArrowLeft`))&&--t,(this.held.has(`KeyW`)||this.held.has(`ArrowUp`))&&(n+=1),(this.held.has(`KeyS`)||this.held.has(`ArrowDown`))&&--n,t===0&&n===0)return;let r=Xh*this.camera.zoomScale*e;this.camera.panScreen(t*r,n*r),this.placement.refreshHover()}},Qh=5,$h=10,eg=class{canvas;camera;placement;enabled=!0;button=-1;downX=0;downY=0;downNdc={x:0,y:0};dragged=!1;panning=!1;panAnchor=new U;scratch=new U;touches=new Map;pinchDistance=0;pinching=!1;touchPending=!1;touchSpent=!1;constructor(e,t,n){this.canvas=e,this.camera=t,this.placement=n,e.addEventListener(`pointerdown`,this.onDown),e.addEventListener(`pointermove`,this.onMove),e.addEventListener(`pointerup`,this.onUp),e.addEventListener(`pointercancel`,this.onUp),e.addEventListener(`pointerleave`,this.onLeave),e.addEventListener(`wheel`,this.onWheel,{passive:!1}),e.addEventListener(`contextmenu`,e=>e.preventDefault())}toNdc(e,t){let n=this.canvas.getBoundingClientRect();return{x:(e-n.left)/n.width*2-1,y:-((t-n.top)/n.height)*2+1}}ndc(e){return this.toNdc(e.clientX,e.clientY)}capture(e){try{this.canvas.setPointerCapture(e.pointerId)}catch{}}onDown=e=>{if(!this.enabled)return;if(e.pointerType===`touch`){if(this.touches.set(e.pointerId,{x:e.clientX,y:e.clientY}),this.capture(e),this.touches.size===2)return this.startPinch();if(this.touches.size>2||this.touchSpent)return}if(this.button!==-1)return;this.capture(e),this.button=e.button,this.downX=e.clientX,this.downY=e.clientY,this.dragged=!1,this.panning=!1;let{x:t,y:n}=this.ndc(e);this.downNdc={x:t,y:n},e.button===0&&this.placement.currentTool.mode!==`select`?e.pointerType===`touch`?this.touchPending=!0:this.placement.primaryDown(t,n):e.button===1&&(e.preventDefault(),this.startPan(t,n))};startPan(e,t){this.panning=this.camera.groundPoint(e,t,this.panAnchor)!==null}pinchState(){let[e,t]=[...this.touches.values()];return{...this.toNdc((e.x+t.x)/2,(e.y+t.y)/2),distance:Math.max(Math.hypot(e.x-t.x,e.y-t.y),1)}}startPinch(){this.button!==-1&&!this.touchPending&&this.placement.currentTool.mode!==`select`&&this.placement.abortDrag(),this.button=-1,this.touchPending=!1,this.pinching=!0,this.touchSpent=!0;let{x:e,y:t,distance:n}=this.pinchState();this.pinchDistance=n,this.startPan(e,t)}movePinch(){let{x:e,y:t,distance:n}=this.pinchState();if(this.camera.zoom(this.pinchDistance/n,e,t),this.pinchDistance=n,this.panning){let n=this.camera.groundPoint(e,t,this.scratch);n&&this.camera.panWorld(this.panAnchor.x-n.x,this.panAnchor.z-n.z)}}onMove=e=>{if(!this.enabled)return;if(e.pointerType===`touch`){let t=this.touches.get(e.pointerId);if(!t)return;if(t.x=e.clientX,t.y=e.clientY,this.pinching)return this.movePinch();if(this.touchSpent)return}let{x:t,y:n}=this.ndc(e);if(this.button!==-1&&e.buttons===0&&e.pointerType!==`touch`&&(this.button=-1,this.panning=!1,this.placement.primaryUp()),this.button!==-1&&!this.dragged&&Math.hypot(e.clientX-this.downX,e.clientY-this.downY)>(e.pointerType===`touch`?$h:Qh)){this.dragged=!0;let e=this.placement.currentTool.mode===`select`;(this.button===2||this.button===0&&e)&&this.startPan(this.downNdc.x,this.downNdc.y),this.touchPending&&(this.touchPending=!1,this.placement.primaryDown(this.downNdc.x,this.downNdc.y))}if(!this.touchPending){if(this.panning){let e=this.camera.groundPoint(t,n,this.scratch);e&&this.camera.panWorld(this.panAnchor.x-e.x,this.panAnchor.z-e.z);return}this.button===0&&this.placement.currentTool.mode!==`select`?this.placement.primaryDrag(t,n):this.placement.pointerMove(t,n)}};onUp=e=>{if(this.canvas.hasPointerCapture(e.pointerId)&&this.canvas.releasePointerCapture(e.pointerId),e.pointerType===`touch`){if(!this.touches.delete(e.pointerId))return;if(this.pinching||this.touchSpent){this.pinching=!1,this.panning=!1,this.touches.size===0&&(this.touchSpent=!1,this.placement.pointerLeave());return}}else if(e.button!==this.button)return;if(this.button===-1)return;let{x:t,y:n}=this.ndc(e),r=!this.dragged,i=this.button,a=this.touchPending;if(this.button=-1,this.panning=!1,this.touchPending=!1,!this.enabled||e.type===`pointercancel`){i===0&&!a&&this.placement.abortDrag();return}i===0?this.placement.currentTool.mode===`select`?r&&this.placement.click(t,n):(a&&this.placement.primaryDown(t,n),this.placement.primaryUp()):i===2&&r&&this.placement.cancel(),e.pointerType===`touch`?this.placement.currentTool.mode===`select`&&this.placement.pointerLeave():this.placement.pointerMove(t,n)};onLeave=e=>{e.pointerType!==`touch`&&this.button===-1&&this.placement.pointerLeave()};onWheel=e=>{if(e.preventDefault(),!this.enabled)return;let{x:t,y:n}=this.ndc(e);this.camera.zoom(e.deltaY>0?1.12:1/1.12,t,n),this.placement.pointerMove(t,n)}},tg=class{pointer;keyboard;constructor(e,t,n,r){this.pointer=new eg(e,t,n),this.keyboard=new Zh(t,n,r)}setEnabled(e){this.pointer.enabled=e,this.keyboard.enabled=e}update(e){this.keyboard.update(e)}},ng=30,rg={cannot_afford:`Not enough money`,occupied:`Something is in the way`,out_of_bounds:`Outside the factory floor`,blocked:`Can’t build there`,not_found:`Nothing there`,invalid_recipe:`That machine can’t make that`,not_researched:`Not researched yet`,already_researched:`Already researched`,max_size:`The factory is as large as it can get`,max_level:`Already fully upgraded`,not_upgradable:`That can’t be upgraded`,empty:`Nothing to place`},ig=class{sim;camera;machines;preview;selectionEffect;effects;audio;events=new Ah;tool={mode:`select`};selection=null;ground=new U;lastNdc=null;dragCell=null;buildHover=null;hovered=null;undoStack=[];stroke=null;lastRecipe=new Map;copyStart=null;clipboardBlueprint=null;constructor(e,t,n,r,i,a,o){this.sim=e,this.camera=t,this.machines=n,this.preview=r,this.selectionEffect=i,this.effects=a,this.audio=o,e.events.on(`machineRemoved`,e=>this.dropSelectionIf(e.id)),e.events.on(`conveyorRemoved`,e=>this.dropSelectionIf(e.id)),e.events.on(`topologyChanged`,()=>this.refreshSelectionOutline()),e.events.on(`factoryExpanded`,()=>{this.undoStack.length=0,this.stroke=null,this.events.emit(`undoChanged`,!1)})}get currentTool(){return this.tool}get currentSelection(){return this.selection}get currentHover(){return this.hovered}get currentBuildHover(){return this.buildHover}get clipboard(){return this.clipboardBlueprint}toggleCopy(){this.setTool(this.tool.mode===`copy`?{mode:`select`}:{mode:`copy`})}startPaste(e=this.clipboardBlueprint){if(!e||ym(e)){this.events.emit(`message`,`Nothing copied yet — use Copy and drag over part of the factory`);return}this.setTool({mode:`paste`,blueprint:e})}setTool(e){this.tool=e,this.dragCell=null,this.copyStart=null,e.mode!==`select`&&this.select(null),this.events.emit(`toolChanged`,e),this.refreshHover()}toggleBuild(e){if(!this.sim.isMachineUnlocked(e))return this.fail(`not_researched`);if(this.tool.mode===`build`&&this.tool.type===e){this.setTool({mode:`select`});return}let t=this.tool.mode===`build`?this.tool.rotation:0;this.setTool({mode:`build`,type:e,rotation:t,recipeId:this.lastRecipe.get(e)})}toggleDelete(){this.setTool(this.tool.mode===`delete`?{mode:`select`}:{mode:`delete`})}cancel(){this.tool.mode===`select`?this.select(null):this.setTool({mode:`select`})}pipette(){if(!this.lastNdc)return;let e=this.targetAt(this.lastNdc.x,this.lastNdc.y);if(!e)return;let{factory:t}=this.sim.state;if(e.kind===`machine`){let n=t.machines.get(e.id);n.recipeId&&this.lastRecipe.set(n.type,n.recipeId),this.setTool({mode:`build`,type:n.type,rotation:n.rotation,recipeId:n.recipeId??void 0})}else this.setTool({mode:`build`,type:`conveyor`,rotation:t.conveyors.get(e.id).direction});this.audio.play(`click`)}rotate(){if(this.tool.mode===`paste`){this.tool={mode:`paste`,blueprint:xm(this.tool.blueprint)},this.audio.play(`rotate`),this.refreshHover();return}if(this.tool.mode===`build`){this.tool={...this.tool,rotation:N(this.tool.rotation,1)},this.audio.play(`rotate`),this.refreshHover();return}if(this.selection){if(this.selection.kind===`machine`){let e=this.sim.rotateMachine(this.selection.id);this.audio.play(e.ok?`rotate`:`error`),e.ok||this.events.emit(`message`,rg[e.reason])}else{let e=this.sim.state.factory.conveyors.get(this.selection.id);e&&(this.sim.setConveyorDirection(e.id,N(e.direction,1)),this.audio.play(`rotate`))}}}pointerMove(e,t){this.lastNdc={x:e,y:t},this.refreshHover()}pointerLeave(){this.lastNdc=null,this.buildHover=null,this.hovered=null,this.preview.hide()}primaryDown(e,t){if(this.lastNdc={x:e,y:t},this.tool.mode===`build`){if(this.tool.type===`conveyor`){let n=this.cellAt(e,t);if(!n)return;this.dragCell=n,this.layConveyor(n.x,n.y,this.tool.rotation,!0)}else this.placeMachine(e,t)}else if(this.tool.mode===`delete`){let n=this.targetAt(e,t);this.dragCell=this.cellAt(e,t),this.stroke=null,n&&this.remove(n)}else this.tool.mode===`copy`?this.copyStart=this.cellAt(e,t):this.tool.mode===`paste`&&this.pasteBlueprint(e,t);this.refreshHover()}primaryDrag(e,t){this.lastNdc={x:e,y:t};let n=this.cellAt(e,t);if(n&&this.dragCell){if(this.tool.mode===`build`&&this.tool.type===`conveyor`){let e=0;for(;(this.dragCell.x!==n.x||this.dragCell.y!==n.y)&&e++<64;){let e=n.x-this.dragCell.x,t=n.y-this.dragCell.y,r=Math.abs(e)>=Math.abs(t)?Math.sign(e):0,i=r===0?Math.sign(t):0,a=r>0?0:r<0?2:i>0?1:3;this.tool={...this.tool,rotation:a};let o=this.sim.state.factory.conveyorAt(this.dragCell.x,this.dragCell.y);o&&this.sim.setConveyorDirection(o.id,a),this.dragCell={x:this.dragCell.x+r,y:this.dragCell.y+i},this.layConveyor(this.dragCell.x,this.dragCell.y,a,!1)}}else if(this.tool.mode===`delete`&&(n.x!==this.dragCell.x||n.y!==this.dragCell.y)){this.dragCell=n;let e=this.sim.state.factory.conveyorAt(n.x,n.y);e&&this.remove({kind:`conveyor`,id:e.id,x:n.x,y:n.y,w:1,h:1})}this.refreshHover()}}abortDrag(){this.dragCell=null,this.copyStart=null,this.refreshHover()}primaryUp(){if(this.dragCell=null,this.tool.mode!==`copy`||!this.copyStart||!this.lastNdc)return;let e=this.copyStart,t=this.cellAt(this.lastNdc.x,this.lastNdc.y)??e;this.copyStart=null;let n=bm(this.sim.state.factory,e.x,e.y,t.x,t.y);if(ym(n)){this.events.emit(`message`,`Nothing to copy there — drag right across the machines you want`),this.refreshHover();return}this.clipboardBlueprint=n,this.audio.play(`click`),this.setTool({mode:`paste`,blueprint:n})}blueprintAnchor(e,t,n){return this.camera.groundPoint(e,t,this.ground)?{x:Math.round(dp(this.ground.x)-n.width/2),y:Math.round(fp(this.ground.z)-n.height/2)}:null}pasteBlueprint(e,t){if(this.tool.mode!==`paste`)return;let{blueprint:n}=this.tool,r=this.blueprintAnchor(e,t,n);if(!r)return;let i=this.sim.placeBlueprint(n,r.x,r.y);if(!i.ok)return this.fail(i.reason);this.audio.play(`place`),this.effects.dust(lp(r.x)+(n.width-1)/2,0,up(r.y)+(n.height-1)/2,Math.max(n.width,n.height)/2,18)}click(e,t){let n=this.targetAt(e,t);this.select(n?{kind:n.kind,id:n.id}:null),n&&this.audio.play(`click`)}select(e){e?.id!==this.selection?.id&&(this.selection=e,this.refreshSelectionOutline(),this.events.emit(`selectionChanged`,e))}upgrade(e){let t=this.sim.upgradeMachine(e);if(!t.ok)return this.fail(t.reason);let n=t.value,{w:r,h:i}=ye(P(n.type),n.rotation),a=lp(n.gridX)+(r-1)/2,o=up(n.gridY)+(i-1)/2;this.audio.play(`upgrade`),this.effects.sparks(a,1.2,o,16),this.effects.dust(a,0,o,.95,10)}setRecipe(e,t){let n=this.sim.setRecipe(e,t);if(!n.ok)return this.fail(n.reason);this.lastRecipe.set(n.value.type,t),this.audio.play(`click`)}deleteSelected(){let e=this.selectionTarget();this.stroke=null,e&&this.remove(e)}get canUndo(){return this.undoStack.length>0}undoDelete(){let e=this.undoStack.pop();if(this.stroke=null,!e){this.events.emit(`message`,`Nothing to put back`);return}let t=null;for(let n of e.reverse()){if(n.kind===`conveyor`){let e=this.sim.placeConveyor(n.x,n.y,n.direction);e.ok||(t??=e.reason);continue}let e=this.sim.placeMachine(n.type,n.x,n.y,n.rotation,n.recipeId??void 0);if(!e.ok){t??=e.reason;continue}for(;e.value.level<n.level&&this.sim.upgradeMachine(e.value.id).ok;);}this.audio.play(t?`error`:`place`),t&&this.events.emit(`message`,`Could not put everything back: ${rg[t].toLowerCase()}`),this.events.emit(`undoChanged`,this.canUndo)}remember(e){let{factory:t}=this.sim.state;if(e.kind===`conveyor`){let n=t.conveyors.get(e.id);return n?{kind:`conveyor`,x:n.gridX,y:n.gridY,direction:n.direction}:null}let n=t.machines.get(e.id);return n?{kind:`machine`,type:n.type,x:n.gridX,y:n.gridY,rotation:n.rotation,recipeId:n.recipeId,level:n.level}:null}dropSelectionIf(e){this.selection?.id===e&&this.select(null)}selectionTarget(){if(!this.selection)return null;let{factory:e}=this.sim.state;if(this.selection.kind===`machine`){let t=e.machines.get(this.selection.id);if(!t)return null;let{w:n,h:r}=ye(P(t.type),t.rotation);return{kind:`machine`,id:t.id,x:t.gridX,y:t.gridY,w:n,h:r}}let t=e.conveyors.get(this.selection.id);return t?{kind:`conveyor`,id:t.id,x:t.gridX,y:t.gridY,w:1,h:1}:null}refreshSelectionOutline(){let e=this.selectionTarget();e?this.selectionEffect.show(e.x,e.y,e.w,e.h):this.selectionEffect.hide()}placeMachine(e,t){if(this.tool.mode!==`build`)return;let n=this.machineAnchor(e,t,this.tool.type,this.tool.rotation);if(!n)return;let r=this.sim.placeMachine(this.tool.type,n.x,n.y,this.tool.rotation,this.tool.recipeId);if(!r.ok){this.fail(r.reason);return}let{w:i,h:a}=ye(P(this.tool.type),this.tool.rotation);this.audio.play(`place`),this.effects.dust(lp(n.x)+(i-1)/2,0,up(n.y)+(a-1)/2,.95,14)}layConveyor(e,t,n,r){let i=this.sim.state.factory.conveyorAt(e,t);if(i){this.sim.setConveyorDirection(i.id,n)&&this.audio.play(`rotate`);return}let a=this.sim.placeConveyor(e,t,n);a.ok?(this.audio.play(`place`),this.effects.dust(lp(e),0,up(t),.3,5)):(r||a.reason===`cannot_afford`)&&this.fail(a.reason)}remove(e){let t=this.remember(e);this.sim.removeAt(e.x,e.y).ok&&(t&&(this.stroke||(this.stroke=[],this.undoStack.push(this.stroke),this.undoStack.length>ng&&this.undoStack.shift()),this.stroke.push(t),this.events.emit(`undoChanged`,!0)),this.audio.play(`remove`),this.effects.dust(lp(e.x)+(e.w-1)/2,0,up(e.y)+(e.h-1)/2,e.w*.4,e.kind===`machine`?14:5))}fail(e){this.audio.play(`error`),this.events.emit(`message`,rg[e])}cellAt(e,t){return this.camera.groundPoint(e,t,this.ground)?{x:Math.floor(dp(this.ground.x)),y:Math.floor(fp(this.ground.z))}:null}machineAnchor(e,t,n,r){if(!this.camera.groundPoint(e,t,this.ground))return null;let{w:i,h:a}=ye(P(n),r);return{x:Math.round(dp(this.ground.x)-i/2),y:Math.round(fp(this.ground.z)-a/2)}}targetAt(e,t){let{factory:n}=this.sim.state,r=this.machines.pick(this.camera.rayFrom(e,t)),i=r?n.machines.get(r):void 0,a=this.cellAt(e,t);if(!i&&a&&(i=n.machineAt(a.x,a.y)),i){let{w:e,h:t}=ye(P(i.type),i.rotation);return{kind:`machine`,id:i.id,x:i.gridX,y:i.gridY,w:e,h:t}}let o=a?n.conveyorAt(a.x,a.y):void 0;return o?{kind:`conveyor`,id:o.id,x:o.gridX,y:o.gridY,w:1,h:1}:null}refreshHover(){let e=this.lastNdc;if(this.buildHover=null,this.hovered=null,!e){this.preview.hide();return}let t=this.tool,{factory:n,economy:r}=this.sim.state;if(t.mode===`build`&&t.type===`conveyor`){let i=this.cellAt(e.x,e.y);if(!i)return this.preview.hide();let a=n.conveyorAt(i.x,i.y)!==void 0,o=a||this.sim.canPlaceConveyor(i.x,i.y).ok;this.preview.showConveyor(i.x,i.y,t.rotation,o);let s=mm(`conveyor`);a||(this.buildHover={x:lp(i.x),z:up(i.y),cost:s,affordable:r.canAfford(s)});return}if(t.mode===`build`){let i=this.machineAnchor(e.x,e.y,t.type,t.rotation);if(!i)return this.preview.hide();let a=P(t.type),o=this.sim.canPlaceMachine(t.type,i.x,i.y,t.rotation).ok,s=Se(a,i.x,i.y,t.rotation).map(e=>e.type===`output`?Vm(n,e.x,e.y,e.side)!==null:Um(n,e.x,e.y,ce(e.side)));this.preview.showMachine(t.type,i.x,i.y,t.rotation,o,s);let{w:c,h:l}=ye(a,t.rotation),u=mm(t.type);this.buildHover={x:lp(i.x)+(c-1)/2,z:up(i.y)+(l-1)/2,cost:u,affordable:r.canAfford(u)};return}if(t.mode===`paste`){let n=this.blueprintAnchor(e.x,e.y,t.blueprint);if(!n)return this.preview.hide();let i=this.sim.canPlaceBlueprint(t.blueprint,n.x,n.y).ok;this.preview.showBlueprint(t.blueprint,n.x,n.y,i);let a=Sm(t.blueprint);this.buildHover={x:lp(n.x)+(t.blueprint.width-1)/2,z:up(n.y)+(t.blueprint.height-1)/2,cost:a,affordable:r.canAfford(a)};return}if(t.mode===`copy`){let t=this.cellAt(e.x,e.y);if(!t)return this.preview.hide();let n=this.copyStart??t;this.preview.showHighlight(Math.min(n.x,t.x),Math.min(n.y,t.y),Math.abs(t.x-n.x)+1,Math.abs(t.y-n.y)+1,`area`);return}let i=this.targetAt(e.x,e.y);if(i&&t.mode===`select`&&(this.hovered={kind:i.kind,id:i.id}),!i||t.mode===`select`&&i.id===this.selection?.id)return this.preview.hide();this.preview.showHighlight(i.x,i.y,i.w,i.h,t.mode===`delete`?`delete`:`hover`)}},ag=.28,og=new jo(.11,.07,.11),sg=new Xa({color:16765514});function cg(e){let t=[X(e.width-.16,.1,e.height-.16,0,.05,0,Z.slate)];for(let n of e.ports){let r=oe[n.side],i=r.x!==0,a=n.localX+.5-e.width/2+r.x*.35,o=n.localY+.5-e.height/2+r.y*.35,s=i?.3:.56,c=i?.56:.3,l=n.type===`input`?Z.inputGreen:Z.outputOrange;t.push(X(s,.3,c,a,.25,o,Z.slateDark)),t.push(X(s,.06,c,a,.43,o,l))}return t}var lg=class{root=new Ii;activity=0;pulse=0;popTime=ag;pips=[];shownLevel=1;started=!1;scratch=new U;constructor(e){this.addPart(e)}addPart(e,t=Zf){let n=new co(e,t);return n.castShadow=!0,n.receiveShadow=!0,this.root.add(n),n}playPlacement(){this.popTime=0}notify(e){this.pulse=1,this.onNotify(e)}showLevel(e){this.shownLevel=e.level;let t=e.level>1?e.level:0,{w:n,h:r}=ye(P(e.type),0);for(;this.pips.length<t;){let e=new co(og,sg);e.position.set(n/2-.22-this.pips.length*.17,.135,r/2-.14),this.root.add(e),this.pips.push(e)}this.pips.forEach((e,n)=>e.visible=n<t)}update(e,t,n,r,i){e.level!==this.shownLevel&&(this.showLevel(e),this.started&&this.playPlacement()),this.started=!0;let a=t*$m(e),o=e.enabled&&e.active?1:0;if(this.activity+=(o-this.activity)*Math.min(1,a*6),this.pulse=Math.max(0,this.pulse-a*2.5),this.popTime<ag){this.popTime=Math.min(this.popTime+n,ag);let e=this.popTime/ag,t=Math.max(.05,1+2.2*(e-1)**3+1.2*(e-1)**2);this.root.scale.set(t,.55+.45*t,t)}this.animate(e,a,r,i)}toWorld(e,t,n){return this.root.updateMatrixWorld(),this.root.localToWorld(this.scratch.set(e,t,n))}onNotify(e){}dispose(){}},ug=-.08,dg=1.2,fg=3,pg=null,mg=null,hg=null,gg=null;function _g(){let e=cg(P(`assembler`));return e.push(X(1.36,.52,1.36,0,.36,0,Z.teal)),e.push(X(1.44,.08,1.44,0,.66,0,Z.tealDark)),e.push(X(.56,.1,.56,0,.75,ug,Z.slateDark)),e.push(X(.14,1,.14,0,1.2,-.64,Z.yellow)),e.push(X(.14,1,.14,0,1.2,.48000000000000004,Z.yellow)),e.push(X(.26,.18,1.34,0,1.76,ug,Z.yellowDark)),e.push(Jf(.16,.16,.2,8,0,1.92,ug,Z.slateLight)),e.push(X(.1,.1,.1,-.26,.4,.7,Z.slateDark)),e.push(X(.1,.1,.1,.24,.3,.7,Z.slateDark)),Y(e)}function vg(){return Y([Jf(.08,.08,.6,8,0,.36,0,Z.steel),X(.42,.12,.42,0,0,0,Z.steelLight)])}var yg=class extends lg{press;bigGear;smallGear;lastStroke=0;constructor(){pg??=_g(),mg??=vg(),hg??=J(Yf(.32,10,.08),Z.brass),gg??=J(Yf(.2,6,.08),Z.steelLight),super(pg),this.press=this.addPart(mg),this.press.position.set(0,dg,ug),this.bigGear=this.addPart(hg),this.bigGear.position.set(-.26,.4,.74),this.smallGear=this.addPart(gg),this.smallGear.position.set(.24,.3,.74)}animate(e,t,n,r){this.bigGear.rotation.z+=t*2.2*this.activity,this.smallGear.rotation.z-=t*2.2*(10/6)*this.activity;let i=(e.active?Math.abs(Math.sin(e.progress*Math.PI*fg)):0)**6,a=dg-.36*i;if(this.press.position.y+=(a-this.press.position.y)*Math.min(1,t*30),i>.9&&this.lastStroke<=.9){let e=this.toWorld(0,.84,ug);r.sparks(e.x,e.y,e.z,4)}this.lastStroke=i}onNotify(e){let t=this.toWorld(0,.84,ug);e.sparks(t.x,t.y,t.z,8)}},bg=1024,xg=.115,Sg=.29,Cg=.07;function wg(){return Y([X(1,.11,.72,0,.055,0,Z.slate),X(1,.16,Cg,0,.08,.32499999999999996,Z.slateLight),X(1,.16,Cg,0,.08,-.32499999999999996,Z.slateLight)])}function Tg(){return new tc(1,Sg*2).rotateX(-Math.PI/2).translate(0,xg,0)}function Eg(e){let t=e===`A`?-.5:.5,n=Math.PI,r=e===`A`?Math.PI/2:Math.PI*1.5,i=.21000000000000002,a=.79;return{body:Y([J(Xf(.5,t,.14,.8600000000000001,n,r,0,.11,8),Z.slate),J(Xf(.5,t,.14,i,n,r,0,.16,8),Z.slateLight),J(Xf(.5,t,a,.8600000000000001,n,r,0,.16,8),Z.slateLight)]),belt:Xf(.5,t,i,a,n,r,0,xg,10,!0)}}function Dg(e,t){let n=e.width,r=e.getContext(`2d`);r.fillStyle=t.surface,r.fillRect(0,0,n,n),r.strokeStyle=t.chevron,r.lineWidth=9,r.lineCap=`round`,r.lineJoin=`round`;for(let e of[0,n/2])r.beginPath(),r.moveTo(e+16,30),r.lineTo(e+40,n/2),r.lineTo(e+16,n-30),r.stroke()}function Og(){let e=document.createElement(`canvas`);e.width=128,e.height=128,Dg(e,Te[0]);let t=new Do(e);return t.wrapS=Tt,t.wrapT=Tt,t.colorSpace=Jn,t.anisotropy=4,t}var kg=class{bodies;belts;beltTexture=Og();beltStyle=Te[0];dummy=new Fi;scroll=0;dirty=!0;constructor(e){let t=new hc({map:this.beltTexture,side:2}),n=Eg(`A`),r=Eg(`B`),i=(t,n,r)=>{let i=new xo(t,n,bg);return i.count=0,i.castShadow=r,i.receiveShadow=!0,i.frustumCulled=!1,e.add(i),i};this.bodies={straight:i(wg(),Zf,!0),cornerA:i(n.body,Qf,!0),cornerB:i(r.body,Qf,!0)},this.belts={straight:i(Tg(),t,!1),cornerA:i(n.belt,t,!1),cornerB:i(r.belt,t,!1)}}setBeltStyle(e){e!==this.beltStyle&&(this.beltStyle=e,Dg(this.beltTexture.image,e),this.beltTexture.needsUpdate=!0)}invalidate(){this.dirty=!0}update(e,t){this.scroll=(this.scroll+t*1)%1,this.beltTexture.offset.x=-this.scroll,this.dirty&&this.rebuild(e)}rebuild(e){this.dirty=!1;let t={straight:0,cornerA:0,cornerB:0};for(let n of e.conveyors.values()){let r=Wm(e,n),i=`straight`;r.kind===`corner`&&(i=r.from===N(n.direction,1)?`cornerA`:`cornerB`);let a=t[i]++;a>=bg||(this.dummy.position.set(lp(n.gridX),0,up(n.gridY)),this.dummy.rotation.set(0,pp(n.direction),0),this.dummy.updateMatrix(),this.bodies[i].setMatrixAt(a,this.dummy.matrix),this.belts[i].setMatrixAt(a,this.dummy.matrix))}for(let e of Object.keys(t)){let n=Math.min(t[e],bg);this.bodies[e].count=n,this.belts[e].count=n,this.bodies[e].instanceMatrix.needsUpdate=!0,this.belts[e].instanceMatrix.needsUpdate=!0}}},Ag=.52,jg=2501169;function Mg(e){return Ag*Math.sin(Math.PI*Math.min(Math.max(e,0),1))**.8}var Ng=null;function Pg(){let e=[X(1,.11,.72,0,.055,0,Z.slate),X(1,.012,.58,0,xg-.004,0,jg)];for(let t=0;t<8;t++){let n=t/8,r=(t+1)/8,i=xg+Mg(n),a=xg+Mg(r),o=Math.hypot(1/8,a-i)+.02,s=Math.atan2(a-i,1/8),c=(n+r)/2-.5,l=(i+a)/2,u=e=>e.rotateX(-s).translate(0,l,c);e.push(u(X(.58,.03,o,0,-.02,0,jg))),e.push(u(X(.07,.12,o,.325,.02,0,Z.yellow))),e.push(u(X(.07,.12,o,-.325,.02,0,Z.yellow)))}for(let t of[-.42,.42])for(let n of[-.2,.2]){let r=xg+Mg(n+.5)-.03;e.push(X(.08,r,.08,t,r/2,n,Z.slateLight))}return Y(e)}var Fg=class extends lg{constructor(){Ng??=Pg(),super(Ng)}animate(e){}},Ig=7036840,Lg=5326730,Rg=-.35,zg=.35,Bg=.5,Vg=-.2,Hg=null,Ug=null,Wg=null,Gg=null;function Kg(){let e=cg(P(`fabricator`));return e.push(X(2.3,.58,2.3,0,.39,0,Ig)),e.push(X(2.4,.08,2.4,0,.72,0,Lg)),e.push(X(.26,.5,2.2,-1.02,.6,0,Z.slate)),e.push(X(.9,.16,.9,Bg,.8400000000000001,Vg,Z.slateDark)),e.push(X(.7,.03,.7,Bg,.935,Vg,Z.steel)),e.push(X(.5,.6,.3,.6,1.06,-.92,Z.slateLight)),e.push(X(.5,.05,.32,.6,1.38,-.92,Z.yellow)),e.push(Jf(.34,.4,.3,12,Rg,.91,zg,Z.slateDark)),e.push(X(.5,.7,.4,.75,1.11,.85,Z.slateLight)),e.push(X(.36,.26,.04,.75,1.2,1.06,Z.glass)),Y(e)}function qg(){return Y([Jf(.2,.24,.24,10,0,.12,0,Z.yellow),X(.22,.5,.22,0,.42,0,Z.yellowDark)])}function Jg(){return Y([Jf(.14,.14,.3,10,0,0,0,Z.slateDark).rotateX(Math.PI/2),X(.7,.14,.16,.35,0,0,Z.yellow),Jf(.11,.11,.24,10,.7,0,0,Z.slateDark).rotateX(Math.PI/2),X(.12,.42,.12,.7,-.2,0,Z.yellowDark),X(.2,.08,.2,.7,-.44,0,Z.steelLight)])}var Yg=class extends lg{turret;arm;lamp;sparkTimer=0;constructor(){Hg??=Kg(),Ug??=qg(),Wg??=Jg(),Gg??=new rc(.07,8,6),super(Hg),this.turret=new Ii,this.turret.position.set(Rg,1.06,zg),this.root.add(this.turret);let e=new co(Ug,Xg(this));e.castShadow=!0,this.turret.add(e),this.arm=new co(Wg,Xg(this)),this.arm.castShadow=!0,this.arm.position.y=.69,this.turret.add(this.arm),this.lamp=new co(Gg,$f),this.lamp.position.set(.75,1.52,.85),this.root.add(this.lamp)}animate(e,t,n,r){let i=Math.atan2(.55,.85),a=i+1.3,o=Math.sin(n*1.7)*.22*this.activity,s=a+(i-a)*this.activity+o;this.turret.rotation.y+=(s-this.turret.rotation.y)*Math.min(1,t*5);let c=Math.max(0,Math.sin(n*5.2))*.32*this.activity;if(this.arm.rotation.z=.25-c,this.lamp.visible=e.enabled&&(this.activity<.5||Math.sin(n*8)>0),this.activity>.6&&(this.sparkTimer+=t,this.sparkTimer>.6)){this.sparkTimer=0;let e=this.toWorld(Bg,.9700000000000001,Vg);r.sparks(e.x,e.y,e.z,3)}}onNotify(e){let t=this.toWorld(Bg,.9700000000000001,Vg);e.sparks(t.x,t.y,t.z,10)}};function Xg(e){return e.root.children[0].material}var Zg=-.34,Qg=.3,$g=2,e_=new G(3807760),t_=new G(16757575),n_=null,r_=null;function i_(){let e=cg(P(`furnace`));return e.push(X(1.34,.96,1.34,0,.58,0,Z.brick)),e.push(X(1.4,.1,1.4,0,.72,0,Z.brickDark)),e.push(X(1.44,.12,1.44,0,1.12,0,Z.slate)),e.push(X(.74,.5,.08,.1,.42,.69,Z.slateDark)),e.push(X(.08,.5,.6,.69,.42,.28,Z.slateDark)),e.push(Jf(.19,.23,.8,10,Zg,1.58,Qg,Z.slateLight)),e.push(Jf(.25,.25,.08,10,Zg,1.96,Qg,Z.slateDark)),e.push(Jf(.07,.07,.34,8,.42,1.35,-.4,Z.steel)),e.push(X(.9,.12,.12,.03,1.5,-.4,Z.steel)),e.push(X(.12,.12,.58,Zg,1.5,-.1,Z.steel)),Y(e)}function a_(){return Y([X(.6,.36,.04,.1,.42,.735,16777215),X(.04,.36,.46,.735,.42,.28,16777215)])}var o_=class extends lg{glowMaterial=new Xa({color:e_});smokeTimer=0;constructor(){n_??=i_(),r_??=a_(),super(n_);let e=this.addPart(r_,this.glowMaterial);e.castShadow=!1}animate(e,t,n,r){let i=.82+Math.sin(n*7)*.1+Math.sin(n*17)*.05,a=Math.min(1,this.activity*i+this.pulse*.3);if(this.glowMaterial.color.lerpColors(e_,t_,a),this.activity>.4&&(this.smokeTimer+=t,this.smokeTimer>.22)){this.smokeTimer=0;let e=this.toWorld(Zg,$g,Qg);r.smoke(e.x,e.y,e.z)}}dispose(){this.glowMaterial.dispose()}},s_=new Map,c_=null;function l_(e,t){let n=P(e),r=[X(1,.11,1,0,.055,0,Z.slate),X(.84,.012,.84,0,xg-.004,0,2501169)];for(let e of[-.41,.41])for(let n of[-.41,.41])r.push(X(.18,.34,.18,e,.17,n,t)),r.push(X(.2,.04,.2,e,.36,n,Z.slateDark));for(let e of n.ports){let t=oe[e.side],n=e.type===`input`?Z.inputGreen:Z.outputOrange,i=t.x!==0;r.push(X(i?.07:.62,.02,i?.62:.07,t.x*.46,xg+.004,t.y*.46,n))}return Y(r)}function u_(){return Y([Jf(.2,.2,.01,16,0,0,0,Z.slateLight),X(.26,.012,.07,.02,.004,0,Z.yellow),X(.1,.012,.16,.13,.004,0,Z.yellow)])}var d_=class extends lg{pointer;outputSides;angle=0;constructor(e,t){let n=s_.get(e);n||(n=l_(e,t),s_.set(e,n)),c_??=u_(),super(n),this.pointer=this.addPart(c_),this.pointer.castShadow=!1,this.pointer.position.y=xg+.003,this.outputSides=P(e).ports.filter(e=>e.type===`output`).map(e=>e.side)}animate(e,t){let n=this.outputSides.length,r=-(this.outputSides[(e.routeIndex-1+n)%n]??0)*(Math.PI/2),i=Math.atan2(Math.sin(r-this.angle),Math.cos(r-this.angle));this.angle+=i*Math.min(1,t*14),this.pointer.rotation.y=this.angle}},f_=class extends d_{constructor(){super(`merger`,Z.teal)}},p_=-.32,m_=.3,h_=null,g_=null,__=null;function v_(){let e=cg(P(`miner`));e.push(Jf(.5,.54,.07,10,p_,.135,m_,Z.dirt)),e.push(J(new Io(.13,0).translate(.03999999999999998,.2,.5),Z.ore)),e.push(J(new Io(.1,0).translate(-.62,.19,.6),Z.ore)),e.push(J(new Io(.09,0).translate(-.22,.19,-.10000000000000003),9143695));for(let t of[-.42,.42])for(let n of[-.42,.42])e.push(X(.09,1.3,.09,p_+t,.75,m_+n,Z.yellow));return e.push(X(1.02,.1,1.02,p_,1.43,m_,Z.yellowDark)),e.push(X(.93,.07,.07,p_,.8,.72,Z.yellowDark)),e.push(X(.93,.07,.07,p_,.8,-.12,Z.yellowDark)),e.push(X(.5,.36,.5,p_,1.66,m_,Z.slateLight)),e.push(X(.7,.56,.74,.3,.38,-.5,Z.yellow)),e.push(X(.76,.08,.8,.3,.7,-.5,Z.slate)),e.push(Jf(.36,.2,.26,4,.3,.87,-.5,Z.slateLight).rotateY(0)),e.push(X(.14,.14,.7,.1,.62,-.05,Z.steel)),Y(e)}function y_(){return Y([Jf(.07,.07,1,8,0,.9,0,Z.steel),Jf(.16,.16,.12,8,0,.66,0,Z.slateDark),J(new Po(.27,.52,6).rotateX(Math.PI).translate(0,.38,0),Z.steelLight)])}var b_=class extends lg{drill;lamps=[];dustTimer=0;constructor(){h_??=v_(),g_??=y_(),__??=new rc(.06,8,6),super(h_),this.drill=this.addPart(g_),this.drill.position.set(p_,0,m_);for(let[e,t]of[[-.04999999999999999,.5700000000000001],[-.5900000000000001,.5700000000000001]]){let n=new co(__,$f);n.position.set(e,1.52,t),this.root.add(n),this.lamps.push(n)}}animate(e,t,n,r){this.drill.rotation.y-=t*9*this.activity,this.drill.position.y=Math.sin(n*5)*.035*this.activity,this.root.position.y=Math.sin(n*47)*.006*this.activity;let i=e.enabled&&(this.activity<.5||Math.sin(n*6)>-.3);for(let e of this.lamps)e.visible=i;if(this.activity>.6&&(this.dustTimer+=t,this.dustTimer>.4)){this.dustTimer=0;let e=this.toWorld(p_,.15,m_);r.dust(e.x,e.y,e.z,.3,3)}}onNotify(e){let t=this.toWorld(.3,.95,-.5);e.dust(t.x,t.y,t.z,.12,4)}},x_=.14,S_=1.86,C_=null,w_=null,T_=null;function E_(){let e=cg(P(`seller`));return e.push(X(1.2,.8,1.4,x_,.5,0,Z.cream)),e.push(X(.05,.5,.36,.75,.35,.34,Z.wood)),e.push(X(.05,.28,.4,.75,.56,-.28,Z.glass)),e.push(X(.36,.28,.05,.24000000000000002,.56,.71,Z.glass)),e.push(X(1.46,.1,1.66,x_,.95,0,Z.red)),e.push(X(1.06,.1,1.66,x_,1.05,0,Z.redDark)),e.push(X(.6,.1,1.66,x_,1.15,0,Z.red)),e.push(Jf(.05,.05,.42,6,x_,1.4,0,Z.slateLight)),e.push(X(.2,.5,1.2,-.56,.6,0,Z.slate)),Y(e)}function D_(){return Y([Jf(.28,.28,.07,16,0,0,0,Z.gold).rotateX(Math.PI/2),Jf(.19,.19,.09,16,0,0,0,Z.brass).rotateX(Math.PI/2)])}var O_=class extends lg{coin;shutter;spin=0;constructor(){C_??=E_(),w_??=D_(),T_??=X(.06,.2,1.16,0,-.1,0,Z.yellow),super(C_),this.coin=this.addPart(w_),this.coin.position.set(x_,S_,0),this.shutter=this.addPart(T_),this.shutter.position.set(-.68,.84,0)}animate(e,t,n){this.spin+=t*(e.enabled?1.2:0)+t*this.pulse*14,this.coin.rotation.y=this.spin,this.coin.position.y=S_+Math.sin(n*2)*.03+Math.sin(this.pulse*Math.PI)*.22,this.shutter.rotation.z=-Math.sin(this.pulse*Math.PI)*.9}onNotify(e){let t=this.toWorld(x_,S_,0);e.coin(t.x,t.y,t.z)}},k_=class extends d_{constructor(){super(`splitter`,Z.yellow)}},A_=8359592,j_=6977680,M_=.62,N_=.24,P_=null,F_=null,I_=new Xa({color:7000445});function L_(){let e=cg(P(`storage`));e.push(X(1.36,.92,2.36,0,.56,.16,A_));for(let t=0;t<6;t++){let n=-.84+t*.4;e.push(X(1.4,.92,.06,0,.56,n,j_))}return e.push(X(1.48,.1,2.48,0,1.07,.16,Z.slate)),e.push(X(1,.1,2.48,0,1.17,.16,Z.slateLight)),e.push(X(.05,.62,.8,.69,.41,.75,Z.yellowDark)),e.push(X(.06,.05,.86,.7,.74,.75,Z.slateDark)),e.push(X(.3,.3,.3,-.45,.25,1.36,Z.wood)),e.push(X(.24,.24,.24,-.1,.22,1.38,9200192)),e.push(X(.05,.74,.26,.69,.55,-.3,Z.slateDark)),e.push(X(.26,.74,.05,.3,.55,1.35,Z.slateDark)),Y(e)}function R_(){return Y([X(.04,1,.16,.705,.5,-.3,16777215),X(.16,1,.04,.3,.5,1.365,16777215)])}var z_=class extends lg{gauge;capacity;shown=0;constructor(){P_??=L_(),F_??=R_(),super(P_),this.capacity=P(`storage`).storageCapacity??1,this.gauge=this.addPart(F_,I_),this.gauge.castShadow=!1,this.gauge.position.y=N_,this.gauge.scale.y=.001}animate(e,t){let n=e.stored.length/this.capacity;this.shown+=(n-this.shown)*Math.min(1,Math.max(t,.016)*8),this.gauge.scale.y=Math.max(this.shown*M_,.001)}},B_=1.15,V_=15659509,H_=null,U_=null;function W_(){let e=cg(P(`wind_turbine`));return e.push(Jf(.5,.58,.16,12,0,.18,0,9278364)),e.push(X(.42,.42,.34,.52,.31,.5,Z.slateLight)),e.push(X(.44,.05,.36,.52,.54,.5,Z.yellow)),e.push(Jf(.1,.2,2.5,10,0,1.51,0,V_)),e.push(X(.6,.26,.28,-.08,2.7600000000000002,0,V_)),e.push(X(.14,.2,.22,-.42,2.7600000000000002,0,Z.red)),Y(e)}function G_(){let e=[Jf(.13,.13,.16,10,0,0,0,Z.slateLight).rotateZ(Math.PI/2)];for(let t=0;t<3;t++){let n=X(.05,B_,.16,.02,.6549999999999999,0,V_);n.rotateX(t*Math.PI*2/3),e.push(n)}return Y(e)}var K_=class extends lg{rotor;spin=0;constructor(){H_??=W_(),U_??=G_(),super(H_),this.rotor=this.addPart(U_),this.rotor.position.set(.3,2.7600000000000002,0)}animate(e,t){this.spin+=(+!!e.enabled-this.spin)*Math.min(1,t*1.5),this.rotor.rotation.x+=t*2.4*this.spin}},q_={miner:()=>new b_,furnace:()=>new o_,assembler:()=>new yg,fabricator:()=>new Yg,seller:()=>new O_,splitter:()=>new k_,merger:()=>new f_,bridge:()=>new Fg,storage:()=>new z_,wind_turbine:()=>new K_};function J_(e){let t=q_[e];if(!t)throw Error(`No visual registered for machine type "${e}"`);return t()}function Y_(e,t){let{w:n,h:r}=ye(P(e.type),e.rotation);return t.set(lp(e.gridX)+(n-1)/2,0,up(e.gridY)+(r-1)/2)}var X_=class{effects;group=new Ii;visuals=new Map;center=new U;constructor(e,t){this.effects=t,e.add(this.group)}add(e,t){let n=J_(e.type);n.root.userData.machineId=e.id,this.visuals.set(e.id,n),this.group.add(n.root),this.updateTransform(e),t&&n.playPlacement()}remove(e){let t=this.visuals.get(e.id);t&&(this.group.remove(t.root),t.dispose(),this.visuals.delete(e.id))}updateTransform(e){let t=this.visuals.get(e.id);t&&(Y_(e,this.center),t.root.position.set(this.center.x,0,this.center.z),t.root.rotation.y=pp(e.rotation))}notify(e){this.visuals.get(e)?.notify(this.effects)}update(e,t,n,r,i){for(let[a,o]of this.visuals){let s=e.machines.get(a);if(!s)continue;let c=P(s.type).behavior===`crafter`;o.update(s,c?t*i:t,n,r,this.effects)}}pick(e){let t=e.intersectObjects(this.group.children,!0)[0]?.object??null;for(;t;){if(typeof t.userData.machineId==`string`)return t.userData.machineId;t=t.parent}return null}get count(){return this.visuals.size}},Z_=1300,Q_=.25,$_=new G(4906624),ev=new G(16498468),tv=new G(16281969),nv=class{mesh;dummy=new Fi;center=new U;color=new G;timer=Q_;enabled=!1;constructor(e){this.mesh=new xo(new tc(1,1).rotateX(-Math.PI/2),new Xa({transparent:!0,opacity:.6,depthWrite:!1}),Z_),this.mesh.count=0,this.mesh.frustumCulled=!1,this.mesh.renderOrder=4,this.mesh.visible=!1,this.mesh.setColorAt(0,$_),e.add(this.mesh)}get isEnabled(){return this.enabled}setEnabled(e){this.enabled=e,this.mesh.visible=e,this.timer=Q_}update(e,t,n){if(!this.enabled||(this.timer+=n,this.timer<Q_))return;this.timer=0;let r=0,i=(e,t,n,i,a,o)=>{r>=Z_||(this.dummy.position.set(e,t,n),this.dummy.scale.set(i,1,a),this.dummy.updateMatrix(),this.mesh.setMatrixAt(r,this.dummy.matrix),this.mesh.setColorAt(r,o),r++)};for(let n of e.machines.values()){let e=P(n.type);if(e.behavior!==`crafter`||!n.enabled)continue;let r=t.shares(n.id);if(r.observed<3)continue;let a=Math.min(Math.max((r.working-.5)/.5,0),1);a>=.5?this.color.lerpColors(ev,$_,(a-.5)*2):this.color.lerpColors(tv,ev,a*2);let{w:o,h:s}=ye(e,n.rotation);Y_(n,this.center),i(this.center.x,.014,this.center.z,o+.5,s+.5,this.color)}for(let t of e.conveyors.values()){let e=t.items[0];!e||e.progress<1-1e-6||t.items.length<2||i(lp(t.gridX),.2,up(t.gridY),.9,.9,tv)}this.mesh.count=r,this.mesh.instanceMatrix.needsUpdate=!0,this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}},rv=class e{config;mesh;data;count=0;dummy=new Fi;static STRIDE=10;constructor(t,n){this.config=n,this.data=new Float32Array(n.capacity*e.STRIDE),this.mesh=new xo(n.geometry,n.material,n.capacity),this.mesh.count=0,this.mesh.frustumCulled=!1,t.add(this.mesh)}spawn(t,n,r,i,a,o,s,c){if(this.count>=this.config.capacity)return;let l=this.count++*e.STRIDE,u=this.data;u[l]=t,u[l+1]=n,u[l+2]=r,u[l+3]=i,u[l+4]=a,u[l+5]=o,u[l+6]=0,u[l+7]=s,u[l+8]=c,u[l+9]=Math.random()*Math.PI*2}update(t){let{STRIDE:n}=e,{gravity:r,drag:i,scaleOverLife:a,spin:o}=this.config,s=this.data,c=i**+t,l=0;for(;l<this.count;){let e=l*n;if(s[e+6]+=t,s[e+6]>=s[e+7]){this.count--,s.copyWithin(e,this.count*n,(this.count+1)*n);continue}s[e+4]-=r*t,s[e+3]*=c,s[e+4]*=c,s[e+5]*=c,s[e]+=s[e+3]*t,s[e+1]+=s[e+4]*t,s[e+2]+=s[e+5]*t;let i=s[e+6]/s[e+7];this.dummy.position.set(s[e],s[e+1],s[e+2]),this.dummy.scale.setScalar(Math.max(s[e+8]*a(i),1e-4));let u=s[e+9]+s[e+6]*o;this.dummy.rotation.set(u,u*.7,0),this.dummy.updateMatrix(),this.mesh.setMatrixAt(l,this.dummy.matrix),l++}this.mesh.count=this.count,this.mesh.instanceMatrix.needsUpdate=!0}},iv=(e,t)=>e+Math.random()*(t-e),av=e=>e<.25?.4+e/.25*.6:1-((e-.25)/.75)**2,ov=e=>1-e*e,sv=class{smokePool;dustPool;sparkPool;coinPool;constructor(e){let t=new ec(.5,0);this.smokePool=new rv(e,{geometry:t,material:new Xa({color:15262942,transparent:!0,opacity:.55,depthWrite:!1}),capacity:400,gravity:-.15,drag:.6,scaleOverLife:av,spin:.4}),this.dustPool=new rv(e,{geometry:t,material:new Xa({color:14208959,transparent:!0,opacity:.6,depthWrite:!1}),capacity:300,gravity:.2,drag:.08,scaleOverLife:av,spin:.6}),this.sparkPool=new rv(e,{geometry:new jo(.5,.5,1.4),material:new Xa({color:16760906}),capacity:300,gravity:6,drag:.5,scaleOverLife:ov,spin:9}),this.coinPool=new rv(e,{geometry:new No(.5,.5,.16,12).rotateX(Math.PI/2),material:new hc({color:16764736,emissive:7031296}),capacity:120,gravity:5,drag:.9,scaleOverLife:e=>e<.8?1:1-(e-.8)/.2,spin:7})}smoke(e,t,n){this.smokePool.spawn(e+iv(-.04,.04),t,n+iv(-.04,.04),iv(.05,.25),iv(.5,.8),iv(-.1,.1),iv(1.4,2.1),iv(.22,.36))}dust(e,t,n,r,i){for(let a=0;a<i;a++){let o=a/i*Math.PI*2+iv(-.3,.3),s=iv(1.2,2.2);this.dustPool.spawn(e+Math.cos(o)*r,t+.08,n+Math.sin(o)*r,Math.cos(o)*s,iv(.2,.7),Math.sin(o)*s,iv(.35,.6),iv(.16,.28))}}sparks(e,t,n,r){for(let i=0;i<r;i++){let r=Math.random()*Math.PI*2,i=iv(.8,1.9);this.sparkPool.spawn(e,t,n,Math.cos(r)*i,iv(1.2,2.4),Math.sin(r)*i,iv(.3,.5),iv(.035,.06))}}coin(e,t,n){this.coinPool.spawn(e,t,n,iv(-.25,.25),iv(2.6,3.2),iv(-.25,.25),.75,.2)}update(e){this.smokePool.update(e),this.dustPool.update(e),this.sparkPool.update(e),this.coinPool.update(e)}},cv=1.1,lv=24,uv=class{labels=[];projected=new U;next=0;constructor(e){for(let t=0;t<lv;t++){let t=document.createElement(`div`);t.className=`floating-text`,t.style.display=`none`,e.appendChild(t),this.labels.push({element:t,position:new U,age:0,active:!1})}}spawn(e,t,n,r){let i=this.labels[this.next];this.next=(this.next+1)%lv,i.position.set(e,t,n),i.age=0,i.active=!0,i.element.textContent=r,i.element.style.display=`block`}update(e,t,n,r,i=!0){for(let a of this.labels){if(!a.active)continue;if(a.age+=e,a.age>=cv){a.active=!1,a.element.style.display=`none`;continue}let o=a.age/cv;this.projected.copy(a.position),i&&(this.projected.y+=o*.9),this.projected.project(t);let s=(this.projected.x*.5+.5)*n,c=(-this.projected.y*.5+.5)*r;a.element.style.transform=`translate(-50%, -50%) translate(${s.toFixed(1)}px, ${c.toFixed(1)}px)`,a.element.style.opacity=String(o<.7?1:1-(o-.7)/.3)}}},dv=.07,fv=96,pv=4906624,mv=16498468,hv=16281969,gv=class{group=new Ii;edges=[];material=new Xa({color:16777215,transparent:!0,opacity:.9,depthTest:!1});gauge=new Ii;gaugeFill;gaugeMaterial=new Xa({color:pv,transparent:!0,opacity:.95,depthTest:!1});shownShare=0;targetShare=null;constructor(e){let t=new jo(1,.04,1);for(let e=0;e<4;e++){let e=new co(t,this.material);e.renderOrder=10,this.edges.push(e),this.group.add(e)}let n=()=>new nc(.93,1,fv).rotateX(-Math.PI/2),r=new co(n(),new Xa({color:16777215,transparent:!0,opacity:.22,depthTest:!1}));r.renderOrder=9,this.gaugeFill=new co(n(),this.gaugeMaterial),this.gaugeFill.renderOrder=10,this.gauge.add(r,this.gaugeFill),this.gauge.visible=!1,this.group.add(this.gauge),this.group.visible=!1,e.add(this.group)}show(e,t,n,r){this.group.visible=!0,this.group.position.set(lp(e)+(n-1)/2,.03,up(t)+(r-1)/2);let[i,a,o,s]=this.edges;i.scale.set(n+dv,1,dv),i.position.set(0,0,-r/2),a.scale.set(n+dv,1,dv),a.position.set(0,0,r/2),o.scale.set(dv,1,r+dv),o.position.set(-n/2,0,0),s.scale.set(dv,1,r+dv),s.position.set(n/2,0,0);let c=Math.hypot(n,r)/2+.22;this.gauge.scale.set(c,1,c)}hide(){this.group.visible=!1}setEfficiency(e){e!==null&&this.targetShare===null&&(this.shownShare=e),this.targetShare=e,this.gauge.visible=e!==null}update(e){if(!this.group.visible||(this.material.opacity=.65+Math.sin(e*5)*.3,this.targetShare===null))return;this.shownShare+=(this.targetShare-this.shownShare)*.12;let t=Math.min(Math.max(this.shownShare,0),1);this.gaugeFill.geometry.setDrawRange(0,Math.round(t*fv)*6),this.gaugeMaterial.color.setHex(t>=.9?pv:t>=.6?mv:hv)}},_v=2048,vv=.16,yv=.14;function bv(){return{ore:{geometry:Y([J(new Io(.14,0).scale(1.1,.85,1),Z.ore),J(new Io(.07,0).translate(.08,.06,.05),9143695)]),lift:.11,spin:0,alignToTravel:!1},plate:{geometry:Y([J(new jo(.32,.05,.22),12831960),J(new jo(.27,.02,.17).translate(0,.035,0),14541802)]),lift:.03,spin:0,alignToTravel:!0},gear:{geometry:J(Yf(.15,8,.07).rotateX(Math.PI/2),Z.brass),lift:.04,spin:1.6,alignToTravel:!1},copper_ore:{geometry:Y([J(new Io(.14,0).scale(1,.85,1.1),11035196),J(new Io(.07,0).translate(-.07,.06,.06),6270614)]),lift:.11,spin:0,alignToTravel:!1},copper_plate:{geometry:Y([J(new jo(.32,.05,.22),14255186),J(new jo(.27,.02,.17).translate(0,.035,0),15639154)]),lift:.03,spin:0,alignToTravel:!0},wire:{geometry:Y([J(new ic(.1,.045,6,12).rotateX(Math.PI/2),15769696),J(new No(.05,.05,.1,8),8016438)]),lift:.05,spin:0,alignToTravel:!1},motor:{geometry:Y([J(new No(.11,.11,.22,10).rotateZ(Math.PI/2),4891573),J(new No(.115,.115,.05,10).rotateZ(Math.PI/2).translate(-.06,0,0),2910837),J(new No(.03,.03,.12,6).rotateZ(Math.PI/2).translate(.17,0,0),13489116),J(new jo(.2,.04,.24).translate(0,-.11,0),3883602)]),lift:.13,spin:0,alignToTravel:!0},steel:{geometry:Y([J(new jo(.34,.035,.2).translate(0,-.06,0),6123404),J(new jo(.34,.1,.05),5004406),J(new jo(.34,.035,.2).translate(0,.06,0),7308194)]),lift:.08,spin:0,alignToTravel:!0},circuit:{geometry:Y([J(new jo(.3,.03,.24),4171370),J(new jo(.12,.04,.12).translate(-.03,.035,0),3028032),J(new jo(.05,.035,.08).translate(.1,.03,.05),14723132),J(new jo(.05,.035,.05).translate(.1,.03,-.07),13489116)]),lift:.02,spin:0,alignToTravel:!0},computer:{geometry:Y([J(new jo(.26,.26,.24),14273972),J(new jo(.02,.15,.17).translate(.135,.02,0),2437180),J(new jo(.02,.02,.06).translate(.135,-.09,.06),7000445)]),lift:.13,spin:0,alignToTravel:!0},robot:{geometry:Y([J(new jo(.2,.2,.22).translate(0,.1,0),14840637),J(new jo(.16,.13,.17).translate(0,.27,0),15788760),J(new jo(.02,.04,.12).translate(.085,.28,0),2437180),J(new jo(.06,.16,.05).translate(0,.11,.14),9080729),J(new jo(.06,.16,.05).translate(0,.11,-.14),9080729),J(new No(.012,.012,.09,5).translate(0,.38,0),3883602),J(new rc(.025,6,5).translate(0,.43,0),16281969)]),lift:0,spin:0,alignToTravel:!0}}}var xv=class{batches=new Map;tracks=new Map;vanishing=[];dummy=new Fi;snapshotIndex=0;constructor(e){let t=bv();for(let n of f){let r=t[n.icon];if(!r)throw Error(`No item visual for icon "${n.icon}"`);let i=new xo(r.geometry,Zf,_v);i.count=0,i.castShadow=!0,i.frustumCulled=!1,e.add(i),this.batches.set(n.id,{mesh:i,spec:r,count:0})}}snapshot(e,t=!0){this.snapshotIndex++;for(let n of e.conveyors.values())for(let e of n.items)Cv(e,n.direction),this.record(e,Sv.x,Sv.z,n.direction,t);for(let n of e.machines.values()){if(n.transit.length===0)continue;let e=P(n.type).behavior===`bridge`;for(let r of n.transit)if(e){let e=oe[r.from];Sv.x=lp(r.tileX)+e.x*(r.progress-.5),Sv.z=up(r.tileY)+e.y*(r.progress-.5);let i=(r.from+n.rotation)%2==1;this.record(r,Sv.x,Sv.z,r.from,t,i?Mg(r.progress):0)}else wv(r),this.record(r,Sv.x,Sv.z,r.to??r.from,t)}for(let[e,n]of this.tracks)n.seenAt!==this.snapshotIndex&&(this.tracks.delete(e),t&&this.vanishing.length<256&&this.vanishing.push({id:e,resourceId:n.resourceId,x:n.x,z:n.z,vx:n.x-n.prevX,vz:n.z-n.prevZ,yaw:n.yaw,time:0}))}record(e,t,n,r,i,a=0){let o=this.tracks.get(e.id);if(!o)o={resourceId:e.resourceId,x:t,z:n,prevX:t,prevZ:n,y:a,prevY:a,yaw:-r*(Math.PI/2),age:i?0:vv,seenAt:0},this.tracks.set(e.id,o);else{o.prevX=o.x,o.prevZ=o.z,o.prevY=o.y,o.x=t,o.z=n,o.y=a;let e=t-o.prevX,r=n-o.prevZ;e*e+r*r>1e-8&&(o.yaw=Math.atan2(-r,e))}o.seenAt=this.snapshotIndex}resetTracks(e){this.tracks.clear(),this.vanishing.length=0,this.snapshot(e,!1)}update(e,t,n){for(let e of this.batches.values())e.count=0;for(let[r,i]of this.tracks){i.age+=n;let a=Math.min(i.age/vv,1);this.place(i.resourceId,r,i.prevX+(i.x-i.prevX)*e,i.prevZ+(i.z-i.prevZ)*e,i.yaw,t,i.prevY+(i.y-i.prevY)*e,1-(1-a)*(1-a))}for(let e=this.vanishing.length-1;e>=0;e--){let r=this.vanishing[e];r.time+=n;let i=r.time/yv;if(i>=1){this.vanishing[e]=this.vanishing[this.vanishing.length-1],this.vanishing.pop();continue}let a=1+i*2.5;this.place(r.resourceId,r.id,r.x+r.vx*a,r.z+r.vz*a,r.yaw,t,0,1-i)}for(let e of this.batches.values())e.mesh.count=e.count,e.mesh.instanceMatrix.needsUpdate=!0}place(e,t,n,r,i,a,o,s){let c=this.batches.get(e);if(!c||c.count>=_v)return;let{spec:l}=c;this.dummy.position.set(n,xg+o+l.lift*s,r);let u=l.alignToTravel?i:l.spin===0?t*2.4:a*l.spin+t;this.dummy.rotation.set(0,u,0),this.dummy.scale.setScalar(Math.max(s,.001)),this.dummy.updateMatrix(),c.mesh.setMatrixAt(c.count++,this.dummy.matrix)}get visibleCount(){return this.tracks.size}},Sv={x:0,z:0};function Cv(e,t){let n=oe[e.from],r=oe[t],i=e.progress,a=(1-i)*(1-i),o=i*i;Sv.x=lp(e.tileX)+(-a*n.x+o*r.x)*.5,Sv.z=up(e.tileY)+(-a*n.y+o*r.y)*.5}function wv(e){let t=e.progress,n=lp(e.tileX),r=up(e.tileY);if(t<.5||e.to===void 0){let i=oe[e.from],a=.5-Math.min(t,.5);Sv.x=n-i.x*a,Sv.z=r-i.y*a}else{let i=oe[e.to];Sv.x=n+i.x*(t-.5),Sv.z=r+i.y*(t-.5)}}var Tv=4906624,Ev=16281969,Dv=5882730,Ov=16751932,kv=6333946;function Av(){let e=new Ra;return e.setAttribute(`position`,new Ea([.2,0,0,-.14,0,-.2,-.14,0,.2],3)),e}var jv=class{group=new Ii;ghostMaterial=new Xa({color:Tv,transparent:!0,opacity:.45,depthWrite:!1});footprintMaterial=new Xa({color:Tv,transparent:!0,opacity:.28,depthWrite:!1});footprint;machineGhosts=new Map;conveyorGhost;arrows=[];arrowGeometry=Av();inputMaterial=new Xa({color:Dv,side:2});outputMaterial=new Xa({color:Ov,side:2});inputIdleMaterial=new Xa({color:Dv,side:2,transparent:!0,opacity:.4});outputIdleMaterial=new Xa({color:Ov,side:2,transparent:!0,opacity:.4});activeGhost=null;blueprintGhost=null;conveyorGhostGeometry=wg();constructor(e){this.footprint=new co(new tc(1,1).rotateX(-Math.PI/2),this.footprintMaterial),this.footprint.renderOrder=5,this.group.add(this.footprint),this.conveyorGhost=new Ii,this.conveyorGhost.add(new co(wg(),this.ghostMaterial));let t=new co(this.arrowGeometry,this.outputMaterial);t.position.y=.2,t.scale.setScalar(1.3),this.conveyorGhost.add(t),this.conveyorGhost.visible=!1,this.group.add(this.conveyorGhost),this.group.visible=!1,e.add(this.group)}machineGhost(e){let t=this.machineGhosts.get(e);return t||(t=J_(e).root,t.traverse(e=>{e instanceof co&&(e.material=this.ghostMaterial,e.castShadow=!1,e.receiveShadow=!1)}),t.visible=!1,this.machineGhosts.set(e,t),this.group.add(t)),t}setFootprint(e,t,n,r,i,a){this.footprint.position.set(lp(e)+(n-1)/2,.012,up(t)+(r-1)/2),this.footprint.scale.set(n,1,r),this.footprintMaterial.color.setHex(i),this.footprintMaterial.opacity=a,this.footprint.visible=!0}activate(e){this.activeGhost&&this.activeGhost!==e&&(this.activeGhost.visible=!1),this.activeGhost=e,e&&(e.visible=!0),this.group.visible=!0}hideArrows(e){for(let t=e;t<this.arrows.length;t++)this.arrows[t].visible=!1}showMachine(e,t,n,r,i,a=[]){let o=P(e),{w:s,h:c}=ye(o,r),l=this.machineGhost(e);l.position.set(lp(t)+(s-1)/2,0,up(n)+(c-1)/2),l.rotation.y=pp(r),this.activate(l);let u=i?Tv:Ev;this.ghostMaterial.color.setHex(u),this.setFootprint(t,n,s,c,u,.28);let d=o.behavior===`bridge`?[]:Se(o,t,n,r);d.forEach((e,t)=>{let n=this.arrows[t];n||(n=new co(this.arrowGeometry,this.inputMaterial),n.renderOrder=6,this.arrows.push(n),this.group.add(n));let r=a[t]===!0;e.type===`input`?n.material=r?this.inputMaterial:this.inputIdleMaterial:n.material=r?this.outputMaterial:this.outputIdleMaterial,n.scale.setScalar(r?1.5:1),n.position.set(lp(e.outerX),.03,up(e.outerY)),n.rotation.y=pp(e.side)+(e.type===`input`?Math.PI:0),n.visible=!0}),this.hideArrows(d.length)}showConveyor(e,t,n,r){this.conveyorGhost.position.set(lp(e),0,up(t)),this.conveyorGhost.rotation.y=pp(n),this.activate(this.conveyorGhost);let i=r?Tv:Ev;this.ghostMaterial.color.setHex(i),this.setFootprint(e,t,1,1,i,.28),this.hideArrows(0)}showHighlight(e,t,n,r,i){this.activate(null);let a=i===`delete`?Ev:i===`area`?kv:16777215;this.setFootprint(e,t,n,r,a,i===`hover`?.22:i===`area`?.4:.5),this.hideArrows(0)}showBlueprint(e,t,n,r){if(this.blueprintGhost?.source!==e){this.blueprintGhost&&this.group.remove(this.blueprintGhost.group);let t=new Ii;for(let n of e.machines){let{w:e,h:r}=ye(P(n.type),n.rotation),i=J_(n.type).root;i.traverse(e=>{e instanceof co&&(e.material=this.ghostMaterial,e.castShadow=!1,e.receiveShadow=!1)}),i.position.set(n.x+(e-1)/2,0,n.y+(r-1)/2),i.rotation.y=pp(n.rotation),t.add(i)}for(let n of e.conveyors){let e=new co(this.conveyorGhostGeometry,this.ghostMaterial);e.position.set(n.x,0,n.y),e.rotation.y=pp(n.direction),t.add(e)}t.visible=!1,this.group.add(t),this.blueprintGhost={source:e,group:t}}let{group:i}=this.blueprintGhost;i.position.set(lp(t),0,up(n)),this.activate(i);let a=r?Tv:Ev;this.ghostMaterial.color.setHex(a),this.setFootprint(t,n,e.width,e.height,a,.2),this.hideArrows(0)}hide(){this.group.visible=!1}},Mv=256,Nv=2.45,Pv=1.7,Fv=class{meshes=new Map;counts=new Map;dummy=new Fi;center=new U;constructor(e){let t=bv();for(let n of f){let r=new xo(t[n.icon].geometry,Zf,Mv);r.count=0,r.frustumCulled=!1,e.add(r),this.meshes.set(n.id,r)}}update(e,t){for(let e of this.meshes.keys())this.counts.set(e,0);for(let n of e.machines.values()){if(!n.recipeId||P(n.type).behavior!==`crafter`)continue;let e=Ge(n.recipeId).outputs[0]?.resourceId,r=e?this.meshes.get(e):void 0;if(!r||!e)continue;let i=this.counts.get(e)??0;if(i>=Mv)continue;Y_(n,this.center);let a=this.center.x*.7+this.center.z*.4;this.dummy.position.set(this.center.x,Nv+Math.sin(t*1.6+a)*.05,this.center.z),this.dummy.rotation.set(0,t*.9+a,0),this.dummy.scale.setScalar(n.enabled?Pv:Pv*.6),this.dummy.updateMatrix(),r.setMatrixAt(i,this.dummy.matrix),this.counts.set(e,i+1)}for(let[e,t]of this.meshes)t.count=this.counts.get(e)??0,t.instanceMatrix.needsUpdate=!0}},Iv=256,Lv=3,Rv=3;function zv(e){let t=document.createElement(`canvas`);t.width=96,t.height=96;let n=t.getContext(`2d`);if(n.beginPath(),n.arc(48,48,43,0,Math.PI*2),n.fillStyle=e===`waiting`?`#ffb547`:`#f2605a`,n.fill(),n.lineWidth=6,n.strokeStyle=`#1b202a`,n.stroke(),n.fillStyle=`#1b202a`,e===`waiting`)for(let e of[28,48,68])n.beginPath(),n.arc(e,48,7,0,Math.PI*2),n.fill();else n.fillRect(42,22,12,34),n.beginPath(),n.arc(48,70,7,0,Math.PI*2),n.fill();let r=new Do(t);return r.colorSpace=Jn,r}var Bv=class{meshes;dummy=new Fi;center=new U;constructor(e){let t=new tc(.62,.62),n=n=>{let r=new xo(t,new Xa({map:zv(n),transparent:!0,depthTest:!1}),Iv);return r.count=0,r.frustumCulled=!1,r.renderOrder=8,e.add(r),r};this.meshes={waiting:n(`waiting`),output_full:n(`output_full`)}}update(e,t,n,r){let i={waiting:0,output_full:0};for(let a of e.machines.values()){if(!a.enabled)continue;let e=t.stall(a.id);if(!e||e.seconds<Lv||i[e.kind]>=Iv)continue;Y_(a,this.center);let o=Math.min((e.seconds-Lv)*5,1);this.dummy.position.set(this.center.x,Rv+Math.sin(r*3+this.center.x)*.06,this.center.z),this.dummy.quaternion.copy(n.quaternion),this.dummy.scale.setScalar(o),this.dummy.updateMatrix(),this.meshes[e.kind].setMatrixAt(i[e.kind]++,this.dummy.matrix)}for(let e of Object.keys(i))this.meshes[e].count=i[e],this.meshes[e].instanceMatrix.needsUpdate=!0}};function Vv(e,t,n){let r=Math.min(Math.floor(t),n);return e.kind===`milestone`?`${Am(r)} / ${Am(n)}`:`${r.toLocaleString(`en-US`)} / ${n.toLocaleString(`en-US`)}`}var Hv=class{sim;onOpenChange;overlay;count;cards=[];constructor(e,t,n){this.sim=t,this.onOpenChange=n;let r=(e,t)=>{let n=Q(`div`,{class:`achievement-grid`});for(let e of ze.filter(e=>e.kind===t)){let t=Q(`div`,{class:`progress-fill`}),r=Q(`span`,{class:`achievement-status`}),i=Q(`div`,{class:`achievement`},[Q(`div`,{class:`achievement-head`},[Q(`h3`,{class:`achievement-name`,text:e.name}),Q(`span`,{class:`achievement-reward`,text:`+${Am(e.reward)}`})]),Q(`p`,{class:`achievement-description`,text:e.description}),Q(`div`,{class:`progress`},[t]),r]);n.append(i),this.cards.push({achievement:e,root:i,fill:t,status:r})}return[Q(`h3`,{class:`modal-subtitle`,text:e}),n]};this.count=Q(`span`,{class:`muted`});let i=Q(`div`,{class:`modal achievements-modal`,attrs:{role:`dialog`,"aria-label":`Achievements`}},[Q(`div`,{class:`panel-header`},[Q(`h2`,{class:`panel-title`,text:`Achievements`}),this.count,Q(`button`,{class:`panel-close`,text:`×`,title:`Close (Esc)`,attrs:{type:`button`,"aria-label":`Close`},onClick:()=>this.close()})]),...r(`Milestones`,`milestone`),...r(`Achievements`,`achievement`)]);this.overlay=Q(`div`,{class:`overlay hidden`},[i]),this.overlay.addEventListener(`click`,e=>{e.target===this.overlay&&this.close()}),window.addEventListener(`keydown`,e=>{this.isOpen&&!this.justOpened&&(e.code===`Escape`||e.code===`KeyG`)&&(e.stopPropagation(),this.close())}),e.append(this.overlay)}justOpened=!1;get isOpen(){return $p(this.overlay)}toggle(e){this.isOpen?this.close():this.open(e)}open(e){tm(this.overlay,e),this.justOpened=!0,window.setTimeout(()=>this.justOpened=!1,0),this.update(),this.onOpenChange(!0)}close(){nm(this.overlay),this.onOpenChange(!1)}update(){if(!this.isOpen)return;let e=this.sim.state.achievements;$(this.count,`${e.length} / ${ze.length}`);for(let t of this.cards){let n=e.includes(t.achievement.id);if(t.root.dataset.done=String(n),n){t.fill.style.width=`100%`,$(t.status,`Unlocked`);continue}let{current:r,target:i}=t.achievement.progress(this.sim);t.fill.style.width=`${Math.round(Math.min(r/i,1)*100)}%`,$(t.status,i===1?`Not yet`:Vv(t.achievement,r,i))}}},Uv=class{library;placement;onClick;panel;list;saveButton;hint;costs=[];shownKey=``;constructor(e,t,n,r){this.library=t,this.placement=n,this.onClick=r,this.list=Q(`div`,{class:`blueprint-list`}),this.hint=Q(`p`,{class:`panel-description`}),this.saveButton=Q(`button`,{class:`button primary`,text:`Save what I copied`,attrs:{type:`button`},onClick:()=>{let e=this.placement.clipboard;e&&(this.onClick(),this.library.add(e),this.rebuild())}}),this.panel=Q(`div`,{class:`blueprints-panel hidden`},[Q(`h2`,{class:`panel-title`,text:`Blueprints`}),this.hint,this.saveButton,this.list]),e.append(this.panel)}toggle(e){if(this.visible)return this.hide();tm(this.panel,e),this.shownKey=``}hide(){nm(this.panel)}get visible(){return $p(this.panel)}row(e){let t=Q(`input`,{class:`blueprint-name`,attrs:{type:`text`,value:e.name,maxlength:`30`,"aria-label":`Blueprint name`}});t.addEventListener(`change`,()=>{this.library.rename(e.id,t.value),t.value=this.library.all.find(t=>t.id===e.id)?.name??t.value}),t.addEventListener(`keydown`,e=>{(e.code===`Enter`||e.code===`Escape`)&&t.blur()});let n=Sm(e.blueprint),r=Q(`span`,{class:`blueprint-cost`,text:Am(n)});return this.costs.push({element:r,cost:n}),Q(`div`,{class:`blueprint`},[t,Q(`div`,{class:`blueprint-footer`},[Q(`span`,{class:`blueprint-summary`,text:`${wm(e.blueprint)} · ${e.blueprint.width}×${e.blueprint.height}`}),r,Q(`button`,{class:`button`,text:`Place`,attrs:{type:`button`},onClick:()=>{this.onClick(),this.placement.startPaste(e.blueprint),this.hide()}}),Q(`button`,{class:`button danger`,text:`×`,title:`Delete this blueprint`,attrs:{type:`button`,"aria-label":`Delete ${e.name}`},onClick:()=>{this.onClick(),this.library.remove(e.id),this.rebuild()}})])])}rebuild(){this.costs=[],this.list.replaceChildren(...this.library.all.map(e=>this.row(e))),this.shownKey=``}update(e){if(!this.visible)return;let t=this.placement.clipboard,n=this.library.all.map(e=>e.id).join(`,`);n!==this.shownKey&&(this.rebuild(),this.shownKey=n),this.saveButton.disabled=!t||this.library.isFull,$(this.hint,this.library.isFull?`The library is full (20). Delete one to save another.`:t?`Copied: ${wm(t)}. Save it to keep it for any factory.`:`Use Copy (Ctrl+C) and drag over part of your factory, then save it here.`);for(let{element:t,cost:n}of this.costs)t.classList.toggle(`unaffordable`,!e.economy.canAfford(n))}},Wv=e=>`<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Gv={miner:Wv(`<rect x="5" y="23" width="22" height="4" rx="1.5" fill="#566074"/><path d="M9 23V8h14v15" stroke="#f2b632" stroke-width="2.6"/><rect x="12" y="5" width="8" height="5" rx="1.2" fill="#f2b632"/><path d="M16 10v6" stroke="#cdd3dc" stroke-width="2.4"/><path d="M12 15h8l-4 8z" fill="#cdd3dc"/>`),conveyor:Wv(`<rect x="3" y="12" width="26" height="9" rx="4.5" fill="#3b4252" stroke="#7b869b" stroke-width="1.6"/><path d="M9 14.5l2.5 2-2.5 2M15 14.5l2.5 2-2.5 2M21 14.5l2.5 2-2.5 2" stroke="#ffb547" stroke-width="1.8"/><circle cx="8" cy="24.5" r="1.6" fill="#7b869b"/><circle cx="24" cy="24.5" r="1.6" fill="#7b869b"/>`),furnace:Wv(`<rect x="6" y="10" width="20" height="17" rx="2.5" fill="#b9583c"/><rect x="19" y="3" width="5" height="8" rx="1" fill="#566074"/><rect x="10" y="15" width="12" height="9" rx="1.5" fill="#2e3440"/><path d="M16 16.5c2.4 2 3 3.4 3 4.6a3 3 0 01-6 0c0-1 .5-1.8 1.4-2.6.2 1 .7 1.4 1.200 1.400.2-1.200.2-2.200.4-3.400z" fill="#ffb547"/>`),assembler:Wv(`<rect x="5" y="19" width="22" height="8" rx="2" fill="#3d8f9c"/><path d="M8 19V6h16v13" stroke="#f2b632" stroke-width="2.4"/><path d="M16 6v7" stroke="#cdd3dc" stroke-width="2.6"/><rect x="11.5" y="12" width="9" height="3.5" rx="1" fill="#cdd3dc"/><circle cx="16" cy="23" r="2.2" fill="#e0a83c"/>`),fabricator:Wv(`<rect x="4" y="21" width="24" height="7" rx="2" fill="#6b5fa8"/><rect x="7" y="17" width="6" height="5" rx="1" fill="#f2b632"/><path d="M10 17l5-9 8 4" stroke="#f2b632" stroke-width="2.6"/><path d="M23 12v5" stroke="#cdd3dc" stroke-width="2.4"/><circle cx="15" cy="8" r="2.200" fill="#3b4252"/><circle cx="23" cy="12" r="1.800" fill="#3b4252"/>`),seller:Wv(`<path d="M4 13l3-7h18l3 7z" fill="#d9534f"/><rect x="6" y="13" width="20" height="14" rx="1.5" fill="#efe2c4"/><circle cx="16" cy="20" r="5" fill="#ffcf40" stroke="#c98f1a" stroke-width="1.4"/><path d="M17.600 18.400c-.5-.6-1.100-.8-1.800-.8-1 0-1.700.5-1.700 1.200 0 1.700 3.600.8 3.600 2.500 0 .8-.8 1.300-1.800 1.300-.8 0-1.500-.3-2-.9M16 16.600v6.800" stroke="#8a5a00" stroke-width="1.2"/>`),splitter:Wv(`<rect x="11" y="11" width="10" height="10" rx="2" fill="#f2b632"/><path d="M3 16h8" stroke="#59c36a" stroke-width="2.6"/><path d="M21 16h8M16 11V4M16 21v7" stroke="#ff9d3c" stroke-width="2.6"/><path d="M26 13l3 3-3 3M13 7l3-3 3 3M13 25l3 3 3-3" stroke="#ff9d3c" stroke-width="2"/>`),merger:Wv(`<rect x="11" y="11" width="10" height="10" rx="2" fill="#3d8f9c"/><path d="M3 16h8M16 4v7M16 28v-7" stroke="#59c36a" stroke-width="2.6"/><path d="M21 16h8" stroke="#ff9d3c" stroke-width="2.6"/><path d="M26 13l3 3-3 3" stroke="#ff9d3c" stroke-width="2"/>`),bridge:Wv(`<path d="M3 16h26" stroke="#7b869b" stroke-width="5"/><path d="M16 3v26" stroke="#232a36" stroke-width="9"/><path d="M16 3v26" stroke="#f2b632" stroke-width="5"/><path d="M13.500 8l2.500-3 2.500 3M24 13.500l3 2.500-3 2.500" stroke="#232a36" stroke-width="1.600"/>`),storage:Wv(`<path d="M4 13l12-7 12 7v13H4z" fill="#7f8ea8"/><path d="M4 13l12-7 12 7" stroke="#566074" stroke-width="2.4"/><rect x="10" y="17" width="12" height="9" rx="1" fill="#7a5236"/><path d="M10 21.500h12M16 17v9" stroke="#553823" stroke-width="1.4"/>`),wind_turbine:Wv(`<path d="M16 15v13" stroke="#eef1f5" stroke-width="2.6"/><path d="M11 28h10" stroke="#566074" stroke-width="2.6"/><path d="M16 14V3.500l3 4.500zM16 14l-9.300 5 5.600.300zM16 14l9.300 5-2-5.300z" fill="#eef1f5"/><circle cx="16" cy="14" r="2.400" fill="#ffb547"/>`),stats:Wv(`<path d="M6 26V17M13 26V9M20 26v-7M27 26V13" stroke="currentColor" stroke-width="3.4"/>`),power:Wv(`<path d="M18 3L7 18h7l-2 11 13-16h-8z" fill="currentColor"/>`),bottleneck:Wv(`<path d="M6 22a10 10 0 0120 0" stroke="currentColor" stroke-width="2.6"/><path d="M16 22l5-8" stroke="currentColor" stroke-width="2.6"/><circle cx="16" cy="22" r="2.2" fill="currentColor"/>`),copy:Wv(`<rect x="11" y="11" width="15" height="15" rx="2.500" stroke="#60a5fa" stroke-width="2.400"/><path d="M8 21H7a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v1" stroke="#60a5fa" stroke-width="2.400"/>`),blueprints:Wv(`<rect x="5" y="6" width="22" height="20" rx="2.500" stroke="currentColor" stroke-width="2.400"/><path d="M5 13h22M12 13v13M12 19.500h15" stroke="currentColor" stroke-width="2"/>`),prestige:Wv(`<path d="M16 4l3.600 7.600 8.400 1-6.200 5.700 1.700 8.200L16 22.400l-7.500 4.100 1.700-8.200L4 12.600l8.400-1z" fill="currentColor"/>`),achievements:Wv(`<path d="M10 5h12v7a6 6 0 01-12 0z" stroke="currentColor" stroke-width="2.4"/><path d="M10 7H5.500v2a4 4 0 004.500 4M22 7h4.500v2a4 4 0 01-4.500 4M16 18v5M11 27h10M13 23h6" stroke="currentColor" stroke-width="2.4"/>`),contracts:Wv(`<rect x="7" y="6" width="18" height="21" rx="2.5" stroke="currentColor" stroke-width="2.4"/><rect x="12" y="3.500" width="8" height="5" rx="1.5" fill="currentColor"/><path d="M11.500 15l2.200 2.200 4.300-4.400M11.500 22h9" stroke="currentColor" stroke-width="2.2"/>`),expand:Wv(`<rect x="11" y="11" width="10" height="10" rx="1.5" fill="currentColor" opacity="0.55"/><path d="M5 12V5h7M27 12V5h-7M5 20v7h7M27 20v7h-7" stroke="currentColor" stroke-width="2.6"/>`),research:Wv(`<path d="M13 5h6M14 5v8l-6 11a2 2 0 001.800 3h12.400a2 2 0 001.800-3l-6-11V5" stroke="currentColor" stroke-width="2.4"/><path d="M10.500 21h11" stroke="currentColor" stroke-width="2.4"/>`),delete:Wv(`<path d="M7 10h18M13 10V7h6v3M9.500 10l1 16h11l1-16M14 14v8M18 14v8" stroke="#f87171" stroke-width="2.2"/>`),rotate:Wv(`<path d="M25 16a9 9 0 11-3-6.700" stroke="currentColor" stroke-width="2.8"/><path d="M23 4v6h-6" stroke="currentColor" stroke-width="2.8"/>`),undo:Wv(`<path d="M8 13h11a6 6 0 010 12h-6" stroke="currentColor" stroke-width="2.8"/><path d="M13 7l-6 6 6 6" stroke="currentColor" stroke-width="2.8"/>`),cancel:Wv(`<path d="M9 9l14 14M23 9L9 23" stroke="currentColor" stroke-width="3"/>`),viewLeft:Wv(`<path d="M26 20a11 11 0 00-19-6" stroke="currentColor" stroke-width="2.8"/><path d="M6 7v8h8" stroke="currentColor" stroke-width="2.8"/>`),viewRight:Wv(`<path d="M6 20a11 11 0 0119-6" stroke="currentColor" stroke-width="2.8"/><path d="M26 7v8h-8" stroke="currentColor" stroke-width="2.8"/>`),center:Wv(`<circle cx="16" cy="16" r="6" stroke="currentColor" stroke-width="2.6"/><path d="M16 4v5M16 23v5M4 16h5M23 16h5" stroke="currentColor" stroke-width="2.6"/>`),pause:Wv(`<path d="M11 8v16M21 8v16" stroke="currentColor" stroke-width="4"/>`),settings:Wv(`<circle cx="16" cy="16" r="4" stroke="currentColor" stroke-width="2.4"/><path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.500 7.500l2.800 2.800M21.700 21.700l2.800 2.800M24.500 7.500l-2.800 2.800M10.300 21.700l-2.800 2.800" stroke="currentColor" stroke-width="2.6"/>`)},Kv=780,qv=2600,Jv=e=>ge.findIndex(t=>t.tools.includes(e)),Yv=class{placement;onClick;entries=new Map;tools;tabs;tabButtons=[];deleteButton;copyButton;group=0;grouped=!1;visible=[];unlocked=[];layoutKey=``;constructor(e,t,n){this.placement=t,this.onClick=n,this.tools=Q(`div`,{class:`toolbar-tools`});for(let e of he){let r=e===`conveyor`?me:P(e),i=mm(e),a=he.indexOf(e),o=Q(`span`,{class:`tool-key`,text:a<9?String(a+1):a===9?`0`:``}),s=Q(`button`,{class:`tool`,onClick:()=>{n(),t.toggleBuild(e)},attrs:{type:`button`}},[o,Q(`span`,{class:`tool-icon`,html:Gv[e]??``}),Q(`span`,{class:`tool-name`,text:e===`conveyor`?r.name:P(e).toolbarName??r.name}),Q(`span`,{class:`tool-cost`,text:Am(i)})]);Up(s,()=>({title:r.name,body:r.description,meta:Am(i),key:o.textContent||void 0})),this.entries.set(e,{type:e,button:s,key:o,cost:i})}ge.forEach((e,t)=>{let r=Q(`button`,{class:`toolbar-tab`,text:e.name,title:`${e.name} (\`) — show these tools`,onClick:()=>{n(),this.setGroup(t)},attrs:{type:`button`,role:`tab`}});this.tabButtons.push(r)}),this.tabs=Q(`div`,{class:`toolbar-tabs hidden`,attrs:{role:`tablist`,"aria-label":`Tool groups`}},this.tabButtons),this.copyButton=Q(`button`,{class:`tool tool-copy`,onClick:()=>{n(),t.toggleCopy()},attrs:{type:`button`}},[Q(`span`,{class:`tool-icon`,html:Gv.copy}),Q(`span`,{class:`tool-name`,text:`Copy`}),Q(`span`,{class:`tool-cost`,text:`area`})]),Up(this.copyButton,{title:`Copy`,key:`Ctrl+C`,body:`Drag over part of the factory, then click to place the copy. Ctrl+V places it again.`}),this.deleteButton=Q(`button`,{class:`tool tool-delete`,onClick:()=>{n(),t.toggleDelete()},attrs:{type:`button`}},[Q(`span`,{class:`tool-icon`,html:Gv.delete}),Q(`span`,{class:`tool-name`,text:`Delete`}),Q(`span`,{class:`tool-cost`,text:`refund`})]),Up(this.deleteButton,{title:`Delete`,key:`X`,body:`Click a machine or drag across belts. Everything is refunded in full.`});let r=Q(`div`,{class:`toolbar`,attrs:{role:`toolbar`,"aria-label":`Build tools`}},[this.tabs,this.tools,Q(`div`,{class:`toolbar-divider`}),this.copyButton,this.deleteButton]);e.append(r);let i=()=>{r.classList.toggle(`narrow`,e.clientWidth<Kv),e.style.setProperty(`--toolbar-height`,`${r.offsetHeight}px`)},a=new ResizeObserver(i);a.observe(r),a.observe(e),i(),t.events.on(`toolChanged`,e=>this.setTool(e))}pick(e){let t=he[e];t&&this.placement.toggleBuild(t)}cycleGroup(){this.grouped&&(this.onClick(),this.setGroup((this.group+1)%ge.length))}setGroup(e){e===this.group||e<0||(this.group=e,this.layout())}setTool(e){e.mode===`build`&&this.grouped&&this.setGroup(Jv(e.type));for(let t of this.entries.values()){let n=e.mode===`build`&&e.type===t.type;t.button.classList.toggle(`active`,n),t.button.setAttribute(`aria-pressed`,String(n))}this.deleteButton.classList.toggle(`active`,e.mode===`delete`),this.copyButton.classList.toggle(`active`,e.mode===`copy`||e.mode===`paste`)}layout(){let e=he.filter(e=>this.unlocked.includes(e));this.grouped=e.length>6;let t=this.grouped?ge[this.group].tools:he;this.visible=t.filter(t=>e.includes(t));let n=`${this.grouped}|${this.visible.join(`,`)}`;n!==this.layoutKey&&(this.layoutKey=n,this.tools.replaceChildren(...this.visible.map(e=>this.entries.get(e).button)),this.tabs.classList.toggle(`hidden`,!this.grouped),this.tabButtons.forEach((e,t)=>{let n=!ge[t].tools.some(e=>this.unlocked.includes(e));e.classList.toggle(`hidden`,n),e.classList.toggle(`active`,t===this.group),e.setAttribute(`aria-selected`,String(t===this.group))}))}update(e){let t=D(e.research);if(t.length!==this.unlocked.length){let e=this.layoutKey===``?[]:he.filter(e=>t.includes(e)&&!this.unlocked.includes(e));this.unlocked=[...t],e.length>0&&(this.group=Math.max(Jv(e[0]),0)),this.layout();for(let t of e){let{button:e}=this.entries.get(t);e.classList.add(`arrived`),window.setTimeout(()=>e.classList.remove(`arrived`),qv)}}for(let t of this.entries.values())t.button.classList.toggle(`unaffordable`,!e.economy.canAfford(t.cost))}},Xv=class{onSwap;panel;list;completed;cards=[];constructor(e,t){this.onSwap=t,this.list=Q(`div`,{class:`contracts`}),this.completed=Q(`span`,{class:`muted`}),this.panel=Q(`div`,{class:`contracts-panel hidden`},[Q(`div`,{class:`panel-header`},[Q(`h2`,{class:`panel-title`,text:`Contracts`}),this.completed]),Q(`p`,{class:`panel-description`,text:`Bonus orders. Anything your Sellers sell counts, and you keep the sale money too. No deadlines.`}),this.list]),e.append(this.panel)}toggle(e){this.visible?this.hide():tm(this.panel,e)}hide(){nm(this.panel)}get visible(){return $p(this.panel)}build(e){this.cards=e.map(e=>{let t=m(e.resourceId),n=Q(`span`,{class:`resource-dot resource-${t.icon}`});n.style.background=t.color;let r=Q(`div`,{class:`progress-fill`}),i=Q(`span`,{class:`contract-progress`}),a=Q(`div`,{class:`contract`},[Q(`div`,{class:`contract-title`},[n,re(e)]),Q(`div`,{class:`progress`},[r]),Q(`div`,{class:`contract-footer`},[i,Q(`span`,{class:`contract-reward`,text:`+${Am(e.reward)}`}),Q(`button`,{class:`contract-swap`,text:`Swap`,title:`Trade this for a different order`,attrs:{type:`button`},onClick:()=>this.onSwap(e.id)})])]);return{id:e.id,root:a,fill:r,progress:i}}),this.list.replaceChildren(...this.cards.map(e=>e.root))}update(e,t){if(!this.visible)return;let{active:n,completed:r}=e.contracts;(n.length!==this.cards.length||n.some((e,t)=>e.id!==this.cards[t].id))&&this.build(n),$(this.completed,r===1?`1 completed`:`${r} completed`),n.forEach((e,n)=>{let r=this.cards[n],i=e.kind===`deliver`?e.progress:Math.round(t.windowTotal(`sold`,e.resourceId)),a=Math.min(i,e.target);r.fill.style.width=`${Math.round(a/e.target*100)}%`,$(r.progress,e.kind===`deliver`?`${a} / ${e.target}`:`${a} / ${e.target} in the last minute`)})}},Zv=48,Qv=1.5,$v=class{layer;labels=[];point=new U;used=0;constructor(e){this.layer=document.createElement(`div`),this.layer.className=`efficiency-labels`,this.layer.setAttribute(`aria-hidden`,`true`),e.append(this.layer)}label(e){let t=this.labels[e];return t||(t=document.createElement(`div`),t.className=`efficiency-label`,this.layer.append(t),this.labels[e]=t),t}update(e,t,n,r,i,a,o){let s=0;if(e&&i<=Qv){let e=bp();for(let i of t.machines.values()){if(s>=Zv)break;if(P(i.type).behavior!==`crafter`||!i.enabled)continue;let t=n.shares(i.id);if(t.observed<3||(Y_(i,this.point),this.point.y=.05,this.point.project(r),Math.abs(this.point.x)>1.05||Math.abs(this.point.y)>1.05))continue;let c=this.label(s++),l=`${Math.round(t.working*100)}%`;c.textContent!==l&&(c.textContent=l),c.dataset.level=t.working>=.9?`good`:t.working>=.6?`fair`:`poor`;let u=(this.point.x*.5+.5)*a/e,d=(-this.point.y*.5+.5)*o/e;c.style.transform=`translate(-50%, 0) translate(${u.toFixed(1)}px, ${(d+16).toFixed(1)}px)`,c.style.display=`block`}}for(let e=s;e<this.used;e++)this.labels[e].style.display=`none`;this.used=s}},ey=class{panel;current;next;note;site;effects;button;constructor(e,t){this.current=Q(`span`),this.next=Q(`span`),this.note=Q(`p`,{class:`panel-description`}),this.site=Q(`span`),this.effects=Q(`ul`,{class:`site-effects`}),this.button=Q(`button`,{class:`button primary`,attrs:{type:`button`},onClick:t}),this.panel=Q(`div`,{class:`expansion-panel hidden`},[Q(`h2`,{class:`panel-title`,text:`Factory floor`}),Q(`div`,{class:`row`},[Q(`span`,{class:`row-label`,text:`Site`}),this.site]),this.effects,Q(`div`,{class:`row`},[Q(`span`,{class:`row-label`,text:`Now`}),this.current]),Q(`div`,{class:`row`},[Q(`span`,{class:`row-label`,text:`Next`}),this.next]),this.note,this.button]),e.append(this.panel)}toggle(e){this.visible?this.hide():tm(this.panel,e)}hide(){nm(this.panel)}get visible(){return $p(this.panel)}update(e,t){if(!this.visible)return;let{width:n,height:r}=e.factory.grid,i=l(e.environment);if(this.site.textContent!==i.name&&($(this.site,i.name),this.effects.replaceChildren(...i.effects.map(e=>Q(`li`,{text:e}))),this.effects.classList.toggle(`hidden`,i.effects.length===0)),$(this.current,`${n} × ${r}`),this.button.classList.toggle(`hidden`,t===null),!t){$(this.next,`—`),$(this.note,`This is the largest floor there is.`);return}let a=e.economy.canAfford(t.cost);$(this.next,`${t.size} × ${t.size}`),$(this.note,a?`The floor grows on every side. Everything you have built stays where it is.`:`${Am(t.cost-Math.floor(e.economy.money))} short. Everything you have built stays where it is.`),$(this.button,`Expand for ${Am(t.cost)}`),this.button.disabled=!a}},ty=.35,ny=1.7,ry=class{sim;card;name;makes;status;busy;point=new U;hoveredId=null;dwell=0;constructor(e,t){this.sim=t,this.name=Q(`span`,{class:`hover-card-name`}),this.makes=Q(`span`,{class:`hover-card-makes`}),this.status=Q(`span`,{class:`status`}),this.busy=Q(`span`,{class:`hover-card-busy`}),this.card=Q(`div`,{class:`hover-card hidden`,attrs:{"aria-hidden":`true`}},[Q(`div`,{class:`hover-card-head`},[this.name,this.status]),this.makes,this.busy]),e.append(this.card)}update(e,t,n,r,i,a){let o=t?.kind===`machine`&&t.id!==n?.id?this.sim.state.factory.machines.get(t.id):void 0;if(!o){this.hoveredId=null,this.card.classList.add(`hidden`);return}if(o.id!==this.hoveredId&&(this.hoveredId=o.id,this.dwell=0,this.card.classList.add(`hidden`)),this.dwell+=e,this.dwell<ty)return;this.describe(o),Y_(o,this.point),this.point.y=ny,this.point.project(r);let s=bp(),c=(this.point.x*.5+.5)*i/s,l=(-this.point.y*.5+.5)*a/s;this.card.style.transform=`translate(-50%, -100%) translate(${c.toFixed(1)}px, ${(l-12).toFixed(1)}px)`,this.card.classList.remove(`hidden`)}describe(e){let t=P(e.type),n=oh(e);if($(this.name,t.name),$(this.status,Qm[n]),this.status.dataset.status=n,t.behavior!==`crafter`){$(this.makes,t.description),this.busy.classList.add(`hidden`);return}let r=e.recipeId?Ge(e.recipeId):null;$(this.makes,r?`Makes ${m(r.outputs[0].resourceId).name}`:`Nothing chosen to make`);let i=this.sim.metrics.shares(e.id);if(this.busy.classList.remove(`hidden`),i.observed<3){$(this.busy,`Measuring…`),this.busy.dataset.level=``;return}let a=i.waiting>=i.blocked&&i.waiting>.02?` · waiting ${Math.round(i.waiting*100)}%`:i.blocked>.02?` · backed up ${Math.round(i.blocked*100)}%`:``;$(this.busy,`Working ${Math.round(i.working*100)}% of the time${a}`),this.busy.dataset.level=i.working>=.9?`good`:i.working>=.6?`fair`:`poor`}},iy=[`production`,`bottleneck`,`research`,`contracts`,`floor`,`blueprints`,`achievements`,`power`,`prestige`],ay=.5;function oy(e){let t=e.machines>0||e.totalEarned>0;return{production:t,bottleneck:t,research:!0,contracts:e.itemsSold>0||e.contractsCompleted>0,floor:e.gridSize>e.startingGridSize||e.totalEarned>=e.firstExpansionCost,blueprints:e.research.includes(`logistics`)||e.hasClipboard||e.savedBlueprints>0,achievements:e.achievements>0,power:e.turbines>0||e.research.includes(`wind_power`)||e.powerSupply>0&&e.powerDemand>=e.powerSupply*ay,prestige:e.stars>0||e.timesSold>0||Im(e.totalEarned)>=1}}var sy=1400,cy=520,ly=2600,uy=9,dy=class{money;income;speedButtons=new Map;power;powerValue;starCount;nav;navDivider;settingsButton;controls=new Map;shown=new Set;firstVisibility=!0;powerTip=``;shownMoney=-1;targetMoney=-1;root;constructor(e,t){this.root=e,this.money=Q(`span`,{class:`money-value`,text:`$0`}),this.income=Q(`span`,{class:`income-value`,text:`+$0/min`});let n=(e,n,r)=>{let i=Q(`button`,{class:`speed-button`,title:r,onClick:()=>t.setSpeed(e),attrs:{type:`button`,"aria-label":r.replace(/ \(.*\)$/,``)}});return e===0?i.innerHTML=`${Gv.pause}<span class="paused-label">Paused</span>`:i.textContent=n,this.speedButtons.set(e,i),i},r=(e,t,n,r,i)=>{let a=Q(`button`,{class:`nav-button`,title:r,onClick:i,attrs:{type:`button`,"aria-label":t}},[Q(`span`,{class:`nav-icon`,html:n}),Q(`span`,{class:`nav-label`,text:t})]);return this.controls.set(e,a),a},i=r(`bottleneck`,`Bottlenecks`,Gv.bottleneck,`Bottleneck view (B) — colours each machine by how busy it is and marks belts that are backed up`,t.toggleBottleneckView);i.setAttribute(`aria-pressed`,`false`),this.navDivider=Q(`span`,{class:`nav-divider`}),this.nav=Q(`nav`,{class:`nav`,attrs:{"aria-label":`Factory panels`}},[r(`production`,`Production`,Gv.stats,`Production — what the factory makes, uses and sells, and what is holding it back`,t.toggleStats),r(`contracts`,`Contracts`,Gv.contracts,`Contracts (C) — bonus orders filled by selling`,t.toggleContracts),r(`research`,`Research`,Gv.research,`Research (T) — unlock new machines and products`,t.openResearch),r(`floor`,`Floor`,Gv.expand,`Factory floor — buy more space`,t.toggleExpansion),r(`blueprints`,`Blueprints`,Gv.blueprints,`Blueprints (P) — saved layouts you can place again`,t.toggleBlueprints),r(`achievements`,`Achievements`,Gv.achievements,`Achievements (G) — milestones and their rewards`,t.toggleAchievements),this.navDivider,i]),this.powerValue=Q(`span`,{text:`0 / 0`}),this.power=Q(`div`,{class:`status-item power`},[Q(`span`,{class:`status-icon`,html:Gv.power}),this.powerValue]),Up(this.power,()=>({title:`Power`,body:this.powerTip})),this.controls.set(`power`,this.power),this.starCount=Q(`span`,{class:`star-count`});let a=Q(`button`,{class:`status-item prestige-button`,title:`Stars — sell the factory and start again for permanent bonuses`,onClick:t.openPrestige,attrs:{type:`button`,"aria-label":`Sell up`}},[Q(`span`,{class:`status-icon`,html:Gv.prestige}),this.starCount]);this.controls.set(`prestige`,a);let o=Q(`div`,{class:`statusbar`},[Q(`div`,{class:`status-item money`,title:`Money`},[Q(`span`,{class:`coin`}),this.money]),Q(`button`,{class:`status-item income`,title:`Income — what the factory has earned per minute lately. Click for production figures.`,onClick:t.toggleStats,attrs:{type:`button`}},[this.income]),this.power,a]);this.settingsButton=Q(`button`,{class:`pill icon-button`,title:`Settings`,html:Gv.settings,onClick:t.openSettings,attrs:{type:`button`,"aria-label":`Settings`}});for(let e of this.controls.values())e.classList.add(`hidden`);let s=Q(`div`,{class:`topbar`},[Q(`div`,{class:`topbar-group`},[o,this.nav]),Q(`div`,{class:`topbar-group`},[Q(`div`,{class:`pill speed`},[n(0,``,`Pause (Space)`),n(1,`1×`,`Normal speed`),n(2,`2×`,`Double speed`)]),this.settingsButton])]);e.append(s),this.trackSize(s)}trackSize(e){let t=()=>{e.classList.toggle(`compact`,this.root.clientWidth<sy),e.classList.toggle(`stacked`,this.root.clientWidth<cy),this.root.style.setProperty(`--topbar-bottom`,`${e.offsetTop+e.offsetHeight}px`)},n=new ResizeObserver(t);n.observe(e),n.observe(this.root),t()}anchor(e){return e===`settings`?this.settingsButton:this.controls.get(e)??null}setOpenPanel(e){for(let[t,n]of this.controls)t!==`bottleneck`&&t!==`power`&&t!==`prestige`&&n.classList.toggle(`active`,t===e)}setVisibility(e){for(let t of iy){if(!e[t]||this.shown.has(t))continue;this.shown.add(t);let n=this.controls.get(t);n&&(n.classList.remove(`hidden`),this.firstVisibility||(n.classList.add(`arrived`),window.setTimeout(()=>n.classList.remove(`arrived`),ly)))}this.firstVisibility=!1,this.navDivider.classList.toggle(`hidden`,!this.shown.has(`bottleneck`))}setStars(e){$(this.starCount,String(e))}setResearchAvailable(e){this.controls.get(`research`)?.classList.toggle(`has-dot`,e)}setPower(e,t){$(this.powerValue,`${Math.round(e)} / ${Math.round(t)}`);let n=e>t;this.power.classList.toggle(`short`,n),this.powerTip=n?`Machines want ${Math.round(e)} but only ${Math.round(t)} is available, so they all run at ${Math.round(t/e*100)}% speed.`:`${Math.round(e)} in use of ${Math.round(t)} available.`}setBottleneckView(e){let t=this.controls.get(`bottleneck`);t?.classList.toggle(`active`,e),t?.setAttribute(`aria-pressed`,String(e))}setSpeed(e){this.root.classList.toggle(`paused`,e===0);for(let[t,n]of this.speedButtons)n.classList.toggle(`active`,t===e),n.setAttribute(`aria-pressed`,String(t===e))}update(e){let t=Math.floor(e.economy.money);t!==this.targetMoney&&(this.targetMoney>=0&&t>this.targetMoney&&(this.money.classList.remove(`bump`),this.money.offsetWidth,this.money.classList.add(`bump`)),this.targetMoney=t,this.shownMoney<0&&this.showMoney(t)),$(this.income,`+${Am(e.economy.incomePerMinute())}/min`)}animate(e){if(this.shownMoney===this.targetMoney||this.targetMoney<0)return;let t=this.targetMoney-this.shownMoney;if(Sp()||Math.abs(t)<1)return this.showMoney(this.targetMoney);let n=t*Math.min(e*uy,1);this.showMoney(this.shownMoney+(Math.abs(n)<1?Math.sign(t):n))}showMoney(e){this.shownMoney=e,$(this.money,Am(Math.round(e)))}};function fy(e,t){switch(e.mode){case`build`:return e.type===`conveyor`?[[`Drag`,`lay a line`],[`R`,`rotate`],[`Esc`,`done`]]:[[`Click`,`place`],[`R`,`rotate`],[`Esc`,`done`]];case`delete`:return[[`Click`,`remove a machine`],[`Drag`,`clear belts`],[`Ctrl Z`,`put back`],[`Esc`,`done`]];case`copy`:return[[`Drag`,`over what to copy`],[`Esc`,`cancel`]];case`paste`:return[[`Click`,`place the copy`],[`R`,`rotate`],[`Esc`,`done`]];case`select`:return t?t.kind===`machine`?[[`R`,`rotate`],[`Del`,`remove`],[`Esc`,`deselect`]]:[[`R`,`turn`],[`Del`,`remove`],[`Esc`,`deselect`]]:[]}}var py=class{bar;tool;selection;shownKey=``;constructor(e,t){this.bar=Q(`div`,{class:`keyhints hidden`,attrs:{"aria-hidden":`true`}}),e.append(this.bar),this.tool=t.currentTool,this.selection=t.currentSelection,t.events.on(`toolChanged`,e=>{this.tool=e,this.render()}),t.events.on(`selectionChanged`,e=>{this.selection=e,this.render()})}render(){let e=fy(this.tool,this.selection),t=e.map(([e,t])=>`${e}:${t}`).join(`|`);t!==this.shownKey&&(this.shownKey=t,this.bar.classList.toggle(`hidden`,e.length===0),this.bar.replaceChildren(...e.map(([e,t])=>Q(`span`,{class:`keyhint`},[Q(`kbd`,{text:e}),t]))))}};function my(e,t){let n=m(e),r=Q(`span`,{class:`resource-dot resource-${n.icon}`});return r.style.background=n.color,Q(`span`,{class:`chip`},[r,`${t} ${n.name}`])}var hy=e=>String(Number(e.toFixed(2))),gy=class{sim;placement;panel;name;description;status;recipe;makes;input;output;inputLabel;progressFill;rate;efficiency;efficiencyFill;toggle;level;power;upgradeButton;rows=new Map;selection=null;signature=``;constructor(e,t,n,r){this.sim=t,this.placement=n,this.name=Q(`h2`,{class:`panel-title`}),this.description=Q(`p`,{class:`panel-description`}),this.status=Q(`span`,{class:`status`}),this.recipe=Q(`div`,{class:`row-value`}),this.makes=Q(`div`,{class:`row-value recipe-choices`}),this.input=Q(`div`,{class:`row-value`}),this.output=Q(`div`,{class:`row-value`}),this.rate=Q(`div`,{class:`row-value`}),this.efficiency=Q(`div`,{class:`row-value`}),this.progressFill=Q(`div`,{class:`progress-fill`}),this.efficiencyFill=Q(`div`,{class:`progress-fill`}),this.inputLabel=Q(`span`,{class:`row-label`,text:`Input`});let i=(e,t,n)=>{let r=Q(`div`,{class:`row`},[typeof t==`string`?Q(`span`,{class:`row-label`,text:t}):t,n]);return this.rows.set(e,r),r};this.level=Q(`div`,{class:`row-value`}),this.power=Q(`div`,{class:`row-value`}),this.upgradeButton=Q(`button`,{class:`button primary upgrade-button hidden`,attrs:{type:`button`},onClick:()=>{let e=this.machine();e&&this.placement.upgrade(e.id),this.update()}}),this.toggle=Q(`button`,{class:`button`,attrs:{type:`button`},onClick:()=>{r();let e=this.machine();e&&this.sim.setMachineEnabled(e.id,!e.enabled)}}),this.panel=Q(`aside`,{class:`machine-panel hidden`},[Q(`div`,{class:`panel-header`},[this.name,Q(`button`,{class:`panel-close`,text:`×`,title:`Close (Esc)`,attrs:{type:`button`,"aria-label":`Close`},onClick:()=>n.select(null)})]),this.description,Q(`div`,{class:`rows`},[i(`status`,`Status`,this.status),i(`level`,`Level`,this.level),i(`power`,`Power`,this.power),i(`makes`,`Makes`,this.makes),i(`recipe`,`Recipe`,this.recipe),i(`input`,this.inputLabel,this.input),i(`output`,`Output`,this.output),i(`progress`,`Progress`,Q(`div`,{class:`progress`},[this.progressFill])),i(`rate`,`Rate`,this.rate),i(`efficiency`,`Efficiency`,Q(`div`,{class:`efficiency`},[Q(`div`,{class:`progress`},[this.efficiencyFill]),this.efficiency]))]),this.upgradeButton,Q(`div`,{class:`panel-actions`},[this.toggle,Q(`button`,{class:`button`,text:`Rotate`,title:`Rotate (R)`,attrs:{type:`button`},onClick:()=>n.rotate()}),Q(`button`,{class:`button danger`,text:`Delete`,title:`Delete (Del)`,attrs:{type:`button`},onClick:()=>n.deleteSelected()})])]),e.append(this.panel),n.events.on(`selectionChanged`,e=>{this.selection=e,this.signature=``,this.update()})}machine(){return this.selection?.kind===`machine`?this.sim.state.factory.machines.get(this.selection.id):void 0}conveyor(){return this.selection?.kind===`conveyor`?this.sim.state.factory.conveyors.get(this.selection.id):void 0}update(){let e=this.machine(),t=this.conveyor();this.panel.classList.toggle(`hidden`,!e&&!t),e?this.showMachine(e):t&&this.showConveyor(t)}showRows(e){for(let[t,n]of this.rows)n.classList.toggle(`hidden`,!e.includes(t))}fillChips(e,t,n,r){e.dataset.key!==t&&(e.dataset.key=t,e.replaceChildren(...n.length>0?n:[Q(`span`,{class:`muted`,text:r})]))}inventoryChips(e){let t=[],n=``;for(let r of f){let i=e[r.id]??0;i<=0||(n+=`${r.id}:${i};`,t.push(my(r.id,String(i))))}return{key:n,chips:t}}showHeader(e,t,n,r){this.signature!==e&&(this.signature=e,$(this.name,t),$(this.description,n),this.toggle.classList.toggle(`hidden`,!r))}showMachine(e){let t=P(e.type),n=oh(e);switch(this.showHeader(e.id,t.name,t.description,!0),$(this.status,Qm[n]),this.status.dataset.status=n,$(this.toggle,e.enabled?`Disable`:`Enable`),t.behavior!==`crafter`&&this.upgradeButton.classList.add(`hidden`),t.behavior){case`crafter`:this.showCrafter(e);break;case`seller`:this.showRows([`status`,`input`,`output`,`rate`]),$(this.inputLabel,`Input`),this.fillChips(this.input,`seller-in`,[],`Any item`),this.fillChips(this.output,`seller-out`,[],`Money`),$(this.rate,`As fast as items arrive`);break;case`bridge`:case`router`:this.showRows([`status`,`input`,`rate`]),$(this.inputLabel,`Crossing`),this.fillChips(this.input,`transit:${e.transit.length}`,[],`${e.transit.length} item${e.transit.length===1?``:`s`}`),$(this.rate,`Up to 120 items/min`);break;case`generator`:this.showRows([`status`,`power`]),$(this.power,e.enabled?`Supplies ${hy(Th(e,this.sim.environment))}`:`Switched off`);break;case`storage`:{this.showRows([`status`,`input`,`progress`]),$(this.inputLabel,`Holding`);let n={};for(let t of e.stored)n[t]=(n[t]??0)+1;let r=this.inventoryChips(n),i=t.storageCapacity??0;this.fillChips(this.input,`stored:${r.key}`,r.chips,`Empty`),this.progressFill.style.width=`${Math.round(e.stored.length/Math.max(i,1)*100)}%`;break}}}showCrafter(e){let t=P(e.type),n=qe(e.type).filter(e=>this.sim.isRecipeAvailable(e.id)),r=[`status`,`level`,`power`,`recipe`,`input`,`output`,`progress`,`rate`,`efficiency`];n.length>1&&r.splice(3,0,`makes`);let{ratio:i}=this.sim.power,a=wh(e,this.sim.environment);$(this.power,e.enabled?i<.995?`Uses ${hy(a)} · short, running at ${Math.round(i*100)}%`:`Uses ${hy(a)}`:`Switched off, uses none`),this.power.dataset.short=String(e.enabled&&i<.995);let o=$m(e,this.sim.environment);$(this.level,`${je(e.level).name} · ${o===1?`standard speed`:`${hy(o)}× speed`}`);let s=this.sim.upgradeOffer(e);this.upgradeButton.classList.toggle(`hidden`,s===null),s&&(s.needsResearch?($(this.upgradeButton,`${s.next.name} needs ${s.needsResearch.name}`),this.upgradeButton.disabled=!0):($(this.upgradeButton,`Upgrade to ${s.next.name} (${s.next.speed}× speed) · ${Am(s.cost)}`),this.upgradeButton.disabled=!this.sim.state.economy.canAfford(s.cost))),this.showRows(r),$(this.inputLabel,`Input`);let c=e.id+`|`+e.recipeId+`|`+n.map(e=>e.id).join(`,`);if(this.makes.dataset.key!==c&&(this.makes.dataset.key=c,this.makes.replaceChildren(...n.map(t=>{let n=m(t.outputs[0].resourceId),r=Q(`span`,{class:`resource-dot resource-`+n.icon});return r.style.background=n.color,Q(`button`,{class:t.id===e.recipeId?`recipe-choice active`:`recipe-choice`,title:`Make `+n.name,attrs:{type:`button`,"aria-pressed":String(t.id===e.recipeId)},onClick:()=>this.placement.setRecipe(e.id,t.id)},[r,n.name])}))),e.recipeId){let t=Ge(e.recipeId),n=[...t.inputs.map(e=>my(e.resourceId,String(e.amount))),Q(`span`,{class:`arrow`,text:`→`}),...t.outputs.map(e=>my(e.resourceId,String(e.amount))),Q(`span`,{class:`muted`,text:`${t.duration}s`})];this.fillChips(this.recipe,t.id,t.inputs.length>0?n:n.slice(1),``)}let l=this.inventoryChips(e.inputInventory),u=t.ports.some(e=>e.type===`input`);this.fillChips(this.input,`in:${l.key}`,l.chips,u?`Empty`:`None needed`);let d=this.inventoryChips(e.outputInventory);this.fillChips(this.output,`out:${d.key}`,d.chips,`Empty`),this.progressFill.style.width=`${Math.round((e.active?e.progress:0)*100)}%`;let{metrics:f}=this.sim,p=sh(e,this.sim.environment);if(p){let t=Math.round(f.machineOutputRate(e.id));$(this.rate,`${t} of ${Math.round(p.perMinute)} ${m(p.resourceId).name}/min`)}let h=f.shares(e.id);if(h.observed<3)$(this.efficiency,`Measuring…`),this.efficiencyFill.style.width=`0%`,this.efficiencyFill.dataset.level=``;else{let e=h.waiting>=h.blocked&&h.waiting>.02?` · waiting ${Math.round(h.waiting*100)}%`:h.blocked>.02?` · backed up ${Math.round(h.blocked*100)}%`:``;$(this.efficiency,`${Math.round(h.working*100)}%${e}`),this.efficiencyFill.style.width=`${Math.round(h.working*100)}%`,this.efficiencyFill.dataset.level=h.working>=.9?`good`:h.working>=.6?`fair`:`poor`}}showConveyor(e){this.upgradeButton.classList.add(`hidden`),this.showHeader(e.id,me.name,me.description,!1),this.showRows([`status`,`input`,`rate`]),$(this.status,`Heading ${se[e.direction]}`),this.status.dataset.status=`working`,$(this.inputLabel,`Carrying`);let t=e.items.length;this.fillChips(this.input,`belt:${t}`,[],`${t} item${t===1?``:`s`}`),$(this.rate,`Up to 120 items/min`)}},_y=2.2,vy=class{toasts;hint;hintText;hintBadge;hintClose;onHintClose=null;lastToast=``;lastToastAt=0;constructor(e){this.toasts=Q(`div`,{class:`toasts`,attrs:{"aria-live":`polite`}}),this.hintText=Q(`span`),this.hintBadge=Q(`span`,{class:`hint-badge`,text:`Next`}),this.hintClose=Q(`button`,{class:`hint-close hidden`,text:`×`,attrs:{type:`button`,"aria-label":`Close tip`},onClick:()=>this.onHintClose?.()}),this.hint=Q(`div`,{class:`hint hidden`,attrs:{role:`status`}},[this.hintBadge,this.hintText,this.hintClose]),e.append(this.hint,this.toasts)}toast(e,t=_y){let n=performance.now();if(e===this.lastToast&&n-this.lastToastAt<1200)return;this.lastToast=e,this.lastToastAt=n;let r=Q(`div`,{class:`toast`,text:e});this.toasts.append(r),window.setTimeout(()=>{r.classList.add(`leaving`),window.setTimeout(()=>r.remove(),250)},t*1e3)}setHint(e,t=null){this.hint.classList.toggle(`hidden`,e===null),this.onHintClose=t,this.hintClose.classList.toggle(`hidden`,t===null),$(this.hintBadge,t?`Tip`:`Next`),e!==null&&$(this.hintText,e)}},yy=class{onOpenChange;overlay;body;constructor(e,t){this.onOpenChange=t,this.body=Q(`div`,{class:`offline-body`});let n=Q(`div`,{class:`modal offline-modal`,attrs:{role:`dialog`,"aria-label":`Welcome back`}},[Q(`h2`,{class:`panel-title`,text:`Welcome back`}),this.body,Q(`button`,{class:`button primary`,text:`Back to work`,attrs:{type:`button`},onClick:()=>this.close()})]);this.overlay=Q(`div`,{class:`overlay hidden`},[n]),this.overlay.addEventListener(`click`,e=>{e.target===this.overlay&&this.close()}),window.addEventListener(`keydown`,e=>{this.isOpen&&(e.code===`Escape`||e.code===`Enter`)&&this.close()}),e.append(this.overlay)}get isOpen(){return $p(this.overlay)}show(e){let t=f.filter(t=>(e.sold[t.id]??0)>0).map(t=>{let n=Q(`span`,{class:`resource-dot resource-${t.icon}`});return n.style.background=m(t.id).color,Q(`div`,{class:`row`},[Q(`span`,{class:`chip`},[n,t.name]),Q(`span`,{text:`${e.sold[t.id].toLocaleString(`en-US`)} sold`})])}),n=[Q(`p`,{class:`panel-description`,text:e.capped?`You were away for ${Pm(e.awaySeconds)}. The factory kept going at half pace for the first ${Pm(e.countedSeconds)}.`:`You were away for ${Pm(e.awaySeconds)}, and the factory kept going at half pace.`}),Q(`div`,{class:`offline-earned`},[Q(`span`,{class:`coin`}),Q(`span`,{text:`+${Am(e.earned)}`})]),...t.length>0?t:[Q(`p`,{class:`muted`,text:`Nothing was sold — is anything reaching a Seller?`})],e.contractsCompleted>0?Q(`div`,{class:`row`},[Q(`span`,{class:`row-label`,text:`Contracts completed`}),Q(`span`,{text:String(e.contractsCompleted)})]):null];this.body.replaceChildren(...n.filter(e=>e!==null)),tm(this.overlay),this.onOpenChange(!0)}close(){this.isOpen&&(nm(this.overlay),this.onOpenChange(!1))}},by=e=>`+${Math.round((e-1)*100)}%`,xy=class{sim;onOpenChange;overlay;held;worth;fill;next;after;sites=[];confirm;siteId=o[0].id;armed=!1;constructor(e,t,n,r){this.sim=t,this.onOpenChange=r,this.held=Q(`span`),this.worth=Q(`span`),this.next=Q(`span`,{class:`muted`}),this.after=Q(`p`,{class:`panel-description`}),this.fill=Q(`div`,{class:`progress-fill`});let i=Q(`div`,{class:`prestige-sites`});for(let e of o){let t=Q(`button`,{class:`recipe-choice`,text:e.name,title:e.effects.join(` · `)||`No special rules`,attrs:{type:`button`},onClick:()=>{this.siteId=e.id,this.armed=!1,this.update()}});t.dataset.site=e.id,this.sites.push(t),i.append(t)}this.confirm=Q(`button`,{class:`button primary`,attrs:{type:`button`},onClick:()=>{if(!this.confirm.disabled){if(!this.armed){this.armed=!0,this.update();return}n(this.siteId)}}});let a=Q(`div`,{class:`modal prestige-modal`,attrs:{role:`dialog`,"aria-label":`Sell up`}},[Q(`div`,{class:`panel-header`},[Q(`h2`,{class:`panel-title`,text:`Sell up and start again`}),Q(`button`,{class:`panel-close`,text:`×`,title:`Close (Esc)`,attrs:{type:`button`,"aria-label":`Close`},onClick:()=>this.close()})]),Q(`p`,{class:`panel-description`,text:`Sell this factory for stars and found a new one. Each star raises every sale price by 10% and adds $100 to your starting money, for good.`}),Q(`div`,{class:`row`},[Q(`span`,{class:`row-label`,text:`Stars held`}),this.held]),Q(`div`,{class:`row`},[Q(`span`,{class:`row-label`,text:`This factory is worth`}),this.worth]),Q(`div`,{class:`progress prestige-progress`},[this.fill]),this.next,Q(`h3`,{class:`modal-subtitle`,text:`What happens`}),Q(`ul`,{class:`prestige-list`},[Q(`li`,{text:`Lost: this factory, your money, research, contracts and upgrades.`}),Q(`li`,{text:`Kept: stars, achievements and saved blueprints.`})]),Q(`h3`,{class:`modal-subtitle`,text:`Found the next factory on`}),i,this.after,this.confirm]);this.overlay=Q(`div`,{class:`overlay hidden`},[a]),this.overlay.addEventListener(`click`,e=>{e.target===this.overlay&&this.close()}),window.addEventListener(`keydown`,e=>{this.isOpen&&e.code===`Escape`&&(e.stopPropagation(),this.close())}),e.append(this.overlay)}get isOpen(){return $p(this.overlay)}open(e){this.armed=!1,this.siteId=this.sim.state.environment,tm(this.overlay,e),this.update(),this.onOpenChange(!0)}close(){nm(this.overlay),this.onOpenChange(!1)}update(){if(!this.isOpen)return;let{economy:e,prestige:t}=this.sim.state,n=Im(e.totalEarned),r=t.stars+n;$(this.held,t.stars===0?`None yet`:`${t.stars} ★ · sales ${by(Rm(t.stars))}`),$(this.worth,n===0?`Nothing yet`:`${n} ★`);let i=Lm(n),a=Lm(n+1);this.fill.style.width=`${Math.round(Math.min((e.totalEarned-i)/(a-i),1)*100)}%`,$(this.next,`${Am(e.totalEarned)} earned here · next star at ${Am(a)}`);for(let e of this.sites)e.classList.toggle(`active`,e.dataset.site===this.siteId);this.confirm.disabled=n<1,n<1?($(this.after,`Earn ${Am(a)} in this factory before selling it.`),$(this.confirm,`Not worth a star yet`)):($(this.after,`Your next factory would sell everything at ${by(Rm(r))} and start with ${Am(zm(r))}.`),$(this.confirm,this.armed?`This cannot be undone — sell the factory`:`Sell for ${n} ★`)),this.confirm.classList.toggle(`danger-armed`,this.armed)}};function Sy(e){return[...e.unlocks.machines.map(e=>P(e).name),...e.unlocks.recipes.map(e=>m(Ge(e).outputs[0].resourceId).name),...(e.unlocks.upgrades??[]).map(e=>`${je(e).name} upgrades`)]}var Cy=class{getState;onOpenChange;overlay;cards=[];justOpened=!1;constructor(e,t,n,r){this.getState=t,this.onOpenChange=r;let i=[];for(let e of y){let t=A(e);i[t]??=Q(`div`,{class:`research-column`});let r=Q(`span`,{class:`research-state`}),a=Q(`button`,{class:`button primary research-button`,attrs:{type:`button`},onClick:()=>n(e.id)}),o=Q(`div`,{class:`research-card`},[Q(`h3`,{class:`research-name`,text:e.name}),Q(`p`,{class:`research-description`,text:e.description}),Q(`p`,{class:`research-unlocks`},[Q(`span`,{class:`muted`,text:`Unlocks `}),Sy(e).join(` · `)]),Q(`div`,{class:`research-footer`},[r,a])]);i[t].append(o),this.cards.push({node:e,root:o,state:r,button:a})}let a=Q(`div`,{class:`modal research-modal`,attrs:{role:`dialog`,"aria-label":`Research`}},[Q(`div`,{class:`panel-header`},[Q(`h2`,{class:`panel-title`,text:`Research`}),Q(`button`,{class:`panel-close`,text:`×`,title:`Close (Esc)`,attrs:{type:`button`,"aria-label":`Close`},onClick:()=>this.close()})]),Q(`p`,{class:`panel-description`,text:`Spend money to unlock new machines and products. Nothing is ever taken away.`}),Q(`div`,{class:`research-tree`},i)]);this.overlay=Q(`div`,{class:`overlay hidden`},[a]),this.overlay.addEventListener(`click`,e=>{e.target===this.overlay&&this.close()}),window.addEventListener(`keydown`,e=>{this.isOpen&&!this.justOpened&&(e.code===`Escape`||e.code===`KeyT`)&&(e.stopPropagation(),this.close())}),e.append(this.overlay)}get isOpen(){return $p(this.overlay)}toggle(e){this.isOpen?this.close():this.open(e)}open(e){tm(this.overlay,e),this.justOpened=!0,window.setTimeout(()=>this.justOpened=!1,0),this.update(),this.onOpenChange(!0)}close(){nm(this.overlay),this.onOpenChange(!1)}hasAffordable(){let{research:e,economy:t}=this.getState();return y.some(n=>T(e,n)===`available`&&t.canAfford(n.cost))}update(){if(!this.isOpen)return;let{research:e,economy:t}=this.getState();for(let n of this.cards){let r=T(e,n.node);if(n.root.dataset.status=r,n.button.classList.toggle(`hidden`,r!==`available`),r===`done`)$(n.state,`Researched`);else if(r===`locked`){let t=w(e,n.node).map(e=>e.name);$(n.state,`Needs ${t.join(` and `)} · ${Am(n.node.cost)}`)}else{let e=t.canAfford(n.node.cost);$(n.state,e?``:`${Am(n.node.cost-Math.floor(t.money))} short`),$(n.button,`Research ${Am(n.node.cost)}`),n.button.disabled=!e}}}},wy=3,Ty=class{onFocusMachine;panel;cells=new Map;total;findings;findingsKey=``;constructor(e,t){this.onFocusMachine=t;let n=Q(`div`,{class:`stats-grid`},[Q(`span`,{class:`muted`,text:`per minute`}),Q(`span`,{class:`muted`,text:`Made`}),Q(`span`,{class:`muted`,text:`Used`}),Q(`span`,{class:`muted`,text:`Sold`})]);for(let e of f){let t=Q(`span`,{class:`resource-dot resource-${e.icon}`});t.style.background=e.color;let r={made:Q(`span`,{text:`0`}),used:Q(`span`,{text:`0`}),sold:Q(`span`,{text:`0`})};this.cells.set(e.id,r),n.append(Q(`span`,{class:`chip`},[t,e.name]),r.made,r.used,r.sold)}this.total=Q(`span`,{text:`$0`}),this.findings=Q(`div`,{class:`findings`}),this.panel=Q(`div`,{class:`stats-panel hidden`},[Q(`h2`,{class:`panel-title`,text:`Production`}),n,Q(`div`,{class:`row`},[Q(`span`,{class:`row-label`,text:`Total earned`}),this.total]),Q(`h3`,{class:`modal-subtitle`,text:`Bottlenecks`}),this.findings]),e.append(this.panel)}toggle(e){if(this.visible)return this.hide();tm(this.panel,e),this.findingsKey=``}hide(){nm(this.panel)}get visible(){return $p(this.panel)}update(e,t){if(this.visible){for(let[e,n]of this.cells)$(n.made,String(Math.round(t.rate(`produced`,e)))),$(n.used,String(Math.round(t.rate(`consumed`,e)))),$(n.sold,String(Math.round(t.rate(`sold`,e))));$(this.total,Am(e.economy.totalEarned)),this.showFindings(Yh(e,t).slice(0,wy),e.factory.machines.size)}}showFindings(e,t){let n=e.map(e=>`${e.machineId}|${e.problem}|${e.fix}`).join(`
`)+`#${t>0}`;if(n!==this.findingsKey){if(this.findingsKey=n,e.length===0){this.findings.replaceChildren(Q(`p`,{class:`muted finding-empty`,text:t>0?`Nothing is holding the factory back right now.`:`Build something and it will be measured here.`}));return}this.findings.replaceChildren(...e.map(e=>Q(`button`,{class:`finding finding-${e.kind}`,title:`Show this machine`,attrs:{type:`button`},onClick:()=>this.onFocusMachine(e.machineId)},[Q(`span`,{class:`finding-problem`,text:e.problem}),Q(`span`,{class:`finding-fix`,text:e.fix})])))}}},Ey=class{cluster;rotate;cancel;constructor(e,t,n,r){let i=(e,t,n)=>Q(`button`,{class:`touch-button`,html:t,attrs:{type:`button`,"aria-label":e},onClick:()=>{r(),n()}});this.rotate=i(`Rotate`,Gv.rotate,()=>t.rotate()),this.cancel=i(`Cancel`,Gv.cancel,()=>t.cancel());let a=i(`Put back what was removed`,Gv.undo,()=>t.undoDelete());a.disabled=!t.canUndo,t.events.on(`undoChanged`,e=>a.disabled=!e),this.cluster=Q(`div`,{class:`touch-controls hidden`,attrs:{role:`group`,"aria-label":`Touch controls`}},[this.rotate,this.cancel,a,Q(`span`,{class:`touch-divider`}),i(`Turn view left`,Gv.viewLeft,()=>n.rotate(1)),i(`Turn view right`,Gv.viewRight,()=>n.rotate(-1)),i(`Centre view`,Gv.center,()=>n.center())]),e.append(this.cluster);let o=()=>{let e=t.currentTool.mode!==`select`||t.currentSelection!==null,n=t.currentTool.mode===`build`||t.currentTool.mode===`paste`||t.currentSelection!==null;this.cancel.disabled=!e,this.rotate.disabled=!n};if(t.events.on(`toolChanged`,o),t.events.on(`selectionChanged`,o),o(),window.matchMedia?.(`(pointer: coarse)`).matches)this.show();else{let e=t=>{t.pointerType===`touch`&&(this.show(),window.removeEventListener(`pointerdown`,e,!0))};window.addEventListener(`pointerdown`,e,!0)}}show(){this.cluster.classList.remove(`hidden`),document.documentElement.dataset.touch=`true`}},Dy=new Set([`miner`,`furnace`,`assembler`]),Oy=12,ky=.1,Ay=300,jy=.5,My=60,Ny=class{ctx;sim;ticks=new Nh;effects;machines;conveyors;items;selection;badges;markers;overlay;costLabel;floatingText;placement;input;hud;toolbar;machinePanel;stats;settingsPanel;researchPanel;expansionPanel;contractsPanel;offlinePanel;achievementsPanel;blueprintsPanel;blueprints;hoverCard;efficiencyLabels;prestigePanel;retired=!1;notifications;debugRenderer=null;debugPanel=null;animTime=0;realTime=0;uiTimer=0;autosaveTimer=0;saveCountdown=-1;resumeSpeed=1;pendingReport=null;shownTip=null;shownHint=null;fps=60;center=new U;constructor(e,t){this.ctx=t;let{scene:n}=t.sceneManager,{factory:r}=e;this.sim=new Mh(e);let i=Mm(this.sim,t.awaySeconds);this.effects=new sv(n),this.conveyors=new kg(n),this.items=new xv(n),this.machines=new X_(n,this.effects),this.selection=new gv(n),this.badges=new Bv(n),this.markers=new Fv(n),this.overlay=new nv(n),this.costLabel=Q(`div`,{class:`ghost-cost hidden`}),this.efficiencyLabels=new $v(t.uiRoot),t.uiRoot.append(this.costLabel);let a=new jv(n);this.floatingText=new uv(t.uiRoot),this.placement=new ig(this.sim,t.camera,this.machines,a,this.selection,this.effects,t.audio),this.input=new tg(t.renderer.canvas,t.camera,this.placement,{togglePause:()=>this.togglePause(),toggleDebug:()=>this.debugPanel?.toggle(),toggleBottleneckView:()=>this.toggleBottleneckView(),toggleResearch:()=>this.researchPanel.toggle(this.hud.anchor(`research`)),toggleContracts:()=>this.toggleDropdown(this.contractsPanel,`contracts`),toggleAchievements:()=>this.achievementsPanel.toggle(this.hud.anchor(`achievements`)),toggleBlueprints:()=>this.toggleDropdown(this.blueprintsPanel,`blueprints`),pickTool:e=>this.toolbar.pick(e),cycleToolGroup:()=>this.toolbar.cycleGroup()});let o=()=>t.audio.play(`click`);this.notifications=new vy(t.uiRoot),this.hud=new dy(t.uiRoot,{setSpeed:e=>{o(),this.setSpeed(e)},openSettings:()=>{o(),this.settingsPanel.open(this.hud.anchor(`settings`))},toggleStats:()=>{o(),this.toggleDropdown(this.stats,`production`)},toggleBottleneckView:()=>{o(),this.toggleBottleneckView()},openResearch:()=>{o(),this.researchPanel.toggle(this.hud.anchor(`research`))},toggleExpansion:()=>{o(),this.toggleDropdown(this.expansionPanel,`floor`)},toggleContracts:()=>{o(),this.toggleDropdown(this.contractsPanel,`contracts`)},toggleAchievements:()=>{o(),this.achievementsPanel.toggle(this.hud.anchor(`achievements`))},toggleBlueprints:()=>{o(),this.toggleDropdown(this.blueprintsPanel,`blueprints`)},openPrestige:()=>{o(),this.prestigePanel.open(this.hud.anchor(`prestige`)),this.dismissTip(`prestige`)}}),this.prestigePanel=new xy(t.uiRoot,this.sim,e=>this.prestige(e),e=>this.input.setEnabled(!e));let s=null;try{s=window.localStorage}catch{}this.blueprints=new Om(s),this.blueprintsPanel=new Uv(t.uiRoot,this.blueprints,this.placement,o),this.achievementsPanel=new Hv(t.uiRoot,this.sim,e=>this.input.setEnabled(!e)),this.contractsPanel=new Xv(t.uiRoot,e=>{o(),this.sim.swapContract(e),this.requestSave(),this.updateUi()}),this.expansionPanel=new ey(t.uiRoot,()=>this.expand()),this.researchPanel=new Cy(t.uiRoot,()=>this.sim.state,e=>this.research(e),e=>this.input.setEnabled(!e)),this.stats=new Ty(t.uiRoot,e=>this.focusMachine(e)),this.toolbar=new Yv(t.uiRoot,this.placement,o),new py(t.uiRoot,this.placement),new Ey(t.uiRoot,this.placement,t.camera,o),this.hoverCard=new ry(t.uiRoot,this.sim),this.machinePanel=new gy(t.uiRoot,this.sim,this.placement,o),this.settingsPanel=new um(t.uiRoot,t.settings,{onChange:e=>{t.onSettingsChanged(e),this.requestSave()},onOpenChange:e=>this.input.setEnabled(!e),getProgress:()=>this.cosmeticProgress(),onSaveNow:()=>{this.save(),this.notifications.toast(`Factory saved`)},onMainMenu:()=>{this.save(),window.location.reload()},onDownloadSave:()=>{this.save(),Gp(qp(),JSON.stringify(ct(this.sim.state,t.settings)))},onLoadSave:t.onLoadSaveFile,onHelp:t.onHelp});let c=!1;t.saveManager.onFailure=()=>{c||(c=!0,this.notifications.toast(`Could not save — browser storage is full or blocked. Download a save from Settings.`,8))},this.offlinePanel=new yy(t.uiRoot,e=>this.input.setEnabled(!e)),this.wireEvents();for(let e of r.machines.values())this.machines.add(e,!1);this.conveyors.invalidate(),this.items.resetTracks(r),this.hud.setSpeed(this.ticks.speed),this.updateUi(),i&&(this.offlinePanel.show(i),this.save()),window.addEventListener(`pagehide`,()=>this.save()),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`hidden`&&this.save()})}wireEvents(){let{events:e}=this.sim,{audio:t}=this.ctx;e.on(`machinePlaced`,e=>this.machines.add(e,!0)),e.on(`machineRemoved`,e=>this.machines.remove(e)),e.on(`machineChanged`,e=>this.machines.updateTransform(e)),e.on(`machineUpgraded`,()=>{this.dismissTip(`upgrades`),this.requestSave(),this.updateUi()}),e.on(`machineProduced`,({machine:e})=>{this.machines.notify(e.id),Dy.has(e.type)&&t.play(e.type)}),e.on(`itemEntered`,()=>t.play(`thunk`)),e.on(`itemSold`,({machine:e,value:n})=>{this.machines.notify(e.id),t.play(`coin`),Y_(e,this.center),this.floatingText.spawn(this.center.x,2.1,this.center.z,`+${Am(n)}`)}),e.on(`topologyChanged`,()=>{this.conveyors.invalidate(),this.debugRenderer?.refresh(this.sim.state.factory),this.requestSave()}),e.on(`tutorialAdvanced`,()=>this.updateHint(0)),e.on(`factoryExpanded`,({width:e,height:n})=>{this.ctx.onGridChanged(e,n);for(let e of this.sim.state.factory.machines.values())this.machines.updateTransform(e);this.items.resetTracks(this.sim.state.factory),this.debugRenderer?.resize(e,n),this.placement.refreshHover(),t.play(`research`),this.notifications.toast(`Factory floor expanded to ${e} × ${n}`),this.updateUi()}),e.on(`achievementsUnlocked`,e=>{t.play(`achievement`);let n=e.reduce((e,t)=>e+t.reward,0);this.notifications.toast(e.length===1?`Achievement: ${e[0].name} · +${Am(n)}`:`${e.length} achievements unlocked · +${Am(n)}`),this.requestSave(),this.achievementsPanel.update(),this.ctx.onSettingsChanged(this.ctx.settings)}),e.on(`contractCompleted`,e=>{t.play(`contract`),this.notifications.toast(`Contract complete: ${re(e)} · +${Am(e.reward)}`),this.requestSave()}),e.on(`researchCompleted`,e=>{t.play(`research`),this.notifications.toast(`Researched: ${e.name}`),this.requestSave(),this.updateUi()}),this.placement.events.on(`message`,e=>this.notifications.toast(e))}toggleDropdown(e,t){for(let t of[this.stats,this.expansionPanel,this.contractsPanel,this.blueprintsPanel])t!==e&&t.hide();e.toggle(this.hud.anchor(t)),this.dismissTip(t===`floor`?`expansion`:t===`production`?`bottlenecks`:t),this.updateUi()}expand(){let e=this.sim.expandFactory();e.ok||(this.ctx.audio.play(`error`),e.reason===`cannot_afford`&&this.notifications.toast(`Not enough money`))}cosmeticProgress(){return{achievements:this.sim.state.achievements.length,stars:this.sim.state.prestige.stars}}setBeltStyle(e){this.conveyors.setBeltStyle(e)}prestige(e){let t=Bm(this.sim.state,e);t&&(this.retired=!0,this.ctx.onPrestige(t))}research(e){let t=this.sim.research(e);t.ok||(this.ctx.audio.play(`error`),t.reason===`cannot_afford`&&this.notifications.toast(`Not enough money`))}toggleBottleneckView(){this.overlay.setEnabled(!this.overlay.isEnabled),this.dismissTip(`bottlenecks`),this.hud.setBottleneckView(this.overlay.isEnabled)}focusMachine(e){let t=e?this.sim.state.factory.machines.get(e):void 0;t&&(Y_(t,this.center),this.ctx.camera.focus(this.center.x,this.center.z),this.placement.setTool({mode:`select`}),this.placement.select({kind:`machine`,id:t.id}))}updateCostLabel(){let e=this.placement.currentBuildHover;if(this.costLabel.classList.toggle(`hidden`,e===null),!e)return;let{renderer:t,camera:n}=this.ctx;this.center.set(e.x,0,e.z).project(n.camera);let r=(this.center.x*.5+.5)*t.width/bp(),i=(-this.center.y*.5+.5)*t.height/bp();this.costLabel.style.transform=`translate(-50%, 0) translate(${r.toFixed(1)}px, ${(i+34).toFixed(1)}px)`,this.costLabel.textContent=Am(e.cost),this.costLabel.classList.toggle(`unaffordable`,!e.affordable)}setSpeed(e){this.ticks.speed=e,e!==0&&(this.resumeSpeed=e),this.hud.setSpeed(e)}togglePause(){this.setSpeed(this.ticks.speed===0?this.resumeSpeed:0)}save(){this.retired||(this.ctx.saveManager.save(this.sim.state,this.ctx.settings),this.autosaveTimer=0,this.saveCountdown=-1)}saveIfSound(){if(!this.retired){try{_t(JSON.parse(JSON.stringify(ct(this.sim.state,this.ctx.settings))))}catch{return}this.save()}}notify(e,t){this.notifications.toast(e,t)}setInputEnabled(e){this.retired||this.input.setEnabled(e)}retire(){this.retired=!0,this.input.setEnabled(!1),this.setSpeed(0)}requestSave(){this.saveCountdown=jy}updateSaving(e){this.autosaveTimer+=e,this.saveCountdown>=0&&(this.saveCountdown-=e,this.saveCountdown<0&&this.save()),this.autosaveTimer>=30&&this.save()}frame(e){let{factory:t}=this.sim.state;if(this.realTime+=e,this.pendingReport){let e=this.pendingReport;this.pendingReport=null,e.awaySeconds>=Ay&&!this.offlinePanel.isOpen&&this.offlinePanel.show(e)}this.fps+=(1/Math.max(e,.001)-this.fps)*.05,this.input.update(e),this.ticks.advance(e,Oy,()=>{this.sim.tick(),this.items.snapshot(t)});let n=e*this.ticks.speed;this.animTime+=n,this.conveyors.update(t,n),this.machines.update(t,n,e,this.animTime,this.sim.power.ratio),this.items.update(this.ticks.alpha,this.animTime,n),this.effects.update(e),this.selection.update(this.realTime),this.badges.update(t,this.sim.metrics,this.ctx.camera.camera,this.realTime),this.markers.update(t,this.realTime),this.overlay.update(t,this.sim.metrics,e),this.updateCostLabel();let{renderer:r,camera:i}=this.ctx;this.floatingText.update(e,i.camera,r.width/bp(),r.height/bp(),!Sp()),this.hoverCard.update(e,this.placement.currentHover,this.placement.currentSelection,i.camera,r.width,r.height),this.efficiencyLabels.update(this.overlay.isEnabled,t,this.sim.metrics,i.camera,i.zoomScale,r.width,r.height),this.hud.animate(e),this.ctx.audio.update(t.conveyors.size,this.ticks.speed!==0),this.updateSaving(e),this.uiTimer+=e,this.uiTimer>=ky&&(this.uiTimer=0,this.updateUi())}background(e){if(this.retired)return;let{factory:t}=this.sim.state;if(e>=jm.minSeconds){if(this.ticks.speed===0)return;let n=Mm(this.sim,e*this.ticks.speed);this.items.resetTracks(t),n&&(this.pendingReport=Nm(this.pendingReport,n)),this.save();return}this.ticks.advance(e,Math.ceil(e*20*2)+1,()=>this.sim.tick())>0&&this.items.resetTracks(t),this.updateSaving(e)}dismissTip(e){this.sim.dismissTip(e),this.shownTip?.id===e&&this.updateHint(0)}updateHint(e){let{state:t}=this.sim,n=nt(t);if(n!==null){this.shownTip=null,n!==this.shownHint&&this.notifications.setHint(n),this.shownHint=n;return}if(this.shownTip&&(this.shownTip.seconds+=e,this.shownTip.seconds>=My&&this.sim.dismissTip(this.shownTip.id)),!this.shownTip&&this.shownHint===null&&t.seenTips.length>=Ze.length)return;let r=this.sim.nextExpansion(),i=et(t,{hasBottleneck:!t.seenTips.includes(`bottlenecks`)&&t.factory.machines.size>=4&&Yh(t,this.sim.metrics).length>0,itemsSold:Object.values(t.stats.sold).reduce((e,t)=>e+t,0),powerShort:this.sim.power.demand>this.sim.power.supply,canAffordExpansion:r!==null&&t.economy.canAfford(r.cost),research:t.research,starsAvailable:Im(t.economy.totalEarned)}),a=i?.text??null;a!==this.shownHint&&(this.shownTip=i?{id:i.id,seconds:0}:null,this.notifications.setHint(a,i?()=>this.dismissTip(i.id):null),this.shownHint=a,t.seenTips.length>0&&this.requestSave())}updateGauge(){let e=this.placement.currentSelection,t=e?.kind===`machine`?this.sim.state.factory.machines.get(e.id):void 0;if(!t||P(t.type).behavior!==`crafter`)return this.selection.setEfficiency(null);let n=this.sim.metrics.shares(t.id);this.selection.setEfficiency(n.observed>=3?n.working:null)}updateHud(){let{state:e}=this.sim,t=0;for(let n of e.factory.machines.values())P(n.type).behavior===`generator`&&t++;this.hud.setVisibility(oy({machines:e.factory.machines.size,totalEarned:e.economy.totalEarned,itemsSold:Object.values(e.stats.sold).reduce((e,t)=>e+t,0),contractsCompleted:e.contracts.completed,research:e.research,gridSize:e.factory.grid.width,startingGridSize:12,firstExpansionCost:Me[0].cost,hasClipboard:this.placement.clipboard!==null,savedBlueprints:this.blueprints.all.length,achievements:e.achievements.length,powerDemand:this.sim.power.demand,powerSupply:this.sim.power.supply,turbines:t,stars:e.prestige.stars,timesSold:e.prestige.count})),this.hud.setOpenPanel(this.stats.visible?`production`:this.contractsPanel.visible?`contracts`:this.expansionPanel.visible?`floor`:this.blueprintsPanel.visible?`blueprints`:this.researchPanel.isOpen?`research`:this.achievementsPanel.isOpen?`achievements`:null)}updateUi(){let{state:e}=this.sim;if(this.updateHud(),this.updateGauge(),this.updateHint(ky),this.hud.update(e),this.hud.setPower(this.sim.power.demand,this.sim.power.supply),this.toolbar.update(e),this.machinePanel.update(),this.stats.update(e,this.sim.metrics),this.researchPanel.update(),this.contractsPanel.update(e,this.sim.metrics),this.achievementsPanel.update(),this.blueprintsPanel.update(e),this.prestigePanel.update(),this.hud.setStars(e.prestige.stars),this.expansionPanel.update(e,this.sim.nextExpansion()),this.hud.setResearchAvailable(this.researchPanel.hasAffordable()),this.debugPanel?.visible){let t=this.ctx.renderer.webgl.info.render;this.debugPanel.update({fps:this.fps,drawCalls:t.calls,triangles:t.triangles,machines:e.factory.machines.size,conveyors:e.factory.conveyors.size,items:this.items.visibleCount,simTime:e.simTime})}}},Py=class{channel=null;id=`${Date.now()}-${Math.random().toString(36).slice(2)}`;constructor(e,t){typeof BroadcastChannel<`u`&&(this.channel=new BroadcastChannel(`omm.factory.${e||`main`}`),this.channel.addEventListener(`message`,e=>{Fy(e.data,this.id)&&(this.channel?.close(),t())}),this.channel.postMessage({type:`opened`,id:this.id}))}};function Fy(e,t){if(typeof e!=`object`||!e)return!1;let{type:n,id:r}=e;return n===`opened`&&typeof r==`string`&&r!==t}var Iy=`omm.continue`,Ly=class{viewport;uiRoot;slot=new URLSearchParams(window.location.search).get(`slot`)??``;saveManager=new wt(this.slot);loop=null;failed=!1;settings;audio;renderer;sceneManager;camera;grid;environment;menu;help;session=null;starting=!1;environmentId=s;constructor(e,t){this.viewport=e,this.uiRoot=t,this.settings=this.saveManager.loadSettings(),this.audio=new n(this.settings)}async start(){try{this.renderer=new gp(this.viewport)}catch(e){if(e instanceof hp){this.showFatal(`Your browser could not start the 3D renderer.
Please update your browser or enable hardware acceleration.`);return}throw e}this.sceneManager=new vp,this.camera=new Gf,this.grid=new mp(this.sceneManager.scene),this.environment=new tp(this.sceneManager.scene),this.buildWorld(12,12),this.applySettings(this.settings),this.renderer.onResize((e,t)=>this.camera.setAspect(e/t)),window.matchMedia?.(`(prefers-reduced-motion: reduce)`).addEventListener(`change`,()=>{Cp(this.settings.reduceMotion)});let e=-1/0,t=t=>{this.failed||/ResizeObserver|Script error/i.test(t)||performance.now()-e<8e3||(e=performance.now(),this.session?.notify(`That did not work — something went wrong. If the game seems off, reload the page.`,6))};window.addEventListener(`error`,e=>t(e.message)),window.addEventListener(`unhandledrejection`,e=>t(String(e.reason?.message??e.reason)));let n=()=>this.audio.unlock();window.addEventListener(`pointerdown`,n),window.addEventListener(`keydown`,n),this.help=new cm(this.uiRoot,e=>this.session?.setInputEnabled(!e));let r=new um(this.uiRoot,this.settings,{onChange:e=>this.applySettings(e),onHelp:()=>this.help.open()});this.menu=new lm(this.uiRoot,{onContinue:()=>void this.continueGame(),onNewFactory:e=>void this.newGame(e),onPreviewEnvironment:e=>this.showEnvironment(e),onSettings:()=>r.open(),onHelp:()=>this.help.open(),onLoadFile:()=>void this.loadSaveFile()}),this.menu.show(await this.saveManager.hasSave()),this.takeFlag(Iy)&&this.continueGame(),this.loop=new pm(e=>this.frame(e),e=>this.session?.background(e),e=>this.fail(e)),this.loop.start();let i=null;this.renderer.onContextChange(e=>{i?.close(),i=e?Wp(this.uiRoot,{title:`Graphics were reset`,body:`The browser took the 3D view away for a moment. Your factory is still running and will reappear when it comes back. If it does not, reload the page.`,actions:[{label:`Reload`,primary:!0,onClick:()=>this.reload()}]}):null})}reload(){this.session?.saveIfSound(),window.location.reload()}fail(e){if(!this.failed){this.failed=!0,console.error(e),this.loop?.stop();try{this.session?.saveIfSound(),this.session?.retire()}catch{}Wp(this.uiRoot,{title:`Something went wrong`,body:`The game hit an error and had to stop. Your factory was saved a moment ago; reloading should bring it back.`,detail:e instanceof Error?e.message:String(e),actions:[{label:`Reload`,primary:!0,onClick:()=>window.location.reload()},{label:`Download my save`,onClick:()=>void this.downloadStoredSave()}]})}}async downloadStoredSave(){let e=await this.saveManager.exportText();e&&Gp(qp(),e)}async loadSaveFile(){if((this.session||await this.saveManager.hasSave())&&!await new Promise(e=>{let t=Wp(this.uiRoot,{title:`Replace your factory?`,body:`Loading a save file replaces the factory saved in this browser. This cannot be undone.`,actions:[{label:`Choose a file`,primary:!0,onClick:()=>(t.close(),e(!0))},{label:`Cancel`,onClick:()=>(t.close(),e(!1))}]})}))return;let e=await Kp(`.json,application/json`);if(e!==null){try{this.saveManager.importText(e,this.settings)}catch(e){let t=Wp(this.uiRoot,{title:`Could not load that file`,body:`It is not a One More Machine save, or it is damaged. Nothing was changed.`,detail:e instanceof at?e.message:void 0,actions:[{label:`OK`,primary:!0,onClick:()=>t.close()}]});return}this.session?.retire(),this.setFlag(Iy),window.location.reload()}}showEnvironment(e){if(this.session||e===this.environmentId)return;this.environmentId=e;let{theme:t}=l(e);this.environment.build(12,12,t),this.sceneManager.setTheme(t)}buildWorld(e,t){let{theme:n}=l(this.environmentId);cp(e,t),this.grid.build(e,t),this.environment.build(e,t,n),this.sceneManager.setTheme(n),this.sceneManager.lighting.setCoverage(Math.max(e,t)),this.camera.setWorldSize(Math.max(e,t))}applySettings(e){this.audio.applySettings(e),this.sceneManager.lighting.setShadows(e.shadows);let t=Oe(e.cosmetics,this.session?.cosmeticProgress()??null);this.grid.setStyle(t.floor),this.sceneManager.lighting.setStyle(t.light),this.session?.setBeltStyle(t.belt),xp(this.uiRoot,e.uiScale),Cp(e.reduceMotion),this.saveManager.saveSettings(e)}async continueGame(){if(!this.starting){this.starting=!0;try{let{state:e,savedAt:t}=await this.saveManager.load();this.startSession(e,t>0?(Date.now()-t)/1e3:0)}catch{this.starting=!1,this.menu.showLoadError()}}}async newGame(e){this.starting||(this.starting=!0,await this.saveManager.clear(),this.startSession(Ce(l(e).id),0))}startSession(e,t){let{width:n,height:r}=e.factory.grid;(n!==12||r!==12||e.environment!==this.environmentId)&&(this.environmentId=e.environment,this.buildWorld(n,r)),this.camera.settle(),this.session=new Ny(e,{renderer:this.renderer,sceneManager:this.sceneManager,camera:this.camera,audio:this.audio,saveManager:this.saveManager,settings:this.settings,uiRoot:this.uiRoot,onSettingsChanged:e=>this.applySettings(e),onGridChanged:(e,t)=>this.buildWorld(e,t),awaySeconds:t,onLoadSaveFile:()=>void this.loadSaveFile(),onHelp:()=>this.help.open(),onPrestige:e=>{this.saveManager.save(e,this.settings),this.setFlag(Iy),window.location.reload()}}),this.menu.hide();let i=this.session;new Py(this.slot,()=>{i.retire(),Wp(this.uiRoot,{title:`Open in another tab`,body:`This factory has been opened in another tab, which has taken over. To play here instead, close that tab and reload this one.`,actions:[{label:`Reload`,primary:!0,onClick:()=>window.location.reload()}]})}),this.applySettings(this.settings)}frame(e){!this.session&&!Sp()&&this.camera.drift(e),this.camera.update(e),this.session?.frame(e),this.renderer.render(this.sceneManager.scene,this.camera.camera)}setFlag(e){try{sessionStorage.setItem(e,`1`)}catch{}}takeFlag(e){try{let t=sessionStorage.getItem(e)===`1`;return sessionStorage.removeItem(e),t}catch{return!1}}showFatal(e){let t=Q(`div`,{class:`fatal`});t.style.whiteSpace=`pre-line`,t.textContent=e,document.body.append(t)}},Ry=document.getElementById(`viewport`),zy=document.getElementById(`ui`);if(!Ry||!zy)throw Error(`Missing #viewport or #ui element`);var By=new Ly(Ry,zy);By.start().catch(e=>By.fail(e));