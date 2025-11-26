let currentEvents = [];

document.addEventListener("DOMContentLoaded", () => {
  loadEvents();

  document.getElementById("newEventBtn").addEventListener("click", () => {
    clearForm();
    showForm();
  });

  document.getElementById("saveBtn").addEventListener("click", saveEvent);
  document.getElementById("cancelBtn").addEventListener("click", () => {
    clearForm();
    hideForm();
  });

  hideForm();
});

async function loadEvents() {
  const tbody = document.querySelector("#eventTable tbody");
  tbody.innerHTML = "";

  try {
    const res = await fetch("/api/items", { credentials: "include" });

    if (res.status === 401) {
      tbody.innerHTML =
        '<tr><td colspan="6">Log in to see events.</td></tr>';
      document.getElementById("newEventBtn").style.display = "none";
      return;
    }

    document.getElementById("newEventBtn").style.display = "inline-block";

    const events = await res.json();
    currentEvents = events;

    if (!events.length) {
      tbody.innerHTML =
        '<tr><td colspan="6">No events yet.</td></tr>';
      return;
    }

    events.forEach((ev) => {
      const tr = document.createElement("tr");

      const tdTitle = document.createElement("td");
      tdTitle.textContent = ev.title;

      const tdDate = document.createElement("td");
      tdDate.textContent = ev.date;

      const tdTime = document.createElement("td");
      tdTime.textContent = ev.time;

      const tdLocation = document.createElement("td");
      tdLocation.textContent = ev.location || "";

      const tdStatus = document.createElement("td");
      tdStatus.textContent = ev.status || "";

      const tdActions = document.createElement("td");
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.dataset.id = ev._id;

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.dataset.id = ev._id;

      tdActions.appendChild(editBtn);
      tdActions.appendChild(delBtn);

      tr.appendChild(tdTitle);
      tr.appendChild(tdDate);
      tr.appendChild(tdTime);
      tr.appendChild(tdLocation);
      tr.appendChild(tdStatus);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);

      editBtn.addEventListener("click", () => startEdit(ev._id));
      delBtn.addEventListener("click", () => deleteEvent(ev._id));
    });
  } catch (err) {
    console.log("load error:", err);
  }
}

async function saveEvent() {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const location = document.getElementById("location").value.trim();
  const status = document.getElementById("status").value;
  const editId = document.getElementById("eventForm").dataset.editId;

  if (!title || !date || !time) {
    alert("Title, date, and time are required.");
    return;
  }

  const body = { title, date, time, location, status };

  try {
    let res;
    if (editId) {
      res = await fetch(`/api/items/${editId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch("/api/items", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      alert("Error saving event");
      return;
    }

    clearForm();
    hideForm();
    loadEvents();
  } catch (err) {
    console.log("save error:", err);
  }
}

async function deleteEvent(id) {
  const sure = confirm("Are you sure you want to delete this event?");
  if (!sure) return;

  try {
    const res = await fetch(`/api/items/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      loadEvents();
    } else {
      alert("Error deleting event");
    }
  } catch (err) {
    console.log("delete error:", err);
  }
}

function startEdit(id) {
  const ev = currentEvents.find((e) => e._id === id);
  if (!ev) return;

  document.getElementById("title").value = ev.title;
  document.getElementById("date").value = ev.date;
  document.getElementById("time").value = ev.time;
  document.getElementById("location").value = ev.location || "";
  document.getElementById("status").value = ev.status || "Draft";

  document.getElementById("eventForm").dataset.editId = ev._id;
  document.getElementById("formTitle").textContent = "Edit Event";

  showForm();
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

