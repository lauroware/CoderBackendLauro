import app from "./server.js";
import { PORT } from "./src/config/index.config.js";

const server = app.listen(PORT, () => {
  console.log(`Esuchando el puerto: ${server.address().port}`);
});
server.on("error", (error) => console.log(error));
