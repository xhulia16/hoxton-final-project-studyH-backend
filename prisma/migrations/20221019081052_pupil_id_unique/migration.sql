/*
  Warnings:

  - A unique constraint covering the columns `[pupilId]` on the table `Scores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Scores_pupilId_key" ON "Scores"("pupilId");
