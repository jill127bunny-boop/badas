document.addEventListener("DOMContentLoaded", () => {
  // --- KONFIGURASI DAN DATA MASTER (Hanya untuk referensi foto) ---
  const ALL_PLAYER_DATA = [
    { name: "Sony", photoUrl: "images/Sony.png" },
    { name: "Agus", photoUrl: "images/Model.png" },
    { name: "Farid", photoUrl: "images/Model.png" },
    { name: "Adi", photoUrl: "images/Model.png" },
    { name: "Aprizal", photoUrl: "images/Model.png" },
    { name: "Dolly", photoUrl: "images/Model.png" },
    { name: "Kiting", photoUrl: "images/Model.png" },
    { name: "Adnan", photoUrl: "images/Model.png" },
    { name: "Nuril", photoUrl: "images/Model.png" },
    { name: "Idan", photoUrl: "images/Model.png" },
    { name: "Andre", photoUrl: "images/Model.png" },
    { name: "Ikhsan", photoUrl: "images/Model.png" },
    { name: "Fatih", photoUrl: "images/Model.png" },
    { name: "Farizi", photoUrl: "images/Model.png" },
    { name: "Denny", photoUrl: "images/Model.png" },
    { name: "Yudha", photoUrl: "images/Model.png" },
  ];

  const SELECTED_MARKER = " (TERPILIH)";
  const STORAGE_KEY = "badmintonPlayersData"; // Local Storage key untuk daftar pemain
  const RESULTS_HTML_KEY = "badmintonResultsHtml"; // Local Storage key untuk hasil tampilan

  let pairingCount = 1;

  // --- FUNGSI UTILITY & LOCAL STORAGE ---

  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  }

  function loadPlayersFromStorage() {
    const storedData = localStorage.getItem(STORAGE_KEY);

    // Jika ada data di storage, gunakan itu. Jika tidak, ambil dari ALL_PLAYER_DATA (default).
    if (storedData) {
      return storedData.split("\n").filter((name) => name.trim().length > 0);
    }
    return ALL_PLAYER_DATA.map((p) => p.name);
  }

  function savePlayersToStorage(playersArray) {
    const validPlayers = playersArray.filter((name) => name.trim().length > 0);
    localStorage.setItem(STORAGE_KEY, validPlayers.join("\n"));
  }

  function getAvailablePlayers(allPlayersInTextarea) {
    // Mengembalikan pemain yang TIDAK memiliki marker (TERPILIH)
    return allPlayersInTextarea
      .filter((name) => !name.includes(SELECTED_MARKER))
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }

  // --- LOGIKA PEMISAH HALAMAN ---

  // FUNGSI KHUSUS players.html (Manajemen Daftar)
  if (document.title.includes("Daftar Pemain")) {
    const playerNamesInput = document.getElementById("player-names");
    const totalPlayersSpan = document.getElementById("total-players");

    function initPlayerPage() {
      let allPlayersInTextarea = loadPlayersFromStorage();
      playerNamesInput.value = allPlayersInTextarea.join("\n"); // Tampilkan data storage di textarea
      totalPlayersSpan.textContent = allPlayersInTextarea.length;
    }

    // EVENT LISTENER: Simpan perubahan input ke Local Storage
    playerNamesInput.addEventListener("input", () => {
      let updatedNames = playerNamesInput.value.split("\n");
      savePlayersToStorage(updatedNames);
      totalPlayersSpan.textContent = updatedNames.filter(
        (n) => n.trim().length > 0
      ).length;
    });

    // PENTING: Jika halaman pertama kali dibuka, simpan daftar default ke storage
    if (!localStorage.getItem(STORAGE_KEY)) {
      savePlayersToStorage(ALL_PLAYER_DATA.map((p) => p.name));
    }

    initPlayerPage();

    // FUNGSI KHUSUS index.html (Pengacakan)
  } else if (document.title.includes("BADAS")) {
    const drawButton = document.getElementById("draw-button");
    const resetButton = document.getElementById("reset-button");
    const resultsDiv = document.getElementById("results");
    const totalPlayersSpan = document.getElementById("total-players");

    // --- FUNGSIONALITAS PENGACAKAN ---

    function getPlayerHtml(playerName) {
      const playerData = ALL_PLAYER_DATA.find((p) => p.name === playerName);

      if (!playerData) {
        return `<div class="player-display"><p class="player-name"><b>${playerName}</b><br>(Foto tidak ditemukan)</p></div>`;
      }

      return `
                <div class="player-display">
                    <img src="${playerData.photoUrl}" alt="${playerData.name}" class="player-photo">
                    <p class="player-name">${playerData.name}</p>
                </div>
            `;
    }

    function updateStatusAndSave(selectedPlayersRaw) {
      let allPlayersInTextarea = loadPlayersFromStorage();

      const updatedPlayers = allPlayersInTextarea.map((name) => {
        const cleanName = name.replace(SELECTED_MARKER, "").trim();

        // Tandai pemain yang baru terpilih
        if (
          selectedPlayersRaw.includes(cleanName) &&
          !name.includes(SELECTED_MARKER)
        ) {
          return name.trim() + SELECTED_MARKER;
        }
        return name;
      });

      savePlayersToStorage(updatedPlayers);
      return updatedPlayers; // Mengembalikan daftar yang diupdate
    }

    function initDrawPage() {
      let allPlayersInTextarea = loadPlayersFromStorage();
      let availablePlayers = getAvailablePlayers(allPlayersInTextarea);

      // Muat hasil HTML yang tersimpan
      const savedHtml = localStorage.getItem(RESULTS_HTML_KEY);
      if (savedHtml) {
        resultsDiv.innerHTML = savedHtml;
        pairingCount = resultsDiv.querySelectorAll(".pairing").length + 1;
      } else {
        resultsDiv.innerHTML = "";
        pairingCount = 1;
      }

      totalPlayersSpan.textContent = availablePlayers.length;
      drawButton.disabled = availablePlayers.length < 4;

      const selectedCount =
        allPlayersInTextarea.length - availablePlayers.length;
      resetButton.style.display = selectedCount > 0 ? "block" : "none";

      const statusMessage = resultsDiv.querySelector(".status-message");
      if (statusMessage) statusMessage.remove();

      if (availablePlayers.length < 4) {
        const messageHtml = `<div class="pairing status-message" ><h3>Perhatian!</h3><p>Hanya tersisa ${availablePlayers.length} pemain. Klik Reset</p></div>`;
        resultsDiv.insertAdjacentHTML("afterbegin", messageHtml);
      }
    }

    function drawPairing() {
      let availablePlayers = getAvailablePlayers(loadPlayersFromStorage());

      if (availablePlayers.length < 4) {
        initDrawPage();
        return;
      }

      shuffle(availablePlayers);
      const selectedPlayersRaw = availablePlayers.splice(0, 4);

      const updatedPlayersList = updateStatusAndSave(selectedPlayersRaw); // Simpan status terpilih

      const teamA = [selectedPlayersRaw[0], selectedPlayersRaw[1]];
      const teamB = [selectedPlayersRaw[2], selectedPlayersRaw[3]];
      const pairingId = pairingCount++;

      const teamAHtml = getPlayerHtml(teamA[0]) + getPlayerHtml(teamA[1]);
      const teamBHtml = getPlayerHtml(teamB[0]) + getPlayerHtml(teamB[1]);

      const html = `
                <div class="pairing slide-in-left">
                    <div class="match-info">Pertandingan Ke-${pairingId}</div>
                    
                    <div class="teams-container">
                    
                        <div class="team-column-wrapper">
                            <h4>Pasangan 1</h4>
                            <div class="player-pair-row">
                                ${getPlayerHtml(teamA[0])}
                                ${getPlayerHtml(teamA[1])}
                            </div>
                        </div>
                        
                        <div class="versus">
                            <p>VS</p>
                        </div>
                        
                        <div class="team-column-wrapper">
                            <h4>Pasangan 2</h4>
                            <div class="player-pair-row">
                                ${getPlayerHtml(teamB[0])}
                                ${getPlayerHtml(teamB[1])}
                            </div>
                        </div>
                    </div>
                </div>
            `;
      resultsDiv.insertAdjacentHTML("afterbegin", html);

      // Simpan hasil tampilan ke Local Storage
      localStorage.setItem(RESULTS_HTML_KEY, resultsDiv.innerHTML);

      initDrawPage();
    }

    // EVENT LISTENER UNTUK TOMBOL RESET
    resetButton.addEventListener("click", () => {
      let allPlayersInTextarea = loadPlayersFromStorage();

      // Hapus semua marker (TERPILIH)
      let cleanedNames = allPlayersInTextarea.map((name) =>
        name.replace(SELECTED_MARKER, "").trim()
      );

      // Simpan status bersih ke Local Storage
      savePlayersToStorage(cleanedNames);

      // Hapus hasil tampilan
      localStorage.removeItem(RESULTS_HTML_KEY);

      resultsDiv.innerHTML = "<h2>Hasil</h2>";
      pairingCount = 1;

      initDrawPage();
    });

    drawButton.addEventListener("click", drawPairing);
    initDrawPage(); // Inisialisasi tampilan di awal
  }
});
