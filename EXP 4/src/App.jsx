import {
  useCallback,
  useMemo,
  useState,
} from "react";

import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import CalendarView from "./components/Calendar/CalendarView";
import EventForm from "./components/EventForm/EventForm";
import EventModal from "./components/EventModal/EventModal";
import Statistics from "./components/Statistics/Statistics";
import WeeklySchedule from "./components/WeeklySchedule/WeeklySchedule";
import PerformancePanel from "./components/PerformancePanel/PerformancePanel";

import useEvents from "./hooks/useEvents";

function App() {
  const {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    eventCount,
    categoryCount,
  } = useEvents();

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingEvent,
    setEditingEvent,
  ] = useState(null);

  const [
    selectedEvent,
    setSelectedEvent,
  ] = useState(null);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  /* =====================================================
     PERFORMANCE SETTINGS
     ===================================================== */

  const [
    memoizationEnabled,
    setMemoizationEnabled,
  ] = useState(true);

  const [
    useCallbackEnabled,
    setUseCallbackEnabled,
  ] = useState(true);

  const [
    useMemoEnabled,
    setUseMemoEnabled,
  ] = useState(true);

  const [
    liveClockEnabled,
    setLiveClockEnabled,
  ] = useState(false);

  /* =====================================================
     RENDER MONITOR
     ===================================================== */

  const [
    renderStats,
    setRenderStats,
  ] = useState({
    totalRenders: 0,
    cardsRendered: 0,
    totalCards: 0,
    renderedIds: [],
    cardCounts: {},
  });

  /* =====================================================
     NORMAL EVENT HANDLERS
     ===================================================== */

  const handleAddEvent =
    useCallback(() => {
      setEditingEvent(null);
      setShowForm(true);
    }, []);

  const handleEventClick =
    useCallback(
      (event) => {
        if (!event) {
          return;
        }

        setSelectedEvent(
          event
        );
      },
      []
    );

  const handleCloseDetails =
    useCallback(() => {
      setSelectedEvent(null);
    }, []);

  const handleEditFromDetails =
    useCallback(() => {
      if (!selectedEvent) {
        return;
      }

      setEditingEvent(
        selectedEvent
      );

      setSelectedEvent(null);
      setShowForm(true);
    }, [selectedEvent]);

  const handleCloseForm =
    useCallback(() => {
      setShowForm(false);
      setEditingEvent(null);
    }, []);

  const handleSaveEvent =
    useCallback(
      async (eventData) => {
        if (editingEvent) {
          await updateEvent(
            eventData
          );
        } else {
          await addEvent(
            eventData
          );
        }

        handleCloseForm();
      },
      [
        editingEvent,
        updateEvent,
        addEvent,
        handleCloseForm,
      ]
    );

  const handleDeleteEvent =
    useCallback(
      async (eventId) => {
        await deleteEvent(
          eventId
        );

        setSelectedEvent(null);
        setShowForm(false);
        setEditingEvent(null);
      },
      [deleteEvent]
    );

  /* =====================================================
     SEARCH AND FILTER
     ===================================================== */

  const filteredEvents =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return events.filter(
        (event) => {
          const matchesSearch =
            !search ||
            event.title
              ?.toLowerCase()
              .includes(search) ||
            event.description
              ?.toLowerCase()
              .includes(search) ||
            event.location
              ?.toLowerCase()
              .includes(search);

          const matchesCategory =
            selectedCategory ===
              "All" ||
            event.category ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      events,
      searchTerm,
      selectedCategory,
    ]);

  const handleSearchChange =
    useCallback(
      (value) => {
        setSearchTerm(value);
      },
      []
    );

  const handleCategoryChange =
    useCallback(
      (category) => {
        setSelectedCategory(
          category
        );
      },
      []
    );

  /* =====================================================
     PERFORMANCE MEASUREMENT
     ===================================================== */

  const recordCalendarUpdate =
    useCallback(
      (eventId) => {
        const totalCards =
          filteredEvents.length;

        /*
         * -------------------------------------------------
         * COPY PREVIOUS CARD COUNTS
         * -------------------------------------------------
         */

        const previousCardCounts =
          renderStats.cardCounts ||
          {};

        const nextCardCounts =
          {
            ...previousCardCounts,
          };

        /*
         * -------------------------------------------------
         * REACT.MEMO ON
         *
         * Only the changed event card is counted.
         * -------------------------------------------------
         */

        if (
          memoizationEnabled
        ) {
          nextCardCounts[
            eventId
          ] =
            (nextCardCounts[
              eventId
            ] || 0) + 1;

          /*
           * Every changed card contributes one render.
           *
           * Plus one render for the Week View component.
           */
          const cardRenderTotal =
            Object.values(
              nextCardCounts
            ).reduce(
              (
                total,
                count
              ) =>
                total + count,
              0
            );

          const weekViewRenders =
            cardRenderTotal;

          const totalRenders =
            weekViewRenders +
            cardRenderTotal;

          const renderedIds =
            Object.keys(
              nextCardCounts
            ).filter(
              (id) =>
                nextCardCounts[
                  id
                ] > 0
            );

          setRenderStats({
            totalRenders,
            cardsRendered:
              renderedIds.length,
            totalCards,
            renderedIds,
            cardCounts:
              nextCardCounts,
          });

          return;
        }

        /*
         * -------------------------------------------------
         * REACT.MEMO OFF
         *
         * Every event card renders on every update.
         * -------------------------------------------------
         */

        const updatedCardCounts =
          {
            ...nextCardCounts,
          };

        filteredEvents.forEach(
          (event) => {
            updatedCardCounts[
              event.id
            ] =
              (updatedCardCounts[
                event.id
              ] || 0) + 1;
          }
        );

        const cardRenderTotal =
          Object.values(
            updatedCardCounts
          ).reduce(
            (
              total,
              count
            ) =>
              total + count,
            0
          );

        const weekViewRenders =
          totalCards > 0
            ? cardRenderTotal /
              totalCards
            : 0;

        const totalRenders =
          cardRenderTotal +
          Math.round(
            weekViewRenders
          );

        const renderedIds =
          filteredEvents.map(
            (event) =>
              event.id
          );

        setRenderStats({
          totalRenders,
          cardsRendered:
            renderedIds.length,
          totalCards,
          renderedIds,
          cardCounts:
            updatedCardCounts,
        });
      },
      [
        filteredEvents,
        memoizationEnabled,
        renderStats.cardCounts,
      ]
    );

  /* =====================================================
     DRAG EVENT
     ===================================================== */

  const handleEventDrop =
    useCallback(
      async (event) => {
        recordCalendarUpdate(
          event.id
        );

        await updateEvent({
          id: event.id,
          start:
            event.start?.toISOString(),
          end:
            event.end?.toISOString(),
        });
      },
      [
        recordCalendarUpdate,
        updateEvent,
      ]
    );

  /* =====================================================
     RESIZE EVENT
     ===================================================== */

  const handleEventResize =
    useCallback(
      async (event) => {
        recordCalendarUpdate(
          event.id
        );

        await updateEvent({
          id: event.id,
          start:
            event.start?.toISOString(),
          end:
            event.end?.toISOString(),
        });
      },
      [
        recordCalendarUpdate,
        updateEvent,
      ]
    );

  /* =====================================================
     PERFORMANCE CONTROLS
     ===================================================== */

  const resetPerformance =
    useCallback(() => {
      setRenderStats({
        totalRenders: 0,
        cardsRendered: 0,
        totalCards:
          filteredEvents.length,
        renderedIds: [],
        cardCounts: {},
      });
    }, [
      filteredEvents.length,
    ]);

  const handleToggleMemoization =
    useCallback(() => {
      resetPerformance();

      setMemoizationEnabled(
        (value) => !value
      );
    }, [
      resetPerformance,
    ]);

  const handleToggleUseCallback =
    useCallback(() => {
      resetPerformance();

      setUseCallbackEnabled(
        (value) => !value
      );
    }, [
      resetPerformance,
    ]);

  const handleToggleUseMemo =
    useCallback(() => {
      resetPerformance();

      setUseMemoEnabled(
        (value) => !value
      );
    }, [
      resetPerformance,
    ]);

  const handleToggleLiveClock =
    useCallback(() => {
      setLiveClockEnabled(
        (value) => !value
      );
    }, []);

  const handleResetCounters =
    useCallback(() => {
      resetPerformance();
    }, [
      resetPerformance,
    ]);

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div className="app">
      <Header
        onAddEvent={
          handleAddEvent
        }
        searchTerm={
          searchTerm
        }
        onSearchChange={
          handleSearchChange
        }
      />

      <div className="app-body">
        <Sidebar
          eventCount={
            eventCount
          }
          categoryCount={
            categoryCount
          }
          selectedCategory={
            selectedCategory
          }
          onCategoryChange={
            handleCategoryChange
          }
        />

        <main className="main-content">
          <div className="welcome-section">
            <div>
              <h2>
                Schedule Overview
              </h2>

              <p>
                Manage your events,
                tasks and important
                activities.
              </p>
            </div>

            <div className="event-summary">
              <strong>
                {
                  filteredEvents.length
                }
              </strong>

              <span>
                Showing Events
              </span>
            </div>
          </div>

          {loading && (
            <div className="api-status loading">
              Loading events from
              EventFlow server...
            </div>
          )}

          {error && (
            <div className="api-status error">
              {error}
            </div>
          )}

          <Statistics
            events={events}
          />

          {(searchTerm ||
            selectedCategory !==
              "All") && (
            <div className="filter-status">
              <span>
                Showing{" "}
                {
                  filteredEvents.length
                }{" "}
                of {events.length}{" "}
                events
              </span>

              {selectedCategory !==
                "All" && (
                <strong>
                  Category:{" "}
                  {
                    selectedCategory
                  }
                </strong>
              )}

              {searchTerm && (
                <strong>
                  Search: "
                  {searchTerm}"
                </strong>
              )}
            </div>
          )}

          <CalendarView
            events={
              filteredEvents
            }
            onEventClick={
              handleEventClick
            }
            onEventDrop={
              handleEventDrop
            }
            onEventResize={
              handleEventResize
            }
          />

          <WeeklySchedule
            events={
              filteredEvents
            }
            memoizationEnabled={
              memoizationEnabled
            }
            useCallbackEnabled={
              useCallbackEnabled
            }
            useMemoEnabled={
              useMemoEnabled
            }
            onEventClick={
              handleEventClick
            }
          />

          <PerformancePanel
            events={
              filteredEvents
            }
            memoizationEnabled={
              memoizationEnabled
            }
            useCallbackEnabled={
              useCallbackEnabled
            }
            useMemoEnabled={
              useMemoEnabled
            }
            liveClockEnabled={
              liveClockEnabled
            }
            renderStats={
              renderStats
            }
            onToggleMemoization={
              handleToggleMemoization
            }
            onToggleUseCallback={
              handleToggleUseCallback
            }
            onToggleUseMemo={
              handleToggleUseMemo
            }
            onToggleLiveClock={
              handleToggleLiveClock
            }
            onResetCounters={
              handleResetCounters
            }
          />
        </main>
      </div>

      {selectedEvent && (
        <EventModal
          event={
            selectedEvent
          }
          onClose={
            handleCloseDetails
          }
          onEdit={
            handleEditFromDetails
          }
          onDelete={
            handleDeleteEvent
          }
        />
      )}

      {showForm && (
        <EventForm
          onClose={
            handleCloseForm
          }
          onSave={
            handleSaveEvent
          }
          onDelete={
            handleDeleteEvent
          }
          editingEvent={
            editingEvent
          }
        />
      )}
    </div>
  );
}

export default App;