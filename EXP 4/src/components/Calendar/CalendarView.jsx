import React, {
  memo,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CheckSquare,
  BarChart3,
} from "lucide-react";

import "./CalendarView.css";

const categoryConfig = {
  Assignment: {
    color: "#5146d8",
    light: "#6156e8",
    icon: "📝",
  },

  Lecture: {
    color: "#2387d9",
    light: "#3299ed",
    icon: "📚",
  },

  Exam: {
    color: "#d93636",
    light: "#e74646",
    icon: "🎯",
  },

  Project: {
    color: "#25ae63",
    light: "#32c978",
    icon: "🚀",
  },

  Meeting: {
    color: "#ef7d22",
    light: "#ff8b2d",
    icon: "👥",
  },

  Deadline: {
    color: "#c72d7d",
    light: "#df3f91",
    icon: "⏰",
  },

  Lab: {
    color: "#d4a51d",
    light: "#e9bd2c",
    icon: "🧪",
  },

  Presentation: {
    color: "#16aabd",
    light: "#22c8dc",
    icon: "🎤",
  },

  Personal: {
    color: "#4f5bd8",
    light: "#5968e9",
    icon: "⭐",
  },
};

const weekDayNames = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

function formatDate(date) {
  const localDate = new Date(date);

  const year = localDate.getFullYear();
  const month = String(
    localDate.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    localDate.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  ).format(new Date(date));
}

function getMonday(date) {
  const result = new Date(date);

  const day = result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() + difference
  );

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}

function getMonthDays(date) {
  const year =
    date.getFullYear();

  const month =
    date.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const lastDay =
    new Date(
      year,
      month + 1,
      0
    );

  let startDay =
    firstDay.getDay();

  startDay =
    startDay === 0
      ? 6
      : startDay - 1;

  const totalDays =
    lastDay.getDate();

  const days = [];

  for (
    let i = 0;
    i < startDay;
    i += 1
  ) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= totalDays;
    day += 1
  ) {
    days.push(
      new Date(
        year,
        month,
        day
      )
    );
  }

  return days;
}

function PremiumCalendar({
  events,
  onEventClick,
  onEventDrop,
  onEventResize,
}) {
  const calendarRef =
    useRef(null);

  const renderCount =
    useRef(0);

  renderCount.current += 1;

  /* -------------------------------------------------------
     IMPORTANT:
     Start from the ACTUAL current date.
     This fixes the selected-date problem.
     ------------------------------------------------------- */

  const [currentDate, setCurrentDate] =
    useState(
      () => new Date()
    );

  const [activeView, setActiveView] =
    useState(
      "timeGridWeek"
    );

  /* -------------------------------------------------------
     MINI CALENDAR
     ------------------------------------------------------- */

  const monthDays = useMemo(
    () => {
      return getMonthDays(
        currentDate
      );
    },
    [
      currentDate.getFullYear(),
      currentDate.getMonth(),
    ]
  );

  const currentMonthName =
    useMemo(() => {
      return currentDate.toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        }
      );
    }, [currentDate]);

  /* -------------------------------------------------------
     CURRENT WEEK
     ------------------------------------------------------- */

  const weekStart = useMemo(
    () => {
      return getMonday(
        currentDate
      );
    },
    [currentDate]
  );

  const weekDays = useMemo(
    () => {
      return Array.from(
        { length: 7 },
        (_, index) => {
          const date =
            new Date(
              weekStart
            );

          date.setDate(
            weekStart.getDate() +
              index
          );

          return date;
        }
      );
    },
    [weekStart]
  );

  /* -------------------------------------------------------
     CALENDAR EVENTS
     ------------------------------------------------------- */

  const calendarEvents =
    useMemo(() => {
      return events.map(
        (event) => {
          const config =
            categoryConfig[
              event.category
            ] ||
            categoryConfig.Personal;

          return {
            ...event,

            backgroundColor:
              config.color,

            borderColor:
              config.color,

            textColor:
              "#ffffff",

            extendedProps: {
              category:
                event.category,

              description:
                event.description,

              location:
                event.location,

              color:
                config.color,

              lightColor:
                config.light,

              icon:
                config.icon,
            },
          };
        }
      );
    }, [events]);

  /* -------------------------------------------------------
     UPCOMING EVENTS
     
     BEFORE:
     Only today's events were displayed.

     NOW:
     Shows the next 5 events from the complete
     event database.
     ------------------------------------------------------- */

  const upcomingEvents =
    useMemo(() => {
      const now =
        new Date();

      return [
        ...events,
      ]
        .filter(
          (event) =>
            new Date(
              event.start
            ) >= now
        )
        .sort(
          (a, b) =>
            new Date(
              a.start
            ) -
            new Date(
              b.start
            )
        )
        .slice(0, 5);
    }, [events]);

  /* -------------------------------------------------------
     TIME BREAKDOWN
     ------------------------------------------------------- */

  const categoryMinutes =
    useMemo(() => {
      const totals = {};

      events.forEach(
        (event) => {
          const start =
            new Date(
              event.start
            );

          const end = event.end
            ? new Date(
                event.end
              )
            : new Date(
                start.getTime() +
                  60 *
                    60 *
                    1000
              );

          const minutes =
            Math.max(
              30,
              Math.round(
                (end - start) /
                  (1000 * 60)
              )
            );

          totals[
            event.category
          ] =
            (
              totals[
                event.category
              ] || 0
            ) + minutes;
        }
      );

      return Object.entries(
        totals
      )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(0, 4);
    }, [events]);

  const maxCategoryMinutes =
    useMemo(() => {
      return Math.max(
        ...categoryMinutes.map(
          ([, minutes]) =>
            minutes
        ),
        1
      );
    }, [categoryMinutes]);

  /* -------------------------------------------------------
     VIEW CHANGE
     ------------------------------------------------------- */

  const changeView =
    useCallback(
      (viewName) => {
        const calendar =
          calendarRef.current;

        if (!calendar) {
          return;
        }

        const api =
          calendar.getApi();

        api.changeView(
          viewName
        );

        setActiveView(
          viewName
        );
      },
      []
    );

  /* -------------------------------------------------------
     PREVIOUS
     ------------------------------------------------------- */

  const goPrevious =
    useCallback(() => {
      const calendar =
        calendarRef.current;

      if (!calendar) {
        return;
      }

      calendar
        .getApi()
        .prev();

      setCurrentDate(
        (previous) => {
          const next =
            new Date(
              previous
            );

          if (
            activeView ===
            "dayGridMonth"
          ) {
            next.setMonth(
              next.getMonth() -
                1
            );
          } else {
            next.setDate(
              next.getDate() -
                7
            );
          }

          return next;
        }
      );
    }, [activeView]);

  /* -------------------------------------------------------
     NEXT
     ------------------------------------------------------- */

  const goNext =
    useCallback(() => {
      const calendar =
        calendarRef.current;

      if (!calendar) {
        return;
      }

      calendar
        .getApi()
        .next();

      setCurrentDate(
        (previous) => {
          const next =
            new Date(
              previous
            );

          if (
            activeView ===
            "dayGridMonth"
          ) {
            next.setMonth(
              next.getMonth() +
                1
            );
          } else {
            next.setDate(
              next.getDate() +
                7
            );
          }

          return next;
        }
      );
    }, [activeView]);

  /* -------------------------------------------------------
     MINI CALENDAR DATE CLICK
     ------------------------------------------------------- */

  const handleMiniDateClick =
    useCallback(
      (date) => {
        if (!date) {
          return;
        }

        const selected =
          new Date(date);

        const calendar =
          calendarRef.current;

        if (calendar) {
          calendar
            .getApi()
            .gotoDate(
              selected
            );
        }

        setCurrentDate(
          selected
        );
      },
      []
    );

  /* -------------------------------------------------------
     EVENT CLICK
     ------------------------------------------------------- */

  const handleEventClick =
    useCallback(
      (info) => {
        onEventClick(
          info.event
        );
      },
      [onEventClick]
    );

  /* -------------------------------------------------------
     EVENT DROP
     ------------------------------------------------------- */

  const handleEventDrop =
    useCallback(
      (info) => {
        onEventDrop(
          info.event
        );
      },
      [onEventDrop]
    );

  /* -------------------------------------------------------
     EVENT RESIZE
     ------------------------------------------------------- */

  const handleEventResize =
    useCallback(
      (info) => {
        onEventResize(
          info.event
        );
      },
      [onEventResize]
    );

  /* -------------------------------------------------------
     EVENT CONTENT
     ------------------------------------------------------- */

  const renderEventContent =
    useCallback(
      (eventInfo) => {
        const category =
          eventInfo.event
            .extendedProps
            .category;

        const config =
          categoryConfig[
            category
          ] ||
          categoryConfig.Personal;

        return (
          <div className="premium-event-card">

            <div className="premium-event-title">

              <span>
                {config.icon}
              </span>

              <strong>
                {
                  eventInfo
                    .event
                    .title
                }
              </strong>

            </div>

            {eventInfo.timeText && (
              <span className="premium-event-time">
                {
                  eventInfo.timeText
                }
              </span>
            )}

            <span className="premium-event-category">
              {category}
            </span>

          </div>
        );
      },
      []
    );

  const todayString =
    formatDate(
      new Date()
    );

  return (
    <section className="premium-calendar-shell">

      {/* =================================================
          TOP BAR
          ================================================= */}

      <div className="premium-calendar-topbar">

        <div className="premium-calendar-brand">

          <div className="premium-calendar-icon">
            <CalendarDays
              size={23}
            />
          </div>

          <div>
            <h2>
              Calendar
            </h2>

            <p>
              Plan your week,
              your way.
            </p>
          </div>

        </div>

        <div className="premium-calendar-controls">

          <button
            type="button"
            className="premium-round-button"
            onClick={
              goPrevious
            }
            aria-label="Previous period"
          >
            <ChevronLeft
              size={18}
            />
          </button>

          <button
            type="button"
            className="premium-round-button"
            onClick={
              goNext
            }
            aria-label="Next period"
          >
            <ChevronRight
              size={18}
            />
          </button>

          <div className="premium-view-switcher">

            <button
              type="button"
              className={
                activeView ===
                "dayGridMonth"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeView(
                  "dayGridMonth"
                )
              }
            >
              Month
            </button>

            <button
              type="button"
              className={
                activeView ===
                "timeGridWeek"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeView(
                  "timeGridWeek"
                )
              }
            >
              Week
            </button>

            <button
              type="button"
              className={
                activeView ===
                "timeGridDay"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeView(
                  "timeGridDay"
                )
              }
            >
              Day
            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          MAIN LAYOUT
          ================================================= */}

      <div className="premium-calendar-layout">

        {/* =================================================
            LEFT SIDEBAR
            ================================================= */}

        <aside className="premium-calendar-sidebar">

          {/* MINI CALENDAR */}

          <div className="mini-calendar-card">

            <div className="mini-calendar-heading">

              <strong>
                {currentMonthName}
              </strong>

              <div>

                <button
                  type="button"
                  onClick={
                    goPrevious
                  }
                  aria-label="Previous month"
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    goNext
                  }
                  aria-label="Next month"
                >
                  <ChevronRight
                    size={16}
                  />
                </button>

              </div>

            </div>

            <div className="mini-weekdays">

              {[
                "M",
                "T",
                "W",
                "T",
                "F",
                "S",
                "S",
              ].map(
                (
                  day,
                  index
                ) => (
                  <span
                    key={`${day}-${index}`}
                  >
                    {day}
                  </span>
                )
              )}

            </div>

            <div className="mini-calendar-grid">

              {monthDays.map(
                (
                  date,
                  index
                ) => {

                  if (!date) {
                    return (
                      <span
                        key={`empty-${index}`}
                      />
                    );
                  }

                  const dateString =
                    formatDate(
                      date
                    );

                  const isToday =
                    dateString ===
                    todayString;

                  const isSelected =
                    dateString ===
                    formatDate(
                      currentDate
                    );

                  const hasEvent =
                    events.some(
                      (
                        event
                      ) =>
                        formatDate(
                          event.start
                        ) ===
                        dateString
                    );

                  return (
                    <button
                      type="button"
                      key={
                        dateString
                      }
                      className={`
                        mini-day
                        ${
                          isToday
                            ? "today"
                            : ""
                        }
                        ${
                          isSelected
                            ? "selected"
                            : ""
                        }
                      `}
                      onClick={() =>
                        handleMiniDateClick(
                          date
                        )
                      }
                    >

                      {date.getDate()}

                      {hasEvent && (
                        <i />
                      )}

                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* UPCOMING EVENTS */}

          <div className="premium-side-card">

            <div className="side-card-heading">

              <div>

                <h3>
                  Upcoming events
                </h3>

                <span>
                  Next scheduled activities
                </span>

              </div>

              <CheckSquare
                size={18}
              />

            </div>

            <div className="upcoming-events">

              {upcomingEvents.length ===
              0 ? (
                <div className="no-upcoming">
                  No upcoming events
                </div>
              ) : (
                upcomingEvents.map(
                  (event) => {

                    const config =
                      categoryConfig[
                        event.category
                      ] ||
                      categoryConfig.Personal;

                    return (
                      <button
                        type="button"
                        className="upcoming-event"
                        key={
                          event.id
                        }
                        onClick={() =>
                          onEventClick(
                            event
                          )
                        }
                      >

                        <span
                          className="upcoming-dot"
                          style={{
                            background:
                              config.light,
                          }}
                        />

                        <span className="upcoming-title">
                          {
                            event.title
                          }
                        </span>

                        <span className="upcoming-time">

                          {new Date(
                            event.start
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}

                          {" · "}

                          {formatTime(
                            event.start
                          )}

                        </span>

                      </button>
                    );
                  }
                )
              )}

            </div>

          </div>

          {/* TIME BREAKDOWN */}

          <div className="premium-side-card">

            <div className="side-card-heading">

              <div>

                <h3>
                  Time breakdown
                </h3>

                <span>
                  By category
                </span>

              </div>

              <BarChart3
                size={18}
              />

            </div>

            <div className="time-breakdown">

              {categoryMinutes.length ===
              0 ? (
                <div className="no-upcoming">
                  Add events to see
                  statistics
                </div>
              ) : (
                categoryMinutes.map(
                  ([
                    category,
                    minutes,
                  ]) => {

                    const config =
                      categoryConfig[
                        category
                      ] ||
                      categoryConfig.Personal;

                    const percentage =
                      Math.round(
                        (minutes /
                          maxCategoryMinutes) *
                          100
                      );

                    return (
                      <div
                        className="breakdown-row"
                        key={
                          category
                        }
                      >

                        <div className="breakdown-label">

                          <span>
                            {category}
                          </span>

                          <strong>
                            {minutes}m
                          </strong>

                        </div>

                        <div className="breakdown-track">

                          <span
                            style={{
                              width: `${percentage}%`,
                              background:
                                config.light,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>

        </aside>

        {/* =================================================
            MAIN CALENDAR
            ================================================= */}

        <div className="premium-calendar-main">

          <div className="premium-main-heading">

            <div>

              <span>
                {activeView ===
                "timeGridWeek"
                  ? "WEEKLY PLANNER"
                  : "CALENDAR"}
              </span>

              <h1>
                {currentDate.toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </h1>

            </div>

            {activeView ===
              "timeGridWeek" && (
              <div className="premium-week-strip">

                {weekDays.map(
                  (day) => {

                    const isSelected =
                      formatDate(
                        day
                      ) ===
                      formatDate(
                        currentDate
                      );

                    const isToday =
                      formatDate(
                        day
                      ) ===
                      todayString;

                    return (
                      <button
                        type="button"
                        key={
                          day.toISOString()
                        }
                        className={`
                          premium-week-day
                          ${
                            isSelected
                              ? "selected"
                              : ""
                          }
                        `}
                        onClick={() =>
                          handleMiniDateClick(
                            day
                          )
                        }
                      >

                        <span>
                          {
                            weekDayNames[
                              day.getDay() ===
                              0
                                ? 6
                                : day.getDay() -
                                  1
                            ]
                          }
                        </span>

                        <strong>
                          {day.getDate()}
                        </strong>

                        {isToday && (
                          <i>
                            Today
                          </i>
                        )}

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </div>

          <div className="premium-fullcalendar">

            <FullCalendar
              ref={
                calendarRef
              }

              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}

              initialView="timeGridWeek"

              initialDate={
                new Date()
              }

              firstDay={1}

              weekends={true}

              allDaySlot={false}

              slotMinTime="08:00:00"

              slotMaxTime="24:00:00"

              slotDuration="01:00:00"

              height="760px"

              expandRows={false}

              nowIndicator={true}

              events={
                calendarEvents
              }

              editable={true}

              selectable={true}

              eventResizableFromStart={
                true
              }

              eventDurationEditable={
                true
              }

              eventDisplay="block"

              headerToolbar={false}

              eventClick={
                handleEventClick
              }

              eventDrop={
                handleEventDrop
              }

              eventResize={
                handleEventResize
              }

              eventContent={
                renderEventContent
              }
            />

          </div>

          <div className="premium-calendar-footer">

            <div>

              <Clock3
                size={14}
              />

              <span>
                Drag events to
                reschedule them
              </span>

            </div>

            <span>

              Calendar renders:

              <strong>
                {renderCount.current}
              </strong>

            </span>

          </div>

        </div>

      </div>

    </section>
  );
}

const CalendarView =
  memo(
    PremiumCalendar
  );

export default CalendarView;