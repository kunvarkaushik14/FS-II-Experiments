import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

const DAY_NAMES = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
];

const CATEGORY_COLORS = {
  Assignment: "#8b5cf6",
  Lecture: "#3b82f6",
  Exam: "#ef4444",
  Project: "#22c55e",
  Meeting: "#f97316",
  Deadline: "#ec4899",
  Lab: "#eab308",
  Presentation: "#06b6d4",
  Personal: "#6366f1",
};

const CATEGORY_ICONS = {
  Assignment: "📝",
  Lecture: "📚",
  Exam: "🎯",
  Project: "🚀",
  Meeting: "👥",
  Deadline: "⏰",
  Lab: "🧪",
  Presentation: "🎤",
  Personal: "⭐",
};

/* =========================================================
   DATE HELPERS
   ========================================================= */

const formatLocalDate = (date) => {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonday = (date) => {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  const day =
    result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
      difference
  );

  return result;
};

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );
};

/* =========================================================
   EVENT CARD
   ========================================================= */

const WeekEventCard = ({
  event,
  onEventClick,
}) => {
  const color =
    CATEGORY_COLORS[
      event.category
    ] || "#6366f1";

  const icon =
    CATEGORY_ICONS[
      event.category
    ] || "📌";

  return (
    <button
      type="button"
      className="week-event-card"
      onClick={() =>
        onEventClick(event)
      }
      style={{
        borderLeftColor:
          color,
        "--event-color":
          color,
      }}
    >
      <div className="week-event-card-top">
        <span className="week-event-icon">
          {icon}
        </span>

        <span className="week-event-title">
          {event.title}
        </span>
      </div>

      <div className="week-event-time">
        {formatTime(
          event.start
        )}
      </div>

      <div
        className="week-event-category"
        style={{
          color,
        }}
      >
        {event.category}
      </div>
    </button>
  );
};

const MemoizedWeekEventCard =
  memo(
    WeekEventCard
  );

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

const WeeklyScheduleContent =
  ({
    events,
    memoizationEnabled,
    useCallbackEnabled,
    useMemoEnabled,
    onEventClick,
  }) => {
    const [
      weekOffset,
      setWeekOffset,
    ] = useState(0);

    /* =====================================================
       WEEK
       ===================================================== */

    const weekStart =
      useMemo(() => {
        const monday =
          getMonday(
            new Date()
          );

        monday.setDate(
          monday.getDate() +
            weekOffset * 7
        );

        return monday;
      }, [weekOffset]);

    const memoizedWeekDays =
      useMemo(() => {
        return Array.from(
          {
            length: 7,
          },
          (_, index) => {
            const date =
              new Date(
                weekStart
              );

            date.setDate(
              date.getDate() +
                index
            );

            return date;
          }
        );
      }, [weekStart]);

    const directWeekDays =
      Array.from(
        {
          length: 7,
        },
        (_, index) => {
          const date =
            new Date(
              weekStart
            );

          date.setDate(
            date.getDate() +
              index
          );

          return date;
        }
      );

    const weekDays =
      useMemoEnabled
        ? memoizedWeekDays
        : directWeekDays;

    /* =====================================================
       AGENDA
       ===================================================== */

    const buildAgenda =
      useCallback(() => {
        const result = {};

        weekDays.forEach(
          (date) => {
            result[
              formatLocalDate(date)
            ] = [];
          }
        );

        events.forEach(
          (event) => {
            if (!event.start) {
              return;
            }

            const eventDate =
              new Date(
                event.start
              );

            if (
              Number.isNaN(
                eventDate.getTime()
              )
            ) {
              return;
            }

            const key =
              formatLocalDate(
                eventDate
              );

            if (
              result[key]
            ) {
              result[key].push(
                event
              );
            }
          }
        );

        Object.keys(result).forEach(
          (key) => {
            result[key].sort(
              (a, b) =>
                new Date(
                  a.start
                ).getTime() -
                new Date(
                  b.start
                ).getTime()
            );
          }
        );

        return result;
      }, [
        events,
        weekDays,
      ]);

    const memoizedAgenda =
      useMemo(
        () =>
          buildAgenda(),
        [buildAgenda]
      );

    const agenda =
      useMemoEnabled
        ? memoizedAgenda
        : buildAgenda();

    /* =====================================================
       CALLBACK
       ===================================================== */

    const memoizedEventClick =
      useCallback(
        (event) => {
          onEventClick(event);
        },
        [onEventClick]
      );

    const eventClickHandler =
      useCallbackEnabled
        ? memoizedEventClick
        : (event) => {
            onEventClick(event);
          };

    const previousWeekMemo =
      useCallback(() => {
        setWeekOffset(
          (value) =>
            value - 1
        );
      }, []);

    const nextWeekMemo =
      useCallback(() => {
        setWeekOffset(
          (value) =>
            value + 1
        );
      }, []);

    const previousWeek =
      useCallbackEnabled
        ? previousWeekMemo
        : () => {
            setWeekOffset(
              (value) =>
                value - 1
            );
          };

    const nextWeek =
      useCallbackEnabled
        ? nextWeekMemo
        : () => {
            setWeekOffset(
              (value) =>
                value + 1
            );
          };

    /* =====================================================
       CARD TYPE
       ===================================================== */

    const EventCard =
      memoizationEnabled
        ? MemoizedWeekEventCard
        : WeekEventCard;

    /* =====================================================
       UI
       ===================================================== */

    return (
      <section className="weekly-schedule">
        <div className="weekly-header">
          <div>
            <span className="performance-eyebrow">
              7-DAY SCHEDULE
            </span>

            <h2>
              Week View
            </h2>

            <p>
              Render behavior of individual
              event cards.
            </p>
          </div>

          <div className="week-navigation">
            <button
              type="button"
              className="week-nav-button"
              onClick={
                previousWeek
              }
            >
              ←
            </button>

            <span className="week-range">
              {weekDays[0]?.toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                }
              )}

              {" – "}

              {weekDays[6]?.toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                }
              )}
            </span>

            <button
              type="button"
              className="week-nav-button"
              onClick={
                nextWeek
              }
            >
              →
            </button>
          </div>
        </div>

        <div className="week-grid">
          {weekDays.map(
            (date, index) => {
              const key =
                formatLocalDate(
                  date
                );

              const dayEvents =
                agenda[key] || [];

              return (
                <div
                  className="week-column"
                  key={key}
                >
                  <div className="week-column-header">
                    <span className="week-day-name">
                      {
                        DAY_NAMES[
                          index
                        ]
                      }
                    </span>

                    <span className="week-day-number">
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="week-column-events">
                    {dayEvents.length ===
                    0 ? (
                      <div className="empty-week-day">
                        No events
                      </div>
                    ) : (
                      dayEvents.map(
                        (event) => (
                          <EventCard
                            key={
                              event.id
                            }
                            event={
                              event
                            }
                            onEventClick={
                              eventClickHandler
                            }
                          />
                        )
                      )
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div className="week-footer">
          <span>
            {events.length} events
            scheduled this week
          </span>

          <span>
            {memoizationEnabled
              ? "React.memo optimized"
              : "React.memo disabled"}
          </span>
        </div>
      </section>
    );
  };

const WeeklySchedule =
  memo(
    WeeklyScheduleContent
  );

export default WeeklySchedule;