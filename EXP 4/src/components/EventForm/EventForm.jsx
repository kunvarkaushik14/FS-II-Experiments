import { memo, useState } from "react";
import { X, Save, Trash2 } from "lucide-react";

const categories = [
  "Assignment",
  "Lecture",
  "Exam",
  "Project",
  "Meeting",
  "Deadline",
  "Lab",
  "Presentation",
  "Personal",
];

const EventForm = memo(function EventForm({
  onClose,
  onSave,
  onDelete,
  editingEvent = null,
}) {
  const [title, setTitle] = useState(
    editingEvent?.title || ""
  );

  const [date, setDate] = useState(
    editingEvent?.start
      ? new Date(editingEvent.start)
          .toISOString()
          .slice(0, 10)
      : ""
  );

  const [startTime, setStartTime] = useState(
    editingEvent?.start
      ? new Date(editingEvent.start)
          .toISOString()
          .slice(11, 16)
      : "09:00"
  );

  const [endTime, setEndTime] = useState(
    editingEvent?.end
      ? new Date(editingEvent.end)
          .toISOString()
          .slice(11, 16)
      : "10:00"
  );

  const [category, setCategory] = useState(
    editingEvent?.extendedProps?.category ||
      editingEvent?.category ||
      "Assignment"
  );

  const [description, setDescription] = useState(
    editingEvent?.extendedProps?.description ||
      editingEvent?.description ||
      ""
  );

  const [location, setLocation] = useState(
    editingEvent?.extendedProps?.location ||
      editingEvent?.location ||
      ""
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter an event title.");
      return;
    }

    if (!date) {
      alert("Please select a date.");
      return;
    }

    if (endTime <= startTime) {
      alert("End time must be after start time.");
      return;
    }

    const eventData = {
      id: editingEvent?.id,
      title: title.trim(),
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
      category,
      description,
      location,
    };

    onSave(eventData);
  };

  const handleDelete = () => {
    if (!editingEvent) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${editingEvent.title}"?`
    );

    if (confirmed) {
      onDelete(editingEvent.id);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="event-modal">
        <div className="modal-header">
          <div>
            <h2>
              {editingEvent
                ? "Edit Event"
                : "Create New Event"}
            </h2>

            <p>
              {editingEvent
                ? "Update the event details."
                : "Add an event to your calendar."}
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          className="event-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="title">
              Event Title
            </label>

            <input
              id="title"
              type="text"
              placeholder="Enter event title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
                Date
              </label>

              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">
                Start Time
              </label>

              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">
                End Time
              </label>

              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">
              Location
            </label>

            <input
              id="location"
              type="text"
              placeholder="e.g. Computer Lab"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              rows="3"
              placeholder="Enter event description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </div>

          <div className="form-actions">
            {editingEvent && (
              <button
                type="button"
                className="delete-button"
                onClick={handleDelete}
              >
                <Trash2 size={17} />
                Delete
              </button>
            )}

            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
            >
              <Save size={17} />

              {editingEvent
                ? "Update Event"
                : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default EventForm;