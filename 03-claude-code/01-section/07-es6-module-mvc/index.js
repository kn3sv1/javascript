import { server } from "./server.js";

const PORT = 3000;
// start server on port number
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
