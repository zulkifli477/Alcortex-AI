import analyzePatientData from "../analyzePatientData";
import { PatientData } from "../../types";
import test, { describe } from "node:test";
import assert from "node:assert";

describe("analyzePatientData", () => {
  test("returns expected shape and summary", () => {
    const patient: PatientData = {
      complaints: "cough",
      history: "no chronic disease",
      meds: "none",
      labBlood: { wbc: 10 },
      labUrine: {},
      labSputum: {},
      vitals: {
        bpSystolic: 120,
        bpDiastolic: 80,
        heartRate: 70,
        respiratoryRate: 16,
        temperature: 37,
        spo2: 98
      },
      smoking: "no",
      alcohol: "no"
    } as PatientData;

    const result = analyzePatientData(patient);
    assert(result.summary.includes("Complaints: cough"));
    assert.deepEqual(result.labs.blood, { wbc: 10 });
  });
});
