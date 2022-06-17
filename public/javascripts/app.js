let myMove = false;
const socket = io();
socket.on("connection", (data) => {
  sessionStorage.setItem("clientId", JSON.parse(data).clientId);
  const username = localStorage.getItem("username");
  const gameId = new URL(document.location).searchParams.get("gameId");
  if (gameId) join(gameId);
  if (username) {
    document.getElementById("EditUsernameText").value = username;
    socket.emit(
      "username",
      JSON.stringify({
        clientId: sessionStorage.getItem("clientId"),
        username: EditUsernameText.value,
      })
    );
  }
});
socket.on("create", (data) => {
  join(JSON.parse(data).gameId);
  const CopyLinkBtn = document.getElementById("CopyLink");
  CopyLinkBtn.disabled = false;
  CopyLinkBtn.addEventListener("click", () =>
    navigator.clipboard.writeText(
      `${document.location.origin}?gameId=${JSON.parse(data).gameId}`
    )
  );
});
socket.on("join", (data) => {
  const game = JSON.parse(data);
  sessionStorage.setItem("game", data);
  document.getElementById("xPlayer").innerText = `X : ${game.X.username}`;
  document.getElementById("oPlayer").innerText = `O : ${game.O.username}`;
  myMove =
    (game.X.clientId === sessionStorage.getItem("clientId") &&
      game.move === "X") ||
    (game.O.clientId === sessionStorage.getItem("clientId") &&
      game.move === "O");
  Array.from(document.getElementsByClassName("box")).forEach((box) => {
    if (!myMove) box.classList.replace("boxEnabled", "disabledBox");
    else box.classList.replace("disabledBox", "boxEnabled");
    box.innerHTML =
      game.X.clientId === sessionStorage.getItem("clientId")
        ? "<span>X</span>"
        : "<span>O</span>";
  });
});
socket.on("move", (data) => {
  const game = JSON.parse(data);
  myMove =
    (game.X.clientId === sessionStorage.getItem("clientId") &&
      game.move === "X") ||
    (game.O.clientId === sessionStorage.getItem("clientId") &&
      game.move === "O");

  if (game.result != "0") {
    myMove = false;
    alert(game.result === "Tie" ? "Its a tie" : `${game.result} Wins the game`);
    document.location.replace("/");
  }

  Array.from(document.getElementsByClassName("box")).forEach((box) => {
    if (!myMove) box.classList.replace("boxEnabled", "disabledBox");
    else box.classList.replace("disabledBox", "boxEnabled");
  });

  for (let i = 0; i < game.board.length; i++) {
    if (game.board[i] !== "0") {
      document.getElementById(`Box${i}`).classList.add("filledBox");
      document.getElementById(
        `Box${i}`
      ).innerHTML = `<span>${game.board[i]}</span>`;
    }
  }
});
const move = (tile) => {
  if (
    myMove &&
    !document.getElementById(`Box${tile}`).classList.contains("filledBox")
  ) {
    socket.emit(
      "move",
      JSON.stringify({
        gameId: JSON.parse(sessionStorage.getItem("game")).gameId,
        tile: tile,
      })
    );
  }
};
const create = () => {
  socket.emit("create");
};
const join = (gameId) => {
  socket.emit(
    "join",
    JSON.stringify({
      gameId: gameId,
      clientId: sessionStorage.getItem("clientId"),
    })
  );
};
var editUsernameBool = false;
const editUsername = () => {
  const EditUsernameButton = document.getElementById("EditUsernameButton");
  const EditUsernameText = document.getElementById("EditUsernameText");
  if (!editUsernameBool) {
    EditUsernameButton.innerText = "✓";
    editUsernameBool = true;
    EditUsernameText.disabled = false;
  } else {
    EditUsernameButton.innerText = "✎";
    editUsernameBool = false;
    EditUsernameText.disabled = true;
    socket.emit(
      "username",
      JSON.stringify({
        clientId: sessionStorage.getItem("clientId"),
        username: EditUsernameText.value,
      })
    );
    localStorage.setItem("username", EditUsernameText.value);
  }
};
