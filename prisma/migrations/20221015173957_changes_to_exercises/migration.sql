-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exercise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "exercise" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "alternative1" TEXT DEFAULT '',
    "alternative2" TEXT DEFAULT '',
    "alternative3" TEXT DEFAULT '',
    "alternative4" TEXT DEFAULT '',
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacherId" INTEGER NOT NULL,
    CONSTRAINT "Exercise_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Exercise" ("alternative1", "alternative2", "alternative3", "alternative4", "answer", "exercise", "id", "teacherId", "time") SELECT "alternative1", "alternative2", "alternative3", "alternative4", "answer", "exercise", "id", "teacherId", "time" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
