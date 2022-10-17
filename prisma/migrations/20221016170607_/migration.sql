/*
  Warnings:

  - You are about to drop the column `teacherId` on the `Pupil` table. All the data in the column will be lost.
  - Made the column `classId` on table `Exercise` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Teacher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    CONSTRAINT "Teacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Teacher" ("classId", "email", "id", "image", "name", "password") SELECT "classId", "email", "id", "image", "name", "password" FROM "Teacher";
DROP TABLE "Teacher";
ALTER TABLE "new_Teacher" RENAME TO "Teacher";
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");
CREATE TABLE "new_Pupil" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    CONSTRAINT "Pupil_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pupil" ("classId", "email", "id", "image", "name", "password", "score") SELECT "classId", "email", "id", "image", "name", "password", "score" FROM "Pupil";
DROP TABLE "Pupil";
ALTER TABLE "new_Pupil" RENAME TO "Pupil";
CREATE UNIQUE INDEX "Pupil_email_key" ON "Pupil"("email");
CREATE TABLE "new_Exercise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "exercise" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "alternative1" TEXT NOT NULL,
    "alternative2" TEXT NOT NULL,
    "alternative3" TEXT NOT NULL,
    "alternative4" TEXT NOT NULL,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    CONSTRAINT "Exercise_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Exercise_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Exercise" ("alternative1", "alternative2", "alternative3", "alternative4", "answer", "classId", "exercise", "id", "teacherId", "time") SELECT "alternative1", "alternative2", "alternative3", "alternative4", "answer", "classId", "exercise", "id", "teacherId", "time" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
