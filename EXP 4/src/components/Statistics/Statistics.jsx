import { memo, useMemo } from "react";
import {
  CalendarDays,
  Clock3,
  Layers3,
  ListChecks,
} from "lucide-react";

const Statistics = memo(function Statistics({
  events,
}) {
  const statistics = useMemo(() => {
    const today = new Date();

    const upcomingEvents = events.filter(
      (event) => new Date(event.start) >= today
    );

    const categories = new Set(
      events.map((event) => event.category)
    );

    const totalDuration = events.reduce(
      (total, event) => {
        const start = new Date(event.start);
        const end = new Date(event.end);

        return (
          total +
          Math.max(
            0,
            (end - start) / (1000 * 60)
          )
        );
      },
      0
    );

    return {
      total: events.length,
      upcoming: upcomingEvents.length,
      categories: categories.size,
      duration: Math.round(totalDuration),
    };
  }, [events]);

  return (
    <div className="statistics-grid">
      <div className="stat-card">
        <div className="stat-icon purple">
          <CalendarDays size={20} />
        </div>

        <div className="stat-content">
          <span>Total Events</span>
          <strong>{statistics.total}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon blue">
          <Clock3 size={20} />
        </div>

        <div className="stat-content">
          <span>Upcoming</span>
          <strong>{statistics.upcoming}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon green">
          <Layers3 size={20} />
        </div>

        <div className="stat-content">
          <span>Categories</span>
          <strong>{statistics.categories}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon orange">
          <ListChecks size={20} />
        </div>

        <div className="stat-content">
          <span>Scheduled Minutes</span>
          <strong>{statistics.duration}</strong>
        </div>
      </div>
    </div>
  );
});

export default Statistics;