import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const PORT = 5000;

const __filename = fileURLToPath(
  import.meta.url
);

const __dirname = path.dirname(
  __filename
);

const dataFile = path.join(
  __dirname,
  "data",
  "events.json"
);

/* =========================================
   MIDDLEWARE
========================================= */

app.use(cors());

app.use(express.json());

/* =========================================
   DATABASE FUNCTIONS
========================================= */

function readEvents() {
  try {
    const data = fs.readFileSync(
      dataFile,
      "utf-8"
    );

    return JSON.parse(data);
  } catch (error) {
    console.error(
      "Database read error:",
      error
    );

    return [];
  }
}

function saveEvents(events) {
  fs.writeFileSync(
    dataFile,
    JSON.stringify(
      events,
      null,
      2
    ),
    "utf-8"
  );
}

/* =========================================
   HOME
========================================= */

app.get("/", (req, res) => {
  res.redirect("/admin");
});

/* =========================================
   ADMIN DASHBOARD
========================================= */

app.get("/admin", (req, res) => {
  const events = readEvents();

  const categories = [
    ...new Set(
      events.map(
        (event) =>
          event.category
      )
    ),
  ];

  const now = new Date();

  const upcomingEvents =
    events
      .filter(
        (event) =>
          new Date(event.start) >=
          now
      )
      .sort(
        (a, b) =>
          new Date(a.start) -
          new Date(b.start)
      );

  const totalMinutes =
    events.reduce(
      (total, event) => {
        const start = new Date(
          event.start
        );

        const end = new Date(
          event.end
        );

        const minutes =
          Math.max(
            0,
            (end - start) /
              60000
          );

        return (
          total + minutes
        );
      },
      0
    );

  const categoryRows =
    categories
      .map(
        (category) => {
          const count =
            events.filter(
              (event) =>
                event.category ===
                category
            ).length;

          return `
            <div class="category-row">

              <div class="category-left">

                <span class="category-dot"></span>

                <span>
                  ${category}
                </span>

              </div>

              <strong>
                ${count}
              </strong>

            </div>
          `;
        }
      )
      .join("");

  const eventRows =
    events
      .sort(
        (a, b) =>
          new Date(a.start) -
          new Date(b.start)
      )
      .map(
        (event) => {

          const start =
            new Date(
              event.start
            );

          const date =
            start.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            );

          const time =
            start.toLocaleTimeString(
              "en-IN",
              {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }
            );

          return `
            <tr>

              <td>
                <div class="event-name">
                  ${event.title}
                </div>

                <div class="event-description">
                  ${
                    event.description ||
                    "No description"
                  }
                </div>
              </td>

              <td>
                <span class="badge">
                  ${event.category}
                </span>
              </td>

              <td>
                ${date}
              </td>

              <td>
                ${time}
              </td>

              <td>
                ${
                  event.location ||
                  "—"
                }
              </td>

            </tr>
          `;
        }
      )
      .join("");

  res.send(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
  EventFlow Backend
</title>

<style>

/* =========================================
   GLOBAL
========================================= */

* {
  box-sizing: border-box;
}

body {

  margin: 0;

  font-family:
    Inter,
    Segoe UI,
    Arial,
    sans-serif;

  background:
    #f5f7fb;

  color:
    #172033;

}

/* =========================================
   SIDEBAR
========================================= */

.sidebar {

  position: fixed;

  left: 0;

  top: 0;

  bottom: 0;

  width: 230px;

  background:
    linear-gradient(
      180deg,
      #15113d 0%,
      #28206b 100%
    );

  color: white;

  padding: 24px 16px;

}

.logo-area {

  display: flex;

  align-items: center;

  gap: 12px;

  padding:
    0 10px 30px;

}

.logo {

  width: 42px;

  height: 42px;

  border-radius: 12px;

  background:
    linear-gradient(
      135deg,
      #6366f1,
      #8b5cf6
    );

  display: flex;

  align-items: center;

  justify-content: center;

  font-weight: 800;

  font-size: 18px;

  box-shadow:
    0 8px 20px
    rgba(99,102,241,.35);

}

.logo-text strong {

  display: block;

  font-size: 17px;

}

.logo-text span {

  display: block;

  font-size: 9px;

  opacity: .55;

  margin-top: 3px;

}

.menu-title {

  font-size: 9px;

  text-transform: uppercase;

  letter-spacing: 1px;

  color:
    rgba(255,255,255,.45);

  margin:
    18px 10px 9px;

}

.menu-item {

  display: flex;

  align-items: center;

  gap: 11px;

  padding:
    11px 12px;

  margin-bottom: 5px;

  border-radius: 9px;

  font-size: 12px;

  color:
    rgba(255,255,255,.72);

}

.menu-item.active {

  background:
    rgba(255,255,255,.13);

  color: white;

}

.menu-icon {

  width: 18px;

  text-align: center;

}

.server-status {

  position: absolute;

  bottom: 20px;

  left: 16px;

  right: 16px;

  padding: 13px;

  border-radius: 10px;

  background:
    rgba(255,255,255,.08);

}

.server-status-top {

  display: flex;

  align-items: center;

  gap: 7px;

  font-size: 10px;

  font-weight: 700;

}

.online-dot {

  width: 7px;

  height: 7px;

  border-radius: 50%;

  background:
    #22c55e;

  box-shadow:
    0 0 8px
    #22c55e;

}

.server-status small {

  display: block;

  margin-top: 6px;

  color:
    rgba(255,255,255,.45);

  font-size: 9px;

}

/* =========================================
   MAIN
========================================= */

.main {

  margin-left: 230px;

  min-height: 100vh;

}

/* =========================================
   TOPBAR
========================================= */

.topbar {

  height: 68px;

  background: white;

  border-bottom:
    1px solid #e8ebf2;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding:
    0 30px;

}

.topbar-title h1 {

  margin: 0;

  font-size: 16px;

}

.topbar-title p {

  margin: 4px 0 0;

  color: #8c95a7;

  font-size: 10px;

}

.api-status {

  display: flex;

  align-items: center;

  gap: 8px;

  padding:
    7px 11px;

  border-radius: 20px;

  background:
    #ecfdf5;

  color:
    #047857;

  font-size: 10px;

  font-weight: 700;

}

/* =========================================
   CONTENT
========================================= */

.content {

  padding: 28px 30px;

}

.welcome {

  display: flex;

  justify-content: space-between;

  align-items: flex-end;

  margin-bottom: 22px;

}

.welcome h2 {

  margin: 0;

  font-size: 24px;

  letter-spacing: -.5px;

}

.welcome p {

  margin:
    6px 0 0;

  color:
    #8a93a5;

  font-size: 11px;

}

.time {

  color:
    #7c8495;

  font-size: 10px;

}

/* =========================================
   STATISTICS
========================================= */

.stats {

  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 14px;

  margin-bottom: 20px;

}

.stat {

  background: white;

  border:
    1px solid #e7eaf0;

  border-radius: 12px;

  padding: 18px;

  box-shadow:
    0 3px 12px
    rgba(20,30,60,.03);

}

.stat-top {

  display: flex;

  align-items: center;

  justify-content: space-between;

}

.stat-icon {

  width: 35px;

  height: 35px;

  border-radius: 9px;

  background:
    #eef2ff;

  color:
    #4f46e5;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 16px;

}

.stat-label {

  color:
    #9aa2b2;

  font-size: 9px;

  text-transform: uppercase;

  letter-spacing: .4px;

}

.stat-value {

  margin-top: 12px;

  font-size: 25px;

  font-weight: 800;

}

/* =========================================
   TWO COLUMNS
========================================= */

.grid {

  display: grid;

  grid-template-columns:
    1fr 320px;

  gap: 18px;

  margin-bottom: 18px;

}

.panel {

  background: white;

  border:
    1px solid #e7eaf0;

  border-radius: 12px;

  box-shadow:
    0 3px 12px
    rgba(20,30,60,.03);

  overflow: hidden;

}

.panel-header {

  padding:
    17px 20px;

  border-bottom:
    1px solid #edf0f5;

  display: flex;

  justify-content: space-between;

  align-items: center;

}

.panel-header h3 {

  margin: 0;

  font-size: 13px;

}

.panel-header span {

  font-size: 9px;

  color:
    #8b93a4;

}

/* =========================================
   TABLE
========================================= */

.table-wrap {

  overflow-x: auto;

}

table {

  width: 100%;

  border-collapse:
    collapse;

}

th {

  text-align: left;

  padding:
    11px 15px;

  background:
    #fafbfc;

  color:
    #8b93a4;

  font-size: 9px;

  text-transform:
    uppercase;

  letter-spacing: .4px;

  font-weight: 700;

}

td {

  padding:
    13px 15px;

  border-top:
    1px solid #f0f2f6;

  font-size: 10px;

  color:
    #626b7c;

}

.event-name {

  color:
    #1f2937;

  font-weight: 700;

  font-size: 11px;

}

.event-description {

  color:
    #a0a7b4;

  margin-top: 3px;

  max-width: 250px;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

  font-size: 9px;

}

.badge {

  display: inline-block;

  padding:
    5px 8px;

  border-radius: 20px;

  background:
    #eef2ff;

  color:
    #4f46e5;

  font-size: 8px;

  font-weight: 700;

}

/* =========================================
   CATEGORY PANEL
========================================= */

.category-list {

  padding: 5px 20px 18px;

}

.category-row {

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding:
    11px 0;

  border-bottom:
    1px solid #f0f2f5;

  font-size: 10px;

}

.category-row:last-child {

  border-bottom: none;

}

.category-left {

  display: flex;

  align-items: center;

  gap: 8px;

}

.category-dot {

  width: 7px;

  height: 7px;

  border-radius: 50%;

  background:
    #6366f1;

}

.category-row strong {

  font-size: 10px;

  color:
    #4f46e5;

}

/* =========================================
   API PANEL
========================================= */

.api-panel {

  padding: 20px;

}

.endpoint {

  display: flex;

  align-items: center;

  gap: 10px;

  background:
    #f8fafc;

  border:
    1px solid #edf0f4;

  border-radius: 8px;

  padding:
    10px 12px;

  margin-bottom: 8px;

}

.method {

  width: 45px;

  text-align: center;

  padding:
    4px;

  border-radius: 5px;

  font-size: 8px;

  font-weight: 800;

}

.get {

  background:
    #dcfce7;

  color:
    #15803d;

}

.post {

  background:
    #dbeafe;

  color:
    #1d4ed8;

}

.put {

  background:
    #fef3c7;

  color:
    #b45309;

}

.delete {

  background:
    #fee2e2;

  color:
    #b91c1c;

}

.endpoint code {

  font-size: 10px;

  color:
    #4b5563;

}

/* =========================================
   FOOTER
========================================= */

.footer {

  text-align: center;

  padding:
    10px;

  color:
    #a0a7b4;

  font-size: 9px;

}

/* =========================================
   RESPONSIVE
========================================= */

@media(max-width: 1000px) {

  .stats {

    grid-template-columns:
      repeat(2, 1fr);

  }

  .grid {

    grid-template-columns:
      1fr;

  }

}

@media(max-width: 700px) {

  .sidebar {

    width: 65px;

  }

  .logo-text,
  .menu-title,
  .menu-item span:not(.menu-icon),
  .server-status {

    display: none;

  }

  .main {

    margin-left: 65px;

  }

  .stats {

    grid-template-columns:
      1fr;

  }

}

</style>

</head>

<body>

<!-- ======================================
     SIDEBAR
====================================== -->

<aside class="sidebar">

  <div class="logo-area">

    <div class="logo">
      E
    </div>

    <div class="logo-text">

      <strong>
        EventFlow
      </strong>

      <span>
        BACKEND CONTROL
      </span>

    </div>

  </div>


  <div class="menu-title">
    MANAGEMENT
  </div>


  <div class="menu-item active">

    <span class="menu-icon">
      ▦
    </span>

    <span>
      Dashboard
    </span>

  </div>


  <div class="menu-item">

    <span class="menu-icon">
      ◫
    </span>

    <span>
      Events
    </span>

  </div>


  <div class="menu-item">

    <span class="menu-icon">
      ◈
    </span>

    <span>
      Categories
    </span>

  </div>


  <div class="menu-title">
    DEVELOPER
  </div>


  <div class="menu-item">

    <span class="menu-icon">
      &lt;/&gt;
    </span>

    <span>
      REST API
    </span>

  </div>


  <div class="menu-item">

    <span class="menu-icon">
      ⚙
    </span>

    <span>
      Server
    </span>

  </div>


  <div class="server-status">

    <div class="server-status-top">

      <span class="online-dot"></span>

      SERVER ONLINE

    </div>

    <small>
      localhost:${PORT}
    </small>

  </div>

</aside>


<!-- ======================================
     MAIN
====================================== -->

<div class="main">


  <!-- TOPBAR -->

  <header class="topbar">

    <div class="topbar-title">

      <h1>
        Backend Dashboard
      </h1>

      <p>
        EventFlow API & Data Management
      </p>

    </div>


    <div class="api-status">

      <span class="online-dot"></span>

      API CONNECTED

    </div>

  </header>


  <main class="content">


    <!-- WELCOME -->

    <section class="welcome">

      <div>

        <h2>
          Server Overview
        </h2>

        <p>
          Monitor events, categories
          and backend API activity.
        </p>

      </div>

      <div class="time">

        Express.js • REST API

      </div>

    </section>


    <!-- STATISTICS -->

    <section class="stats">


      <div class="stat">

        <div class="stat-top">

          <div class="stat-label">
            Total Events
          </div>

          <div class="stat-icon">
            ◫
          </div>

        </div>

        <div class="stat-value">
          ${events.length}
        </div>

      </div>


      <div class="stat">

        <div class="stat-top">

          <div class="stat-label">
            Categories
          </div>

          <div class="stat-icon">
            ◈
          </div>

        </div>

        <div class="stat-value">
          ${categories.length}
        </div>

      </div>


      <div class="stat">

        <div class="stat-top">

          <div class="stat-label">
            Upcoming
          </div>

          <div class="stat-icon">
            ◷
          </div>

        </div>

        <div class="stat-value">
          ${upcomingEvents.length}
        </div>

      </div>


      <div class="stat">

        <div class="stat-top">

          <div class="stat-label">
            Scheduled Minutes
          </div>

          <div class="stat-icon">
            ⚡
          </div>

        </div>

        <div class="stat-value">
          ${Math.round(
            totalMinutes
          )}
        </div>

      </div>

    </section>


    <!-- TABLE + CATEGORY -->

    <section class="grid">


      <div class="panel">

        <div class="panel-header">

          <h3>
            Event Database
          </h3>

          <span>
            ${events.length} RECORDS
          </span>

        </div>


        <div class="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Event
                </th>

                <th>
                  Category
                </th>

                <th>
                  Date
                </th>

                <th>
                  Time
                </th>

                <th>
                  Location
                </th>

              </tr>

            </thead>


            <tbody>

              ${
                eventRows ||
                `
                  <tr>
                    <td colspan="5">
                      No events available
                    </td>
                  </tr>
                `
              }

            </tbody>

          </table>

        </div>

      </div>


      <div class="panel">

        <div class="panel-header">

          <h3>
            Categories
          </h3>

          <span>
            DISTRIBUTION
          </span>

        </div>


        <div class="category-list">

          ${categoryRows}

        </div>

      </div>


    </section>


    <!-- API ENDPOINTS -->

    <section class="panel">

      <div class="panel-header">

        <h3>
          REST API Endpoints
        </h3>

        <span>
          EXPRESS.JS
        </span>

      </div>


      <div class="api-panel">


        <div class="endpoint">

          <span class="method get">
            GET
          </span>

          <code>
            /api/events
          </code>

        </div>


        <div class="endpoint">

          <span class="method get">
            GET
          </span>

          <code>
            /api/events/:id
          </code>

        </div>


        <div class="endpoint">

          <span class="method post">
            POST
          </span>

          <code>
            /api/events
          </code>

        </div>


        <div class="endpoint">

          <span class="method put">
            PUT
          </span>

          <code>
            /api/events/:id
          </code>

        </div>


        <div class="endpoint">

          <span class="method delete">
            DELETE
          </span>

          <code>
            /api/events/:id
          </code>

        </div>


      </div>

    </section>


    <div class="footer">

      EventFlow Full Stack Project
      • Express.js Backend
      • REST API
      • Port ${PORT}

    </div>


  </main>

</div>

</body>

</html>

  `);
});

/* =========================================
   GET ALL EVENTS
========================================= */

app.get(
  "/api/events",
  (req, res) => {

    const events =
      readEvents();

    res.json({

      success: true,

      count:
        events.length,

      data:
        events,

    });

  }
);

/* =========================================
   GET SINGLE EVENT
========================================= */

app.get(
  "/api/events/:id",
  (req, res) => {

    const events =
      readEvents();

    const event =
      events.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!event) {

      return res
        .status(404)
        .json({

          success: false,

          message:
            "Event not found",

        });

    }

    res.json({

      success: true,

      data:
        event,

    });

  }
);

/* =========================================
   CREATE EVENT
========================================= */

app.post(
  "/api/events",
  (req, res) => {

    const events =
      readEvents();

    const {
      title,
      start,
      end,
      category,
      location,
      description,
    } = req.body;

    if (
      !title ||
      !start ||
      !end ||
      !category
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Title, start, end and category are required.",

        });

    }

    const newEvent = {

      id:
        Date.now().toString(),

      title,

      start,

      end,

      category,

      location:
        location || "",

      description:
        description || "",

    };

    events.push(
      newEvent
    );

    saveEvents(
      events
    );

    res
      .status(201)
      .json({

        success: true,

        message:
          "Event created successfully",

        data:
          newEvent,

      });

  }
);

/* =========================================
   UPDATE EVENT
========================================= */

app.put(
  "/api/events/:id",
  (req, res) => {

    const events =
      readEvents();

    const index =
      events.findIndex(
        (item) =>
          item.id ===
          req.params.id
      );

    if (index === -1) {

      return res
        .status(404)
        .json({

          success: false,

          message:
            "Event not found",

        });

    }

    events[index] = {

      ...events[index],

      ...req.body,

      id:
        req.params.id,

    };

    saveEvents(
      events
    );

    res.json({

      success: true,

      message:
        "Event updated successfully",

      data:
        events[index],

    });

  }
);

/* =========================================
   DELETE EVENT
========================================= */

app.delete(
  "/api/events/:id",
  (req, res) => {

    const events =
      readEvents();

    const filteredEvents =
      events.filter(
        (item) =>
          item.id !==
          req.params.id
      );

    if (
      filteredEvents.length ===
      events.length
    ) {

      return res
        .status(404)
        .json({

          success: false,

          message:
            "Event not found",

        });

    }

    saveEvents(
      filteredEvents
    );

    res.json({

      success: true,

      message:
        "Event deleted successfully",

    });

  }
);

/* =========================================
   START SERVER
========================================= */

app.listen(
  PORT,
  () => {

    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "          EVENTFLOW BACKEND"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Dashboard : http://localhost:${PORT}/admin`
    );

    console.log(
      `API       : http://localhost:${PORT}/api/events`
    );

    console.log(
      "Status    : ONLINE"
    );

    console.log(
      "========================================"
    );

    console.log("");

  }
);