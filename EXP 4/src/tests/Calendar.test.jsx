import React from "react";

import {
  render,
  screen,
  fireEvent,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import CalendarView from "../components/Calendar/CalendarView";


/* =========================================================
   MOCK FULLCALENDAR
========================================================= */

vi.mock("@fullcalendar/react", () => {
  return {
    default: ({
      events,
      eventClick,
      eventDrop,
      eventResize,
      eventContent,
    }) => {
      return (
        <div data-testid="full-calendar">

          <div>
            Full Calendar
          </div>

          {events?.map((event) => (
            <div
              key={event.id}
              data-testid={`calendar-event-${event.id}`}
              onClick={() => {
                eventClick?.({
                  event,
                });
              }}
            >
              {eventContent
                ? eventContent({
                    event: {
                      ...event,
                      extendedProps:
                        event.extendedProps ||
                        {},
                    },

                    timeText:
                      "10:00 AM",
                  })
                : event.title}
            </div>
          ))}


          <button
            data-testid="simulate-drop"
            onClick={() => {
              if (events?.[0]) {
                eventDrop?.({
                  event: events[0],
                });
              }
            }}
          >
            Simulate Drop
          </button>


          <button
            data-testid="simulate-resize"
            onClick={() => {
              if (events?.[0]) {
                eventResize?.({
                  event: events[0],
                });
              }
            }}
          >
            Simulate Resize
          </button>

        </div>
      );
    },
  };
});


/* =========================================================
   MOCK FULLCALENDAR PLUGINS
========================================================= */

vi.mock(
  "@fullcalendar/daygrid",
  () => ({
    default: {},
  })
);

vi.mock(
  "@fullcalendar/timegrid",
  () => ({
    default: {},
  })
);

vi.mock(
  "@fullcalendar/interaction",
  () => ({
    default: {},
  })
);


/* =========================================================
   TEST DATA
========================================================= */

const testEvents = [
  {
    id: "1",

    title:
      "Database Assignment",

    start:
      "2026-09-03T10:00:00",

    end:
      "2026-09-03T12:00:00",

    category:
      "Assignment",

    description:
      "Complete the database assignment.",

    location:
      "Home",
  },

  {
    id: "2",

    title:
      "React Development Lecture",

    start:
      "2026-09-04T09:00:00",

    end:
      "2026-09-04T11:00:00",

    category:
      "Lecture",

    description:
      "React development lecture.",

    location:
      "Room 204",
  },
];


/* =========================================================
   CALENDAR VIEW TESTS
========================================================= */

describe(
  "CalendarView Component",
  () => {

    /* -------------------------------------------------------
       TEST 1 — CALENDAR RENDERING
    ------------------------------------------------------- */

    it(
      "should render the calendar",
      () => {

        render(
          <CalendarView
            events={testEvents}
            onEventClick={vi.fn()}
            onEventDrop={vi.fn()}
            onEventResize={vi.fn()}
          />
        );

        expect(
          screen.getByTestId(
            "full-calendar"
          )
        ).toBeInTheDocument();

      }
    );


    /* -------------------------------------------------------
       TEST 2 — CALENDAR HEADING
    ------------------------------------------------------- */

    it(
      "should display the calendar heading",
      () => {

        render(
          <CalendarView
            events={testEvents}
            onEventClick={vi.fn()}
            onEventDrop={vi.fn()}
            onEventResize={vi.fn()}
          />
        );

        expect(
          screen.getByText(
            "Interactive Calendar"
          )
        ).toBeInTheDocument();

      }
    );


    /* -------------------------------------------------------
       TEST 3 — EVENTS
    ------------------------------------------------------- */

    it(
      "should render supplied events",
      () => {

        render(
          <CalendarView
            events={testEvents}
            onEventClick={vi.fn()}
            onEventDrop={vi.fn()}
            onEventResize={vi.fn()}
          />
        );

        expect(
          screen.getByText(
            "Database Assignment"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "React Development Lecture"
          )
        ).toBeInTheDocument();

      }
    );


    /* -------------------------------------------------------
       TEST 4 — CATEGORY
    ------------------------------------------------------- */

    it(
  "should display event categories",
  () => {
    render(
      <CalendarView
        events={testEvents}
        onEventClick={vi.fn()}
        onEventDrop={vi.fn()}
        onEventResize={vi.fn()}
      />
    );

    expect(
      screen.getAllByText(
        "Assignment"
      ).length
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByText(
        "Lecture"
      ).length
    ).toBeGreaterThan(0);
  }
);

    /* -------------------------------------------------------
       TEST 5 — EVENT CLICK
    ------------------------------------------------------- */

    it(
      "should call onEventClick when an event is clicked",
      () => {

        const onEventClick =
          vi.fn();

        render(
          <CalendarView
            events={testEvents}
            onEventClick={
              onEventClick
            }
            onEventDrop={vi.fn()}
            onEventResize={vi.fn()}
          />
        );


        const event =
          screen.getByTestId(
            "calendar-event-1"
          );


        fireEvent.click(event);


        expect(
          onEventClick
        ).toHaveBeenCalledTimes(1);


        expect(
          onEventClick
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "1",
          })
        );

      }
    );


    /* -------------------------------------------------------
       TEST 6 — DRAG AND DROP
    ------------------------------------------------------- */

    it(
      "should call onEventDrop when an event is moved",
      () => {

        const onEventDrop =
          vi.fn();


        render(
          <CalendarView
            events={testEvents}
            onEventClick={vi.fn()}
            onEventDrop={
              onEventDrop
            }
            onEventResize={vi.fn()}
          />
        );


        fireEvent.click(
          screen.getByTestId(
            "simulate-drop"
          )
        );


        expect(
          onEventDrop
        ).toHaveBeenCalledTimes(1);


        expect(
          onEventDrop
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "1",
          })
        );

      }
    );


    /* -------------------------------------------------------
       TEST 7 — RESIZE
    ------------------------------------------------------- */

    it(
      "should call onEventResize when an event is resized",
      () => {

        const onEventResize =
          vi.fn();


        render(
          <CalendarView
            events={testEvents}
            onEventClick={vi.fn()}
            onEventDrop={vi.fn()}
            onEventResize={
              onEventResize
            }
          />
        );


        fireEvent.click(
          screen.getByTestId(
            "simulate-resize"
          )
        );


        expect(
          onEventResize
        ).toHaveBeenCalledTimes(1);


        expect(
          onEventResize
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "1",
          })
        );

      }
    );


    /* -------------------------------------------------------
       TEST 8 — EMPTY CALENDAR
    ------------------------------------------------------- */

    it(
      "should render correctly with no events",
      () => {

        render(
          <CalendarView
            events={[]}
            onEventClick={vi.fn()}
            onEventDrop={vi.fn()}
            onEventResize={vi.fn()}
          />
        );


        expect(
          screen.getByTestId(
            "full-calendar"
          )
        ).toBeInTheDocument();


        expect(
          screen.queryByTestId(
            "calendar-event-1"
          )
        ).not.toBeInTheDocument();

      }
    );


    /* -------------------------------------------------------
       TEST 9 — MULTIPLE EVENTS
    ------------------------------------------------------- */

    it(
      "should render multiple calendar events",
      () => {

        render(
          <CalendarView
            events={testEvents}
            onEventClick={vi.fn()}
            onEventDrop={vi.fn()}
            onEventResize={vi.fn()}
          />
        );


        const events =
          screen.getAllByTestId(
            /calendar-event-/
          );


        expect(
          events
        ).toHaveLength(2);

      }
    );


    /* -------------------------------------------------------
       TEST 10 — EVENT TIME
    ------------------------------------------------------- */

    it(
      "should display event time information",
      () => {

        render(
          <CalendarView
            events={testEvents}
            onEventClick={vi.fn()}
            onEventDrop={vi.fn()}
            onEventResize={vi.fn()}
          />
        );


        expect(
          screen.getAllByText(
            "10:00 AM"
          ).length
        ).toBeGreaterThan(0);

      }
    );

  }
);