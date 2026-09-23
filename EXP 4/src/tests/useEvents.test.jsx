import {
  renderHook,
  act,
  waitFor,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
  beforeEach,
  vi,
} from "vitest";

import useEvents from "../hooks/useEvents";


/* =========================================================
   TEST DATA
   ========================================================= */

const initialEvents = [
  {
    id: "1",
    title: "Database Assignment",
    start: "2026-09-03T10:00:00",
    end: "2026-09-03T12:00:00",
    category: "Assignment",
    location: "Home",
    description:
      "Complete and submit the database assignment.",
  },

  {
    id: "2",
    title: "React Development Lecture",
    start: "2026-09-04T09:00:00",
    end: "2026-09-04T11:00:00",
    category: "Lecture",
    location: "Room 204",
    description:
      "Learn React development concepts.",
  },

  {
    id: "3",
    title: "Predictive Analytics Exam",
    start: "2026-09-05T11:00:00",
    end: "2026-09-05T13:00:00",
    category: "Exam",
    location: "Exam Hall",
    description:
      "Predictive analytics examination.",
  },
];


/* =========================================================
   MOCK FETCH RESPONSE
   ========================================================= */

const createResponse = (
  data,
  ok = true
) => {
  return {
    ok,

    json: vi.fn().mockResolvedValue({
      success: ok,
      data,
    }),
  };
};


/* =========================================================
   SETUP
   ========================================================= */

beforeEach(() => {
  vi.clearAllMocks();

  global.fetch = vi.fn();
});


/* =========================================================
   TESTS
   ========================================================= */

describe("useEvents Hook", () => {

  /* -------------------------------------------------------
     1. INITIAL LOADING
  ------------------------------------------------------- */

  it("should load events from the API", async () => {
    global.fetch.mockResolvedValueOnce(
      createResponse(initialEvents)
    );

    const { result } =
      renderHook(() => useEvents());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(
        result.current.loading
      ).toBe(false);
    });

    expect(
      result.current.events
    ).toHaveLength(3);

    expect(
      result.current.events[0].title
    ).toBe(
      "Database Assignment"
    );
  });


  /* -------------------------------------------------------
     2. EVENT STRUCTURE
  ------------------------------------------------------- */

  it("should load events with required properties", async () => {
    global.fetch.mockResolvedValueOnce(
      createResponse(initialEvents)
    );

    const { result } =
      renderHook(() => useEvents());

    await waitFor(() => {
      expect(
        result.current.events.length
      ).toBeGreaterThan(0);
    });

    const firstEvent =
      result.current.events[0];

    expect(firstEvent).toHaveProperty(
      "id"
    );

    expect(firstEvent).toHaveProperty(
      "title"
    );

    expect(firstEvent).toHaveProperty(
      "start"
    );

    expect(firstEvent).toHaveProperty(
      "end"
    );

    expect(firstEvent).toHaveProperty(
      "category"
    );
  });


  /* -------------------------------------------------------
     3. EVENT COUNT
  ------------------------------------------------------- */

  it("should calculate event count using useMemo", async () => {
    global.fetch.mockResolvedValueOnce(
      createResponse(initialEvents)
    );

    const { result } =
      renderHook(() => useEvents());

    await waitFor(() => {
      expect(
        result.current.events.length
      ).toBe(3);
    });

    expect(
      result.current.eventCount
    ).toBe(3);
  });


  /* -------------------------------------------------------
     4. CATEGORY COUNT
  ------------------------------------------------------- */

  it("should calculate category counts", async () => {
    global.fetch.mockResolvedValueOnce(
      createResponse(initialEvents)
    );

    const { result } =
      renderHook(() => useEvents());

    await waitFor(() => {
      expect(
        result.current.events.length
      ).toBe(3);
    });

    expect(
      result.current.categoryCount.Assignment
    ).toBe(1);

    expect(
      result.current.categoryCount.Lecture
    ).toBe(1);

    expect(
      result.current.categoryCount.Exam
    ).toBe(1);
  });


  /* -------------------------------------------------------
     5. ADD EVENT
  ------------------------------------------------------- */

  it("should add a new event", async () => {
    global.fetch
      .mockResolvedValueOnce(
        createResponse(initialEvents)
      )
      .mockResolvedValueOnce(
        createResponse({
          id: "4",
          title: "New Project Meeting",
          start:
            "2026-09-10T14:00:00",
          end:
            "2026-09-10T15:00:00",
          category: "Meeting",
          location: "Room 101",
          description:
            "Discuss project progress.",
        })
      );

    const { result } =
      renderHook(() => useEvents());

    await waitFor(() => {
      expect(
        result.current.events.length
      ).toBe(3);
    });

    const newEvent = {
      id: "4",
      title: "New Project Meeting",
      start:
        "2026-09-10T14:00:00",
      end:
        "2026-09-10T15:00:00",
      category: "Meeting",
      location: "Room 101",
      description:
        "Discuss project progress.",
    };

    await act(async () => {
      await result.current.addEvent(
        newEvent
      );
    });

    expect(
      result.current.events
    ).toHaveLength(4);

    expect(
      result.current.events.some(
        (event) =>
          event.id === "4"
      )
    ).toBe(true);

    expect(
      result.current.events.find(
        (event) =>
          event.id === "4"
      ).title
    ).toBe(
      "New Project Meeting"
    );
  });


  /* -------------------------------------------------------
     6. UPDATE EVENT
  ------------------------------------------------------- */

  it("should update an existing event", async () => {
    global.fetch
      .mockResolvedValueOnce(
        createResponse(initialEvents)
      )
      .mockResolvedValueOnce(
        createResponse({
          ...initialEvents[0],
          title:
            "Updated Database Assignment",
        })
      );

    const { result } =
      renderHook(() => useEvents());

    await waitFor(() => {
      expect(
        result.current.events.length
      ).toBe(3);
    });

    const updatedEvent = {
      ...initialEvents[0],

      title:
        "Updated Database Assignment",
    };

    await act(async () => {
      await result.current.updateEvent(
        updatedEvent
      );
    });

    const event =
      result.current.events.find(
        (item) =>
          item.id === "1"
      );

    expect(event).toBeDefined();

    expect(event.title).toBe(
      "Updated Database Assignment"
    );
  });


  /* -------------------------------------------------------
     7. DELETE EVENT
  ------------------------------------------------------- */

  it("should delete an existing event", async () => {
    global.fetch
      .mockResolvedValueOnce(
        createResponse(initialEvents)
      )
      .mockResolvedValueOnce(
        createResponse({
          id: "1",
        })
      );

    const { result } =
      renderHook(() => useEvents());

    await waitFor(() => {
      expect(
        result.current.events.length
      ).toBe(3);
    });

    expect(
      result.current.events.some(
        (event) =>
          event.id === "1"
      )
    ).toBe(true);

    await act(async () => {
      await result.current.deleteEvent(
        "1"
      );
    });

    expect(
      result.current.events
    ).toHaveLength(2);

    expect(
      result.current.events.some(
        (event) =>
          event.id === "1"
      )
    ).toBe(false);
  });


  /* -------------------------------------------------------
     8. API REQUEST FOR ADD
  ------------------------------------------------------- */

  it("should send POST request when adding an event", async () => {
    global.fetch
      .mockResolvedValueOnce(
        createResponse(initialEvents)
      )
      .mockResolvedValueOnce(
        createResponse({
          id: "5",
          title: "Test Event",
          start:
            "2026-09-20T10:00:00",
          end:
            "2026-09-20T11:00:00",
          category: "Personal",
        })
      );

    const { result } =
      renderHook(() => useEvents());

    await waitFor(() => {
      expect(
        result.current.loading
      ).toBe(false);
    });

    const newEvent = {
      id: "5",
      title: "Test Event",
      start:
        "2026-09-20T10:00:00",
      end:
        "2026-09-20T11:00:00",
      category: "Personal",
    };

    await act(async () => {
      await result.current.addEvent(
        newEvent
      );
    });

    expect(
      global.fetch
    ).toHaveBeenCalledWith(
      "http://localhost:5000/api/events",
      expect.objectContaining({
        method: "POST",
      })
    );
  });


  /* -------------------------------------------------------
     9. API REQUEST FOR UPDATE
  ------------------------------------------------------- */

  it("should send PUT request when updating an event", async () => {
    global.fetch
      .mockResolvedValueOnce(
        createResponse(initialEvents)
      )
      .mockResolvedValueOnce(
        createResponse({
          ...initialEvents[0],
          title: "Updated Event",
        })
      );

    const { result } =
      renderHook(() => useEvents());

    await waitFor(() => {
      expect(
        result.current.loading
      ).toBe(false);
    });

    const updatedEvent = {
      ...initialEvents[0],

      title: "Updated Event",
    };

    await act(async () => {
      await result.current.updateEvent(
        updatedEvent
      );
    });

    expect(
      global.fetch
    ).toHaveBeenCalledWith(
      "http://localhost:5000/api/events/1",
      expect.objectContaining({
        method: "PUT",
      })
    );
  });


  /* -------------------------------------------------------
     10. API REQUEST FOR DELETE
  ------------------------------------------------------- */

  it("should send DELETE request when deleting an event", async () => {
    global.fetch
      .mockResolvedValueOnce(
        createResponse(initialEvents)
      )
      .mockResolvedValueOnce(
        createResponse({
          id: "1",
        })
      );

    const { result } =
      renderHook(() => useEvents());

    await waitFor(() => {
      expect(
        result.current.loading
      ).toBe(false);
    });

    await act(async () => {
      await result.current.deleteEvent(
        "1"
      );
    });

    expect(
      global.fetch
    ).toHaveBeenCalledWith(
      "http://localhost:5000/api/events/1",
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });

});