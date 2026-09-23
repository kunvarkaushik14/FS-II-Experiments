import { useEffect, useState } from "react";
import api from "../services/api";

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data?.data || []);
    } catch (error) {
      console.error("Notification loading failed:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="notification-wrapper">
      <button
        className="notification-button"
        onClick={() => setOpen(!open)}
        title="Notifications"
      >
        ??
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <div>
              <span className="eyebrow">ACTIVITY</span>
              <h3>Notifications</h3>
            </div>

            <button
              className="notification-refresh"
              onClick={loadNotifications}
            >
              ?
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="notification-empty-icon">?</div>
              <strong>You're all caught up</strong>
              <p>No new notifications.</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.read ? "" : "unread"
                  }`}
                >
                  <div className="notification-icon">?</div>

                  <div>
                    <strong>
                      {notification.title || "Notification"}
                    </strong>

                    <p>
                      {notification.message || "You have a new notification."}
                    </p>

                    {notification.createdAt && (
                      <small>{notification.createdAt}</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
