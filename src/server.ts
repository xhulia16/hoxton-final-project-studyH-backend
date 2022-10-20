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
  const user = await prisma.pupil.findUnique({ where: { id: id }, include: { class: { include: { pupils: { select: { name: true, image: true, id: true } } } } } });
  return user;
}

async function getCurrentTeacher(token: string) {
  // @ts-ignore
  const { id } = jwt.verify(token, SECRET);
  const user = await prisma.teacher.findUnique({ where: { id: id }, include: { class: { include: { pupils: { select: { name: true, image: true, id: true } } } } } });
  return user;
}



app.get("/class/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const pupil = await prisma.pupil.findUnique({ where: { id } })
    const classId = pupil?.classId

    const userAnswers = await prisma.answer.findMany({ where: { pupilId: id }, select: { exerciseId: true } })
    const matches = userAnswers.map(item => item.exerciseId)

    const userClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        exercises: {
          where: { id: { notIn: matches } },
          select: {
            alternative1: true, alternative2: true, alternative3: true, alternative4: true,
            exercise: true, id: true, time: true, teacher: {
              select: { name: true, image: true }
            }
          }
        }, pupils: {
          orderBy: { score: 'desc' },
          take: 3,
          select: {
            name: true,
            image: true,
            score: true
          }
        }
      }
    })
    res.send(userClass)
  }

  catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

app.get("/class/teacher/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const teacher = await prisma.teacher.findUnique({ where: { id } })
    const classId = teacher?.classId

    const userClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        exercises: {include: {answers:true}},
         pupils: {
          orderBy: { score: 'desc' },
          select: {
            name: true,
            image: true,
            score: true
          }
        }
      }
    })
    res.send(userClass)
  }

  catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

app.get("/answers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const answers = await prisma.answer.findMany({
      where: { pupilId: id },
      include: {
        exercise:
        {
          include:
          {
            teacher: { select: { name: true, image: true } },
            comments: { include: { pupil: { select: { name: true, image: true } } } }

          }
        }
      }
    })
    res.send(answers)
  }
  catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

app.patch("/pupil/:id", async (req, res) => {
  try {
    const { score, exerciseId } = req.body
    const id = Number(req.params.id)

    const pupilAnswer = await prisma.answer.findFirst({ where: { exerciseId: exerciseId, pupilId: id } })
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } })

    if (pupilAnswer && exercise) {
      if (pupilAnswer.answer.toLowerCase() === exercise.answer.toLowerCase()) {
        const newScore = await prisma.pupil.update({
          where: { id: id }, data: {
            score: score
          }
        })
      }

      const pupil = await prisma.pupil.findUnique({ where: { id: id } })
      const classId = pupil?.classId

      const classScores = await prisma.class.findUnique({
        where: { id: classId }, select: {
          pupils: {
            orderBy: { score: 'desc' },
            take: 3,
            select: {
              name: true,
              image: true,
              score: true
            }
          }
        }
      })

      res.send(classScores)

    }
    else {
      res.status(400).send({ message: "Pupil or exercise is null!" })
    }
  }
  catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] })
  }
});

app.get("/pupil/score/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const pupil = await prisma.pupil.findUnique({ where: { id }, select: { score: true, name: true } })
    if (pupil) {
      res.send(pupil)
    }
    else {
      res.status(400).send({ message: "No pupil found" })
    }
  }
  catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});


app.post("/comments", async (req, res) => {
  try {
    const { exerciseId, pupilId, comment } = req.body
    const newComment = await prisma.comment.create({
      data: {
        exerciseId: exerciseId,
        pupilId: pupilId,
        comment: comment
      }
    })

    const answers = await prisma.answer.findMany({
      where: { pupilId },
      include: {
        exercise:
        {
          include:
          {
            teacher: { select: { name: true, image: true } },
            comments: { include: { pupil: { select: { name: true, image: true } } } }

          }
        }
      }
    })
    res.send(answers)
  }
  catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

app.post("/exercises", async (req, res) => {
  try {
    const { exercise, answer, teacherId, alternative1, alternative2, alternative3, alternative4, classId } = req.body
    const newexercise = await prisma.exercise.create({
      data: {
        exercise: exercise,
        answer: answer,
        teacherId: teacherId,
        classId: classId,
        alternative1: alternative1,
        alternative2: alternative2,
        alternative3: alternative3,
        alternative4: alternative4
      }
    })
    res.send(newexercise)
  }

  catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

//do i need this??????
// app.get("/scores-students/:id", async (req, res) => {
//   try{
//     const id= Number(req.params.id)
//     const classScores= await prisma.class.findUnique({where:{id:id}, select: {pupils: {
//       orderBy: { score: 'desc' },
//       take: 3,
//       select: {
//         name: true, 
//         image: true, 
//         score:true
//       }
//     }}} )

//     res.send(classScores)
//   }
//   catch (error) {
//     // @ts-ignore
//     res.status(400).send({ errors: [error.message] });
//   }
// });

// app.get("/scores-teacher", async (req, res) => {
//   prisma.scores.findMany({
//     orderBy: { score: "desc" },
//     include: {
//       pupil:
//       {
//         select:
//           { id: true, image: true, name: true }
//       }
//     }
//   })
// })


app.get("/exercise/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const singleExercise = await prisma.exercise.findUnique({ where: { id } })
    res.send(singleExercise)
  }
  catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

app.post("/answers", async (req, res) => {
  try {
    const { answer, exerciseId, pupilId } = req.body

    const currentAnswer = await prisma.answer.findFirst({ where: { exerciseId: exerciseId, AND: { pupilId: pupilId } } })

    if (currentAnswer) {
      res.status(400).send({ message: "You have already answered this exercise" });
    }
    else {
      const userAnswer = await prisma.answer.create({
        data: {
          answer: answer,
          exerciseId: exerciseId,
          pupilId: pupilId
        }
      })
      const userAnswers = await prisma.answer.findMany({ where: { pupilId: pupilId }, select: { exerciseId: true } })
      const matches = userAnswers.map(item => item.exerciseId)

      //we need the exercises where the id of the user and the id of the exercise (userId, exerciseId) matches the answer ids

      const pupil = await prisma.pupil.findUnique({ where: { id: pupilId } })
      const classId = pupil?.classId

      const userClass = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          exercises: {
            where: { id: { notIn: matches } },
            select: {
              alternative1: true, alternative2: true, alternative3: true, alternative4: true,
              exercise: true, id: true, time: true, teacher: {
                select: { name: true, image: true }
              }
            }
          }, pupils: {
            orderBy: { score: 'desc' },
            take: 3,
            select: {
              name: true,
              image: true,
              score: true
            }
          }
        }
      })
      res.send(userClass)
    }
  }

  catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

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
      where: { email: req.body.email }, include: { class: { include: { pupils: { select: { name: true, image: true, id: true } } } } }
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
      where: { email: req.body.email }, include: { class: { include: { pupils: { select: { image: true, id: true, name: true } } } } }
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

