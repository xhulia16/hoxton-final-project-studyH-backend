import express from 'express'
import cors from 'cors'
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

const port = 5000;

const SECRET = "ABC";

function getToken(id: number) {
    return jwt.sign({ id: id }, SECRET, { expiresIn: "5 hours" });
  }

  async function getCurrentPupil(token: string) {
    // @ts-ignore
    const { id } = jwt.verify(token, SECRET);
    const user = await prisma.pupil.findUnique({ where: { id: id } });
    return user;
  }

  async function getCurrentTeacher(token: string) {
    // @ts-ignore
    const { id } = jwt.verify(token, SECRET);
    const user = await prisma.teacher.findUnique({ where: { id: id } });
    return user;
  }
  

app.get("/class", async (req, res) => {
    const classes = await prisma.class.findMany(
        {
            include: {
                teachers: {
                    include: {
                        pupils:
                            { select: { id: true, image: true, name: true } }
                    }
                }
            }
        })
})


app.get("/scores-students", async (req, res)=>{
    prisma.scores.findMany({
        orderBy:{score: "desc"}, 
        take:3,
        include: {
            pupil:
            {
                select:
                    { id: true, image: true, name: true }
            }
        }
    })
})

app.get("/scores-teacher", async(req, res)=>{
    prisma.scores.findMany({
        orderBy:{score: "desc"}, 
        include: {
            pupil:
            {
                select:
                    { id: true, image: true, name: true }
            }
        }
    })
})

//change password for user

app.patch("/users/:id", async (req, res) => {
    const id = Number(req.params.id);
    const passChanged = await prisma.teacher.update({
      where: { id },
      data: { password: bcrypt.hashSync(req.body.password) },
    });
    res.send(passChanged);
  });


  app.post("/sign-in/teacher", async (req, res) => {
    try {
      const user = await prisma.teacher.findUnique({
        where: { email: req.body.email },
      });
  
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        res.send({ user: user, token: getToken(user.id) });
      } else {
        res.status(400).send({ message: "User did not log in" });
      }
    } catch (error) {
      // @ts-ignore
      res.status(400).send({ error: error.message });
    }
  });

  app.post("/sign-in/pupil", async (req, res) => {
    try {
      const user = await prisma.pupil.findUnique({
        where: { email: req.body.email },
      });
  
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        res.send({ user: user, token: getToken(user.id) });
      } else {
        res.status(400).send({ message: "User did not log in" });
      }
    } catch (error) {
      // @ts-ignore
      res.status(400).send({ error: error.message });
    }
  });

app.get("/validate/pupil", async (req, res) => {
    try {
      if (req.headers.authorization) {
        const user = await getCurrentPupil(req.headers.authorization);
        // @ts-ignore
        res.send({ user, token: getToken(user.id) });
      }
    } catch (error) {
      // @ts-ignore
      res.status(400).send({ error: error.message });
    }
  });

  app.get("/validate/teacher", async (req, res) => {
    try {
      if (req.headers.authorization) {
        const user = await getCurrentTeacher(req.headers.authorization);
        // @ts-ignore
        res.send({ user, token: getToken(user.id) });
      }
    } catch (error) {
      // @ts-ignore
      res.status(400).send({ error: error.message });
    }
  });


app.listen(port)

