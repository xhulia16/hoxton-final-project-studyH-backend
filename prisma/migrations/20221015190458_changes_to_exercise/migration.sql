/*
  Warnings:

  - Made the column `alternative1` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `alternative2` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `alternative3` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `alternative4` on table `Exercise` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "Exercise_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Exercise" ("alternative1", "alternative2", "alternative3", "alternative4", "answer", "exercise", "id", "teacherId", "time") SELECT "alternative1", "alternative2", "alternative3", "alternative4", "answer", "exercise", "id", "teacherId", "time" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
