const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")();
const socketapi = {
  io: io,
};

const games = [];

const clients = [];

const create = () => {
  const game = {
    gameId: uuidv4(),
    X: null,
    O: null,
    board: ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
    move: "X",
    result: "0",
  };
  games[game.gameId] = game;
  return game;
};

const updatePlayers = (game, name) => {
  if (game.X)
    clients[game.X.clientId].socket.emit(
      name,
      JSON.stringify(games[game.gameId])
    );
  if (game.O)
    clients[game.O.clientId].socket.emit(
      name,
      JSON.stringify(games[game.gameId])
    );
  console.log(games[game.gameId]);
};

const checkBoard = (board) => {
  if (board[0] === board[1] && board[0] === board[2] && board[0] !== "0")
    return board[0];
  if (board[3] === board[4] && board[3] === board[5] && board[3] !== "0")
    return board[3];
  if (board[6] === board[7] && board[6] === board[8] && board[6] !== "0")
    return board[6];
  if (board[0] === board[3] && board[0] === board[6] && board[0] !== "0")
    return board[0];
  if (board[1] === board[4] && board[1] === board[7] && board[1] !== "0")
    return board[1];
  if (board[2] === board[5] && board[2] === board[8] && board[2] !== "0")
    return board[2];
  if (board[0] === board[4] && board[0] === board[8] && board[0] !== "0")
    return board[0];
  if (board[2] === board[4] && board[2] === board[6] && board[2] !== "0")
    return board[2];
  return 0;
};

// Add your socket.io logic here!

io.on("connection", (socket) => {
  const clientId = uuidv4();
  clients[clientId] = { socket: socket, username: "Player", gameId: null };
  socket.emit("connection", JSON.stringify({ clientId: clientId }));
  socket.on("create", () => {
    socket.emit("create", JSON.stringify(create()));
  });
  socket.on("join", (data) => {
    const game = games[JSON.parse(data).gameId];
    clients[JSON.parse(data).clientId].gameId = JSON.parse(data).gameId;
    if (!game.X)
      game.X = {
        clientId: JSON.parse(data).clientId,
        username: clients[JSON.parse(data).clientId].username,
      };
    else if (!game.O)
      game.O = {
        clientId: JSON.parse(data).clientId,
        username: clients[JSON.parse(data).clientId].username,
      };
    else socket.emit("create", JSON.stringify(create()));
    updatePlayers(game, "join");
  });
  socket.on("username", (data) => {
    const client = JSON.parse(data);
    clients[client.clientId].username = client.username;
    if (games[clients[client.clientId].gameId]) {
      if (
        games[clients[client.clientId].gameId].X &&
        games[clients[client.clientId].gameId].X.clientId == client.clientId
      )
        games[clients[client.clientId].gameId].X.username = client.username;
      if (
        games[clients[client.clientId].gameId].O &&
        games[clients[client.clientId].gameId].O.clientId == client.clientId
      )
        games[clients[client.clientId].gameId].O.username = client.username;
      updatePlayers(games[clients[client.clientId].gameId], "join");
    }
  });
  socket.on("move", (data) => {
    games[JSON.parse(data).gameId].board[JSON.parse(data).tile] =
      games[JSON.parse(data).gameId].move;
    games[JSON.parse(data).gameId].move =
      games[JSON.parse(data).gameId].move === "X" ? "O" : "X";
    games[JSON.parse(data).gameId].result = checkBoard(
      games[JSON.parse(data).gameId].board
    );
    updatePlayers(games[JSON.parse(data).gameId], "move");
  });
});
// end of socket.io logic

module.exports = socketapi;
