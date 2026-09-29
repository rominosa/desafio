let personajeActual=null, nivel=0, score=0, intentos=0, passed=0, startTime=0, timerId=null, currentSpeech="";
const $=id=>document.getElementById(id);

function showScreen(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active");}
function showCharacters(){
  const grid=$("characterGrid"); grid.innerHTML="";
  Object.entries(PERSONAJES).forEach(([key,p])=>{
    grid.innerHTML += `<article class="character-card">
      <img src="${p.foto}" alt="Retrato de ${p.nombre}" onerror="this.style.objectFit='contain';this.alt='Imagen no disponible'">
      <h3>${p.nombre}</h3><p>${p.descripcion}</p>
      <button class="primary" onclick="startGame('${key}')">ELEGIR →</button>
    </article>`;
  });
  showScreen("characters");
}
function startGame(key){
  personajeActual=PERSONAJES[key]; nivel=0; score=0; intentos=0; passed=0; startTime=Date.now();
  clearInterval(timerId); timerId=setInterval(updateTimer,1000); updateTimer();
  showScreen("game"); renderLevel();
}
function updateTimer(){
  const sec=Math.floor((Date.now()-startTime)/1000), m=String(Math.floor(sec/60)).padStart(2,"0"), s=String(sec%60).padStart(2,"0");
  $("timer").textContent=`${m}:${s}`;
}
function renderLevel(){
  const q=personajeActual.niveles[nivel]; intentos=0;
  $("levelBadge").textContent=`NIVEL ${nivel+1} / ${personajeActual.niveles.length}`;
  $("missionTitle").textContent=q.titulo; $("score").textContent=score;
  $("characterPhoto").src=personajeActual.foto; $("characterPhoto").alt=personajeActual.nombre;
  $("speaker").textContent=personajeActual.nombre;
  currentSpeech=`Bienvenidos al nivel ${nivel+1}. ${q.aprender} Ahora observen y resuelvan el desafío.`;
  $("dialogueText").textContent=currentSpeech;
  $("learningCard").innerHTML=`<strong>🧠 ANTES DE RESPONDER</strong>${q.aprender}`;
  $("topicImage").src=q.imagen; $("observation").textContent=q.observar;
  $("question").textContent=q.pregunta; $("feedback").textContent="";
  $("options").innerHTML=q.opciones.map((o,i)=>`<button class="option" onclick="answer(${i},this)">${String.fromCharCode(65+i)}. ${o}</button>`).join("");
}
function answer(i,btn){
  const q=personajeActual.niveles[nivel];
  const buttons=[...document.querySelectorAll(".option")];
  if(i===q.correcta){
    const pts=intentos===0?100:intentos===1?75:intentos===2?50:25;
    score+=pts; passed++; btn.classList.add("correct"); buttons.forEach(b=>b.disabled=true);
    $("score").textContent=score;
    $("feedback").innerHTML=`<span class="ok">✓ ¡Correcto! +${pts} puntos.</span><br><br><strong>¿QUÉ ACABÁS DE APRENDER?</strong> ${q.aprender}`;
    currentSpeech=`¡Correcto! ${q.aprender}`;
    setTimeout(()=>{nivel++; if(nivel<personajeActual.niveles.length) renderLevel(); else finishGame();},1800);
  }else{
    intentos++; btn.classList.add("wrong"); btn.disabled=true;
    $("feedback").innerHTML=`<span class="hint">Todavía no. Pista: ${q.pista}</span><br>Volvé a observar la imagen y pensá en la explicación. El nivel permanece bloqueado hasta encontrar la respuesta.`;
    currentSpeech=`Necesitás intentarlo otra vez. Pista: ${q.pista}`;
    setTimeout(()=>btn.classList.remove("wrong"),700);
  }
}
function speakCurrent(){
  // Si luego se agregan archivos MP3/WAV, se pueden reproducir aquí por personaje/nivel.
  // Por ahora usamos la voz disponible en el navegador como respaldo.
  if("speechSynthesis" in window){
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(currentSpeech);
    u.lang="es-AR"; u.rate=personajeActual.nombre==="Dolph Lundgren"?1.02:.92; u.pitch=personajeActual.nombre==="Marie Curie"?1.05:.9;
    speechSynthesis.speak(u);
  }else alert("Tu navegador no tiene síntesis de voz disponible.");
}
function finishGame(){
  clearInterval(timerId); const sec=Math.floor((Date.now()-startTime)/1000);
  const m=String(Math.floor(sec/60)).padStart(2,"0"), s=String(sec%60).padStart(2,"0");
  $("finalScientist").textContent=`Misión de ${personajeActual.nombre}`;
  $("finalPassed").textContent=passed; $("finalScore").textContent=score; $("finalTime").textContent=`${m}:${s}`;
  $("finalMessage").textContent=score>=450?"Completaste toda la misión demostrando que podés aprender a partir de evidencias, explicaciones y desafíos.":score>=300?"Misión completada. Revisá las pistas y explicaciones para consolidar lo aprendido.":"Misión completada. Volvé a jugar para reforzar los conceptos y mejorar tu puntaje.";
  showScreen("final");
}
showCharacters();
