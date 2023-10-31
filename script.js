document.addEventListener("DOMContentLoaded", () => {
  let db;
  const studentForm = document.getElementById("studentForm");
  const studentList = document.getElementById("studentList");

  const request = window.indexedDB.open("mahasiswaDB", 1);

  request.onupgradeneeded = event => {
      const db = event.target.result;
      const objectStore = db.createObjectStore("mahasiswa", { keyPath: "nim" });
      objectStore.createIndex("nama", "nama", { unique: false });
  };

  request.onsuccess = event => {
      db = event.target.result;
      showStudents();
  };

  request.onerror = event => {
      console.log("Error opening IndexedDB");
  };

  studentForm.addEventListener("submit", event => {
      event.preventDefault();
      const nim = document.getElementById("nim").value;
      const nama = document.getElementById("nama").value;

      addStudent({ nim, nama });
  });

  function addStudent(student) {
      const transaction = db.transaction(["mahasiswa"], "readwrite");
      const objectStore = transaction.objectStore("mahasiswa");
      const request = objectStore.add(student);

      request.onsuccess = () => {
          showStudents();
          document.getElementById("nim").value = "";
          document.getElementById("nama").value = "";
      };
  }

  function showStudents() {
      studentList.innerHTML = '';

      const objectStore = db.transaction("mahasiswa").objectStore("mahasiswa");

      objectStore.openCursor().onsuccess = event => {
          const cursor = event.target.result;

          if (cursor) {
              const studentRow = document.createElement("tr");
              studentRow.innerHTML = `
                  <td>${cursor.value.nim}</td>
                  <td>${cursor.value.nama}</td>
                  <td>
                      <button class="btn btn-primary btn-sm edit-btn" data-nim="${cursor.value.nim}" data-nama="${cursor.value.nama}">Edit</button>
                      <button class="btn btn-danger btn-sm delete-btn" data-nim="${cursor.value.nim}">Hapus</button>
                  </td>
              `;
              studentList.appendChild(studentRow);
              cursor.continue();
          }
      };
  }

  studentList.addEventListener('click', event => {
      if (event.target.classList.contains('edit-btn')) {
          const nim = event.target.getAttribute('data-nim');
          const nama = event.target.getAttribute('data-nama');

          document.getElementById("nim").value = nim;
          document.getElementById("nama").value = nama;

          const transaction = db.transaction(["mahasiswa"], "readwrite");
          const objectStore = transaction.objectStore("mahasiswa");
          objectStore.delete(nim);

          showStudents();
      } else if (event.target.classList.contains('delete-btn')) {
          const nim = event.target.getAttribute('data-nim');

          const transaction = db.transaction(["mahasiswa"], "readwrite");
          const objectStore = transaction.objectStore("mahasiswa");
          objectStore.delete(nim);

          showStudents();
      }
  });
});
