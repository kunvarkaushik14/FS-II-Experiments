import { useEffect, useRef, useState } from "react";

function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const panelRef = useRef(null);

  // Load notifications when component starts
  useEffect(() => {
    const saved = localStorage.getItem("pulseapi_notifications");

    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch {
        createInitialNotifications();
      }
    } else {
      createInitialNotifications();
    }
  }, []);

  // Save notifications whenever they change
  useEffect(() => {
    localStorage.setItem(
      "pulseapi_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const createInitialNotifications = () => {
    const initial = [
      {
        id: Date.now() + 1,
        type: "success",
        icon: "✓",
        title: "API Connected",
        message: "PulseAPI backend is connected successfully.",
        time: "Just now",
        read: false,
      },
      {
        id: Date.now() + 2,
        type: "ai",
        icon: "✦",
        title: "AI Assistant Ready",
        message: "Ollama + RAG knowledge assistant is available.",
        time: "Just now",
        read: false,
      },
      {
        id: Date.now() + 3,
        type: "info",
        icon: "◈",
        title: "Welcome to PulseAPI",
        message: "Your content command center is ready.",
        time: "Just now",
        read: true,
      },
    ];

    setNotifications(initial);
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addTestNotification = () => {
    const newNotification = {
      id: Date.now(),
      type: "success",
      icon: "✓",
      title: "Post Created",
      message: "Your social media post was created successfully.",
      time: "Just now",
      read: false,
    };

    setNotifications((current) => [
      newNotification,
      ...current,
    ]);

    setOpen(true);
  };

  return (
    <div className="notification-center" ref={panelRef}>
      {/* Bell */}
      <button
        className="notification-button"
        onClick={() => setOpen((value) => !value)}
        title="Notifications"
        type="button"
      >
        <span className="notification-bell">🔔</span>

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <div>
              <span className="notification-label">
                NOTIFICATIONS
              </span>

              <h3>Notification Center</h3>
            </div>

            <button
              type="button"
              className="notification-close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="notification-toolbar">
            <span>
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "All caught up"}
            </span>

            <div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  🔔
                </div>

                <strong>No notifications</strong>

                <p>
                  You're all caught up. New activity will
                  appear here.
                </p>

                <button
                  type="button"
                  className="notification-test-button"
                  onClick={addTestNotification}
                >
                  Create Test Notification
                </button>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={`notification-item ${
                    notification.read
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                  onClick={() =>
                    markAsRead(notification.id)
                  }
                >
                  <div
                    className={`notification-icon ${notification.type}`}
                  >
                    {notification.icon}
                  </div>

                  <div className="notification-content">
                    <div className="notification-title-row">
                      <strong>
                        {notification.title}
                      </strong>

                      {!notification.read && (
                        <span className="unread-dot" />
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <small>{notification.time}</small>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Demo/Test action */}
          {notifications.length > 0 && (
            <div className="notification-footer">
              <button
                type="button"
                onClick={addTestNotification}
              >
                + Test Notification
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;