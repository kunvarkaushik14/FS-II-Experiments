import { memo } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  X,
} from "lucide-react";

const Header = memo(function Header({
  onAddEvent,
  searchTerm,
  onSearchChange,
}) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <CalendarDays size={24} />
        </div>

        <div>
          <h1>EventFlow</h1>

          <p>
            Interactive Event & Task Calendar
          </p>
        </div>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
          />

          {searchTerm && (
            <button
              type="button"
              className="clear-search"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          className="add-event-button"
          onClick={onAddEvent}
        >
          <Plus size={18} />
          Add Event
        </button>
      </div>
    </header>
  );
});

export default Header;