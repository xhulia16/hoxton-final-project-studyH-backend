-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Scores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "pupilId" INTEGER NOT NULL,
    CONSTRAINT "Scores_pupilId_fkey" FOREIGN KEY ("pupilId") REFERENCES "Pupil" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Scores" ("id", "pupilId", "score") SELECT "id", "pupilId", "score" FROM "Scores";
DROP TABLE "Scores";
ALTER TABLE "new_Scores" RENAME TO "Scores";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
