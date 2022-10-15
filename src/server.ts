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


app.get("/class/:id", async (req, res) => {
  const id=Number(req.params.id)
  const classes = await prisma.class.findMany(
    { where: {id},
      select: {
        teachers: {
          select:
          {
            exercises: {
              select: {
                exercise: true,
                alternative1: true,
                alternative2: true,
                alternative3: true,
                alternative4: true,
                time: true,
              }
            },
            image: true,
            name: true,
          }
        },
        pupils: { select: { id: true, image: true, name: true } }
      }
    })
    res.send(classes)
})


app.post("/exercises", async (req, res) => {
  const { exercise, answer, teacherId, alternative1, alternative2, alternative3, alternative4 } = req.body
  const newexercise = await prisma.exercise.create({
    data: {
      exercise: exercise,
      answer: answer,
      teacherId: teacherId,
      alternative1: alternative1,
      alternative2: alternative2,
      alternative3: alternative3,
      alternative4: alternative4
    }
  })
  res.send(newexercise)
})



app.get("/scores-students", async (req, res) => {
  prisma.scores.findMany({
    orderBy: { score: "desc" },
    take: 3,
    include: {
      pupil:
      {
        select:
          { id: true, image: true, name: true }
      }
    }
  })
})

app.get("/scores-teacher", async (req, res) => {
  prisma.scores.findMany({
    orderBy: { score: "desc" },
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

app.patch("/teacher/:id", async (req, res) => {
  const id = Number(req.params.id);
  const passChanged = await prisma.pupil.update({
    where: { id },
    data: { password: bcrypt.hashSync(req.body.password) },
  });
  res.send(passChanged);
});


//

app.post("/sign-in/teacher", async (req, res) => {

  const { email, password } = req.body

  try {

    const errors: string[] = []

    if (typeof email !== 'string') {
      errors.push('Email missing or not a string')
    }

    if (typeof password !== 'string') {
      errors.push('Password missing or not a string')
    }

    if (errors.length > 0) {
      res.status(400).send({ errors })
      return
    }

    const user = await prisma.teacher.findUnique({
      where: { email: req.body.email },
    });

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.send({ user: user, token: getToken(user.id) });
    } else {
      res.status(400).send({ errors: ['Username/password invalid.'] })
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] })
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
    res.status(400).send({ errors: [error.message] });
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
    res.status(400).send({ errors: [error.message] });
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
    res.status(400).send({ errors: [error.message] });
  }
});


app.listen(port)

