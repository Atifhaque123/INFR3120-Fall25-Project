const LS_KEY = "events";

function loadEvents() {
  const raw = localStorage.getItem(LS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEvents(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
  document.getElementById("location").value = "";
  document.getElementById("status").value = "Draft";

  document.getElementById("eventForm").dataset.editId = "";

  document.getElementById("formTitle").textContent = "Add Event";
}

function showForm() {
  document.getElementById("eventForm").style.display = "block";
}

function hideForm() {
  document.getElementById("eventForm").style.display = "none";
}

function renderTable() {
  const tbody = document.querySelector("#eventTable tbody");
  const list = loadEvents();
  tbody.innerHTML = "";

  list.forEach(ev => {
    const tr = document.createElement("tr");

    const tdTitle = document.createElement("td");
    tdTitle.textContent = ev.title;

    const tdDate = document.createElement("td");
    tdDate.textContent = ev.date;

    const tdTime = document.createElement("td");
    tdTime.textContent = ev.time;

    const tdLocation = document.createElement("td");
    tdLocation.textContent = ev.location;

    const tdStatus = document.createElement("td");
    tdStatus.textContent = ev.status;

    const tdActions = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.dataset.id = ev.id;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.dataset.id = ev.id;

    tdActions.appendChild(editBtn);
    tdActions.appendChild(delBtn);

    tr.appendChild(tdTitle);
    tr.appendChild(tdDate);
    tr.appendChild(tdTime);
    tr.appendChild(tdLocation);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);


    editBtn.addEventListener("click", () => startEdit(ev.id));
    delBtn.addEventListener("click", () => removeEvent(ev.id));
  });
}


function saveFromForm() {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const location = document.getElementById("location").value.trim();
  const status = document.getElementById("status").value;

  if (!title || !date || !time) {
    alert("Title, date, and time are required.");
    return;
  }

  const list = loadEvents();
  const editId = document.getElementById("eventForm").dataset.editId;

  if (editId) {
    
    const idx = list.findIndex(e => String(e.id) === String(editId));
    if (idx !== -1) {
      list[idx] = { id: list[idx].id, title, date, time, location, status };
    }
  } else {

    const newEvent = {
      id: Date.now(), 
      title, date, time, location, status
    };
    list.push(newEvent);
  }

  saveEvents(list);
  renderTable();
  clearForm();
  hideForm();
}


function startEdit(id) {
  const list = loadEvents();
  const ev = list.find(e => String(e.id) === String(id));
  if (!ev) return;

  document.getElementById("title").value = ev.title;
  document.getElementById("date").value = ev.date;
  document.getElementById("time").value = ev.time;
  document.getElementById("location").value = ev.location;
  document.getElementById("status").value = ev.status;

  document.getElementById("eventForm").dataset.editId = ev.id;

  document.getElementById("formTitle").textContent = "Edit Event";

  showForm();
}


function removeEvent(id) {
  const sure = confirm("Are you sure you want to delete this event?");
  if (!sure){
    return;
  }
  
  const list = loadEvents().filter(e => String(e.id) !== String(id));
  saveEvents(list);
  renderTable();
}


document.getElementById("newEventBtn").addEventListener("click", () => {
  clearForm();
  showForm();
});

document.getElementById("saveBtn").addEventListener("click", saveFromForm);
document.getElementById("cancelBtn").addEventListener("click", () => {
  clearForm();
  hideForm();
});


hideForm();
renderTable();
