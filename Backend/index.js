const express = require("express");
const cors = require("cors");
const { pool } = require("./database/connection.js");
const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on PORT:${PORT}`);
});

//Middlewares
app.use(express.json());
app.use(cors());

//PATHS
app.get("/posts", async (req, res) => {
    try {
        const query = "SELECT * FROM posts;";
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.log("Error del GET:", error.message);
    }
});

app.post("/posts", async (req, res) => {
    try {
        const { titulo, url, descripcion } = req.body;
        if (titulo === "" || url === "" || descripcion === "") {
            throw {
                code: 400,
                message: `Llenar todos los campos correctamente!`,
            };
        }
        const id = Math.floor(Math.random() * 9999);
        const query =
            "INSERT INTO posts (id, titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4, $5)";
        const values = [id, titulo, url, descripcion, 0];
        const result = await pool.query(query, values);
        res.send("Post creado");
    } catch (error) {
        console.log("Error del POST:", error.message);
        res.status(error.code).json(error.message);
    }
});

app.put("/posts/like/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const values = [id];
        const query =
            "UPDATE posts SET likes = COALESCE (likes, 0) + 1 WHERE id = $1";
        const result = await pool.query(query, values);
        res.send("like agregado");
    } catch (error) {
        console.log("Error del PUT:", error.message);
    }
});

app.delete("/posts/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const values = [id];
        const query = "DELETE FROM posts WHERE id = $1";
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            throw {
                code: 404,
                message: `El ID: ${id} no existe`,
            };
        }
        res.send("Post borrado con exito");
    } catch (error) {
        res.status(error.code).json(error.message);
        console.log("Error del DELETE:", error.message);
    }
});
