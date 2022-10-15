/*
  Warnings:

  - You are about to drop the `Alternatives` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `alternative1` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alternative2` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alternative3` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alternative4` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Alternatives";
PRAGMA foreign_keys=on;

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
INSERT INTO "new_Exercise" ("answer", "exercise", "id", "teacherId", "time") SELECT "answer", "exercise", "id", "teacherId", "time" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
