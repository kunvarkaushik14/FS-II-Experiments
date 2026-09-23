import { memo } from "react";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

const Sidebar = memo(function Sidebar({
  eventCount,
  categoryCount,
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="nav-item active">
          <LayoutDashboard size={19} />
          Dashboard
        </div>

        <div className="nav-item">
          <CalendarDays size={19} />
          Calendar
        </div>

        <div className="nav-item">
          <ClipboardList size={19} />
          Events

          <span className="nav-count">
            {eventCount}
          </span>
        </div>
      </nav>

      <div className="sidebar-section">
        <h3>Categories</h3>

        <button
          type="button"
          className={`category-item ${
            selectedCategory === "All"
              ? "selected"
              : ""
          }`}
          onClick={() => onCategoryChange("All")}
        >
          <span className="category-dot"></span>

          <span>All Events</span>

          <span className="category-count">
            {eventCount}
          </span>
        </button>

        {Object.entries(categoryCount).map(
          ([category, count]) => (
            <button
              type="button"
              className={`category-item ${
                selectedCategory === category
                  ? "selected"
                  : ""
              }`}
              key={category}
              onClick={() =>
                onCategoryChange(category)
              }
            >
              <span className="category-dot"></span>

              <span>{category}</span>

              <span className="category-count">
                {count}
              </span>
            </button>
          )
        )}
      </div>

      <div className="sidebar-footer">
        <CheckCircle2 size={18} />

        <div>
          <strong>Stay organized</strong>

          <span>
            Manage your schedule
          </span>
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;