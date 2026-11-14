# Process Lifecycle & Context Switching Visualizer

An interactive Operating Systems project that simulates **Round Robin CPU scheduling** and shows what happens to each process as it moves through its lifecycle. It visualizes the Gantt chart, the ready queue, context switches and a simplified Process Control Block (PCB) at every step.

A FastAPI backend runs the simulation. A React frontend replays the result step by step.

---

## Features

- **Round Robin scheduler** with a configurable time quantum, process arrival times and burst times
- **Process lifecycle view**: `NEW → READY → RUNNING → WAITING → TERMINATED`
- **Gantt chart** of CPU execution over time
- **Ready queue** and **CPU visualizer** that update as the simulation is replayed
- **Context switch visualizer** showing which process the CPU switches from and to, and when
- **PCB viewer** showing the program counter, stack pointer and registers for each process (an educational model, see the note below)
- **Statistics**: average waiting, turnaround and response time, context switch count, CPU utilization and total execution time
- **Playback controls** to run, step through and replay the simulation
- **Input validation**: duplicate process IDs, empty process lists and invalid values return clear errors
- **Standalone CLI version** (`round_robin.py`) with a text Gantt chart and an optional matplotlib chart

> **Note:** The program counter, stack pointer and registers are synthetic values generated to make context switching visible. They are a simplified teaching model and do not come from a real CPU or operating system.

---

## Tech Stack

| Layer    | Technology                                        |
|----------|---------------------------------------------------|
| Backend  | Python, FastAPI, Pydantic v2, Uvicorn             |
| Frontend | React 18, Vite, Tailwind CSS, Axios               |

---

## Project Structure

```
OS_project/
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py                  # FastAPI app, CORS, health check
│       ├── api/simulation.py        # POST /api/simulation/run
│       ├── schemas/                 # Pydantic request/response models
│       └── services/
│           ├── simulation_engine.py # Round Robin simulation
│           ├── process_manager.py   # Builds processes from input
│           ├── pcb_manager.py       # Conceptual PCB model
│           └── round_robin.py
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── pages/Simulator.jsx
│       ├── components/              # Gantt, ReadyQueue, CPUVisualizer, PCBViewer, ...
│       └── services/                # api.js (backend calls), replay.js (playback)
├── round_robin.py                   # Standalone terminal simulator
└── OS_Project_Report.pdf            # Project report
```

---

## Getting Started

### Prerequisites

- Python 3.9 or newer
- Node.js 18 or newer and npm

### 1. Run the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API runs at `http://localhost:8000`. Interactive docs are at `http://localhost:8000/docs`.

### 2. Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

The frontend expects the backend at `http://localhost:8000`, and the backend allows requests from ports `5173` and `5174`.

---

## Usage

1. Add processes with a **Process ID**, **Arrival Time** and **Burst Time**.
2. Set the **Time Quantum**.
3. Click **Run Simulation**.
4. Use the playback controls to step through the execution and watch the ready queue, CPU, context switches and PCB change.
5. Read the Gantt chart and statistics at the end.

### Standalone CLI

```bash
python3 round_robin.py
```

Enter the number of processes, their burst times and the time quantum. The program prints a text Gantt chart with waiting and turnaround times. If matplotlib and a display are available, it also opens a graphical Gantt chart.

---

## API

### `GET /api/health`

Returns `{"status": "ok"}`.

### `POST /api/simulation/run`

Request:

```json
{
  "algorithm": "round_robin",
  "time_quantum": 2,
  "processes": [
    { "pid": "P1", "arrival_time": 0, "burst_time": 5 },
    { "pid": "P2", "arrival_time": 1, "burst_time": 3 },
    { "pid": "P3", "arrival_time": 2, "burst_time": 4 }
  ]
}
```

Response fields:

| Field                 | Description                                                               |
|-----------------------|---------------------------------------------------------------------------|
| `processes`           | Final state of each process, including its timings and conceptual PCB    |
| `events`              | Chronological list of simulation events                                   |
| `gantt_chart`         | List of `{pid, start, end}` execution slices                              |
| `context_switches`    | List of `{time, from, to}` switches                                       |
| `statistics`          | Average waiting, turnaround and response time, context switches, CPU utilization, total execution time |
| `total_execution_time`| Time at which the last process finishes                                   |

Validation rules: `time_quantum` and `burst_time` must be greater than 0, `arrival_time` must be 0 or more, process IDs must be unique, and at least one process is required. Errors return HTTP 400 or 422 with a message.

---

## Key Concepts Demonstrated

- CPU scheduling with the Round Robin algorithm and the effect of the time quantum
- Process states and transitions
- Context switching and its overhead
- The Process Control Block (PCB)
- Waiting time, turnaround time, response time and CPU utilization

---

## Author

**Fathima Fahmiya**
Computer Science, Madras Institute of Technology, Anna University
GitHub: [@Fahmiya006](https://github.com/Fahmiya006)
