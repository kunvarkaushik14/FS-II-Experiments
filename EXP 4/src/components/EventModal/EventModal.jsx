import { memo } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const EventModal = memo(function EventModal({
  event,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!event) {
    return null;
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(new Date(date));
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    ).format(new Date(date));
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${event.title}"?`
    );

    if (confirmed) {
      onDelete(event.id);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="event-details-modal">
        <div className="details-header">
          <div>
            <span className="details-category">
              {event.extendedProps?.category ||
                event.category}
            </span>

            <h2>{event.title}</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close event details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="details-body">
          <div className="detail-row">
            <CalendarDays size={18} />

            <div>
              <span>Date</span>

              <strong>
                {formatDate(event.start)}
              </strong>
            </div>
          </div>

          <div className="detail-row">
            <Clock3 size={18} />

            <div>
              <span>Time</span>

              <strong>
                {formatTime(event.start)}
                {" - "}
                {formatTime(event.end)}
              </strong>
            </div>
          </div>

          {(event.extendedProps?.location ||
            event.location) && (
            <div className="detail-row">
              <MapPin size={18} />

              <div>
                <span>Location</span>

                <strong>
                  {event.extendedProps?.location ||
                    event.location}
                </strong>
              </div>
            </div>
          )}

          {(event.extendedProps?.description ||
            event.description) && (
            <div className="description-box">
              <span>Description</span>

              <p>
                {event.extendedProps
                  ?.description ||
                  event.description}
              </p>
            </div>
          )}
        </div>

        <div className="details-actions">
          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
          >
            <Trash2 size={17} />
            Delete
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="save-button"
            onClick={onEdit}
          >
            <Pencil size={17} />
            Edit Event
          </button>
        </div>
      </div>
    </div>
  );
});

export default EventModal;