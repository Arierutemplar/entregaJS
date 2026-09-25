import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Ruta de prueba básica
app.get('/', (req, res) => {
  res.json({ message: '¡Servidor de turnos y reservas funcionando correctamente!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});