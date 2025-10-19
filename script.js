document.addEventListener("DOMContentLoaded", () => {
  // --- DATA PEMAIN LENGKAP UNTUK FOTO (TIDAK DITAMPILKAN DI ANTARMUKA) ---
  const ALL_PLAYER_DATA = [
    { name: "Sony", photoUrl: "images/Sony.png" },
    { name: "Setiawan", photoUrl: "images/Model.png" },
    { name: "Faridz", photoUrl: "images/Model.png" },
    { name: "Awan", photoUrl: "images/Model.png" },
    { name: "Aprizal", photoUrl: "images/Model.png" },
    { name: "Doly", photoUrl: "images/Model.png" },
    { name: "Qtink", photoUrl: "images/Model.png" },
    { name: "AFN", photoUrl: "images/Model.png" },
    { name: "ANR", photoUrl: "images/Model.png" },
    { name: "Idans", photoUrl: "images/Model.png" },
    { name: "Drew", photoUrl: "images/Model.png" },
    { name: "Da'un", photoUrl: "images/Model.png" },
    { name: "Far1s", photoUrl: "images/Model.png" },
    { name: "Arizz", photoUrl: "images/Model.png" },
    { name: "Denny", photoUrl: "images/Model.png" },
    { name: "Yudha", photoUrl: "images/Model.png" },
  ];

  const SELECTED_MARKER = " (TERPILIH)";
  const STORAGE_KEY = "badmintonPlayersData";
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
    if (storedData) {
      return storedData.split("\n");
    }
    return ALL_PLAYER_DATA.map((p) => p.name);
  }

  function savePlayersToStorage(playersArray) {
    const validPlayers = playersArray.filter((name) => name.trim().length > 0);
    localStorage.setItem(STORAGE_KEY, validPlayers.join("\n"));
  }

  function getAvailablePlayers(allPlayersInTextarea) {
    return allPlayersInTextarea
      .filter((name) => !name.includes(SELECTED_MARKER))
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }

  // FUNGSI KHUSUS players.html (Manajemen Daftar)
  if (document.title.includes("Daftar Pemain")) {
    const playerNamesInput = document.getElementById("player-names");
    const totalPlayersSpan = document.getElementById("total-players");

    function initPlayerPage() {
      let allPlayersInTextarea = loadPlayersFromStorage();
      playerNamesInput.value = allPlayersInTextarea.join("\n");

      const availablePlayers = getAvailablePlayers(allPlayersInTextarea);
      totalPlayersSpan.textContent = allPlayersInTextarea.length;
    }

    initPlayerPage();

    // FUNGSI KHUSUS index.html (Pengacakan, Tampilan Foto, dan Reset)
  } else if (document.title.includes("BADAS")) {
    const drawButton = document.getElementById("draw-button");
    const resetButton = document.getElementById("reset-button"); // Ambil elemen reset
    const resultsDiv = document.getElementById("results");
    const totalPlayersSpan = document.getElementById("total-players");

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

    function updateStatusAndSave(selectedNamesRaw) {
      let allPlayersInTextarea = loadPlayersFromStorage();

      const updatedPlayers = allPlayersInTextarea.map((name) => {
        const cleanName = name.replace(SELECTED_MARKER, "").trim();

        if (
          selectedNamesRaw.includes(cleanName) &&
          !name.includes(SELECTED_MARKER)
        ) {
          return name.trim() + SELECTED_MARKER;
        }
        return name;
      });

      savePlayersToStorage(updatedPlayers);
      return getAvailablePlayers(updatedPlayers);
    }

    function initDrawPage() {
      let allPlayersInTextarea = loadPlayersFromStorage();
      let availablePlayers = getAvailablePlayers(allPlayersInTextarea);

      totalPlayersSpan.textContent = availablePlayers.length;
      drawButton.disabled = availablePlayers.length < 4;

      const selectedCount =
        allPlayersInTextarea.length - availablePlayers.length;
      resetButton.style.display = selectedCount > 0 ? "block" : "none"; // Tampilkan reset jika ada yang terpilih

      // Hapus pesan status sebelumnya
      const statusMessage = resultsDiv.querySelector(".status-message");
      if (statusMessage) statusMessage.remove();

      // Tampilkan pesan status baru
      if (availablePlayers.length < 4) {
        const messageHtml = `<div class="pairing status-message" ><h3>Perhatian!</h3><p>Hanya tersisa ${availablePlayers.length} pemain. Klik **Reset** di bawah ini.</p></div>`;
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

      const remainingPlayers = updateStatusAndSave(selectedPlayersRaw);

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

      initDrawPage();
    }

    // EVENT LISTENER UNTUK TOMBOL RESET
    resetButton.addEventListener("click", () => {
      let allPlayersInTextarea = loadPlayersFromStorage();
      let cleanedNames = allPlayersInTextarea.map((name) =>
        name.replace(SELECTED_MARKER, "").trim()
      );

      // Simpan status bersih ke Local Storage
      savePlayersToStorage(cleanedNames);

      // Hapus hasil pertandingan sebelumnya
      resultsDiv.innerHTML = "<h2>Hasil</h2>";
      pairingCount = 1;

      initDrawPage(); // Muat ulang tampilan setelah reset
    });

    drawButton.addEventListener("click", drawPairing);
    initDrawPage();
  }
});
