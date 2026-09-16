import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 10000,
});

export async function runSimulation({ timeQuantum, processes }) {
  try {
    const response = await client.post("/api/simulation/run", {
      algorithm: "round_robin",
      time_quantum: timeQuantum,
      processes: processes.map(({ pid, arrivalTime, burstTime }) => ({
        pid,
        arrival_time: arrivalTime,
        burst_time: burstTime,
      })),
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const detail = error.response.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((d) => d.msg).join("; ")
        : detail || "The simulation request was rejected by the server.";
      throw new Error(message);
    }
    if (error.request) {
      throw new Error(
        "Could not reach the simulation backend. Is it running at http://localhost:8000?"
      );
    }
    throw new Error("Unexpected error while contacting the backend.");
  }
}
