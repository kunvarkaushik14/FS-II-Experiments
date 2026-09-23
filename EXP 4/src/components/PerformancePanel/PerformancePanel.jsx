import React, {
  memo,
  useEffect,
  useState,
} from "react";

const PerformancePanel =
  memo(function PerformancePanel({
    events = [],
    memoizationEnabled,
    useCallbackEnabled,
    useMemoEnabled,
    liveClockEnabled = false,
    renderStats,
    onToggleMemoization,
    onToggleUseCallback,
    onToggleUseMemo,
    onToggleLiveClock,
    onResetCounters,
  }) {
    const [
      currentTime,
      setCurrentTime,
    ] = useState(
      new Date()
    );

    useEffect(() => {
      if (!liveClockEnabled) {
        return undefined;
      }

      const timer =
        window.setInterval(() => {
          setCurrentTime(
            new Date()
          );
        }, 1000);

      return () =>
        window.clearInterval(
          timer
        );
    }, [liveClockEnabled]);

    const totalCards =
      events.length;

    const totalRenders =
      renderStats?.totalRenders ||
      0;

    const cardsRendered =
      renderStats?.cardsRendered ||
      0;

    const renderedIds =
      renderStats?.renderedIds ||
      [];

    const cardCounts =
      renderStats?.cardCounts ||
      {};

    const renderPercentage =
      totalCards > 0
        ? Math.min(
            100,
            (cardsRendered /
              totalCards) *
              100
          )
        : 0;

    const maxCardRender =
      Math.max(
        1,
        ...Object.values(
          cardCounts
        )
      );

    const clockText =
      currentTime.toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      );

    const OptimizationToggle =
      ({
        label,
        description,
        enabled,
        onChange,
        accent,
      }) => {
        return (
          <button
            type="button"
            className={`optimization-toggle ${
              enabled
                ? "is-enabled"
                : ""
            }`}
            onClick={
              onChange
            }
          >
            <span
              className="toggle-switch"
              style={{
                "--toggle-accent":
                  accent,
              }}
            >
              <span className="toggle-knob" />
            </span>

            <span className="toggle-content">
              <strong>
                {label}
              </strong>

              <small>
                {description}
              </small>
            </span>
          </button>
        );
      };

    return (
      <section className="performance-section">
        <div className="performance-intro">
          <div>
            <span className="performance-eyebrow">
              PERFORMANCE EXPERIMENT
            </span>

            <h2>
              Interactive Calendar
            </h2>

            <p>
              Toggle React optimizations and
              observe exactly which event cards
              re-render when the schedule changes.
            </p>
          </div>

          <div className="performance-status">
            <span className="status-dot" />

            <span>
              {liveClockEnabled
                ? clockText
                : "Monitoring"}
            </span>
          </div>
        </div>

        <div className="performance-controls">
          <OptimizationToggle
            label="React.memo on cards"
            description="Prevents unchanged event cards from re-rendering."
            enabled={
              memoizationEnabled
            }
            onChange={
              onToggleMemoization
            }
            accent="#8b5cf6"
          />

          <OptimizationToggle
            label="useCallback for handlers"
            description="Keeps event handlers stable between renders."
            enabled={
              useCallbackEnabled
            }
            onChange={
              onToggleUseCallback
            }
            accent="#3b82f6"
          />

          <OptimizationToggle
            label="useMemo for agenda filter"
            description="Avoids recalculating unchanged week data."
            enabled={
              useMemoEnabled
            }
            onChange={
              onToggleUseMemo
            }
            accent="#22c55e"
          />

          <OptimizationToggle
            label="Live clock"
            description="Adds a one-second state update to the experiment."
            enabled={
              liveClockEnabled
            }
            onChange={
              onToggleLiveClock
            }
            accent="#f97316"
          />

          <button
            type="button"
            className="reset-counters-button"
            onClick={
              onResetCounters
            }
          >
            ↻ Reset counters
          </button>
        </div>

        <div className="performance-monitor">
          <div className="monitor-header">
            <div>
              <span className="performance-eyebrow">
                RENDER MONITOR
              </span>

              <h3>
                Render Monitor
              </h3>

              <p>
                Render counts accumulate until the
                counters are reset.
              </p>
            </div>

            <div className="monitor-summary">
              <div className="monitor-number">
                {totalRenders}
              </div>

              <span>
                total renders logged
              </span>
            </div>

            <div className="monitor-summary">
              <div className="monitor-number">
                {cardsRendered}/
                {totalCards}
              </div>

              <span>
                cards affected
              </span>
            </div>
          </div>

          <div className="render-progress">
            <div className="render-progress-label">
              <span>
                Affected cards
              </span>

              <strong>
                {Math.round(
                  renderPercentage
                )}
                %
              </strong>
            </div>

            <div className="render-progress-track">
              <div
                className="render-progress-fill"
                style={{
                  width: `${renderPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="render-list">
            {events.length ===
            0 ? (
              <div className="render-empty">
                No events available.
              </div>
            ) : (
              events.map(
                (event) => {
                  const count =
                    cardCounts[
                      event.id
                    ] || 0;

                  const rendered =
                    renderedIds.includes(
                      event.id
                    );

                  const eventColor =
                    event.category ===
                    "Exam"
                      ? "#ef4444"
                      : event.category ===
                          "Lecture"
                        ? "#3b82f6"
                        : event.category ===
                            "Project"
                          ? "#22c55e"
                          : "#8b5cf6";

                  const barWidth =
                    count > 0
                      ? Math.max(
                          8,
                          (count /
                            maxCardRender) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      className={`render-row ${
                        rendered
                          ? "rendered"
                          : ""
                      }`}
                      key={
                        event.id
                      }
                    >
                      <div className="render-row-name">
                        <span
                          className="render-status-dot"
                          style={{
                            background:
                              rendered
                                ? eventColor
                                : "transparent",
                            borderColor:
                              eventColor,
                          }}
                        />

                        <span>
                          {event.title}
                        </span>
                      </div>

                      <div className="render-bar-track">
                        <div
                          className="render-bar"
                          style={{
                            width: `${barWidth}%`,
                            background:
                              eventColor,
                          }}
                        />
                      </div>

                      <span className="render-count">
                        {count}
                      </span>
                    </div>
                  );
                }
              )
            )}
          </div>

          <div className="monitor-explanation">
            <span>
              {memoizationEnabled
                ? "✓ React.memo: only changed cards render"
                : "✕ React.memo: all cards render"}
            </span>

            <span>
              Move or resize an event to test it.
            </span>
          </div>
        </div>
      </section>
    );
  });

export default PerformancePanel;