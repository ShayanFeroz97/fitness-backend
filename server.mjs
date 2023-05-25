import express from "express";
import mongoose from "mongoose";
import { ExerciseModel } from "./Models/Exercise.mjs";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "./Models/User.mjs";
import jwt from "jsonwebtoken";
import { Auth } from "./Auth.mjs";

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(morgan("tiny"));

dotenv.config();

const MONGODB_SERVER = process.env.MONGODB_SERVER;
const PORT = process.env.PORT || 8080;

app.get("/getcards", async (req, res) => {
  try {
    const getdata = await ExerciseModel.find();
    res.status(200).json(getdata);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post("/adddata", async (req, res) => {
  try {
    const addtodb = await ExerciseModel.create(req.body);
    res.status(200).json(req.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// EDIT DATA
app.put("/data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const dataUpdate = await ExerciseModel.findByIdAndUpdate(id, req.body);
    if (!dataUpdate) {
      res.status(404).json(`error #404, data not found on id: ${id}`);
    }
    const updateddata = await ExerciseModel.findById(id);
    res.status(200).json(updateddata);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE DATA
app.delete("/data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedata = await ExerciseModel.findByIdAndDelete(id);
    if (!deletedata) {
      res.status(404).json(`error #404, data not found on id: ${id}`);
    }
    res.status(200).json(deletedata);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post("/register", (req, res) => {
  try {
    const { username, email, password } = req.body;
    bcrypt.hash(password, 10).then((hashedPassword) => {
      const user = new User({ username, email, password: hashedPassword });
      user.save();
      return res.status(201).send({ user });
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    User.findOne({ email })
      .then((user) => {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result)
            return res.status(401).send(err || "Wrong Password");
          const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1m" }
          );
          const refreshToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_REFRESH_SECRET
          );
          const { password, ...restParams } = user._doc;
          return res
            .status(201)
            .send({ user: restParams, token, refreshToken });
        });
      })
      .catch((err) => {
        return res.status(404).send("User Not Found!");
      });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

app.get("/refresh", Auth, (req, res) => {
  try {
    const { user } = req;
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET
    );
    return res.status(201).send({ token });
  } catch (err) {
    return res.status(404).send("User Not Found!");
  }
});

app.get("/protected", Auth, (req, res) => {
  try {
    return res.status(201).send("Protected Routes");
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

mongoose
  .connect(MONGODB_SERVER)
  .then(() => {
    console.log("database connected");

    app.listen(PORT, () => {
      console.log("server running");
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
