import test from "node:test";
import assert from "node:assert/strict";
import rankingPayloadModule from "../.test-build/student-ranking-payload.js";

const { hydrateStudentRankingPayload } = rankingPayloadModule;

test("hydrates each period from one participant catalog without changing scores or positions", () => {
  const payload = {
    participants: [
      {
        id: "student-a",
        name: "Atleta A",
        email: "at***a@example.test",
        image: "data:image/jpeg;base64,avatar-a",
        weeklyGoal: 3,
        weeklyXp: 100,
        monthlyXp: 200,
        totalXp: 500,
        level: 1,
        levelTitle: "Recruta do Aço",
        totalSessions: 4,
      },
      {
        id: "student-b",
        name: "Atleta B",
        email: "at***b@example.test",
        image: null,
        weeklyGoal: 4,
        weeklyXp: 300,
        monthlyXp: 100,
        totalXp: 700,
        level: 1,
        levelTitle: "Recruta do Aço",
        totalSessions: 5,
      },
    ],
    totalParticipants: 2,
    periods: {
      weekly: { rankedStudentIds: ["student-b", "student-a"], userPosition: 2 },
      monthly: { rankedStudentIds: ["student-a", "student-b"], userPosition: 1 },
      allTime: { rankedStudentIds: ["student-b", "student-a"], userPosition: 2 },
    },
  };

  const ranking = hydrateStudentRankingPayload(payload);

  assert.equal(ranking.totalParticipants, 2);
  assert.deepEqual(ranking.top5.map((student) => student.id), ["student-b", "student-a"]);
  assert.equal(ranking.userPosition, 2);
  assert.equal(ranking.periods.weekly.allRanked[0].displayXp, 300);
  assert.equal(ranking.periods.monthly.allRanked[0].displayXp, 200);
  assert.equal(ranking.periods.allTime.allRanked[0].displayXp, 700);
  assert.equal(ranking.periods.weekly.allRanked[0].image, null);
});

test("does not create ranking rows for participant IDs missing from the catalog", () => {
  const ranking = hydrateStudentRankingPayload({
    participants: [],
    totalParticipants: 0,
    periods: {
      weekly: { rankedStudentIds: ["missing"], userPosition: 0 },
      monthly: { rankedStudentIds: [], userPosition: 0 },
      allTime: { rankedStudentIds: [], userPosition: 0 },
    },
  });

  assert.deepEqual(ranking.top5, []);
  assert.deepEqual(ranking.periods.weekly.allRanked, []);
});
