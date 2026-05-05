// ====================================
// --- POPUP NOTIFICATIONS ---
// ====================================

function notify(parent, message, { color, top, duration }) {
  const toast = document.createElement("span");
  const offset = parent.querySelectorAll(".toast").length * 50;
  toast.className = "toast";
  toast.innerHTML = message;
  toast.style.top = `calc(${top} + ${offset}px)`;
  toast.style.backgroundColor = color;
  parent.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

export function objectNotify(object, message, color = "cornflowerblue") {
  const parent = document.getElementById(`${object.type}-${object.id}-wrapper`);
  notify(parent, message, { color, top: "25%", duration: 2000 });
}

export function hudNotify(message, color = "cornflowerblue") {
  const parent = document.getElementById("hud");
  notify(parent, message, { color, top: "50%", duration: 5000});
}