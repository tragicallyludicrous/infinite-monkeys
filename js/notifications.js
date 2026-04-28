// ====================================
// --- POPUP NOTIFICATIONS ---
// ====================================

export function objectNotify(object, message, color = "cornflowerblue") {
  const toast = document.createElement("span");
  const parent = document.getElementById(`${object.type}-wrapper-${object.id}`);
  const existingToasts = parent.querySelectorAll(".toast").length;
  const offset = existingToasts * 50;
  toast.style.top = `calc(25% + ${offset}px)`;
  parent.appendChild(toast);
  toast.innerHTML = message;
  toast.style.backgroundColor = color;
  toast.classList.add("toast");
  setTimeout(() => {
    toast.classList.add("visible");
  }, 10);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => {
      parent.removeChild(toast);
    }, 500);
  }, 2000);
}

export function HUDNotify(message, color = "cornflowerblue") {
  const toast = document.createElement("span");
  const parent = document.getElementById("hud");
  const existingToasts = parent.querySelectorAll(".toast").length;
  const offset = existingToasts * 50;
  toast.style.top = `calc(50% + ${offset}px)`;
  parent.appendChild(toast);
  toast.innerHTML = message;
  toast.style.backgroundColor = color;
  toast.classList.add("toast");
  setTimeout(() => {
    toast.classList.add("visible");
  }, 10);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => {
      parent.removeChild(toast);
    }, 500);
  }, 5000);
}
