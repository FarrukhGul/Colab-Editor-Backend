import app from './src/app.js';
import env from './src/config/env.js';
import connectDb from './src/config/db.js';

connectDb();

const PORT = env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});