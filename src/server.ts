import express from 'express'
import cors from 'cors'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

const port = 5000;


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


app.listen(port)

