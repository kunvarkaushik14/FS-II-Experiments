import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_URL =
  "http://localhost:5000/api/events";

const useEvents = () => {
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* -----------------------------
     LOAD EVENTS FROM BACKEND
  ----------------------------- */

  const fetchEvents =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            "Unable to fetch events"
          );
        }

        const result =
          await response.json();

        setEvents(
          result.data || []
        );
      } catch (err) {
        console.error(
          "Fetch events error:",
          err
        );

        setError(
          "Unable to connect to the EventFlow server."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /* -----------------------------
     ADD EVENT
  ----------------------------- */

  const addEvent = useCallback(
    async (eventData) => {
      try {
        const response =
          await fetch(API_URL, {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              eventData
            ),
          });

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to create event"
          );
        }

        setEvents(
          (currentEvents) => [
            ...currentEvents,
            result.data,
          ]
        );

        return result.data;
      } catch (err) {
        console.error(
          "Add event error:",
          err
        );

        setError(
          "Unable to create the event."
        );

        return null;
      }
    },
    []
  );

  /* -----------------------------
     UPDATE EVENT
  ----------------------------- */

  const updateEvent = useCallback(
    async (updatedEvent) => {
      try {
        const response =
          await fetch(
            `${API_URL}/${updatedEvent.id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                updatedEvent
              ),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to update event"
          );
        }

        setEvents(
          (currentEvents) =>
            currentEvents.map(
              (event) =>
                event.id ===
                updatedEvent.id
                  ? result.data
                  : event
            )
        );

        return result.data;
      } catch (err) {
        console.error(
          "Update event error:",
          err
        );

        setError(
          "Unable to update the event."
        );

        return null;
      }
    },
    []
  );

  /* -----------------------------
     DELETE EVENT
  ----------------------------- */

  const deleteEvent = useCallback(
    async (eventId) => {
      try {
        const response =
          await fetch(
            `${API_URL}/${eventId}`,
            {
              method: "DELETE",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to delete event"
          );
        }

        setEvents(
          (currentEvents) =>
            currentEvents.filter(
              (event) =>
                event.id !==
                eventId
            )
        );

        return true;
      } catch (err) {
        console.error(
          "Delete event error:",
          err
        );

        setError(
          "Unable to delete the event."
        );

        return false;
      }
    },
    []
  );

  /* -----------------------------
     EVENT COUNT
  ----------------------------- */

  const eventCount = useMemo(
    () => events.length,
    [events]
  );

  /* -----------------------------
     CATEGORY COUNT
  ----------------------------- */

  const categoryCount = useMemo(() => {
    return events.reduce(
      (result, event) => {
        result[event.category] =
          (result[event.category] ||
            0) + 1;

        return result;
      },
      {}
    );
  }, [events]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    eventCount,
    categoryCount,
  };
};

export default useEvents;